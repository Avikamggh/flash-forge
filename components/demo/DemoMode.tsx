'use client';
import { useEffect, useRef, useState } from 'react';
import { useSimulation } from '@/context/SimulationContext';

interface DemoProps {
  onClose: () => void;
}

const PHASES = [
  { time: 0, label: 'Baseline', desc: 'Normal traffic — 500 req/s, 4 instances, all green.' },
  { time: 8, label: 'Elevation', desc: 'Lunch rush — traffic climbing to 2,000 req/s. Auto-scaler adding 2 instances.' },
  { time: 15, label: 'Flash Sale', desc: '⚡ FLASH SALE INITIATED — 10,000 req/s. Auto-scaler racing to keep latency down.' },
  { time: 22, label: 'Peak Load', desc: 'Queue growing. 12 instances active. Latency elevated but controlled.' },
  { time: 28, label: 'Chaos', desc: '⚠ Simulated worker failure. Traffic rerouting. Retry mechanism active.' },
  { time: 35, label: 'Recovery', desc: 'Replacement instance provisioned. Queue draining. Latency stabilizing.' },
  { time: 42, label: 'Wind-Down', desc: 'Flash sale ending. Traffic at 5,000 req/s. Scale-in begins.' },
  { time: 50, label: 'Normalization', desc: 'Back to baseline. 4 instances. Cost dropping. All systems green.' },
  { time: 58, label: 'Complete', desc: '✓ SYSTEM SURVIVED THE FLASH SALE' },
];

