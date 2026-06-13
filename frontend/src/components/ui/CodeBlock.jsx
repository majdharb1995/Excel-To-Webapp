import CopyButton from './CopyButton';

export default function CodeBlock({ code, language = '', maxHeight = '600px', copyLabel = 'Copy' }) {
  return (
    <div className="code-block-container">
      <div className="sql-panel-header">
        <div className="sql-title-group">
          {language && <h3 style={{ color: 'var(--primary)', fontSize: '0.9rem' }}>{language}</h3>}
        </div>
        <CopyButton text={code} label={copyLabel} />
      </div>
      <pre className="sql-syntax-block" style={{ maxHeight, overflow: 'auto' }}>
        {code}
      </pre>
    </div>
  );
}
