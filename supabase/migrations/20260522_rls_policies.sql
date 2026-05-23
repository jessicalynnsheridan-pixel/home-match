-- ── Row Level Security for the leads table ────────────────────────────────
-- Run this in Supabase dashboard → SQL Editor.
-- This ensures realtors can only see and edit their own leads.

-- Enable RLS on the leads table (if not already enabled)
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- Realtors can only SELECT their own leads
CREATE POLICY "Realtors can read own leads"
  ON leads FOR SELECT
  USING (auth.uid() = realtor_id);

-- Realtors can only UPDATE their own leads
CREATE POLICY "Realtors can update own leads"
  ON leads FOR UPDATE
  USING (auth.uid() = realtor_id);

-- Anyone can INSERT a lead (buyers submitting questionnaire use anon key)
-- The realtor_id is set at insert time from the ?r= param
CREATE POLICY "Anyone can insert leads"
  ON leads FOR INSERT
  WITH CHECK (true);

-- Only the realtor who owns a lead can delete it
CREATE POLICY "Realtors can delete own leads"
  ON leads FOR DELETE
  USING (auth.uid() = realtor_id);


-- ── showing_requests table ─────────────────────────────────────────────────
ALTER TABLE showing_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Realtors can read own showing requests"
  ON showing_requests FOR SELECT
  USING (auth.uid() = realtor_id);

CREATE POLICY "Realtors can update own showing requests"
  ON showing_requests FOR UPDATE
  USING (auth.uid() = realtor_id);

CREATE POLICY "Anyone can insert showing requests"
  ON showing_requests FOR INSERT
  WITH CHECK (true);
