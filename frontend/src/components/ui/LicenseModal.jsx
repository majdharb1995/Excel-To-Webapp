import { useAppContext } from '../../context/AppContext';

export default function LicenseModal() {
  const {
    isLicenseModalOpen,
    openActivationModal,
    closeModals,
    t,
  } = useAppContext();

  if (!isLicenseModalOpen) return null;

  return (
    <div className="license-overlay" onClick={closeModals}>
      <div className="license-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px' }}>
        <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
          <div className="license-stopped-icon">🔒</div>
        </div>
        <h2 className="license-title" style={{ textAlign: 'center' }}>
          {t('license.stopped.title')}
        </h2>
        <p className="license-stopped-desc" style={{ textAlign: 'center' }}>
          {t('license.stopped.desc')}
        </p>
        <div className="license-actions" style={{ justifyContent: 'center', marginTop: '1.5rem' }}>
          <button className="neon-btn blue" onClick={openActivationModal}>
            {t('license.stopped.activate')}
          </button>
        </div>
      </div>
    </div>
  );
}