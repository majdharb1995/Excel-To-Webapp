import { useAppContext } from '../../context/AppContext';
import { useBlueprint } from '../../hooks/useBlueprint';
import { markdownToHtml } from '../../utils/markdown';

export default function AIReportTab() {
  const { aiReport, t } = useAppContext();
  const { handleCopyFullReport, reportCopied } = useBlueprint();

  return (
    <div className="ai-report-card">
      {!aiReport ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
          <p style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>{t('report.noReport')}</p>
          <p>{t('report.generateHint')}</p>
          <p style={{ fontSize: '0.85rem', marginTop: '0.5rem' }}>
            {t('report.apiKeysHint')}
          </p>
        </div>
      ) : (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ color: 'var(--primary)' }}>{t('report.title')}</h3>
            <button
              className={`copy-action-btn ${reportCopied ? 'copied' : ''}`}
              onClick={handleCopyFullReport}
            >
              {reportCopied ? t('report.copiedFull') : t('report.copyFull')}
            </button>
          </div>
          <div className="markdown-body" dangerouslySetInnerHTML={{ __html: markdownToHtml(aiReport) }} />
        </>
      )}
    </div>
  );
}
