import { useState } from 'react';
import { CodingProblem } from '../types';
import { Plus, ExternalLink, Youtube, Link as LinkIcon, Trash2, Code2, RefreshCw, Search } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { syncLeetCodeProblems } from '../utils/leetcode';

interface CodingTrackerProps {
  problems: CodingProblem[];
  onProblemsUpdate: () => void;
}


const difficulties = ['Easy', 'Medium', 'Hard'];
const statuses = ['Solved', 'Attempted', 'Unsolved'];

export function CodingTracker({ problems, onProblemsUpdate }: CodingTrackerProps) {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    sectionName: 'DSA Practice',
    problemName: '',
    problemLink: '',
    difficulty: 'Medium' as 'Easy' | 'Medium' | 'Hard',
    status: 'Unsolved' as 'Solved' | 'Attempted' | 'Unsolved',
    youtubeSolution: '',
    resourceUrl: '',
    notes: '',
  });
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDifficulty, setFilterDifficulty] = useState<'All' | 'Easy' | 'Medium' | 'Hard'>('All');

  const filteredProblems = problems.filter(problem => {
    const matchesSearch = problem.problem_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      problem.section_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (problem.notes && problem.notes.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesDifficulty = filterDifficulty === 'All' || problem.difficulty === filterDifficulty;
    return matchesSearch && matchesDifficulty;
  });

  const handleSync = async () => {
    // ... (rest of sync logic same)
    const username = localStorage.getItem('leetcode_username');
    if (!username) return;

    setSyncing(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await syncLeetCodeProblems(user.id, username);
        onProblemsUpdate();
      }
    } catch (err) {
      console.error('Sync failed', err);
    } finally {
      setSyncing(false);
    }
  };


  const handleSubmit = async (e: React.FormEvent) => {
    // ... (rest of submit logic same)
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase.from('coding_problems').insert({
        user_id: user.id,
        section_name: formData.sectionName,
        problem_name: formData.problemName,
        problem_link: formData.problemLink || null,
        difficulty: formData.difficulty,
        status: formData.status,
        youtube_solution: formData.youtubeSolution || null,
        resource_url: formData.resourceUrl || null,
        notes: formData.notes || null,
        completed_at: formData.status === 'Solved' ? new Date().toISOString() : null,
      });

      if (error) throw error;

      setFormData({
        sectionName: 'DSA Practice',
        problemName: '',
        problemLink: '',
        difficulty: 'Medium',
        status: 'Unsolved',
        youtubeSolution: '',
        resourceUrl: '',
        notes: '',
      });
      setShowForm(false);
      onProblemsUpdate();
    } catch (error) {
      console.error('Error adding problem:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (problem: CodingProblem, newStatus: string) => {
    // ...
    try {
      const { error } = await supabase
        .from('coding_problems')
        .update({
          status: newStatus,
          completed_at: newStatus === 'Solved' ? new Date().toISOString() : null,
        })
        .eq('id', problem.id);

      if (error) throw error;
      onProblemsUpdate();
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handleDelete = async (problemId: string) => {
    // ...
    try {
      const { error } = await supabase.from('coding_problems').delete().eq('id', problemId);
      if (error) throw error;
      onProblemsUpdate();
    } catch (error) {
      console.error('Error deleting problem:', error);
    }
  };

  const getDifficultyColor = (diff: string) => {
    // ...
    const colors: Record<string, string> = {
      Easy: 'bg-green-500/10 text-green-400 border-green-500/30',
      Medium: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30',
      Hard: 'bg-red-500/10 text-red-400 border-red-500/30',
    };
    return colors[diff] || colors.Medium;
  };

  const getStatusColor = (status: string) => {
    // ...
    const colors: Record<string, string> = {
      Solved: 'bg-green-500 hover:bg-green-600',
      Attempted: 'bg-yellow-500 hover:bg-yellow-600',
      Unsolved: 'bg-gray-600 hover:bg-gray-500',
    };
    return colors[status] || colors.Unsolved;
  };

  const solvedCount = problems.filter(p => p.status === 'Solved').length;
  const attemptedCount = problems.filter(p => p.status === 'Attempted').length;

  return (
    <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">Coding Practice Tracker</h2>
          <p className="text-gray-400 text-sm mt-1">
            {solvedCount} solved • {attemptedCount} attempted • {problems.length} total
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all shadow-lg shadow-purple-500/20"
          >
            <Plus className="w-4 h-4" />
            Add
          </button>
          <button
            onClick={handleSync}
            disabled={syncing || !localStorage.getItem('leetcode_username')}
            className="flex items-center gap-2 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-all disabled:opacity-50 border border-gray-700 hover:border-gray-500"
            title="Sync with LeetCode"
          >
            <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4">
          <div className="text-green-400 text-sm font-medium mb-1">Solved</div>
          <div className="text-3xl font-bold text-white">{solvedCount}</div>
        </div>
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
          <div className="text-yellow-400 text-sm font-medium mb-1">Attempted</div>
          <div className="text-3xl font-bold text-white">{attemptedCount}</div>
        </div>
        <div className="bg-gray-700/30 border border-gray-600/30 rounded-xl p-4">
          <div className="text-gray-400 text-sm font-medium mb-1">Unsolved</div>
          <div className="text-3xl font-bold text-white">{problems.length - solvedCount - attemptedCount}</div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search problems or tags..."
            className="w-full pl-9 pr-4 py-2 bg-black/20 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
          />
        </div>
        <div className="flex gap-2">
          {['All', 'Easy', 'Medium', 'Hard'].map((diff) => (
            <button
              key={diff}
              onClick={() => setFilterDifficulty(diff as any)}
              className={`flex-1 py-1.5 px-3 text-xs font-medium rounded-lg border transition-all ${filterDifficulty === diff
                ? 'bg-purple-500/20 text-purple-400 border-purple-500/50'
                : 'bg-black/20 text-gray-400 border-gray-700 hover:border-gray-500'
                }`}
            >
              {diff}
            </button>
          ))}
        </div>
      </div>

      {
        showForm && (
          <form onSubmit={handleSubmit} className="mb-6 p-4 bg-gray-800/50 rounded-xl border border-gray-700 space-y-3">
            {/* Form Content (same as before) */}
            <div className="grid grid-cols-2 gap-3">
              <input
                type="text"
                value={formData.sectionName}
                onChange={(e) => setFormData({ ...formData, sectionName: e.target.value })}
                placeholder="Section (e.g., DP Practice)"
                className="px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                required
              />
              <input
                type="text"
                value={formData.problemName}
                onChange={(e) => setFormData({ ...formData, problemName: e.target.value })}
                placeholder="Problem name"
                className="px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                required
              />
            </div>

            <input
              type="url"
              value={formData.problemLink}
              onChange={(e) => setFormData({ ...formData, problemLink: e.target.value })}
              placeholder="Problem link (optional)"
              className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
            />

            {/* Rest of form inputs... */}
            <div className="grid grid-cols-2 gap-3">
              <select
                value={formData.difficulty}
                onChange={(e) => setFormData({ ...formData, difficulty: e.target.value as any })}
                className="px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
              >
                {difficulties.map(diff => (
                  <option key={diff} value={diff}>{diff}</option>
                ))}
              </select>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                className="px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
              >
                {statuses.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>

            <input
              type="url"
              value={formData.youtubeSolution}
              onChange={(e) => setFormData({ ...formData, youtubeSolution: e.target.value })}
              placeholder="YouTube solution link (optional)"
              className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
            />

            <input
              type="url"
              value={formData.resourceUrl}
              onChange={(e) => setFormData({ ...formData, resourceUrl: e.target.value })}
              placeholder="Other resource link (optional)"
              className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
            />

            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Notes (optional)"
              rows={2}
              className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 resize-none"
            />

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors disabled:opacity-50"
              >
                {loading ? 'Adding...' : 'Add Problem'}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        )
      }

      {
        filteredProblems.length === 0 ? (
          <div className="text-center py-12">
            <Code2 className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400">
              {problems.length === 0 ? "No problems tracked yet. Add one to start!" : "No matches found."}
            </p>
          </div>
        ) : (
          <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
            {filteredProblems.map((problem, index) => (
              <div
                key={problem.id}
                className="group p-4 bg-gray-800/50 border border-gray-700 hover:border-gray-600 rounded-xl transition-all"
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs text-gray-500">#{filteredProblems.length - index} • {problem.section_name}</span>
                    </div>
                    <h3 className="text-white font-medium">{problem.problem_name}</h3>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getDifficultyColor(problem.difficulty)}`}>
                      {problem.difficulty}
                    </span>
                    <select
                      value={problem.status}
                      onChange={(e) => handleStatusChange(problem, e.target.value)}
                      className={`px-3 py-1 rounded-lg text-xs font-medium text-white transition-colors ${getStatusColor(problem.status)}`}
                    >
                      {statuses.map(status => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </select>
                    <button
                      onClick={() => handleDelete(problem.id)}
                      className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-red-400 transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {(problem.problem_link || problem.youtube_solution || problem.resource_url) && (
                  <div className="flex items-center gap-2 mb-2">
                    {problem.problem_link && (
                      <a
                        href={problem.problem_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 px-2 py-1 bg-gray-700 hover:bg-gray-600 text-gray-300 text-xs rounded transition-colors"
                      >
                        <ExternalLink className="w-3 h-3" />
                        Problem
                      </a>
                    )}
                    {problem.youtube_solution && (
                      <a
                        href={problem.youtube_solution}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 px-2 py-1 bg-red-500/20 hover:bg-red-500/30 text-red-400 text-xs rounded transition-colors"
                      >
                        <Youtube className="w-3 h-3" />
                        Solution
                      </a>
                    )}
                    {problem.resource_url && (
                      <a
                        href={problem.resource_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 px-2 py-1 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 text-xs rounded transition-colors"
                      >
                        <LinkIcon className="w-3 h-3" />
                        Resource
                      </a>
                    )}
                  </div>
                )}

                {problem.notes && (
                  <p className="text-sm text-gray-400 mt-2">{problem.notes}</p>
                )}
              </div>
            ))}
          </div>
        )
      }
    </div >
  );
}
