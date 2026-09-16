'use client';
import { useSimulation } from '@/context/SimulationContext';
import { severityColor } from '@/lib/utils/format';
import { playChaosSound } from '@/lib/utils/sounds';
import { motion, AnimatePresence } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer } from 'recharts';

export default function IncidentCenter() {
  const { state, dispatch } = useSimulation();
  const chaosWorker = state.workerInstances.find(w => w.status === 'failed');

  return (
    <div style={{ display: 'flex', gap: '12px', maxWidth: '1400px' }}>
      {/* Left: incident feed */}
      <div style={{ flex: 2, display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div>
          <div className="text-label" style={{ color: 'var(--text-muted)' }}>INCIDENT OPERATIONS CENTER</div>
          <h1 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', marginTop: '2px' }}>Live Incident Feed</h1>
        </div>

        {/* Error + error rate charts */}
        <div style={{ display: 'flex', gap: '8px' }}>
          <div className="panel" style={{ flex: 1, padding: '16px' }}>
            <div className="text-label" style={{ marginBottom: '8px' }}>Error Rate</div>
            <ResponsiveContainer width="100%" height={70}>
              <AreaChart data={state.errorHistory.map((v, i) => ({ t: i, v }))} margin={{ top: 2, right: 0, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="errGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area type="monotone" dataKey="v" stroke="#ef4444" strokeWidth={1.5} fill="url(#errGrad)" dot={false} isAnimationActive={false} />
                <YAxis hide domain={[0, 'auto']} />
              </AreaChart>
            </ResponsiveContainer>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '14px', fontWeight: 600, color: state.errorRate > 0.05 ? 'var(--status-error)' : 'var(--status-ok)', marginTop: '4px' }}>
              {(state.errorRate * 100).toFixed(2)}%
            </div>
          </div>
          <div className="panel" style={{ flex: 1, padding: '16px' }}>
            <div className="text-label" style={{ marginBottom: '4px' }}>Total Failed</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '24px', fontWeight: 700, color: 'var(--status-error)' }}>{state.queueFailed.toLocaleString()}</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'var(--text-muted)', marginTop: '4px' }}>
              {state.queueRetrying} currently retrying
            </div>
          </div>
          <div className="panel" style={{ flex: 1, padding: '16px' }}>
            <div className="text-label" style={{ marginBottom: '4px' }}>SLA Uptime</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '24px', fontWeight: 700, color: 'var(--status-ok)' }}>
              {state.totalRequests > 0 ? ((state.successfulRequests / state.totalRequests) * 100).toFixed(2) : '100.00'}%
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'var(--text-muted)', marginTop: '4px' }}>
              Target: 99.9%
            </div>
          </div>
        </div>

        {/* Incident list */}
        <div className="panel" style={{ flex: 1, padding: '16px', overflow: 'hidden' }}>
          <div className="text-label" style={{ marginBottom: '12px' }}>Event Timeline</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', overflow: 'auto', maxHeight: '480px' }}>
            {state.incidents.map((inc, i) => (
              <div
                key={inc.id}
                style={{
                  display: 'flex', alignItems: 'flex-start', gap: '10px', padding: '8px 10px',
                  background: i === 0 ? 'var(--bg-elevated)' : 'transparent',
                  borderRadius: 'var(--radius-sm)',
                  border: `1px solid ${i === 0 ? 'var(--border)' : 'transparent'}`,
                  animation: i === 0 ? 'fadeSlideIn 0.25s ease' : 'none',
                }}
              >
                <div style={{
                  width: '8px', height: '8px', borderRadius: '50%', flexShrink: 0,
                  background: severityColor(inc.severity),
                  boxShadow: i === 0 ? `0 0 8px ${severityColor(inc.severity)}` : 'none',
                  marginTop: '3px',
                }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-primary)' }}>{inc.message}</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'var(--text-muted)', marginTop: '2px' }}>
                    {new Date(inc.timestamp).toLocaleTimeString('en-US', { hour12: false })} · {inc.id}
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

      {/* Right: chaos test */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div className="panel" style={{ padding: '20px', border: '1px solid rgba(239,68,68,0.2)' }}>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
            <span style={{ color: 'var(--status-warn)', fontSize: '16px' }}>⚠</span>
            <span className="text-label" style={{ color: 'var(--status-warn)' }}>CHAOS ENGINEERING</span>
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-muted)', marginBottom: '16px', lineHeight: '1.6' }}>
            Simulate real production failures. The system should automatically detect, reroute, retry, and recover.
          </div>

          {chaosWorker ? (
            <div style={{ padding: '12px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '3px', marginBottom: '12px' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--status-error)', fontWeight: 600, marginBottom: '4px' }}>
                ● {chaosWorker.name} FAILED
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'var(--text-muted)' }}>
                Traffic redistributing to healthy workers.<br />Auto-recovery in progress...
              </div>
            </div>
          ) : null}

          <button
            className="btn btn-danger"
            style={{ width: '100%', justifyContent: 'center', fontSize: '11px' }}
            onClick={() => { playChaosSound(); dispatch({ type: 'CHAOS_TEST' }); }}
          >
            ⚠ SIMULATE INSTANCE FAILURE
          </button>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'var(--text-muted)', marginTop: '8px', textAlign: 'center' }}>
            Randomly terminates one worker instance
          </div>
        </div>

        {/* What happens */}
        <div className="panel" style={{ padding: '16px' }}>
          <div className="text-label" style={{ marginBottom: '10px' }}>Chaos Recovery Sequence</div>
          {[
            { step: '1', label: 'Worker instance fails', status: 'error' },
            { step: '2', label: 'Health check detects failure', status: 'warn' },
            { step: '3', label: 'Load balancer removes from pool', status: 'warn' },
            { step: '4', label: 'Traffic redistributed to survivors', status: 'info' },
            { step: '5', label: 'Failed requests queued for retry', status: 'info' },
            { step: '6', label: 'Auto-scaling provisions replacement', status: 'info' },
            { step: '7', label: 'New instance becomes healthy', status: 'ok' },
            { step: '8', label: 'Queue drained, system stable', status: 'ok' },
          ].map(({ step, label, status }) => (
            <div key={step} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '5px 0', borderBottom: '1px solid var(--border)' }}>
              <div style={{ width: '16px', height: '16px', borderRadius: '50%', background: 'var(--bg-elevated)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '8px', color: 'var(--text-muted)' }}>{step}</span>
              </div>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: status === 'ok' ? 'var(--status-ok)' : status === 'error' ? 'var(--status-error)' : status === 'warn' ? 'var(--status-warn)' : 'var(--accent-blue)' }}>
                {label}
              </span>
            </div>
          ))}
        </div>

        {/* Worker health */}
        <div className="panel" style={{ padding: '16px' }}>
          <div className="text-label" style={{ marginBottom: '10px' }}>Worker Health</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {state.workerInstances.map(w => (
              <div key={w.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '5px 8px', background: 'var(--bg-elevated)', borderRadius: '3px' }}>
                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: w.status === 'healthy' ? 'var(--status-ok)' : w.status === 'failed' ? 'var(--status-error)' : 'var(--accent-cyan)', flexShrink: 0 }} />
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-primary)', flex: 1 }}>{w.name}</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: w.status === 'failed' ? 'var(--status-error)' : 'var(--text-muted)' }}>{w.status.toUpperCase()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
