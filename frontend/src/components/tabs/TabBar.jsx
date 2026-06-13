import { useAppContext } from '../../context/AppContext';

const TAB_LIST = ['metadata', 'logic', 'sql', 'api-design', 'architect', 'ai-report'];

const TAB_KEYS = {
  'metadata': 'tab.metadata',
  'logic': 'tab.logic',
  'sql': 'tab.sql',
  'api-design': 'tab.apiDesign',
  'architect': 'tab.architect',
  'ai-report': 'tab.aiReport',
};

export default function TabBar() {
  const { activeTab, setActiveTab, t } = useAppContext();

  return (
    <div className="tabs">
      {TAB_LIST.map((tab) => (
        <button
          key={tab}
          className={activeTab === tab ? 'active' : ''}
          onClick={() => setActiveTab(tab)}
        >
          {t(TAB_KEYS[tab])}
        </button>
      ))}
    </div>
  );
}
