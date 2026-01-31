import { useState, useEffect } from 'react';
import { DailyGoal } from '../types';
import { Plus, CheckCircle2, Circle, Trash2, Sparkles, Target, Timer, Play, Lock, Repeat, Box, Video } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';

interface DailyGoalsProps {
  goals: DailyGoal[];
  onGoalsUpdate: () => void;
}

const categories = ['Coding', 'Web Development', 'Study', 'Health', 'Reading', 'General'];

export function DailyGoals({ goals, onGoalsUpdate }: DailyGoalsProps) {
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Coding');
  const [points, setPoints] = useState(10);
  const [isRecurring, setIsRecurring] = useState(false);
  const [duration, setDuration] = useState(60); // Default 60 minutes
  const [loading, setLoading] = useState(false);
  const [now, setNow] = useState(Date.now());

  // Verification State
  const [verifyingGoal, setVerifyingGoal] = useState<DailyGoal | null>(null);
  const [verificationInput, setVerificationInput] = useState('');

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  const handleAddGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase.from('daily_goals').insert({
        user_id: user.id,
        title,
        category,
        points,
        is_recurring: isRecurring,
        duration_minutes: duration > 0 ? duration : 0,
        date: new Date().toISOString().split('T')[0],
      });

      if (error) throw error;

      setTitle('');
      setCategory('Coding');
      setPoints(10);
      setIsRecurring(false);
      setDuration(60);
      setShowForm(false);
      onGoalsUpdate();
    } catch (error) {
      console.error('Error adding goal:', error);
    } finally {
      setLoading(false);
    }
  };

  const completeGoal = async (goal: DailyGoal) => {
    try {
      const { error } = await supabase
        .from('daily_goals')
        .update({
          is_completed: !goal.is_completed,
          completed_at: !goal.is_completed ? new Date().toISOString() : null,
        })
        .eq('id', goal.id);

      if (error) throw error;
      onGoalsUpdate();
    } catch (error) {
      console.error('Error toggling goal:', error);
    }
  };

  const handleToggleGoal = async (goal: DailyGoal) => {
    if (getRemainingSeconds(goal) > 0) return;

    // If already completed, just toggle off (no verification needed to undo)
    if (goal.is_completed) {
      await completeGoal(goal);
      return;
    }

    // If completing, check for verification categories
    if (goal.category === 'Coding' || goal.category === 'Web Development') {
      setVerifyingGoal(goal);
      setVerificationInput('');
      return;
    }

    await completeGoal(goal);
  };

  const handleVerifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verifyingGoal) return;

    const val = parseInt(verificationInput);
    if (isNaN(val)) return;

    let passed = false;
    let message = '';
    let subMessage = '';

    if (verifyingGoal.category === 'Coding') {
      if (val >= 3) {
        passed = true;
        message = "Fantastic Effort!";
        subMessage = "You've crushed those problems. Keep building that logic muscle!";
      } else {
        message = "Almost there!";
        subMessage = "Push yourself a little more. Solve at least 3 questions to unlock this victory.";
      }
    } else if (verifyingGoal.category === 'Web Development') {
      if (val > 3) {
        passed = true;
        message = "Knowledge Unlocked!";
        subMessage = "You're leveling up your stack. Great dedication!";
      } else {
        message = "Keep watching!";
        subMessage = "Dive deeper. Attend more than 3 lectures to truly grasp the concepts.";
      }
    }

    if (passed) {
      setVerifyingGoal(null); // Close input modal
      setVerificationSuccess({
        show: true,
        success: true,
        title: message,
        message: subMessage,
        goal: verifyingGoal
      });
    } else {
      // Keep verification modal open? Or show feedback modal.
      // Let's show the feedback modal to encourage them.
      setVerifyingGoal(null);
      setVerificationSuccess({
        show: true,
        success: false,
        title: message,
        message: subMessage,
        goal: verifyingGoal // Keep goal ref if we want to reopen verify
      });
    }
  };

  const [verificationSuccess, setVerificationSuccess] = useState<{
    show: boolean;
    success: boolean;
    title: string;
    message: string;
    goal: DailyGoal | null;
  }>({ show: false, success: false, title: '', message: '', goal: null });

  const handleCloseSuccess = async () => {
    if (verificationSuccess.success && verificationSuccess.goal) {
      await completeGoal(verificationSuccess.goal);
    }
    setVerificationSuccess({ ...verificationSuccess, show: false });
  };

  const handleStartGoal = async (goal: DailyGoal) => {
    try {
      const { error } = await supabase
        .from('daily_goals')
        .update({
          started_at: new Date().toISOString(),
        })
        .eq('id', goal.id);

      if (error) throw error;
      onGoalsUpdate();
    } catch (error) {
      console.error('Error starting goal:', error);
    }
  };

  const handleDeleteGoal = async (goalId: string) => {
    try {
      const { error } = await supabase.from('daily_goals').delete().eq('id', goalId);
      if (error) throw error;
      onGoalsUpdate();
    } catch (error) {
      console.error('Error deleting goal:', error);
    }
  };

  const getRemainingSeconds = (goal: DailyGoal) => {
    if (!goal.started_at || !goal.duration_minutes) return 0;
    const endTime = new Date(goal.started_at).getTime() + goal.duration_minutes * 60 * 1000;
    const remaining = Math.max(0, Math.ceil((endTime - now) / 1000));
    return remaining;
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const getCategoryColor = (cat: string) => {
    const colors: Record<string, string> = {
      Coding: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30 ring-cyan-500/20',
      'Web Development': 'bg-blue-500/10 text-blue-400 border-blue-500/30 ring-blue-500/20',
      Study: 'bg-purple-500/10 text-purple-400 border-purple-500/30 ring-purple-500/20',
      Health: 'bg-green-500/10 text-green-400 border-green-500/30 ring-green-500/20',
      Reading: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30 ring-yellow-500/20',
      General: 'bg-gray-500/10 text-gray-400 border-gray-500/30 ring-gray-500/20',
    };
    return colors[cat] || colors.General;
  };

  const completedGoals = goals.filter(g => g.is_completed).length;
  const totalPoints = goals.reduce((sum, g) => sum + (g.is_completed ? g.points : 0), 0);
  const progress = goals.length > 0 ? (completedGoals / goals.length) * 100 : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-gray-900/40 backdrop-blur-xl border border-white/5 rounded-3xl p-6 shadow-xl relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 p-32 bg-cyan-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

      <div className="flex items-center justify-between mb-8 relative z-10">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Target className="w-6 h-6 text-cyan-400" />
            Today's Goals
          </h2>
          <p className="text-gray-400 text-sm mt-1">
            {completedGoals}/{goals.length} completed • <span className="text-cyan-400 font-bold">{totalPoints}</span> points earned
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowForm(!showForm)}
          className={`flex items-center gap-2 px-4 py-2 ${showForm ? 'bg-red-500/10 text-red-400 border-red-500/30' : 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30'} border rounded-xl font-medium transition-all`}
        >
          {showForm ? 'Close' : (
            <>
              <Plus className="w-4 h-4" />
              Add Goal
            </>
          )}
        </motion.button>
      </div>

      <div className="mb-6 relative z-10">
        <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="h-full bg-gradient-to-r from-green-500 to-cyan-500"
          ></motion.div>
        </div>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.form
            initial={{ opacity: 0, height: 0, mb: 0 }}
            animate={{ opacity: 1, height: 'auto', mb: 24 }}
            exit={{ opacity: 0, height: 0, mb: 0 }}
            onSubmit={handleAddGoal}
            className="overflow-hidden"
          >
            <div className="p-4 bg-gray-800/30 rounded-2xl border border-white/5 space-y-4">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="What do you want to achieve?"
                className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all"
                required
                autoFocus
              />
              <div className="flex gap-3">
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="px-4 py-2 bg-gray-900/50 border border-gray-700/50 rounded-xl text-white focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                <div className="flex-1 relative">
                  <input
                    type="number"
                    value={points}
                    onChange={(e) => setPoints(Number(e.target.value))}
                    min="1"
                    className="w-full px-4 py-2 bg-gray-900/50 border border-gray-700/50 rounded-xl text-white focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all pl-20"
                  />
                  <span className="absolute left-4 top-2 text-gray-500 text-sm">Points:</span>
                </div>
              </div>

              <div className="flex gap-4 p-3 bg-gray-900/50 rounded-xl border border-gray-700/50">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="recurring"
                    checked={isRecurring}
                    onChange={(e) => setIsRecurring(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-600 text-cyan-500 focus:ring-cyan-500 bg-gray-800"
                  />
                  <label htmlFor="recurring" className="text-sm text-gray-300 flex items-center gap-1">
                    <Repeat className="w-3 h-3" />
                    Daily Recurring
                  </label>
                </div>

                <div className="h-6 w-px bg-gray-700"></div>

                <div className="flex items-center gap-2 flex-1">
                  <Timer className="w-4 h-4 text-gray-500" />
                  <input
                    type="number"
                    value={duration}
                    onChange={(e) => setDuration(Math.max(0, Number(e.target.value)))}
                    className="bg-transparent border-none text-white text-sm focus:ring-0 p-0 w-16"
                    placeholder="0"
                  />
                  <span className="text-sm text-gray-500">mins lock</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-xl font-medium hover:from-cyan-500 hover:to-blue-500 transition-all disabled:opacity-50 shadow-lg shadow-cyan-900/20"
              >
                {loading ? 'Adding...' : 'Add Goal'}
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      <div className="space-y-2 relative z-10 min-h-[200px]">
        <AnimatePresence mode="popLayout">
          {goals.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="text-center py-12 flex flex-col items-center justify-center h-full"
            >
              <div className="w-16 h-16 bg-gray-800/50 rounded-full flex items-center justify-center mb-4">
                <Sparkles className="w-8 h-8 text-gray-600" />
              </div>
              <p className="text-gray-400 font-medium">No goals yet</p>
              <p className="text-gray-600 text-sm">Add one to get started!</p>
            </motion.div>
          ) : (
            goals.map(goal => {
              const remaining = getRemainingSeconds(goal);
              const isLocked = remaining > 0;

              return (
                <motion.div
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  key={goal.id}
                  className={`group flex items-center gap-3 p-4 rounded-xl border transition-all ${goal.is_completed
                    ? 'bg-green-500/5 border-green-500/20'
                    : 'bg-gray-800/30 border-white/5 hover:border-white/10 hover:bg-gray-800/50'
                    }`}
                >
                  <div className="flex-shrink-0">
                    {goal.is_completed ? (
                      <button onClick={() => handleToggleGoal(goal)}>
                        <CheckCircle2 className="w-6 h-6 text-green-400" />
                      </button>
                    ) : isLocked ? (
                      <div className="w-6 h-6 flex items-center justify-center text-gray-600">
                        <Lock className="w-4 h-4" />
                      </div>
                    ) : (
                      <button
                        onClick={() => handleToggleGoal(goal)}
                        className="w-6 h-6 flex items-center justify-center text-gray-500 hover:text-gray-400"
                        disabled={goal.duration_minutes > 0 && !goal.started_at} // Can't complete if hasn't started
                      >
                        <Circle className="w-6 h-6" />
                      </button>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className={`font-medium transition-all ${goal.is_completed ? 'text-gray-500 line-through' : 'text-gray-200'}`}>
                        {goal.title}
                      </p>
                      {goal.is_recurring && (
                        <Repeat className="w-3 h-3 text-cyan-500/70" />
                      )}
                    </div>

                    {goal.duration_minutes > 0 && !goal.is_completed && (
                      <div className="mt-1 flex items-center gap-2">
                        {!goal.started_at ? (
                          <button
                            onClick={() => handleStartGoal(goal)}
                            className="flex items-center gap-1 text-xs px-2 py-0.5 bg-cyan-500/10 text-cyan-400 rounded-md hover:bg-cyan-500/20 transition-colors"
                          >
                            <Play className="w-3 h-3" />
                            Start ({goal.duration_minutes}m)
                          </button>
                        ) : remaining > 0 ? (
                          <span className="flex items-center gap-1 text-xs text-yellow-500 font-mono bg-yellow-500/10 px-2 py-0.5 rounded-md">
                            <Timer className="w-3 h-3" />
                            {formatTime(remaining)} remaining
                          </span>
                        ) : (
                          <span className="text-xs text-green-400 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            Time's up!
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getCategoryColor(goal.category)}`}>
                    {goal.category}
                  </span>

                  <span className="text-cyan-400 font-bold text-sm min-w-[30px] text-right">
                    +{goal.points}
                  </span>

                  <motion.button
                    whileHover={{ scale: 1.1, color: "#ef4444" }}
                    onClick={() => handleDeleteGoal(goal.id)}
                    className="opacity-0 group-hover:opacity-100 text-gray-600 transition-all p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </motion.button>
                </motion.div>
              )
            })
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {verifyingGoal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-gray-900 border border-white/10 rounded-2xl p-6 max-w-sm w-full shadow-2xl relative overflow-hidden"
            >
              <div className="text-center mb-6 relative z-10">
                <div className="w-12 h-12 bg-cyan-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  {verifyingGoal.category === 'Coding'
                    ? <Box className="w-6 h-6 text-cyan-400" />
                    : <Video className="w-6 h-6 text-cyan-400" />
                  }
                </div>
                <h3 className="text-xl font-bold text-white mb-1">Verify Completion</h3>
                <p className="text-gray-400 text-sm">
                  {verifyingGoal.category === 'Coding'
                    ? "How many coding questions did you solve?"
                    : "How many lectures did you attend?"}
                </p>
              </div>

              <form onSubmit={handleVerifySubmit} className="relative z-10">
                <input
                  type="number"
                  min="0"
                  value={verificationInput}
                  onChange={(e) => setVerificationInput(e.target.value)}
                  className="w-full px-4 py-3 bg-black/50 border border-gray-700 rounded-xl text-white text-center text-2xl font-bold mb-6 focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none"
                  autoFocus
                />

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setVerifyingGoal(null)}
                    className="flex-1 py-3 px-4 bg-gray-800 text-white rounded-xl font-medium hover:bg-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 px-4 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-xl font-medium hover:from-cyan-500 hover:to-blue-500 transition-colors shadow-lg shadow-cyan-900/20"
                  >
                    Verify
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {verificationSuccess.show && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-gray-900 border border-white/10 rounded-3xl p-8 max-w-sm w-full shadow-2xl relative overflow-hidden text-center"
            >
              {/* Background Gradients */}
              <div className={`absolute inset-0 bg-gradient-to-br ${verificationSuccess.success ? 'from-green-500/20 via-cyan-500/10 to-blue-500/20' : 'from-yellow-500/20 via-orange-500/10 to-red-500/20'}`}></div>

              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 200, damping: 15 }}
                className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 relative z-10 ${verificationSuccess.success ? 'bg-gradient-to-br from-green-400 to-cyan-400 shadow-lg shadow-green-500/30' : 'bg-gradient-to-br from-yellow-400 to-orange-400 shadow-lg shadow-yellow-500/30'}`}
              >
                {verificationSuccess.success ? (
                  <CheckCircle2 className="w-10 h-10 text-white" />
                ) : (
                  <Target className="w-10 h-10 text-white" />
                )}
              </motion.div>

              <h3 className={`text-2xl font-bold mb-2 relative z-10 ${verificationSuccess.success ? 'text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-cyan-400' : 'text-white'}`}>
                {verificationSuccess.title}
              </h3>

              <p className="text-gray-300 text-lg mb-8 relative z-10 leading-relaxed">
                {verificationSuccess.message}
              </p>

              <button
                onClick={handleCloseSuccess}
                className={`w-full py-4 rounded-xl font-bold text-lg shadow-xl relative z-10 transition-transform active:scale-95 ${verificationSuccess.success ? 'bg-gradient-to-r from-green-500 to-cyan-600 text-white hover:from-green-400 hover:to-cyan-500' : 'bg-gray-800 text-white hover:bg-gray-700'}`}
              >
                {verificationSuccess.success ? "Collect Rewards" : "I'll Do It!"}
              </button>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {completedGoals === goals.length && goals.length > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="mt-8 p-8 bg-gradient-to-br from-green-500/10 via-cyan-500/10 to-blue-500/10 border border-cyan-500/20 rounded-3xl text-center relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 to-cyan-500/5 animate-pulse"></div>

            {/* Decorative background elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
              <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-cyan-500/10 via-transparent to-transparent animate-spin-slow"></div>
            </div>

            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1, rotate: [0, 10, -10, 0] }}
              transition={{ delay: 0.2, type: "spring" }}
              className="w-20 h-20 bg-gradient-to-br from-green-400 to-cyan-400 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-green-500/20 relative z-10"
            >
              <Sparkles className="w-10 h-10 text-white" />
            </motion.div>

            <h3 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-cyan-400 mb-2 relative z-10">
              Congratulations!
            </h3>

            <p className="text-gray-300 text-lg mb-6 max-w-md mx-auto relative z-10 italic">
              "{motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)]}"
            </p>

            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/10 text-sm text-gray-400">
                <Target className="w-4 h-4 text-cyan-400" />
                <span>All tasks completed today</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

const motivationalQuotes = [
  "Success is the sum of small efforts repeated day in and day out.",
  "You're doing amazing! Keep this momentum going!",
  "The only way to do great work is to love what you do.",
  "Believe you can and you're halfway there.",
  "Your potential is endless. Go do what you were created to do.",
  "Focus on the step in front of you, not the whole staircase.",
  "Great things never come from comfort zones.",
  "Dream big and dare to fail.",
];
