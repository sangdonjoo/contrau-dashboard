-- ============================================================
-- misa_companies RLS
-- Owner: Sangdon Joo (sangdonjoo@contrau.ventures)
-- Changes require service_role key (Supabase Dashboard access).
-- Run once in Supabase SQL Editor.
-- ============================================================

ALTER TABLE misa_companies ENABLE ROW LEVEL SECURITY;

-- Anyone can read
CREATE POLICY "misa_companies_read"
  ON misa_companies FOR SELECT
  USING (true);

-- Only service_role (admin) can write
-- service_role bypasses RLS automatically — no anon/authenticated writes allowed.
-- Revoke direct write from authenticated role just in case:
REVOKE INSERT, UPDATE, DELETE ON misa_companies FROM authenticated;
REVOKE INSERT, UPDATE, DELETE ON misa_companies FROM anon;
