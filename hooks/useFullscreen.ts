'use client';
import { useEffect, useState, useCallback } from 'react';

export function useFullscreen() {
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggle = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  }, []);

  useEffect(() => {
    const onChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', onChange);
    return () => document.removeEventListener('fullscreenchange', onChange);
  }, []);

  // F key shortcut
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'f' && !e.ctrlKey && !e.metaKey && !e.altKey) {
        const tag = (e.target as HTMLElement)?.tagName;
        if (tag !== 'INPUT' && tag !== 'TEXTAREA') toggle();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [toggle]);

  return { isFullscreen, toggle };
}
