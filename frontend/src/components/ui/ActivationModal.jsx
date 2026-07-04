import { useState } from 'react';
import { useAppContext } from '../../context/AppContext';

export default function ActivationModal() {
  const {
    isActivationModalOpen,
    openLicenseModal,
    closeModals,
    t,
    activate,
    loadingActivate,
    activationError,
    setActivationError,
    license,
    setLicense,
  } = useAppContext();

  const [mode, setMode] = useState('form'); // form | sent | checking
  const [form, setForm] = useState({ full_name: '', email: '', phone: '', company: '', notes: '' });
  const [checkEmail, setCheckEmail] = useState('');
  const [checkResult, setCheckResult] = useState(null);
  const [loadingCheck, setLoadingCheck] = useState(false);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [submitError, setSubmitError] = useState('');

  if (!isActivationModalOpen) return null;

  const API = import.meta.env.VITE_API_URL || 'http://localhost:8000';

  const handleFormChange = (field) => (e) => {
    setForm((p) => ({ ...p, [field]: e.target.value }));
    setSubmitError('');
  };

  const handleSubmitForm = async (e) => {
    e.preventDefault();
    if (!form.full_name.trim() || !form.email.trim()) return;
    setLoadingSubmit(true);
    setSubmitError('');
    try {
      const res = await fetch(`${API}/api/request-activation`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!data.success) {
        setSubmitError(data.error || 'Error');
      } else {
        setCheckEmail(form.email);
        setMode('sent');
      }
    } catch {
      setSubmitError('Connection error');
    } finally {
      setLoadingSubmit(false);
    }
  };

  const handleCheckStatus = async (e) => {
    e.preventDefault();
    if (!checkEmail.trim()) return;
    setLoadingCheck(true);
    setCheckResult(null);
    try {
      const res = await fetch(`${API}/api/check-request-status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: checkEmail }),
      });
      const data = await res.json();
      setCheckResult(data);

      if (data.status === 'approved' && data.token) {
        // Store license
        const next = {
          activated: true,
          expiryDate: data.expiresAt,
          token: data.token,
          freeUsed: true,
        };
        setLicense(next);
        try {
          const json = JSON.stringify(next);
          const b64 = btoa(unescape(encodeURIComponent(json)));
          localStorage.setItem('synapto-license-v1', b64);
        } catch {}
        setTimeout(() => closeModals(), 800);
      }
    } catch {
      setCheckResult({ success: false, status: 'error' });
    } finally {
      setLoadingCheck(false);
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      resetAndClose();
    }
  };

  const resetAndClose = () => {
    setMode('form');
    setForm({ full_name: '', email: '', phone: '', company: '', notes: '' });
    setCheckEmail('');
    setCheckResult(null);
    setSubmitError('');
    setActivationError('');
    closeModals();
  };

  const handleBack = () => {
    setMode('form');
    setCheckResult(null);
    setSubmitError('');
  };

  return (
    <div className="license-overlay" onClick={handleOverlayClick}>
      <div className="license-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '520px' }}>

        {/* ═══ FORM MODE ═══ */}
        {mode === 'form' && (
          <>
            <h2 className="license-title">{t('license.request.title')}</h2>
            <p className="license-stopped-desc">{t('license.request.desc')}</p>

            <form onSubmit={handleSubmitForm} style={{ marginTop: '1rem' }}>
              <div className="license-input-wrap">
                <input className="license-code-input" placeholder={t('license.request.name')} value={form.full_name} onChange={handleFormChange('full_name')} required />
              </div>
              <div className="license-input-wrap">
                <input className="license-code-input" type="email" placeholder={t('license.request.email')} value={form.email} onChange={handleFormChange('email')} required />
              </div>
              <div className="license-input-wrap">
                <input className="license-code-input" type="tel" placeholder={t('license.request.phone')} value={form.phone} onChange={handleFormChange('phone')} />
              </div>
              <div className="license-input-wrap">
                <input className="license-code-input" placeholder={t('license.request.company')} value={form.company} onChange={handleFormChange('company')} />
              </div>
              <div className="license-input-wrap">
                <textarea className="license-code-input" rows="2" placeholder={t('license.request.notes')} value={form.notes} onChange={handleFormChange('notes')} style={{ resize: 'vertical' }} />
              </div>

              {submitError && (
                <div className="license-invalid-code">{submitError}</div>
              )}

              <div className="license-actions">
                <button type="button" className="license-back-btn" onClick={resetAndClose}>
                  {t('license.activation.back')}
                </button>
                <button type="submit" className="neon-btn blue" disabled={loadingSubmit}>
                  {loadingSubmit ? '...' : t('license.request.submit')}
                </button>
              </div>
            </form>
          </>
        )}

        {/* ═══ SENT / CHECK MODE ═══ */}
        {(mode === 'sent' || mode === 'checking') && (
          <>
            <h2 className="license-title">{t('license.check.title')}</h2>
            <p className="license-stopped-desc">{t('license.check.desc')}</p>

            <form onSubmit={handleCheckStatus} style={{ marginTop: '1rem' }}>
              <div className="license-input-wrap">
                <input className="license-code-input" type="email" placeholder={t('license.check.placeholder')} value={checkEmail} onChange={(e) => { setCheckEmail(e.target.value); setCheckResult(null); }} required />
              </div>

              {checkResult && (
                <div style={{ marginTop: '1rem' }}>
                  {checkResult.status === 'pending' && (
                    <div className="license-check-box pending">
                      ⏳ {t('license.check.pending')}
                    </div>
                  )}
                  {checkResult.status === 'rejected' && (
                    <div className="license-check-box rejected">
                      ❌ {t('license.check.rejected')}
                      {checkResult.reason && <div style={{ fontWeight: 600, fontSize: '.85rem', marginTop: '.35rem' }}>{checkResult.reason}</div>}
                    </div>
                  )}
                  {checkResult.status === 'approved' && (
                    <div className="license-check-box approved">
                      ✅ {t('license.check.approved')}
                    </div>
                  )}
                  {checkResult.status === 'not_found' && (
                    <div className="license-check-box rejected">
                      {t('license.check.notFound')}
                    </div>
                  )}
                </div>
              )}

              <div className="license-actions">
                <button type="button" className="license-back-btn" onClick={handleBack}>
                  {t('license.activation.back')}
                </button>
                <button type="submit" className="neon-btn blue" disabled={loadingCheck || !checkEmail.trim()}>
                  {loadingCheck ? '...' : t('license.check.button')}
                </button>
              </div>
            </form>
          </>
        )}

      </div>
    </div>
  );
}