/*
  # Add Web Development and Notes Sections

  ## New Tables
  
  ### `web_projects`
  - `id` (uuid, primary key)
  - `user_id` (uuid, references profiles)
  - `project_name` (text)
  - `description` (text, optional)
  - `tech_stack` (text, optional)
  - `repo_url` (text, optional)
  - `demo_url` (text, optional)
  - `status` (text) - Planned, In Progress, Completed
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### `study_notes`
  - `id` (uuid, primary key)
  - `user_id` (uuid, references profiles)
  - `title` (text)
  - `content` (text)
  - `category` (text) - e.g., React, TypeScript, CSS
  - `tags` (text[], optional)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ## Security
  - Enable RLS on all tables
  - Users can only access their own data
*/

-- Create web_projects table
CREATE TABLE IF NOT EXISTS web_projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  project_name text NOT NULL,
  description text,
  tech_stack text,
  repo_url text,
  demo_url text,
  status text DEFAULT 'Planned',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create study_notes table
CREATE TABLE IF NOT EXISTS study_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  content text NOT NULL,
  category text DEFAULT 'General',
  tags text[],
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_web_projects_user ON web_projects(user_id);
CREATE INDEX IF NOT EXISTS idx_study_notes_user ON study_notes(user_id);

-- Enable RLS
ALTER TABLE web_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_notes ENABLE ROW LEVEL SECURITY;

-- Web Projects policies
CREATE POLICY "Users can view own projects"
  ON web_projects FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own projects"
  ON web_projects FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own projects"
  ON web_projects FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own projects"
  ON web_projects FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Study Notes policies
CREATE POLICY "Users can view own notes"
  ON study_notes FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own notes"
  ON study_notes FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own notes"
  ON study_notes FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own notes"
  ON study_notes FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
