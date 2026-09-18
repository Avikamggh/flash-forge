'use client';
import { useState } from 'react';
import { useSimulation } from '@/context/SimulationContext';
import { 
  Network, 
  Shield, 
  Zap, 
  Layers, 
  Cpu, 
  TrendingUp, 
  Database, 
  Activity, 
  Boxes, 
  Globe, 
  RotateCcw, 
  DollarSign, 
  Lock, 
  AlertTriangle, 
  CheckCircle2, 
  Sparkles, 
  BookOpen, 
  Info,
  ChevronRight,
  Workflow
} from 'lucide-react';

interface ComponentDetail {
  name: string;
  category: string;
  icon: any;
  purpose: string;
  analogy: string;
  needed: string;
  spike: string;
  techSpec: string;
  color: string;
}

const COMPONENTS: ComponentDetail[] = [
  {
    name: 'Managed Load Balancer',
    category: 'Ingress & Traffic Control',
    icon: Network,
    purpose: 'Distributes incoming HTTP/S connections across healthy API nodes using round-robin and least-connections routing.',
    analogy: 'Airport TSA Security Line director pointing passengers to whichever lane has zero waiting time.',
    needed: 'Without an LB, all traffic hammers one single server until it burns out, leaving other servers idle.',
    spike: 'Runs health checks every 500ms; automatically isolates crashed instances within 2 seconds.',
    techSpec: 'Layer 7 HTTP/2 Reverse Proxy · Sub-millisecond SSL Termination · Keep-Alive Pooling',
    color: '#3b82f6',
  },
  {
    name: 'API Gateway & Rate Limiter',
    category: 'Security & Edge Routing',
    icon: Shield,
    purpose: 'Single door into the system. Handles JSON web token auth, CORS, payload validation, and token-bucket rate limiting.',
    analogy: 'The velvet rope bouncer checking IDs and making sure people enter at a calm, controlled pace.',
    needed: 'Shields internal databases and workers from denial-of-service floods, invalid payloads, and bots.',
    spike: 'Returns instant HTTP 429 "Too Many Requests" to malicious bots, prioritizing verified legitimate shoppers.',
    techSpec: 'Token-Bucket Algorithm · Redis-backed global IP counters · Cryptographic JWT verification',
    color: '#06b6d4',
  },
  {
    name: 'In-Memory Cache (Redis)',
    category: 'High-Speed Memory Tier',
    icon: Zap,
    purpose: 'Ultra-fast memory cache serving hot data (product stock, deal prices, catalog items) in <2ms.',
    analogy: 'The display counter at a bakery where fresh croissants are already packaged and ready to grab immediately.',
    needed: 'Relational databases will lock up and freeze if 10,000 customers all request the exact same product page at once.',
    spike: 'Absorbs 85%–95% of incoming reads, preventing the relational database from ever receiving read spikes.',
    techSpec: 'In-memory Key-Value store · LRU Eviction · Stale-While-Revalidate · Sentinel Cluster',
    color: '#10b981',
  },
  {
    name: 'Message Buffer Queue',
    category: 'Asynchronous Decoupling',
    icon: Layers,
    purpose: 'Buffers write-heavy operations (order placements, inventory reservation, push notifications) in FIFO order.',
    analogy: 'The postal drop box outside a post office. You drop your package in 1 second; the delivery vans process them steadily.',
    needed: 'Decouples the customer’s checkout click from payment settlement. Customer gets a 200 OK instantly; backend completes work in background.',
    spike: 'Queue temporarily swells to hold 5,000 requests without losing a single cent or dropping an order.',
    techSpec: 'Distributed FIFO Partitioning · At-Least-Once Delivery · Dead-Letter Retry Queue (DLQ)',
    color: '#f59e0b',
  },
  {
    name: 'Worker Fleet Cluster',
    category: 'Heavy Computation & Fulfillment',
    icon: Cpu,
    purpose: 'Consumes jobs from the message queue to finalize credit card charges, generate invoices, and send emails.',
    analogy: 'A kitchen staff of chefs who steadily cook the order tickets pinned to the kitchen rail.',
    needed: 'Keeps heavy computation (PDF receipt generation, third-party Stripe API calls) off the user-facing web server.',
    spike: 'Horizontal Pod Autoscaler (HPA) multiplies worker nodes from 2 up to 20 based on Queue Depth.',
    techSpec: 'Stateless Node.js/Go Workers · Graceful SIGTERM Draining · Exponential backoff retries',
    color: '#a78bfa',
  },
  {
    name: 'Horizontal Auto-Scaler (HPA)',
    category: 'Autonomous Elasticity Engine',
    icon: TrendingUp,
    purpose: 'Monitors real-time CPU utilization, memory pressure, and queue backlog to add or remove servers automatically.',
    analogy: 'Store manager who immediately calls extra cashiers from the break room the second a line exceeds 5 people.',
    needed: 'Human engineers take 5 to 15 minutes to notice a traffic spike and log into AWS/GCP. The autoscaler reacts in 8 seconds.',
    spike: 'Provisions new cloud nodes proactively before CPU hits 80%, avoiding catastrophic cascade crashes.',
    techSpec: 'Kubernetes HPA Controller · Cooldown Anti-Flapping Stabilization · Step-scaling curve',
    color: '#06b6d4',
  },
  {
    name: 'Relational Database',
    category: 'Persistent Storage of Record',
    icon: Database,
    purpose: 'Persistent ACID-compliant storage for users, final orders, inventory ledger, and financial records.',
    analogy: 'The heavy steel bank vault where ledger books are stamped permanently once and never lost.',
    needed: 'Must guarantee strict consistency: you cannot accidentally sell 1 laptop to 2 different shoppers.',
    spike: 'Connection poolers (PgBouncer) prevent connection exhaustion; write queries isolated to primary replica.',
    techSpec: 'PostgreSQL with Read-Replicas · Connection Pooling (max 200) · Row-level pessimistic locking',
    color: '#a78bfa',
  },
  {
    name: 'Telemetry & Incident Center',
    category: 'Observability & Self-Healing',
    icon: Activity,
    purpose: 'Tracks latency distributions (p50, p95, p99), error rates, CPU load, and triggers automated self-healing.',
    analogy: 'The cockpit instrument panel on a commercial airplane, auto-correcting airspeed and autopilot in turbulence.',
    needed: 'You cannot fix what you cannot measure. Real-time telemetry is the brain of automated resilience.',
    spike: 'Detects anomalies in 200ms, engages circuit breakers, and alerts on-call engineers only if automation fails.',
    techSpec: 'Prometheus metrics scrape · Grafana dashboards · Distributed OpenTelemetry trace spans',
    color: '#ef4444',
  },
];

