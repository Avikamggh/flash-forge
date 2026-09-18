'use client';
import { useState } from 'react';
import { useSimulation } from '@/context/SimulationContext';
import { RequestEntry } from '@/lib/simulation/types';
import {
  Send,
  GitBranch,
  User,
  Network,
  Server,
  Zap,
  Layers,
  Cpu,
  Database,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight,
  Filter
} from 'lucide-react';

const TEST_PAYLOADS = [
  {
    name: 'Flash Deal View (Cache Hit)',
    path: '/api/v1/flash-deals/macbook-m3-pro',
    cacheHit: true,
    latency: 3,
    type: 'READ',
    desc: 'Served directly from Redis in memory. Zero database load.'
  },
  {
    name: 'Place Flash Order (Queue Buffer)',
    path: '/api/v1/orders/flash-checkout',
    cacheHit: false,
    latency: 38,
    type: 'WRITE',
    desc: 'Queued into BullMQ/Kafka buffer, offloaded to worker cluster.'
  },
  {
    name: 'Payment Execution (DB Lock)',
    path: '/api/v1/payments/stripe-intent',
    cacheHit: false,
    latency: 74,
    type: 'TRANSACTION',
    desc: 'Requires ACID transaction & inventory decrement on PostgreSQL.'
  },
  {
    name: 'Stock Check (Read Replica)',
    path: '/api/v1/inventory/realtime-count',
    cacheHit: false,
    latency: 14,
    type: 'REPLICA',
    desc: 'Absorbed by PostgreSQL read replica without primary node load.'
  },
];

const STEPS = [
  { name: 'User', icon: User },
  { name: 'Load Balancer', icon: Network },
  { name: 'API Instance', icon: Server },
  { name: 'Cache', icon: Zap },
  { name: 'Queue', icon: Layers },
  { name: 'Worker', icon: Cpu },
  { name: 'Database', icon: Database },
  { name: 'Response', icon: CheckCircle2 },
];

