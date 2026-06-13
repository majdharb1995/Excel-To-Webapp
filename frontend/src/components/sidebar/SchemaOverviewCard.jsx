import { useAppContext } from '../../context/AppContext';
import GlassCard from '../ui/GlassCard';

export default function SchemaOverviewCard() {
  const { tableNames, relationalCount, matrixCount, crossRefs, t } = useAppContext();

  return (
    <GlassCard className="card">
      <h3>{t('sidebar.schemaOverview')}</h3>
      <div className="big-counter">{tableNames.length}</div>
      <div className="computed-subtext">{t('sidebar.tablesDetected')}</div>
      <div className="stats-grid" style={{ marginTop: '0.5rem' }}>
        <div><span>{relationalCount}</span> {t('sidebar.relationalEntities')}</div>
        <div><span>{matrixCount}</span> {t('sidebar.flatMatrices')}</div>
        <div><span>{crossRefs.length}</span> {t('sidebar.crossSheetRefs')}</div>
      </div>
    </GlassCard>
  );
}
