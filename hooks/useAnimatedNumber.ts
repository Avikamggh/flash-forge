'use client';
import { useEffect, useRef, useState } from 'react';

export function useAnimatedNumber(target: number, duration = 400): number {
  const [display, setDisplay] = useState(target);
  const animRef = useRef<number | null>(null);
  const startRef = useRef<number | null>(null);
  const fromRef = useRef(target);
  const toRef = useRef(target);

  useEffect(() => {
    fromRef.current = display;
    toRef.current = target;
    startRef.current = null;

    if (animRef.current) cancelAnimationFrame(animRef.current);

    const animate = (now: number) => {
      if (startRef.current === null) startRef.current = now;
      const elapsed = now - startRef.current;
      const progress = Math.min(elapsed / duration, 1);
      // easeOutCubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = fromRef.current + (toRef.current - fromRef.current) * eased;
      setDisplay(current);
      if (progress < 1) animRef.current = requestAnimationFrame(animate);
    };

    animRef.current = requestAnimationFrame(animate);
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target]);

  return display;
}
