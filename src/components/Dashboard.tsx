import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Profile, DailyGoal, CodingProblem, DailyScore, WebProject, StudyNote, Shortcut } from '../types';
import { ProfileDashboard } from './ProfileDashboard';
import { DailyGoals } from './DailyGoals';
import { CodingTracker } from './CodingTracker';
import { WebDevTracker } from './WebDevTracker';
import { StudyNotes } from './StudyNotes';
import { Shortcuts } from './Shortcuts';
import { PerformanceHeatmap } from './PerformanceHeatmap';
import { LeetCodeStats } from './LeetCodeStats';
import { updateDailyScore, updateProfileStreaks } from '../utils/scoring';
import { Loader2 } from 'lucide-react';
import { CareerRoadmap } from './CareerRoadmap';
import { CAREER_PATHS } from '../data/roadmaps';

export function Dashboard() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [goals, setGoals] = useState<DailyGoal[]>([]);
  const [problems, setProblems] = useState<CodingProblem[]>([]);
  const [projects, setProjects] = useState<WebProject[]>([]);
  const [notes, setNotes] = useState<StudyNote[]>([]);
  const [shortcuts, setShortcuts] = useState<Shortcut[]>([]);
  const [dailyScores, setDailyScores] = useState<DailyScore[]>([]);
  const [loading, setLoading] = useState(true);

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    if (!user) return;

    try {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const sevenDaysAgoStr = sevenDaysAgo.toISOString().split('T')[0];

      // Cleanup old goals
      await supabase
        .from('daily_goals')
        .delete()
        .eq('user_id', user.id)
        .lt('date', sevenDaysAgoStr);

      const [profileRes, goalsRes, problemsRes, projectsRes, notesRes, shortcutsRes, scoresRes] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', user.id).maybeSingle(),
        supabase.from('daily_goals').select('*').eq('user_id', user.id).eq('date', today).order('created_at'),
        supabase.from('coding_problems').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
        supabase.from('web_projects').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
        supabase.from('study_notes').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
        supabase.from('shortcuts').select('*').eq('user_id', user.id).order('created_at'),
        supabase.from('daily_scores').select('*').eq('user_id', user.id).order('date'),
      ]);

      if (profileRes.data) {
        setProfile(profileRes.data);
      }

      if (goalsRes.data) {
        setGoals(goalsRes.data);
      }

      if (problemsRes.data) {
        setProblems(problemsRes.data);
      }

      if (projectsRes.data) {
        setProjects(projectsRes.data);
      }

      if (notesRes.data) {
        setNotes(notesRes.data);
      }

      if (shortcutsRes.data) {
        setShortcuts(shortcutsRes.data);
      }

      if (scoresRes.data) {
        setDailyScores(scoresRes.data);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGoalsUpdate = useCallback(async () => {
    if (!user) return;

    const { data: updatedGoals } = await supabase
      .from('daily_goals')
      .select('*')
      .eq('user_id', user.id)
      .eq('date', today);

    if (updatedGoals) {
      setGoals(updatedGoals);
      await updateDailyScore(user.id, today, updatedGoals);
      await updateProfileStreaks(user.id);

      const { data: updatedProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (updatedProfile) {
        setProfile(updatedProfile);
      }

      const { data: updatedScores } = await supabase
        .from('daily_scores')
        .select('*')
        .eq('user_id', user.id)
        .order('date');

      if (updatedScores) {
        setDailyScores(updatedScores);
      }
    }
  }, [user, today]);

  const handleProblemsUpdate = useCallback(async () => {
    if (!user) return;

    const { data: updatedProblems } = await supabase
      .from('coding_problems')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (updatedProblems) {
      setProblems(updatedProblems);
    }
  }, [user]);

  const handleProjectsUpdate = useCallback(async () => {
    if (!user) return;

    const { data: updatedProjects } = await supabase
      .from('web_projects')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (updatedProjects) {
      setProjects(updatedProjects);
    }
  }, [user]);

  const handleNotesUpdate = useCallback(async () => {
    if (!user) return;

    const { data: updatedNotes } = await supabase
      .from('study_notes')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (updatedNotes) {
      setNotes(updatedNotes);
    }
  }, [user]);

  const handleShortcutsUpdate = useCallback(async () => {
    if (!user) return;

    const { data: updatedShortcuts } = await supabase
      .from('shortcuts')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at');

    if (updatedShortcuts) {
      setShortcuts(updatedShortcuts);
    }
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
      </div>
    );
  }

  if (!user || !profile) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <p className="text-gray-400">Loading profile...</p>
      </div>
    );
  }

  const todayScore = dailyScores.find(s => s.date === today)?.score || 0;
  const currentMonth = new Date().getMonth();
  const goalsCompletedThisMonth = goals.filter(
    g => g.is_completed && new Date(g.created_at).getMonth() === currentMonth
  ).length;

  const currentPath = CAREER_PATHS.find(p => p.id === profile.career_path);
  const projectSectionTitle = currentPath ? `${currentPath.title} Projects` : 'Web Projects';

  return (
    <div className="min-h-screen bg-black relative overflow-hidden font-sans selection:bg-cyan-500/30">
      {/* Background Gradients & Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-purple-500/5 to-green-500/5 pointer-events-none"></div>
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 py-8 space-y-8">
        <ProfileDashboard
          profile={profile}
          todayScore={todayScore}
          goalsCompletedThisMonth={goalsCompletedThisMonth}
        />

        <PerformanceHeatmap dailyScores={dailyScores} />

        <Shortcuts shortcuts={shortcuts} onShortcutsUpdate={handleShortcutsUpdate} />

        <CareerRoadmap userId={user.id} careerPathId={profile.career_path} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <DailyGoals goals={goals} onGoalsUpdate={handleGoalsUpdate} />
          <LeetCodeStats userId={user?.id} onSync={handleProblemsUpdate} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <CodingTracker problems={problems} onProblemsUpdate={handleProblemsUpdate} />
          <WebDevTracker projects={projects} onProjectsUpdate={handleProjectsUpdate} sectionTitle={projectSectionTitle} />
        </div>

        <StudyNotes notes={notes} onNotesUpdate={handleNotesUpdate} />
      </div>
    </div>
  );
}
