'use client';
import { useState, useEffect, useRef } from 'react';
import { useSimulation } from '@/context/SimulationContext';
import { Instance } from '@/lib/simulation/types';
import { cpuColor, statusColor } from '@/lib/utils/format';
import {
  Network,
  Server,
  Layers,
  Database,
  Cpu,
  Zap,
  Info,
  ShieldCheck,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

interface NodePos {
  x: number;
  y: number;
  label: string;
  type: 'users' | 'lb' | 'api' | 'queue' | 'worker' | 'db' | 'cache';
  id?: string;
}

interface Packet {
  id: string;
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
  progress: number;
  color: string;
}

type SelectedNode = { type: string; id?: string } | null;

function getPodPositions(count: number): number[] {
  const displayed = Math.min(count, 5);
  if (displayed <= 0) return [];
  if (displayed === 1) return [380];
  const spacing = displayed === 5 ? 116 : displayed === 4 ? 126 : 136;
  const startX = 380 - ((displayed - 1) * spacing) / 2;
  return Array.from({ length: displayed }, (_, i) => Math.round(startX + i * spacing));
}

export default function InfrastructureMap() {
  const { state, guideMode } = useSimulation();
  const [selected, setSelected] = useState<SelectedNode>({ type: 'lb' });
  const [packets, setPackets] = useState<Packet[]>([]);
  const packetIdRef = useRef(0);

  const isFlashSale = state.currentRps > 3000;
  const isCritical = state.currentRps > 8000;

  const healthyApi = state.apiInstances.filter(i => i.status === 'healthy');
  const healthyWorker = state.workerInstances.filter(i => i.status === 'healthy');

  const apiPositions = getPodPositions(state.apiInstances.length);
  const workerPositions = getPodPositions(state.workerInstances.length);

  // Animate data packets
  useEffect(() => {
    const interval = setInterval(() => {
      const speed = isFlashSale ? 0.028 : 0.014;
      const newPackets: Packet[] = [];
      const count = isCritical ? 5 : isFlashSale ? 3 : 2;

      const currentApiPos = getPodPositions(state.apiInstances.length);
      const currentWrkPos = getPodPositions(state.workerInstances.length);

      for (let i = 0; i < count; i++) {
        packetIdRef.current++;
        const targetApiX = currentApiPos[Math.floor(Math.random() * currentApiPos.length)] || 380;
        const targetWrkX = currentWrkPos[Math.floor(Math.random() * currentWrkPos.length)] || 380;

        const routes = [
          { fx: 380, fy: 65, tx: 380, ty: 145 },
          { fx: 380, fy: 195, tx: targetApiX, ty: 270 },
          { fx: targetApiX, fy: 320, tx: 380, ty: 405 },
          { fx: 380, fy: 455, tx: targetWrkX, ty: 530 },
          { fx: targetWrkX, fy: 580, tx: 380, ty: 640 },
        ];
        const seg = routes[Math.floor(Math.random() * routes.length)];
        newPackets.push({
          id: `p-${packetIdRef.current}`,
          fromX: seg.fx, fromY: seg.fy,
          toX: seg.tx, toY: seg.ty,
          progress: 0,
          color: isCritical ? '#ef4444' : isFlashSale ? '#f59e0b' : '#06b6d4',
        });
      }

      setPackets(prev => {
        const updated = prev
          .map(p => ({ ...p, progress: p.progress + speed }))
          .filter(p => p.progress < 1);
        return [...updated, ...newPackets].slice(-50);
      });
    }, 75);
    return () => clearInterval(interval);
  }, [isFlashSale, isCritical, state.apiInstances.length, state.workerInstances.length]);

  const apiCount = state.apiInstances.length;
  const workerCount = state.workerInstances.length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', maxWidth: '1400px' }}>
      {/* Title & Status */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="text-label" style={{ color: 'var(--accent-cyan)' }}>CLOUD ARCHITECTURE TOPOLOGY</span>
            <span className="badge badge-cyan" style={{ fontSize: '8px' }}>INTERACTIVE MAP</span>
          </div>
          <h1 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-primary)', marginTop: '2px' }}>
            Live Infrastructure & Traffic Routing Map
          </h1>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span className="badge badge-cyan" style={{ fontSize: '10px', padding: '6px 12px' }}>
            {Math.round(state.currentRps).toLocaleString()} req/s Routed Live
          </span>
        </div>
      </div>

      {/* Guide Mode Card */}
      {guideMode && (
        <div className="guide-card">
          <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '6px', background: 'rgba(6,182,212,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Network size={16} color="var(--accent-cyan)" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Interactive Architecture Guide: Click Any Component
                </span>
                <span className="analogy-pill">Judge Guide</span>
              </div>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                Each layer below has a critical job during high traffic. <strong>Click any box</strong> (e.g. Load Balancer, Request Queue, Redis Cache, or Postgres DB)
                to see its live telemetry, why it is indispensable during a flash surge, and how it self-heals under pressure.
              </p>
            </div>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
        {/* SVG Topology Panel */}
        <div className="panel" style={{ flex: 2, minWidth: '450px', padding: '18px', overflow: 'hidden' }}>
          <div className="panel-header" style={{ padding: '0 0 14px', border: 'none' }}>
            <span className="text-label" style={{ color: 'var(--text-primary)', fontSize: '11px' }}>
              Multi-Tier Cloud Microservices Map
            </span>
            <span style={{ fontSize: '9px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
              Animated dots = Live HTTP/2 Packets
            </span>
          </div>

          <div style={{ position: 'relative', overflowX: 'auto' }}>
            <svg width="760" height="720" style={{ display: 'block', margin: '0 auto' }}>
              <defs>
                <marker id="arrow" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
                  <path d="M0,0 L0,6 L6,3 z" fill="var(--border-bright)" />
                </marker>
                <linearGradient id="nodeGlow" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="rgba(6,182,212,0.15)" />
                  <stop offset="100%" stopColor="rgba(59,130,246,0.05)" />
                </linearGradient>
              </defs>

              {/* Architectural Tier Bands (Subtle background labels) */}
              <TierBand y={30} height={70} label="TIER 1 · EDGE & CONSUMERS" />
              <TierBand y={135} height={70} label="TIER 2 · INGRESS & LOAD BALANCING" />
              <TierBand y={250} height={100} label="TIER 3 · HORIZONTAL API GATEWAY PODS" />
              <TierBand y={385} height={80} label="TIER 4 · ASYNC MESSAGE BROKER & QUEUE" />
              <TierBand y={500} height={100} label="TIER 5 · WORKER CLUSTER & TASK RUNNERS" />
              <TierBand y={635} height={75} label="TIER 6 · DATA PERSISTENCE & IN-MEMORY CACHE" />

              {/* Connection Lines */}
              {/* Users → LB */}
              <Connector x1={380} y1={75} x2={380} y2={142} />

              {/* LB → APIs */}
              {apiPositions.map((x, i) => (
                <Connector key={`lb-api-${i}`} x1={380} y1={195} x2={x} y2={270} />
              ))}

              {/* APIs → Queue */}
              {apiPositions.map((x, i) => (
                <Connector key={`api-q-${i}`} x1={x} y1={320} x2={380} y2={405} />
              ))}

              {/* Queue → Workers */}
              {workerPositions.map((x, i) => (
                <Connector key={`q-wrk-${i}`} x1={380} y1={455} x2={x} y2={530} />
              ))}

              {/* Workers → DB */}
              {workerPositions.map((x, i) => (
                <Connector key={`wrk-db-${i}`} x1={x} y1={580} x2={380} y2={640} />
              ))}

              {/* DB ↔ Cache */}
              <Connector x1={465} y1={665} x2={520} y2={665} />

              {/* Live Flow Rate Label */}
              <text x={395} y={115} fill="var(--accent-cyan)" fontSize="9" fontFamily="IBM Plex Mono" fontWeight="600">
                {Math.round(state.currentRps).toLocaleString()} req/s
              </text>

              {/* NODES */}
              {/* USERS */}
              <InfraNode cx={380} cy={55} label="CONSUMER CLIENTS" sublabel={`${Math.round(state.activeUsers).toLocaleString()} Active Sessions`} type="users"
                color="var(--text-secondary)" onClick={() => setSelected({ type: 'users' })} selected={selected?.type === 'users'} wide />

              {/* LOAD BALANCER */}
              <InfraNode cx={380} cy={170} label="LAYER 7 LOAD BALANCER" sublabel={`Reverse Proxy · ${Math.round(state.currentRps)} req/s`} type="lb"
                color={isCritical ? '#ef4444' : '#3b82f6'} onClick={() => setSelected({ type: 'lb' })} selected={selected?.type === 'lb'} wide />

              {/* API Instances */}
              {state.apiInstances.slice(0, 5).map((inst, i) => {
                const x = apiPositions[i] ?? 380;
                return (
                  <InfraNode key={inst.id} cx={x} cy={295} label={inst.name} sublabel={`CPU ${Math.round(inst.cpu)}%`}
                    type="api" color={statusColor(inst.status)} status={inst.status}
                    onClick={() => setSelected({ type: 'api', id: inst.id })} selected={selected?.id === inst.id} />
                );
              })}
              {apiCount > 5 && (
                <text x={Math.min((apiPositions[apiPositions.length - 1] || 580) + 56, 715)} y={300} fill="var(--text-muted)" fontSize="9" fontFamily="IBM Plex Mono">
                  +{apiCount - 5} pods
                </text>
              )}

              {/* REQUEST QUEUE */}
              <InfraNode cx={380} cy={430} label="MESSAGE BUFFER (BULLMQ/KAFKA)" sublabel={`${Math.round(state.queueDepth)} in-queue · ${state.queueProcessed} processed`} type="queue"
                color={state.queueDepth > 500 ? '#f59e0b' : '#06b6d4'} onClick={() => setSelected({ type: 'queue' })} selected={selected?.type === 'queue'} wide />

              {/* Worker Instances */}
              {state.workerInstances.slice(0, 5).map((inst, i) => {
                const x = workerPositions[i] ?? 380;
                return (
                  <InfraNode key={inst.id} cx={x} cy={555} label={inst.name} sublabel={`CPU ${Math.round(inst.cpu)}%`}
                    type="worker" color={statusColor(inst.status)} status={inst.status}
                    onClick={() => setSelected({ type: 'worker', id: inst.id })} selected={selected?.id === inst.id} />
                );
              })}
              {workerCount > 5 && (
                <text x={Math.min((workerPositions[workerPositions.length - 1] || 580) + 56, 715)} y={560} fill="var(--text-muted)" fontSize="9" fontFamily="IBM Plex Mono">
                  +{workerCount - 5} pods
                </text>
              )}

              {/* DATABASE */}
              <InfraNode cx={380} cy={665} label="POSTGRESQL 16" sublabel="Primary + 2 Read Replicas" type="db"
                color="#a78bfa" onClick={() => setSelected({ type: 'db' })} selected={selected?.type === 'db'} wide />

              {/* CACHE */}
              <InfraNode cx={570} cy={665} label="REDIS 7 CLUSTER" sublabel={`${Math.round(state.cacheHitRate * 100)}% Hit Rate (<2ms)`} type="cache"
                color="#10b981" onClick={() => setSelected({ type: 'cache' })} selected={selected?.type === 'cache'} />

              {/* Animated Packets */}
              {packets.map(p => {
                const x = p.fromX + (p.toX - p.fromX) * p.progress;
                const y = p.fromY + (p.toY - p.fromY) * p.progress;
                return (
                  <circle key={p.id} cx={x} cy={y} r={3.5} fill={p.color} opacity={Math.sin(p.progress * Math.PI)}>
                    <animate attributeName="r" values="2.5;4;2.5" dur="0.8s" repeatCount="indefinite" />
                  </circle>
                );
              })}
            </svg>
          </div>
        </div>

        {/* Selected Component Detail Drawer */}
        <div className="panel" style={{ flex: 1, minWidth: '320px', padding: '20px' }}>
          <div className="text-label" style={{ marginBottom: '14px' }}>Component Deep-Dive & Telemetry</div>
          {!selected ? (
            <div style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '11px', marginTop: '24px', textAlign: 'center' }}>
              Click any node in the topology to inspect its internal metrics & purpose
            </div>
          ) : (
            <NodeDetail selected={selected} state={state} />
          )}
        </div>
      </div>
    </div>
  );
}

function TierBand({ y, height, label }: { y: number; height: number; label: string }) {
  return (
    <g>
      <rect x={10} y={y} width={740} height={height} rx={4} fill="rgba(255, 255, 255, 0.01)" stroke="rgba(255, 255, 255, 0.03)" />
      <text x={20} y={y + 14} fill="var(--text-muted)" fontSize="8" fontFamily="IBM Plex Mono" letterSpacing="0.1em" opacity={0.6}>
        {label}
      </text>
    </g>
  );
}

function Connector({ x1, y1, x2, y2 }: { x1: number; y1: number; x2: number; y2: number }) {
  return (
    <line
      x1={x1} y1={y1} x2={x2} y2={y2}
      stroke="rgba(45, 64, 96, 0.7)" strokeWidth={1.5} strokeDasharray="4 4"
      markerEnd="url(#arrow)"
    />
  );
}

function InfraNode({ cx, cy, label, sublabel, type, color, onClick, selected, wide, status }:
  { cx: number; cy: number; label: string; sublabel: string; type: string; color: string; onClick: () => void; selected: boolean; wide?: boolean; status?: string }) {
  const w = wide ? 170 : 96;
  const h = 46;
  const borderColor = selected ? color : 'var(--border-accent)';
  const bg = selected ? `${color}25` : 'var(--bg-elevated)';
  return (
    <g onClick={onClick} style={{ cursor: 'pointer' }}>
      <rect
        x={cx - w / 2} y={cy - h / 2}
        width={w} height={h}
        rx={5}
        fill={bg}
        stroke={borderColor}
        strokeWidth={selected ? 2 : 1}
        filter={selected ? 'drop-shadow(0 0 8px ' + color + '44)' : undefined}
      />
      {status === 'failed' && (
        <rect x={cx - w / 2} y={cy - h / 2} width={w} height={h} rx={5} fill="rgba(239,68,68,0.18)" />
      )}
      <text x={cx} y={cy - 6} textAnchor="middle" fill={color} fontSize="9.5" fontFamily="IBM Plex Mono" fontWeight="700" letterSpacing="0.06em">
        {label}
      </text>
      <text x={cx} y={cy + 10} textAnchor="middle" fill="var(--text-muted)" fontSize="8.5" fontFamily="IBM Plex Mono">
        {sublabel}
      </text>
      {status === 'provisioning' && (
        <circle cx={cx + w / 2 - 10} cy={cy - h / 2 + 10} r={3.5} fill="var(--accent-cyan)" className="animate-pulse" />
      )}
      {status === 'failed' && (
        <text x={cx + w / 2 - 14} y={cy - h / 2 + 12} fill="var(--status-error)" fontSize="10" fontWeight="bold">✕</text>
      )}
    </g>
  );
}

function NodeDetail({ selected, state }: { selected: { type: string; id?: string }; state: any }) {
  if (selected.type === 'lb') {
    return (
      <DetailSection title="Layer 7 Load Balancer" analogy="The Traffic Cop / Line Usher">
        <DetailRow label="Incoming Flow" value={`${Math.round(state.currentRps).toLocaleString()} req/s`} />
        <DetailRow label="Target Pods" value={`${state.apiInstances.filter((i: Instance) => i.status === 'healthy').length} healthy API instances`} />
        <DetailRow label="Balancing Algorithm" value="Least Connections + Weighted Round Robin" />
        <DetailRow label="Health Checks" value="Active (HTTP GET /healthz every 5s)" />
        <DetailRow label="SSL Termination" value="TLS 1.3 / HTTP/2" />
        <div style={{ marginTop: '12px', padding: '12px', background: 'var(--bg-elevated)', borderRadius: '4px', border: '1px solid var(--border)' }}>
          <div style={{ fontSize: '9px', fontWeight: 700, color: 'var(--accent-cyan)', marginBottom: '4px', fontFamily: 'var(--font-mono)' }}>
            ROLE DURING FLASH SALE
          </div>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
            Prevents any single server from catching fire. When traffic jumps 100x, it spreads requests evenly across the entire API fleet. If an instance stalls, it removes it from rotation in milliseconds.
          </p>
        </div>
      </DetailSection>
    );
  }
  if (selected.type === 'queue') {
    return (
      <DetailSection title="Distributed Message Queue" analogy="The Velvet Rope / Waiting Lounge">
        <DetailRow label="Current Queue Depth" value={Math.round(state.queueDepth).toLocaleString()} color={state.queueDepth > 500 ? 'var(--status-warn)' : undefined} />
        <DetailRow label="Processing Workers" value={state.workerInstances.filter((w: Instance) => w.status === 'healthy').length.toString()} />
        <DetailRow label="Completed Transactions" value={state.queueProcessed.toLocaleString()} color="var(--status-ok)" />
        <DetailRow label="Failed / Dead-Letter" value={state.queueFailed.toString()} color="var(--status-error)" />
        <DetailRow label="Automatic Retries" value={state.queueRetrying.toString()} color="var(--status-warn)" />
        <div style={{ marginTop: '12px', padding: '12px', background: 'var(--bg-elevated)', borderRadius: '4px', border: '1px solid var(--border)' }}>
          <div style={{ fontSize: '9px', fontWeight: 700, color: 'var(--status-warn)', marginBottom: '4px', fontFamily: 'var(--font-mono)' }}>
            ROLE DURING FLASH SALE
          </div>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
            Protects the database from melting. Instead of letting 10,000 checkout queries hit the database at the same instant, orders are placed in this buffer and processed steadily by workers.
          </p>
        </div>
      </DetailSection>
    );
  }
  if (selected.type === 'api' && selected.id) {
    const inst = state.apiInstances.find((i: Instance) => i.id === selected.id);
    if (!inst) return null;
    return (
      <DetailSection title={inst.name} analogy="API Gateway Pod">
        <DetailRow label="Pod Status" value={inst.status.toUpperCase()} color={statusColor(inst.status)} />
        <DetailRow label="CPU Utilization" value={`${Math.round(inst.cpu)}%`} color={cpuColor(inst.cpu)} />
        <DetailRow label="Memory Consumption" value={`${Math.round(inst.memory)}%`} />
        <DetailRow label="Live Throughput" value={`${Math.round(inst.throughput).toLocaleString()} req/s`} />
        <DetailRow label="Lifetime Requests" value={inst.requestsHandled.toLocaleString()} />
        <div style={{ marginTop: '12px' }}>
          <div className="text-label" style={{ marginBottom: '4px' }}>CPU Load</div>
          <div className="progress-track" style={{ height: '5px' }}>
            <div className="progress-fill" style={{ width: `${inst.cpu}%`, background: cpuColor(inst.cpu) }} />
          </div>
        </div>
      </DetailSection>
    );
  }
  if (selected.type === 'worker' && selected.id) {
    const inst = state.workerInstances.find((i: Instance) => i.id === selected.id);
    if (!inst) return null;
    return (
      <DetailSection title={inst.name} analogy="Async Worker Pod">
        <DetailRow label="Pod Status" value={inst.status.toUpperCase()} color={statusColor(inst.status)} />
        <DetailRow label="CPU Load" value={`${Math.round(inst.cpu)}%`} color={cpuColor(inst.cpu)} />
        <DetailRow label="Memory" value={`${Math.round(inst.memory)}%`} />
        <DetailRow label="Jobs Processed" value={inst.requestsHandled.toLocaleString()} />
        <DetailRow label="Health Check" value={inst.status === 'healthy' ? 'PASSING' : inst.status.toUpperCase()} color={statusColor(inst.status)} />
      </DetailSection>
    );
  }
  if (selected.type === 'db') {
    return (
      <DetailSection title="PostgreSQL 16 Database" analogy="The Central Bank Vault">
        <DetailRow label="Topology" value="1 Primary (Writes), 2 Read Replicas" />
        <DetailRow label="Connection Pool" value="PgBouncer (Active & Balanced)" />
        <DetailRow label="Active Connections" value={`${Math.round(state.currentRps / 80)} connections`} />
        <DetailRow label="Avg Query Latency" value="11 ms" />
        <div style={{ marginTop: '12px', padding: '12px', background: 'var(--bg-elevated)', borderRadius: '4px', border: '1px solid var(--border)' }}>
          <div style={{ fontSize: '9px', fontWeight: 700, color: '#a78bfa', marginBottom: '4px', fontFamily: 'var(--font-mono)' }}>
            REPLICATION & REPLICAS
          </div>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
            Write operations (inventory reservation) go to the primary node. Product catalog searches are served across read replicas, ensuring the primary node never locks up.
          </p>
        </div>
      </DetailSection>
    );
  }
  if (selected.type === 'cache') {
    return (
      <DetailSection title="Redis 7 Cache Cluster" analogy="The Quick-Access Front Desk">
        <DetailRow label="Cache Hit Rate" value={`${Math.round(state.cacheHitRate * 100)}%`} color="var(--status-ok)" />
        <DetailRow label="Response Latency" value="1.2 ms" color="var(--status-ok)" />
        <DetailRow label="Eviction Policy" value="Volatile-LRU" />
        <DetailRow label="Memory Usage" value="2.4 GB / 8 GB" />
        <div style={{ marginTop: '12px', padding: '12px', background: 'var(--bg-elevated)', borderRadius: '4px', border: '1px solid var(--border)' }}>
          <div style={{ fontSize: '9px', fontWeight: 700, color: 'var(--status-ok)', marginBottom: '4px', fontFamily: 'var(--font-mono)' }}>
            OFFLOADING TRAFFIC
          </div>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
            By keeping hot product items and flash sale deals in memory, Redis answers 85%+ of requests in under 2 milliseconds without bothering the PostgreSQL database.
          </p>
        </div>
      </DetailSection>
    );
  }
  return (
    <DetailSection title="Consumer Clients" analogy="Shoppers & Buyers">
      <DetailRow label="Active Sessions" value={Math.round(state.activeUsers).toLocaleString()} />
      <DetailRow label="Requests per Session" value={`${Math.round((state.currentRps * 60) / Math.max(state.activeUsers, 1))} req/min`} />
    </DetailSection>
  );
}

function DetailSection({ title, analogy, children }: { title: string; analogy?: string; children: React.ReactNode }) {
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '0.04em' }}>
          {title}
        </div>
      </div>
      {analogy && (
        <div style={{ marginBottom: '12px' }}>
          <span className="analogy-pill" style={{ fontSize: '9px' }}>Analogy: {analogy}</span>
        </div>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {children}
      </div>
    </div>
  );
}

function DetailRow({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div className="data-row">
      <span className="text-label">{label}</span>
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: color || 'var(--text-primary)', fontWeight: 600 }}>{value}</span>
    </div>
  );
}
