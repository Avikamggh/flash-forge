import type { ScenarioName } from './types';

export interface ScenarioConfig {
  name: ScenarioName;
  label: string;
  targetRps: number;
  description: string;
  color: string;
}

export const SCENARIOS: ScenarioConfig[] = [
  {
    name: 'NORMAL',
    label: 'Normal Day',
    targetRps: 500,
    description: 'Steady baseline traffic with comfortable headroom.',
    color: '#10b981',
  },
  {
    name: 'ELEVATED',
    label: 'Lunch Rush',
    targetRps: 2000,
    description: 'Predictable midday surge, auto-scaler adds 2–4 instances.',
    color: '#f59e0b',
  },
  {
    name: 'FLASH_SALE',
    label: 'Flash Sale',
    targetRps: 10000,
    description: '10,000 req/s — auto-scaler races to keep latency below 200ms.',
    color: '#ef4444',
  },
  {
    name: 'CRITICAL',
    label: 'Mega Event',
    targetRps: 25000,
    description: '25,000 req/s — every scaling policy fires simultaneously.',
    color: '#dc2626',
  },
];

// Scaling policy constants
export const SCALING_POLICY = {
  MIN_API: 2,
  MAX_API: 20,
  MIN_WORKER: 2,
  MAX_WORKER: 16,
  TARGET_CPU: 65,
  SCALE_UP_THRESHOLD_CPU: 70,
  SCALE_DOWN_THRESHOLD_CPU: 40,
  PROVISION_TICKS: 6, // ticks to provision a new instance
  COOLDOWN_TICKS: 20,
};

export const COST_PER_INSTANCE_HOUR = 0.096; // $ per instance-hour (simulated)
export const STATIC_INSTANCES = 20; // over-provisioned baseline for comparison
