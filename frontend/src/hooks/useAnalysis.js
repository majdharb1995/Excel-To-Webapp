import { useCallback } from 'react';
import { useAppContext } from '../context/AppContext';

export function useAnalysis() {
  const {
    file, API, setLoading, setError, setAnalysis,
    setBlueprint, setAiReport, setArchitectData,
    setShowLineageGraph, analysis, provider, architectData,
    setActiveTab,
  } = useAppContext();

  /* ── 1. Analyze File ── */
  const handleAnalyze = useCallback(async () => {
    if (!file) return;
    setLoading((p) => ({ ...p, analyze: true }));
    setError('');
    setAnalysis(null);
    setBlueprint(null);
    setAiReport('');
    setArchitectData(null);
    setShowLineageGraph(false);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch(`${API}/analyze`, { method: 'POST', body: fd });
      if (!res.ok) throw new Error(`Server error ${res.status}`);
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setAnalysis(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading((p) => ({ ...p, analyze: false }));
    }
  }, [file, API]);

  /* ── 2. Generate Architect Blueprint ── */
  const handleArchitect = useCallback(async () => {
    if (!file) return;
    setLoading((p) => ({ ...p, architect: true }));
    setError('');
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch(`${API}/architect-report`, { method: 'POST', body: fd });
      if (!res.ok) throw new Error(`Server error ${res.status}`);
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setBlueprint(data);
      setArchitectData(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading((p) => ({ ...p, architect: false }));
    }
  }, [file, API]);

  /* ── 3. Generate AI Report ── */
  const handleAiReport = useCallback(async () => {
    if (!analysis) return;
    setLoading((p) => ({ ...p, ai: true }));
    setError('');
    try {
      const res = await fetch(`${API}/ai-report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: analysis, provider, architectData }),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Server error ${res.status}`);
      }
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setAiReport(data.report || 'No report generated.');
      setActiveTab('ai-report');
    } catch (e) {
      setError(`AI Report Error: ${e.message}`);
    } finally {
      setLoading((p) => ({ ...p, ai: false }));
    }
  }, [analysis, API, provider, architectData]);

  /* ── 4. Download Clean Excel ── */
  const handleDownloadExcel = useCallback(async () => {
    if (!file) return;
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch(`${API}/download-clean-excel`, { method: 'POST', body: fd });
      if (!res.ok) throw new Error(`Server error ${res.status}`);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `clean_${file.name.replace(/\.[^.]+$/, '')}.zip`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      setError(e.message);
    }
  }, [file, API]);

  return { handleAnalyze, handleArchitect, handleAiReport, handleDownloadExcel };
}
