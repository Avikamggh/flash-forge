'use client';
import { useSimulation } from '@/context/SimulationContext';
import { useAnimatedNumber } from '@/hooks/useAnimatedNumber';
import { formatRps, formatLatency, formatPercent, formatTime } from '@/lib/utils/format';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { useMemo, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Activity,
  Users,
  Clock,
  Server,
  AlertTriangle,
  Layers,
  Cpu,
  ShieldCheck,
  Zap,
  Info,
  CheckCircle2,
  TrendingUp,
  Sparkles
} from 'lucide-react';

const stagger = {
  animate: { transition: { staggerChildren: 0.06 } },
};
const fadeUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] as const } },
};

function MetricCard({
  icon,
  label,
  value,
  unit,
  color,
  sub
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  unit?: string;
  color?: string;
  sub?: string;
}) {
  return (
    <div className="panel panel-interactive" style={{ padding: '16px', flex: 1, minWidth: 0 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
        <span className="text-label">{label}</span>
        <span style={{ color: color || 'var(--text-secondary)', opacity: 0.8 }}>{icon}</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
        <span className="text-metric" style={{ color: color || 'var(--text-primary)', fontSize: '22px' }}>{value}</span>
        {unit && <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)' }}>{unit}</span>}
      </div>
      {sub && <div style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'var(--text-muted)', marginTop: '6px' }}>{sub}</div>}
    </div>
  );
}

const PHASE_LABELS: Record<string, { label: string; color: string; desc: string }> = {
  NORMAL: { label: 'NORMAL', color: '#10b981', desc: 'Baseline traffic. Microservices running in eco-mode.' },
  ELEVATED: { label: 'ELEVATED', color: '#f59e0b', desc: 'Midday traffic rush. Auto-scaler preparing pods.' },
  FLASH_SALE: { label: 'FLASH SALE', color: '#ef4444', desc: 'Severe sudden load spike! All auto-scaling policies active.' },
  CRITICAL: { label: 'CRITICAL', color: '#dc2626', desc: 'Extreme peak volume! Queue buffering backpressure.' },
  RECOVERY: { label: 'RECOVERY', color: '#06b6d4', desc: 'Traffic normalized. Queue draining and scaling in.' },
};

