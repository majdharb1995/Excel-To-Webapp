import { useAppContext } from '../../context/AppContext';
import GlassCard from '../ui/GlassCard';

export default function SheetListCard() {
  const { tableNames, t } = useAppContext();

  return (
    <GlassCard className="card">
      <h3>{t('sidebar.detectedSheets')}</h3>
      <div className="sheet-list-tags">
        {tableNames.map((n) => (
          <span key={n} className="sheet-metadata-tag">{n}</span>
        ))}
      </div>
    </GlassCard>
  );
}
