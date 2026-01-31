import { useState, useEffect } from 'react';
import { Profile } from '../types';
import { Trophy, Target, Code2, TrendingUp, LogOut, Quote, Calendar, Github, Linkedin, Link2, Edit2, X, Save } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';

interface ProfileDashboardProps {
  profile: Profile;
  todayScore: number;
  goalsCompletedThisMonth: number;
}

const quotes = [
  "Code is like humor. When you have to explain it, it’s bad.",
  "Fix the cause, not the symptom.",
  "Optimism is an occupational hazard of programming: feedback is the treatment.",
  "Simplicity is the soul of efficiency.",
  "Make it work, make it right, make it fast.",
  "First, solve the problem. Then, write the code.",
  "Experience is the name everyone gives to their mistakes.",
  "Java is to JavaScript what car is to Carpet.",
  "Knowledge is power."
];

export function ProfileDashboard({ profile, todayScore, goalsCompletedThisMonth }: ProfileDashboardProps) {
  const { signOut } = useAuth();
  const currentYear = new Date().getFullYear();
  const daysInYear = 365;
  const dayOfYear = Math.floor((Date.now() - new Date(currentYear, 0, 0).getTime()) / 86400000);
  const yearProgress = (dayOfYear / daysInYear) * 100;
  const [quote, setQuote] = useState("");
  const [now, setNow] = useState(new Date());

  const [showSocialModal, setShowSocialModal] = useState(false);
  const [socials, setSocials] = useState({
    github: profile.github_url || '',
    linkedin: profile.linkedin_url || '',
    leetcode: profile.leetcode_url || ''
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setQuote(quotes[Math.floor(Math.random() * quotes.length)]);
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    setSocials({
      github: profile.github_url || '',
      linkedin: profile.linkedin_url || '',
      leetcode: profile.leetcode_url || ''
    });
  }, [profile]);

  const handleSaveSocials = async () => {
    setSaving(true);
    try {
      const { error } = await supabase.from('profiles').update({
        github_url: socials.github || null,
        linkedin_url: socials.linkedin || null,
        leetcode_url: socials.leetcode || null
      }).eq('id', profile.id);

      if (error) throw error;
      setShowSocialModal(false);
      window.location.reload();
    } catch (error) {
      console.error('Error updating socials:', error);
    } finally {
      setSaving(false);
    }
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-2xl p-6 relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-cyan-500/10 to-transparent rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-purple-500/10 to-transparent rounded-full blur-3xl"></div>

      <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            className="w-20 h-20 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-2xl font-bold text-white shadow-lg shadow-cyan-500/50"
          >
            {profile.full_name.charAt(0).toUpperCase()}
          </motion.div>
          <div>
            <motion.h1
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="text-2xl font-bold text-white"
            >
              {profile.full_name}
            </motion.h1>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="flex items-center gap-2 mt-1"
            >
              <div className="flex items-center gap-1 text-green-400">
                <Target className="w-4 h-4" />
                <span className="font-semibold">{profile.current_streak} day streak</span>
              </div>
              <span className="text-gray-600">•</span>
              <span className="text-gray-400">{profile.total_score} total points</span>
            </motion.div>
          </div>
        </div>

        {/* Social Media Section */}
        <div className="flex items-center gap-3 md:absolute md:left-1/2 md:-translate-x-1/2">
          <div className="flex items-center gap-2 bg-black/20 p-2 rounded-xl border border-white/5 backdrop-blur-sm">
            {profile.github_url && (
              <a href={profile.github_url} target="_blank" rel="noopener noreferrer"
                className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors">
                <Github className="w-5 h-5" />
              </a>
            )}
            {profile.linkedin_url && (
              <a href={profile.linkedin_url} target="_blank" rel="noopener noreferrer"
                className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-blue-400 transition-colors">
                <Linkedin className="w-5 h-5" />
              </a>
            )}
            {profile.leetcode_url && (
              <a href={profile.leetcode_url} target="_blank" rel="noopener noreferrer"
                className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-yellow-500 transition-colors">
                <Code2 className="w-5 h-5" />
              </a>
            )}
            <button
              onClick={() => setShowSocialModal(true)}
              className="p-2 hover:bg-white/10 rounded-lg text-gray-500 hover:text-cyan-400 transition-colors"
              title="Edit Social Links"
            >
              <Edit2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Real-time Calendar Widget */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="hidden md:flex items-center gap-4 px-5 py-2.5 bg-black/40 border border-white/5 rounded-xl backdrop-blur-sm"
          >
            <div className="p-2 bg-cyan-500/10 rounded-lg text-cyan-400">
              <Calendar className="w-5 h-5" />
            </div>
            <div className="flex flex-col border-r border-white/10 pr-4">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">
                {now.toLocaleString('default', { month: 'short' })}
              </span>
              <span className="text-xl font-bold text-white leading-none">
                {now.getDate()}
              </span>
            </div>
            <div>
              <span className="block text-sm font-medium text-gray-200">
                {now.toLocaleString('default', { weekday: 'long' })}
              </span>
              <span className="block text-xs text-cyan-400/80 font-mono">
                {now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </motion.div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={signOut}
            className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition-colors border border-gray-700 hover:border-gray-600 h-10"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Sign Out</span>
          </motion.button>
        </div>
      </div>

      <AnimatePresence>
        {showSocialModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-gray-900 border border-gray-700 rounded-2xl p-6 w-full max-w-md shadow-2xl"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <Link2 className="w-5 h-5 text-cyan-400" />
                  Social Links
                </h3>
                <button onClick={() => setShowSocialModal(false)} className="text-gray-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm text-gray-400 flex items-center gap-2">
                    <Github className="w-4 h-4" /> GitHub URL
                  </label>
                  <input
                    type="url"
                    value={socials.github}
                    onChange={(e) => setSocials({ ...socials, github: e.target.value })}
                    placeholder="https://github.com/..."
                    className="w-full px-4 py-2 bg-black/40 border border-gray-700 rounded-lg text-white focus:border-cyan-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm text-gray-400 flex items-center gap-2">
                    <Linkedin className="w-4 h-4" /> LinkedIn URL
                  </label>
                  <input
                    type="url"
                    value={socials.linkedin}
                    onChange={(e) => setSocials({ ...socials, linkedin: e.target.value })}
                    placeholder="https://linkedin.com/in/..."
                    className="w-full px-4 py-2 bg-black/40 border border-gray-700 rounded-lg text-white focus:border-cyan-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm text-gray-400 flex items-center gap-2">
                    <Code2 className="w-4 h-4" /> LeetCode URL
                  </label>
                  <input
                    type="url"
                    value={socials.leetcode}
                    onChange={(e) => setSocials({ ...socials, leetcode: e.target.value })}
                    placeholder="https://leetcode.com/..."
                    className="w-full px-4 py-2 bg-black/40 border border-gray-700 rounded-lg text-white focus:border-cyan-500 focus:outline-none"
                  />
                </div>

                <button
                  onClick={handleSaveSocials}
                  disabled={saving}
                  className="w-full py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-lg font-medium flex items-center justify-center gap-2 mt-4 disabled:opacity-50"
                >
                  {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Save className="w-4 h-4" /> Save Links</>}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8"
      >
        {/* Hero Card: Today's Score */}
        <motion.div
          variants={item}
          className="md:col-span-2 bg-gradient-to-br from-gray-800/80 to-gray-900/80 rounded-2xl p-8 border border-gray-700/50 relative overflow-hidden group hover:border-green-500/30 transition-all shadow-xl"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-green-500/10 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-green-500/20 transition-all duration-500"></div>

          <div className="relative z-10 flex flex-col h-full justify-between">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-green-500/10 rounded-xl">
                <Target className="w-8 h-8 text-green-400" />
              </div>
              <span className="text-gray-300 font-medium text-lg">Today's Score</span>
            </div>

            <div className="mt-2">
              <div className="text-6xl md:text-7xl font-bold text-white tracking-tight font-mono">
                {todayScore}
              </div>
              <div className="text-green-400 mt-2 font-medium flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                <span>points earned so far</span>
              </div>
            </div>

            <div className="mt-8 w-full bg-gray-700/50 h-2 rounded-full overflow-hidden">
              {/* Simple progress visual just for effect, assuming 100 is a 'good' daily target */}
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min((todayScore / 100) * 100, 100)}%` }}
                className="h-full bg-gradient-to-r from-green-500 to-emerald-400"
              />
            </div>
          </div>
        </motion.div>

        {/* Side Stack Stats */}
        <div className="flex flex-col gap-4">
          <motion.div variants={item} className="flex-1 bg-gray-800/50 rounded-xl p-4 border border-gray-700 hover:border-yellow-400/50 transition-all hover:bg-gray-800/80 group flex items-center justify-between">
            <div>
              <div className="text-gray-400 text-xs mb-1 uppercase tracking-wider">Max Streak</div>
              <div className="text-2xl font-bold text-white">{profile.max_streak} <span className="text-sm font-normal text-gray-500">days</span></div>
            </div>
            <Trophy className="w-8 h-8 text-yellow-500/20 group-hover:text-yellow-400 group-hover:scale-110 transition-all" />
          </motion.div>

          <motion.div variants={item} className="flex-1 bg-gray-800/50 rounded-xl p-4 border border-gray-700 hover:border-purple-400/50 transition-all hover:bg-gray-800/80 group flex items-center justify-between">
            <div>
              <div className="text-gray-400 text-xs mb-1 uppercase tracking-wider">This Month</div>
              <div className="text-2xl font-bold text-white">{goalsCompletedThisMonth} <span className="text-sm font-normal text-gray-500">goals</span></div>
            </div>
            <Code2 className="w-8 h-8 text-purple-500/20 group-hover:text-purple-400 group-hover:scale-110 transition-all" />
          </motion.div>

          <motion.div variants={item} className="flex-1 bg-gray-800/50 rounded-xl p-4 border border-gray-700 hover:border-cyan-400/50 transition-all hover:bg-gray-800/80 group flex items-center justify-between">
            <div>
              <div className="text-gray-400 text-xs mb-1 uppercase tracking-wider">Total Score</div>
              <div className="text-2xl font-bold text-white">{profile.total_score}</div>
            </div>
            <TrendingUp className="w-8 h-8 text-cyan-500/20 group-hover:text-cyan-400 group-hover:scale-110 transition-all" />
          </motion.div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="relative"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-400">Year Progress</span>
            <span className="text-sm font-semibold text-cyan-400">{yearProgress.toFixed(1)}%</span>
          </div>
          <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${yearProgress}%` }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 relative"
            >
              <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
            </motion.div>
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {daysInYear - dayOfYear} days remaining in {currentYear}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-gray-800/30 rounded-xl p-4 border border-gray-700/50 flex gap-3 items-start"
        >
          <Quote className="w-5 h-5 text-gray-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-gray-300 text-sm italic">"{quote}"</p>
            <p className="text-gray-500 text-xs mt-2">- Motivational Bot</p>
          </div>
        </motion.div>
      </div>
    </motion.div >
  );
}
