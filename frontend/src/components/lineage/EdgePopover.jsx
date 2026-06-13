import { useAppContext } from '../../context/AppContext';

export default function EdgePopover({ data, onClose }) {
  const { t } = useAppContext();
  const isFK = data.logicType === 'FK';
  const accentColor = isFK ? '#4ade80' : '#38bdf8';

  return (
    <div className="synapto-edge-popover" style={{ borderColor: accentColor }}>
      <button className="synapto-popover-close" onClick={onClose}>✕</button>
      <h3 className="synapto-popover-title" style={{ color: accentColor }}>
        {isFK ? '🔗 ' + t('lineage.fkRelationship') : `⚙️ ${data.logicType} ${t('lineage.formulaRef')}`}
      </h3>
      <div className="synapto-popover-info">
        <div style={{ marginBottom: '8px' }}>
          <span style={{ color: '#64748b', fontSize: '11px' }}>{t('lineage.dataFlowDirection')}</span>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            marginTop: '4px', fontSize: '13px',
          }}>
            <span style={{
              color: '#e2e8f0', fontWeight: 700,
              background: 'rgba(0,212,255,0.08)',
              padding: '3px 8px', borderRadius: '4px',
            }}>
              {data.source}
            </span>
            <span style={{ color: accentColor, fontWeight: 700, fontSize: '16px' }}>➜</span>
            <span style={{
              color: '#e2e8f0', fontWeight: 700,
              background: 'rgba(0,212,255,0.08)',
              padding: '3px 8px', borderRadius: '4px',
            }}>
              {data.target}
            </span>
          </div>
        </div>
        <div style={{ fontSize: '11px', color: '#64748b', marginTop: '6px' }}>
          {isFK
            ? `${t('lineage.dataFetchedFrom')} "${data.source}" ${t('lineage.into')} "${data.target}"`
            : `"${data.target}" ${t('lineage.usesDataFrom')} "${data.source}" ${t('lineage.viaFormula')}`
          }
        </div>
      </div>
      <div style={{ marginTop: '10px', marginBottom: '4px', fontSize: '10px', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
        {isFK ? t('lineage.relationshipDetail') : t('lineage.formulaFunction')}
      </div>
      <div className="synapto-popover-code">
        <code>{data.functionDetail || data.rawFormula || t('lineage.noFormula')}</code>
      </div>
    </div>
  );
}
