'use client';
import { useState, useEffect, useRef } from 'react';
import { useSimulation } from '@/context/SimulationContext';
import { Instance } from '@/lib/simulation/types';
import { cpuColor, statusColor } from '@/lib/utils/format';

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

export default function InfrastructureMap() {
  const { state } = useSimulation();
  const [selected, setSelected] = useState<SelectedNode>(null);
  const [packets, setPackets] = useState<Packet[]>([]);
  const rafRef = useRef<number | null>(null);
  const packetIdRef = useRef(0);

  const isFlashSale = state.currentRps > 3000;
  const isCritical = state.currentRps > 8000;

  const healthyApi = state.apiInstances.filter(i => i.status === 'healthy');
  const healthyWorker = state.workerInstances.filter(i => i.status === 'healthy');

  // Animate data packets
  useEffect(() => {
    const interval = setInterval(() => {
      const speed = isFlashSale ? 0.025 : 0.012;
      const newPackets: Packet[] = [];
      const count = isCritical ? 4 : isFlashSale ? 3 : 1;
      for (let i = 0; i < count; i++) {
        packetIdRef.current++;
        // Route: users → lb → api → queue → worker → db
        const route = Math.floor(Math.random() * 3); // 0=left, 1=center, 2=right
        const routes = [
          { fx: 360, fy: 60, tx: 360, ty: 140 },
          { fx: 360, fy: 190, tx: 160 + route * 200, ty: 270 },
          { fx: 160 + route * 200, fy: 320, tx: 360, ty: 400 },
          { fx: 360, fy: 450, tx: 160 + Math.floor(Math.random() * 3) * 200, ty: 530 },
          { fx: 160 + route * 200, fy: 580, tx: 360, ty: 660 },
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
        return [...updated, ...newPackets].slice(-40);
      });
    }, 80);
    return () => clearInterval(interval);
  }, [isFlashSale, isCritical]);

  const apiCount = state.apiInstances.length;
  const workerCount = state.workerInstances.length;

  return (
    <div style={{ display: 'flex', gap: '12px', maxWidth: '1400px' }}>
      {/* SVG topology */}
      <div className="panel" style={{ flex: 2, padding: '16px', overflow: 'hidden' }}>
        <div className="panel-header" style={{ padding: '0 0 12px', border: 'none' }}>
          <span className="text-label">Live Infrastructure Topology</span>
          <span className="badge badge-cyan">{Math.round(state.currentRps).toLocaleString()} req/s</span>
        </div>
        <div style={{ position: 'relative', overflowX: 'auto' }}>
          <svg width="720" height="700" style={{ display: 'block', margin: '0 auto' }}>
            <defs>
              <marker id="arrow" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
                <path d="M0,0 L0,6 L6,3 z" fill="var(--border-bright)" />
              </marker>
            </defs>

            {/* Connection lines */}
            {/* Users → LB */}
            <Connector x1={360} y1={75} x2={360} y2={138} />
            {/* LB → APIs */}
            {[120, 360, 600].slice(0, Math.min(apiCount + 1, 3)).map((x, i) => (
              <Connector key={i} x1={360} y1={190} x2={x} y2={268} />
            ))}
            {/* APIs → Queue */}
            {[120, 360, 600].slice(0, Math.min(apiCount + 1, 3)).map((x, i) => (
              <Connector key={i} x1={x} y1={318} x2={360} y2={398} />
            ))}
            {/* Queue → Workers */}
            {[120, 360, 600].slice(0, Math.min(workerCount + 1, 3)).map((x, i) => (
              <Connector key={i} x1={360} y1={450} x2={x} y2={528} />
            ))}
            {/* Workers → DB */}
            {[120, 360, 600].slice(0, Math.min(workerCount + 1, 3)).map((x, i) => (
              <Connector key={i} x1={x} y1={578} x2={360} y2={640} />
            ))}
            {/* DB → Cache */}
            <Connector x1={360} y1={660} x2={560} y2={660} />
            <Connector x1={560} y1={640} x2={560} y2={640} />

            {/* RPS label on main arrow */}
            <text x={375} y={110} fill="var(--accent-cyan)" fontSize="9" fontFamily="IBM Plex Mono">
              {Math.round(state.currentRps).toLocaleString()} req/s
            </text>

            {/* USERS */}
            <InfraNode cx={360} cy={50} label="USERS" sublabel={`${Math.round(state.activeUsers / 1000).toFixed(0)}k active`} type="users"
              color="var(--text-secondary)" onClick={() => setSelected({ type: 'users' })} selected={selected?.type === 'users'} />

            {/* LOAD BALANCER */}
            <InfraNode cx={360} cy={165} label="LOAD BALANCER" sublabel={`${Math.round(state.currentRps)} req/s`} type="lb"
              color={isCritical ? '#ef4444' : '#3b82f6'} onClick={() => setSelected({ type: 'lb' })} selected={selected?.type === 'lb'} wide />

            {/* API Instances */}
            {state.apiInstances.slice(0, 5).map((inst, i) => {
              const positions = [120, 240, 360, 480, 600];
              const x = positions[Math.min(i, 4)];
              return (
                <InfraNode key={inst.id} cx={x} cy={293} label={inst.name} sublabel={`CPU ${Math.round(inst.cpu)}%`}
                  type="api" color={statusColor(inst.status)} status={inst.status}
                  onClick={() => setSelected({ type: 'api', id: inst.id })} selected={selected?.id === inst.id} />
              );
            })}
            {apiCount > 5 && <text x={630} y={297} fill="var(--text-muted)" fontSize="9" fontFamily="IBM Plex Mono">+{apiCount - 5}</text>}

            {/* REQUEST QUEUE */}
            <InfraNode cx={360} cy={425} label="REQUEST QUEUE" sublabel={`${Math.round(state.queueDepth)} pending`} type="queue"
              color={state.queueDepth > 500 ? '#f59e0b' : '#06b6d4'} onClick={() => setSelected({ type: 'queue' })} selected={selected?.type === 'queue'} wide />

            {/* Worker Instances */}
            {state.workerInstances.slice(0, 5).map((inst, i) => {
              const positions = [120, 240, 360, 480, 600];
              const x = positions[Math.min(i, 4)];
              return (
                <InfraNode key={inst.id} cx={x} cy={553} label={inst.name} sublabel={`CPU ${Math.round(inst.cpu)}%`}
                  type="worker" color={statusColor(inst.status)} status={inst.status}
                  onClick={() => setSelected({ type: 'worker', id: inst.id })} selected={selected?.id === inst.id} />
              );
            })}
            {workerCount > 5 && <text x={630} y={557} fill="var(--text-muted)" fontSize="9" fontFamily="IBM Plex Mono">+{workerCount - 5}</text>}

            {/* DATABASE */}
            <InfraNode cx={360} cy={655} label="DATABASE" sublabel="PostgreSQL" type="db"
              color="#a78bfa" onClick={() => setSelected({ type: 'db' })} selected={selected?.type === 'db'} />

            {/* CACHE */}
            <InfraNode cx={560} cy={655} label="CACHE" sublabel={`${Math.round(state.cacheHitRate * 100)}% hit`} type="cache"
              color="#10b981" onClick={() => setSelected({ type: 'cache' })} selected={selected?.type === 'cache'} />

            {/* Animated packets */}
            {packets.map(p => {
              const x = p.fromX + (p.toX - p.fromX) * p.progress;
              const y = p.fromY + (p.toY - p.fromY) * p.progress;
              return (
                <circle key={p.id} cx={x} cy={y} r={3} fill={p.color} opacity={Math.sin(p.progress * Math.PI)} />
              );
            })}
          </svg>
        </div>
      </div>

      {/* Detail panel */}
      <div className="panel" style={{ flex: 1, padding: '16px' }}>
        <div className="text-label" style={{ marginBottom: '12px' }}>Component Detail</div>
        {!selected ? (
          <div style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '11px', marginTop: '24px', textAlign: 'center' }}>
            Click a component in the topology to view details
          </div>
        ) : (
          <NodeDetail selected={selected} state={state} />
        )}
      </div>
    </div>
  );
}

