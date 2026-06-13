import { useAppContext } from '../../context/AppContext';
import useCopy from '../../hooks/useCopy';
import NeonButton from '../ui/NeonButton';

export default function LogicTab() {
  const { analysis, blueprint, formulaLogic, crossRefs, showPipelineCode, setShowPipelineCode, setShowLineageGraph, t } = useAppContext();
  const [pipelineCopied, copyPipeline] = useCopy();

  return (
    <div className="formula-map-container">
      <div className="map-title">{t('logic.title')}</div>
      <div className="map-subtitle">{t('logic.subtitle')}</div>

      {/* Launch Lineage Graph */}
      <div style={{ marginBottom: '2rem' }}>
        <NeonButton variant="blue" size="small" onClick={() => setShowLineageGraph(true)}>
          {t('logic.openLineage')}
        </NeonButton>
        <span style={{ marginLeft: '1rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          {t('logic.lineageHint')}
        </span>
      </div>

      {/* Formula Nodes */}
      <div className="visual-nodes-flow">
        {formulaLogic.map((f, i) => (
          <div key={i} className="flow-node-card">
            <div className="node-header">
              <h4>{f.target_column || 'Unknown'}</h4>
              <span className="type-badge">{f.logic_type}</span>
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Sheet: <span style={{ color: '#e2e8f0' }}>{f.sheet}</span>
            </div>
            <div style={{ fontSize: '0.8rem', marginTop: '0.5rem', fontFamily: 'monospace', color: 'var(--primary)' }}>
              {f.raw_formula || f.description}
            </div>
          </div>
        ))}
      </div>

      {/* Cross-Sheet Relations */}
      {crossRefs.length > 0 && (
        <div className="cross-sheet-relations">
          <h3 style={{ marginBottom: '1rem', color: 'var(--primary)', fontSize: '1rem' }}>
            {t('logic.crossSheet')}
          </h3>
          <div className="relations-list">
            {crossRefs.map((r, i) => (
              <div key={i} className="relation-item-row">
                <span style={{ color: 'var(--text-main)' }}>{r.from?.sheet || '?'}</span>
                <span style={{ color: 'var(--primary)', fontWeight: 700 }}>
                  --[{r.logic_type || 'REF'}]--&gt;
                </span>
                <span style={{ color: 'var(--success)' }}>{r.to?.sheet || '?'}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pipeline Code Toggle */}
      {blueprint?.pipeline_code && (
        <div style={{ marginTop: '2rem' }}>
          <NeonButton variant="outline" size="small" onClick={() => setShowPipelineCode(!showPipelineCode)}>
            {showPipelineCode ? t('logic.hidePipeline') : t('logic.showPipeline')}
          </NeonButton>
          {showPipelineCode && (
            <div style={{ marginTop: '1rem' }} className="code-block-container">
              <div className="sql-panel-header">
                <div className="sql-title-group">
                  <h3 style={{ color: 'var(--primary)', fontSize: '0.9rem' }}>
                    {t('logic.pipelineTitle')}
                  </h3>
                </div>
                <button
                  className={`copy-action-btn ${pipelineCopied ? 'copied' : ''}`}
                  onClick={() => copyPipeline(blueprint.pipeline_code)}
                >
                  {pipelineCopied ? t('logic.copy') + '!' : t('logic.copy')}
                </button>
              </div>
              <pre className="sql-syntax-block" style={{ maxHeight: '600px', overflow: 'auto' }}>
                {blueprint.pipeline_code}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
