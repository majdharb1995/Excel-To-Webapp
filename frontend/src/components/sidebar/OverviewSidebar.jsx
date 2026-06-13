import { useAppContext } from '../../context/AppContext';
import FileQualityCard from './FileQualityCard';
import SchemaOverviewCard from './SchemaOverviewCard';
import SheetListCard from './SheetListCard';

export default function OverviewSidebar() {
  const { analysis } = useAppContext();
  if (!analysis) return null;

  return (
    <div className="overview-sidebar-right">
      <FileQualityCard />
      <SchemaOverviewCard />
      <SheetListCard />
    </div>
  );
}