function Connector({ x1, y1, x2, y2 }: { x1: number; y1: number; x2: number; y2: number }) {
  return (
    <line x1={x1} y1={y1} x2={x2} y2={y2}
      stroke="var(--border-bright)" strokeWidth={1} strokeDasharray="4 4"
      markerEnd="url(#arrow)" />
  );
}

function InfraNode({ cx, cy, label, sublabel, type, color, onClick, selected, wide, status }:
  { cx: number; cy: number; label: string; sublabel: string; type: string; color: string; onClick: () => void; selected: boolean; wide?: boolean; status?: string }) {
  const w = wide ? 160 : 100;
  const h = 46;
  const borderColor = selected ? color : 'var(--border-accent)';
  const bg = selected ? color + '22' : 'var(--bg-elevated)';
  return (
    <g onClick={onClick} style={{ cursor: 'pointer' }}>
      <rect x={cx - w / 2} y={cy - h / 2} width={w} height={h} rx={3} fill={bg} stroke={borderColor} strokeWidth={selected ? 1.5 : 1} />
      {status === 'failed' && <rect x={cx - w / 2} y={cy - h / 2} width={w} height={h} rx={3} fill="rgba(239,68,68,0.1)" />}
      <text x={cx} y={cy - 6} textAnchor="middle" fill={color} fontSize="9" fontFamily="IBM Plex Mono" fontWeight="600" letterSpacing="0.08em">
        {label}
      </text>
      <text x={cx} y={cy + 9} textAnchor="middle" fill="var(--text-muted)" fontSize="8.5" fontFamily="IBM Plex Mono">
        {sublabel}
      </text>
      {status === 'provisioning' && (
        <circle cx={cx + w / 2 - 8} cy={cy - h / 2 + 8} r={3} fill="var(--accent-cyan)" opacity={0.8} />
      )}
      {status === 'failed' && (
        <text x={cx + w / 2 - 12} y={cy - h / 2 + 10} fill="var(--status-error)" fontSize="9">✕</text>
      )}
    </g>
  );
}

