'use client';
import { useState } from 'react';
import { useSimulation } from '@/context/SimulationContext';
import { SCENARIOS } from '@/lib/simulation/scenarios';
import { playFlashSaleSound } from '@/lib/utils/sounds';
import { AreaChart, Area, YAxis, ResponsiveContainer } from 'recharts';
import {
  Zap,
  Play,
  Square,
  Sliders,
  Sparkles,
  TrendingUp,
  Gauge,
  Server,
  Flame,
  CheckCircle2,
  Clock,
  Layers,
  Database
} from 'lucide-react';

const FLASH_PHASES = [
  { label: '100', rps: 100, pct: 1 },
  { label: '500', rps: 500, pct: 5 },
  { label: '1,500', rps: 1500, pct: 15 },
  { label: '5,000', rps: 5000, pct: 50 },
  { label: '10,000', rps: 10000, pct: 100 },
];

export default function TrafficSimulator() {
  const { state, dispatch, guideMode } = useSimulation();
  const [flashActive, setFlashActive] = useState(false);
  const [flashPhaseIdx, setFlashPhaseIdx] = useState(0);

  const isFlashSale = state.currentRps > 3000;
  const isCritical = state.currentRps > 8000;
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

  const loadPct = Math.min((state.currentRps / 10000) * 100, 100);
  const loadColor = loadPct > 80 ? 'var(--status-error)' : loadPct > 50 ? 'var(--status-warn)' : 'var(--status-ok)';
  const cacheHitPct = Math.round(state.cacheHitRate * 100);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', maxWidth: '1400px' }}>
      {/* Page Title */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="text-label" style={{ color: 'var(--accent-cyan)' }}>TRAFFIC INJECTION & SPIKE CONTROLS</span>
            <span className="badge badge-cyan" style={{ fontSize: '8px' }}>INTERACTIVE</span>
          </div>
          <h1 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-primary)', marginTop: '2px' }}>
            Flash Sale & Traffic Simulator
          </h1>
        </div>
        <span className={`badge badge-${isFlashSale ? 'error' : 'ok'}`} style={{ fontSize: '10px', padding: '6px 14px' }}>
          {isFlashSale ? '⚡ FLASH SALE ACTIVE' : '● IDLE / NORMAL LOAD'}
        </span>
      </div>

      {/* Guide Mode Explainer for Judges */}
      {guideMode && (
        <div className="guide-card">
          <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '6px', background: 'rgba(6,182,212,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Flame size={16} color="var(--status-warn)" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Why do flash sales crash traditional servers?
                </span>
                <span className="analogy-pill">Real-World Case</span>
              </div>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                When e-commerce platforms launch a flash discount (e.g. 50,000 sneaker pairs or concert tickets), traffic leaps from <strong>500 req/s to 10,000+ req/s</strong> in under 15 seconds.
                Fixed servers run out of CPU and memory, crashing completely.
                <strong> Use the controls below</strong> to inject sudden surges and watch FlashForge auto-scale without dropping a single order!
              </p>
            </div>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
        {/* Main Flash Sale Control Card */}
        <div className="panel" style={{ flex: 2, minWidth: '380px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '22px' }}>
          {/* Big Flash Sale Hero Button */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '16px',
            padding: '24px',
            background: 'var(--bg-elevated)',
            borderRadius: 'var(--radius-md)',
            border: `1px solid ${flashActive ? 'rgba(239,68,68,0.4)' : 'var(--border-accent)'}`,
            boxShadow: flashActive ? '0 0 30px rgba(239,68,68,0.15)' : 'none',
            transition: 'all 0.3s ease'
          }}>
            {flashActive && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--status-error)', letterSpacing: '0.15em', fontWeight: 700 }}>
                <span className="status-dot error animate-ping" />
                AUTOMATED 5-PHASE FLASH SURGE IN PROGRESS
              </div>
            )}
            <button
              className={`btn btn-flash ${flashActive ? 'active' : ''}`}
              onClick={initiateFlashSale}
              style={{
                fontSize: '14px',
                padding: '18px 48px',
                width: '100%',
                maxWidth: '400px',
                justifyContent: 'center',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}
            >
              {flashActive ? (
                <>
                  <Square size={16} fill="currentColor" />
                  <span>TERMINATE FLASH SALE</span>
                </>
              ) : (
                <>
                  <Zap size={18} fill="currentColor" />
                  <span>INITIATE 10,000 RPS FLASH SALE</span>
                </>
              )}
            </button>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-muted)', textAlign: 'center', letterSpacing: '0.04em' }}>
              {flashActive
                ? 'Traffic automated ramp: 100 → 500 → 1,500 → 5,000 → 10,000 req/s'
                : '1-Click dramatic demonstration — tests horizontal pod autoscaling, queue buffer, and cache offloading.'}
            </div>
          </div>

          {/* Interactive Custom RPS Slider */}
          <div style={{ padding: '16px', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sliders size={14} color="var(--accent-cyan)" />
                <span className="text-label" style={{ color: 'var(--text-primary)' }}>Interactive Custom Traffic Throttle</span>
              </div>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '14px', fontWeight: 700, color: 'var(--accent-cyan)' }}>
                {Math.round(state.targetRps).toLocaleString()} req/s
              </span>
            </div>
            <input
              type="range"
              min="100"
              max="20000"
              step="100"
              value={state.targetRps}
              onChange={(e) => dispatch({ type: 'SET_TARGET_RPS', rps: Number(e.target.value) })}
              style={{ width: '100%', cursor: 'pointer' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'var(--text-dim)' }}>100 rps (Eco)</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'var(--text-dim)' }}>5,000 rps</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'var(--text-dim)' }}>10,000 rps</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'var(--text-dim)' }}>20,000 rps (Maximum)</span>
            </div>
          </div>

          {/* Live Load Bar */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <span className="text-label">System Saturation Meter</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: loadColor, fontWeight: 700 }}>
                {Math.round(state.currentRps).toLocaleString()} req/s ({Math.round(loadPct)}% capacity)
              </span>
            </div>
            <div style={{ position: 'relative', height: '18px', background: 'var(--bg-elevated)', borderRadius: '4px', border: '1px solid var(--border)', overflow: 'hidden' }}>
              <div style={{
                position: 'absolute', top: 0, left: 0, bottom: 0,
                width: `${loadPct}%`,
                background: `linear-gradient(90deg, #10b981 0%, #f59e0b 60%, ${loadColor} 100%)`,
                transition: 'width 0.4s ease, background 0.4s ease',
                boxShadow: loadPct > 80 ? `0 0 16px ${loadColor}66` : 'none',
              }} />
              {/* Reference Grid lines */}
              {[25, 50, 75].map(p => (
                <div key={p} style={{ position: 'absolute', top: 0, bottom: 0, left: `${p}%`, width: '1px', background: 'rgba(255,255,255,0.1)' }} />
              ))}
            </div>
          </div>

          {/* 5-Phase Progression visualization */}
          <div>
            <div className="text-label" style={{ marginBottom: '10px' }}>Automated Ramp-Up Stages</div>
            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
              {FLASH_PHASES.map((phase, i) => {
                const passed = state.currentRps >= phase.rps * 0.8;
                const active = i === flashPhaseIdx && flashActive;
                return (
                  <div key={i} style={{ flex: 1, textAlign: 'center' }}>
                    <div style={{
                      height: '5px',
                      background: passed ? (active ? 'var(--status-error)' : 'var(--status-warn)') : 'var(--border)',
                      borderRadius: '3px',
                      marginBottom: '6px',
                      transition: 'background 0.3s',
                      boxShadow: passed ? `0 0 8px ${active ? 'var(--status-error)' : 'var(--status-warn)'}` : 'none',
                    }} />
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: passed ? 'var(--text-secondary)' : 'var(--text-dim)' }}>
                      {phase.label} rps
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Key Telemetry Stat Boxes */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '10px' }}>
            <StatBox icon={<TrendingUp size={14} />} label="Spike Multiplier" value={`${Math.max(1, Math.round(state.currentRps / 100))}x Baseline`} color="var(--accent-cyan)" />
            <StatBox icon={<Gauge size={14} />} label="Autoscaler State" value={isFlashSale ? 'SCALE-OUT ENGAGED' : 'ECO STANDBY'} color={isFlashSale ? 'var(--status-warn)' : 'var(--status-ok)'} />
            <StatBox icon={<Server size={14} />} label="Active Workers" value={`${state.workerInstances.filter(i => i.status === 'healthy').length} healthy pods`} color="var(--text-primary)" />
            <StatBox icon={<Database size={14} />} label="Cache Offload" value={`${cacheHitPct}% absorbed`} color="var(--accent-blue)" />
          </div>
        </div>

        {/* Right side: Presets + Predict + Latency Mini */}
        <div style={{ flex: 1, minWidth: '320px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {/* Quick Real-World Traffic Presets */}
          <div className="panel" style={{ padding: '18px' }}>
            <div className="text-label" style={{ marginBottom: '12px' }}>Real-World Traffic Presets</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {SCENARIOS.map(sc => (
                <button
                  key={sc.name}
                  className="btn btn-outline"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    textAlign: 'left',
                    padding: '10px 12px',
                    borderColor: state.scenario === sc.name ? sc.color + '88' : 'var(--border-accent)',
                    background: state.scenario === sc.name ? sc.color + '14' : 'transparent',
                    color: state.scenario === sc.name ? sc.color : 'var(--text-secondary)',
                  }}
                  onClick={() => dispatch({ type: 'SET_SCENARIO', scenario: sc.name, targetRps: sc.targetRps })}
                >
                  <div>
                    <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-primary)' }}>{sc.label}</div>
                    <div style={{ fontSize: '8px', color: 'var(--text-muted)', marginTop: '2px' }}>{sc.description}</div>
                  </div>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', fontWeight: 700, color: sc.color }}>
                    {sc.targetRps.toLocaleString()} r/s
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* FlashForge Predictive Scaling */}
          <div className="panel" style={{ padding: '18px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sparkles size={14} color="var(--accent-cyan)" />
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--accent-cyan)', fontWeight: 700, letterSpacing: '0.08em' }}>
                  AI PREDICTIVE PRE-SCALE
                </span>
              </div>
              <span className="badge badge-cyan" style={{ fontSize: '8px' }}>PROACTIVE</span>
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'var(--text-muted)', marginBottom: '12px', lineHeight: '1.5' }}>
              Analyzes incoming traffic gradient to warm-up capacity <strong>before</strong> latency spikes occur.
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <PredictRow label="Expected Peak Surge" value={`${state.predictedPeak.toLocaleString()} req/s`} />
              <PredictRow label="ML Model Confidence" value={`${state.predictConfidence}%`} />
              <PredictRow label="Recommended Pods" value={`${totalInstances < 6 ? 6 : totalInstances} instances`} />
              <PredictRow label="Surge Arrival ETA" value="~10 minutes" />
            </div>
            <button
              className="btn btn-outline"
              style={{
                width: '100%',
                marginTop: '14px',
                justifyContent: 'center',
                borderColor: state.preScaled ? 'rgba(16,185,129,0.4)' : 'rgba(6,182,212,0.4)',
                color: state.preScaled ? 'var(--status-ok)' : 'var(--accent-cyan)',
                padding: '10px'
              }}
              onClick={() => dispatch({ type: 'PRE_SCALE' })}
              disabled={state.preScaled}
            >
              {state.preScaled ? '✓ CLUSTER PRE-WARMED' : '⚡ PRE-SCALE CLUSTER NOW'}
            </button>
          </div>

          {/* Real-time Latency Sparkline */}
          <div className="panel" style={{ padding: '18px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span className="text-label">Live Latency Response</span>
              <Clock size={13} color="var(--accent-cyan)" />
            </div>
            <ResponsiveContainer width="100%" height={75}>
              <AreaChart data={state.latencyHistory.map((v, i) => ({ t: i, v }))} margin={{ top: 2, right: 0, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="latGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area type="monotone" dataKey="v" stroke="#06b6d4" strokeWidth={1.5} fill="url(#latGrad)" dot={false} isAnimationActive={false} />
                <YAxis domain={['auto', 'auto']} hide />
              </AreaChart>
            </ResponsiveContainer>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px' }}>
              <span className="text-label">Average Response Time</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', color: 'var(--accent-cyan)', fontWeight: 700 }}>
                {Math.round(state.avgLatency)} ms
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatBox({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string; color: string }) {
  return (
    <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '12px 14px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px', color: 'var(--text-muted)' }}>
        {icon}
        <span className="text-label" style={{ fontSize: '8px' }}>{label}</span>
      </div>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', fontWeight: 700, color }}>{value}</div>
    </div>
  );
}

function PredictRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="data-row">
      <span className="text-label">{label}</span>
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-primary)', fontWeight: 600 }}>{value}</span>
    </div>
  );
}
