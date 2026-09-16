'use client';
import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSimulation } from '@/context/SimulationContext';
import { SCENARIOS } from '@/lib/simulation/scenarios';
import { playFlashSaleSound } from '@/lib/utils/sounds';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const FLASH_PHASES = [
  { label: '100', rps: 100, pct: 1 },
  { label: '500', rps: 500, pct: 5 },
  { label: '1,500', rps: 1500, pct: 15 },
  { label: '5,000', rps: 5000, pct: 50 },
  { label: '10,000', rps: 10000, pct: 100 },
];

export default function TrafficSimulator() {
  const { state, dispatch } = useSimulation();
  const [flashActive, setFlashActive] = useState(false);
  const [flashPhaseIdx, setFlashPhaseIdx] = useState(0);

  const isFlashSale = state.currentRps > 3000;
  const totalInstances = state.apiInstances.filter(i => i.status !== 'failed').length + state.workerInstances.filter(i => i.status !== 'failed').length;

  const initiateFlashSale = () => {
    if (flashActive) {
      setFlashActive(false);
      setFlashPhaseIdx(0);
      dispatch({ type: 'SET_SCENARIO', scenario: 'NORMAL', targetRps: 500 });
      return;
    }
    // Play dramatic sound effect
    playFlashSaleSound();
    setFlashActive(true);
    setFlashPhaseIdx(0);
    dispatch({ type: 'SET_SCENARIO', scenario: 'FLASH_SALE', targetRps: 100 });

    const phases = [
      { rps: 100, delay: 0 },
      { rps: 500, delay: 2000 },
      { rps: 1500, delay: 4000 },
      { rps: 5000, delay: 7000 },
      { rps: 10000, delay: 11000 },
    ];
    phases.forEach(({ rps, delay }, i) => {
      setTimeout(() => {
        dispatch({ type: 'SET_TARGET_RPS', rps });
        setFlashPhaseIdx(i);
      }, delay);
    });
  };

  const currentPhaseLabel = () => {
    const rps = state.currentRps;
    if (rps >= 8000) return '10,000 req/s';
    if (rps >= 3000) return '5,000 req/s';
    if (rps >= 1000) return '1,500 req/s';
    if (rps >= 300) return '500 req/s';
    return '100 req/s';
  };

  const loadPct = Math.min((state.currentRps / 10000) * 100, 100);
  const loadColor = loadPct > 80 ? 'var(--status-error)' : loadPct > 50 ? 'var(--status-warn)' : 'var(--status-ok)';

  // Cache hit rate and throughput
  const cacheHitPct = Math.round(state.cacheHitRate * 100);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxWidth: '1400px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div className="text-label" style={{ color: 'var(--text-muted)' }}>TRAFFIC EVENT SIMULATOR</div>
          <h1 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', marginTop: '2px' }}>Flash Sale Control Panel</h1>
        </div>
        <span className={`badge badge-${isFlashSale ? 'error' : 'ok'}`} style={{ fontSize: '10px' }}>
          {isFlashSale ? '⚡ FLASH SALE ACTIVE' : '● IDLE'}
        </span>
      </div>

      <div style={{ display: 'flex', gap: '12px' }}>
        {/* Main flash sale panel */}
        <div className="panel" style={{ flex: 2, padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Flash sale button */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', padding: '24px', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)', border: `1px solid ${flashActive ? 'rgba(239,68,68,0.3)' : 'var(--border-accent)'}` }}>
            {flashActive && (
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--status-error)', letterSpacing: '0.2em', animation: 'pulse-ok 1s infinite' }}>
                ● FLASH SALE IN PROGRESS
              </div>
            )}
            <button
              className={`btn btn-flash ${flashActive ? 'active' : ''}`}
              onClick={initiateFlashSale}
              style={{ fontSize: '14px', padding: '20px 48px', width: '100%', maxWidth: '360px', justifyContent: 'center' }}
            >
              {flashActive ? '⏹ TERMINATE FLASH SALE' : '⚡ INITIATE FLASH SALE'}
            </button>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-muted)', textAlign: 'center', letterSpacing: '0.05em' }}>
              {flashActive
                ? 'Traffic ramping: 100 → 500 → 1,500 → 5,000 → 10,000 req/s'
                : 'Simulates a real flash sale traffic spike — triggers auto-scaling, queue management, and cost optimization'
              }
            </div>
          </div>

          {/* Load bar */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <span className="text-label">Traffic Load</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: loadColor, fontWeight: 600 }}>
                {Math.round(state.currentRps).toLocaleString()} req/s
              </span>
            </div>
            <div style={{ position: 'relative', height: '16px', background: 'var(--bg-elevated)', borderRadius: '2px', border: '1px solid var(--border)', overflow: 'hidden' }}>
              <div style={{
                position: 'absolute', top: 0, left: 0, bottom: 0,
                width: `${loadPct}%`,
                background: `linear-gradient(90deg, #10b981, ${loadColor})`,
                transition: 'width 0.4s ease, background 0.4s ease',
                boxShadow: loadPct > 80 ? `0 0 12px ${loadColor}44` : 'none',
              }} />
              {/* Tick marks */}
              {[25, 50, 75].map(p => (
                <div key={p} style={{ position: 'absolute', top: 0, bottom: 0, left: `${p}%`, width: '1px', background: 'var(--border)' }} />
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'var(--text-dim)' }}>0</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'var(--text-dim)' }}>2,500</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'var(--text-dim)' }}>5,000</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'var(--text-dim)' }}>7,500</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'var(--text-dim)' }}>10,000</span>
            </div>
          </div>

          {/* Phase progression */}
          <div>
            <div className="text-label" style={{ marginBottom: '10px' }}>Ramp-Up Phases</div>
            <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
              {FLASH_PHASES.map((phase, i) => {
                const passed = state.currentRps >= phase.rps * 0.8;
                const active = i === flashPhaseIdx && flashActive;
                return (
                  <div key={i} style={{ flex: 1, textAlign: 'center' }}>
                    <div style={{
                      height: '4px',
                      background: passed ? (active ? 'var(--status-error)' : 'var(--status-warn)') : 'var(--border)',
                      borderRadius: '2px',
                      marginBottom: '6px',
                      transition: 'background 0.3s',
                      boxShadow: passed ? `0 0 6px ${active ? 'var(--status-error)' : 'var(--status-warn)'}` : 'none',
                    }} />
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: passed ? 'var(--text-secondary)' : 'var(--text-dim)' }}>
                      {phase.label}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* System response */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <StatBox label="Demand Multiplier" value={`${Math.round(state.currentRps / 100)}x`} color="var(--accent-cyan)" />
            <StatBox label="System Response" value={isFlashSale ? 'AUTO-SCALING ACTIVE' : 'STANDBY'} color={isFlashSale ? 'var(--status-warn)' : 'var(--status-ok)'} />
            <StatBox label="Active Workers" value={state.workerInstances.filter(i => i.status === 'healthy').length.toString()} color="var(--text-primary)" />
            <StatBox label="Cache Hit Rate" value={`${cacheHitPct}%`} color="var(--accent-blue)" />
          </div>
        </div>

        {/* Right panel: presets + predict */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {/* Presets */}
          <div className="panel" style={{ padding: '16px' }}>
            <div className="text-label" style={{ marginBottom: '12px' }}>Traffic Presets</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {SCENARIOS.map(sc => (
                <button
                  key={sc.name}
                  className="btn btn-outline"
                  style={{
                    justifyContent: 'space-between',
                    textAlign: 'left',
                    borderColor: state.scenario === sc.name ? sc.color + '88' : 'var(--border-accent)',
                    background: state.scenario === sc.name ? sc.color + '11' : 'transparent',
                    color: state.scenario === sc.name ? sc.color : 'var(--text-secondary)',
                  }}
                  onClick={() => dispatch({ type: 'SET_SCENARIO', scenario: sc.name, targetRps: sc.targetRps })}
                >
                  <span style={{ fontSize: '10px' }}>{sc.label}</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px' }}>{sc.targetRps.toLocaleString()} r/s</span>
                </button>
              ))}
            </div>
          </div>

          {/* FlashForge Predict */}
          <div className="panel" style={{ padding: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--accent-cyan)', fontWeight: 600, letterSpacing: '0.08em' }}>FLASHFORGE PREDICT</span>
              <span className="badge badge-cyan" style={{ fontSize: '8px' }}>BETA</span>
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'var(--text-muted)', marginBottom: '12px' }}>
              Analyzes recent traffic trend to recommend pre-scaling before spike.
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <PredictRow label="Expected Peak" value={`${state.predictedPeak.toLocaleString()} req/s`} />
              <PredictRow label="Confidence" value={`${state.predictConfidence}%`} />
              <PredictRow label="Rec. Capacity" value={`${totalInstances < 6 ? 6 : totalInstances} instances`} />
              <PredictRow label="Peak ETA" value="~10 min" />
            </div>
            <button
              className="btn btn-outline"
              style={{ width: '100%', marginTop: '12px', justifyContent: 'center', borderColor: 'rgba(6,182,212,0.4)', color: 'var(--accent-cyan)' }}
              onClick={() => dispatch({ type: 'PRE_SCALE' })}
              disabled={state.preScaled}
            >
              {state.preScaled ? '✓ PRE-SCALED' : '[ PRE-SCALE INFRASTRUCTURE ]'}
            </button>
          </div>

          {/* Live RPS chart mini */}
          <div className="panel" style={{ padding: '16px' }}>
            <div className="text-label" style={{ marginBottom: '8px' }}>Latency Trend</div>
            <ResponsiveContainer width="100%" height={80}>
              <AreaChart data={state.latencyHistory.map((v, i) => ({ t: i, v }))} margin={{ top: 2, right: 0, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="latGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area type="monotone" dataKey="v" stroke="#06b6d4" strokeWidth={1.5} fill="url(#latGrad)" dot={false} isAnimationActive={false} />
                <YAxis domain={['auto', 'auto']} hide />
              </AreaChart>
            </ResponsiveContainer>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
              <span className="text-label">Current</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--accent-cyan)' }}>
                {Math.round(state.avgLatency)} ms
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatBox({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '10px 12px' }}>
      <div className="text-label" style={{ marginBottom: '4px' }}>{label}</div>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', fontWeight: 600, color }}>{value}</div>
    </div>
  );
}

function PredictRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="data-row">
      <span className="text-label">{label}</span>
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-primary)', fontWeight: 500 }}>{value}</span>
    </div>
  );
}