function NodeDetail({ selected, state }: { selected: { type: string; id?: string }; state: any }) {
  if (selected.type === 'lb') {
    return (
      <DetailSection title="Load Balancer">
        <DetailRow label="Incoming RPS" value={`${Math.round(state.currentRps).toLocaleString()} req/s`} />
        <DetailRow label="Healthy Targets" value={state.apiInstances.filter((i: Instance) => i.status === 'healthy').length.toString()} />
        <DetailRow label="Algorithm" value="Round Robin" />
        <DetailRow label="Health Checks" value="Active (10s)" />
        <DetailRow label="Rejected" value={state.queueFailed.toString()} color="var(--status-error)" />
        <DetailRow label="Sticky Sessions" value="Disabled" />
        <div style={{ marginTop: '8px', padding: '8px', background: 'var(--bg-elevated)', borderRadius: '3px', fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'var(--text-muted)', lineHeight: '1.6' }}>
          Distributes incoming requests across all healthy API instances. Automatically removes unhealthy targets.
        </div>
      </DetailSection>
    );
  }
  if (selected.type === 'queue') {
    return (
      <DetailSection title="Request Queue">
        <DetailRow label="Queue Depth" value={Math.round(state.queueDepth).toLocaleString()} color={state.queueDepth > 500 ? 'var(--status-warn)' : undefined} />
        <DetailRow label="Processing" value={state.workerInstances.filter((w: Instance) => w.status === 'healthy').length.toString()} />
        <DetailRow label="Completed" value={state.queueProcessed.toLocaleString()} color="var(--status-ok)" />
        <DetailRow label="Failed" value={state.queueFailed.toString()} color="var(--status-error)" />
        <DetailRow label="Retrying" value={state.queueRetrying.toString()} color="var(--status-warn)" />
        <DetailRow label="Max Depth" value="5,000" />
      </DetailSection>
    );
  }
  if (selected.type === 'api' && selected.id) {
    const inst = state.apiInstances.find((i: Instance) => i.id === selected.id);
    if (!inst) return null;
    return (
      <DetailSection title={inst.name}>
        <DetailRow label="Status" value={inst.status.toUpperCase()} color={statusColor(inst.status)} />
        <DetailRow label="CPU" value={`${Math.round(inst.cpu)}%`} color={cpuColor(inst.cpu)} />
        <DetailRow label="Memory" value={`${Math.round(inst.memory)}%`} />
        <DetailRow label="Throughput" value={`${Math.round(inst.throughput).toLocaleString()} req/s`} />
        <DetailRow label="Requests" value={inst.requestsHandled.toLocaleString()} />
        <div style={{ marginTop: '8px' }}>
          <div className="text-label" style={{ marginBottom: '4px' }}>CPU Load</div>
          <div className="progress-track">
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
      <DetailSection title={inst.name}>
        <DetailRow label="Status" value={inst.status.toUpperCase()} color={statusColor(inst.status)} />
        <DetailRow label="CPU" value={`${Math.round(inst.cpu)}%`} color={cpuColor(inst.cpu)} />
        <DetailRow label="Memory" value={`${Math.round(inst.memory)}%`} />
        <DetailRow label="Jobs Processed" value={inst.requestsHandled.toLocaleString()} />
        <DetailRow label="Health" value={inst.status === 'healthy' ? 'PASSING' : inst.status.toUpperCase()} color={statusColor(inst.status)} />
      </DetailSection>
    );
  }
  if (selected.type === 'db') {
    return (
      <DetailSection title="Database">
        <DetailRow label="Engine" value="PostgreSQL 16" />
        <DetailRow label="Replication" value="1 Primary, 2 Replicas" />
        <DetailRow label="Connections" value={`${Math.round(state.currentRps / 80)} active`} />
        <DetailRow label="Avg Query" value="12 ms" />
        <div style={{ marginTop: '8px', padding: '8px', background: 'var(--bg-elevated)', borderRadius: '3px', fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'var(--text-muted)', lineHeight: '1.6' }}>
          Read replicas absorb SELECT traffic during flash sales. Connection pooling (PgBouncer) prevents connection exhaustion.
        </div>
      </DetailSection>
    );
  }
  if (selected.type === 'cache') {
    return (
      <DetailSection title="Cache Layer">
        <DetailRow label="Engine" value="Redis 7.x" />
        <DetailRow label="Hit Rate" value={`${Math.round(state.cacheHitRate * 100)}%`} color="var(--status-ok)" />
        <DetailRow label="Latency" value="< 2 ms" />
        <DetailRow label="Strategy" value="LRU Eviction" />
        <DetailRow label="TTL" value="300s (menu) / 60s (cart)" />
      </DetailSection>
    );
  }
  return (
    <DetailSection title="Users">
      <DetailRow label="Active Sessions" value={Math.round(state.activeUsers).toLocaleString()} />
      <DetailRow label="Req/User/Min" value={Math.round((state.currentRps * 60) / Math.max(state.activeUsers, 1)).toString()} />
    </DetailSection>
  );
}

function DetailSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', fontWeight: 600, color: 'var(--accent-cyan)', marginBottom: '12px', letterSpacing: '0.05em' }}>{title}</div>
      {children}
    </div>
  );
}

function DetailRow({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div className="data-row">
      <span className="text-label">{label}</span>
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: color || 'var(--text-primary)', fontWeight: 500 }}>{value}</span>
    </div>
  );
}
