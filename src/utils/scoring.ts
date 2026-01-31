import { supabase } from '../lib/supabase';
import { DailyGoal } from '../types';

export async function updateDailyScore(userId: string, date: string, goals: DailyGoal[]) {
  const completedGoals = goals.filter(g => g.is_completed);
  const score = completedGoals.reduce((sum, g) => sum + g.points, 0);

  const { error } = await supabase
    .from('daily_scores')
    .upsert({
      user_id: userId,
      date,
      score,
      goals_completed: completedGoals.length,
      total_goals: goals.length,
    }, {
      onConflict: 'user_id,date',
    });

  if (error) throw error;
}

export async function calculateStreak(userId: string): Promise<{ current: number; max: number }> {
  const { data: scores, error } = await supabase
    .from('daily_scores')
    .select('date, score')
    .eq('user_id', userId)
    .gt('score', 0)
    .order('date', { ascending: false });

  if (error || !scores) return { current: 0, max: 0 };

  let currentStreak = 0;
  let maxStreak = 0;
  let tempStreak = 0;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const sortedDates = scores.map(s => new Date(s.date)).sort((a, b) => b.getTime() - a.getTime());

  if (sortedDates.length > 0) {
    const mostRecent = sortedDates[0];
    mostRecent.setHours(0, 0, 0, 0);

    if (mostRecent.getTime() === today.getTime() || mostRecent.getTime() === yesterday.getTime()) {
      currentStreak = 1;
      let checkDate = new Date(mostRecent);

      for (let i = 1; i < sortedDates.length; i++) {
        checkDate.setDate(checkDate.getDate() - 1);
        const nextDate = new Date(sortedDates[i]);
        nextDate.setHours(0, 0, 0, 0);

        if (nextDate.getTime() === checkDate.getTime()) {
          currentStreak++;
        } else {
          break;
        }
      }
    }
  }

  for (let i = 0; i < sortedDates.length; i++) {
    if (i === 0) {
      tempStreak = 1;
    } else {
      const prevDate = new Date(sortedDates[i - 1]);
      const currDate = new Date(sortedDates[i]);
      const diffDays = Math.floor((prevDate.getTime() - currDate.getTime()) / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        tempStreak++;
      } else {
        tempStreak = 1;
      }
    }
    maxStreak = Math.max(maxStreak, tempStreak);
  }

  return { current: currentStreak, max: maxStreak };
}

export async function updateProfileStreaks(userId: string) {
  const { current, max } = await calculateStreak(userId);

  const { error } = await supabase
    .from('profiles')
    .update({
      current_streak: current,
      max_streak: max,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId);

  if (error) throw error;
}
