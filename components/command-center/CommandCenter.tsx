'use client';
import { useSimulation } from '@/context/SimulationContext';
import { useAnimatedNumber } from '@/hooks/useAnimatedNumber';
import { formatRps, formatLatency, formatPercent } from '@/lib/utils/format';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { useMemo } from 'react';
import { motion } from 'framer-motion';

const stagger = {
  animate: { transition: { staggerChildren: 0.06 } },
};
const fadeUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] as const } },
};


function MetricCard({ label, value, unit, color, sub }: { label: string; value: string; unit?: string; color?: string; sub?: string }) {
  return (
    <div className="panel" style={{ padding: '16px', flex: 1, minWidth: 0 }}>
      <div className="text-label" style={{ marginBottom: '8px' }}>{label}</div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
        <span className="text-metric" style={{ color: color || 'var(--text-primary)', fontSize: '22px' }}>{value}</span>
        {unit && <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)' }}>{unit}</span>}
      </div>
      {sub && <div style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'var(--text-muted)', marginTop: '4px' }}>{sub}</div>}
    </div>
  );
}

const PHASE_LABELS: Record<string, { label: string; color: string }> = {
  NORMAL: { label: 'NORMAL', color: '#10b981' },
  ELEVATED: { label: 'ELEVATED', color: '#f59e0b' },
  FLASH_SALE: { label: 'FLASH SALE', color: '#ef4444' },
  CRITICAL: { label: 'CRITICAL', color: '#dc2626' },
  RECOVERY: { label: 'RECOVERY', color: '#06b6d4' },
};

