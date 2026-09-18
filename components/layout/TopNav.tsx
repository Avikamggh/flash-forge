'use client';
import { useState } from 'react';
import { useSimulation } from '@/context/SimulationContext';
import { useAnimatedNumber } from '@/hooks/useAnimatedNumber';
import { useFullscreen } from '@/hooks/useFullscreen';
import { formatRps, formatLatency } from '@/lib/utils/format';
import { isSoundMuted, toggleSound } from '@/lib/utils/sounds';
import {
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  Play,
  Lightbulb,
  Zap,
  Activity,
  Server,
  Layers,
  Clock,
  DollarSign
} from 'lucide-react';

interface Props {
  activeSection: string;
  onDemoClick: () => void;
}

export default function TopNav({ activeSection, onDemoClick }: Props) {
  const { state, guideMode, toggleGuideMode } = useSimulation();
  const { isFullscreen, toggle: toggleFullscreen } = useFullscreen();
  const [muted, setMuted] = useState(isSoundMuted());
  const rps = useAnimatedNumber(state.currentRps, 300);
  const instances = useAnimatedNumber(
    state.apiInstances.filter(i => i.status === 'healthy').length + state.workerInstances.filter(i => i.status === 'healthy').length,
    400
  );
  const latency = useAnimatedNumber(state.avgLatency, 300);
  const cost = useAnimatedNumber(state.costPerHour, 500);

  const isFlashSale = state.currentRps > 3000;
  const isCritical = state.currentRps > 8000;

  const handleToggleSound = () => {
    const next = toggleSound();
    setMuted(next);
  };

  return (
    <header style={{
      height: '54px',
      borderBottom: '1px solid var(--border)',
      background: 'rgba(13, 16, 23, 0.95)',
      backdropFilter: 'blur(10px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0',
      flexShrink: 0,
      position: 'relative',
      zIndex: 50,
    }}>
      {/* Logo & Hackathon Tag */}
      <div style={{ display: 'flex', alignItems: 'center', padding: '0 18px', borderRight: '1px solid var(--border)', height: '100%', gap: '12px' }}>
        <div style={{
          width: '32px',
          height: '32px',
          borderRadius: '6px',
          background: isCritical
            ? 'linear-gradient(135deg, #ef4444, #991b1b)'
            : isFlashSale
              ? 'linear-gradient(135deg, #f59e0b, #b45309)'
              : 'linear-gradient(135deg, #06b6d4, #2563eb)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: isCritical ? '0 0 16px rgba(239,68,68,0.5)' : '0 0 12px rgba(6,182,212,0.3)',
          transition: 'all 0.3s ease'
        }}>
          <Zap size={18} color="#fff" strokeWidth={2.5} />
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, fontSize: '14px', color: 'var(--text-primary)', letterSpacing: '0.08em' }}>
              FLASHFORGE
            </span>
            <span style={{
              fontSize: '8px',
              fontFamily: 'var(--font-mono)',
              padding: '1px 5px',
              borderRadius: '3px',
              background: 'rgba(59,130,246,0.15)',
              color: 'var(--accent-cyan)',
              border: '1px solid rgba(6,182,212,0.3)',
              fontWeight: 700
            }}>
              v2.0
            </span>
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '8px', color: 'var(--text-muted)', letterSpacing: '0.12em', marginTop: '-1px' }}>
            CLOUD WARS · TEAM XPLOREON
          </div>
        </div>
      </div>

      {/* Live System Status Pill */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '0 18px', borderRight: '1px solid var(--border)', height: '100%' }}>
        <span className={`status-dot ${isCritical ? 'error' : isFlashSale ? 'warn' : 'ok'}`} />
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '10px',
            fontWeight: 700,
            color: isCritical ? 'var(--status-error)' : isFlashSale ? 'var(--status-warn)' : 'var(--status-ok)',
            letterSpacing: '0.06em'
          }}>
            {isCritical ? 'CRITICAL LOAD' : isFlashSale ? 'FLASH SALE SURGE' : 'ALL SYSTEMS GREEN'}
          </span>
          <span style={{ fontSize: '8px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
            Auto-healing & scaling live
          </span>
        </div>
      </div>

      {/* Live Metrics Header Strip */}
      <div style={{ display: 'flex', alignItems: 'center', flex: 1, overflowX: 'auto' }}>
        <MetricPill
          icon={<Activity size={12} />}
          label="Incoming RPS"
          value={formatRps(rps) + '/s'}
          color={isCritical ? 'var(--status-error)' : isFlashSale ? 'var(--status-warn)' : 'var(--text-primary)'}
        />
        <MetricPill
          icon={<Server size={12} />}
          label="Active Pods"
          value={Math.round(instances).toString()}
          color="var(--accent-cyan)"
        />
        <MetricPill
          icon={<Layers size={12} />}
          label="Queue Buffer"
          value={Math.round(state.queueDepth).toLocaleString()}
          color={state.queueDepth > 500 ? 'var(--status-warn)' : 'var(--text-primary)'}
        />
        <MetricPill
          icon={<Clock size={12} />}
          label="P99 Latency"
          value={formatLatency(latency)}
          color={latency > 300 ? 'var(--status-error)' : latency > 150 ? 'var(--status-warn)' : 'var(--status-ok)'}
        />
        <MetricPill
          icon={<DollarSign size={12} />}
          label="Live Cost/hr"
          value={`$${cost.toFixed(2)}`}
          color="var(--text-secondary)"
        />
      </div>

      {/* Controls & Quick Actions */}
      <div style={{ padding: '0 14px', borderLeft: '1px solid var(--border)', height: '100%', display: 'flex', alignItems: 'center', gap: '8px' }}>
        {/* Guide Mode Explainer Toggle */}
        <button
          onClick={toggleGuideMode}
          title={guideMode ? 'Turn off beginner explainer cards' : 'Turn on beginner explainer cards for judges'}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: guideMode ? 'rgba(6, 182, 212, 0.15)' : 'transparent',
            border: `1px solid ${guideMode ? 'rgba(6, 182, 212, 0.4)' : 'var(--border-accent)'}`,
            color: guideMode ? 'var(--accent-cyan)' : 'var(--text-muted)',
            borderRadius: 'var(--radius-sm)',
            padding: '5px 9px',
            fontSize: '10px',
            fontFamily: 'var(--font-mono)',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
        >
          <Lightbulb size={12} color={guideMode ? '#22d3ee' : 'currentColor'} />
          <span>{guideMode ? 'GUIDE ON' : 'GUIDE OFF'}</span>
        </button>

        {/* Audio Mute/Unmute */}
        <button
          className="btn btn-outline"
          onClick={handleToggleSound}
          title={muted ? 'Unmute audio effects' : 'Mute audio effects'}
          style={{ padding: '6px 8px', color: muted ? 'var(--text-muted)' : 'var(--accent-cyan)' }}
        >
          {muted ? <VolumeX size={13} /> : <Volume2 size={13} />}
        </button>

        {/* Fullscreen Toggle */}
        <button
          className="btn btn-outline"
          onClick={toggleFullscreen}
          title="Toggle Fullscreen (F)"
          style={{ padding: '6px 8px' }}
        >
          {isFullscreen ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
        </button>

        {/* 60s Demo Launch */}
        <button
          className="btn btn-primary"
          onClick={onDemoClick}
          style={{
            fontSize: '10px',
            padding: '6px 12px',
            background: 'linear-gradient(135deg, #06b6d4, #3b82f6)',
            boxShadow: '0 0 12px rgba(6,182,212,0.3)',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <Play size={11} fill="#fff" />
          <span>60s DEMO</span>
        </button>
      </div>
    </header>
  );
}

function MetricPill({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string; color: string }) {
  return (
    <div className="metric-pill" style={{ padding: '4px 14px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', opacity: 0.7 }}>
        <span style={{ color: 'var(--text-secondary)' }}>{icon}</span>
        <span className="text-label" style={{ fontSize: '8px' }}>{label}</span>
      </div>
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', fontWeight: 700, color, letterSpacing: '0.02em' }}>
        {value}
      </span>
    </div>
  );
}
