-- =============================================================================
-- 002_notes_table.sql
-- Contrau Dashboard — 경영 노트 테이블
-- 실행 위치: Supabase Dashboard > SQL Editor
-- 작성일: 2026-04-06
-- =============================================================================

-- -----------------------------------------------------------------------------
-- notes
--   경영 노트 — publish-note 스킬이 INSERT, 대시보드가 SELECT
--   원본(SSOT): contrau-ssot/01_company/01_raw/notes/NOTE-YYYYMMDD-NNN.md
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS notes (
  id          TEXT PRIMARY KEY,         -- 'NOTE-20260406-001'
  title       TEXT NOT NULL,            -- 원문 제목
  title_en    TEXT NOT NULL DEFAULT '', -- 영어 제목
  author      TEXT NOT NULL,            -- 'Sangdon'
  readers     TEXT NOT NULL DEFAULT 'all', -- 'all' | 'L2+' | '[Sangdon, Jihyun]'
  lang        TEXT NOT NULL DEFAULT 'ko', -- 원문 언어: ko | en | vi
  tags        TEXT[] NOT NULL DEFAULT '{}',
  content_en  TEXT NOT NULL DEFAULT '',
  content_ko  TEXT NOT NULL DEFAULT '',
  content_vi  TEXT NOT NULL DEFAULT '',
  created_at  DATE NOT NULL,
  inserted_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notes_created ON notes (created_at DESC);

ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anon read" ON notes
  FOR SELECT USING (true);

CREATE POLICY "Allow service insert" ON notes
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow service update" ON notes
  FOR UPDATE USING (true);
