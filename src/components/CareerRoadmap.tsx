import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { CAREER_PATHS, CareerPath } from '../data/roadmaps';
import { CheckCircle2, Circle, BookOpen, ChevronDown, ChevronRight, Award } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface CareerRoadmapProps {
    careerPathId?: string;
    userId: string;
}

export function CareerRoadmap({ careerPathId, userId }: CareerRoadmapProps) {
    const [roadmap, setRoadmap] = useState<CareerPath | null>(null);
    const [completedTopics, setCompletedTopics] = useState<Set<string>>(new Set());
    const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (careerPathId) {
            const path = CAREER_PATHS.find(p => p.id === careerPathId);
            setRoadmap(path || null);
            // Reset expanded modules when path changes, but don't auto-expand
            setExpandedModules(new Set());
        }
        loadProgress();
    }, [careerPathId, userId]);

    const loadProgress = async () => {
        const { data } = await supabase
            .from('career_progress')
            .select('topic_id')
            .eq('user_id', userId);

        if (data) {
            setCompletedTopics(new Set(data.map(d => d.topic_id)));
        }
        setLoading(false);
    };

    const toggleTopic = async (topicId: string) => {
        const isCompleted = completedTopics.has(topicId);

        // Optimistic update
        const newCompleted = new Set(completedTopics);
        if (isCompleted) {
            newCompleted.delete(topicId);
        } else {
            newCompleted.add(topicId);
        }
        setCompletedTopics(newCompleted);

        if (isCompleted) {
            await supabase.from('career_progress').delete().eq('user_id', userId).eq('topic_id', topicId);
        } else {
            await supabase.from('career_progress').insert({ user_id: userId, topic_id: topicId });
        }
    };

    const toggleModule = (moduleId: string) => {
        const newExpanded = new Set(expandedModules);
        if (newExpanded.has(moduleId)) {
            newExpanded.delete(moduleId);
        } else {
            newExpanded.add(moduleId);
        }
        setExpandedModules(newExpanded);
    };

    const updateCareerPath = async (id: string) => {
        const { error } = await supabase.from('profiles').update({ career_path: id }).eq('id', userId);
        if (!error) {
            // Force reload or just set state locally if we passed a setter? 
            // Ideally we callback to parent. But for now let's just set local state to trigger effect? 
            // Effect depends on prop. 
            // Actually, better to reload the window or use a callback prop.
            // Let's just use window.location.reload() for simplicity or assume dashboard refreshes.
            // Or better:
            window.location.reload();
        }
    };

    if (loading) return <div className="p-4 text-center text-gray-400 font-mono text-sm animate-pulse">Loading roadmap...</div>;

    if (!careerPathId) {
        return (
            <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-2xl p-6 text-center">
                <h2 className="text-xl font-bold text-white mb-4">Choose Your Career Path</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {CAREER_PATHS.map(path => (
                        <button
                            key={path.id}
                            onClick={() => updateCareerPath(path.id)}
                            className="p-4 rounded-xl bg-gray-800 border border-gray-700 hover:border-cyan-500 hover:bg-gray-700 transition-all text-left group"
                        >
                            <h3 className="font-bold text-white group-hover:text-cyan-400">{path.title}</h3>
                            <p className="text-xs text-gray-400 mt-2">{path.description}</p>
                        </button>
                    ))}
                </div>
            </div>
        );
    }

    if (!roadmap) return <div className="p-4 text-gray-400">Roadmap not found.</div>;

    const totalTopics = roadmap.modules.reduce((acc, m) => acc + m.topics.length, 0);
    // Accurate count intersection
    const validCompletedCount = roadmap.modules.flatMap(m => m.topics).filter(t => completedTopics.has(t.id)).length;
    const progress = Math.round((validCompletedCount / totalTopics) * 100) || 0;

    return (
        <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                        <Award className="w-6 h-6 text-purple-400" />
                        {roadmap.title} Roadmap
                    </h2>
                    <p className="text-gray-400 text-sm mt-1">{roadmap.description}</p>
                </div>
                <div className="text-right">
                    <div className="text-3xl font-bold text-white">{progress}%</div>
                    <div className="text-xs text-gray-400">Completed</div>
                </div>
            </div>

            <div className="relative h-2 bg-gray-800 rounded-full overflow-hidden mb-8">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    className="absolute top-0 left-0 h-full bg-gradient-to-r from-purple-500 to-cyan-500"
                />
            </div>

            <div className="space-y-4">
                {roadmap.modules.map((module) => (
                    <div key={module.id} className="border border-gray-800 rounded-xl overflow-hidden bg-gray-800/20">
                        <button
                            onClick={() => toggleModule(module.id)}
                            className="w-full flex flex-col p-4 bg-gray-800/40 hover:bg-gray-800/60 transition-all border-b border-gray-800/50"
                        >
                            <div className="flex items-center justify-between w-full mb-3">
                                <h3 className="font-bold text-white flex items-center gap-3">
                                    <div className={`p-1.5 rounded-lg ${expandedModules.has(module.id) ? 'bg-purple-500/20 text-purple-400' : 'bg-gray-800 text-gray-500'}`}>
                                        {expandedModules.has(module.id) ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                                    </div>
                                    <span className="text-lg">{module.title}</span>
                                </h3>
                                <span className="text-xs font-mono text-cyan-400 bg-cyan-900/20 px-2 py-1 rounded-full border border-cyan-500/20">
                                    {Math.round((module.topics.filter(t => completedTopics.has(t.id)).length / module.topics.length) * 100)}% Complete
                                </span>
                            </div>

                            <div className="w-full bg-gray-900 rounded-full h-1.5 overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${(module.topics.filter(t => completedTopics.has(t.id)).length / module.topics.length) * 100}%` }}
                                    className="h-full bg-gradient-to-r from-cyan-500 to-purple-500"
                                />
                            </div>
                        </button>

                        <AnimatePresence>
                            {expandedModules.has(module.id) && (
                                <motion.div
                                    initial={{ height: 0 }}
                                    animate={{ height: 'auto' }}
                                    exit={{ height: 0 }}
                                    className="overflow-hidden"
                                >
                                    <div className="p-4 space-y-3">
                                        {module.topics.map((topic) => {
                                            const isDone = completedTopics.has(topic.id);
                                            return (
                                                <div key={topic.id} className="flex items-start gap-3 group">
                                                    <button
                                                        onClick={() => toggleTopic(topic.id)}
                                                        className={`mt-1 transition-colors ${isDone ? 'text-green-400' : 'text-gray-600 hover:text-gray-400'}`}
                                                    >
                                                        {isDone ? <CheckCircle2 className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
                                                    </button>
                                                    <div className="flex-1">
                                                        <div className="text-gray-200 font-medium">{topic.title}</div>
                                                        <div className="text-sm text-gray-500">{topic.description}</div>
                                                        {topic.resources && topic.resources.length > 0 && (
                                                            <div className="mt-2 flex gap-2">
                                                                {topic.resources.map(res => (
                                                                    <a key={res.url} href={res.url} target="_blank" rel="noopener noreferrer"
                                                                        className="text-xs flex items-center gap-1 text-cyan-400 hover:text-cyan-300 bg-cyan-900/20 px-2 py-1 rounded">
                                                                        <BookOpen className="w-3 h-3" /> {res.name}
                                                                    </a>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                ))}
            </div>
        </div>
    );
}
