'use client';
import { useState, useMemo } from 'react';
import { useSimulation } from '@/context/SimulationContext';
import { COST_PER_INSTANCE_HOUR, STATIC_INSTANCES } from '@/lib/simulation/scenarios';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { 
  DollarSign, 
  TrendingDown, 
  Calculator, 
  PiggyBank, 
  AlertCircle, 
  Sparkles, 
  Cpu, 
  Layers, 
  CheckCircle2, 
  Zap,
  Info,
  Leaf
} from 'lucide-react';

export default function CostIntelligence() {
  const { state, guideMode } = useSimulation();

  // Interactive ROI Calculator State
  const [flashEventsPerMonth, setFlashEventsPerMonth] = useState(6);
  const [surgeDurationHours, setSurgeDurationHours] = useState(3);
  const [peakInstancesNeeded, setPeakInstancesNeeded] = useState(24);
  const [baselineInstances, setBaselineInstances] = useState(3);

  const totalInstances = state.apiInstances.length + state.workerInstances.length;
  const staticCostPerHour = STATIC_INSTANCES * COST_PER_INSTANCE_HOUR;
  const dynamicCostPerHour = state.costPerHour;
  const savingsPct = Math.max(0, Math.round((1 - dynamicCostPerHour / staticCostPerHour) * 100));
  const dailySavings = (staticCostPerHour - dynamicCostPerHour) * 24;

  // Monthly ROI Calculations
  const hoursPerMonth = 720;
  const surgeHoursPerMonth = flashEventsPerMonth * surgeDurationHours;
  const normalHoursPerMonth = hoursPerMonth - surgeHoursPerMonth;

  // Static Provisioning: Paid for peak 24/7/365
  const monthlyStaticBill = peakInstancesNeeded * hoursPerMonth * COST_PER_INSTANCE_HOUR;

  // FlashForge Elastic Provisioning: Baseline normal hours + Scaled during surge hours
  const monthlyElasticBill = 
    (baselineInstances * normalHoursPerMonth * COST_PER_INSTANCE_HOUR) + 
    (peakInstancesNeeded * surgeHoursPerMonth * COST_PER_INSTANCE_HOUR);

  const monthlyDollarSavings = Math.max(0, monthlyStaticBill - monthlyElasticBill);
  const monthlySavingsPercent = Math.round((monthlyDollarSavings / monthlyStaticBill) * 100);
  const annualSavings = monthlyDollarSavings * 12;

  // Estimated idle carbon / energy saved (approx 80W per idle cloud server core)
  const idleKwhSaved = Math.round(((peakInstancesNeeded - baselineInstances) * normalHoursPerMonth * 0.08));

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
    { name: 'Normal (3 inst)', dynamic: 3 * COST_PER_INSTANCE_HOUR, static: staticCostPerHour },
    { name: 'Lunch Rush (6 inst)', dynamic: 6 * COST_PER_INSTANCE_HOUR, static: staticCostPerHour },
    { name: 'Flash Sale (18 inst)', dynamic: 18 * COST_PER_INSTANCE_HOUR, static: staticCostPerHour },
    { name: 'Recovery (8 inst)', dynamic: 8 * COST_PER_INSTANCE_HOUR, static: staticCostPerHour },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', maxWidth: '1400px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div className="text-label" style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <DollarSign size={12} color="var(--accent-cyan)" />
            CLOUD COST INTELLIGENCE & FINOPS
          </div>
          <h1 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', marginTop: '2px' }}>
            Elastic Scaling vs. Static Over-Provisioning
          </h1>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <span className="badge badge-cyan" style={{ fontSize: '9px', padding: '4px 10px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Zap size={10} /> DYNAMIC HOURLY BILLING
          </span>
        </div>
      </div>

      {/* Guide Mode Explainer Card */}
      {guideMode && (
        <div className="guide-card animate-fade-in">
          <div className="guide-title">
            <Info size={14} color="var(--accent-cyan)" />
            Beginner Analogy: The 50-Passenger Bus vs. On-Demand Ride Fleet
          </div>
          <div className="guide-body">
            <strong>Static Over-Provisioning</strong> is like paying to keep a 50-passenger chartered bus driving around empty 24 hours a day, 365 days a year—just in case your company has a sudden flash sale.<br />
            <strong>FlashForge Elastic Auto-Scaling</strong> is like using an on-demand ride fleet: pay for 2 passenger seats during normal hours ($0.19/hr), summon 20 vehicles when thousands of customers arrive for a 30-minute flash sale, and release them immediately the second the sale ends.
          </div>
        </div>
      )}

      {/* Key metric row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
        <div className="panel" style={{ padding: '16px', border: '1px solid rgba(16,185,129,0.3)', background: 'rgba(16,185,129,0.04)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <div className="text-label" style={{ color: 'var(--status-ok)' }}>Live Cost Efficiency</div>
            <PiggyBank size={16} color="var(--status-ok)" />
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '36px', fontWeight: 800, color: 'var(--status-ok)', lineHeight: 1 }}>{savingsPct}%</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-muted)', marginTop: '6px' }}>
            vs. always-on {STATIC_INSTANCES}-instance static peak fleet
          </div>
        </div>

        <div className="panel" style={{ padding: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <div className="text-label">FlashForge Dynamic</div>
            <Sparkles size={16} color="var(--accent-cyan)" />
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '24px', fontWeight: 700, color: 'var(--accent-cyan)', lineHeight: 1 }}>
            ${dynamicCostPerHour.toFixed(3)}<span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>/hr</span>
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-muted)', marginTop: '6px' }}>
            {totalInstances} active instances ({state.apiInstances.length} API + {state.workerInstances.length} Worker)
          </div>
        </div>

        <div className="panel" style={{ padding: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <div className="text-label">Static Provisioning</div>
            <AlertCircle size={16} color="var(--status-error)" />
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '24px', fontWeight: 700, color: 'var(--status-error)', lineHeight: 1 }}>
            ${staticCostPerHour.toFixed(3)}<span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>/hr</span>
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-muted)', marginTop: '6px' }}>
            {STATIC_INSTANCES} instances always billed 24/7/365
          </div>
        </div>

        <div className="panel" style={{ padding: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <div className="text-label">Projected Daily Savings</div>
            <TrendingDown size={16} color="var(--status-ok)" />
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '24px', fontWeight: 700, color: 'var(--status-ok)', lineHeight: 1 }}>
            ${Math.max(0, dailySavings).toFixed(2)}<span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>/day</span>
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-muted)', marginTop: '6px' }}>
            ${(Math.max(0, dailySavings) * 30).toFixed(0)}/mo automated infrastructure savings
          </div>
        </div>
      </div>

      {/* Cost over time chart */}
      <div className="panel" style={{ padding: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', alignItems: 'center' }}>
          <div>
            <span className="text-label">Real-Time Cost Telemetry</span>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
              Live comparison of money burned: Dynamic elasticity hugs the actual demand curve
            </div>
          </div>
          <div style={{ display: 'flex', gap: '16px' }}>
            <LegendItem color="var(--accent-cyan)" label="FlashForge (Dynamic Elasticity)" />
            <LegendItem color="rgba(239,68,68,0.7)" label="Static Provisioning (Always Over-Billed)" dashed />
          </div>
        </div>
        <ResponsiveContainer width="100%" height={170}>
          <AreaChart data={costChartData} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="dynCostGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="staticCostGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.12} />
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
            <Area type="monotone" dataKey="static" stroke="rgba(239,68,68,0.6)" strokeWidth={1.5} strokeDasharray="6 4" fill="url(#staticCostGrad)" dot={false} isAnimationActive={false} />
            <Area type="monotone" dataKey="dynamic" stroke="var(--accent-cyan)" strokeWidth={2} fill="url(#dynCostGrad)" dot={false} isAnimationActive={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Interactive Monthly ROI Calculator */}
      <div className="panel" style={{ padding: '18px', border: '1px solid var(--border-accent)', background: 'linear-gradient(180deg, var(--bg-surface) 0%, rgba(6,182,212,0.03) 100%)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Calculator size={16} color="var(--accent-cyan)" />
              <span className="text-label" style={{ color: 'var(--accent-cyan)' }}>INTERACTIVE ROI CALCULATOR</span>
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', marginTop: '3px' }}>
              Estimate Your Organization’s Real-World Annual Cloud Savings
            </div>
          </div>
          <span className="badge badge-green" style={{ fontSize: '10px' }}>
            <Sparkles size={10} style={{ marginRight: '4px' }} />
            FINOPS CERTIFIED
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '20px' }}>
          {/* Sliders */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {/* Slider 1 */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-secondary)' }}>
                  Flash Sales / High-Traffic Events per Month
                </span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', fontWeight: 700, color: 'var(--accent-cyan)' }}>
                  {flashEventsPerMonth} events
                </span>
              </div>
              <input
                type="range"
                min={1}
                max={20}
                value={flashEventsPerMonth}
                onChange={(e) => setFlashEventsPerMonth(Number(e.target.value))}
                className="custom-range"
                style={{ width: '100%' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-mono)', fontSize: '8px', color: 'var(--text-muted)', marginTop: '2px' }}>
                <span>1 event/mo</span>
                <span>10 events/mo</span>
                <span>20 events/mo</span>
              </div>
            </div>

            {/* Slider 2 */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-secondary)' }}>
                  Average Flash Sale Duration
                </span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', fontWeight: 700, color: 'var(--accent-cyan)' }}>
                  {surgeDurationHours} hours
                </span>
              </div>
              <input
                type="range"
                min={1}
                max={8}
                value={surgeDurationHours}
                onChange={(e) => setSurgeDurationHours(Number(e.target.value))}
                className="custom-range"
                style={{ width: '100%' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-mono)', fontSize: '8px', color: 'var(--text-muted)', marginTop: '2px' }}>
                <span>1 hr</span>
                <span>4 hrs</span>
                <span>8 hrs</span>
              </div>
            </div>

            {/* Slider 3 */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-secondary)' }}>
                  Peak Fleet Size Required (Worst-Case Spike)
                </span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', fontWeight: 700, color: 'var(--status-error)' }}>
                  {peakInstancesNeeded} instances
                </span>
              </div>
              <input
                type="range"
                min={8}
                max={60}
                value={peakInstancesNeeded}
                onChange={(e) => setPeakInstancesNeeded(Number(e.target.value))}
                className="custom-range"
                style={{ width: '100%' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-mono)', fontSize: '8px', color: 'var(--text-muted)', marginTop: '2px' }}>
                <span>8 instances</span>
                <span>30 instances</span>
                <span>60 instances</span>
              </div>
            </div>

            {/* Slider 4 */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-secondary)' }}>
                  Off-Peak Quiet Fleet Baseline
                </span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', fontWeight: 700, color: 'var(--status-ok)' }}>
                  {baselineInstances} instances
                </span>
              </div>
              <input
                type="range"
                min={1}
                max={6}
                value={baselineInstances}
                onChange={(e) => setBaselineInstances(Number(e.target.value))}
                className="custom-range"
                style={{ width: '100%' }}
              />
            </div>
          </div>

          {/* Results Summary Box */}
          <div style={{ background: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)', padding: '16px', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div className="text-label" style={{ marginBottom: '10px' }}>ESTIMATED ANNUAL IMPACT</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '6px' }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '32px', fontWeight: 800, color: 'var(--status-ok)' }}>
                  ${annualSavings.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                </div>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--status-ok)', fontWeight: 600 }}>
                  ({monthlySavingsPercent}% saved)
                </span>
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-muted)', marginBottom: '14px' }}>
                Net cloud spend reduction per calendar year
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', borderTop: '1px solid var(--border)', paddingTop: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-mono)', fontSize: '10px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Static Always-On Bill:</span>
                  <span style={{ color: 'var(--status-error)', fontWeight: 600 }}>${(monthlyStaticBill * 12).toLocaleString('en-US', { maximumFractionDigits: 0 })}/yr</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-mono)', fontSize: '10px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>FlashForge Elastic Bill:</span>
                  <span style={{ color: 'var(--accent-cyan)', fontWeight: 600 }}>${(monthlyElasticBill * 12).toLocaleString('en-US', { maximumFractionDigits: 0 })}/yr</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-mono)', fontSize: '10px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Monthly Flash Sale Window:</span>
                  <span style={{ color: 'var(--text-secondary)' }}>{surgeHoursPerMonth} hrs surge / {normalHoursPerMonth} hrs quiet</span>
                </div>
              </div>
            </div>

            {/* Environmental Metric */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 10px', background: 'rgba(16,185,129,0.06)', borderRadius: '4px', border: '1px solid rgba(16,185,129,0.2)', marginTop: '12px' }}>
              <Leaf size={14} color="var(--status-ok)" style={{ flexShrink: 0 }} />
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'var(--text-secondary)' }}>
                <strong>Green Cloud:</strong> Prevents ~{idleKwhSaved * 12} kWh of wasted idle electricity every year.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Comparison across scenarios + Scale path */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px' }}>
        <div className="panel" style={{ padding: '16px' }}>
          <div className="text-label" style={{ marginBottom: '12px' }}>Cost Comparison by Traffic Scenario</div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={comparisonData} margin={{ top: 4, right: 0, left: 0, bottom: 0 }} barGap={6}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 9, fontFamily: 'IBM Plex Mono', fill: 'var(--text-muted)' }} tickLine={false} axisLine={false} />
              <YAxis tickFormatter={(v) => `$${v.toFixed(2)}`} tick={{ fontSize: 9, fontFamily: 'IBM Plex Mono', fill: 'var(--text-muted)' }} tickLine={false} axisLine={false} width={55} />
              <Tooltip
                contentStyle={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-accent)', borderRadius: '4px', fontFamily: 'IBM Plex Mono', fontSize: '11px' }}
                formatter={(v: unknown) => [`$${Number(v).toFixed(4)}/hr`, '']}
              />
              <Bar dataKey="static" fill="rgba(239,68,68,0.4)" radius={[3, 3, 0, 0]} name="Static Provisioning" />
              <Bar dataKey="dynamic" fill="rgba(6,182,212,0.7)" radius={[3, 3, 0, 0]} name="FlashForge Elastic" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Scale path visual */}
        <div className="panel" style={{ padding: '16px' }}>
          <div className="text-label" style={{ marginBottom: '12px' }}>Elastic Scaling Lifecycle</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {[
              { label: 'BASELINE', instances: 4, cost: (4 * COST_PER_INSTANCE_HOUR).toFixed(3), color: '#10b981', note: 'Low traffic, low burn' },
              { label: 'ELEVATED', instances: 8, cost: (8 * COST_PER_INSTANCE_HOUR).toFixed(3), color: '#f59e0b', note: 'Pre-scale trigger active' },
              { label: 'FLASH PEAK', instances: 18, cost: (18 * COST_PER_INSTANCE_HOUR).toFixed(3), color: '#ef4444', note: 'Maximum capacity engaged' },
              { label: 'DRAINING', instances: 8, cost: (8 * COST_PER_INSTANCE_HOUR).toFixed(3), color: '#06b6d4', note: 'Graceful wind-down' },
              { label: 'NORMALIZED', instances: 4, cost: (4 * COST_PER_INSTANCE_HOUR).toFixed(3), color: '#10b981', note: 'Returned to idle state' },
            ].map((sc, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '4px 6px', borderRadius: '4px', background: 'var(--bg-elevated)' }}>
                <div style={{ width: '3px', height: '24px', background: sc.color, borderRadius: '2px', flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span className="text-label" style={{ color: sc.color, fontSize: '9px' }}>{sc.label}</span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'var(--accent-cyan)' }}>${sc.cost}/hr</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1px' }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '8px', color: 'var(--text-muted)' }}>{sc.note}</span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '8px', color: 'var(--text-secondary)' }}>{sc.instances} nodes</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* FinOps Disclaimer */}
      <div style={{ padding: '10px 14px', background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Info size={14} color="var(--accent-cyan)" style={{ flexShrink: 0 }} />
        <span>
          <strong>FinOps Methodology:</strong> Calculations based on standard cloud compute tiers at $0.096/instance-hour (e.g. 2 vCPU, 4GB RAM general compute). Static fleet assumes 20 nodes provisioned 24/7. FlashForge dynamic elasticity scales down to minimum required baseline whenever traffic diminishes.
        </span>
      </div>
    </div>
  );
}

function LegendItem({ color, label, dashed }: { color: string; label: string; dashed?: boolean }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
      <div style={{ width: '20px', height: '2px', background: dashed ? 'transparent' : color, borderTop: dashed ? `2px dashed ${color}` : 'none' }} />
      <span className="text-label" style={{ fontSize: '9px' }}>{label}</span>
    </div>
  );
}

