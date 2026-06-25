import { lazy, Suspense } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Loader2 } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

// ── Route-level lazy chunks ──────────────────────────────────────────────────
// Logged-out users never download Dashboard JS.
// Logged-in users never re-download Auth JS after the first visit (browser cache).
const Auth      = lazy(() => import('./components/Auth').then(m => ({ default: m.Auth })));
const Dashboard = lazy(() => import('./components/Dashboard').then(m => ({ default: m.Dashboard })));

// ── Shared full-screen loading spinner ───────────────────────────────────────
function PageSpinner() {
  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-3">
      <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
      <span className="text-xs text-gray-600 tracking-widest uppercase animate-pulse">
        Loading
      </span>
    </div>
  );
}

function AppContent() {
  const { user, loading } = useAuth();

  // Auth context still resolving — show spinner before any lazy fetch starts
  if (loading) {
    return <PageSpinner />;
  }

  return (
    <AnimatePresence mode="wait">
      {user ? (
        <Suspense fallback={<PageSpinner />} key="dashboard">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, filter: 'blur(10px)' }}
            animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, scale: 1.05, filter: 'blur(10px)' }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
          >
            <Dashboard />
          </motion.div>
        </Suspense>
      ) : (
        <Suspense fallback={<PageSpinner />} key="auth">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, filter: 'blur(10px)' }}
            animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, scale: 1.05, filter: 'blur(10px)' }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
          >
            <Auth />
          </motion.div>
        </Suspense>
      )}
    </AnimatePresence>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;

