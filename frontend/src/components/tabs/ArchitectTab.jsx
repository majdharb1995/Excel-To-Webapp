import { useAppContext } from '../../context/AppContext';
import useCopy from '../../hooks/useCopy';

function ArchitectPhaseCard({ title, color, children }) {
  return (
    <div className="architect-phase-card" style={{ '--phase-color': color }}>
      <div className="architect-phase-header">{title}</div>
      {children}
    </div>
  );
}

export default function ArchitectTab() {
  const { blueprint, t } = useAppContext();
  const [promptCopied, copyPrompt] = useCopy();
  const [pipelineCopied, copyPipeline] = useCopy();

  if (!blueprint) {
    return (
      <div className="architect-container">
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
          <p style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>{t('arch.noBlueprint')}</p>
          <p>{t('arch.generateHint')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="architect-container">
      {/* Phase 1: Database */}
      {blueprint.phase_1_database && (
        <ArchitectPhaseCard title={t('arch.phase1')} color="#3b82f6">
          {(blueprint.phase_1_database.tables || []).map((tb, i) => (
            <div key={i} className="architect-list-item">
              <b>[{tb.status}]</b> {tb.entity_name}
              {tb.engineering_note && (
                <div style={{ color: 'var(--danger)', fontSize: '0.8rem', marginTop: '0.3rem' }}>{tb.engineering_note}</div>
              )}
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>
                {t('arch.columns')}: {(tb.columns || []).map((c) => c.name).join(', ')}
              </div>
              {tb.entity_name === 'dashboard_summary' && (
                <div style={{ marginTop: '0.5rem', padding: '0.5rem', background: 'rgba(0,212,255,0.05)', border: '1px solid rgba(0,212,255,0.2)', borderRadius: '4px', fontSize: '0.8rem', color: 'var(--primary)' }}>
                  {t('arch.enrichedSchema')}: total_headcount, total_payout, it_dept_cost, hr_dept_cost, finance_dept_cost, operations_dept_cost
                </div>
              )}
            </div>
          ))}
          {(blueprint.phase_1_database.relationships || []).length > 0 && (
            <>
              <div className="architect-sub-header">{t('arch.relationships')}</div>
              {(blueprint.phase_1_database.relationships || []).map((r, i) => (
                <div key={i} className="architect-list-item" style={{ borderLeftColor: 'var(--success)' }}>
                  <b>{r.from_table}</b>.{r.from_column} &rarr; <b>{r.to_table}</b>.{r.to_column}
                  <span style={{ marginLeft: '0.5rem', color: 'var(--text-muted)' }}>({r.type})</span>
                </div>
              ))}
            </>
          )}
        </ArchitectPhaseCard>
      )}

      {/* Phase 2: Logic */}
      {blueprint.phase_2_logic && (
        <ArchitectPhaseCard title={t('arch.phase2')} color="var(--accent-green)">
          {blueprint.phase_2_logic.macro_warning && (
            <div className="architect-warning">{blueprint.phase_2_logic.macro_warning}</div>
          )}
          <div className="architect-sub-header">{t('arch.dependencyGraph')}</div>
          {(blueprint.phase_2_logic.dependency_graph || []).map((rule, i) => (
            <div key={i} className="architect-list-item">
              <b>{rule.source_table}</b> &rarr; <b>{rule.target_table}</b>
              <div style={{ fontSize: '0.8rem', color: 'var(--primary)', marginTop: '0.3rem' }}>
                [{rule.logic_type}] {rule.raw_formula}
              </div>
              {rule.backend_implementation && (
                <div style={{ fontSize: '0.8rem', color: 'var(--success)', marginTop: '0.2rem' }}>
                  &rarr; {rule.backend_implementation}
                </div>
              )}
            </div>
          ))}
          <div className="architect-sub-header" style={{ color: 'var(--danger)' }}>{t('arch.contradictions')}</div>
          <div className="architect-list-item" style={{ borderLeftColor: 'var(--danger)' }}>
            <div><b>GROSS-SALARY-001:</b> Gross = Base + OT only (NO benefits)</div>
            <div><b>OVERTIME-CALC-001:</b> OT = (base/30/8) * hours</div>
            <div><b>TAX-CALC-001:</b> Progressive: tax = (gross - min) * rate + fixed</div>
            <div><b>IF-PAYOUT-001:</b> Paid if final_payout &gt; 0, else Pending</div>
            <div><b>IF-TAX-BRACKET-001:</b> if/elif bracket selection</div>
            <div><b>BENEFITS-MAP:</b> col_key = str(years) if &le;4, else "5+"</div>
          </div>
        </ArchitectPhaseCard>
      )}

      {/* Phase 3: UI/UX */}
      {blueprint.phase_3_ui_ux && (
        <ArchitectPhaseCard title={t('arch.phase3')} color="#10b981">
          {(blueprint.phase_3_ui_ux.screens || []).map((s, i) => (
            <div key={i} className="architect-list-item">
              <b>{s.entity}</b>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                Route: <code>{s.route}</code> | Type: {s.screen_type} | Role: {s.functional_role}
              </div>
            </div>
          ))}
        </ArchitectPhaseCard>
      )}

      {/* Phase 4: Auth */}
      {blueprint.phase_4_auth && (
        <ArchitectPhaseCard title={t('arch.phase4')} color="#f59e0b">
          <div className="architect-list-item">{blueprint.phase_4_auth.auth_note}</div>
          {(blueprint.phase_4_auth.required_roles || []).map((r, i) => (
            <div key={i} className="architect-list-item"><b>{r.role}</b>: {r.permissions}</div>
          ))}
        </ArchitectPhaseCard>
      )}

      {/* Phase 5: Validation */}
      {blueprint.phase_5_validation && (
        <ArchitectPhaseCard title={t('arch.phase5')} color="#ef4444">
          {(blueprint.phase_5_validation.entity_validations || []).map((v, i) => (
            <div key={i} className="architect-list-item">
              <b>{v.entity}</b>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>
                {(v.column_rules || []).map((cr) => `${cr.column}(${cr.type}): ${cr.validation_rule}`).join(' | ')}
              </div>
            </div>
          ))}
        </ArchitectPhaseCard>
      )}

      {/* Execution Flow */}
      {(blueprint.execution_flow || []).length > 0 && (
        <ArchitectPhaseCard title={t('arch.executionFlow')} color="var(--primary)">
          {blueprint.execution_flow.map((step, i) => (
            <div key={i} className="execution-step">
              <div className="execution-step-number">{step.step}</div>
              <div className="execution-step-content">
                <h4>{step.phase}</h4>
                <p>{step.description}</p>
                <span className="execution-step-code">{step.action}</span>
                {step.phase === 'CALCULATION' && (
                  <span className="role-badge" style={{ background: 'var(--primary)', marginLeft: '0.5rem' }}>PIPELINE</span>
                )}
              </div>
            </div>
          ))}
        </ArchitectPhaseCard>
      )}

      {/* Strict Rules */}
      {(blueprint.strict_rules || []).length > 0 && (
        <ArchitectPhaseCard title={t('arch.strictRules')} color="var(--danger)">
          {blueprint.strict_rules.map((rule, i) => {
            if (typeof rule === 'object') {
              return (
                <div key={i} className="architect-list-item" style={{ borderLeftColor: rule.severity === 'CRITICAL' ? 'var(--danger)' : 'var(--warning)' }}>
                  <b>[{rule.severity}]</b> <code>{rule.rule_id}</code>
                  <div style={{ marginTop: '0.3rem', fontSize: '0.85rem' }}>{rule.rule}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                    Applies to: {(rule.applies_to || []).join(', ')}
                  </div>
                </div>
              );
            }
            return <div key={i} className="architect-list-item">{rule}</div>;
          })}
        </ArchitectPhaseCard>
      )}

      {/* Pipeline Code */}
      {blueprint.pipeline_code && (
        <ArchitectPhaseCard title={t('arch.pipelineCode')} color="var(--primary)">
          <div className="code-block-container">
            <div className="sql-panel-header">
              <div className="sql-title-group">
                <h3 style={{ color: 'var(--primary)', fontSize: '0.9rem' }}>Python Calculation Pipeline</h3>
              </div>
              <button className={`copy-action-btn ${pipelineCopied ? 'copied' : ''}`} onClick={() => copyPipeline(blueprint.pipeline_code)}>
                {pipelineCopied ? t('action.copied') : t('logic.copy')}
              </button>
            </div>
            <pre className="sql-syntax-block" style={{ maxHeight: '600px', overflow: 'auto' }}>{blueprint.pipeline_code}</pre>
          </div>
        </ArchitectPhaseCard>
      )}

      {/* AI-Ready System Prompt */}
      {blueprint.ai_ready_system_prompt_markdown && (
        <ArchitectPhaseCard title={t('arch.aiPrompt')} color="var(--accent-green)">
          <div className="ai-ready-prompt-header">
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              {t('arch.promptHint')}
            </span>
            <button className={`copy-action-btn ${promptCopied ? 'copied' : ''}`} onClick={() => copyPrompt(blueprint.ai_ready_system_prompt_markdown)}>
              {promptCopied ? t('action.copied') : t('arch.copyPrompt')}
            </button>
          </div>
          <div className="prompt-card">
            <pre>{blueprint.ai_ready_system_prompt_markdown}</pre>
          </div>
        </ArchitectPhaseCard>
      )}
    </div>
  );
}
