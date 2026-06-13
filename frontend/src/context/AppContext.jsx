import { createContext, useContext, useState, useMemo, useCallback, useEffect } from 'react';
import { t as translate, getDir } from '../utils/i18n';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  /* ── Core State ── */
  const [file, setFile] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [blueprint, setBlueprint] = useState(null);
  const [aiReport, setAiReport] = useState('');
  const [activeTab, setActiveTab] = useState('metadata');
  const [loading, setLoading] = useState({ analyze: false, architect: false, ai: false });
  const [error, setError] = useState('');
  const [provider, setProvider] = useState('openrouter-free');
  const [showLineageGraph, setShowLineageGraph] = useState(false);
  const [showPipelineCode, setShowPipelineCode] = useState(false);
  const [architectData, setArchitectData] = useState(null);

  /* ── Language State ── */
  const [lang, setLang] = useState(() => {
    try { return localStorage.getItem('synapto-lang') || 'en'; } catch { return 'en'; }
  });

  /* ── Persist language + Apply RTL ── */
  useEffect(() => {
    try { localStorage.setItem('synapto-lang', lang); } catch {}
    document.documentElement.setAttribute('dir', getDir(lang));
    document.documentElement.setAttribute('lang', lang);
    document.body.classList.toggle('rtl', lang === 'ar');
  }, [lang]);

  const toggleLang = useCallback(() => {
    setLang(prev => prev === 'en' ? 'ar' : 'en');
  }, []);

  /* ── Translation helper ── */
  const t = useCallback((key) => translate(key, lang), [lang]);

  /* ── API Base URL ── */
  const API = import.meta.env.VITE_API_URL || 'http://localhost:8000';

  /* ── Derived State ── */
  const derived = useMemo(() => {
    const tablesMeta = analysis?.tables_metadata || {};
    const crossRefs = analysis?.cross_sheet_refs || [];
    const formulaLogic = analysis?.formula_logic || [];
    const quality = analysis?.data_quality || {};
    const filledPct = quality.filled_cells && analysis?.total_cells
      ? Math.round((quality.filled_cells / analysis.total_cells) * 100)
      : 0;
    const tableNames = Object.keys(tablesMeta);
    const relationalCount = tableNames.filter((n) => tablesMeta[n].status !== 'Flat_Calculation_Matrix').length;
    const matrixCount = tableNames.filter((n) => tablesMeta[n].status === 'Flat_Calculation_Matrix').length;

    return { tablesMeta, crossRefs, formulaLogic, quality, filledPct, tableNames, relationalCount, matrixCount };
  }, [analysis]);

  const value = {
    file, analysis, blueprint, aiReport, activeTab, loading, error,
    provider, showLineageGraph, showPipelineCode, architectData, API,
    lang, toggleLang, t,
    ...derived,
    setFile, setAnalysis, setBlueprint, setAiReport, setActiveTab,
    setLoading, setError, setProvider, setShowLineageGraph,
    setShowPipelineCode, setArchitectData,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppContext must be used inside AppProvider');
  return ctx;
}

export default AppContext;
