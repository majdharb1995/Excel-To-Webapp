import { useRef } from 'react';
import { useAppContext } from '../../context/AppContext';
import { useAnalysis } from '../../hooks/useAnalysis';
import NeonButton from '../ui/NeonButton';
import OverviewSidebar from '../sidebar/OverviewSidebar';

export default function Hero() {
  const {
    file,
    setFile,
    error,
    setError,
    analysis,
    loading,
    t,
    freeUsed,
    setFreeUsed,
    openLicenseModal,
  } = useAppContext();

  const { handleAnalyze, handleArchitect, handleDownloadExcel } = useAnalysis();

  const onAnalyzeClick = async () => {
    setError('');
    const res = await handleAnalyze();
    if (res?.success) {
      // نجاح التحليل — إذا كانت أول مرة، علّم التجربة المجانية كمستخدمة
      if (!freeUsed) setFreeUsed(true);
    } else if (res?.error === 'LICENSE_REQUIRED') {
      // المرة الثانية بدون ترخيص → اعرض نافذة "البرنامج موقوف"
      openLicenseModal();
    }
  };

  const onArchitectClick = async () => {
    setError('');
    const res = await handleArchitect();
    if (res?.error === 'LICENSE_REQUIRED') {
      openLicenseModal();
    }
  };

  const onDownloadClick = async () => {
    setError('');
    const res = await handleDownloadExcel();
    if (res?.error === 'LICENSE_REQUIRED') {
      openLicenseModal();
    }
  };

  const fileRef = useRef(null);

  return (
    <section className="hero">
      <div className="hero-workspace">
        {/* Left: Upload */}
        <div className="hero-content-left">
          <h1 className="hero-title-premium">
            {t('hero.title.pre')}<span>{t('hero.title.highlight')}</span>{t('hero.title.post')}
          </h1>
          <p>{t('hero.desc')}</p>

          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <label className="neon-btn blue" style={{ cursor: 'pointer' }}>
              <input
                ref={fileRef}
                type="file"
                accept=".xlsx,.xlsm,.xls"
                style={{ display: 'none' }}
                onChange={(e) => { setFile(e.target.files[0]); setError(''); }}
              />
              {t('hero.selectFile')}
            </label>
            {file && <span className="ready-text">{file.name} {t('hero.fileSelected')}</span>}
          </div>

          <div style={{ marginTop: '1.5rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <NeonButton
              variant="blue"
              disabled={!file || loading.analyze}
              onClick={onAnalyzeClick}
            >
              {loading.analyze ? t('hero.analyzing') : t('hero.analyze')}
            </NeonButton>
            <NeonButton
              variant="green"
              disabled={!analysis || loading.architect}
              onClick={onArchitectClick}
            >
              {loading.architect ? t('hero.building') : t('hero.architect')}
            </NeonButton>
          </div>

          {error && <div className="error" style={{ marginTop: '1rem' }}>{error}</div>}
        </div>

        {/* Right: Overview Sidebar */}
        {analysis && <OverviewSidebar />}
      </div>
    </section>
  );
}