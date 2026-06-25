/**
 * hooks/useNetworkStatus.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Tracks online/offline status in real time.
 * Returns { isOnline } — true when the browser has network connectivity.
 *
 * Uses the Navigator.onLine property as initial state and listens for
 * the 'online' / 'offline' window events for subsequent changes.
 * ─────────────────────────────────────────────────────────────────────────────
 */
import { useState, useEffect } from 'react';

export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline  = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online',  handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online',  handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return { isOnline };
}
