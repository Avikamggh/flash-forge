'use client';
import React, { createContext, useContext, useReducer, useEffect, useRef, useCallback } from 'react';
import { SimState, SimAction } from '@/lib/simulation/types';
import { simulationReducer, getInitialState } from '@/lib/simulation/engine';

interface SimContextValue {
  state: SimState;
  dispatch: React.Dispatch<SimAction>;
  startSim: () => void;
  stopSim: () => void;
}

const SimContext = createContext<SimContextValue | null>(null);

export function SimulationProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(simulationReducer, undefined, getInitialState);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const runningRef = useRef(false);

  const startSim = useCallback(() => {
    if (intervalRef.current) return;
    runningRef.current = true;
    intervalRef.current = setInterval(() => {
      dispatch({ type: 'TICK' });
    }, 100);
  }, []);

  const stopSim = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    runningRef.current = false;
  }, []);

  // Start simulation on mount
  useEffect(() => {
    startSim();
    return () => stopSim();
  }, [startSim, stopSim]);

  return (
    <SimContext.Provider value={{ state, dispatch, startSim, stopSim }}>
      {children}
    </SimContext.Provider>
  );
}

export function useSimulation(): SimContextValue {
  const ctx = useContext(SimContext);
  if (!ctx) throw new Error('useSimulation must be used within SimulationProvider');
  return ctx;
}
