import { useAppContext } from '../../context/AppContext';
import GlassCard from '../ui/GlassCard';

export default function FileQualityCard() {
  const { analysis, quality, filledPct, t } = useAppContext();

  return (
    <GlassCard className="card">
      <h3>{t('sidebar.fileQuality')}</h3>
      <div className="quality-bar">
        <div className="quality-fill" style={{ width: `${filledPct}%` }} />
      </div>
      <div className="percentage-text">{filledPct}% {t('sidebar.filled')}</div>
      <div className="stats-grid">
        <div><span>{analysis.total_sheets || 0}</span> {t('sidebar.sheets')}</div>
        <div><span>{quality.filled_cells?.toLocaleString() || 0}</span> {t('sidebar.filledCells')}</div>
        <div><span>{analysis.total_formulas || 0}</span> {t('sidebar.formulas')}</div>
      </div>
    </GlassCard>
  );
}