const CASE_STUDIES = [
  {
    title: 'The Ticketmaster Concert Rush Meltdown',
    company: 'Live Entertainment Ticketing',
    problem: '14 million fans flooded the platform simultaneously. Synchronous database seat locks created deadlocks, causing checkout gateways to freeze and throw 500 error cascades.',
    howFlashForgeSolves: 'FlashForge replaces synchronous seat locking with an asynchronous Message Queue Buffer & Virtual Waiting Room. Customers receive a cryptographic queue ticket, and requests are fed to checkout workers at a strictly metered rate.',
    badge: 'CONCURRENCY BOTTLENECK',
    badgeColor: 'warn'
  },
  {
    title: 'Amazon Prime Day 15-Minute Outage',
    company: 'Global E-Commerce Giant',
    problem: 'An internal service caching layer collapsed due to an unexpected surge in homepage views, resulting in a "thundering herd" where hundreds of thousands of requests hammered the relational database simultaneously.',
    howFlashForgeSolves: 'FlashForge implements Stale-While-Revalidate caching with Cache-Aside Mutex Locks. Even if the cache is flushed during a flash sale, only 1 request goes to the database while all others are served stale cached data until refreshed.',
    badge: 'THUNDERING HERD',
    badgeColor: 'error'
  },
  {
    title: 'New Year’s Eve Food Delivery Crash',
    company: 'On-Demand Delivery Network',
    problem: 'At exactly 11:59 PM, a nationwide "Happy New Year" push notification prompted 800,000 users to open the app at the same second, overwhelming cold cloud containers before autoscalers could spin up.',
    howFlashForgeSolves: 'FlashForge includes Predictive Pre-Scaling. When marketing schedules a flash drop or push notification, the system pre-warms the compute fleet 5 minutes beforehand so capacity is already active when traffic strikes.',
    badge: 'COLD START COLLAPSE',
    badgeColor: 'info'
  }
];

