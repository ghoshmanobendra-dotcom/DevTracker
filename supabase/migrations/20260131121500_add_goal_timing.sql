/*
  # Add Goal Time Tracking and Recurrence

  ## Changes
  
  ### `daily_goals` Table Updates
  - `is_recurring` (boolean, default false) - If true, this goal repeats daily
  - `duration_minutes` (integer, default 0) - Required duration in minutes
  - `started_at` (timestamptz, nullable) - When the user started the timer

  ## Functions
  - `manage_recurring_goals(user_uuid)` - param-based function to copy recurring goals from previous day to today if missing.
*/

-- Add columns to daily_goals
ALTER TABLE daily_goals 
ADD COLUMN IF NOT EXISTS is_recurring boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS duration_minutes integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS started_at timestamptz;

-- Function to check and create recurring goals for today
CREATE OR REPLACE FUNCTION manage_recurring_goals(user_uuid uuid)
RETURNS void AS $$
DECLARE
  yesterday date;
  today_date date;
BEGIN
  today_date := CURRENT_DATE;
  
  -- Find the most recent date the user had goals (broad check, but simple optimization is just looking at yesterday or distinct dates)
  -- For simplicity in this logical block, we check goals from the immediate past that are recurring.
  
  INSERT INTO daily_goals (user_id, title, category, points, is_recurring, duration_minutes, date)
  SELECT 
    user_uuid,
    dg.title,
    dg.category,
    dg.points,
    true,
    dg.duration_minutes,
    today_date
  FROM daily_goals dg
  WHERE dg.user_id = user_uuid
    AND dg.is_recurring = true
    AND dg.date = (today_date - INTERVAL '1 day')::date
    AND NOT EXISTS (
      SELECT 1 FROM daily_goals existing
      WHERE existing.user_id = user_uuid
        AND existing.date = today_date
        AND existing.title = dg.title
    );
END;
$$ LANGUAGE plpgsql;
