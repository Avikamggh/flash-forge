import type { SimState, SimAction, Instance, InstanceRole, InstanceStatus, Incident, RequestEntry, ScalingEvent } from './types';
import { SCALING_POLICY, COST_PER_INSTANCE_HOUR, STATIC_INSTANCES } from './scenarios';

const HISTORY_LEN = 120;
const REQUEST_FEED_LEN = 40;
const INCIDENT_MAX = 50;
const TICK_MS = 100;

let incidentIdCounter = 0;
let requestIdCounter = 0;
let instanceIdCounter = 0;

function makeInstance(role: InstanceRole, tick: number): Instance {
  instanceIdCounter++;
  const prefix = role === 'api' ? 'API' : 'WORKER';
  return {
    id: `${prefix}-${String(instanceIdCounter).padStart(2, '0')}`,
    name: `${prefix}-${String(instanceIdCounter).padStart(2, '0')}`,
    role,
    status: 'provisioning',
    cpu: 5 + Math.random() * 10,
    memory: 20 + Math.random() * 15,
    requestsHandled: 0,
    throughput: 0,
    spawnedAt: tick,
  };
}

function addIncident(state: SimState, message: string, severity: Incident['severity']): Incident[] {
  const inc: Incident = {
    id: `INC-${++incidentIdCounter}`,
    timestamp: Date.now(),
    message,
    severity,
  };
  return [inc, ...state.incidents].slice(0, INCIDENT_MAX);
}

function lerp(current: number, target: number, rate: number): number {
  return current + (target - current) * rate;
}

function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}

function pushHistory(arr: number[], val: number): number[] {
  const next = [...arr, val];
  if (next.length > HISTORY_LEN) next.shift();
  return next;
}

function computeCapacity(apiInstances: Instance[], workerInstances: Instance[]): number {
  const healthyApi = apiInstances.filter(i => i.status === 'healthy').length;
  const healthyWorker = workerInstances.filter(i => i.status === 'healthy').length;
  return Math.min(healthyApi, healthyWorker) * 1200 + Math.min(0, healthyApi - healthyWorker) * 600;
}

function generateRequest(state: SimState): RequestEntry {
  const workers = state.workerInstances.filter(i => i.status === 'healthy');
  const apis = state.apiInstances.filter(i => i.status === 'healthy');
  const overloaded = state.currentRps > computeCapacity(state.apiInstances, state.workerInstances);
  const cacheHit = Math.random() < state.cacheHitRate;
  const baseLatency = cacheHit ? 15 : 60;
  const queueLatency = state.queueDepth > 100 ? Math.min(state.queueDepth * 0.3, 500) : 0;
  const latency = Math.round(baseLatency + queueLatency + Math.random() * 30);
  const failChance = overloaded ? 0.08 : state.errorRate;
  const status: RequestEntry['status'] = Math.random() < failChance ? (Math.random() < 0.6 ? 'RETRYING' : 'FAILED') : 'SUCCESS';
  const paths = ['/api/orders', '/api/menu', '/api/cart', '/api/users', '/api/payment', '/api/delivery'];
  return {
    id: `FF-${String(++requestIdCounter).padStart(5, '0')}`,
    tick: state.tick,
    status,
    latency,
    workerId: workers.length > 0 ? workers[Math.floor(Math.random() * workers.length)].id : 'NONE',
    apiInstance: apis.length > 0 ? apis[Math.floor(Math.random() * apis.length)].id : 'NONE',
    cacheHit,
    path: paths[Math.floor(Math.random() * paths.length)],
  };
}

