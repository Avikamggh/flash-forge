'use client';
import { useState, useEffect } from 'react';
import type { SectionId } from './AppShell';
import {
  LayoutDashboard,
  Zap,
  Network,
  GitBranch,
  Boxes,
  DollarSign,
  ShieldAlert,
  Layers,
  Radio
} from 'lucide-react';

const NAV_ITEMS: { id: SectionId; label: string; icon: React.ComponentType<{ size?: number; color?: string; className?: string }>; desc: string }[] = [
  { id: 'command', label: 'Command Center', icon: LayoutDashboard, desc: 'Live System Health' },
  { id: 'simulate', label: 'Traffic Simulator', icon: Zap, desc: 'Flash Sale Controls' },
  { id: 'infra', label: 'Infrastructure', icon: Network, desc: 'Live Architecture Map' },
  { id: 'requests', label: 'Request Flow', icon: GitBranch, desc: 'Trace Hop-by-Hop' },
  { id: 'scaling', label: 'Auto-Scaling', icon: Boxes, desc: 'Dynamic Pod Cluster' },
  { id: 'cost', label: 'Cost Intelligence', icon: DollarSign, desc: 'Savings & ROI Model' },
  { id: 'incidents', label: 'Incidents & Chaos', icon: ShieldAlert, desc: 'Failure Recovery Lab' },
  { id: 'architecture', label: 'Architecture', icon: Layers, desc: 'System Design Spec' },
];

interface Props {
  activeSection: SectionId;
  onSelect: (id: SectionId) => void;
}

export default function Sidebar({ activeSection, onSelect }: Props) {
  return (
    <aside style={{
      width: '215px',
      flexShrink: 0,
      borderRight: '1px solid var(--border)',
      background: 'rgba(13, 16, 23, 0.95)',
      backdropFilter: 'blur(8px)',
      padding: '14px 10px',
      display: 'flex',
      flexDirection: 'column',
      gap: '4px',
      overflowY: 'auto',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 8px 8px' }}>
        <span className="text-label" style={{ fontSize: '8px', color: 'var(--text-muted)' }}>NAVIGATION</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Radio size={10} color="var(--status-ok)" className="animate-pulse" />
          <span style={{ fontSize: '8px', fontFamily: 'var(--font-mono)', color: 'var(--status-ok)', fontWeight: 600 }}>LIVE</span>
        </div>
      </div>

      {NAV_ITEMS.map(item => {
        const Icon = item.icon;
        const isActive = activeSection === item.id;
        return (
          <button
            key={item.id}
            className={`nav-item ${isActive ? 'active' : ''}`}
            onClick={() => onSelect(item.id)}
            style={{
              width: '100%',
              textAlign: 'left',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '9px 10px',
              borderRadius: 'var(--radius-sm)',
              border: `1px solid ${isActive ? 'rgba(6, 182, 212, 0.3)' : 'transparent'}`,
              background: isActive
                ? 'linear-gradient(90deg, rgba(6, 182, 212, 0.12), rgba(59, 130, 246, 0.04))'
                : 'transparent',
              cursor: 'pointer',
              transition: 'all 0.18s ease',
              boxShadow: isActive ? '0 2px 10px rgba(6, 182, 212, 0.1)' : 'none'
            }}
          >
            <div style={{
              width: '24px',
              height: '24px',
              borderRadius: '4px',
              background: isActive ? 'rgba(6, 182, 212, 0.2)' : 'rgba(255, 255, 255, 0.03)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <Icon size={13} color={isActive ? 'var(--accent-cyan)' : 'var(--text-secondary)'} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', minWidth: 0, flex: 1 }}>
              <span style={{
                fontSize: '11px',
                fontWeight: isActive ? 700 : 500,
                color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                fontFamily: 'var(--font-mono)',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}>
                {item.label}
              </span>
              <span style={{
                fontSize: '8px',
                color: isActive ? 'var(--accent-cyan)' : 'var(--text-muted)',
                letterSpacing: '0.02em',
                textTransform: 'none',
                fontWeight: 400,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}>
                {item.desc}
              </span>
            </div>
          </button>
        );
      })}

      {/* System clock */}
      <div style={{ marginTop: 'auto', padding: '12px 10px 4px', borderTop: '1px solid var(--border)' }}>
        <SystemClock />
      </div>
    </aside>
  );
}

function SystemClock() {
  const [time, setTime] = useState<string>('');
  useEffect(() => {
    setTime(new Date().toLocaleTimeString('en-US', { hour12: false }));
    const i = setInterval(() => setTime(new Date().toLocaleTimeString('en-US', { hour12: false })), 1000);
    return () => clearInterval(i);
  }, []);
  return (
    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)', letterSpacing: '0.1em' }}>
      <div style={{ fontSize: '8px', color: 'var(--text-dim)', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '2px' }}>System Time</div>
      <span suppressHydrationWarning>{time}</span>
    </div>
  );
}

