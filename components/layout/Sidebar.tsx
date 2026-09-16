'use client';
import { useState, useEffect } from 'react';
import type { SectionId } from './AppShell';


const NAV_ITEMS: { id: SectionId; label: string; icon: string; desc: string }[] = [
  { id: 'command', label: 'Command Center', icon: '⬡', desc: 'Overview' },
  { id: 'simulate', label: 'Traffic Simulator', icon: '⚡', desc: 'Flash sale controls' },
  { id: 'infra', label: 'Infrastructure', icon: '◈', desc: 'Live topology' },
  { id: 'requests', label: 'Request Flow', icon: '⇒', desc: 'Individual requests' },
  { id: 'scaling', label: 'Auto-Scaling', icon: '⊞', desc: 'Instance cluster' },
  { id: 'cost', label: 'Cost Intelligence', icon: '$', desc: 'Cost analysis' },
  { id: 'incidents', label: 'Incidents', icon: '◎', desc: 'Event log + chaos' },
  { id: 'architecture', label: 'Architecture', icon: '⋮', desc: 'System design' },
];

interface Props {
  activeSection: SectionId;
  onSelect: (id: SectionId) => void;
}

export default function Sidebar({ activeSection, onSelect }: Props) {
  return (
    <aside style={{
      width: '200px',
      flexShrink: 0,
      borderRight: '1px solid var(--border)',
      background: 'var(--bg-surface)',
      padding: '12px 8px',
      display: 'flex',
      flexDirection: 'column',
      gap: '2px',
      overflowY: 'auto',
    }}>
      <div className="text-label" style={{ padding: '4px 12px 8px', fontSize: '8px' }}>NAVIGATION</div>
      {NAV_ITEMS.map(item => (
        <button
          key={item.id}
          className={`nav-item ${activeSection === item.id ? 'active' : ''}`}
          onClick={() => onSelect(item.id)}
          style={{ width: '100%', textAlign: 'left', background: 'none', cursor: 'pointer' }}
        >
          <span style={{ fontSize: '13px', width: '16px', textAlign: 'center' }}>{item.icon}</span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
            <span style={{ fontSize: '10px' }}>{item.label}</span>
            <span style={{ fontSize: '8px', color: 'var(--text-muted)', letterSpacing: '0.05em', textTransform: 'none', fontWeight: 400 }}>{item.desc}</span>
          </div>
        </button>
      ))}

      {/* System clock */}
      <div style={{ marginTop: 'auto', padding: '12px 12px 4px', borderTop: '1px solid var(--border)' }}>
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