export default function DemoMode({ onClose }: DemoProps) {
  const { state, dispatch } = useSimulation();
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(false);
  const [finished, setFinished] = useState(false);
  const [peakRps, setPeakRps] = useState(0);
  const [peakInstances, setPeakInstances] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const currentPhaseIdx = PHASES.reduce((acc, p, i) => (elapsed >= p.time ? i : acc), 0);
  const currentPhase = PHASES[currentPhaseIdx];

  useEffect(() => {
    const totalInstances = state.apiInstances.length + state.workerInstances.length;
    if (state.currentRps > peakRps) setPeakRps(state.currentRps);
    if (totalInstances > peakInstances) setPeakInstances(totalInstances);
  }, [state.tick]);

  const startDemo = () => {
    setRunning(true);
    setElapsed(0);
    setFinished(false);
    setPeakRps(state.currentRps);
    setPeakInstances(state.apiInstances.length + state.workerInstances.length);

    // Schedule scenario changes
    const scheduleChange = (delay: number, fn: () => void) => setTimeout(fn, delay * 1000);

    scheduleChange(0, () => dispatch({ type: 'SET_SCENARIO', scenario: 'NORMAL', targetRps: 500 }));
    scheduleChange(8, () => dispatch({ type: 'SET_SCENARIO', scenario: 'ELEVATED', targetRps: 2000 }));
    scheduleChange(15, () => dispatch({ type: 'SET_SCENARIO', scenario: 'FLASH_SALE', targetRps: 10000 }));
    scheduleChange(28, () => dispatch({ type: 'CHAOS_TEST' }));
    scheduleChange(38, () => dispatch({ type: 'SET_SCENARIO', scenario: 'RECOVERY', targetRps: 5000 }));
    scheduleChange(48, () => dispatch({ type: 'SET_SCENARIO', scenario: 'NORMAL', targetRps: 500 }));
    scheduleChange(58, () => setFinished(true));

    intervalRef.current = setInterval(() => {
      setElapsed(e => {
        if (e >= 60) {
          clearInterval(intervalRef.current!);
          return 60;
        }
        return e + 0.1;
      });
    }, 100);
  };

  const stopDemo = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setRunning(false);
    dispatch({ type: 'SET_SCENARIO', scenario: 'NORMAL', targetRps: 500 });
  };

  useEffect(() => {
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, []);

  const progress = Math.min((elapsed / 60) * 100, 100);
  const totalInstances = state.apiInstances.length + state.workerInstances.length;
  const successRate = state.totalRequests > 0 ? (state.successfulRequests / state.totalRequests * 100).toFixed(1) : '99.9';

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(0,0,0,0.92)',
      backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{
        width: '680px', maxWidth: '95vw',
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-accent)',
        borderRadius: 'var(--radius-lg)',
        padding: '32px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Top accent line */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: 'linear-gradient(90deg, transparent, var(--accent-cyan), transparent)' }} />

        <button onClick={() => { stopDemo(); onClose(); }} style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontFamily: 'var(--font-mono)', fontSize: '11px' }}>
          ✕ CLOSE
        </button>

        {/* Header */}
        <div style={{ marginBottom: '24px' }}>
          <div className="text-label" style={{ color: 'var(--accent-cyan)', marginBottom: '4px' }}>DEMO MODE</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '20px', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '0.05em' }}>
            60-Second Infrastructure Demo
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
            Automated walkthrough: Normal → Flash Sale → Chaos → Recovery
          </div>
        </div>

        {!finished ? (
          <>
            {/* Progress */}
            <div style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span className="text-label">Demo Progress</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-secondary)' }}>
                  {Math.floor(elapsed)}s / 60s
                </span>
              </div>
              <div style={{ height: '8px', background: 'var(--bg-elevated)', borderRadius: '4px', overflow: 'hidden', border: '1px solid var(--border)' }}>
                <div style={{
                  height: '100%', width: `${progress}%`,
                  background: 'linear-gradient(90deg, var(--accent-cyan), var(--accent-blue))',
                  transition: 'width 0.1s linear',
                  boxShadow: running ? '0 0 10px rgba(6,182,212,0.5)' : 'none',
                }} />
              </div>
            </div>

            {/* Phase indicators */}
            <div style={{ display: 'flex', gap: '4px', marginBottom: '20px', overflow: 'hidden' }}>
              {PHASES.slice(0, -1).map((p, i) => (
                <div key={i} style={{ flex: 1, height: '3px', borderRadius: '2px', background: i <= currentPhaseIdx ? 'var(--accent-cyan)' : 'var(--border)', transition: 'background 0.3s' }} />
              ))}
            </div>

            {/* Current phase */}
            {running && (
              <div style={{ padding: '16px', background: 'var(--bg-elevated)', border: '1px solid var(--border-accent)', borderRadius: 'var(--radius-sm)', marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <span className="status-dot ok" />
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--accent-cyan)', fontWeight: 600, letterSpacing: '0.1em' }}>
                    PHASE {currentPhaseIdx + 1}: {currentPhase.label.toUpperCase()}
                  </span>
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-secondary)' }}>{currentPhase.desc}</div>
              </div>
            )}

            {/* Live metrics during demo */}
            {running && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '8px', marginBottom: '20px' }}>
                <LiveMetric label="RPS" value={Math.round(state.currentRps).toLocaleString()} color={state.currentRps > 5000 ? 'var(--status-error)' : 'var(--text-primary)'} />
                <LiveMetric label="Instances" value={totalInstances.toString()} color="var(--accent-cyan)" />
                <LiveMetric label="Latency" value={`${Math.round(state.avgLatency)}ms`} color={state.avgLatency > 300 ? 'var(--status-error)' : 'var(--status-ok)'} />
                <LiveMetric label="Queue" value={Math.round(state.queueDepth).toLocaleString()} color={state.queueDepth > 500 ? 'var(--status-warn)' : 'var(--text-primary)'} />
              </div>
            )}

            {/* Control */}
            <div style={{ display: 'flex', gap: '8px' }}>
              {!running ? (
                <button className="btn btn-primary" style={{ flex: 1, justifyContent: 'center', padding: '14px' }} onClick={startDemo}>
                  ▶ START DEMO
                </button>
              ) : (
                <button className="btn btn-outline" style={{ flex: 1, justifyContent: 'center' }} onClick={stopDemo}>
                  ⏹ STOP
                </button>
              )}
            </div>
          </>
        ) : (
          /* Results screen */
          <div>
            <div style={{ textAlign: 'center', marginBottom: '24px', padding: '20px', background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 'var(--radius-md)' }}>
              <div style={{ fontSize: '28px', marginBottom: '8px' }}>✓</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '16px', fontWeight: 800, color: 'var(--status-ok)', letterSpacing: '0.08em' }}>
                SYSTEM SURVIVED THE FLASH SALE
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '20px' }}>
              <ResultCard label="Peak Traffic" value={`${Math.round(peakRps).toLocaleString()} req/s`} />
              <ResultCard label="Peak Instances" value={peakInstances.toString()} />
              <ResultCard label="Successful Requests" value={`${successRate}%`} color="var(--status-ok)" />
              <ResultCard label="Recovery" value="< 30 sec" color="var(--accent-cyan)" />
              <ResultCard label="Est. Infra Efficiency" value={`${Math.round((1 - 4 / Math.max(peakInstances, 4)) * 100)}%`} color="var(--status-ok)" />
              <ResultCard label="Cost vs. Static" value={`-${Math.round((1 - (4 * 0.096) / (20 * 0.096)) * 100)}% normal`} color="var(--status-ok)" />
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'var(--text-muted)', textAlign: 'center', marginBottom: '16px' }}>
              SIMULATED METRICS — for demonstration purposes only
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button className="btn btn-outline" style={{ flex: 1, justifyContent: 'center' }} onClick={() => { setFinished(false); setElapsed(0); setRunning(false); }}>
                ↺ RUN AGAIN
              </button>
              <button className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }} onClick={() => { stopDemo(); onClose(); }}>
                ✓ CLOSE
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function LiveMetric({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div style={{ textAlign: 'center', padding: '10px', background: 'var(--bg-elevated)', borderRadius: '3px', border: '1px solid var(--border)' }}>
      <div className="text-label" style={{ marginBottom: '4px' }}>{label}</div>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '14px', fontWeight: 700, color }}>{value}</div>
    </div>
  );
}

function ResultCard({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div style={{ padding: '12px', background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: '3px' }}>
      <div className="text-label" style={{ marginBottom: '4px' }}>{label}</div>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '15px', fontWeight: 700, color: color || 'var(--text-primary)' }}>{value}</div>
    </div>
  );
}
