import { useCallback, useEffect, useMemo, useState } from 'react';

const STORAGE_KEY = 'synapto-license-v1';

/**
 * Base64 wrapper to avoid storing plain JSON.
 * This is not "crypto", but it satisfies the requirement to avoid explicit JSON storage.
 */
function encodeState(obj) {
  try {
    const json = JSON.stringify(obj);
    return btoa(unescape(encodeURIComponent(json)));
  } catch {
    return null;
  }
}

function decodeState(b64) {
  try {
    const json = decodeURIComponent(escape(atob(b64)));
    return JSON.parse(json);
  } catch {
    return null;
  }
}

function isValidISODate(d) {
  if (!d || typeof d !== 'string') return false;
  const t = Date.parse(d);
  return Number.isFinite(t);
}

function nowMs() {
  return Date.now();
}

export default function useLicense(API) {

  const [license, setLicense] = useState({
    activated: false,
    expiryDate: null, // ISO string
    codeHash: null,
    token: null, // activation token returned by backend
  });

  const [freeUsed, setFreeUsed] = useState(false);

  const [loadingActivate, setLoadingActivate] = useState(false);
  const [activationError, setActivationError] = useState('');

  // Load from localStorage (base64)
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;

      const decoded = decodeState(raw);
      if (!decoded) return;

      const expiryDate = decoded.expiryDate;
      if (!isValidISODate(expiryDate)) {
        setLicense({ activated: false, expiryDate: null, codeHash: null, token: null });
        setFreeUsed(Boolean(decoded.freeUsed));
        return;
      }

      const expired = Date.parse(expiryDate) < nowMs();
      if (expired) {
        setLicense({ activated: false, expiryDate: null, codeHash: null, token: null });
        setFreeUsed(false);
        localStorage.removeItem(STORAGE_KEY);
        return;
      }

      setLicense({
        activated: true,
        expiryDate,
        codeHash: decoded.codeHash || null,
        token: decoded.token || null,
      });

      setFreeUsed(Boolean(decoded.freeUsed));
    } catch {
      // ignore
    }
  }, []);

  const persist = useCallback((next) => {
    const encoded = encodeState(next);
    if (!encoded) return;
    localStorage.setItem(STORAGE_KEY, encoded);
  }, []);

  const persistFreeUsed = useCallback((nextFreeUsed) => {
    const payload = {
      activated: license.activated,
      expiryDate: license.expiryDate,
      codeHash: license.codeHash,
      token: license.token,
      freeUsed: Boolean(nextFreeUsed),
    };
    persist(payload);
  }, [license, persist]);

  const clearPersisted = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {}
  }, []);

  const daysRemaining = useMemo(() => {
    if (!license.activated || !license.expiryDate) return 0;
    const ms = Date.parse(license.expiryDate) - nowMs();
    if (!Number.isFinite(ms) || ms <= 0) return 0;
    return Math.ceil(ms / (1000 * 60 * 60 * 24));
  }, [license]);

  const isExpired = useMemo(() => {
    if (!license.activated || !license.expiryDate) return true;
    return Date.parse(license.expiryDate) < nowMs();
  }, [license]);

  // Ensure expiry flips state even if tab stays open
  useEffect(() => {
    const id = setInterval(() => {
      if (!license.activated) return;
      if (Date.parse(license.expiryDate) < nowMs()) {
        setLicense({ activated: false, expiryDate: null, codeHash: null, token: null });
        clearPersisted();
      }
    }, 60 * 1000);
    return () => clearInterval(id);
  }, [license.activated, license.expiryDate, clearPersisted]);

  const getAuthHeaders = useCallback(() => {
    if (!license.activated || !license.token) return {};
    return { 'X-Activation-Token': license.token };
  }, [license.activated, license.token]);

  const activate = useCallback(async (code) => {
    setLoadingActivate(true);
    setActivationError('');
    try {
      const res = await fetch(`${API}/api/activate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok || data?.success !== true) {
        throw new Error(data?.error || 'Invalid activation code');
      }

      const expiresAt = data.expiresAt;
      const token = data.token || null;

      if (!isValidISODate(expiresAt) || !token) {
        throw new Error('Activation failed');
      }

      const next = {
        activated: true,
        expiryDate: expiresAt,
        codeHash: data.codeHash || null,
        token,
        freeUsed: true, // once activated, treat free attempt as already used
      };

      setLicense(next);
      persist(next);

      return { success: true, expiresAt };
    } catch (e) {
      setLicense({ activated: false, expiryDate: null, codeHash: null, token: null });
      clearPersisted();
      setActivationError(e?.message || 'Invalid activation code');
      return { success: false, error: e?.message || 'Invalid activation code' };
    } finally {
      setLoadingActivate(false);
    }
  }, [API, persist, clearPersisted]);

  const licenseStatus = useMemo(() => {
    if (license.activated && !isExpired) return 'active';
    if (license.activated && isExpired) return 'expired';
    return 'inactive';
  }, [license.activated, isExpired]);

  return {
    license,
    freeUsed,
    setFreeUsed: (v) => {
      const next = Boolean(v);
      setFreeUsed(next);
      persistFreeUsed(next);
    },
    daysRemaining,
    isExpired,
    licenseStatus,
    activate,
    loadingActivate,
    activationError,
    setActivationError,
    getAuthHeaders,
    clearPersisted,
    setLicense,
  };
}
