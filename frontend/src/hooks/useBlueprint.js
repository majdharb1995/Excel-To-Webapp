import { useCallback } from 'react';
import { useAppContext } from '../context/AppContext';
import { buildLineageMap } from '../utils/format';
import useCopy from './useCopy';

export function useBlueprint() {
  const { analysis, blueprint, aiReport, setError } = useAppContext();
  const [reportCopied, copyReport] = useCopy();

  const buildFullBlueprintText = useCallback(() => {
    if (!analysis || !blueprint) return '';

    const CALCULATION_PIPELINE_CONTEXT = `
============================================================
  SYNAPTO CALCULATION PIPELINE (7 Steps)
  Topological Sort - Strict Execution Order
============================================================

Step 1: _step_1_load_employees
  -> Load all employees, compute years_of_service = (today - join_date).years

Step 2: _step_2_load_attendance
  -> Load attendance for given month
  -> Overtime_Pay = (Base_Salary / 30 / 8) * Overtime_Hours

Step 3: _step_3_compute_salary_processing
  -> Gross_Salary = Base_Salary + Overtime_Pay
  -> ** Benefits are NOT included in Gross Salary **

Step 4: _step_4_compute_tax
  -> PROGRESSIVE Tax Formula:
     tax = (Gross_Salary - Min_Salary) * Tax_Rate + Fixed_Deduction
  -> Find bracket: Min_Salary <= Gross_Salary < Max_Salary
  -> This is IF Formula #2 (Tax Bracket Selection via if/elif chain)

Step 5: _step_5_compute_benefits_lookup
  -> Benefits Matrix VLOOKUP: BDBM_MAP[grade][column_key]
  -> Column Key: str(years) if years <= 4, else "5+"
  -> Calculated_Benefit = Base_Salary * Benefit_Multiplier

Step 6: _step_6_compute_final_payroll
  -> Final_Payout = Total_Net_Salary + Total_Benefits
  -> IF Formula #1: Payout_Status = "Paid" if final_payout > 0 else "Pending"

Step 7: _step_7_compute_dashboard_summary
  -> total_headcount, total_payout
  -> it_dept_cost, hr_dept_cost, finance_dept_cost, operations_dept_cost
`;

    const DASHBOARD_SUMMARY_SCHEMA = `
dashboard_summary {
  total_headcount      INTEGER   -- COUNT of employees
  total_payout         FLOAT     -- SUM of final_payout
  it_dept_cost         FLOAT     -- SUM of final_payout WHERE dept='IT'
  hr_dept_cost         FLOAT     -- SUM of final_payout WHERE dept='HR'
  finance_dept_cost    FLOAT     -- SUM of final_payout WHERE dept='Finance'
  operations_dept_cost FLOAT     -- SUM of final_payout WHERE dept='Operations'
}`;

    const RESOLVED_CONTRADICTIONS = `
============================================================
  RESOLVED CONTRADICTIONS (Authoritative)
============================================================

1. Tax Formula:     tax = (gross - min) * rate + fixed  (PROGRESSIVE, not simple)
2. Gross Salary:    gross = base_salary + overtime_pay  (NO benefits)
3. Overtime Pay:    ot = (base / 30 / 8) * overtime_hours
4. Benefits Lookup: col_key = str(years) if years<=4, else "5+"
5. IF Formula #1:   payout_status = "Paid" if final_payout > 0 else "Pending"
6. IF Formula #2:   tax bracket selection via if/elif chain
7. Final Payout:    final_payout = total_net_salary + total_benefits
8. Dashboard:       6 columns (total_headcount, total_payout, 4 dept costs)
`;

    const tablesSummary = Object.entries(analysis.tables_metadata || {})
      .map(([name, meta]) => {
        const status = meta.status || 'Unknown';
        const role = meta.functional_role || 'Unknown';
        const pk = meta.pk || 'id';
        const fks = (meta.fks || []).map(f => `${f.column} -> ${f.references_table}.${f.references_column}`).join(', ');
        const cols = (meta.columns || []).map(c => {
          let flags = '';
          if (c.name === pk) flags += ' [PK]';
          const fkObj = (meta.fks || []).find(f => f.column === c.name);
          if (fkObj) flags += ` [FK->${fkObj.references_table}.${fkObj.references_column}]`;
          return `    ${c.name} ${c.type}${flags}`;
        }).join('\n');
        return `[${status}] ${name} (${role})\n  PK: ${pk}${fks ? '\n  FKs: ' + fks : ''}\n  Columns:\n${cols}`;
      })
      .join('\n\n');

    const lineageMap = buildLineageMap(analysis);

    const crossRefs = (analysis.cross_sheet_refs || [])
      .map(r => `  ${r.from?.sheet || '?'} --[${r.logic_type || 'REF'}]--> ${r.to?.sheet || '?'}`)
      .join('\n');

    const strictRules = (blueprint.strict_rules || [])
      .map(r => {
        if (typeof r === 'object') {
          return `  [${r.severity}] ${r.rule_id}: ${r.rule} (Applies: ${(r.applies_to || []).join(', ')})`;
        }
        return `  ${r}`;
      })
      .join('\n');

    const execFlow = (blueprint.execution_flow || [])
      .map(s => `  Step ${s.step}: [${s.phase}] ${s.entity} - ${s.action}`)
      .join('\n');

    const phase1 = blueprint.phase_1_database;
    const phase1Text = phase1 ? `
Phase 1: Database Schema & Architecture
${(phase1.tables || []).map(t => {
  const note = t.engineering_note ? `\n  NOTE: ${t.engineering_note}` : '';
  return `  [${t.status}] ${t.entity_name}${note}\n  Columns: ${(t.columns || []).map(c => `${c.name}(${c.type}${c.is_pk ? ',PK' : ''})`).join(', ')}`;
}).join('\n\n')}

Relationships:
${(phase1.relationships || []).map(r => `  ${r.from_table}.${r.from_column} -> ${r.to_table}.${r.to_column} (${r.type})`).join('\n')}
` : 'Not generated.';

    const phase2 = blueprint.phase_2_logic;
    const phase2Text = phase2 ? `
Phase 2: Business Logic & Backend Code Mapping
${phase2.macro_warning ? `WARNING: ${phase2.macro_warning}\n` : ''}
Dependency Graph:
${(phase2.dependency_graph || []).map(rule => `  ${rule.source_table} -> ${rule.target_table} [${rule.logic_type}]\n    Formula: ${rule.raw_formula}\n    Implementation: ${rule.backend_implementation}`).join('\n\n')}
` : 'Not generated.';

    const phase3 = blueprint.phase_3_ui_ux;
    const phase3Text = phase3 ? `
Phase 3: UI/UX & Screen Mapping
${(phase3.screens || []).map(s => `  ${s.entity}: Route ${s.route}, Type: ${s.screen_type}, Role: ${s.functional_role}`).join('\n')}
` : 'Not generated.';

    const phase4 = blueprint.phase_4_auth;
    const phase4Text = phase4 ? `
Phase 4: Authentication & Access Control
  ${phase4.auth_note}
  Roles: ${(phase4.required_roles || []).map(r => `${r.role} (${r.permissions})`).join(', ')}
` : 'Not generated.';

    const phase5 = blueprint.phase_5_validation;
    const phase5Text = phase5 ? `
Phase 5: Data Validation & Edge Cases
${(phase5.entity_validations || []).map(v => `  ${v.entity}: ${(v.column_rules || []).map(cr => `${cr.column}(${cr.type}): ${cr.validation_rule}`).join(', ')}`).join('\n')}
` : 'Not generated.';

    const sqlSchema = analysis.sql_schema || 'Not generated';
    const pipelineCode = blueprint.pipeline_code || 'Not generated';
    const aiPrompt = blueprint.ai_ready_system_prompt_markdown || 'Not generated';

    return `
${'='.repeat(70)}
  SYNAPTO - COMPLETE AI-AGENT BLUEPRINT
  Excel -> WebApp Reverse Engineering Report
  File: ${analysis.file_name || 'Unknown'}
  Generated: ${new Date().toLocaleString()}
${'='.repeat(70)}

${CALCULATION_PIPELINE_CONTEXT}

${RESOLVED_CONTRADICTIONS}

${'-'.repeat(70)}
  SECTION 1: TABLES & METADATA
${'-'.repeat(70)}
${tablesSummary}

${'-'.repeat(70)}
  SECTION 2: DATA LINEAGE MAP (Table Relationships)
${'-'.repeat(70)}
${lineageMap}

${'-'.repeat(70)}
  SECTION 3: CROSS-SHEET DATA FLOW
${'-'.repeat(70)}
${crossRefs || '  No cross-sheet references detected.'}

${'-'.repeat(70)}
  SECTION 4: EXECUTION FLOW (Topological Sort)
${'-'.repeat(70)}
${execFlow || '  Not generated.'}

${'-'.repeat(70)}
  SECTION 5: STRICT ENGINEERING RULES
${'-'.repeat(70)}
${strictRules || '  None.'}

${'-'.repeat(70)}
  SECTION 6: DASHBOARD SUMMARY SCHEMA (Enriched)
${'-'.repeat(70)}
${DASHBOARD_SUMMARY_SCHEMA}

${'-'.repeat(70)}
  SECTION 7: 5-PHASE IMPLEMENTATION BLUEPRINT
${'-'.repeat(70)}
${phase1Text}

${phase2Text}

${phase3Text}

${phase4Text}

${phase5Text}

${'-'.repeat(70)}
  SECTION 8: SQL SCHEMA
${'-'.repeat(70)}
${sqlSchema}

${'-'.repeat(70)}
  SECTION 9: PIPELINE CODE (Python - 7 Steps)
${'-'.repeat(70)}
${pipelineCode}

${'-'.repeat(70)}
  SECTION 10: AI-READY SYSTEM PROMPT
${'-'.repeat(70)}
${aiPrompt}

${'-'.repeat(70)}
  SECTION 11: AI IMPLEMENTATION REPORT
${'-'.repeat(70)}
${aiReport || `This blueprint IS the AI-ready report. Copy the full report above (Sections 1-10) and paste it directly into your AI coding assistant as a system prompt.`}
`;
  }, [analysis, blueprint, aiReport]);

  const handleCopyFullReport = useCallback(() => {
    const text = buildFullBlueprintText();
    if (!text) { setError('Generate analysis and blueprint first.'); return; }
    copyReport(text);
  }, [buildFullBlueprintText, copyReport, setError]);

  const handlePrintFinalReport = useCallback(() => {
    const text = buildFullBlueprintText();
    if (!text) return;
    const win = window.open('', '_blank');
    win.document.write(`
      <html><head><title>Synapto Blueprint - ${analysis?.file_name || 'Report'}</title>
      <style>
        body { font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace; background: #0a0a0f; color: #e2e8f0; padding: 2rem; line-height: 1.7; font-size: 13px; white-space: pre-wrap; }
      </style></head><body>${text.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</body></html>
    `);
    win.document.close();
    win.print();
  }, [buildFullBlueprintText, analysis]);

  return { buildFullBlueprintText, handleCopyFullReport, handlePrintFinalReport, reportCopied };
}
