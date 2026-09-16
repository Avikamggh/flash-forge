'use client';
import { useSimulation } from '@/context/SimulationContext';
import { COST_PER_INSTANCE_HOUR, STATIC_INSTANCES } from '@/lib/simulation/scenarios';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';
import { useMemo } from 'react';

export default function CostIntelligence() {
  const { state } = useSimulation();

  const totalInstances = state.apiInstances.length + state.workerInstances.length;
  const staticCostPerHour = STATIC_INSTANCES * COST_PER_INSTANCE_HOUR;
  const dynamicCostPerHour = state.costPerHour;
  const savingsPct = Math.max(0, Math.round((1 - dynamicCostPerHour / staticCostPerHour) * 100));
  const dailySavings = (staticCostPerHour - dynamicCostPerHour) * 24;

  const costChartData = useMemo(() =>
    state.costHistory.map((v, i) => ({
      t: i,
      dynamic: parseFloat(v.toFixed(4)),
      static: parseFloat(staticCostPerHour.toFixed(4)),
    })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [state.tick]
  );

  const comparisonData = [
    { name: 'Normal (2 inst)', dynamic: 2 * COST_PER_INSTANCE_HOUR, static: staticCostPerHour },
    { name: 'Lunch Rush', dynamic: 6 * COST_PER_INSTANCE_HOUR, static: staticCostPerHour },
    { name: 'Flash Sale', dynamic: 18 * COST_PER_INSTANCE_HOUR, static: staticCostPerHour },
    { name: 'Peak (12 inst)', dynamic: 12 * COST_PER_INSTANCE_HOUR, static: staticCostPerHour },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxWidth: '1400px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div className="text-label" style={{ color: 'var(--text-muted)' }}>CLOUD COST INTELLIGENCE</div>
          <h1 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', marginTop: '2px' }}>
            Auto-Scaling vs. Static Over-Provisioning
          </h1>
        </div>
        <span className="badge badge-cyan" style={{ fontSize: '9px', padding: '4px 10px' }}>SIMULATED ESTIMATES</span>
      </div>

      {/* Key metric row */}
      <div style={{ display: 'flex', gap: '8px' }}>
        <div className="panel" style={{ flex: 1, padding: '16px', border: '1px solid rgba(16,185,129,0.2)', background: 'rgba(16,185,129,0.04)' }}>
          <div className="text-label" style={{ marginBottom: '6px' }}>Estimated Cost Savings</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '36px', fontWeight: 800, color: 'var(--status-ok)', lineHeight: 1 }}>{savingsPct}%</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-muted)', marginTop: '4px' }}>vs. always-on {STATIC_INSTANCES}-instance fleet</div>
        </div>
        <div className="panel" style={{ flex: 1, padding: '16px' }}>
          <div className="text-label" style={{ marginBottom: '6px' }}>FlashForge Auto-Scaling</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '22px', fontWeight: 700, color: 'var(--accent-cyan)', lineHeight: 1 }}>
            ${dynamicCostPerHour.toFixed(3)}<span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>/hr</span>
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-muted)', marginTop: '4px' }}>{totalInstances} instances currently active</div>
        </div>
        <div className="panel" style={{ flex: 1, padding: '16px' }}>
          <div className="text-label" style={{ marginBottom: '6px' }}>Static Over-Provisioning</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '22px', fontWeight: 700, color: 'var(--status-error)', lineHeight: 1 }}>
            ${staticCostPerHour.toFixed(3)}<span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>/hr</span>
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-muted)', marginTop: '4px' }}>{STATIC_INSTANCES} instances always running</div>
        </div>
        <div className="panel" style={{ flex: 1, padding: '16px' }}>
          <div className="text-label" style={{ marginBottom: '6px' }}>Projected Daily Savings</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '22px', fontWeight: 700, color: 'var(--status-ok)', lineHeight: 1 }}>
            ${Math.max(0, dailySavings).toFixed(2)}
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-muted)', marginTop: '4px' }}>based on current traffic pattern</div>
        </div>
      </div>

      {/* Cost over time */}
      <div className="panel" style={{ padding: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
          <span className="text-label">Cost Over Time (Simulated)</span>
          <div style={{ display: 'flex', gap: '16px' }}>
            <LegendItem color="var(--accent-cyan)" label="FlashForge (dynamic)" />
            <LegendItem color="rgba(239,68,68,0.6)" label="Static fleet" />
          </div>
        </div>
        <ResponsiveContainer width="100%" height={180}>
          <AreaChart data={costChartData} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="dynCostGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="staticCostGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis dataKey="t" hide />
            <YAxis tickFormatter={(v) => `$${v.toFixed(2)}`} tick={{ fontSize: 9, fontFamily: 'IBM Plex Mono', fill: 'var(--text-muted)' }} tickLine={false} axisLine={false} width={55} />
            <Tooltip
              contentStyle={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-accent)', borderRadius: '4px', fontFamily: 'IBM Plex Mono', fontSize: '11px' }}
              formatter={(v: unknown) => [`$${Number(v).toFixed(4)}/hr`, '']}
              labelFormatter={() => ''}
            />
            <Area type="monotone" dataKey="static" stroke="rgba(239,68,68,0.5)" strokeWidth={1} strokeDasharray="6 4" fill="url(#staticCostGrad)" dot={false} isAnimationActive={false} />
            <Area type="monotone" dataKey="dynamic" stroke="var(--accent-cyan)" strokeWidth={2} fill="url(#dynCostGrad)" dot={false} isAnimationActive={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Comparison across scenarios */}
      <div style={{ display: 'flex', gap: '12px' }}>
        <div className="panel" style={{ flex: 2, padding: '16px' }}>
          <div className="text-label" style={{ marginBottom: '12px' }}>Cost Comparison by Scenario</div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={comparisonData} margin={{ top: 4, right: 0, left: 0, bottom: 0 }} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 9, fontFamily: 'IBM Plex Mono', fill: 'var(--text-muted)' }} tickLine={false} axisLine={false} />
              <YAxis tickFormatter={(v) => `$${v.toFixed(2)}`} tick={{ fontSize: 9, fontFamily: 'IBM Plex Mono', fill: 'var(--text-muted)' }} tickLine={false} axisLine={false} width={55} />
              <Tooltip
                contentStyle={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-accent)', borderRadius: '4px', fontFamily: 'IBM Plex Mono', fontSize: '11px' }}
                formatter={(v: unknown) => [`$${Number(v).toFixed(4)}/hr`, '']}
              />
              <Bar dataKey="static" fill="rgba(239,68,68,0.4)" radius={2} name="Static" />
              <Bar dataKey="dynamic" fill="rgba(6,182,212,0.6)" radius={2} name="FlashForge" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Scale path visual */}
        <div className="panel" style={{ flex: 1, padding: '16px' }}>
          <div className="text-label" style={{ marginBottom: '12px' }}>Scale Path</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {[
              { label: 'NORMAL', instances: 4, cost: (4 * COST_PER_INSTANCE_HOUR).toFixed(3), color: '#10b981' },
              { label: 'ELEVATED', instances: 8, cost: (8 * COST_PER_INSTANCE_HOUR).toFixed(3), color: '#f59e0b' },
              { label: 'FLASH SALE', instances: 18, cost: (18 * COST_PER_INSTANCE_HOUR).toFixed(3), color: '#ef4444' },
              { label: 'RECOVERY', instances: 8, cost: (8 * COST_PER_INSTANCE_HOUR).toFixed(3), color: '#06b6d4' },
              { label: 'NORMAL', instances: 4, cost: (4 * COST_PER_INSTANCE_HOUR).toFixed(3), color: '#10b981' },
            ].map((sc, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '2px', background: sc.color, alignSelf: 'stretch', borderRadius: '1px' }} />
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                    <span className="text-label" style={{ color: sc.color }}>{sc.label}</span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'var(--text-muted)' }}>${sc.cost}/hr</span>
                  </div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'var(--text-secondary)' }}>
                    {sc.instances} instances
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Disclaimer */}
      <div style={{ padding: '10px 14px', background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'var(--text-muted)' }}>
        ⓘ SIMULATED ESTIMATES — Costs based on $0.096/instance-hour. Actual cloud billing varies by provider, region, and resource class. Static fleet assumes always-on 20 instances. FlashForge dynamically provisions only what is needed.
      </div>
    </div>
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
