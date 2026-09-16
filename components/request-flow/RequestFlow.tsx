'use client';
import { useSimulation } from '@/context/SimulationContext';
import { RequestEntry } from '@/lib/simulation/types';

const STEPS = ['User', 'Load Balancer', 'API Instance', 'Cache', 'Queue', 'Worker', 'Database', 'Response'];

export default function RequestFlow() {
  const { state } = useSimulation();
  const latestReqs = state.requestFeed.slice(0, 20);

  const featured = latestReqs[0];

  return (
    <div style={{ display: 'flex', gap: '12px', maxWidth: '1400px' }}>
      {/* Featured request journey */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div>
          <div className="text-label" style={{ color: 'var(--text-muted)' }}>REQUEST FLOW VISUALIZER</div>
          <h1 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', marginTop: '2px' }}>Individual Request Journey</h1>
        </div>
        {featured ? (
          <div className="panel" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <div>
                <div className="text-label" style={{ marginBottom: '2px' }}>Request ID</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '16px', fontWeight: 700, color: 'var(--accent-cyan)', letterSpacing: '0.05em' }}>
                  #{featured.id}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <span className={`badge badge-${featured.status === 'SUCCESS' ? 'ok' : featured.status === 'RETRYING' ? 'warn' : 'error'}`}>
                  {featured.status}
                </span>
                {featured.cacheHit && <span className="badge badge-cyan">CACHE HIT</span>}
              </div>
            </div>

            {/* Journey steps */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
              {STEPS.map((step, i) => {
                const isActive = i === STEPS.length - 1 && featured.status === 'SUCCESS';
                const isFailed = featured.status === 'FAILED' && i === 4;
                const isRetry = featured.status === 'RETRYING' && i === 4;
                const stepDetail = getStepDetail(step, featured);
                return (
                  <div key={step} style={{ display: 'flex', alignItems: 'stretch', gap: '16px' }}>
                    {/* Connector */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '24px', flexShrink: 0 }}>
                      <div style={{
                        width: '10px', height: '10px', borderRadius: '50%', flexShrink: 0,
                        background: isFailed ? 'var(--status-error)' : isRetry ? 'var(--status-warn)' : 'var(--accent-cyan)',
                        border: `2px solid ${isFailed ? 'rgba(239,68,68,0.3)' : 'rgba(6,182,212,0.3)'}`,
                        marginTop: '12px',
                      }} />
                      {i < STEPS.length - 1 && (
                        <div style={{ width: '1px', flex: 1, background: 'var(--border)', minHeight: '20px' }} />
                      )}
                    </div>
                    {/* Step content */}
                    <div style={{ flex: 1, padding: '10px 0', borderBottom: i < STEPS.length - 1 ? '1px solid var(--border)' : 'none' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', fontWeight: 600, color: isFailed ? 'var(--status-error)' : isRetry ? 'var(--status-warn)' : 'var(--text-primary)', letterSpacing: '0.03em' }}>
                          {step}
                        </span>
                        {stepDetail.time && (
                          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-muted)' }}>
                            +{stepDetail.time}ms
                          </span>
                        )}
                      </div>
                      {stepDetail.sub && (
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' }}>
                          {stepDetail.sub}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div style={{ marginTop: '16px', padding: '12px', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-sm)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div className="text-label" style={{ marginBottom: '2px' }}>Total Latency</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '20px', fontWeight: 700, color: featured.latency > 300 ? 'var(--status-error)' : featured.latency > 150 ? 'var(--status-warn)' : 'var(--status-ok)' }}>
                  {featured.latency} ms
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div className="text-label" style={{ marginBottom: '2px' }}>Worker</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--accent-cyan)' }}>{featured.workerId}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div className="text-label" style={{ marginBottom: '2px' }}>API</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--accent-blue)' }}>{featured.apiInstance}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div className="text-label" style={{ marginBottom: '2px' }}>Path</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-secondary)' }}>{featured.path}</div>
              </div>
            </div>
          </div>
        ) : (
          <div className="panel" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '11px' }}>
            Waiting for requests...
          </div>
        )}
      </div>

      {/* Live feed */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div className="panel" style={{ flex: 1, padding: '16px', overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span className="text-label">Live Request Feed</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--accent-cyan)' }}>
              {state.totalRequests.toLocaleString()} total
            </span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', overflow: 'auto', maxHeight: '600px' }}>
            {latestReqs.map((req, i) => (
              <RequestRow key={req.id} req={req} index={i} />
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="panel" style={{ padding: '16px' }}>
          <div className="text-label" style={{ marginBottom: '10px' }}>Session Summary</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <MiniStat label="Total" value={state.totalRequests.toLocaleString()} color="var(--text-primary)" />
            <MiniStat label="Successful" value={state.successfulRequests.toLocaleString()} color="var(--status-ok)" />
            <MiniStat label="Failed" value={state.queueFailed.toString()} color="var(--status-error)" />
            <MiniStat label="Cache Hits" value={`${Math.round(state.cacheHitRate * 100)}%`} color="var(--accent-cyan)" />
          </div>
        </div>
      </div>
    </div>
  );
}

function getStepDetail(step: string, req: RequestEntry): { time?: number; sub?: string } {
  switch (step) {
    case 'User': return { sub: 'HTTP/2 request initiated' };
    case 'Load Balancer': return { time: 1, sub: 'Round-robin routing' };
    case 'API Instance': return { time: 5, sub: `${req.apiInstance} — request parsing` };
    case 'Cache': return { time: req.cacheHit ? 1 : 8, sub: req.cacheHit ? 'HIT — data served from Redis' : 'MISS — fetching from database' };
    case 'Queue': return { time: 3, sub: 'Async job enqueued' };
    case 'Worker': return { time: Math.round(req.latency * 0.5), sub: `${req.workerId} — job processing` };
    case 'Database': return { time: req.cacheHit ? 0 : 12, sub: req.cacheHit ? 'Skipped (cache hit)' : 'PostgreSQL query' };
    case 'Response': return { sub: `${req.status} · ${req.latency}ms total` };
    default: return {};
  }
}

function RequestRow({ req, index }: { req: RequestEntry; index: number }) {
  const color = req.status === 'SUCCESS' ? 'var(--status-ok)' : req.status === 'RETRYING' ? 'var(--status-warn)' : 'var(--status-error)';
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '8px', padding: '5px 8px',
      background: index === 0 ? 'var(--bg-elevated)' : 'transparent',
      borderRadius: 'var(--radius-sm)',
      border: index === 0 ? '1px solid var(--border)' : '1px solid transparent',
      fontFamily: 'var(--font-mono)', fontSize: '10px',
      animation: index === 0 ? 'fadeSlideIn 0.2s ease' : 'none',
    }}>
      <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: color, flexShrink: 0 }} />
      <span style={{ color: 'var(--accent-cyan)', minWidth: '90px' }}>{req.id}</span>
      <span style={{ color: 'var(--text-secondary)', flex: 1 }}>{req.path}</span>
      <span style={{ color, minWidth: '50px' }}>{req.status}</span>
      <span style={{ color: req.latency > 300 ? 'var(--status-error)' : 'var(--text-muted)', minWidth: '48px', textAlign: 'right' }}>{req.latency}ms</span>
      {req.cacheHit && <span style={{ color: 'var(--accent-cyan)', fontSize: '8px' }}>CACHE</span>}
    </div>
  );
}

function MiniStat({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '8px 10px' }}>
      <div className="text-label" style={{ marginBottom: '3px' }}>{label}</div>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '14px', fontWeight: 600, color }}>{value}</div>
    </div>
  );
}
