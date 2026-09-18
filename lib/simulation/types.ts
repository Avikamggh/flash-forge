export type ScenarioName = 'NORMAL' | 'ELEVATED' | 'FLASH_SALE' | 'CRITICAL' | 'RECOVERY';
export type InstanceStatus = 'healthy' | 'degraded' | 'failed' | 'provisioning' | 'terminating';
export type InstanceRole = 'api' | 'worker';
export type IncidentSeverity = 'info' | 'warning' | 'critical' | 'resolved';
export type RequestStatus = 'SUCCESS' | 'FAILED' | 'RETRYING' | 'PROCESSING';

export interface Instance {
  id: string;
  name: string;
  role: InstanceRole;
  status: InstanceStatus;
  cpu: number;
  memory: number;
  requestsHandled: number;
  throughput: number;
  spawnedAt: number; // tick
}

export interface Incident {
  id: string;
  timestamp: number; // real Date.now()
  message: string;
  severity: IncidentSeverity;
}

export interface RequestEntry {
  id: string;
  tick: number;
  status: RequestStatus;
  latency: number;
  workerId: string;
  apiInstance: string;
  cacheHit: boolean;
  path: string;
}

export interface ScalingEvent {
  tick: number;
  reason: string;
  action: string;
  delta: number;
  resultingCount: number;
}

export interface SimState {
  tick: number;
  running: boolean;
  scenario: ScenarioName;
  targetRps: number;
  currentRps: number;
  apiInstances: Instance[];
  workerInstances: Instance[];
  queueDepth: number;
  queueProcessed: number;
  queueFailed: number;
  queueRetrying: number;
  avgLatency: number;
  p99Latency: number;
  errorRate: number;
  cacheHitRate: number;
  activeUsers: number;
  rpsHistory: number[];
  cpuHistory: number[];
  latencyHistory: number[];
  errorHistory: number[];
  costHistory: number[];
  costPerHour: number;
  totalRequests: number;
  successfulRequests: number;
  incidents: Incident[];
  requestFeed: RequestEntry[];
  scalingEvents: ScalingEvent[];
  demoPhase: number | null;
  demoStartTick: number | null;
  chaosActive: boolean;
  predictedPeak: number;
  predictConfidence: number;
  preScaled: boolean;
}

export type SimAction =
  | { type: 'TICK' }
  | { type: 'SET_SCENARIO'; scenario: ScenarioName; targetRps: number }
  | { type: 'SET_TARGET_RPS'; rps: number }
  | { type: 'START_DEMO' }
  | { type: 'STOP_DEMO' }
  | { type: 'CHAOS_TEST' }
  | { type: 'CHAOS_SPIKE' }
  | { type: 'CHAOS_CACHE_PURGE' }
  | { type: 'PRE_SCALE' }
  | { type: 'INJECT_REQUEST'; req: RequestEntry }
  | { type: 'RESET' };
