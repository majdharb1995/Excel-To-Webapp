/* ═══════════════════════════════════════════════════════════════════════
   SYNAPTO — System Architect Engine (Frontend) v4 — RESTRUCTURED
   React + Vite + ReactFlow | Component-Based Architecture
   ═══════════════════════════════════════════════════════════════════════ */
import { AppProvider, useAppContext } from './context/AppContext';
import ErrorBoundary from './components/ui/ErrorBoundary';
import Navbar from './components/layout/Navbar';
import Hero from './components/layout/Hero';
import Footer from './components/layout/Footer';
import AIActionBar from './components/actions/AIActionBar';
import TabBar from './components/tabs/TabBar';
import MetadataTab from './components/tabs/MetadataTab';
import LogicTab from './components/tabs/LogicTab';
import SQLTab from './components/tabs/SQLTab';
import ApiDesignTab from './components/tabs/ApiDesignTab';
import ArchitectTab from './components/tabs/ArchitectTab';
import AIReportTab from './components/tabs/AIReportTab';
import LineageGraph from './components/lineage/LineageGraph';
import LicenseBanner from './components/ui/LicenseBanner';
import LicenseModal from './components/ui/LicenseModal';
import ActivationModal from './components/ui/ActivationModal';

/* ── Tab Content Router ── */
function TabContent() {
  const { activeTab } = useAppContext();
  const tabs = {
    'metadata': MetadataTab,
    'logic': LogicTab,
    'sql': SQLTab,
    'api-design': ApiDesignTab,
    'architect': ArchitectTab,
    'ai-report': AIReportTab,
  };
  const Component = tabs[activeTab];
  return Component ? <Component /> : null;
}

/* ── Results Section (shown when analysis exists) ── */
function ResultsSection() {
  const { analysis, showLineageGraph } = useAppContext();

  if (!analysis || showLineageGraph) return null;

  return (
    <section className="results">
      <AIActionBar />
      <TabBar />
      <div className="tab-content">
        <TabContent />
      </div>
    </section>
  );
}

/* ── Lineage Section (fullscreen graph) ── */
function LineageSection() {
  const { analysis, showLineageGraph, setShowLineageGraph } = useAppContext();

  if (!analysis || !showLineageGraph) return null;

  return (
    <section className="lineage-section">
      <LineageGraph result={analysis} onBack={() => setShowLineageGraph(false)} />
    </section>
  );
}

/* ── App Shell ── */
function AppShell() {
  return (
    <div className="app">
      <Navbar />
      <LicenseBanner />
      <Hero />
      <ResultsSection />
      <LineageSection />
      <Footer />
      <LicenseModal />
      <ActivationModal />
    </div>
  );
}

/* ── Root App with Providers ── */
export default function App() {
  return (
    <ErrorBoundary>
      <AppProvider>
        <AppShell />
      </AppProvider>
    </ErrorBoundary>
  );
}