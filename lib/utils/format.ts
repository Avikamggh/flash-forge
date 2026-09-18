export function formatRps(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return Math.round(n).toString();
}

export function formatCost(n: number): string {
  return `$${n.toFixed(3)}/hr`;
}

export function formatLatency(n: number): string {
  return `${Math.round(n)} ms`;
}

export function formatPercent(n: number, decimals = 2): string {
  return `${n.toFixed(decimals)}%`;
}

export function formatLargeNum(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `${(n / 1000).toFixed(1)}k`;
  return Math.round(n).toString();
}

export function cpuColor(cpu: number): string {
  if (cpu < 50) return '#10b981';
  if (cpu < 75) return '#f59e0b';
  return '#ef4444';
}

export function latencyColor(ms: number): string {
  if (ms < 100) return '#10b981';
  if (ms < 300) return '#f59e0b';
  return '#ef4444';
}

export function statusColor(status: string): string {
  switch (status) {
    case 'healthy': return '#10b981';
    case 'degraded': return '#f59e0b';
    case 'failed': return '#ef4444';
    case 'provisioning': return '#3b82f6';
    case 'terminating': return '#6b7280';
    default: return '#6b7280';
  }
}

export function severityColor(severity: string): string {
  switch (severity) {
    case 'info': return '#3b82f6';
    case 'warning': return '#f59e0b';
    case 'critical': return '#ef4444';
    case 'resolved': return '#10b981';
    default: return '#6b7280';
  }
}

export function formatTime(ts: number): string {
  const d = new Date(ts);
  const h = d.getHours().toString().padStart(2, '0');
  const m = d.getMinutes().toString().padStart(2, '0');
  const s = d.getSeconds().toString().padStart(2, '0');
  return `${h}:${m}:${s}`;
}

