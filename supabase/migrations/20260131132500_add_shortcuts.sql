/*
  # Add Shortcuts Feature

  ## Changes
  
  ### `shortcuts` Table
  - `title` (text) - Display name
  - `type` (text) - 'url' or 'file'
  - `value` (text) - The URL or Storage Path
  - `file_type` (text) - MIME type or extension for icon usage

  ## Storage
  - Create a new storage bucket 'shortcuts'
*/

-- Create shortcuts table
CREATE TABLE IF NOT EXISTS shortcuts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  title text NOT NULL,
  type text NOT NULL CHECK (type IN ('url', 'file')),
  value text NOT NULL,
  file_type text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE shortcuts ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid errors during re-runs
DROP POLICY IF EXISTS "Users can view own shortcuts" ON shortcuts;
DROP POLICY IF EXISTS "Users can insert own shortcuts" ON shortcuts;
DROP POLICY IF EXISTS "Users can delete own shortcuts" ON shortcuts;

-- Policies
CREATE POLICY "Users can view own shortcuts"
  ON shortcuts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own shortcuts"
  ON shortcuts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own shortcuts"
  ON shortcuts FOR DELETE
  USING (auth.uid() = user_id);

-- Create storage bucket for shortcut files
INSERT INTO storage.buckets (id, name, public)
VALUES ('shortcuts', 'shortcuts', true)
ON CONFLICT (id) DO NOTHING;

-- Storage Policies
-- Drop existing storage policies
DROP POLICY IF EXISTS "Public Access Shortcuts" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload shortcuts" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own shortcuts files" ON storage.objects;

CREATE POLICY "Public Access Shortcuts"
ON storage.objects FOR SELECT
USING ( bucket_id = 'shortcuts' );

CREATE POLICY "Authenticated users can upload shortcuts"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'shortcuts' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can delete own shortcuts files"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'shortcuts' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