export default function RequestFlow() {
  const { state, dispatch, guideMode } = useSimulation();
  const [selectedPayloadIdx, setSelectedPayloadIdx] = useState(0);
  const [isInjecting, setIsInjecting] = useState(false);
  const [activeHop, setActiveHop] = useState<number | null>(null);

  const latestReqs = state.requestFeed.slice(0, 20);
  const featured = latestReqs[0];

  const handleSendInteractiveRequest = () => {
    const payload = TEST_PAYLOADS[selectedPayloadIdx];
    setIsInjecting(true);
    setActiveHop(0);

    // Animate hop-by-hop
    const hopInterval = setInterval(() => {
      setActiveHop(prev => {
        if (prev === null || prev >= STEPS.length - 1) {
          clearInterval(hopInterval);
          setIsInjecting(false);

          // Inject into simulation feed
          const healthyApi = state.apiInstances.find(i => i.status === 'healthy')?.name || 'api-1';
          const healthyWorker = state.workerInstances.find(w => w.status === 'healthy')?.name || 'worker-1';
          const req: RequestEntry = {
            id: `req-${Math.floor(100000 + Math.random() * 900000)}`,
            tick: state.tick,
            status: 'SUCCESS',
            latency: payload.latency + Math.floor(Math.random() * 6),
            workerId: healthyWorker,
            apiInstance: healthyApi,
            cacheHit: payload.cacheHit,
            path: payload.path,
          };
          dispatch({ type: 'INJECT_REQUEST', req });
          return null;
        }
        return prev + 1;
      });
    }, 120);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', maxWidth: '1400px' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="text-label" style={{ color: 'var(--accent-cyan)' }}>DISTRIBUTED TRACING & HOP TELEMETRY</span>
            <span className="badge badge-cyan" style={{ fontSize: '8px' }}>E2E LATENCY</span>
          </div>
          <h1 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-primary)', marginTop: '2px' }}>
            Individual Request Journey & Flow Tracer
          </h1>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="badge badge-ok">{state.totalRequests.toLocaleString()} Total Handled</span>
        </div>
      </div>

      {/* Guide Mode Card */}
      {guideMode && (
        <div className="guide-card">
          <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '6px', background: 'rgba(6,182,212,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <GitBranch size={16} color="var(--accent-cyan)" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Trace Hop-by-Hop: How a single packet travels
                </span>
                <span className="analogy-pill">Postal Tracking Analogy</span>
              </div>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                Just like tracking an express courier package through sorting centers, every user click hops through 8 microservice checkpoints:
                <strong> Browser ➔ Cloudflare/LB ➔ API Gateway ➔ Redis Cache (fast exit if hit) ➔ Queue Buffer ➔ Worker ➔ Database ➔ Confirmation.</strong>
                Use the interactive tool below to send a live test request and watch it hop!
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Interactive Request Playground Bar */}
      <div className="panel" style={{ padding: '16px 20px', background: 'linear-gradient(90deg, rgba(6,182,212,0.06), rgba(59,130,246,0.03))' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Send size={16} color="var(--accent-cyan)" />
            <div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)' }}>
                Interactive Request Generator
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'var(--text-muted)' }}>
                Choose a payload scenario and trace its journey live
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {TEST_PAYLOADS.map((payload, idx) => (
              <button
                key={idx}
                className="btn btn-outline"
                style={{
                  fontSize: '9.5px',
                  padding: '6px 12px',
                  borderColor: selectedPayloadIdx === idx ? 'var(--accent-cyan)' : 'var(--border-accent)',
                  background: selectedPayloadIdx === idx ? 'rgba(6,182,212,0.15)' : 'transparent',
                  color: selectedPayloadIdx === idx ? 'var(--accent-cyan)' : 'var(--text-secondary)',
                }}
                onClick={() => setSelectedPayloadIdx(idx)}
              >
                {payload.name}
              </button>
            ))}
          </div>

          <button
            className="btn btn-primary"
            onClick={handleSendInteractiveRequest}
            disabled={isInjecting}
            style={{
              fontSize: '11px',
              padding: '8px 18px',
              background: 'linear-gradient(135deg, #06b6d4, #3b82f6)',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <Sparkles size={12} fill="#fff" />
            <span>{isInjecting ? 'TRACING HOP...' : 'SEND & TRACE LIVE'}</span>
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
        {/* Featured Request Journey */}
        <div style={{ flex: 1, minWidth: '380px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {featured ? (
            <div className="panel" style={{ padding: '22px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '22px', borderBottom: '1px solid var(--border)', paddingBottom: '14px' }}>
                <div>
                  <div className="text-label" style={{ marginBottom: '4px' }}>Inspected Trace</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '18px', fontWeight: 800, color: 'var(--accent-cyan)', letterSpacing: '0.04em' }}>
                    #{featured.id}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <span className={`badge badge-${featured.status === 'SUCCESS' ? 'ok' : featured.status === 'RETRYING' ? 'warn' : 'error'}`}>
                    {featured.status}
                  </span>
                  {featured.cacheHit ? (
                    <span className="badge badge-ok">CACHE HIT (&lt;3ms)</span>
                  ) : (
                    <span className="badge badge-warn">CACHE MISS</span>
                  )}
                </div>
              </div>

              {/* Journey Hop Steps */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                {STEPS.map((stepObj, i) => {
                  const step = stepObj.name;
                  const StepIcon = stepObj.icon;
                  const isHighlighted = activeHop === i;
                  const isPassed = activeHop !== null ? i < activeHop : true;
                  const isFailed = featured.status === 'FAILED' && i === 4;
                  const isRetry = featured.status === 'RETRYING' && i === 4;
                  const stepDetail = getStepDetail(step, featured);

                  return (
                    <div
                      key={step}
                      style={{
                        display: 'flex',
                        alignItems: 'stretch',
                        gap: '16px',
                        background: isHighlighted ? 'rgba(6,182,212,0.1)' : 'transparent',
                        borderRadius: '4px',
                        padding: '2px 6px',
                        transition: 'background 0.2s'
                      }}
                    >
                      {/* Step node & vertical connector */}
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '28px', flexShrink: 0 }}>
                        <div style={{
                          width: '24px',
                          height: '24px',
                          borderRadius: '50%',
                          flexShrink: 0,
                          background: isFailed
                            ? 'var(--status-error)'
                            : isRetry
                              ? 'var(--status-warn)'
                              : isHighlighted
                                ? 'var(--accent-cyan)'
                                : 'var(--bg-elevated)',
                          border: `2px solid ${isHighlighted ? '#22d3ee' : isFailed ? 'rgba(239,68,68,0.5)' : 'var(--border-accent)'}`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          marginTop: '8px',
                          boxShadow: isHighlighted ? '0 0 12px rgba(6,182,212,0.8)' : 'none',
                          transition: 'all 0.2s ease'
                        }}>
                          <StepIcon size={12} color={isHighlighted ? '#000' : 'var(--text-primary)'} />
                        </div>
                        {i < STEPS.length - 1 && (
                          <div style={{ width: '2px', flex: 1, background: isPassed ? 'rgba(6,182,212,0.4)' : 'var(--border)', minHeight: '24px' }} />
                        )}
                      </div>

                      {/* Step content */}
                      <div style={{ flex: 1, padding: '10px 0', borderBottom: i < STEPS.length - 1 ? '1px solid var(--border)' : 'none' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span style={{
                            fontFamily: 'var(--font-mono)',
                            fontSize: '12px',
                            fontWeight: 700,
                            color: isFailed ? 'var(--status-error)' : isHighlighted ? 'var(--accent-cyan)' : 'var(--text-primary)',
                            letterSpacing: '0.03em'
                          }}>
                            {step}
                          </span>
                          {stepDetail.time !== undefined && (
                            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: isHighlighted ? 'var(--accent-cyan)' : 'var(--text-muted)', fontWeight: 600 }}>
                              +{stepDetail.time} ms
                            </span>
                          )}
                        </div>
                        {stepDetail.sub && (
                          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-muted)', marginTop: '3px' }}>
                            {stepDetail.sub}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Bottom Summary Pill */}
              <div style={{ marginTop: '20px', padding: '14px 18px', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                <div>
                  <div className="text-label" style={{ marginBottom: '2px' }}>Total Round-Trip Latency</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '22px', fontWeight: 800, color: featured.latency > 300 ? 'var(--status-error)' : featured.latency > 150 ? 'var(--status-warn)' : 'var(--status-ok)' }}>
                    {featured.latency} ms
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div className="text-label" style={{ marginBottom: '2px' }}>Assigned Worker</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--accent-cyan)', fontWeight: 600 }}>{featured.workerId}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div className="text-label" style={{ marginBottom: '2px' }}>API Pod</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--accent-blue)', fontWeight: 600 }}>{featured.apiInstance}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div className="text-label" style={{ marginBottom: '2px' }}>Route Path</div>
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

        {/* Live Feed & Telemetry Column */}
        <div style={{ flex: 1, minWidth: '340px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div className="panel" style={{ flex: 1, padding: '18px', overflow: 'hidden' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Clock size={13} color="var(--accent-cyan)" />
                <span className="text-label">Live Incoming Stream</span>
              </div>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--accent-cyan)', fontWeight: 700 }}>
                {state.totalRequests.toLocaleString()} captured
              </span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', overflowY: 'auto', maxHeight: '480px' }}>
              {latestReqs.map((req, i) => (
                <RequestRow key={req.id} req={req} index={i} />
              ))}
            </div>
          </div>

          {/* Session Overview Summary */}
          <div className="panel" style={{ padding: '16px' }}>
            <div className="text-label" style={{ marginBottom: '12px' }}>Telemetry Summary</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <MiniStat label="Total Processed" value={state.totalRequests.toLocaleString()} color="var(--text-primary)" />
              <MiniStat label="Successful (200 OK)" value={state.successfulRequests.toLocaleString()} color="var(--status-ok)" />
              <MiniStat label="Queue Dropped (503)" value={state.queueFailed.toString()} color="var(--status-error)" />
              <MiniStat label="Cache Hit Ratio" value={`${Math.round(state.cacheHitRate * 100)}%`} color="var(--accent-cyan)" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function getStepDetail(step: string, req: RequestEntry): { time?: number; sub?: string } {
  switch (step) {
    case 'User': return { time: 0, sub: 'HTTP/2 connection established from client browser' };
    case 'Load Balancer': return { time: 1, sub: 'Layer 7 TLS termination & least-conn routing' };
    case 'API Instance': return { time: 4, sub: `${req.apiInstance} — token verification & schema parse` };
    case 'Cache': return {
      time: req.cacheHit ? 1 : 6,
      sub: req.cacheHit ? 'CACHE HIT: Response served instantly from Redis in 1ms' : 'CACHE MISS: Key not in memory, querying storage tier'
    };
    case 'Queue': return { time: 3, sub: 'Async job enqueued with priority header' };
    case 'Worker': return { time: Math.round(req.latency * 0.45), sub: `${req.workerId} — transaction compute & payment processing` };
    case 'Database': return {
      time: req.cacheHit ? 0 : 10,
      sub: req.cacheHit ? 'Skipped completely (Offloaded to Redis)' : 'PostgreSQL write transaction & row lock'
    };
    case 'Response': return { time: 1, sub: `${req.status} status return · total round-trip complete` };
    default: return {};
  }
}

function RequestRow({ req, index }: { req: RequestEntry; index: number }) {
  const color = req.status === 'SUCCESS' ? 'var(--status-ok)' : req.status === 'RETRYING' ? 'var(--status-warn)' : 'var(--status-error)';
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 10px',
      background: index === 0 ? 'rgba(6,182,212,0.08)' : 'var(--bg-elevated)',
      borderRadius: 'var(--radius-sm)',
      border: index === 0 ? '1px solid rgba(6,182,212,0.3)' : '1px solid var(--border)',
      fontFamily: 'var(--font-mono)', fontSize: '10px',
      animation: index === 0 ? 'fadeSlideIn 0.2s ease' : 'none',
    }}>
      <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: color, flexShrink: 0 }} />
      <span style={{ color: 'var(--accent-cyan)', minWidth: '85px', fontWeight: 600 }}>{req.id}</span>
      <span style={{ color: 'var(--text-secondary)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {req.path}
      </span>
      <span style={{ color, minWidth: '45px', fontWeight: 600 }}>{req.status}</span>
      <span style={{ color: req.latency > 300 ? 'var(--status-error)' : 'var(--text-muted)', minWidth: '42px', textAlign: 'right' }}>
        {req.latency}ms
      </span>
      {req.cacheHit && (
        <span style={{ color: 'var(--accent-cyan)', fontSize: '8px', padding: '1px 4px', background: 'rgba(6,182,212,0.15)', borderRadius: '2px' }}>
          HIT
        </span>
      )}
    </div>
  );
}

function MiniStat({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '10px 12px' }}>
      <div className="text-label" style={{ marginBottom: '3px', fontSize: '8px' }}>{label}</div>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '14px', fontWeight: 700, color }}>{value}</div>
    </div>
  );
}