export default function CommandCenter() {
  const { state, dispatch, guideMode } = useSimulation();
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

  const gradientColor = isCritical ? '#ef4444' : isFlashSale ? '#f59e0b' : '#06b6d4';

  return (
    <motion.div variants={stagger} initial="initial" animate="animate" style={{ display: 'flex', flexDirection: 'column', gap: '14px', maxWidth: '1400px' }}>
      {/* Header with status badge */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="text-label" style={{ fontSize: '10px', color: 'var(--accent-cyan)' }}>FLASHFORGE MISSION CONTROL</span>
            <span className="badge badge-cyan" style={{ fontSize: '8px' }}>LIVE SIMULATION</span>
          </div>
          <h1 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-primary)', marginTop: '2px', letterSpacing: '-0.01em' }}>
            Cloud Infrastructure Operations Center
          </h1>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 12px',
            borderRadius: 'var(--radius-sm)',
            background: isCritical ? 'rgba(239,68,68,0.1)' : isFlashSale ? 'rgba(245,158,11,0.1)' : 'rgba(16,185,129,0.1)',
            border: `1px solid ${isCritical ? 'rgba(239,68,68,0.3)' : isFlashSale ? 'rgba(245,158,11,0.3)' : 'rgba(16,185,129,0.3)'}`
          }}>
            <span className={`status-dot ${isCritical ? 'error' : isFlashSale ? 'warn' : 'ok'}`} />
            <span style={{
              fontFamily: 'var(--font-mono)', fontSize: '11px', fontWeight: 700, letterSpacing: '0.06em',
              color: isCritical ? 'var(--status-error)' : isFlashSale ? 'var(--status-warn)' : 'var(--status-ok)'
            }}>
              {isCritical ? 'CRITICAL TRAFFIC SURGE' : isFlashSale ? 'FLASH SALE ACTIVE' : 'ALL SYSTEMS OPERATIONAL'}
            </span>
          </div>
        </div>
      </div>

      {/* Guide Mode Explainer Card for Judges / Anyone */}
      {guideMode && (
        <div className="guide-card">
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px' }}>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '6px', background: 'rgba(6,182,212,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Sparkles size={16} color="var(--accent-cyan)" />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)' }}>
                    In Simple Terms: How FlashForge Works
                  </span>
                  <span className="analogy-pill">Real-World Analogy</span>
                </div>
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                  Imagine 10,000 customers rushing through a store door at once. A standard server would crash (500 Error).
                  <strong> FlashForge acts as the automated brain</strong>: the Load Balancer directs the line, Redis Cache answers instant queries in &lt;2ms,
                  the Message Queue safely buffers requests so nothing is lost, and Auto-Scaling spins up fresh cloud pods in seconds!
                </p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
              <button
                className="btn btn-outline"
                style={{ fontSize: '10px', padding: '6px 12px' }}
                onClick={() => dispatch({ type: 'SET_SCENARIO', scenario: 'FLASH_SALE', targetRps: 10000 })}
              >
                <Zap size={11} color="var(--status-warn)" /> Test Flash Surge
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Metric cards row */}
      <motion.div variants={fadeUp} style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <MetricCard
          icon={<Activity size={16} />}
          label="Requests / Sec"
          value={Math.round(rps).toLocaleString()}
          color={isCritical ? 'var(--status-error)' : isFlashSale ? 'var(--status-warn)' : 'var(--text-primary)'}
          sub={`Target: ${state.targetRps.toLocaleString()} req/s`}
        />
        <MetricCard
          icon={<Users size={16} />}
          label="Active Users"
          value={Math.round(users).toLocaleString()}
          sub="Simulated concurrent sessions"
        />
        <MetricCard
          icon={<Clock size={16} />}
          label="Avg Latency"
          value={Math.round(latency).toString()}
          unit="ms"
          color={latency > 300 ? 'var(--status-error)' : latency > 150 ? 'var(--status-warn)' : 'var(--status-ok)'}
          sub={`P99 SLA: ${Math.round(state.p99Latency)}ms`}
        />
        <MetricCard
          icon={<Server size={16} />}
          label="Active Pods"
          value={Math.round(totalInstances).toString()}
          color="var(--accent-cyan)"
          sub={`${healthyApi} API · ${healthyWorker} Workers`}
        />
        <MetricCard
          icon={<ShieldCheck size={16} />}
          label="Error Rate"
          value={errorRate.toFixed(2)}
          unit="%"
          color={state.errorRate > 0.05 ? 'var(--status-error)' : state.errorRate > 0.01 ? 'var(--status-warn)' : 'var(--status-ok)'}
          sub={`${state.successfulRequests.toLocaleString()} succeeded`}
        />
      </motion.div>

      {/* Live Traffic Graph */}
      <div className="panel" style={{ padding: '18px' }}>
        <div className="panel-header" style={{ padding: '0 0 14px', border: 'none', marginBottom: '4px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span className="text-label" style={{ fontSize: '11px', color: 'var(--text-primary)' }}>Live Traffic vs. Fleet Capacity</span>
            <span className={`badge badge-${isCritical ? 'error' : isFlashSale ? 'warn' : 'ok'}`}>
              {phase.label}
            </span>
          </div>
          <div style={{ display: 'flex', gap: '18px' }}>
            <LegendItem color={gradientColor} label="Incoming Traffic (RPS)" />
            <LegendItem color="#10b981" label="Fleet Capacity Ceiling" dashed />
          </div>
        </div>
        <ResponsiveContainer width="100%" height={210}>
          <AreaChart data={chartData} margin={{ top: 6, right: 0, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="rpsGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={gradientColor} stopOpacity={0.4} />
                <stop offset="95%" stopColor={gradientColor} stopOpacity={0.01} />
              </linearGradient>
              <linearGradient id="capGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.01} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis dataKey="t" hide />
            <YAxis
              width={52}
              tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}
              tick={{ fontSize: 10, fontFamily: 'IBM Plex Mono', fill: 'var(--text-muted)' }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              contentStyle={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-accent)', borderRadius: '6px', fontFamily: 'IBM Plex Mono', fontSize: '11px', color: 'var(--text-primary)' }}
              formatter={(v: unknown, name: any) => [`${Number(v).toLocaleString()} req/s`, name === 'rps' ? 'Traffic' : 'Capacity']}
              labelFormatter={() => 'Real-time telemetry'}
            />
            <Area type="monotone" dataKey="capacity" stroke="#10b981" strokeWidth={1.5} strokeDasharray="4 4" fill="url(#capGrad)" dot={false} />
            <Area type="monotone" dataKey="rps" stroke={gradientColor} strokeWidth={2.5} fill="url(#rpsGrad)" dot={false} isAnimationActive={false} />
          </AreaChart>
        </ResponsiveContainer>

        {/* Phase selector markers */}
        <div style={{ display: 'flex', gap: '8px', marginTop: '10px', paddingTop: '10px', borderTop: '1px solid var(--border)', flexWrap: 'wrap' }}>
          {(['NORMAL', 'ELEVATED', 'FLASH_SALE', 'CRITICAL', 'RECOVERY'] as const).map(p => (
            <PhaseTag
              key={p}
              label={PHASE_LABELS[p].label}
              color={PHASE_LABELS[p].color}
              active={state.scenario === p}
              onClick={() => dispatch({
                type: 'SET_SCENARIO',
                scenario: p,
                targetRps: p === 'NORMAL' ? 500 : p === 'ELEVATED' ? 2000 : p === 'FLASH_SALE' ? 10000 : p === 'CRITICAL' ? 25000 : 5000
              })}
            />
          ))}
        </div>
      </div>

      {/* Bottom telemetry row */}
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
        {/* Queue status */}
        <div className="panel" style={{ flex: 1, minWidth: '280px', padding: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span className="text-label">Message Queue Buffer</span>
            <Layers size={14} color="var(--accent-cyan)" />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <QueueBar label="Queue Depth" value={state.queueDepth} max={5000} color={state.queueDepth > 1000 ? 'var(--status-error)' : state.queueDepth > 300 ? 'var(--status-warn)' : 'var(--status-ok)'} />
            <QueueBar label="Workers In-Flight" value={state.queueProcessed % 1000} max={1000} color="var(--accent-blue)" />
            <div className="data-row">
              <span className="text-label">Processed Jobs</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--status-ok)', fontWeight: 600 }}>{state.queueProcessed.toLocaleString()}</span>
            </div>
            <div className="data-row">
              <span className="text-label">Dropped / Failed</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--status-error)', fontWeight: 600 }}>{state.queueFailed}</span>
            </div>
            <div className="data-row" style={{ border: 'none' }}>
              <span className="text-label">Auto-Retrying</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--status-warn)', fontWeight: 600 }}>{state.queueRetrying}</span>
            </div>
          </div>
        </div>

        {/* Recent incidents & alerts */}
        <div className="panel" style={{ flex: 2, minWidth: '340px', padding: '16px', overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span className="text-label">Live Ops Incident Feed</span>
            <span style={{ fontSize: '9px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>Auto-healing events</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', overflow: 'hidden' }}>
            {state.incidents.slice(0, 5).map(inc => (
              <div
                key={inc.id}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '8px',
                  padding: '7px 10px',
                  background: 'var(--bg-elevated)',
                  borderRadius: 'var(--radius-sm)',
                  border: `1px solid ${inc.severity === 'critical' ? 'rgba(239,68,68,0.25)' : inc.severity === 'warning' ? 'rgba(245,158,11,0.2)' : 'var(--border)'}`
                }}
              >
                <span className={`status-dot ${inc.severity === 'critical' ? 'error' : inc.severity === 'warning' ? 'warn' : inc.severity === 'resolved' ? 'ok' : 'info'}`} style={{ marginTop: '4px' }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {inc.message}
                  </div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'var(--text-muted)', marginTop: '2px' }}>
                    <ClientTime timestamp={inc.timestamp} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CPU utilization & threshold */}
        <div className="panel" style={{ flex: 1, minWidth: '260px', padding: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span className="text-label">Cluster CPU Health</span>
            <Cpu size={14} color="var(--status-warn)" />
          </div>
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
              <ReferenceLine y={65} stroke="rgba(239,68,68,0.5)" strokeDasharray="3 3" />
            </AreaChart>
          </ResponsiveContainer>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px' }}>
            <span className="text-label">Current Avg CPU</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', color: 'var(--status-warn)', fontWeight: 700 }}>
              {Math.round(state.cpuHistory[state.cpuHistory.length - 1] || 0)}%
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span className="text-label">Autoscale Target</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)' }}>65%</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function LegendItem({ color, label, dashed }: { color: string; label: string; dashed?: boolean }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
      <div style={{
        width: '18px',
        height: '2px',
        background: color,
        borderTop: dashed ? '2px dashed ' + color : undefined
      }} />
      <span className="text-label" style={{ fontSize: '9px' }}>{label}</span>
    </div>
  );
}

function PhaseTag({ label, color, active, onClick }: { label: string; color: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '5px 12px',
        borderRadius: 'var(--radius-sm)',
        fontFamily: 'var(--font-mono)',
        fontSize: '9px',
        fontWeight: 700,
        letterSpacing: '0.08em',
        background: active ? `${color}22` : 'rgba(255, 255, 255, 0.02)',
        color: active ? color : 'var(--text-muted)',
        border: `1px solid ${active ? color + '66' : 'var(--border)'}`,
        cursor: 'pointer',
        transition: 'all 0.2s',
      }}
    >
      {label}
    </button>
  );
}

function QueueBar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
        <span className="text-label">{label}</span>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-secondary)' }}>
          {Math.round(value).toLocaleString()}
        </span>
      </div>
      <div className="progress-track">
        <div className="progress-fill" style={{ width: `${pct}%`, background: color, transition: 'width 0.5s ease' }} />
      </div>
    </div>
  );
}

function ClientTime({ timestamp }: { timestamp: number }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return (
    <span suppressHydrationWarning>
      {mounted ? formatTime(timestamp) : '--:--:--'}
    </span>
  );
}

