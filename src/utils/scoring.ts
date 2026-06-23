import api from '../lib/api';
import { DailyGoal } from '../types';

export async function updateDailyScore(userId: string, date: string, goals: DailyGoal[]) {
  const completedGoals = goals.filter(g => g.is_completed);
  const score = completedGoals.reduce((sum, g) => sum + g.points, 0);

  await api.put('/api/scores', {
    date,
    score,
    goals_completed: completedGoals.length,
    total_goals: goals.length,
  });
}

export async function updateProfileStreaks(userId: string) {
  await api.put('/api/profile/streaks');
}
