'use client';
import { useSimulation } from '@/context/SimulationContext';
import { Instance } from '@/lib/simulation/types';
import { cpuColor, statusColor } from '@/lib/utils/format';
import { SCALING_POLICY } from '@/lib/simulation/scenarios';
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, ReferenceLine } from 'recharts';

export default function AutoScaling() {
  const { state, dispatch } = useSimulation();
  const totalApi = state.apiInstances.length;
  const totalWorker = state.workerInstances.length;
  const healthyApi = state.apiInstances.filter(i => i.status === 'healthy').length;
  const healthyWorker = state.workerInstances.filter(i => i.status === 'healthy').length;
  const totalInstances = totalApi + totalWorker;
  const avgCpu = state.cpuHistory[state.cpuHistory.length - 1] || 0;
  const scalingActive = totalInstances > 4;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxWidth: '1400px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div className="text-label" style={{ color: 'var(--text-muted)' }}>AUTO-SCALING ENGINE</div>
          <h1 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', marginTop: '2px' }}>Instance Cluster</h1>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          {scalingActive && (
            <span className="badge badge-warn" style={{ fontSize: '10px', padding: '4px 12px' }}>AUTO-SCALING ACTIVE</span>
          )}
          <span className="badge badge-ok">{totalInstances} TOTAL INSTANCES</span>
        </div>
      </div>

      {/* Policy + metrics row */}
      <div style={{ display: 'flex', gap: '12px' }}>
        {/* Scaling policy */}
        <div className="panel" style={{ flex: 1, padding: '16px' }}>
          <div className="text-label" style={{ marginBottom: '12px' }}>Scaling Policy</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <PolicyRow label="Min Instances" value={`${SCALING_POLICY.MIN_API + SCALING_POLICY.MIN_WORKER}`} />
            <PolicyRow label="Max Instances" value={`${SCALING_POLICY.MAX_API + SCALING_POLICY.MAX_WORKER}`} />
            <PolicyRow label="Target CPU" value={`${SCALING_POLICY.TARGET_CPU}%`} />
            <PolicyRow label="Scale-Up CPU" value={`> ${SCALING_POLICY.SCALE_UP_THRESHOLD_CPU}%`} color="var(--status-warn)" />
            <PolicyRow label="Scale-Down CPU" value={`< ${SCALING_POLICY.SCALE_DOWN_THRESHOLD_CPU}%`} color="var(--status-ok)" />
            <PolicyRow label="Cooldown" value={`${SCALING_POLICY.COOLDOWN_TICKS * 100}ms`} />
          </div>
          <div style={{ marginTop: '12px', padding: '10px', background: 'var(--bg-elevated)', borderRadius: '3px' }}>
            <div className="text-label" style={{ marginBottom: '4px' }}>Current Status</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: avgCpu > SCALING_POLICY.SCALE_UP_THRESHOLD_CPU ? 'var(--status-error)' : avgCpu > SCALING_POLICY.TARGET_CPU ? 'var(--status-warn)' : 'var(--status-ok)', fontWeight: 600 }}>
              {avgCpu > SCALING_POLICY.SCALE_UP_THRESHOLD_CPU ? '↑ SCALING UP' : avgCpu < SCALING_POLICY.SCALE_DOWN_THRESHOLD_CPU ? '↓ SCALING DOWN' : '● STABLE'}
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'var(--text-muted)', marginTop: '4px' }}>
              {avgCpu > SCALING_POLICY.SCALE_UP_THRESHOLD_CPU
                ? `CPU ${Math.round(avgCpu)}% > target ${SCALING_POLICY.TARGET_CPU}% — provisioning instances`
                : `CPU ${Math.round(avgCpu)}% within target range`}
            </div>
          </div>
        </div>

        {/* CPU trend */}
        <div className="panel" style={{ flex: 2, padding: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span className="text-label">CPU Utilization vs. Instance Count</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: cpuColor(avgCpu), fontWeight: 600 }}>{Math.round(avgCpu)}% avg</span>
          </div>
          <ResponsiveContainer width="100%" height={140}>
            <AreaChart
              data={state.cpuHistory.map((v, i) => ({
                t: i, cpu: v,
                instances: Math.min(
                  (state.rpsHistory[i] || 0) > 0
                    ? Math.ceil((state.rpsHistory[i] || 0) / 1000)
                    : 2,
                  SCALING_POLICY.MAX_API + SCALING_POLICY.MAX_WORKER
                ),
              }))}
              margin={{ top: 4, right: 0, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="cpuScaleGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <YAxis domain={[0, 100]} hide />
              <Area type="monotone" dataKey="cpu" stroke="#f59e0b" strokeWidth={2} fill="url(#cpuScaleGrad)" dot={false} isAnimationActive={false} />
              <ReferenceLine y={SCALING_POLICY.TARGET_CPU} stroke="rgba(16,185,129,0.5)" strokeDasharray="4 4" label={{ value: 'TARGET', position: 'insideRight', fontSize: 8, fill: 'var(--status-ok)', fontFamily: 'IBM Plex Mono' }} />
              <ReferenceLine y={SCALING_POLICY.SCALE_UP_THRESHOLD_CPU} stroke="rgba(239,68,68,0.5)" strokeDasharray="4 4" label={{ value: 'SCALE UP', position: 'insideRight', fontSize: 8, fill: 'var(--status-error)', fontFamily: 'IBM Plex Mono' }} />
            </AreaChart>
          </ResponsiveContainer>

          {/* Scaling events */}
          <div style={{ marginTop: '8px', borderTop: '1px solid var(--border)', paddingTop: '8px' }}>
            <div className="text-label" style={{ marginBottom: '6px' }}>Recent Scaling Events</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', maxHeight: '80px', overflow: 'auto' }}>
              {state.scalingEvents.slice(0, 4).map((ev, i) => (
                <div key={i} style={{ display: 'flex', gap: '8px', fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'var(--text-secondary)' }}>
                  <span style={{ color: ev.delta > 0 ? 'var(--status-ok)' : 'var(--status-warn)' }}>{ev.delta > 0 ? '↑' : '↓'}</span>
                  <span>{ev.action}</span>
                </div>
              ))}
              {state.scalingEvents.length === 0 && (
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'var(--text-muted)' }}>No scaling events yet</span>
              )}
            </div>
          </div>
        </div>

        {/* Counters */}
        <div className="panel" style={{ flex: 1, padding: '16px' }}>
          <div className="text-label" style={{ marginBottom: '12px' }}>Instance Summary</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span className="text-label">API Instances</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '16px', fontWeight: 700, color: 'var(--accent-cyan)' }}>{totalApi}</span>
              </div>
              <div style={{ display: 'flex', gap: '2px' }}>
                {Array.from({ length: Math.min(totalApi, 20) }).map((_, i) => (
                  <div key={i} style={{ width: '8px', height: '8px', borderRadius: '1px', background: i < healthyApi ? 'var(--accent-cyan)' : 'var(--status-warn)' }} />
                ))}
              </div>
            </div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span className="text-label">Worker Instances</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '16px', fontWeight: 700, color: 'var(--accent-blue)' }}>{totalWorker}</span>
              </div>
              <div style={{ display: 'flex', gap: '2px', flexWrap: 'wrap' }}>
                {Array.from({ length: Math.min(totalWorker, 20) }).map((_, i) => (
                  <div key={i} style={{ width: '8px', height: '8px', borderRadius: '1px', background: i < healthyWorker ? 'var(--accent-blue)' : 'rgba(239,68,68,0.6)' }} />
                ))}
              </div>
            </div>
          </div>
          <div style={{ marginTop: '16px', padding: '10px', background: 'var(--bg-elevated)', borderRadius: '3px', fontFamily: 'var(--font-mono)', fontSize: '10px' }}>
            <div style={{ color: 'var(--text-muted)', marginBottom: '4px' }}>Scale path</div>
            <div style={{ color: 'var(--text-primary)', letterSpacing: '0.05em' }}>
              {Math.max(2, Math.min(totalInstances, 4))} → {Math.max(4, Math.min(totalInstances, 8))} → {Math.max(8, Math.min(totalInstances, 16))} → {Math.max(16, Math.min(totalInstances, 36))}
            </div>
          </div>
        </div>
      </div>

      {/* API Instance Grid */}
      <div className="panel" style={{ padding: '16px' }}>
        <div className="text-label" style={{ marginBottom: '12px' }}>API Instance Cluster</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '8px' }}>
          {state.apiInstances.map(inst => <InstanceCard key={inst.id} inst={inst} />)}
        </div>
      </div>

      {/* Worker Instance Grid */}
      <div className="panel" style={{ padding: '16px' }}>
        <div className="text-label" style={{ marginBottom: '12px' }}>Worker Instance Cluster</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '8px' }}>
          {state.workerInstances.map(inst => <InstanceCard key={inst.id} inst={inst} />)}
        </div>
      </div>

      {/* Explanation */}
      {scalingActive && (
        <div className="panel" style={{ padding: '16px', border: '1px solid rgba(245,158,11,0.3)', background: 'rgba(245,158,11,0.05)' }}>
          <div style={{ display: 'flex', gap: '12px' }}>
            <div style={{ color: 'var(--status-warn)', fontSize: '16px' }}>⚡</div>
            <div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', fontWeight: 600, color: 'var(--status-warn)', marginBottom: '4px', letterSpacing: '0.08em' }}>AUTO-SCALING TRIGGERED</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                <strong>Reason:</strong> CPU &gt; {SCALING_POLICY.SCALE_UP_THRESHOLD_CPU}% AND request rate increasing<br />
                <strong>Action:</strong> Provisioning additional instances (API + Worker)<br />
                <strong>Expected:</strong> Latency returns below 200ms within 30s of scale completion<br />
                <strong>Cost impact:</strong> +${((totalInstances - 4) * 0.096).toFixed(3)}/hr additional infrastructure
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function InstanceCard({ inst }: { inst: Instance }) {
  const color = statusColor(inst.status);
  return (
    <div className={`instance-card ${inst.status}`} style={{ animation: inst.status === 'provisioning' ? 'provision-pulse 1s ease-in-out infinite' : 'none' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', fontWeight: 600, color: 'var(--text-primary)' }}>{inst.name}</span>
        <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: color, boxShadow: inst.status === 'healthy' ? `0 0 6px ${color}` : 'none' }} />
      </div>
      {inst.status === 'provisioning' ? (
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'var(--accent-cyan)' }}>Provisioning...</div>
      ) : inst.status === 'failed' ? (
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'var(--status-error)' }}>INSTANCE FAILED</div>
      ) : (
        <>
          <div style={{ marginBottom: '4px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '8px', color: 'var(--text-muted)' }}>CPU</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '8px', color: cpuColor(inst.cpu), fontWeight: 600 }}>{Math.round(inst.cpu)}%</span>
            </div>
            <div className="progress-track" style={{ height: '3px' }}>
              <div className="progress-fill" style={{ width: `${inst.cpu}%`, background: cpuColor(inst.cpu) }} />
            </div>
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '8px', color: 'var(--text-muted)' }}>
            {Math.round(inst.throughput).toLocaleString()} req/s
          </div>
        </>
      )}
    </div>
  );
}

function PolicyRow({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div className="data-row">
      <span className="text-label">{label}</span>
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: color || 'var(--text-primary)', fontWeight: 500 }}>{value}</span>
    </div>
  );
}
