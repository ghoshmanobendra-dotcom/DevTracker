export interface Profile {
  id: string;
  full_name: string;
  avatar_url?: string;
  current_streak: number;
  max_streak: number;
  total_score: number;
  career_path?: string;
  github_url?: string;
  linkedin_url?: string;
  leetcode_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Shortcut {
  id: string;
  user_id: string;
  title: string;
  type: 'url' | 'file';
  value: string;
  file_type?: string;
  created_at: string;
}

export interface DailyGoal {
  id: string;
  user_id: string;
  title: string;
  category: string;
  points: number;
  is_completed: boolean;
  completed_at?: string;
  date: string;
  is_recurring: boolean;
  duration_minutes: number;
  started_at?: string;
  created_at: string;
}

export interface CodingProblem {
  id: string;
  user_id: string;
  section_name: string;
  problem_name: string;
  problem_link?: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  status: 'Solved' | 'Attempted' | 'Unsolved';
  youtube_solution?: string;
  resource_url?: string;
  notes?: string;
  completed_at?: string;
  created_at: string;
}

export interface DailyScore {
  id: string;
  user_id: string;
  date: string;
  score: number;
  goals_completed: number;
  total_goals: number;
  coding_problems_solved: number;
  created_at: string;
}

export interface WebProject {
  id: string;
  user_id: string;
  project_name: string;
  description?: string;
  tech_stack?: string;
  repo_url?: string;
  demo_url?: string;
  status: 'Planned' | 'In Progress' | 'Completed';
  created_at: string;
  updated_at: string;
}

export interface StudyNote {
  id: string;
  user_id: string;
  title: string;
  content: string;
  category: string;
  tags?: string[];
  media_url?: string;
  media_type?: string;
  media_name?: string;
  created_at: string;
  updated_at: string;
}
