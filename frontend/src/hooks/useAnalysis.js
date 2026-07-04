import { useCallback } from 'react';
import { useAppContext } from '../context/AppContext';

/* ── تتبع التجربة المجانية بمفتاح منفصل ── */
const FREE_TRIAL_KEY = 'synapto-free-used';

function isFreeTrialUsed() {
  try { return localStorage.getItem(FREE_TRIAL_KEY) === 'true'; }
  catch { return false; }
}

function markFreeTrialUsed() {
  try { localStorage.setItem(FREE_TRIAL_KEY, 'true'); } catch {}
}

function readTokenFromStorage() {
  try {
    const raw = localStorage.getItem('synapto-license-v1');
    if (!raw) return null;
    const decoded = JSON.parse(decodeURIComponent(escape(atob(raw))));
    return decoded?.token || null;
  } catch {
    return null;
  }
}

export function useAnalysis() {
  const {
    file, API, setLoading, setError, setAnalysis,
    setBlueprint, setAiReport, setArchitectData,
    setShowLineageGraph, analysis, provider, architectData,
    setActiveTab,
    license,
  } = useAppContext();

  /* ── 1. Analyze File ── */
  const handleAnalyze = useCallback(async () => {
    if (!file) return { success: false, error: 'No file selected' };

    setLoading((p) => ({ ...p, analyze: true }));
    setError('');
    setAnalysis(null);
    setBlueprint(null);
    setAiReport('');
    setArchitectData(null);
    setShowLineageGraph(false);

    try {
      const fd = new FormData();
      fd.append('file', file);

      let headers = {};

      /* ── الأولوية 1: التوكن من State ── */
      if (license?.activated && license?.token) {
        headers['X-Activation-Token'] = license.token;
      }
      /* ── الأولوية 2: التوكن من localStorage ── */
      else {
        const token = readTokenFromStorage();
        if (token) {
          headers['X-Activation-Token'] = token;
        }
        /* ── الأولوية 3: تجربة مجانية ── */
        else if (!isFreeTrialUsed()) {
          headers['X-Free-Trial'] = 'true';
          markFreeTrialUsed(); // سجّل فوراً
        }
        /* ── لا توكين + انتهت التجربة ── */
        else {
          return { success: false, error: 'LICENSE_REQUIRED' };
        }
      }

      const res = await fetch(`${API}/analyze`, {
        method: 'POST',
        body: fd,
        headers,
      });

      if (!res.ok) {
        if (res.status === 401) {
          return { success: false, error: 'LICENSE_REQUIRED' };
        }
        throw new Error(`Server error ${res.status}`);
      }

      const data = await res.json();
      if (data.error) throw new Error(data.error);

      setAnalysis(data);
      return { success: true };
    } catch (e) {
      setError(e.message);
      return { success: false, error: e.message };
    } finally {
      setLoading((p) => ({ ...p, analyze: false }));
    }
  }, [file, API, license, setError]);

  /* ── 2. Generate Architect Blueprint ── */
  const handleArchitect = useCallback(async () => {
    if (!file) return { success: false, error: 'No file selected' };
    setLoading((p) => ({ ...p, architect: true }));
    setError('');
    try {
      let token = license?.token || readTokenFromStorage();
      if (!token) {
        return { success: false, error: 'LICENSE_REQUIRED' };
      }

      const fd = new FormData();
      fd.append('file', file);

      const res = await fetch(`${API}/architect-report`, {
        method: 'POST',
        body: fd,
        headers: { 'X-Activation-Token': token },
      });

      if (!res.ok) {
        if (res.status === 401) {
          return { success: false, error: 'LICENSE_REQUIRED' };
        }
        throw new Error(`Server error ${res.status}`);
      }
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setBlueprint(data);
      setArchitectData(data);
      return { success: true };
    } catch (e) {
      setError(e.message);
      return { success: false, error: e.message };
    } finally {
      setLoading((p) => ({ ...p, architect: false }));
    }
  }, [file, API, license, setError]);

  /* ── 3. Generate AI Report ── */
  const handleAiReport = useCallback(async () => {
    if (!analysis) return;
    setLoading((p) => ({ ...p, ai: true }));
    setError('');
    try {
      const token = localStorage.getItem('token');

      const res = await fetch(`${API}/ai-report`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ data: analysis, provider, architectData }),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Server error ${res.status}`);
      }
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setAiReport(data.report || 'No report generated.');
      setActiveTab('ai-report');
    } catch (e) {
      setError(`AI Report Error: ${e.message}`);
    } finally {
      setLoading((p) => ({ ...p, ai: false }));
    }
  }, [analysis, API, provider, architectData, setActiveTab, setError]);

  /* ── 4. Download Clean Excel ── */
  const handleDownloadExcel = useCallback(async () => {
    if (!file) return { success: false, error: 'No file selected' };
    try {
      let token = license?.token || readTokenFromStorage();
      if (!token) {
        return { success: false, error: 'LICENSE_REQUIRED' };
      }

      const fd = new FormData();
      fd.append('file', file);

      const res = await fetch(`${API}/download-clean-excel`, {
        method: 'POST',
        body: fd,
        headers: { 'X-Activation-Token': token },
      });

      if (!res.ok) {
        if (res.status === 401) {
          return { success: false, error: 'LICENSE_REQUIRED' };
        }
        throw new Error(`Server error ${res.status}`);
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `clean_${file.name.replace(/\.[^.]+$/, '')}.zip`;
      a.click();
      URL.revokeObjectURL(url);
      return { success: true };
    } catch (e) {
      setError(e.message);
      return { success: false, error: e.message };
    }
  }, [file, API, license, setError]);

  return { handleAnalyze, handleArchitect, handleAiReport, handleDownloadExcel };
}