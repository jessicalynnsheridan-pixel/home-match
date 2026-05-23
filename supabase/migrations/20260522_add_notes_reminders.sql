-- Add realtor_notes and reminders columns to the leads table.
-- Run this in the Supabase dashboard → SQL Editor.

ALTER TABLE leads
  ADD COLUMN IF NOT EXISTS realtor_notes jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS reminders     jsonb NOT NULL DEFAULT '[]'::jsonb;
