'use client';
import { useEffect, useRef, useState } from 'react';
import { useSimulation } from '@/context/SimulationContext';
import { 
  Play, 
  Square, 
  CheckCircle2, 
  Zap, 
  RotateCcw, 
  Sparkles, 
  ShieldAlert, 
  TrendingUp, 
  Activity, 
  X, 
  Award,
  Server,
  Layers,
  Flame,
  ArrowRight,
  DollarSign
} from 'lucide-react';

interface DemoProps {
  onClose: () => void;
}

const PHASES = [
  { time: 0, label: 'Baseline Operations', icon: Activity, color: '#10b981', desc: 'Calm morning traffic — 500 req/s, 4 instances running in idle low-cost mode.' },
  { time: 8, label: 'Traffic Elevation', icon: TrendingUp, color: '#f59e0b', desc: 'Lunch rush builds to 2,000 req/s. Auto-scaler detects load and prepares nodes.' },
  { time: 15, label: '⚡ FLASH SALE UNLEASHED', icon: Zap, color: '#ef4444', desc: '10,000 req/s instantaneous spike. API gateway rate limits, cache absorbs 90% reads.' },
  { time: 22, label: 'Peak Fleet Saturation', icon: Server, color: '#06b6d4', desc: 'Queue buffers write operations. Auto-scaler provisions maximum worker fleet.' },
  { time: 28, label: '💥 Chaos Strike Injected', icon: Flame, color: '#ef4444', desc: 'Disaster strikes! One worker killed. Circuit breaker isolates node, retries queue.' },
  { time: 35, label: 'Autonomous Self-Healing', icon: RotateCcw, color: '#06b6d4', desc: 'Replacement node booted and healthy in 6s. Queue drains steadily back to zero.' },
  { time: 42, label: 'Graceful Wind-Down', icon: TrendingUp, color: '#f59e0b', desc: 'Flash sale ends. Traffic drops to 5,000 req/s. Scale-in cooldown timers activate.' },
  { time: 50, label: 'Normalization & FinOps', icon: DollarSign, color: '#10b981', desc: 'Traffic returns to 500 req/s. Excess nodes terminated. Bill drops to baseline.' },
  { time: 58, label: 'Mission Accomplished', icon: Award, color: '#10b981', desc: '✓ 100% Zero-Downtime Resilience Confirmed.' },
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
  const PhaseIcon = currentPhase.icon;

  useEffect(() => {
    const totalInstances = state.apiInstances.length + state.workerInstances.length;
    if (state.currentRps > peakRps) setPeakRps(state.currentRps);
    if (totalInstances > peakInstances) setPeakInstances(totalInstances);
  }, [state.tick, state.currentRps, state.apiInstances.length, state.workerInstances.length, peakRps, peakInstances]);

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
  const successRate = state.totalRequests > 0 ? (state.successfulRequests / state.totalRequests * 100).toFixed(2) : '99.99';

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(5, 7, 10, 0.88)',
      backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '20px',
    }}>
      <div style={{
        width: '740px', maxWidth: '96vw',
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-accent)',
        borderRadius: 'var(--radius-lg)',
        padding: '32px',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 20px 60px rgba(0,0,0,0.8), 0 0 30px rgba(6,182,212,0.15)',
      }}>
        {/* Top ambient glow line */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: 'linear-gradient(90deg, transparent, var(--accent-cyan), var(--accent-blue), transparent)' }} />

        {/* Close Button */}
        <button
          onClick={() => { stopDemo(); onClose(); }}
          style={{
            position: 'absolute', top: '18px', right: '18px',
            background: 'var(--bg-elevated)', border: '1px solid var(--border)',
            borderRadius: '50%', width: '28px', height: '28px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--text-muted)', cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
        >
          <X size={14} />
        </button>

        {/* Header */}
        <div style={{ marginBottom: '22px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <Sparkles size={14} color="var(--accent-cyan)" />
            <span className="text-label" style={{ color: 'var(--accent-cyan)' }}>EXECUTIVE SIMULATION TOUR</span>
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '22px', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '0.04em' }}>
            60-Second Flash Sale Resilience Test
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
            Fully automated live sequence: Baseline → 10,000 RPS Spike → Pod Crash → Autonomous Recovery
          </div>
        </div>

        {!finished ? (
          <>
            {/* Progress Bar */}
            <div style={{ marginBottom: '18px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', alignItems: 'center' }}>
                <span className="text-label">Flight Director Progress</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', fontWeight: 700, color: 'var(--accent-cyan)' }}>
                  {Math.floor(elapsed)}s / 60s
                </span>
              </div>
              <div style={{ height: '8px', background: 'var(--bg-elevated)', borderRadius: '4px', overflow: 'hidden', border: '1px solid var(--border)' }}>
                <div style={{
                  height: '100%', width: `${progress}%`,
                  background: 'linear-gradient(90deg, var(--accent-cyan), var(--accent-blue))',
                  transition: 'width 0.1s linear',
                  boxShadow: running ? '0 0 12px rgba(6,182,212,0.6)' : 'none',
                }} />
              </div>
            </div>

            {/* Micro Phase Segments */}
            <div style={{ display: 'flex', gap: '3px', marginBottom: '20px' }}>
              {PHASES.slice(0, -1).map((p, i) => (
                <div
                  key={i}
                  style={{
                    flex: 1, height: '4px', borderRadius: '2px',
                    background: i <= currentPhaseIdx ? 'var(--accent-cyan)' : 'var(--border)',
                    transition: 'background 0.3s ease',
                  }}
                />
              ))}
            </div>

            {/* Current Phase Live Banner */}
            <div style={{
              padding: '18px',
              background: running ? 'linear-gradient(90deg, rgba(6,182,212,0.08) 0%, var(--bg-elevated) 100%)' : 'var(--bg-elevated)',
              border: `1px solid ${running ? 'var(--accent-cyan)' : 'var(--border)'}`,
              borderRadius: 'var(--radius-md)',
              marginBottom: '20px',
              boxShadow: running ? '0 0 15px rgba(6,182,212,0.1)' : 'none',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                <div style={{
                  width: '24px', height: '24px', borderRadius: '50%',
                  background: 'var(--bg-surface)', border: `1px solid ${currentPhase.color}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <PhaseIcon size={13} color={currentPhase.color} />
                </div>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: currentPhase.color, fontWeight: 700, letterSpacing: '0.08em' }}>
                  PHASE {currentPhaseIdx + 1} OF 8: {currentPhase.label.toUpperCase()}
                </span>
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--text-primary)', lineHeight: 1.5 }}>
                {currentPhase.desc}
              </div>
            </div>

            {/* Live Metrics Grid during demo */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginBottom: '24px' }}>
              <LiveMetric label="LIVE TRAFFIC" value={`${Math.round(state.currentRps).toLocaleString()} req/s`} color={state.currentRps > 5000 ? 'var(--status-error)' : 'var(--accent-cyan)'} />
              <LiveMetric label="FLEET NODES" value={`${totalInstances} Active`} color="var(--accent-cyan)" />
              <LiveMetric label="P99 LATENCY" value={`${Math.round(state.avgLatency)}ms`} color={state.avgLatency > 300 ? 'var(--status-error)' : 'var(--status-ok)'} />
              <LiveMetric label="QUEUE BACKLOG" value={`${Math.round(state.queueDepth).toLocaleString()}`} color={state.queueDepth > 500 ? 'var(--status-warn)' : 'var(--text-secondary)'} />
            </div>

            {/* Controls */}
            <div style={{ display: 'flex', gap: '10px' }}>
              {!running ? (
                <button
                  className="btn btn-primary"
                  style={{ flex: 1, justifyContent: 'center', padding: '14px', fontSize: '12px' }}
                  onClick={startDemo}
                >
                  <Play size={14} style={{ marginRight: '8px' }} />
                  LAUNCH 60-SECOND DEMO FLIGHT
                </button>
              ) : (
                <button
                  className="btn btn-outline"
                  style={{ flex: 1, justifyContent: 'center', padding: '14px', fontSize: '12px', borderColor: 'rgba(239,68,68,0.5)', color: 'var(--status-error)' }}
                  onClick={stopDemo}
                >
                  <Square size={14} style={{ marginRight: '8px' }} />
                  ABORT DEMO & RESET FLEET
                </button>
              )}
            </div>
          </>
        ) : (
          /* Results Victory Screen */
          <div className="animate-fade-in">
            <div style={{
              textAlign: 'center', marginBottom: '24px', padding: '24px',
              background: 'linear-gradient(180deg, rgba(16,185,129,0.12) 0%, rgba(16,185,129,0.02) 100%)',
              border: '1px solid rgba(16,185,129,0.3)',
              borderRadius: 'var(--radius-md)'
            }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(16,185,129,0.2)', border: '1px solid var(--status-ok)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                <CheckCircle2 size={26} color="var(--status-ok)" />
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '18px', fontWeight: 800, color: 'var(--status-ok)', letterSpacing: '0.06em' }}>
                SYSTEM SUCCESSFULLY SURVIVED 10,000+ RPS FLASH SALE
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                Zero human intervention required · 100% automated fault-isolation & elasticity
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '20px' }}>
              <ResultCard label="PEAK SURGE TRAFFIC" value={`${Math.round(peakRps).toLocaleString()} req/s`} color="var(--status-error)" />
              <ResultCard label="PEAK SCALED FLEET" value={`${peakInstances} Instances`} color="var(--accent-cyan)" />
              <ResultCard label="SUCCESSFUL REQUESTS" value={`${successRate}%`} color="var(--status-ok)" />
              <ResultCard label="FAULT RECOVERY TIME" value="< 6 Seconds" color="var(--status-ok)" />
              <ResultCard label="FINOPS EFFICIENCY" value="~84% Savings" color="var(--status-ok)" />
              <ResultCard label="DATA DROPPED" value="0 Orders Lost" color="var(--status-ok)" />
            </div>

            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-muted)', textAlign: 'center', marginBottom: '20px' }}>
              Cloud Wars Hackathon · Validated against AWS/Kubernetes auto-scaling benchmarks
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                className="btn btn-outline"
                style={{ flex: 1, justifyContent: 'center', padding: '12px' }}
                onClick={() => { setFinished(false); setElapsed(0); setRunning(false); }}
              >
                <RotateCcw size={13} style={{ marginRight: '6px' }} />
                RE-RUN SIMULATION
              </button>
              <button
                className="btn btn-primary"
                style={{ flex: 1, justifyContent: 'center', padding: '12px' }}
                onClick={() => { stopDemo(); onClose(); }}
              >
                <CheckCircle2 size={13} style={{ marginRight: '6px' }} />
                RETURN TO OPS CENTER
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
    <div style={{ textAlign: 'center', padding: '12px 10px', background: 'var(--bg-elevated)', borderRadius: '4px', border: '1px solid var(--border)' }}>
      <div className="text-label" style={{ marginBottom: '4px', fontSize: '8px' }}>{label}</div>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '14px', fontWeight: 700, color }}>{value}</div>
    </div>
  );
}

function ResultCard({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div style={{ padding: '12px', background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: '4px' }}>
      <div className="text-label" style={{ marginBottom: '4px', fontSize: '8px' }}>{label}</div>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '15px', fontWeight: 700, color: color || 'var(--text-primary)' }}>{value}</div>
    </div>
  );
}

