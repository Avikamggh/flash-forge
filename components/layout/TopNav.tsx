'use client';
import { useState } from 'react';
import { useSimulation } from '@/context/SimulationContext';
import { useAnimatedNumber } from '@/hooks/useAnimatedNumber';
import { useFullscreen } from '@/hooks/useFullscreen';
import { formatRps, formatLatency } from '@/lib/utils/format';
import { isSoundMuted, toggleSound } from '@/lib/utils/sounds';

interface Props {
  activeSection: string;
  onDemoClick: () => void;
}

export default function TopNav({ activeSection, onDemoClick }: Props) {
  const { state } = useSimulation();
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
      height: '52px',
      borderBottom: '1px solid var(--border)',
      background: 'var(--bg-surface)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0',
      flexShrink: 0,
      position: 'relative',
      zIndex: 50,
    }}>
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 0, padding: '0 20px', borderRight: '1px solid var(--border)', height: '100%' }}>
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" style={{ marginRight: 10 }}>
          <path d="M11 2L3 11H10L9 18L17 9H10L11 2Z" fill={isCritical ? '#ef4444' : isFlashSale ? '#f59e0b' : '#06b6d4'} />
          <rect x="2" y="14" width="16" height="1" rx="0.5" fill="rgba(6,182,212,0.3)" />
        </svg>
        <div>
          <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '14px', color: 'var(--text-primary)', letterSpacing: '0.1em' }}>FLASHFORGE</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '8px', color: 'var(--text-muted)', letterSpacing: '0.15em', marginTop: '-2px' }}>CLOUD OPS CENTER</div>
        </div>
      </div>

      {/* System status */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0 20px', borderRight: '1px solid var(--border)', height: '100%' }}>
        <span className={`status-dot ${isCritical ? 'error' : isFlashSale ? 'warn' : 'ok'}`} />
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: isCritical ? 'var(--status-error)' : isFlashSale ? 'var(--status-warn)' : 'var(--status-ok)', letterSpacing: '0.08em' }}>
          {isCritical ? 'CRITICAL LOAD' : isFlashSale ? 'FLASH SALE ACTIVE' : 'SYSTEMS OPERATIONAL'}
        </span>
      </div>

      {/* Live metrics */}
      <div style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
        <MetricPill label="Traffic" value={formatRps(rps) + '/s'} color={isCritical ? 'var(--status-error)' : isFlashSale ? 'var(--status-warn)' : 'var(--text-primary)'} />
        <MetricPill label="Instances" value={Math.round(instances).toString()} color="var(--accent-cyan)" />
        <MetricPill label="Queue" value={Math.round(state.queueDepth).toLocaleString()} color={state.queueDepth > 500 ? 'var(--status-warn)' : 'var(--text-primary)'} />
        <MetricPill label="Latency" value={formatLatency(latency)} color={latency > 300 ? 'var(--status-error)' : latency > 150 ? 'var(--status-warn)' : 'var(--status-ok)'} />
        <MetricPill label="Cost/hr" value={`$${cost.toFixed(2)}`} color="var(--text-secondary)" />
      </div>

      {/* Actions */}
      <div style={{ padding: '0 12px', borderLeft: '1px solid var(--border)', height: '100%', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <button
          className="btn btn-outline"
          onClick={handleToggleSound}
          title={muted ? 'Unmute audio effects' : 'Mute audio effects'}
          style={{ fontSize: '10px', padding: '6px 10px', color: muted ? 'var(--text-muted)' : 'var(--accent-cyan)' }}
        >
          {muted ? '🔇' : '🔊'}
        </button>
        <button
          className="btn btn-outline"
          onClick={toggleFullscreen}
          title="Toggle fullscreen (F)"
          style={{ fontSize: '10px', padding: '6px 10px' }}
        >
          {isFullscreen ? '⊡' : '⊞'}
        </button>
        <button className="btn btn-outline" onClick={onDemoClick} style={{ fontSize: '10px' }}>
          ▶ DEMO
        </button>
      </div>
    </header>
  );
}

function MetricPill({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="metric-pill">
      <span className="text-label" style={{ fontSize: '8px' }}>{label}</span>
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', fontWeight: 600, color, letterSpacing: '0.02em' }}>{value}</span>
    </div>
  );
}
