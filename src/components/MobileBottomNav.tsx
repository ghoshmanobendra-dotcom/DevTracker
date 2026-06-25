import { motion } from 'framer-motion';
import { Home, Target, Code2, Globe, BookOpen } from 'lucide-react';

export type TabID = 'home' | 'goals' | 'code' | 'web' | 'notes';

interface MobileBottomNavProps {
  activeTab: TabID;
  onChangeTab: (tab: TabID) => void;
}

const TABS = [
  { id: 'home', icon: Home, label: 'Home' },
  { id: 'goals', icon: Target, label: 'Goals' },
  { id: 'code', icon: Code2, label: 'Code' },
  { id: 'web', icon: Globe, label: 'Web' },
  { id: 'notes', icon: BookOpen, label: 'Notes' },
] as const;

export function MobileBottomNav({ activeTab, onChangeTab }: MobileBottomNavProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
      {/* Background with blur and top border */}
      <div className="absolute inset-0 bg-gray-950/80 backdrop-blur-xl border-t border-white/10" />
      
      {/* Safe area padding for iOS home indicator */}
      <div className="relative pb-safe">
        <div className="flex items-center justify-around px-2 py-3">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => onChangeTab(tab.id as TabID)}
                className={`relative flex flex-col items-center justify-center w-16 gap-1 transition-colors ${
                  isActive ? 'text-cyan-400' : 'text-gray-500 hover:text-gray-400'
                }`}
              >
                {/* Active Indicator Bubble */}
                {isActive && (
                  <motion.div
                    layoutId="mobile-nav-bubble"
                    className="absolute inset-0 bg-cyan-500/10 rounded-xl"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
                
                <Icon className={`w-5 h-5 relative z-10 transition-transform ${isActive ? 'scale-110' : 'scale-100'}`} />
                <span className="text-[10px] font-medium tracking-wide relative z-10">
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
