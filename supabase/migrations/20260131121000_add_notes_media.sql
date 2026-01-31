/*
  # Add Media Support to Study Notes

  ## Changes
  
  ### `study_notes` Table
  - Add `media_url` (text, optional) - URL to the stored file
  - Add `media_type` (text, optional) - MIME type of the file (e.g., 'application/pdf', 'image/png')
  - Add `media_name` (text, optional) - Original filename

  ## Storage
  - Create a new storage bucket 'study-materials'
  - Enable public access for viewing
  - Add RLS policies for upload/delete
*/

-- Add columns to study_notes
ALTER TABLE study_notes 
ADD COLUMN IF NOT EXISTS media_url text,
ADD COLUMN IF NOT EXISTS media_type text,
ADD COLUMN IF NOT EXISTS media_name text;

-- Create storage bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('study-materials', 'study-materials', true)
ON CONFLICT (id) DO NOTHING;

-- Storage Policies

-- Allow public access to view files (authenticated users only strictly, but public bucket makes it easier for UI)
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'study-materials' );

-- Allow authenticated users to upload files
CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'study-materials' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to update their own files
CREATE POLICY "Users can update own files"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'study-materials' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to delete their own files
CREATE POLICY "Users can delete own files"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'study-materials' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