export function getInitialState(): SimState {
  const apiInstances: Instance[] = [
    { id: 'API-01', name: 'API-01', role: 'api', status: 'healthy', cpu: 35, memory: 42, requestsHandled: 1240, throughput: 120, spawnedAt: 0 },
    { id: 'API-02', name: 'API-02', role: 'api', status: 'healthy', cpu: 38, memory: 40, requestsHandled: 1180, throughput: 115, spawnedAt: 0 },
  ];
  const workerInstances: Instance[] = [
    { id: 'WORKER-01', name: 'WORKER-01', role: 'worker', status: 'healthy', cpu: 30, memory: 35, requestsHandled: 890, throughput: 90, spawnedAt: 0 },
    { id: 'WORKER-02', name: 'WORKER-02', role: 'worker', status: 'healthy', cpu: 32, memory: 37, requestsHandled: 910, throughput: 92, spawnedAt: 0 },
  ];
  instanceIdCounter = 10; // start IDs above defaults
  return {
    tick: 0,
    running: false,
    scenario: 'NORMAL',
    targetRps: 500,
    currentRps: 500,
    apiInstances,
    workerInstances,
    queueDepth: 0,
    queueProcessed: 0,
    queueFailed: 0,
    queueRetrying: 0,
    avgLatency: 86,
    p99Latency: 210,
    errorRate: 0.001,
    cacheHitRate: 0.72,
    activeUsers: 1284,
    rpsHistory: Array(HISTORY_LEN).fill(500),
    cpuHistory: Array(HISTORY_LEN).fill(35),
    latencyHistory: Array(HISTORY_LEN).fill(86),
    errorHistory: Array(HISTORY_LEN).fill(0.001),
    costHistory: Array(HISTORY_LEN).fill(COST_PER_INSTANCE_HOUR * 2),
    costPerHour: COST_PER_INSTANCE_HOUR * 2,
    totalRequests: 0,
    successfulRequests: 0,
    incidents: [
      { id: 'INC-0', timestamp: 1773800000000, message: 'System initialized. All services healthy.', severity: 'info' },
    ],
    requestFeed: [],
    scalingEvents: [],
    demoPhase: null,
    demoStartTick: null,
    chaosActive: false,
    predictedPeak: 9800,
    predictConfidence: 92,
    preScaled: false,
  };
}

export function simulationReducer(state: SimState, action: SimAction): SimState {
  switch (action.type) {
    case 'RESET':
      incidentIdCounter = 0;
      requestIdCounter = 0;
      instanceIdCounter = 0;
      return { ...getInitialState(), running: true };

    case 'START_DEMO':
      return { ...state, demoPhase: 0, demoStartTick: state.tick };

    case 'STOP_DEMO':
      return { ...state, demoPhase: null, demoStartTick: null };

    case 'SET_SCENARIO':
      return {
        ...state,
        scenario: action.scenario,
        targetRps: action.targetRps,
        incidents: addIncident(state, `Scenario changed → ${action.scenario} (${action.targetRps.toLocaleString()} req/s target)`, 'info'),
      };

    case 'SET_TARGET_RPS':
      return { ...state, targetRps: action.rps };

    case 'CHAOS_TEST': {
      const healthyWorkers = state.workerInstances.filter(i => i.status === 'healthy');
      if (healthyWorkers.length === 0) return state;
      const victim = healthyWorkers[Math.floor(Math.random() * healthyWorkers.length)];
      const updatedWorkers = state.workerInstances.map(w =>
        w.id === victim.id ? { ...w, status: 'failed' as InstanceStatus } : w
      );
      return {
        ...state,
        workerInstances: updatedWorkers,
        chaosActive: true,
        incidents: addIncident({ ...state, incidents: addIncident(state, `⚠ CHAOS: ${victim.id} instance failure simulated`, 'critical') }, 'Auto-recovery initiated. Redistributing traffic...', 'warning'),
      };
    }

    case 'CHAOS_SPIKE': {
      return {
        ...state,
        targetRps: 15000,
        chaosActive: true,
        incidents: addIncident(
          { ...state, incidents: addIncident(state, '⚡ CHAOS: 15,000 req/s flash spike injected!', 'critical') },
          'Threshold alarm fired. Auto-scaling emergency pods...',
          'warning'
        ),
      };
    }

    case 'CHAOS_CACHE_PURGE': {
      return {
        ...state,
        cacheHitRate: 0.08,
        incidents: addIncident(
          { ...state, incidents: addIncident(state, '🛑 CHAOS: Redis cache cluster flushed. Cache hit dropped to 8%', 'warning') },
          'PostgreSQL read replicas absorbing direct read surge safely',
          'info'
        ),
      };
    }

    case 'INJECT_REQUEST': {
      return {
        ...state,
        totalRequests: state.totalRequests + 1,
        successfulRequests: action.req.status === 'SUCCESS' ? state.successfulRequests + 1 : state.successfulRequests,
        requestFeed: [action.req, ...state.requestFeed].slice(0, 30),
      };
    }

    case 'PRE_SCALE': {
      const newApis: Instance[] = [];
      for (let i = 0; i < 4; i++) newApis.push(makeInstance('api', state.tick));
      const newWorkers: Instance[] = [];
      for (let i = 0; i < 4; i++) newWorkers.push(makeInstance('worker', state.tick));
      return {
        ...state,
        apiInstances: [...state.apiInstances, ...newApis],
        workerInstances: [...state.workerInstances, ...newWorkers],
        preScaled: true,
        incidents: addIncident(state, 'Pre-scale initiated: +4 API, +4 Worker instances provisioning', 'info'),
      };
    }

    case 'TICK':
      return tickReducer(state);

    default:
      return state;
  }
}

