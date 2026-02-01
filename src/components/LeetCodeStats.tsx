import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Trophy, Loader2, AlertCircle, ExternalLink, RefreshCw } from 'lucide-react';
import { syncLeetCodeProblems } from '../utils/leetcode';

interface LeetCodeProfile {
    username: string;
    name: string;
    avatar: string;
    ranking: number;
}

interface LeetCodeStatsData {
    totalSolved: number;
    totalQuestions: number;
    easySolved: number;
    totalEasy: number;
    mediumSolved: number;
    totalMedium: number;
    hardSolved: number;
    totalHard: number;
    acceptanceRate: number;
    ranking: number;
    streak: number;
}

type LeetCodeFullData = LeetCodeProfile & LeetCodeStatsData;

interface LeetCodeStatsProps {
    userId?: string;
    onSync?: () => void;
}

export function LeetCodeStats({ userId, onSync }: LeetCodeStatsProps) {
    // Try to load username from localStorage
    const [username, setUsername] = useState<string>(() => localStorage.getItem('leetcode_username') || '');
    const [inputUsername, setInputUsername] = useState('');
    const [stats, setStats] = useState<LeetCodeFullData | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [isEditing, setIsEditing] = useState(!username);

    const calculateStreak = (calendar: Record<string, number>): number => {
        if (!calendar) return 0;
        const timestamps = Object.keys(calendar).map(Number).sort((a, b) => b - a); // Descending
        if (timestamps.length === 0) return 0;

        // LeetCode timestamps are seconds
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Helper to get normalized date timestamp
        const getDayTs = (ts: number) => {
            const date = new Date(ts * 1000);
            date.setHours(0, 0, 0, 0);
            return date.getTime();
        };

        const todayTs = today.getTime();
        const yesterdayTs = todayTs - 86400000; // 24 hours in milliseconds

        let currentStreak = 0;
        let checkTs = todayTs;

        // Use a set for O(1) lookup of submission days
        const submissionDays = new Set(timestamps.map(ts => getDayTs(ts)));

        // If no submission today, check if streak is alive from yesterday
        if (!submissionDays.has(todayTs)) {
            if (!submissionDays.has(yesterdayTs)) {
                return 0; // Streak broken
            }
            checkTs = yesterdayTs; // Start counting from yesterday
        }

        while (submissionDays.has(checkTs)) {
            currentStreak++;
            checkTs -= 86400000; // Go back one day
        }

        return currentStreak;
    };

    const fetchStats = useCallback(async (user: string) => {
        if (!user) return;
        setLoading(true);
        setError('');

        try {
            let fullData: LeetCodeFullData = {
                username: user,
                name: user,
                avatar: '',
                ranking: 0,
                streak: 0,
                totalSolved: 0,
                totalQuestions: 0,
                easySolved: 0,
                totalEasy: 0,
                mediumSolved: 0,
                totalMedium: 0,
                hardSolved: 0,
                totalHard: 0,
                acceptanceRate: 0
            };

            let statsFound = false;

            // Strategy 1: Faisal Shohag API (Very reliable for basic stats + avatar currently)
            try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

                const res = await fetch(`https://leetcode-api-faisalshohag.vercel.app/${user}`, { signal: controller.signal });
                clearTimeout(timeoutId);

                if (res.ok) {
                    const data = await res.json();

                    if (data && !data.errors) {
                        fullData = {
                            username: user, // This API might not return the standardized username
                            name: user, // Fallback
                            avatar: data.avatar || '', // Often returns avatar URL directly
                            ranking: data.ranking || 0,
                            streak: 0, // This API might not have streak, check below
                            totalSolved: data.totalSolved || 0,
                            totalQuestions: data.totalQuestions || 0,
                            easySolved: data.easySolved || 0,
                            totalEasy: data.totalEasy || 0,
                            mediumSolved: data.mediumSolved || 0,
                            totalMedium: data.totalMedium || 0,
                            hardSolved: data.hardSolved || 0,
                            totalHard: data.totalHard || 0,
                            acceptanceRate: data.acceptanceRate || 0
                        };
                        statsFound = true;
                    }
                }
            } catch (e) {
                console.warn('Faisal API failed', e);
            }

            // Strategy 2: Alfa LeetCode API (Good for detailed profile & calendar/streak)
            // We use this to fill in gaps (like streak or better avatar) or as fallback
            try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 10000);

                const [statsRes, profileRes, calendarRes] = await Promise.allSettled([
                    fetch(`https://alfa-leetcode-api.onrender.com/${user}`, { signal: controller.signal }),
                    fetch(`https://alfa-leetcode-api.onrender.com/userProfile/${user}`, { signal: controller.signal }),
                    fetch(`https://alfa-leetcode-api.onrender.com/submissionCalendar/${user}`, { signal: controller.signal })
                ]);
                clearTimeout(timeoutId);

                if (statsRes.status === 'fulfilled' && statsRes.value.ok) {
                    const sData = await statsRes.value.json();
                    if (sData.totalSolved !== undefined) {
                        // If primary failed, use this
                        if (!statsFound) {
                            fullData = { ...fullData, ...sData };
                            fullData.totalSolved = sData.totalSolved; // Ensure override

                            // Manual acceptance rate calc for Alfa API
                            if (sData.totalSubmissions?.length > 0) {
                                const all = sData.totalSubmissions.find((s: any) => s.difficulty === 'All')?.submissions || 0;
                                const ac = sData.matchedUserStats?.acSubmissionNum?.find((s: any) => s.difficulty === 'All')?.submissions || 0;
                                if (all > 0) fullData.acceptanceRate = Math.round((ac / all) * 100);
                            } else if (sData.acceptanceRate) {
                                fullData.acceptanceRate = sData.acceptanceRate;
                            }

                            statsFound = true;
                        }
                    }
                }

                if (profileRes.status === 'fulfilled' && profileRes.value.ok) {
                    const pData = await profileRes.value.json();
                    if (pData.username) {
                        fullData.name = pData.name || pData.username;
                        // If we didn't get an avatar from Strategy 1, or this one looks meaningful
                        if (!fullData.avatar && pData.avatar) fullData.avatar = pData.avatar;
                        if (!fullData.ranking && pData.ranking) fullData.ranking = pData.ranking;
                    }
                }

                if (calendarRes.status === 'fulfilled' && calendarRes.value.ok) {
                    const cData = await calendarRes.value.json();
                    if (cData.submissionCalendar) {
                        const cal = JSON.parse(cData.submissionCalendar);
                        fullData.streak = calculateStreak(cal);
                    }
                }
            } catch (e) {
                console.warn('Alfa API failed', e);
            }

            // Strategy 3: LeetCode Stats API (Last Resort)
            if (!statsFound) {
                try {
                    const fallbackRes = await fetch(`https://leetcode-stats-api.herokuapp.com/${user}`);
                    if (fallbackRes.ok) {
                        const fallbackData = await fallbackRes.json();
                        if (fallbackData.status === 'success') {
                            fullData = {
                                ...fullData,
                                totalSolved: fallbackData.totalSolved,
                                totalQuestions: fallbackData.totalQuestions,
                                easySolved: fallbackData.easySolved,
                                totalEasy: fallbackData.totalEasy,
                                mediumSolved: fallbackData.mediumSolved,
                                totalMedium: fallbackData.totalMedium,
                                hardSolved: fallbackData.hardSolved,
                                totalHard: fallbackData.totalHard,
                                acceptanceRate: fallbackData.acceptanceRate,
                                ranking: fallbackData.ranking
                            };
                            statsFound = true;
                        }
                    }
                } catch (e) {
                    console.warn('Fallback API failed', e);
                }
            }

            if (!statsFound) {
                throw new Error('Could not fetch LeetCode stats. Username might be invalid.');
            }

            setStats(fullData);
            localStorage.setItem('leetcode_username', user);
            setIsEditing(false);

            // Auto-sync coding problems to tracker
            if (userId && onSync) {
                // Don't await this to keep UI responsive
                syncLeetCodeProblems(userId, user).then((synced) => {
                    if (synced) onSync();
                });
            }

        } catch (err: any) {
            setError(err.message || 'Failed to fetch data.');
        } finally {
            setLoading(false);
        }
    }, [userId, onSync]);



    useEffect(() => {
        if (username) {
            // Initial fetch
            fetchStats(username);

            // Auto-refresh every 5 minutes to keep stats live
            const interval = setInterval(() => {
                fetchStats(username);
            }, 5 * 60 * 1000);

            return () => clearInterval(interval);
        }
    }, [username, fetchStats]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (inputUsername.trim()) {
            setUsername(inputUsername);
            fetchStats(inputUsername);
        }
    };

    const handleEdit = () => {
        setIsEditing(true);
        setInputUsername(username);
    };

    const container = {
        hidden: { opacity: 0, scale: 0.95 },
        show: {
            opacity: 1,
            scale: 1,
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
        <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-2xl p-6 h-full flex flex-col">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-yellow-500/10 rounded-lg">
                        <Trophy className="w-5 h-5 text-yellow-500" />
                    </div>
                    <h2 className="text-xl font-bold text-white">LeetCode Stats</h2>
                </div>
                {!isEditing && (
                    <button
                        onClick={handleEdit}
                        className="text-xs text-gray-400 hover:text-white transition-colors"
                    >
                        Change User
                    </button>
                )}
            </div>

            <AnimatePresence mode="wait">
                {isEditing ? (
                    <motion.form
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        onSubmit={handleSubmit}
                        className="flex-1 flex flex-col justify-center items-center gap-4 py-8"
                    >
                        <div className="relative w-full max-w-xs">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                            <input
                                type="text"
                                value={inputUsername}
                                onChange={(e) => setInputUsername(e.target.value)}
                                placeholder="Enter LeetCode Username"
                                className="w-full pl-10 pr-4 py-2 bg-black/40 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-yellow-500/50 focus:ring-1 focus:ring-yellow-500/50 transition-all"
                                autoFocus
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-6 py-2 bg-yellow-600 hover:bg-yellow-500 text-white rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
                        >
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Fetch Profile'}
                        </button>
                        {error && (
                            <p className="text-red-400 text-sm flex items-center gap-1">
                                <AlertCircle className="w-3 h-3" />
                                {error}
                            </p>
                        )}
                    </motion.form>
                ) : loading ? (
                    <div className="flex-1 flex items-center justify-center">
                        <Loader2 className="w-8 h-8 text-yellow-500 animate-spin" />
                    </div>
                ) : stats ? (
                    <motion.div
                        variants={container}
                        initial="hidden"
                        animate="show"
                        className="space-y-6"
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded-full bg-yellow-500/10 flex items-center justify-center border border-yellow-500/20 shadow-lg shadow-yellow-500/5 relative overflow-hidden group">
                                {stats.avatar ? (
                                    <img src={stats.avatar} alt={stats.username} className="w-full h-full object-cover" />
                                ) : (
                                    <>
                                        <div className="absolute inset-0 bg-yellow-500/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                                        <span className="text-xl font-bold text-yellow-500 relative z-10">{stats.username[0].toUpperCase()}</span>
                                    </>
                                )}
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-white max-w-[150px] truncate">{stats.name || stats.username}</h3>
                                <div className="flex flex-col gap-1">
                                    <div className="flex items-center gap-2 text-xs text-gray-400">
                                        <span>Rank: #{stats.ranking.toLocaleString()}</span>
                                    </div>
                                    <div className="flex items-center gap-1 text-xs text-orange-400 font-medium">
                                        <span className="text-orange-500">🔥</span>
                                        <span>Streak: {stats.streak} days</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <motion.div variants={item} className="p-3 bg-gray-800/50 rounded-xl border border-gray-700/50 relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-yellow-500/10 to-transparent rounded-bl-full -mr-4 -mt-4" />
                                <p className="text-gray-400 text-xs mb-1">Total Solved</p>
                                <p className="text-2xl font-bold text-white mb-2">{stats.totalSolved}</p>
                                <div className="w-full h-1 bg-gray-700 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${(stats.totalSolved / stats.totalQuestions) * 100}%` }}
                                        transition={{ duration: 1, delay: 0.5 }}
                                        className="h-full bg-white"
                                    />
                                </div>
                            </motion.div>

                            <motion.div variants={item} className="p-3 bg-gray-800/50 rounded-xl border border-gray-700/50 relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-cyan-500/10 to-transparent rounded-bl-full -mr-4 -mt-4" />
                                <p className="text-gray-400 text-xs mb-1">Acceptance</p>
                                <p className="text-2xl font-bold text-white mb-2">{stats.acceptanceRate}%</p>
                                <div className="w-full h-1 bg-gray-700 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${stats.acceptanceRate}%` }}
                                        transition={{ duration: 1, delay: 0.6 }}
                                        className="h-full bg-cyan-400"
                                    />
                                </div>
                            </motion.div>
                        </div>

                        <div className="space-y-3">
                            <div className="space-y-1">
                                <div className="flex justify-between text-xs">
                                    <span className="text-cyan-400 font-medium">Easy</span>
                                    <span className="text-gray-400">{stats.easySolved} <span className="text-gray-600">/ {stats.totalEasy}</span></span>
                                </div>
                                <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${(stats.easySolved / stats.totalEasy) * 100}%` }}
                                        transition={{ duration: 1, delay: 0.7 }}
                                        className="h-full bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.5)]"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <div className="flex justify-between text-xs">
                                    <span className="text-yellow-400 font-medium">Medium</span>
                                    <span className="text-gray-400">{stats.mediumSolved} <span className="text-gray-600">/ {stats.totalMedium}</span></span>
                                </div>
                                <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${(stats.mediumSolved / stats.totalMedium) * 100}%` }}
                                        transition={{ duration: 1, delay: 0.8 }}
                                        className="h-full bg-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.5)]"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <div className="flex justify-between text-xs">
                                    <span className="text-red-400 font-medium">Hard</span>
                                    <span className="text-gray-400">{stats.hardSolved} <span className="text-gray-600">/ {stats.totalHard}</span></span>
                                </div>
                                <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${(stats.hardSolved / stats.totalHard) * 100}%` }}
                                        transition={{ duration: 1, delay: 0.9 }}
                                        className="h-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3 mt-4 pt-4 border-t border-gray-800">
                            <a
                                href={`https://leetcode.com/${stats.username}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex-1 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-xs text-gray-300 hover:text-white transition-colors flex items-center justify-center gap-2 border border-gray-700"
                            >
                                <ExternalLink className="w-3 h-3" />
                                View Profile
                            </a>
                            <button
                                onClick={() => fetchStats(stats.username)}
                                disabled={loading}
                                className="flex-1 py-2 rounded-lg bg-yellow-600/20 hover:bg-yellow-600/30 text-xs text-yellow-500 hover:text-yellow-400 transition-colors flex items-center justify-center gap-2 border border-yellow-600/30"
                            >
                                <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
                                Sync Now
                            </button>
                        </div>
                    </motion.div>
                ) : null}
            </AnimatePresence>
        </div>
    );
}
