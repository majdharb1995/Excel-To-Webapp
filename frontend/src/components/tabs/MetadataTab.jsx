import { useAppContext } from '../../context/AppContext';

export default function MetadataTab() {
  const { tablesMeta, t } = useAppContext();
  const tableNames = Object.keys(tablesMeta);

  return (
    <div className="sheet-grid">
      {tableNames.map((tName) => {
        const meta = tablesMeta[tName];
        const isMatrix = meta.status === 'Flat_Calculation_Matrix';
        return (
          <div key={tName} className="sheet-card">
            <h3>
              <span className="type-badge">
                {isMatrix ? t('meta.flatMatrix') : t('meta.entity')}
              </span>
              {tName}
            </h3>
            <table className="metadata-table">
              <thead>
                <tr>
                  <th>{t('meta.column')}</th>
                  <th>{t('meta.type')}</th>
                  <th>{t('meta.constraints')}</th>
                </tr>
              </thead>
              <tbody>
                {(meta.columns || []).map((c, i) => {
                  const isPK = c.name === (meta.pk || 'id');
                  const fkObj = (meta.fks || []).find((f) => f.column === c.name);
                  return (
                    <tr key={i}>
                      <td>
                        {c.name}
                        {isPK && <span className="constraint-badge pk-badge"> PK</span>}
                        {fkObj && (
                          <span className="constraint-badge fk-badge">
                            {' '}FK&rarr;{fkObj.references_table}.{fkObj.references_column}
                          </span>
                        )}
                      </td>
                      <td><span className="type-badge">{c.type}</span></td>
                      <td>
                        {isPK && <span className="constraint-badge pk-badge">PRIMARY KEY</span>}
                        {fkObj && <span className="constraint-badge fk-badge">FOREIGN KEY</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {isMatrix && (
              <div style={{ marginTop: '0.75rem', padding: '0.5rem', background: 'rgba(34,197,94,0.08)', borderRadius: '4px', fontSize: '0.8rem', color: 'var(--accent-green)' }}>
                {t('meta.jsonNote')}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