function tickReducer(state: SimState): SimState {
  const tick = state.tick + 1;
  let incidents = state.incidents;
  let scalingEvents = state.scalingEvents;

  // ── Demo phase progression ─────────────────────────────────────────────
  let { demoPhase, demoStartTick, targetRps, scenario } = state;
  if (demoPhase !== null && demoStartTick !== null) {
    const elapsed = (tick - demoStartTick) * (TICK_MS / 1000); // seconds
    if (elapsed < 8 && demoPhase === 0) {
      targetRps = 500; scenario = 'NORMAL';
    } else if (elapsed >= 8 && elapsed < 15 && demoPhase <= 1) {
      targetRps = 2000; scenario = 'ELEVATED'; demoPhase = 1;
      if (elapsed < 8.5) incidents = addIncident({ ...state, incidents }, 'Traffic elevation detected — lunch rush pattern', 'info');
    } else if (elapsed >= 15 && elapsed < 22 && demoPhase <= 2) {
      targetRps = 10000; scenario = 'FLASH_SALE'; demoPhase = 2;
      if (elapsed < 15.5) incidents = addIncident({ ...state, incidents }, '⚡ FLASH SALE INITIATED — 10,000 req/s target', 'critical');
    } else if (elapsed >= 28 && elapsed < 34 && demoPhase <= 3) {
      demoPhase = 3;
      // chaos is injected separately
    } else if (elapsed >= 38 && demoPhase <= 4) {
      targetRps = 5000; scenario = 'RECOVERY'; demoPhase = 4;
      if (elapsed < 38.5) incidents = addIncident({ ...state, incidents }, 'Flash sale ended — traffic stabilizing', 'info');
    } else if (elapsed >= 48 && demoPhase <= 5) {
      targetRps = 500; scenario = 'NORMAL'; demoPhase = 5;
      if (elapsed < 48.5) incidents = addIncident({ ...state, incidents }, 'Recovery complete — scaling down infrastructure', 'resolved');
    } else if (elapsed >= 60) {
      demoPhase = null; demoStartTick = null;
    }
  }

  // ── Chaos recovery ──────────────────────────────────────────────────────
  let workerInstances = state.workerInstances.map(w => {
    if (w.status === 'failed') {
      // recover after 15 ticks
      const age = tick - (w.spawnedAt || 0);
      if (age > 15) return { ...w, status: 'provisioning' as InstanceStatus, spawnedAt: tick };
    }
    if (w.status === 'provisioning' && tick - w.spawnedAt > 8) {
      return { ...w, status: 'healthy' as InstanceStatus };
    }
    return w;
  });

  let apiInstances = state.apiInstances.map(a => {
    if (a.status === 'provisioning' && tick - a.spawnedAt > 6) {
      return { ...a, status: 'healthy' as InstanceStatus };
    }
    if (a.status === 'terminating' && tick - a.spawnedAt > 4) {
      return { ...a, status: 'healthy' as InstanceStatus }; // mark for removal
    }
    return a;
  });

  // ── Lerp current RPS ───────────────────────────────────────────────────
  const rpsLerpRate = targetRps > state.currentRps ? 0.08 : 0.05;
  const currentRps = lerp(state.currentRps, targetRps, rpsLerpRate);

  // ── Auto-scaling ────────────────────────────────────────────────────────
  const healthyApiCount = apiInstances.filter(i => i.status === 'healthy').length;
  const healthyWorkerCount = workerInstances.filter(i => i.status === 'healthy').length;
  const totalApiCount = apiInstances.filter(i => i.status !== 'terminating').length;
  const totalWorkerCount = workerInstances.filter(i => i.status !== 'terminating').length;

  const targetApiInstances = clamp(Math.ceil(currentRps / 1200), SCALING_POLICY.MIN_API, SCALING_POLICY.MAX_API);
  const targetWorkerInstances = clamp(Math.ceil(currentRps / 900), SCALING_POLICY.MIN_WORKER, SCALING_POLICY.MAX_WORKER);

  // Scale up API
  if (totalApiCount < targetApiInstances && tick % 4 === 0) {
    const newApi = makeInstance('api', tick);
    apiInstances = [...apiInstances, newApi];
    const ev: ScalingEvent = { tick, reason: 'Request rate exceeds API capacity', action: `+1 API instance (${newApi.name})`, delta: 1, resultingCount: apiInstances.length };
    scalingEvents = [ev, ...scalingEvents].slice(0, 20);
    if (tick % 8 === 0) incidents = addIncident({ ...state, incidents }, `Auto-scale: ${newApi.name} provisioning`, 'info');
  }
  // Scale down API (keep min)
  if (totalApiCount > targetApiInstances + 2 && tick % 20 === 0 && totalApiCount > SCALING_POLICY.MIN_API) {
    const toRemove = apiInstances.findLast(a => a.status === 'healthy');
    if (toRemove) {
      apiInstances = apiInstances.filter(a => a.id !== toRemove.id);
      const ev: ScalingEvent = { tick, reason: 'CPU below scale-down threshold', action: `-1 API instance (${toRemove.name})`, delta: -1, resultingCount: apiInstances.length };
      scalingEvents = [ev, ...scalingEvents].slice(0, 20);
    }
  }
  // Scale up Worker
  if (totalWorkerCount < targetWorkerInstances && tick % 5 === 0) {
    const newWorker = makeInstance('worker', tick);
    workerInstances = [...workerInstances, newWorker];
  }
  // Scale down Worker
  if (totalWorkerCount > targetWorkerInstances + 2 && tick % 25 === 0 && totalWorkerCount > SCALING_POLICY.MIN_WORKER) {
    const toRemove = workerInstances.findLast(w => w.status === 'healthy');
    if (toRemove) {
      workerInstances = workerInstances.filter(w => w.id !== toRemove.id);
    }
  }

  // ── Compute CPU per instance ───────────────────────────────────────────
  const loadPerApi = healthyApiCount > 0 ? Math.min((currentRps / (healthyApiCount * 1200)) * 100, 99) : 99;
  const loadPerWorker = healthyWorkerCount > 0 ? Math.min((currentRps / (healthyWorkerCount * 900)) * 100, 99) : 99;

  apiInstances = apiInstances.map(a => {
    if (a.status !== 'healthy') return a;
    const jitter = (Math.random() - 0.5) * 8;
    return { ...a, cpu: clamp(loadPerApi + jitter, 5, 99), throughput: Math.round(currentRps / Math.max(healthyApiCount, 1)) };
  });
  workerInstances = workerInstances.map(w => {
    if (w.status !== 'healthy') return w;
    const jitter = (Math.random() - 0.5) * 8;
    return { ...w, cpu: clamp(loadPerWorker + jitter, 5, 99), requestsHandled: w.requestsHandled + Math.round(w.throughput / 10) };
  });

  // ── Queue dynamics ─────────────────────────────────────────────────────
  const capacity = computeCapacity(apiInstances, workerInstances);
  const overflow = Math.max(0, currentRps - capacity);
  const drain = Math.min(state.queueDepth, capacity * 0.2);
  const queueDepth = clamp(state.queueDepth + overflow * 0.05 - drain * 0.05, 0, 5000);
  const queueProcessed = state.queueProcessed + Math.round(drain * 0.05);
  const queueFailed = state.queueFailed + (overflow > 200 ? Math.round(Math.random() * 2) : 0);
  const queueRetrying = Math.round(queueDepth * 0.04);

  // ── Derived metrics ────────────────────────────────────────────────────
  const utilization = capacity > 0 ? Math.min(currentRps / capacity, 1.5) : 1;
  const baseLatency = 60;
  const queueLatencyAdder = queueDepth > 50 ? Math.min(queueDepth * 0.2, 800) : 0;
  const avgLatency = clamp(lerp(state.avgLatency, baseLatency + utilization * 80 + queueLatencyAdder, 0.15), 20, 2000);
  const p99Latency = avgLatency * (2 + utilization * 0.8);
  const errorRate = clamp(utilization > 1.1 ? (utilization - 1) * 0.15 : 0.0008, 0.0005, 0.25);
  const cacheHitRate = clamp(0.72 - utilization * 0.05, 0.3, 0.85);
  const activeUsers = Math.round(currentRps * 1.52 + Math.random() * 100);

  // ── Cost ───────────────────────────────────────────────────────────────
  const totalInstances = apiInstances.filter(i => i.status !== 'failed').length + workerInstances.filter(i => i.status !== 'failed').length;
  const costPerHour = totalInstances * COST_PER_INSTANCE_HOUR;

  // ── Generate requests for feed ─────────────────────────────────────────
  const newReqCount = Math.min(Math.round(currentRps / 100), 4);
  const newRequests: RequestEntry[] = [];
  const tempState = { ...state, currentRps, queueDepth, errorRate, cacheHitRate, apiInstances, workerInstances };
  for (let i = 0; i < newReqCount; i++) newRequests.push(generateRequest(tempState));
  const requestFeed = [...newRequests, ...state.requestFeed].slice(0, REQUEST_FEED_LEN);

  const totalRequests = state.totalRequests + newReqCount;
  const successCount = newRequests.filter(r => r.status === 'SUCCESS').length;
  const successfulRequests = state.successfulRequests + successCount;

  // ── Incident triggers ──────────────────────────────────────────────────
  if (avgLatency > 500 && state.avgLatency <= 500) {
    incidents = addIncident({ ...state, incidents }, `High latency alert: ${Math.round(avgLatency)}ms avg`, 'warning');
  }
  if (avgLatency <= 200 && state.avgLatency > 500) {
    incidents = addIncident({ ...state, incidents }, `Latency recovered: ${Math.round(avgLatency)}ms`, 'resolved');
  }
  if (errorRate > 0.05 && state.errorRate <= 0.05) {
    incidents = addIncident({ ...state, incidents }, `Error rate elevated: ${(errorRate * 100).toFixed(1)}%`, 'critical');
  }
  if (queueDepth > 1000 && state.queueDepth <= 1000) {
    incidents = addIncident({ ...state, incidents }, `Queue depth exceeded 1,000 — scaling response active`, 'warning');
  }

  return {
    ...state,
    tick,
    scenario,
    targetRps,
    currentRps,
    apiInstances,
    workerInstances,
    queueDepth,
    queueProcessed,
    queueFailed,
    queueRetrying,
    avgLatency,
    p99Latency,
    errorRate,
    cacheHitRate,
    activeUsers,
    rpsHistory: pushHistory(state.rpsHistory, Math.round(currentRps)),
    cpuHistory: pushHistory(state.cpuHistory, Math.round(loadPerApi)),
    latencyHistory: pushHistory(state.latencyHistory, Math.round(avgLatency)),
    errorHistory: pushHistory(state.errorHistory, errorRate * 100),
    costHistory: pushHistory(state.costHistory, costPerHour),
    costPerHour,
    totalRequests,
    successfulRequests,
    incidents: incidents.slice(0, INCIDENT_MAX),
    requestFeed,
    scalingEvents,
    demoPhase,
    demoStartTick,
    chaosActive: state.chaosActive,
  };
}
