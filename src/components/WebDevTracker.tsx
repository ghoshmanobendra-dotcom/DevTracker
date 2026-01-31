import { useState } from 'react';
import { WebProject } from '../types';
import { Plus, Github, ExternalLink, Code, Layers, Trash2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';

interface WebDevTrackerProps {
    projects: WebProject[];
    onProjectsUpdate: () => void;
    sectionTitle?: string;
}

const statuses = ['Planned', 'In Progress', 'Completed'];

export function WebDevTracker({ projects, onProjectsUpdate, sectionTitle = "Web Projects" }: WebDevTrackerProps) {
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        projectName: '',
        description: '',
        techStack: '',
        repoUrl: '',
        demoUrl: '',
        status: 'Planned' as 'Planned' | 'In Progress' | 'Completed',
    });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { error } = await supabase.from('web_projects').insert({
                user_id: user.id,
                project_name: formData.projectName,
                description: formData.description || null,
                tech_stack: formData.techStack || null,
                repo_url: formData.repoUrl || null,
                demo_url: formData.demoUrl || null,
                status: formData.status,
            });

            if (error) throw error;

            setFormData({
                projectName: '',
                description: '',
                techStack: '',
                repoUrl: '',
                demoUrl: '',
                status: 'Planned',
            });
            setShowForm(false);
            onProjectsUpdate();
        } catch (error) {
            console.error('Error adding project:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (project: WebProject, newStatus: string) => {
        try {
            const { error } = await supabase
                .from('web_projects')
                .update({ status: newStatus })
                .eq('id', project.id);

            if (error) throw error;
            onProjectsUpdate();
        } catch (error) {
            console.error('Error updating status:', error);
        }
    };

    const handleDelete = async (projectId: string) => {
        try {
            const { error } = await supabase.from('web_projects').delete().eq('id', projectId);
            if (error) throw error;
            onProjectsUpdate();
        } catch (error) {
            console.error('Error deleting project:', error);
        }
    };

    const getStatusColor = (status: string) => {
        const colors: Record<string, string> = {
            'Completed': 'bg-green-500/10 text-green-400 border-green-500/30',
            'In Progress': 'bg-blue-500/10 text-blue-400 border-blue-500/30',
            'Planned': 'bg-gray-500/10 text-gray-400 border-gray-500/30',
        };
        return colors[status] || colors.Planned;
    };

    return (
        <div className="bg-gray-900/40 backdrop-blur-xl border border-white/5 rounded-3xl p-6 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-32 bg-blue-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

            <div className="flex items-center justify-between mb-8 relative z-10">
                <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                        <Layers className="w-6 h-6 text-blue-400" />
                        {sectionTitle}
                    </h2>
                    <p className="text-gray-400 text-sm mt-1">
                        Build and track your portfolio
                    </p>
                </div>
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowForm(!showForm)}
                    className={`flex items-center gap-2 px-4 py-2 ${showForm ? 'bg-red-500/10 text-red-400 border-red-500/30' : 'bg-blue-500/10 text-blue-400 border-blue-500/30'} border rounded-xl font-medium transition-all`}
                >
                    {showForm ? 'Close' : (
                        <>
                            <Plus className="w-4 h-4" />
                            Add Project
                        </>
                    )}
                </motion.button>
            </div>

            <AnimatePresence>
                {showForm && (
                    <motion.form
                        initial={{ opacity: 0, height: 0, mb: 0 }}
                        animate={{ opacity: 1, height: 'auto', mb: 24 }}
                        exit={{ opacity: 0, height: 0, mb: 0 }}
                        onSubmit={handleSubmit}
                        className="overflow-hidden"
                    >
                        <div className="p-4 bg-gray-800/30 rounded-2xl border border-white/5 space-y-3">
                            <input
                                type="text"
                                value={formData.projectName}
                                onChange={(e) => setFormData({ ...formData, projectName: e.target.value })}
                                placeholder="Project Name"
                                className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all"
                                required
                            />

                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Description"
                                rows={2}
                                className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all resize-none"
                            />

                            <input
                                type="text"
                                value={formData.techStack}
                                onChange={(e) => setFormData({ ...formData, techStack: e.target.value })}
                                placeholder="Tech Stack (e.g., React, Node.js, Supabase)"
                                className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all"
                            />

                            <div className="grid grid-cols-2 gap-3">
                                <input
                                    type="url"
                                    value={formData.repoUrl}
                                    onChange={(e) => setFormData({ ...formData, repoUrl: e.target.value })}
                                    placeholder="GitHub Repo URL"
                                    className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all"
                                />
                                <input
                                    type="url"
                                    value={formData.demoUrl}
                                    onChange={(e) => setFormData({ ...formData, demoUrl: e.target.value })}
                                    placeholder="Demo URL"
                                    className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all"
                                />
                            </div>

                            <select
                                value={formData.status}
                                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                                className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700/50 rounded-xl text-white focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all"
                            >
                                {statuses.map(status => (
                                    <option key={status} value={status}>{status}</option>
                                ))}
                            </select>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl font-medium hover:from-blue-500 hover:to-cyan-500 transition-all disabled:opacity-50 shadow-lg shadow-blue-900/20"
                            >
                                {loading ? 'Adding...' : 'Add Project'}
                            </button>
                        </div>
                    </motion.form>
                )}
            </AnimatePresence>

            <div className="space-y-4 relative z-10">
                {projects.length === 0 ? (
                    <div className="text-center py-12">
                        <Layers className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                        <p className="text-gray-400">No projects tracked yet.</p>
                    </div>
                ) : (
                    projects.map(project => (
                        <motion.div
                            layout
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            key={project.id}
                            className="group p-5 bg-gray-800/30 border border-white/5 hover:border-white/10 hover:bg-gray-800/50 rounded-2xl transition-all"
                        >
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <h3 className="text-lg font-semibold text-white">{project.project_name}</h3>
                                    <p className="text-sm text-gray-400 mt-1">{project.description}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <select
                                        value={project.status}
                                        onChange={(e) => handleStatusChange(project, e.target.value)}
                                        className={`px-3 py-1 rounded-lg text-xs font-medium border bg-transparent focus:outline-none focus:ring-1 focus:ring-blue-500/50 ${getStatusColor(project.status)}`}
                                    >
                                        {statuses.map(status => (
                                            <option key={status} value={status} className="bg-gray-900 text-white">{status}</option>
                                        ))}
                                    </select>
                                    <button
                                        onClick={() => handleDelete(project.id)}
                                        className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-red-400 transition-all"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            {project.tech_stack && (
                                <div className="flex items-center gap-2 mb-4">
                                    <Code className="w-4 h-4 text-gray-500" />
                                    <span className="text-sm text-gray-400">{project.tech_stack}</span>
                                </div>
                            )}

                            <div className="flex gap-3">
                                {project.repo_url && (
                                    <a
                                        href={project.repo_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-white transition-colors"
                                    >
                                        <Github className="w-4 h-4" />
                                        Code
                                    </a>
                                )}
                                {project.demo_url && (
                                    <a
                                        href={project.demo_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-blue-400 transition-colors"
                                    >
                                        <ExternalLink className="w-4 h-4" />
                                        Live Demo
                                    </a>
                                )}
                            </div>
                        </motion.div>
                    ))
                )}
            </div>
        </div>
    );
}
