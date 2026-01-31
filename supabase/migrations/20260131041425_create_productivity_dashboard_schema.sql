/*
  # Productivity Dashboard Database Schema

  ## Overview
  Complete schema for a developer productivity dashboard with goals tracking,
  coding problem management, and performance heatmap data.

  ## New Tables
  
  ### `profiles`
  - `id` (uuid, primary key, references auth.users)
  - `full_name` (text)
  - `avatar_url` (text, optional)
  - `current_streak` (integer, default 0)
  - `max_streak` (integer, default 0)
  - `total_score` (integer, default 0)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### `daily_goals`
  - `id` (uuid, primary key)
  - `user_id` (uuid, references profiles)
  - `title` (text)
  - `category` (text) - Study, Coding, Health, etc.
  - `points` (integer, default 10)
  - `is_completed` (boolean, default false)
  - `completed_at` (timestamptz, optional)
  - `date` (date) - the date this goal belongs to
  - `created_at` (timestamptz)

  ### `coding_problems`
  - `id` (uuid, primary key)
  - `user_id` (uuid, references profiles)
  - `section_name` (text) - e.g., "DP Practice"
  - `problem_name` (text)
  - `problem_link` (text, optional)
  - `difficulty` (text) - Easy, Medium, Hard
  - `status` (text) - Solved, Attempted, Unsolved
  - `youtube_solution` (text, optional)
  - `resource_url` (text, optional)
  - `notes` (text, optional)
  - `completed_at` (timestamptz, optional)
  - `created_at` (timestamptz)

  ### `daily_scores`
  - `id` (uuid, primary key)
  - `user_id` (uuid, references profiles)
  - `date` (date, unique per user)
  - `score` (integer, default 0)
  - `goals_completed` (integer, default 0)
  - `total_goals` (integer, default 0)
  - `coding_problems_solved` (integer, default 0)
  - `created_at` (timestamptz)

  ## Security
  - Enable RLS on all tables
  - Users can only access their own data
  - Authenticated users required for all operations
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  full_name text NOT NULL,
  avatar_url text,
  current_streak integer DEFAULT 0,
  max_streak integer DEFAULT 0,
  total_score integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create daily_goals table
CREATE TABLE IF NOT EXISTS daily_goals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  category text DEFAULT 'General',
  points integer DEFAULT 10,
  is_completed boolean DEFAULT false,
  completed_at timestamptz,
  date date DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now()
);

-- Create coding_problems table
CREATE TABLE IF NOT EXISTS coding_problems (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  section_name text DEFAULT 'General',
  problem_name text NOT NULL,
  problem_link text,
  difficulty text DEFAULT 'Medium',
  status text DEFAULT 'Unsolved',
  youtube_solution text,
  resource_url text,
  notes text,
  completed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Create daily_scores table
CREATE TABLE IF NOT EXISTS daily_scores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  date date NOT NULL,
  score integer DEFAULT 0,
  goals_completed integer DEFAULT 0,
  total_goals integer DEFAULT 0,
  coding_problems_solved integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, date)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_daily_goals_user_date ON daily_goals(user_id, date);
CREATE INDEX IF NOT EXISTS idx_coding_problems_user ON coding_problems(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_scores_user_date ON daily_scores(user_id, date);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE coding_problems ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_scores ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Daily goals policies
CREATE POLICY "Users can view own goals"
  ON daily_goals FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own goals"
  ON daily_goals FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own goals"
  ON daily_goals FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own goals"
  ON daily_goals FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Coding problems policies
CREATE POLICY "Users can view own problems"
  ON coding_problems FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own problems"
  ON coding_problems FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own problems"
  ON coding_problems FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own problems"
  ON coding_problems FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Daily scores policies
CREATE POLICY "Users can view own scores"
  ON daily_scores FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own scores"
  ON daily_scores FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own scores"
  ON daily_scores FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Function to update profile stats
CREATE OR REPLACE FUNCTION update_profile_stats()
RETURNS TRIGGER AS $$
BEGIN
  -- This will be called when daily_scores are updated
  UPDATE profiles
  SET 
    total_score = (SELECT COALESCE(SUM(score), 0) FROM daily_scores WHERE user_id = NEW.user_id),
    updated_at = now()
  WHERE id = NEW.user_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update profile stats
CREATE TRIGGER trigger_update_profile_stats
AFTER INSERT OR UPDATE ON daily_scores
FOR EACH ROW
EXECUTE FUNCTION update_profile_stats();