'use client';

const COMPONENTS = [
  {
    name: 'Load Balancer',
    icon: '⊖',
    purpose: 'Distributes incoming requests across healthy API instances using round-robin.',
    needed: 'Without it, all traffic hits a single server — instant overload.',
    spike: 'Health checks fail fast; failed instances are removed from rotation within seconds.',
    color: '#3b82f6',
  },
  {
    name: 'API Gateway',
    icon: '◈',
    purpose: 'Entry point for all client requests. Handles authentication, rate limiting, routing.',
    needed: 'Centralizes cross-cutting concerns — auth, throttling, observability.',
    spike: 'Rate limiting protects backend. Auto-scales horizontally via instance group.',
    color: '#06b6d4',
  },
  {
    name: 'Cache Layer (Redis)',
    icon: '⚡',
    purpose: 'In-memory key-value store serving hot data (menus, product listings) with <2ms latency.',
    needed: 'Flash sales create massive read traffic — database cannot handle it alone.',
    spike: 'Cache absorbs 70–85% of reads during peak. Reduces database load dramatically.',
    color: '#10b981',
  },
  {
    name: 'Message Queue',
    icon: '≡',
    purpose: 'Buffers async tasks (order processing, notifications) between API and workers.',
    needed: 'Decouples producers from consumers. Absorbs bursts without losing requests.',
    spike: 'Queue depth grows during spike. Workers drain it as capacity scales up.',
    color: '#f59e0b',
  },
  {
    name: 'Worker Cluster',
    icon: '⬡',
    purpose: 'Processes async jobs from the queue — order fulfillment, payments, notifications.',
    needed: 'Offloads heavy computation from API layer, keeping response times low.',
    spike: 'Auto-scaled independently. Failed workers trigger retry for their in-flight jobs.',
    color: '#a78bfa',
  },
  {
    name: 'Auto-Scaler',
    icon: '↕',
    purpose: 'Monitors CPU and request rate. Provisions or terminates instances automatically.',
    needed: 'Manual scaling is too slow for flash sales. Human reaction time: minutes. Autoscaler: seconds.',
    spike: 'Detects CPU > 70%, provisions new instances within 6–10 seconds.',
    color: '#06b6d4',
  },
  {
    name: 'Database',
    icon: '▪',
    purpose: 'Persistent storage for orders, users, menus. Primary + read replicas.',
    needed: 'Single source of truth. Read replicas distribute SELECT queries during peak.',
    spike: 'Connection pooling prevents exhaustion. Write traffic isolated to primary.',
    color: '#a78bfa',
  },
  {
    name: 'Monitoring',
    icon: '◉',
    purpose: 'Collects metrics (CPU, latency, error rate, queue depth) and fires alerts.',
    needed: 'You cannot fix what you cannot see. Real-time visibility drives auto-scaling decisions.',
    spike: 'Triggers scaling policies, pagerduty alerts, and incident records automatically.',
    color: '#ef4444',
  },
];

const WHY_CLOUD = [
  { title: 'Elastic Scaling', desc: 'Add or remove compute in seconds — not weeks of hardware procurement. Only pay for what you use.', icon: '↕' },
  { title: 'High Availability', desc: 'Multi-zone deployment means a single datacenter failure does not take your platform down.', icon: '◉' },
  { title: 'Load Distribution', desc: 'Managed load balancers distribute traffic automatically, with health checks and automatic failover.', icon: '⊖' },
  { title: 'Fault Tolerance', desc: 'Message queues, retries, and circuit breakers ensure individual component failures don\'t cascade.', icon: '⚡' },
  { title: 'Async Processing', desc: 'Decouple order processing from HTTP responses. Users get instant confirmation; backend catches up.', icon: '≡' },
  { title: 'Cost Efficiency', desc: 'Auto-scaling eliminates the choice between "always overprovisioned" and "unable to handle spikes."', icon: '$' },
];

export default function ArchitecturePage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '1400px' }}>
      <div>
        <div className="text-label" style={{ color: 'var(--text-muted)' }}>SYSTEM ARCHITECTURE</div>
        <h1 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', marginTop: '2px' }}>
          FlashForge Infrastructure Design
        </h1>
      </div>

      {/* Architecture flow */}
      <div className="panel" style={{ padding: '20px' }}>
        <div className="text-label" style={{ marginBottom: '16px' }}>Request Flow</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0', overflowX: 'auto', paddingBottom: '8px' }}>
          {['CLIENTS', 'LOAD BALANCER', 'API GATEWAY', 'CACHE', 'MESSAGE QUEUE', 'WORKER CLUSTER', 'DATABASE', 'MONITORING'].map((comp, i, arr) => (
            <div key={comp} style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
              <div style={{
                padding: '8px 12px',
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border-accent)',
                borderRadius: '3px',
                fontFamily: 'var(--font-mono)',
                fontSize: '9px',
                fontWeight: 600,
                color: 'var(--text-secondary)',
                letterSpacing: '0.08em',
                whiteSpace: 'nowrap',
              }}>
                {comp}
              </div>
              {i < arr.length - 1 && (
                <div style={{ padding: '0 6px', color: 'var(--border-bright)', fontSize: '12px' }}>→</div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Component cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '10px' }}>
        {COMPONENTS.map(comp => (
          <div key={comp.name} className="panel" style={{ padding: '16px', borderTop: `2px solid ${comp.color}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
              <span style={{ fontSize: '16px', color: comp.color }}>{comp.icon}</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '0.06em' }}>{comp.name}</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div>
                <span className="text-label" style={{ color: 'var(--text-muted)', marginBottom: '3px', display: 'block' }}>PURPOSE</span>
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>{comp.purpose}</p>
              </div>
              <div>
                <span className="text-label" style={{ color: 'var(--text-muted)', marginBottom: '3px', display: 'block' }}>WHY NEEDED</span>
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>{comp.needed}</p>
              </div>
              <div>
                <span className="text-label" style={{ color: comp.color, marginBottom: '3px', display: 'block' }}>DURING SPIKE</span>
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>{comp.spike}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* WHY CLOUD */}
      <div className="panel" style={{ padding: '20px' }}>
        <div style={{ marginBottom: '16px' }}>
          <div className="text-label" style={{ marginBottom: '4px' }}>WHY CLOUD?</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-secondary)' }}>
            Six fundamental cloud properties that make flash sales survivable:
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '8px' }}>
          {WHY_CLOUD.map(item => (
            <div key={item.title} style={{ display: 'flex', gap: '12px', padding: '12px', background: 'var(--bg-elevated)', borderRadius: '3px', border: '1px solid var(--border)' }}>
              <span style={{ color: 'var(--accent-cyan)', fontSize: '16px', flexShrink: 0, marginTop: '2px' }}>{item.icon}</span>
              <div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px', letterSpacing: '0.05em' }}>{item.title}</div>
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tagline */}
      <div style={{ textAlign: 'center', padding: '20px', borderTop: '1px solid var(--border)' }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '0.1em', marginBottom: '6px' }}>
          ENGINEERED TO SURVIVE THE SPIKE.
        </div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)', letterSpacing: '0.06em' }}>
          Elastic infrastructure. Zero panic.
        </div>
      </div>
    </div>
  );
}
