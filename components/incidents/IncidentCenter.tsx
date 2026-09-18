'use client';
import { useState, useEffect } from 'react';
import { useSimulation } from '@/context/SimulationContext';
import { severityColor, formatTime } from '@/lib/utils/format';
import { playChaosSound } from '@/lib/utils/sounds';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';
import { 
  ShieldAlert, 
  Flame, 
  Zap, 
  RotateCcw, 
  CheckCircle2, 
  AlertTriangle, 
  Server, 
  Activity, 
  Terminal, 
  Info,
  Layers,
  Database,
  RefreshCw
} from 'lucide-react';

export default function IncidentCenter() {
  const { state, dispatch, guideMode } = useSimulation();
  const [activeChaosVector, setActiveChaosVector] = useState<string | null>(null);

  const chaosWorker = state.workerInstances.find(w => w.status === 'failed');
  const healthyWorkers = state.workerInstances.filter(w => w.status === 'healthy').length;
  const provisioningWorkers = state.workerInstances.filter(w => w.status === 'provisioning').length;

  const triggerChaos = (type: 'CHAOS_TEST' | 'CHAOS_SPIKE' | 'CHAOS_CACHE_PURGE', name: string) => {
    playChaosSound();
    setActiveChaosVector(name);
    dispatch({ type });
    setTimeout(() => setActiveChaosVector(null), 5000);
  };

  // Determine current active recovery step based on state
  const getCurrentRecoveryStep = () => {
    if (chaosWorker) return 3; // Load balancer rerouting / worker failed
    if (provisioningWorkers > 0) return 6; // Provisioning replacement
    if (state.queueRetrying > 0) return 5; // Retrying requests
    if (state.errorRate > 0.05) return 2; // Health check alerting
    return 8; // Stable
  };

  const activeStep = getCurrentRecoveryStep();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', maxWidth: '1400px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div className="text-label" style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <ShieldAlert size={12} color="var(--status-error)" />
            INCIDENT OPERATIONS & CHAOS ENGINEERING LAB
          </div>
          <h1 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', marginTop: '2px' }}>
            Resilience Testing & Automated Self-Healing
          </h1>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <span className="badge badge-red" style={{ fontSize: '9px', padding: '4px 10px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Activity size={10} /> LIVE TELEMETRY LOGS
          </span>
        </div>
      </div>

      {/* Guide Mode Explainer */}
      {guideMode && (
        <div className="guide-card animate-fade-in">
          <div className="guide-title">
            <Info size={14} color="var(--accent-cyan)" />
            Beginner Analogy: The Skyscraper Fire Drill & Self-Healing Circuits
          </div>
          <div className="guide-body">
            <strong>Why Break Things on Purpose?</strong> In a traditional company, engineers pray their servers won&apos;t fail during a flash sale. In modern cloud architecture (like Netflix or Amazon), we practice <em>Chaos Engineering</em>—intentionally pulling server plugs and throwing sudden traffic spikes during normal hours. This proves our self-healing algorithms and retry queues can automatically recover in seconds without humans panicking.
          </div>
        </div>
      )}

      {/* Main 2-column layout */}
      <div style={{ display: 'flex', gap: '14px' }}>
        {/* Left: incident feed and health charts */}
        <div style={{ flex: 2, display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {/* Top Metrics Row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
            <div className="panel" style={{ padding: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <div className="text-label">Live Error Rate</div>
                <AlertTriangle size={14} color={state.errorRate > 0.05 ? 'var(--status-error)' : 'var(--status-ok)'} />
              </div>
              <ResponsiveContainer width="100%" height={50}>
                <AreaChart data={state.errorHistory.map((v, i) => ({ t: i, v }))} margin={{ top: 2, right: 0, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="errGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Area type="monotone" dataKey="v" stroke="#ef4444" strokeWidth={1.5} fill="url(#errGrad)" dot={false} isAnimationActive={false} />
                </AreaChart>
              </ResponsiveContainer>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '20px', fontWeight: 700, color: state.errorRate > 0.05 ? 'var(--status-error)' : 'var(--status-ok)', marginTop: '4px' }}>
                {(state.errorRate * 100).toFixed(2)}%
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'var(--text-muted)' }}>
                {state.errorRate > 0.05 ? 'Circuit breaker engaged' : 'Within normal operational limits'}
              </div>
            </div>

            <div className="panel" style={{ padding: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <div className="text-label">Dead-Letter / Retrying</div>
                <RotateCcw size={14} color="var(--accent-cyan)" />
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '24px', fontWeight: 700, color: state.queueFailed > 0 ? 'var(--status-error)' : 'var(--text-primary)' }}>
                {state.queueFailed.toLocaleString()}
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-muted)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span className="status-dot cyan" />
                {state.queueRetrying} requests currently retrying
              </div>
            </div>

            <div className="panel" style={{ padding: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <div className="text-label">SLA Availability</div>
                <CheckCircle2 size={14} color="var(--status-ok)" />
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '24px', fontWeight: 700, color: 'var(--status-ok)' }}>
                {state.totalRequests > 0 ? ((state.successfulRequests / state.totalRequests) * 100).toFixed(2) : '100.00'}%
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-muted)', marginTop: '4px' }}>
                SLO Commitment: 99.90%
              </div>
            </div>
          </div>

          {/* Event Timeline */}
          <div className="panel" style={{ flex: 1, padding: '16px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Terminal size={14} color="var(--accent-cyan)" />
                <span className="text-label">Live Incident & Resilience Audit Log</span>
              </div>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'var(--text-muted)' }}>
                {state.incidents.length} events logged
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', overflowY: 'auto', maxHeight: '420px', paddingRight: '4px' }}>
              {state.incidents.map((inc, i) => (
                <div
                  key={inc.id}
                  style={{
                    display: 'flex', alignItems: 'flex-start', gap: '10px', padding: '10px 12px',
                    background: i === 0 ? 'var(--bg-elevated)' : 'rgba(255,255,255,0.01)',
                    borderRadius: 'var(--radius-sm)',
                    border: `1px solid ${i === 0 ? 'var(--border-accent)' : 'var(--border)'}`,
                  }}
                >
                  <div style={{
                    width: '8px', height: '8px', borderRadius: '50%', flexShrink: 0,
                    background: severityColor(inc.severity),
                    boxShadow: i === 0 ? `0 0 8px ${severityColor(inc.severity)}` : 'none',
                    marginTop: '4px',
                  }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-primary)', lineHeight: 1.4 }}>
                      {inc.message}
                    </div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'var(--text-muted)', marginTop: '3px' }}>
                      <ClientIncidentTime timestamp={inc.timestamp} /> · {inc.id}
                    </div>
                  </div>
                  <span className={`badge badge-${inc.severity === 'info' ? 'info' : inc.severity === 'warning' ? 'warn' : inc.severity === 'critical' ? 'error' : 'ok'}`} style={{ fontSize: '8px', flexShrink: 0 }}>
                    {inc.severity.toUpperCase()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Chaos injection controls and self-healing sequence */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {/* Chaos Injection Lab */}
          <div className="panel" style={{ padding: '18px', border: '1px solid rgba(239,68,68,0.3)', background: 'linear-gradient(180deg, var(--bg-surface) 0%, rgba(239,68,68,0.04) 100%)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <Flame size={16} color="var(--status-warn)" />
              <span className="text-label" style={{ color: 'var(--status-warn)' }}>INJECT CHAOS VECTOR</span>
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-muted)', marginBottom: '14px', lineHeight: '1.5' }}>
              Simulate sudden production disasters. Test FlashForge automated fault-isolation and recovery mechanisms.
            </div>

            {chaosWorker && (
              <div style={{ padding: '10px 12px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '4px', marginBottom: '12px' }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--status-error)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <AlertTriangle size={12} /> {chaosWorker.name} TERMINATED
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                  Health checks failed. Traffic rerouted to {healthyWorkers} healthy nodes. Replacement provisioning...
                </div>
              </div>
            )}

            {/* 3 Chaos Buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <button
                className="btn btn-danger"
                style={{ width: '100%', justifyContent: 'flex-start', fontSize: '10px', padding: '10px 12px' }}
                onClick={() => triggerChaos('CHAOS_TEST', 'Worker Failure')}
              >
                <Server size={13} style={{ marginRight: '8px' }} />
                <span>KILL RANDOM WORKER NODE</span>
              </button>

              <button
                className="btn btn-outline"
                style={{ width: '100%', justifyContent: 'flex-start', fontSize: '10px', padding: '10px 12px', borderColor: 'rgba(245,158,11,0.5)', color: 'var(--status-warn)' }}
                onClick={() => triggerChaos('CHAOS_SPIKE', 'Traffic Hammer Spike')}
              >
                <Zap size={13} style={{ marginRight: '8px' }} />
                <span>INJECT +8,000 REQ/S SURGE HAMMER</span>
              </button>

              <button
                className="btn btn-outline"
                style={{ width: '100%', justifyContent: 'flex-start', fontSize: '10px', padding: '10px 12px', borderColor: 'rgba(6,182,212,0.5)', color: 'var(--accent-cyan)' }}
                onClick={() => triggerChaos('CHAOS_CACHE_PURGE', 'Cache Eviction')}
              >
                <Database size={13} style={{ marginRight: '8px' }} />
                <span>PURGE REDIS CACHE (COLD STAMPEDE)</span>
              </button>
            </div>

            {activeChaosVector && (
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'var(--status-warn)', textAlign: 'center', marginTop: '10px' }}>
                ⚡ Vector active: {activeChaosVector}. Monitoring self-healing response...
              </div>
            )}
          </div>

          {/* Automated Self-Healing Runbook */}
          <div className="panel" style={{ padding: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <RefreshCw size={13} color="var(--accent-cyan)" />
                <span className="text-label">Self-Healing Runbook</span>
              </div>
              <span className="badge badge-cyan" style={{ fontSize: '8px' }}>AUTOMATED</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {[
                { step: 1, label: 'Failure injected / traffic anomalous', status: activeStep >= 1 ? 'done' : 'idle' },
                { step: 2, label: 'Sub-second health checks alert', status: activeStep >= 2 ? 'done' : 'idle' },
                { step: 3, label: 'Load Balancer isolates bad node', status: activeStep >= 3 ? 'done' : 'idle' },
                { step: 4, label: 'Requests safely buffered in queue', status: activeStep >= 4 ? 'done' : 'idle' },
                { step: 5, label: 'Exponential backoff retry kicks in', status: activeStep >= 5 ? 'done' : 'idle' },
                { step: 6, label: 'Kubernetes/HPA spins up replacement', status: activeStep >= 6 ? 'done' : 'idle' },
                { step: 7, label: 'Replacement passes readiness probe', status: activeStep >= 7 ? 'done' : 'idle' },
                { step: 8, label: 'Backlog fully drained, SLA restored', status: activeStep >= 8 ? 'done' : 'idle' },
              ].map(({ step, label, status }) => {
                const isCurrent = activeStep === step;
                return (
                  <div
                    key={step}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '10px', padding: '6px 8px',
                      borderRadius: '4px',
                      background: isCurrent ? 'rgba(6,182,212,0.1)' : 'transparent',
                      border: isCurrent ? '1px solid var(--accent-cyan)' : '1px solid transparent',
                    }}
                  >
                    <div style={{
                      width: '18px', height: '18px', borderRadius: '50%',
                      background: isCurrent ? 'var(--accent-cyan)' : status === 'done' ? 'rgba(16,185,129,0.2)' : 'var(--bg-elevated)',
                      border: `1px solid ${isCurrent ? 'var(--accent-cyan)' : status === 'done' ? 'var(--status-ok)' : 'var(--border)'}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                    }}>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '8px', color: isCurrent ? '#000' : status === 'done' ? 'var(--status-ok)' : 'var(--text-muted)', fontWeight: 700 }}>
                        {step}
                      </span>
                    </div>
                    <span style={{
                      fontFamily: 'var(--font-mono)', fontSize: '9px',
                      color: isCurrent ? 'var(--accent-cyan)' : status === 'done' ? 'var(--text-primary)' : 'var(--text-muted)',
                      fontWeight: isCurrent ? 700 : 400,
                      flex: 1
                    }}>
                      {label}
                    </span>
                    {status === 'done' && !isCurrent && (
                      <CheckCircle2 size={11} color="var(--status-ok)" style={{ flexShrink: 0 }} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Worker Node Health Matrix */}
          <div className="panel" style={{ padding: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <div className="text-label">Worker Fleet Pool ({state.workerInstances.length} nodes)</div>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'var(--status-ok)' }}>
                {healthyWorkers} Healthy
              </span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
              {state.workerInstances.map(w => (
                <div key={w.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 8px', background: 'var(--bg-elevated)', borderRadius: '3px', border: '1px solid var(--border)' }}>
                  <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: w.status === 'healthy' ? 'var(--status-ok)' : w.status === 'failed' ? 'var(--status-error)' : 'var(--accent-cyan)', flexShrink: 0 }} />
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'var(--text-primary)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {w.name}
                  </span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '8px', color: w.status === 'failed' ? 'var(--status-error)' : 'var(--text-muted)' }}>
                    {w.status.toUpperCase()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ClientIncidentTime({ timestamp }: { timestamp: number }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return (
    <span suppressHydrationWarning>
      {mounted ? formatTime(timestamp) : '--:--:--'}
    </span>
  );
}