export default function ArchitecturePage() {
  const { guideMode } = useSimulation();
  const [viewMode, setViewMode] = useState<'executive' | 'engineer'>('executive');
  const [selectedComp, setSelectedComp] = useState<ComponentDetail | null>(COMPONENTS[0]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '1400px' }}>
      {/* Header with View Mode Switch */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div className="text-label" style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Workflow size={12} color="var(--accent-cyan)" />
            CLOUD SYSTEM ARCHITECTURE & FAULT TOLERANCE
          </div>
          <h1 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', marginTop: '2px' }}>
            FlashForge Multi-Tier Infrastructure Blueprint
          </h1>
        </div>

        {/* View mode toggle */}
        <div style={{ display: 'flex', background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '2px' }}>
          <button
            onClick={() => setViewMode('executive')}
            style={{
              padding: '6px 12px',
              borderRadius: '3px',
              fontFamily: 'var(--font-mono)',
              fontSize: '10px',
              fontWeight: 600,
              background: viewMode === 'executive' ? 'var(--accent-cyan)' : 'transparent',
              color: viewMode === 'executive' ? '#000' : 'var(--text-secondary)',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.15s ease',
            }}
          >
            <Sparkles size={11} /> Executive / High-Level View
          </button>
          <button
            onClick={() => setViewMode('engineer')}
            style={{
              padding: '6px 12px',
              borderRadius: '3px',
              fontFamily: 'var(--font-mono)',
              fontSize: '10px',
              fontWeight: 600,
              background: viewMode === 'engineer' ? 'var(--accent-cyan)' : 'transparent',
              color: viewMode === 'engineer' ? '#000' : 'var(--text-secondary)',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.15s ease',
            }}
          >
            <Cpu size={11} /> Deep-Dive Engineering Specs
          </button>
        </div>
      </div>

      {/* Guide Mode Explainer */}
      {guideMode && (
        <div className="guide-card animate-fade-in">
          <div className="guide-title">
            <Info size={14} color="var(--accent-cyan)" />
            How To Read This Architecture (The Resilient Supermarket Model)
          </div>
          <div className="guide-body">
            Think of FlashForge as a high-tech department store on Black Friday:
            <ul style={{ margin: '6px 0 0 16px', lineHeight: 1.6 }}>
              <li><strong>Load Balancer:</strong> The parking attendants directing cars to open parking structures.</li>
              <li><strong>API Gateway:</strong> The security guards verifying shoppers and preventing stampedes.</li>
              <li><strong>Redis Cache:</strong> The promotional display tables where everyone grabs doorbusters instantly without bugging staff.</li>
              <li><strong>Message Queue:</strong> The checkout conveyor belt that holds orders safely until a cashier is ready.</li>
              <li><strong>Auto-Scaler:</strong> The floor manager who calls extra cashiers the second a queue gets long.</li>
            </ul>
          </div>
        </div>
      )}

      {/* Interactive Request Flow Visualizer Ribbon */}
      <div className="panel" style={{ padding: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <div className="text-label">End-to-End Flash Sale Path</div>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'var(--text-muted)' }}>
            Click any component below to inspect specifications
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', overflowX: 'auto', paddingBottom: '4px' }}>
          {COMPONENTS.map((comp, i, arr) => {
            const Icon = comp.icon;
            const isSelected = selectedComp?.name === comp.name;
            return (
              <div key={comp.name} style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                <button
                  onClick={() => setSelectedComp(comp)}
                  style={{
                    padding: '8px 12px',
                    background: isSelected ? 'rgba(6,182,212,0.15)' : 'var(--bg-elevated)',
                    border: `1px solid ${isSelected ? 'var(--accent-cyan)' : 'var(--border)'}`,
                    borderRadius: '4px',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '9px',
                    fontWeight: isSelected ? 700 : 500,
                    color: isSelected ? 'var(--accent-cyan)' : 'var(--text-secondary)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <Icon size={12} color={comp.color} />
                  <span>{comp.name}</span>
                </button>
                {i < arr.length - 1 && (
                  <ChevronRight size={14} color="var(--border-bright)" style={{ margin: '0 2px', flexShrink: 0 }} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Component Spotlight Card */}
      {selectedComp && (
        <div className="panel" style={{ padding: '18px', borderLeft: `4px solid ${selectedComp.color}`, background: 'linear-gradient(90deg, rgba(6,182,212,0.03) 0%, var(--bg-surface) 100%)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '6px', background: 'var(--bg-elevated)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <selectedComp.icon size={18} color={selectedComp.color} />
              </div>
              <div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {selectedComp.name}
                </div>
                <div className="text-label" style={{ color: selectedComp.color, marginTop: '2px' }}>
                  {selectedComp.category}
                </div>
              </div>
            </div>
            <span className="badge badge-cyan" style={{ fontSize: '9px' }}>CRITICAL PATH</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px', marginTop: '12px' }}>
            <div style={{ padding: '10px 12px', background: 'var(--bg-elevated)', borderRadius: '4px', border: '1px solid var(--border)' }}>
              <div className="text-label" style={{ color: 'var(--text-muted)', marginBottom: '4px' }}>CORE PURPOSE</div>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-primary)', lineHeight: 1.5 }}>
                {selectedComp.purpose}
              </p>
            </div>

            <div style={{ padding: '10px 12px', background: 'var(--bg-elevated)', borderRadius: '4px', border: '1px solid var(--border)' }}>
              <div className="text-label" style={{ color: viewMode === 'executive' ? 'var(--status-ok)' : 'var(--accent-cyan)', marginBottom: '4px' }}>
                {viewMode === 'executive' ? 'REAL-WORLD ANALOGY' : 'TECHNICAL SPECIFICATION'}
              </div>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-primary)', lineHeight: 1.5 }}>
                {viewMode === 'executive' ? selectedComp.analogy : selectedComp.techSpec}
              </p>
            </div>

            <div style={{ padding: '10px 12px', background: 'var(--bg-elevated)', borderRadius: '4px', border: '1px solid var(--border)' }}>
              <div className="text-label" style={{ color: selectedComp.color, marginBottom: '4px' }}>DURING 10,000+ RPS FLASH SURGE</div>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-primary)', lineHeight: 1.5 }}>
                {selectedComp.spike}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Grid of All Architectural Components */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '10px' }}>
        {COMPONENTS.map(comp => {
          const Icon = comp.icon;
          return (
            <div
              key={comp.name}
              onClick={() => setSelectedComp(comp)}
              className="panel"
              style={{
                padding: '16px',
                borderTop: `2px solid ${comp.color}`,
                cursor: 'pointer',
                transition: 'transform 0.15s ease, border-color 0.15s ease',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                <Icon size={16} color={comp.color} />
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {comp.name}
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div>
                  <span className="text-label" style={{ color: 'var(--text-muted)', marginBottom: '2px', display: 'block' }}>
                    {viewMode === 'executive' ? 'EVERYDAY ANALOGY' : 'WHY THIS MATTERS'}
                  </span>
                  <p style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                    {viewMode === 'executive' ? comp.analogy : comp.needed}
                  </p>
                </div>

                <div>
                  <span className="text-label" style={{ color: comp.color, marginBottom: '2px', display: 'block' }}>
                    {viewMode === 'executive' ? 'SPIKE BEHAVIOR' : 'ENGINEERING SPEC'}
                  </span>
                  <p style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                    {viewMode === 'executive' ? comp.spike : comp.techSpec}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Famous Outage Case Studies & FlashForge Solutions */}
      <div className="panel" style={{ padding: '18px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <BookOpen size={16} color="var(--accent-cyan)" />
              <span className="text-label" style={{ color: 'var(--accent-cyan)' }}>REAL-WORLD CASE STUDIES</span>
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', marginTop: '2px' }}>
              How FlashForge Solves Infamous High-Traffic Industry Outages
            </div>
          </div>
          <span className="badge badge-cyan" style={{ fontSize: '9px' }}>POST-MORTEM ANALYSIS</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
          {CASE_STUDIES.map(cs => (
            <div key={cs.title} style={{ padding: '14px', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <span className={`badge badge-${cs.badgeColor}`} style={{ fontSize: '8px' }}>
                    {cs.badge}
                  </span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'var(--text-muted)' }}>
                    {cs.company}
                  </span>
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>
                  {cs.title}
                </div>
                <div style={{ marginBottom: '10px' }}>
                  <span className="text-label" style={{ color: 'var(--status-error)', marginBottom: '2px', display: 'block' }}>WHAT BROKE:</span>
                  <p style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                    {cs.problem}
                  </p>
                </div>
              </div>

              <div style={{ borderTop: '1px solid var(--border)', paddingTop: '10px', marginTop: '8px' }}>
                <span className="text-label" style={{ color: 'var(--status-ok)', marginBottom: '2px', display: 'block' }}>FLASHFORGE REMEDY:</span>
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'var(--text-primary)', lineHeight: 1.5 }}>
                  {cs.howFlashForgeSolves}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Six Pillars of Cloud Resilience */}
      <div className="panel" style={{ padding: '18px' }}>
        <div style={{ marginBottom: '14px' }}>
          <div className="text-label" style={{ marginBottom: '2px' }}>WHY MODERN CLOUD WINS</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-secondary)' }}>
            Six architectural pillars that make sudden multi-thousand RPS flash sales survivable:
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '10px' }}>
          {[
            { title: 'Elastic Horizontal Scaling', desc: 'Add compute nodes in 8 seconds instead of waiting weeks for physical hardware.', icon: TrendingUp },
            { title: 'Multi-Zone Availability', desc: 'If one data center loses power, traffic shifts instantly to surviving zones with zero downtime.', icon: Globe },
            { title: 'Asynchronous Buffering', desc: 'Separate instant user responses from heavy background credit card processing.', icon: Layers },
            { title: 'Multi-Layer Fault Isolation', desc: 'A failed worker node never brings down the front-end website or shopping cart.', icon: Shield },
            { title: 'Sub-Millisecond Caching', desc: 'Serve 90% of product page requests directly from memory with zero database stress.', icon: Zap },
            { title: 'Dynamic Cost Efficiency', desc: 'Never pay for peak servers when your shoppers are asleep. Auto-scale to baseline.', icon: DollarSign },
          ].map(item => {
            const Icon = item.icon;
            return (
              <div key={item.title} style={{ display: 'flex', gap: '12px', padding: '12px', background: 'var(--bg-elevated)', borderRadius: '4px', border: '1px solid var(--border)' }}>
                <Icon size={18} color="var(--accent-cyan)" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '3px' }}>
                    {item.title}
                  </div>
                  <p style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                    {item.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom Tagline */}
      <div style={{ textAlign: 'center', padding: '24px 16px', borderTop: '1px solid var(--border)' }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '14px', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '0.08em', marginBottom: '4px' }}>
          ENGINEERED TO SURVIVE THE SPIKE. ZERO HUMAN PANIC.
        </div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)' }}>
          Cloud Wars Hackathon · Team Xploreon · Automated Flash Sale Resilience Simulator
        </div>
      </div>
    </div>
  );
}

