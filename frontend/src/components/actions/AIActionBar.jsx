import { useAppContext } from '../../context/AppContext';
import { useAnalysis } from '../../hooks/useAnalysis';
import { useBlueprint } from '../../hooks/useBlueprint';
import NeonButton from '../ui/NeonButton';

export default function AIActionBar() {
  const { provider, setProvider, loading, analysis, blueprint, setShowLineageGraph, t } = useAppContext();
  const { handleAiReport, handleDownloadExcel } = useAnalysis();
  const { handleCopyFullReport, handlePrintFinalReport, reportCopied } = useBlueprint();

  return (
    <div className="ai-action">
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
        <div className="ai-provider-select-wrapper">
          <select
            className="ai-provider-select"
            value={provider}
            onChange={(e) => setProvider(e.target.value)}
          >
            <option value="openrouter-free">OpenRouter (Free)</option>
            <option value="pro">OpenRouter (GPT-4o Pro)</option>
            <option value="pro-claude">OpenRouter (Claude Pro)</option>
            <option value="gemini-free">Gemini (Free)</option>
          </select>
        </div>
        <NeonButton variant="blue" disabled={loading.ai} onClick={handleAiReport}>
          {loading.ai ? t('action.generating') : t('action.generateAI')}
        </NeonButton>
        <NeonButton variant="green" disabled={!analysis} onClick={handleDownloadExcel}>
          {t('action.downloadClean')}
        </NeonButton>
        <NeonButton
          variant="outline"
          size="small"
          onClick={() => setShowLineageGraph(true)}
          style={{ borderColor: 'var(--success)', color: 'var(--success)' }}
        >
          {t('action.lineageGraph')}
        </NeonButton>
        <NeonButton
          variant="outline"
          size="small"
          disabled={!analysis || !blueprint}
          onClick={handleCopyFullReport}
        >
          {reportCopied ? t('action.copied') : t('action.copyReport')}
        </NeonButton>
        <NeonButton
          variant="outline"
          size="small"
          disabled={!analysis || !blueprint}
          onClick={handlePrintFinalReport}
        >
          {t('action.printReport')}
        </NeonButton>
      </div>
    </div>
  );
}
