'use client';
import { useSimulation } from '@/context/SimulationContext';
import { Instance } from '@/lib/simulation/types';
import { cpuColor, statusColor } from '@/lib/utils/format';
import { SCALING_POLICY } from '@/lib/simulation/scenarios';
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, ReferenceLine } from 'recharts';
import {
  Boxes,
  Server,
  TrendingUp,
  TrendingDown,
  Cpu,
  Layers,
  Zap,
  CheckCircle2,
  Clock,
  Sparkles,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';

export default function AutoScaling() {
  const { state, dispatch, guideMode } = useSimulation();
  const totalApi = state.apiInstances.length;
  const totalWorker = state.workerInstances.length;
  const healthyApi = state.apiInstances.filter(i => i.status === 'healthy').length;
  const healthyWorker = state.workerInstances.filter(i => i.status === 'healthy').length;
  const totalInstances = totalApi + totalWorker;
  const avgCpu = state.cpuHistory[state.cpuHistory.length - 1] || 0;
  const scalingActive = totalInstances > 4;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', maxWidth: '1400px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="text-label" style={{ color: 'var(--accent-cyan)' }}>ELASTIC CLUSTER ORCHESTRATION</span>
            <span className="badge badge-cyan" style={{ fontSize: '8px' }}>HPA ENGINE</span>
          </div>
          <h1 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-primary)', marginTop: '2px' }}>
            Auto-Scaling Engine & Pod Cluster
          </h1>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {scalingActive && (
            <span className="badge badge-warn" style={{ fontSize: '10px', padding: '5px 12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <TrendingUp size={12} />
              <span>SCALE-OUT ACTIVE ({totalInstances} PODS)</span>
            </span>
          )}
          <span className="badge badge-ok" style={{ fontSize: '10px', padding: '5px 12px' }}>
            {healthyApi + healthyWorker} HEALTHY / {totalInstances} PROVISIONED
          </span>
        </div>
      </div>

      {/* Guide Mode Explainer */}
      {guideMode && (
        <div className="guide-card">
          <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '6px', background: 'rgba(6,182,212,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Boxes size={16} color="var(--accent-cyan)" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)' }}>
                  In Simple Terms: Why Elastic Scaling Matters
                </span>
                <span className="analogy-pill">Supermarket Cashier Analogy</span>
              </div>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                On a quiet morning, a supermarket only needs <strong>2 open cash registers</strong> (saving electricity and cost).
                When a Black Friday crowd bursts in, <strong>16 more cashiers open automatically in seconds</strong>. Once the crowd leaves, they close down again.
                <strong> FlashForge does this for cloud servers automatically</strong> based on CPU and request depth.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Policy + Metrics Row */}
      <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
        {/* Scaling Policy Card */}
        <div className="panel" style={{ flex: 1, minWidth: '280px', padding: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <span className="text-label">HPA Rules & Thresholds</span>
            <ShieldCheck size={14} color="var(--accent-cyan)" />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <PolicyRow label="Min Baseline Fleet" value={`${SCALING_POLICY.MIN_API + SCALING_POLICY.MIN_WORKER} instances`} />
            <PolicyRow label="Max Burst Fleet" value={`${SCALING_POLICY.MAX_API + SCALING_POLICY.MAX_WORKER} instances`} />
            <PolicyRow label="Target CPU Utilization" value={`${SCALING_POLICY.TARGET_CPU}%`} />
            <PolicyRow label="Scale-Up Trigger" value={`> ${SCALING_POLICY.SCALE_UP_THRESHOLD_CPU}% CPU`} color="var(--status-warn)" />
            <PolicyRow label="Scale-Down Trigger" value={`< ${SCALING_POLICY.SCALE_DOWN_THRESHOLD_CPU}% CPU`} color="var(--status-ok)" />
            <PolicyRow label="Cooldown Period" value="2.0s buffer" />
          </div>

          <div style={{ marginTop: '14px', padding: '12px', background: 'var(--bg-elevated)', borderRadius: '4px', border: '1px solid var(--border)' }}>
            <div className="text-label" style={{ marginBottom: '4px' }}>Real-Time Policy Evaluation</div>
            <div style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
              color: avgCpu > SCALING_POLICY.SCALE_UP_THRESHOLD_CPU ? 'var(--status-error)' : avgCpu > SCALING_POLICY.TARGET_CPU ? 'var(--status-warn)' : 'var(--status-ok)',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              {avgCpu > SCALING_POLICY.SCALE_UP_THRESHOLD_CPU ? (
                <>
                  <TrendingUp size={14} />
                  <span>SCALING UP: Provisioning pods (+4)</span>
                </>
              ) : avgCpu < SCALING_POLICY.SCALE_DOWN_THRESHOLD_CPU ? (
                <>
                  <TrendingDown size={14} />
                  <span>SCALE DOWN: Cluster consolidating</span>
                </>
              ) : (
                <>
                  <CheckCircle2 size={14} />
                  <span>STABLE: Capacity optimal</span>
                </>
              )}
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'var(--text-muted)', marginTop: '4px' }}>
              {avgCpu > SCALING_POLICY.SCALE_UP_THRESHOLD_CPU
                ? `Cluster average load (${Math.round(avgCpu)}%) exceeds scale threshold (${SCALING_POLICY.SCALE_UP_THRESHOLD_CPU}%)`
                : `Cluster average load (${Math.round(avgCpu)}%) is within healthy envelope`}
            </div>
          </div>
        </div>

        {/* CPU utilization trend vs capacity */}
        <div className="panel" style={{ flex: 2, minWidth: '380px', padding: '18px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span className="text-label">Cluster CPU Load vs. Scaling Thresholds</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: cpuColor(avgCpu), fontWeight: 700 }}>
              {Math.round(avgCpu)}% Average CPU
            </span>
          </div>
          <ResponsiveContainer width="100%" height={150}>
            <AreaChart
              data={state.cpuHistory.map((v, i) => ({
                t: i,
                cpu: v,
                instances: Math.min(
                  (state.rpsHistory[i] || 0) > 0
                    ? Math.ceil((state.rpsHistory[i] || 0) / 1000)
                    : 2,
                  SCALING_POLICY.MAX_API + SCALING_POLICY.MAX_WORKER
                ),
              }))}
              margin={{ top: 6, right: 0, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="cpuScaleGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <YAxis domain={[0, 100]} hide />
              <Area type="monotone" dataKey="cpu" stroke="#f59e0b" strokeWidth={2} fill="url(#cpuScaleGrad)" dot={false} isAnimationActive={false} />
              <ReferenceLine y={SCALING_POLICY.TARGET_CPU} stroke="rgba(16,185,129,0.7)" strokeDasharray="4 4" label={{ value: 'TARGET (65%)', position: 'insideRight', fontSize: 8, fill: 'var(--status-ok)', fontFamily: 'IBM Plex Mono' }} />
              <ReferenceLine y={SCALING_POLICY.SCALE_UP_THRESHOLD_CPU} stroke="rgba(239,68,68,0.7)" strokeDasharray="4 4" label={{ value: 'SCALE UP (70%)', position: 'insideRight', fontSize: 8, fill: 'var(--status-error)', fontFamily: 'IBM Plex Mono' }} />
            </AreaChart>
          </ResponsiveContainer>

          {/* Scaling events history */}
          <div style={{ marginTop: '10px', borderTop: '1px solid var(--border)', paddingTop: '10px' }}>
            <div className="text-label" style={{ marginBottom: '8px' }}>Recent Horizontal Scaling Actions</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', maxHeight: '85px', overflowY: 'auto' }}>
              {state.scalingEvents.slice(0, 4).map((ev, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontFamily: 'var(--font-mono)', fontSize: '9.5px', color: 'var(--text-secondary)' }}>
                  <span style={{ color: ev.delta > 0 ? 'var(--status-ok)' : 'var(--status-warn)', fontWeight: 700 }}>
                    {ev.delta > 0 ? '↑ SCALE OUT' : '↓ SCALE IN'}
                  </span>
                  <span>{ev.action}</span>
                </div>
              ))}
              {state.scalingEvents.length === 0 && (
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '9.5px', color: 'var(--text-muted)' }}>
                  Cluster operating at baseline. No scaling events needed yet.
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Fleet Composition Summary */}
        <div className="panel" style={{ flex: 1, minWidth: '260px', padding: '18px' }}>
          <div className="text-label" style={{ marginBottom: '14px' }}>Fleet Composition</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span className="text-label">API Gateway Pods</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '15px', fontWeight: 800, color: 'var(--accent-cyan)' }}>
                  {totalApi} pods
                </span>
              </div>
              <div style={{ display: 'flex', gap: '3px', flexWrap: 'wrap' }}>
                {Array.from({ length: Math.min(totalApi, 20) }).map((_, i) => (
                  <div key={i} style={{ width: '10px', height: '10px', borderRadius: '2px', background: i < healthyApi ? 'var(--accent-cyan)' : 'var(--status-warn)' }} />
                ))}
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span className="text-label">Background Workers</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '15px', fontWeight: 800, color: 'var(--accent-blue)' }}>
                  {totalWorker} pods
                </span>
              </div>
              <div style={{ display: 'flex', gap: '3px', flexWrap: 'wrap' }}>
                {Array.from({ length: Math.min(totalWorker, 20) }).map((_, i) => (
                  <div key={i} style={{ width: '10px', height: '10px', borderRadius: '2px', background: i < healthyWorker ? 'var(--accent-blue)' : 'rgba(239,68,68,0.7)' }} />
                ))}
              </div>
            </div>
          </div>

          <div style={{ marginTop: '16px', padding: '10px', background: 'var(--bg-elevated)', borderRadius: '4px', border: '1px solid var(--border)', fontFamily: 'var(--font-mono)', fontSize: '10px' }}>
            <div style={{ color: 'var(--text-muted)', marginBottom: '4px' }}>Auto-Step Progression:</div>
            <div style={{ color: 'var(--text-primary)', letterSpacing: '0.04em', fontWeight: 600 }}>
              4 pods ➔ 8 pods ➔ 16 pods ➔ 36 pods
            </div>
          </div>
        </div>
      </div>

      {/* API Instances Cluster Grid */}
      <div className="panel" style={{ padding: '18px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Server size={14} color="var(--accent-cyan)" />
            <span className="text-label" style={{ color: 'var(--text-primary)' }}>API Gateway Pod Cluster ({state.apiInstances.length})</span>
          </div>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'var(--text-muted)' }}>Auto-provisioned via Kubernetes ReplicaSet</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(145px, 1fr))', gap: '8px' }}>
          {state.apiInstances.map(inst => <InstanceCard key={inst.id} inst={inst} />)}
        </div>
      </div>

      {/* Worker Instances Cluster Grid */}
      <div className="panel" style={{ padding: '18px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Cpu size={14} color="var(--accent-blue)" />
            <span className="text-label" style={{ color: 'var(--text-primary)' }}>Worker Task Pod Cluster ({state.workerInstances.length})</span>
          </div>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'var(--text-muted)' }}>Drains asynchronous orders & payments</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(145px, 1fr))', gap: '8px' }}>
          {state.workerInstances.map(inst => <InstanceCard key={inst.id} inst={inst} />)}
        </div>
      </div>
    </div>
  );
}

function InstanceCard({ inst }: { inst: Instance }) {
  const color = statusColor(inst.status);
  return (
    <div className={`instance-card ${inst.status}`} style={{ animation: inst.status === 'provisioning' ? 'provision-pulse 1s ease-in-out infinite' : 'none' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', fontWeight: 700, color: 'var(--text-primary)' }}>{inst.name}</span>
        <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: color, boxShadow: inst.status === 'healthy' ? `0 0 6px ${color}` : 'none' }} />
      </div>
      {inst.status === 'provisioning' ? (
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'var(--accent-cyan)', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span className="animate-spin">⟳</span> Provisioning...
        </div>
      ) : inst.status === 'failed' ? (
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'var(--status-error)', fontWeight: 700 }}>POD FAILED</div>
      ) : (
        <>
          <div style={{ marginBottom: '5px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '8px', color: 'var(--text-muted)' }}>CPU</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '8px', color: cpuColor(inst.cpu), fontWeight: 700 }}>{Math.round(inst.cpu)}%</span>
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
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: color || 'var(--text-primary)', fontWeight: 600 }}>{value}</span>
    </div>
  );
}
