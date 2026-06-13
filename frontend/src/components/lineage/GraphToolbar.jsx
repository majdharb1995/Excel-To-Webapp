import { useAppContext } from '../../context/AppContext';

function StatBadge({ label, value, color }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '5px',
      background: 'rgba(255,255,255,0.03)', padding: '4px 10px',
      borderRadius: '5px', border: `1px solid ${color}25`,
    }}>
      <span style={{ color, fontWeight: 800, fontSize: '13px' }}>{value}</span>
      <span style={{ color: '#64748b', fontSize: '10px', fontWeight: 500 }}>{label}</span>
    </div>
  );
}

function LegendItem({ color, label, dashed, animated }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px' }}>
      <div style={{
        width: '24px', height: '2px',
        background: color,
        borderRadius: '1px',
        borderStyle: dashed ? 'dashed' : 'solid',
        opacity: animated ? 0.8 : 1,
      }} />
      <span style={{ color: '#94a3b8' }}>{label}</span>
    </div>
  );
}

export default function GraphToolbar({ stats, searchTerm, setSearchTerm, filterType, setFilterType, onBack }) {
  const { t } = useAppContext();

  return (
    <>
      {/* Top Toolbar */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0,
        zIndex: 10, padding: '12px 16px',
        background: 'linear-gradient(180deg, rgba(9,13,22,0.95) 0%, rgba(9,13,22,0.7) 80%, transparent 100%)',
        display: 'flex', alignItems: 'center', gap: '12px',
        flexWrap: 'wrap',
      }}>
        <button onClick={onBack} style={{
          background: '#1e293b', color: '#e2e8f0', border: '1px solid #334155',
          padding: '7px 14px', borderRadius: '6px', cursor: 'pointer',
          fontWeight: 600, fontSize: '12px', transition: 'all 0.2s',
        }}>
          {t('lineage.back')}
        </button>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <StatBadge label={t('lineage.sheets')} value={stats.sheets} color="#00d4ff" />
          <StatBadge label={t('lineage.fkLinks')} value={stats.fks} color="#4ade80" />
          <StatBadge label={t('lineage.formulaLinks')} value={stats.formulas} color="#38bdf8" />
        </div>

        <div style={{ position: 'relative', marginLeft: 'auto' }}>
          <input
            type="text"
            placeholder={t('lineage.searchSheets')}
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            style={{
              background: '#0f172a', border: '1px solid #334155',
              color: '#e2e8f0', padding: '6px 12px 6px 30px',
              borderRadius: '6px', fontSize: '12px', width: '180px',
              outline: 'none', fontFamily: "'Inter', sans-serif",
            }}
          />
          <span style={{
            position: 'absolute', left: '10px', top: '50%',
            transform: 'translateY(-50%)', color: '#64748b', fontSize: '12px'
          }}>
            🔍
          </span>
        </div>

        <select
          value={filterType}
          onChange={e => setFilterType(e.target.value)}
          style={{
            background: '#0f172a', border: '1px solid #334155',
            color: '#00d4ff', padding: '6px 10px',
            borderRadius: '6px', fontSize: '11px', fontWeight: 600,
            outline: 'none', cursor: 'pointer',
          }}
        >
          <option value="all">{t('lineage.allLinks')}</option>
          <option value="fk">{t('lineage.fkOnly')}</option>
          <option value="formula">{t('lineage.formulasOnly')}</option>
        </select>
      </div>

      {/* Legend */}
      <div style={{
        position: 'absolute', bottom: '16px', left: '16px', zIndex: 10,
        background: 'rgba(10, 15, 28, 0.92)', backdropFilter: 'blur(10px)',
        border: '1px solid #1e293b', borderRadius: '8px',
        padding: '10px 14px', fontSize: '10px',
      }}>
        <div style={{ fontWeight: 700, color: '#94a3b8', marginBottom: '6px', fontSize: '9px', textTransform: 'uppercase', letterSpacing: '1px' }}>
          {t('lineage.legend')}
        </div>
        <LegendItem color="#4ade80" label={t('lineage.fkRelationship')} dashed />
        <LegendItem color="#38bdf8" label={t('lineage.formulaRef')} animated />
        <LegendItem color="#f59e0b" label={t('lineage.vlookup')} animated />
        <LegendItem color="#a78bfa" label={t('lineage.aggregation')} animated />
        <LegendItem color="#22c55e" label={t('lineage.conditional')} animated />
      </div>
    </>
  );
}
