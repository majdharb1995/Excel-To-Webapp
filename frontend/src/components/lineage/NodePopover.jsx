import { useAppContext } from '../../context/AppContext';

function ConnectionRow({ from, to, type, color, formula }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '6px',
      padding: '4px 8px', background: 'rgba(255,255,255,0.02)',
      borderRadius: '4px', fontSize: '11px', direction: 'ltr', textAlign: 'left',
    }}>
      <span style={{ color: '#e2e8f0', fontWeight: 600 }}>{from}</span>
      <span style={{ color, fontWeight: 700 }}>→</span>
      <span style={{ color: '#e2e8f0', fontWeight: 600 }}>{to}</span>
      <span style={{
        color, fontSize: '9px', fontWeight: 700,
        background: `${color}15`, padding: '1px 5px', borderRadius: '3px',
        marginLeft: 'auto',
      }}>
        {type}
      </span>
      {formula && (
        <div style={{
          fontSize: '9px', color: '#64748b',
          maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis',
          whiteSpace: 'nowrap', fontFamily: "'Cascadia Code', monospace",
        }} title={formula}>
          {formula}
        </div>
      )}
    </div>
  );
}

export default function NodePopover({ data, result, onClose }) {
  const { t } = useAppContext();
  const nodeMeta = result?.tables_metadata?.[data.id];
  if (!nodeMeta) return null;

  const isMatrix = nodeMeta.status === 'Flat_Calculation_Matrix';
  const accentColor = isMatrix ? '#22c55e' : '#00d4ff';

  const allRefs = result?.cross_sheet_refs || [];
  const connectedFrom = [];
  const connectedTo = [];

  allRefs.forEach(ref => {
    const source = ref.source || '';
    const target = ref.target || '';
    if (target === data.id) connectedFrom.push(ref);
    if (source === data.id) connectedTo.push(ref);
  });

  const fkSources = (nodeMeta.fks || []).map(fk => fk.references_table).filter(Boolean);
  const fkConsumers = [];
  Object.entries(result?.tables_metadata || {}).forEach(([tName, tMeta]) => {
    (tMeta.fks || []).forEach(fk => {
      if (fk.references_table === data.id) {
        fkConsumers.push({ table: tName, column: fk.column, refCol: fk.references_column });
      }
    });
  });

  return (
    <div className="synapto-edge-popover" style={{ borderColor: accentColor, width: '420px' }}>
      <button className="synapto-popover-close" onClick={onClose}>✕</button>
      <h3 className="synapto-popover-title" style={{ color: accentColor }}>
        {isMatrix ? '📊' : '🗃️'} {data.originalName || data.id}
      </h3>

      <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '10px' }}>
        {isMatrix ? t('lineage.flatMatrixNote') : `${t('lineage.entityNote')} — ${nodeMeta.columns?.length || 0} ${t('lineage.columns').toLowerCase()}`}
      </div>

      {/* Columns */}
      <div style={{ marginBottom: '12px' }}>
        <div style={{ fontSize: '10px', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>
          {t('lineage.columns')}
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', direction: 'ltr' }}>
          {(nodeMeta.columns || []).map((col, i) => {
            const isPK = col.name === (nodeMeta.pk || 'id');
            const isFK = (nodeMeta.fks || []).some(fk => fk.column === col.name);
            return (
              <span key={i} style={{
                fontSize: '10px', padding: '2px 6px', borderRadius: '3px',
                background: isPK ? 'rgba(250,204,21,0.1)' : isFK ? 'rgba(74,222,128,0.1)' : 'rgba(255,255,255,0.04)',
                border: `1px solid ${isPK ? 'rgba(250,204,21,0.3)' : isFK ? 'rgba(74,222,128,0.3)' : 'rgba(255,255,255,0.08)'}`,
                color: isPK ? '#facc15' : isFK ? '#4ade80' : '#94a3b8',
                fontFamily: "'Cascadia Code', monospace",
              }}>
                {isPK && '🔑 '}{isFK && '🔗 '}{col.name} ({col.type})
              </span>
            );
          })}
        </div>
      </div>

      {/* Connections */}
      {(fkSources.length > 0 || fkConsumers.length > 0 || connectedFrom.length > 0 || connectedTo.length > 0) && (
        <div>
          <div style={{ fontSize: '10px', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>
            {t('lineage.connections')}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {fkSources.map((src, i) => (
              <ConnectionRow key={`fk-src-${i}`} from={src} to={data.id} type="FK" color="#4ade80" />
            ))}
            {fkConsumers.map((c, i) => (
              <ConnectionRow key={`fk-con-${i}`} from={data.id} to={c.table} type={`FK (${c.column})`} color="#4ade80" />
            ))}
            {connectedFrom.map((ref, i) => (
              <ConnectionRow key={`ref-from-${i}`} from={ref.source || '?'} to={data.id} type={ref.logic_type || 'REF'} color="#38bdf8" formula={ref.raw_formula} />
            ))}
            {connectedTo.map((ref, i) => (
              <ConnectionRow key={`ref-to-${i}`} from={data.id} to={ref.target || '?'} type={ref.logic_type || 'REF'} color="#38bdf8" formula={ref.raw_formula} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
