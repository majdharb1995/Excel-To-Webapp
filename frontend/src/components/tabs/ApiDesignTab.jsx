import { useAppContext } from '../../context/AppContext';

export default function ApiDesignTab() {
  const { blueprint, t } = useAppContext();

  return (
    <div className="architect-container">
      {!blueprint?.phase_6_api_design ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
          <p style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>{t('api.notGenerated')}</p>
          <p>{t('api.generateHint')}</p>
        </div>
      ) : (
        <>
          <div style={{ marginBottom: '1.5rem', padding: '1rem', background: 'rgba(0,212,255,0.05)', border: '1px solid rgba(0,212,255,0.2)', borderRadius: '8px' }}>
            <div style={{ fontSize: '0.9rem', color: 'var(--primary)', marginBottom: '0.5rem' }}>
              {t('api.baseUrl')}: <code>{blueprint.phase_6_api_design.api_base_url}</code>
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              {blueprint.phase_6_api_design.description}
            </div>
          </div>
          {(blueprint.phase_6_api_design.endpoints || []).map((group, gi) => (
            <div key={gi} style={{ marginBottom: '1.5rem' }}>
              <div style={{
                fontSize: '1rem', fontWeight: 700, color: '#e2e8f0',
                marginBottom: '0.75rem', paddingBottom: '0.5rem',
                borderBottom: '1px solid rgba(255,255,255,0.1)'
              }}>
                {group.entity === '__pipeline__' ? t('api.pipelineTrigger') :
                 group.entity === '__dashboard__' ? t('api.dashboard') :
                 `${t('api.entity')}: ${group.entity}`}
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: '0.5rem' }}>
                  {group.base_route}
                </span>
              </div>
              {(group.endpoints || []).map((ep, ei) => (
                <div key={ei} style={{
                  marginBottom: '0.75rem', padding: '0.75rem',
                  background: 'rgba(10,15,28,0.6)', border: '1px solid rgba(30,41,59,0.6)',
                  borderRadius: '8px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <span style={{
                      fontSize: '0.7rem', fontWeight: 700, padding: '2px 8px',
                      borderRadius: '4px', color: '#fff',
                      background: ep.method === 'GET' ? '#22c55e' :
                                 ep.method === 'POST' ? '#3b82f6' :
                                 ep.method === 'PUT' ? '#f59e0b' : '#ef4444'
                    }}>
                      {ep.method}
                    </span>
                    <code style={{ fontSize: '0.85rem', color: 'var(--primary)' }}>{ep.path}</code>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                    {ep.description}
                  </div>
                  {ep.request_body && (
                    <div style={{ marginBottom: '0.5rem' }}>
                      <div style={{ fontSize: '0.75rem', color: '#f59e0b', marginBottom: '0.25rem' }}>{t('api.requestBody')}</div>
                      <pre style={{ fontSize: '0.75rem', color: '#94a3b8', background: 'rgba(0,0,0,0.3)', padding: '0.5rem', borderRadius: '4px', overflow: 'auto' }}>
                        {JSON.stringify(ep.request_body, null, 2)}
                      </pre>
                    </div>
                  )}
                  {ep.response_body && (
                    <div>
                      <div style={{ fontSize: '0.75rem', color: '#22c55e', marginBottom: '0.25rem' }}>{t('api.responseBody')}</div>
                      <pre style={{ fontSize: '0.75rem', color: '#94a3b8', background: 'rgba(0,0,0,0.3)', padding: '0.5rem', borderRadius: '4px', overflow: 'auto' }}>
                        {JSON.stringify(ep.response_body, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              ))}
              {group.notes && (
                <div style={{ fontSize: '0.75rem', color: 'var(--warning)', marginTop: '0.5rem' }}>
                  {t('api.note')}: {group.notes}
                </div>
              )}
            </div>
          ))}
        </>
      )}
    </div>
  );
}
