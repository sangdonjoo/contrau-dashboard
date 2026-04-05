-- =============================================================================
-- 001_contribution_tables.sql
-- Contrau Dashboard — Contribution 관련 테이블 초기 DDL
-- 실행 위치: Supabase Dashboard > SQL Editor
-- 작성일: 2026-04-05
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. people_alias
--    sender 원본값 → person_id 매핑 테이블
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS people_alias (
  id               SERIAL PRIMARY KEY,
  person_id        TEXT NOT NULL,          -- 'sangdon', 'charlie' 등 내부 식별자
  alias_type       TEXT NOT NULL,          -- 'zalo_name' | 'swit_name' | 'git_email' | 'gmail_from'
  alias_value      TEXT NOT NULL,          -- R0에 등장하는 sender name 원본
  alias_normalized TEXT NOT NULL,          -- diacritic 제거 + lowercase
  confirmed        BOOLEAN DEFAULT false,
  UNIQUE (alias_type, alias_value)
);

ALTER TABLE people_alias ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anon read" ON people_alias
  FOR SELECT USING (true);

CREATE POLICY "Allow anon insert" ON people_alias
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow anon update" ON people_alias
  FOR UPDATE USING (true);


-- -----------------------------------------------------------------------------
-- 2. contribution_events
--    개별 기여 이벤트 원장 — 파이프라인이 INSERT, 집계 스크립트가 UPDATE
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS contribution_events (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  person_id       TEXT NOT NULL,
  event_date      DATE NOT NULL,
  channel         TEXT NOT NULL,          -- 'zalo' | 'swit' | 'gmail' | 'deepdive' | 'production' | 'git'
  source_file     TEXT NOT NULL,
  source_room     TEXT,
  sender_raw      TEXT NOT NULL,
  message_len     INTEGER NOT NULL DEFAULT 0,
  message_preview TEXT,
  impact_level    TEXT NOT NULL DEFAULT 'D',
    -- 'R1_HIGHLIGHT' | 'R1_SECTION' | 'W_SURVIVE' | 'M_SURVIVE' | 'Q_SURVIVE'
    -- | 'MSG' | 'MSG_SHORT' | 'GIT'
  base_score      REAL NOT NULL DEFAULT 1.0,
  channel_weight  REAL NOT NULL DEFAULT 1.0,
  dup_rank        INTEGER,
  dup_decay       REAL NOT NULL DEFAULT 1.0,
  promoted_to_r1  BOOLEAN NOT NULL DEFAULT false,
  wmq_survival    TEXT,                   -- null | 'W' | 'M' | 'Q' (가장 높은 생존 레벨)
  wmq_multiplier  REAL NOT NULL DEFAULT 1.0,  -- W=2.0, M=3.0, Q=5.0
  r1_item_id      TEXT,
  final_score     REAL GENERATED ALWAYS AS (
                    base_score * channel_weight * dup_decay * wmq_multiplier
                  ) STORED,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ce_person_date ON contribution_events (person_id, event_date);
CREATE INDEX IF NOT EXISTS idx_ce_date        ON contribution_events (event_date DESC);

ALTER TABLE contribution_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anon read" ON contribution_events
  FOR SELECT USING (true);

CREATE POLICY "Allow anon insert" ON contribution_events
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow anon update" ON contribution_events
  FOR UPDATE USING (true);


-- -----------------------------------------------------------------------------
-- 3. contribution_daily
--    일별 person 집계 — 집계 스크립트가 UPSERT
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS contribution_daily (
  person_id         TEXT NOT NULL,
  score_date        DATE NOT NULL,
  event_count       INTEGER NOT NULL DEFAULT 0,
  promoted_count    INTEGER NOT NULL DEFAULT 0,
  sum_final_score   REAL NOT NULL DEFAULT 0,
  streak_days       INTEGER NOT NULL DEFAULT 0,
  frequency_bonus   REAL NOT NULL DEFAULT 0,  -- sum_final_score * 0.5 (연속 기여 시)
  total_score       REAL GENERATED ALWAYS AS (sum_final_score + frequency_bonus) STORED,
  channel_breakdown JSONB NOT NULL DEFAULT '{}',
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (person_id, score_date)
);

CREATE INDEX IF NOT EXISTS idx_cd_date ON contribution_daily (score_date DESC);

ALTER TABLE contribution_daily ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anon read" ON contribution_daily
  FOR SELECT USING (true);

CREATE POLICY "Allow anon insert" ON contribution_daily
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow anon update" ON contribution_daily
  FOR UPDATE USING (true);

CREATE POLICY "Allow anon delete" ON contribution_daily
  FOR DELETE USING (true);


-- -----------------------------------------------------------------------------
-- 4. contribution_rankings
--    대시보드 소비용 집계 스냅샷 — 집계 스크립트가 UPSERT
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS contribution_rankings (
  person_id          TEXT PRIMARY KEY,
  name_en            TEXT,
  name_ko            TEXT,
  score_7d           REAL NOT NULL DEFAULT 0,
  score_30d          REAL NOT NULL DEFAULT 0,
  rank_7d            INTEGER,
  rank_30d           INTEGER,
  event_count_7d     INTEGER NOT NULL DEFAULT 0,
  event_count_30d    INTEGER NOT NULL DEFAULT 0,
  promoted_count_7d  INTEGER NOT NULL DEFAULT 0,
  promoted_count_30d INTEGER NOT NULL DEFAULT 0,
  top_channel_7d     TEXT,
  streak_days        INTEGER NOT NULL DEFAULT 0,
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE contribution_rankings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anon read" ON contribution_rankings
  FOR SELECT USING (true);

CREATE POLICY "Allow anon insert" ON contribution_rankings
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow anon update" ON contribution_rankings
  FOR UPDATE USING (true);

CREATE POLICY "Allow anon delete" ON contribution_rankings
  FOR DELETE USING (true);
