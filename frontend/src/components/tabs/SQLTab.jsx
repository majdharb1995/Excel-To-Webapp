import { useAppContext } from '../../context/AppContext';
import useCopy from '../../hooks/useCopy';

export default function SQLTab() {
  const { analysis, t } = useAppContext();
  const [sqlCopied, copySql] = useCopy();

  return (
    <div className="sql-tab-wrapper">
      <div className="sql-header">
        <div className="sql-title-group">
          <h3 style={{ color: 'var(--primary)', fontSize: '1rem' }}>
            {t('sql.title')}
          </h3>
        </div>
        <button
          className={`copy-action-btn ${sqlCopied ? 'copied' : ''}`}
          onClick={() => copySql(analysis.sql_schema || '')}
        >
          {sqlCopied ? t('action.copied') : t('sql.copySql')}
        </button>
      </div>
      <div className="code-block-container">
        <pre className="sql-syntax-block">
          {analysis.sql_schema || t('sql.notAvailable')}
        </pre>
      </div>
    </div>
  );
}
