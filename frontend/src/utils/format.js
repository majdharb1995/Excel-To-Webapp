/**
 * Build a text-based lineage map from analysis data.
 * Used by the blueprint text builder.
 */
export function buildLineageMap(analysis) {
  if (!analysis) return 'No analysis data available.';

  const tables = analysis.tables_metadata || {};
  const refs = analysis.cross_sheet_refs || [];
  const lines = [];

  // FK Relationships
  Object.entries(tables).forEach(([tableName, tableData]) => {
    if (tableData.fks && tableData.fks.length > 0) {
      tableData.fks.forEach(fk => {
        lines.push(`  [FK]  ${fk.references_table}.${fk.references_column || 'id'} ===> ${tableName}.${fk.column}`);
      });
    }
  });

  // Cross-sheet formula relationships
  refs.forEach(ref => {
    const from = ref.from?.sheet || ref.source || '?';
    const to = ref.to?.sheet || ref.target || '?';
    const logic = ref.logic_type || 'REF';
    lines.push(`  [${logic}]  ${from} ===> ${to}  (${ref.raw_formula || 'formula'})`);
  });

  return lines.length > 0 ? lines.join('\n') : '  No relationships detected.';
}
