/**
 * components/OfflineBanner.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * A slim top banner that slides in when the user loses network connectivity
 * and slides out when it returns.
 *
 * Uses the useNetworkStatus hook which listens to the browser's online/offline
 * events — no polling, zero cost when online.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { motion, AnimatePresence } from 'framer-motion';
import { WifiOff, Wifi } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNetworkStatus } from '../hooks/useNetworkStatus';

export function OfflineBanner() {
  const { isOnline } = useNetworkStatus();
  // Show a brief "Back online" confirmation before hiding
  const [showOnlineFlash, setShowOnlineFlash] = useState(false);
  const [wasOffline, setWasOffline] = useState(false);

  useEffect(() => {
    if (!isOnline) {
      setWasOffline(true);
    } else if (wasOffline && isOnline) {
      setShowOnlineFlash(true);
      const t = setTimeout(() => {
        setShowOnlineFlash(false);
        setWasOffline(false);
      }, 2500);
      return () => clearTimeout(t);
    }
  }, [isOnline, wasOffline]);

  const showOffline = !isOnline;
  const showOnline = isOnline && showOnlineFlash;

  return (
    <AnimatePresence>
      {(showOffline || showOnline) && (
        <motion.div
          key={showOffline ? 'offline' : 'online'}
          initial={{ y: -48, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -48, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 400, damping: 35 }}
          className={`fixed top-0 left-0 right-0 z-[9998] flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium ${
            showOffline
              ? 'bg-red-950/90 text-red-300 border-b border-red-500/30'
              : 'bg-green-950/90 text-green-300 border-b border-green-500/30'
          } backdrop-blur-md`}
          role="status"
          aria-live="polite"
        >
          {showOffline ? (
            <>
              <WifiOff className="w-4 h-4 flex-shrink-0" />
              <span>You're offline — data won't update until reconnected</span>
            </>
          ) : (
            <>
              <Wifi className="w-4 h-4 flex-shrink-0" />
              <span>Back online</span>
            </>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
