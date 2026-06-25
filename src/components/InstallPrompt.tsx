/**
 * components/InstallPrompt.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Handles the PWA "Add to Home Screen" install experience across platforms:
 *
 *  Android Chrome: intercepts the `beforeinstallprompt` event and shows a
 *    custom banner. Tapping "Install" triggers the native system dialog.
 *
 *  iOS Safari: shows a manual instruction banner (Safari doesn't support the
 *    beforeinstallprompt event — users must use Share → Add to Home Screen).
 *
 *  Already installed: detects `display-mode: standalone` and hides the banner
 *    automatically (no point prompting inside the installed app).
 *
 *  Dismissed: stores a flag in localStorage so the banner doesn't reappear.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, Share, Plus } from 'lucide-react';

// Extend the BeforeInstallPromptEvent type (not in standard TS lib yet)
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const DISMISSED_KEY = 'pwa_install_dismissed';
const DISMISSED_UNTIL_KEY = 'pwa_install_dismissed_until';
// Re-show after 7 days if dismissed
const DISMISS_TTL_MS = 7 * 24 * 60 * 60 * 1000;

function isRunningAsStandalone(): boolean {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    // iOS Safari sets this when launched from home screen
    ('standalone' in window.navigator && (window.navigator as any).standalone === true)
  );
}

function isIOS(): boolean {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
}

function isSafari(): boolean {
  return /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
}

function isDismissed(): boolean {
  const until = localStorage.getItem(DISMISSED_UNTIL_KEY);
  if (until && Date.now() < parseInt(until, 10)) return true;
  return localStorage.getItem(DISMISSED_KEY) === 'permanent';
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showAndroidBanner, setShowAndroidBanner] = useState(false);
  const [showIOSBanner, setShowIOSBanner] = useState(false);

  useEffect(() => {
    // Already installed or already permanently dismissed — show nothing
    if (isRunningAsStandalone() || isDismissed()) return;

    // Android Chrome: capture the install prompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault(); // Stop the browser's default mini-infobar
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowAndroidBanner(true);
    };

    // iOS Safari: show manual instructions
    if (isIOS() && isSafari()) {
      // Small delay so the app has time to render before showing the banner
      const timer = setTimeout(() => setShowIOSBanner(true), 2000);
      return () => clearTimeout(timer);
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    setShowAndroidBanner(false);
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      // User installed — clear any dismiss flags so we don't re-prompt
      localStorage.removeItem(DISMISSED_KEY);
      localStorage.removeItem(DISMISSED_UNTIL_KEY);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = (permanent = false) => {
    setShowAndroidBanner(false);
    setShowIOSBanner(false);
    if (permanent) {
      localStorage.setItem(DISMISSED_KEY, 'permanent');
    } else {
      localStorage.setItem(DISMISSED_UNTIL_KEY, String(Date.now() + DISMISS_TTL_MS));
    }
  };

  return (
    <>
      {/* ── Android Chrome Install Banner ───────────────────────────────── */}
      <AnimatePresence>
        {showAndroidBanner && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed bottom-4 left-4 right-4 z-[9999] mx-auto max-w-sm"
          >
            <div className="bg-gray-900 border border-white/10 rounded-2xl p-4 shadow-2xl shadow-black/60 backdrop-blur-xl ring-1 ring-cyan-500/20">
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border border-cyan-500/30 flex items-center justify-center">
                    <span className="text-cyan-400 font-bold text-sm font-mono">DT</span>
                  </div>
                  <div>
                    <p className="text-white font-semibold text-sm">Install DevTracker</p>
                    <p className="text-gray-400 text-xs">Add to your home screen</p>
                  </div>
                </div>
                <button
                  onClick={() => handleDismiss(false)}
                  className="text-gray-500 hover:text-gray-300 transition-colors p-1 -mt-1 -mr-1"
                  aria-label="Dismiss"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Benefits */}
              <p className="text-gray-400 text-xs mb-4 leading-relaxed">
                Get a native app experience — full screen, offline access, and instant launch from your home screen.
              </p>

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={handleInstall}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-medium text-sm rounded-xl transition-all shadow-lg shadow-cyan-900/30"
                >
                  <Download className="w-4 h-4" />
                  Install App
                </button>
                <button
                  onClick={() => handleDismiss(true)}
                  className="px-4 py-2.5 text-gray-400 hover:text-gray-300 text-sm rounded-xl border border-white/10 hover:border-white/20 transition-all"
                >
                  Not now
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── iOS Safari Manual Instructions Banner ──────────────────────── */}
      <AnimatePresence>
        {showIOSBanner && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed bottom-4 left-4 right-4 z-[9999] mx-auto max-w-sm"
          >
            <div className="bg-gray-900 border border-white/10 rounded-2xl p-4 shadow-2xl shadow-black/60 backdrop-blur-xl ring-1 ring-purple-500/20">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/20 to-cyan-500/20 border border-purple-500/30 flex items-center justify-center">
                    <span className="text-purple-400 font-bold text-sm font-mono">DT</span>
                  </div>
                  <div>
                    <p className="text-white font-semibold text-sm">Install on iPhone</p>
                    <p className="text-gray-400 text-xs">3 quick steps</p>
                  </div>
                </div>
                <button
                  onClick={() => handleDismiss(false)}
                  className="text-gray-500 hover:text-gray-300 transition-colors p-1 -mt-1 -mr-1"
                  aria-label="Dismiss"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* iOS Steps */}
              <ol className="space-y-2 mb-4">
                {[
                  { icon: <Share className="w-3.5 h-3.5" />, text: 'Tap the Share button in Safari' },
                  { icon: <Plus className="w-3.5 h-3.5" />, text: 'Tap "Add to Home Screen"' },
                  { icon: <Download className="w-3.5 h-3.5" />, text: 'Tap "Add" to confirm' },
                ].map((step, i) => (
                  <li key={i} className="flex items-center gap-3 text-xs text-gray-300">
                    <span className="w-5 h-5 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center flex-shrink-0 font-bold">
                      {i + 1}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="text-gray-400">{step.icon}</span>
                      {step.text}
                    </span>
                  </li>
                ))}
              </ol>

              <button
                onClick={() => handleDismiss(true)}
                className="w-full py-2 text-gray-400 hover:text-gray-300 text-sm rounded-xl border border-white/10 hover:border-white/20 transition-all"
              >
                Got it, thanks
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