export default function CommandCenter() {
  const { state } = useSimulation();
  const rps = useAnimatedNumber(state.currentRps, 300);
  const users = useAnimatedNumber(state.activeUsers, 400);
  const latency = useAnimatedNumber(state.avgLatency, 300);
  const healthyApi = state.apiInstances.filter(i => i.status === 'healthy').length;
  const healthyWorker = state.workerInstances.filter(i => i.status === 'healthy').length;
  const totalInstances = useAnimatedNumber(healthyApi + healthyWorker, 500);
  const errorRate = useAnimatedNumber(state.errorRate * 100, 300);

  const phase = PHASE_LABELS[state.scenario] || PHASE_LABELS.NORMAL;
  const isCritical = state.currentRps > 8000;
  const isFlashSale = state.currentRps > 3000;

  const chartData = useMemo(() =>
    state.rpsHistory.map((v, i) => ({
      t: i,
      rps: Math.round(v),
      capacity: (healthyApi * 1200),
    })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [state.tick]
  );

  const gradientColor = isCritical ? '#ef4444' : isFlashSale ? '#f59e0b' : '#3b82f6';

  return (
    <motion.div variants={stagger} initial="initial" animate="animate" style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxWidth: '1400px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="text-label" style={{ fontSize: '10px', color: 'var(--text-muted)' }}>FLASHFORGE CONTROL CENTER</span>
          </div>
          <h1 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', marginTop: '2px', letterSpacing: '-0.01em' }}>
            Cloud Infrastructure Status
          </h1>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className={`status-dot ${isCritical ? 'error' : isFlashSale ? 'warn' : 'ok'}`} />
          <span style={{
            fontFamily: 'var(--font-mono)', fontSize: '11px', letterSpacing: '0.1em',
            color: isCritical ? 'var(--status-error)' : isFlashSale ? 'var(--status-warn)' : 'var(--status-ok)'
          }}>
            {isCritical ? '● CRITICAL LOAD DETECTED' : isFlashSale ? '● FLASH SALE IN PROGRESS' : '● ALL SYSTEMS OPERATIONAL'}
          </span>
        </div>
      </div>

      {/* Metric row */}
      <motion.div variants={fadeUp} style={{ display: 'flex', gap: '8px' }}>
        <MetricCard label="Requests / Sec" value={Math.round(rps).toLocaleString()} color={isCritical ? 'var(--status-error)' : isFlashSale ? 'var(--status-warn)' : 'var(--text-primary)'} sub={`Target: ${state.targetRps.toLocaleString()} req/s`} />
        <MetricCard label="Active Users" value={Math.round(users).toLocaleString()} sub="Concurrent sessions" />
        <MetricCard label="Avg Latency" value={Math.round(latency).toString()} unit="ms" color={latency > 300 ? 'var(--status-error)' : latency > 150 ? 'var(--status-warn)' : 'var(--status-ok)'} sub={`P99: ${Math.round(state.p99Latency)}ms`} />
        <MetricCard label="Active Instances" value={Math.round(totalInstances).toString()} color="var(--accent-cyan)" sub={`${healthyApi} API · ${healthyWorker} Workers`} />
        <MetricCard label="Error Rate" value={errorRate.toFixed(2)} unit="%" color={state.errorRate > 0.05 ? 'var(--status-error)' : state.errorRate > 0.01 ? 'var(--status-warn)' : 'var(--status-ok)'} sub={`${state.successfulRequests.toLocaleString()} successful`} />
      </motion.div>

      {/* Traffic graph */}
      <div className="panel" style={{ padding: '16px' }}>
        <div className="panel-header" style={{ padding: '0 0 12px', border: 'none', marginBottom: '4px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <span className="text-label">Live Traffic</span>
            <span className={`badge badge-${isCritical ? 'error' : isFlashSale ? 'warn' : 'ok'}`}>
              {phase.label}
            </span>
          </div>
          <div style={{ display: 'flex', gap: '16px' }}>
            <LegendItem color="#3b82f6" label="Requests/sec" />
            <LegendItem color="rgba(16,185,129,0.4)" label="Capacity" />
          </div>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={chartData} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="rpsGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={gradientColor} stopOpacity={0.3} />
                <stop offset="95%" stopColor={gradientColor} stopOpacity={0.02} />
              </linearGradient>
              <linearGradient id="capGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis dataKey="t" hide />
            <YAxis
              width={50}
              tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}
              tick={{ fontSize: 10, fontFamily: 'IBM Plex Mono', fill: 'var(--text-muted)' }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              contentStyle={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-accent)', borderRadius: '4px', fontFamily: 'IBM Plex Mono', fontSize: '11px', color: 'var(--text-primary)' }}
              formatter={(v: unknown) => [`${Number(v).toLocaleString()}`, '']}
              labelFormatter={() => ''}
            />
            <Area type="monotone" dataKey="capacity" stroke="#10b981" strokeWidth={1} strokeDasharray="4 4" fill="url(#capGrad)" dot={false} />
            <Area type="monotone" dataKey="rps" stroke={gradientColor} strokeWidth={2} fill="url(#rpsGrad)" dot={false} isAnimationActive={false} />
          </AreaChart>
        </ResponsiveContainer>
        {/* Phase markers */}
        <div style={{ display: 'flex', gap: '8px', marginTop: '8px', paddingTop: '8px', borderTop: '1px solid var(--border)' }}>
          {(['NORMAL', 'ELEVATED', 'FLASH_SALE', 'CRITICAL', 'RECOVERY'] as const).map(p => (
            <PhaseTag key={p} label={PHASE_LABELS[p].label} color={PHASE_LABELS[p].color} active={state.scenario === p} />
          ))}
        </div>
      </div>

      {/* Bottom row */}
      <div style={{ display: 'flex', gap: '12px' }}>
        {/* Queue status */}
        <div className="panel" style={{ flex: 1, padding: '16px' }}>
          <div className="text-label" style={{ marginBottom: '12px' }}>Queue Status</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <QueueBar label="Queue Depth" value={state.queueDepth} max={5000} color={state.queueDepth > 1000 ? 'var(--status-error)' : state.queueDepth > 300 ? 'var(--status-warn)' : 'var(--status-ok)'} />
            <QueueBar label="Processing" value={state.queueProcessed % 1000} max={1000} color="var(--accent-blue)" />
            <div className="data-row">
              <span className="text-label">Completed</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--status-ok)' }}>{state.queueProcessed.toLocaleString()}</span>
            </div>
            <div className="data-row">
              <span className="text-label">Failed</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--status-error)' }}>{state.queueFailed}</span>
            </div>
            <div className="data-row" style={{ border: 'none' }}>
              <span className="text-label">Retrying</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--status-warn)' }}>{state.queueRetrying}</span>
            </div>
          </div>
        </div>

        {/* Recent incidents */}
        <div className="panel" style={{ flex: 2, padding: '16px', overflow: 'hidden' }}>
          <div className="text-label" style={{ marginBottom: '12px' }}>Recent Incidents</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', overflow: 'hidden' }}>
            {state.incidents.slice(0, 5).map(inc => (
              <div key={inc.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', padding: '6px 8px', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-sm)', border: `1px solid ${inc.severity === 'critical' ? 'rgba(239,68,68,0.2)' : 'var(--border)'}` }}>
                <span className={`status-dot ${inc.severity === 'critical' ? 'error' : inc.severity === 'warning' ? 'warn' : inc.severity === 'resolved' ? 'ok' : 'info'}`} style={{ marginTop: '3px' }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{inc.message}</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'var(--text-muted)', marginTop: '2px' }}>{new Date(inc.timestamp).toLocaleTimeString()}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CPU utilization */}
        <div className="panel" style={{ flex: 1, padding: '16px' }}>
          <div className="text-label" style={{ marginBottom: '12px' }}>CPU Utilization</div>
          <ResponsiveContainer width="100%" height={100}>
            <AreaChart data={state.cpuHistory.map((v, i) => ({ t: i, cpu: v }))} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="cpuGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <Area type="monotone" dataKey="cpu" stroke="#f59e0b" strokeWidth={1.5} fill="url(#cpuGrad)" dot={false} isAnimationActive={false} />
              <YAxis domain={[0, 100]} hide />
              <ReferenceLine y={65} stroke="rgba(239,68,68,0.4)" strokeDasharray="3 3" />
            </AreaChart>
          </ResponsiveContainer>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px' }}>
            <span className="text-label">Avg CPU</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', color: 'var(--status-warn)', fontWeight: 600 }}>
              {Math.round(state.cpuHistory[state.cpuHistory.length - 1] || 0)}%
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span className="text-label">Target</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)' }}>65%</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}


function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
      <div style={{ width: '20px', height: '2px', background: color }} />
      <span className="text-label" style={{ fontSize: '9px' }}>{label}</span>
    </div>
  );
}

function PhaseTag({ label, color, active }: { label: string; color: string; active: boolean }) {
  return (
    <div style={{
      padding: '3px 8px',
      borderRadius: '2px',
      fontFamily: 'var(--font-mono)',
      fontSize: '9px',
      fontWeight: 600,
      letterSpacing: '0.1em',
      background: active ? `${color}22` : 'transparent',
      color: active ? color : 'var(--text-dim)',
      border: `1px solid ${active ? color + '44' : 'transparent'}`,
      transition: 'all 0.3s',
    }}>
      {label}
    </div>
  );
}

function QueueBar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
        <span className="text-label">{label}</span>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-secondary)' }}>{Math.round(value).toLocaleString()}</span>
      </div>
      <div className="progress-track">
        <div className="progress-fill" style={{ width: `${pct}%`, background: color, transition: 'width 0.5s ease' }} />
      </div>
    </div>
  );
}
