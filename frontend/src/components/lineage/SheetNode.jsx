import { Position, Handle } from 'reactflow';
import { useAppContext } from '../../context/AppContext';

export default function SheetNode({ data, selected }) {
  const { t } = useAppContext();
  const isMatrix = data.isMatrix;
  const accentColor = isMatrix ? '#22c55e' : '#00d4ff';
  const statusLabel = isMatrix ? t('meta.flatMatrix') : t('meta.entity');
  const cols = data.columns || [];
  const pkCol = data.pk || 'id';
  const fks = data.fks || [];

  return (
    <div style={{
      background: 'rgba(10, 15, 28, 0.95)',
      backdropFilter: 'blur(12px)',
      border: `1.5px solid ${selected ? accentColor : 'rgba(30, 41, 59, 0.8)'}`,
      borderRadius: '12px',
      width: '280px',
      overflow: 'hidden',
      boxShadow: selected
        ? `0 0 25px ${accentColor}40, 0 8px 32px rgba(0,0,0,0.5)`
        : '0 4px 20px rgba(0,0,0,0.4)',
      transition: 'border-color 0.2s, box-shadow 0.2s',
      fontFamily: "'Inter', 'Segoe UI', sans-serif",
    }}>
      <Handle type="target" position={Position.Top} style={{
        background: accentColor, width: '8px', height: '8px',
        border: '2px solid #0a0f1c', borderRadius: '50%'
      }} />
      <Handle type="source" position={Position.Bottom} style={{
        background: accentColor, width: '8px', height: '8px',
        border: '2px solid #0a0f1c', borderRadius: '50%'
      }} />
      <Handle type="target" position={Position.Left} id="left" style={{
        background: '#4ade80', width: '7px', height: '7px',
        border: '2px solid #0a0f1c', borderRadius: '50%', left: '-4px'
      }} />
      <Handle type="source" position={Position.Right} id="right" style={{
        background: '#4ade80', width: '7px', height: '7px',
        border: '2px solid #0a0f1c', borderRadius: '50%', right: '-4px'
      }} />

      {/* Header */}
      <div style={{
        background: `linear-gradient(135deg, ${accentColor}15 0%, transparent 60%)`,
        borderBottom: `1px solid ${accentColor}30`,
        padding: '10px 14px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
      }}>
        <span style={{ fontSize: '16px', filter: 'drop-shadow(0 0 4px rgba(0,0,0,0.5))' }}>
          {isMatrix ? '📊' : '🗃️'}
        </span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontSize: '13px', fontWeight: 700, color: '#e2e8f0',
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
            direction: 'ltr', textAlign: 'left',
          }}>
            {data.originalName || data.label}
          </div>
          <div style={{
            fontSize: '9px', fontWeight: 600, color: accentColor,
            textTransform: 'uppercase', letterSpacing: '1px', marginTop: '1px',
          }}>
            {statusLabel}
          </div>
        </div>
        <div style={{
          fontSize: '9px', color: '#64748b',
          background: 'rgba(255,255,255,0.04)',
          padding: '2px 6px', borderRadius: '4px', fontWeight: 600,
        }}>
          {cols.length} {t('lineage.cols')}
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: '8px 14px 10px' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: '6px',
          marginBottom: '4px', fontSize: '10.5px', direction: 'ltr', textAlign: 'left'
        }}>
          <span style={{ color: '#facc15', fontWeight: 700, fontSize: '9px' }}>PK</span>
          <span style={{ color: '#94a3b8', fontFamily: "'Cascadia Code', monospace" }}>{pkCol}</span>
        </div>

        {fks.length > 0 && (
          <div style={{ marginBottom: '6px' }}>
            {fks.map((fk, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                fontSize: '10.5px', direction: 'ltr', textAlign: 'left',
                marginBottom: '2px'
              }}>
                <span style={{ color: '#4ade80', fontWeight: 700, fontSize: '9px' }}>FK</span>
                <span style={{ color: '#94a3b8', fontFamily: "'Cascadia Code', monospace" }}>
                  {fk.column} → {fk.references_table}.{fk.references_column}
                </span>
              </div>
            ))}
          </div>
        )}

        <div style={{
          borderTop: '1px solid rgba(255,255,255,0.05)',
          paddingTop: '5px', display: 'flex', flexWrap: 'wrap', gap: '3px', direction: 'ltr',
        }}>
          {cols.slice(0, 6).map((col, i) => (
            <span key={i} style={{
              fontSize: '9px',
              color: col.name === pkCol ? '#facc15' : '#64748b',
              background: col.name === pkCol ? 'rgba(250,204,21,0.1)' : 'rgba(255,255,255,0.03)',
              border: `1px solid ${col.name === pkCol ? 'rgba(250,204,21,0.2)' : 'rgba(255,255,255,0.06)'}`,
              padding: '1px 5px', borderRadius: '3px',
              fontFamily: "'Cascadia Code', monospace",
            }}>
              {col.name}
            </span>
          ))}
          {cols.length > 6 && (
            <span style={{ fontSize: '9px', color: '#475569', padding: '1px 4px' }}>
              +{cols.length - 6}
            </span>
          )}
        </div>

        {data.functionalRole && (
          <div style={{
            marginTop: '6px', fontSize: '9px', color: '#64748b',
            direction: 'ltr', textAlign: 'left', fontStyle: 'italic',
          }}>
            {t('lineage.role')}: {data.functionalRole}
          </div>
        )}
      </div>
    </div>
  );
}
