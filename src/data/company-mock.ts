// Mock data for Company domain dashboard

// --- Pipeline Status ---
export type PipelineStage = "R0" | "R1" | "W" | "M" | "Q" | "Snapshot";
export type StageStatus = "green" | "yellow" | "red";

export interface DayStatus {
  date: string;
  status: StageStatus;
  reason?: string;
}

export interface PipelineStageInfo {
  stage: PipelineStage;
  status: StageStatus;
  reason?: string;
  days?: DayStatus[]; // R0/R1/Snapshot: 5-day individual dots
}

// Vietnam timezone helper: "yesterday" = today VN - 1
function vnYesterday(daysAgo = 1): string {
  const d = new Date();
  d.setHours(d.getHours() + 7); // UTC → VN
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().slice(0, 10);
}

function lastMonday(): string {
  const d = new Date();
  d.setHours(d.getHours() + 7);
  const day = d.getDay();
  const diff = day === 0 ? 6 : day - 1;
  d.setDate(d.getDate() - diff - 7); // last week Monday
  return d.toISOString().slice(0, 10);
}

export const pipelineDates = {
  r0: [vnYesterday(1), vnYesterday(2), vnYesterday(3), vnYesterday(4), vnYesterday(5)],
  r1: [vnYesterday(1), vnYesterday(2), vnYesterday(3), vnYesterday(4), vnYesterday(5)],
  w: lastMonday(),
  m: (() => {
    const d = new Date();
    d.setHours(d.getHours() + 7);
    d.setDate(1);
    d.setMonth(d.getMonth() - 1);
    return d.toISOString().slice(0, 7);
  })(),
  q: (() => {
    const d = new Date();
    d.setHours(d.getHours() + 7);
    const currentQ = Math.floor(d.getMonth() / 3);
    const prevQ = currentQ === 0 ? 3 : currentQ - 1;
    const year = currentQ === 0 ? d.getFullYear() - 1 : d.getFullYear();
    return `${year}-Q${prevQ + 1}`;
  })(),
  snapshot: [vnYesterday(1), vnYesterday(2), vnYesterday(3), vnYesterday(4), vnYesterday(5)],
};

export const pipelineStatus: PipelineStageInfo[] = [
  {
    stage: "R0",
    status: "red",
    days: [
      { date: vnYesterday(1), status: "green" },
      { date: vnYesterday(2), status: "green" },
      { date: vnYesterday(3), status: "green" },
      { date: vnYesterday(4), status: "red", reason: "Swit R0 수집 누락 — API 타임아웃" },
      { date: vnYesterday(5), status: "green" },
    ],
  },
  {
    stage: "R1",
    status: "yellow",
    days: [
      { date: vnYesterday(1), status: "green" },
      { date: vnYesterday(2), status: "green" },
      { date: vnYesterday(3), status: "yellow", reason: "PI:LOW_CONFIDENCE 태그 2건 — 현장 맥락 불충분" },
      { date: vnYesterday(4), status: "red", reason: "R1 미생성 — R0 수집 장애 연계" },
      { date: vnYesterday(5), status: "green" },
    ],
  },
  { stage: "W", status: "yellow", reason: "W 생성 완료, Follow-up 2건 PI:LOW_CONFIDENCE 태그" },
  { stage: "M", status: "green" },
  { stage: "Q", status: "red", reason: "2026-Q1 Q 리포트 미생성 — W 4건 중 3건만 확보" },
  {
    stage: "Snapshot",
    status: "yellow",
    days: [
      { date: vnYesterday(1), status: "yellow", reason: "생산 도메인 데이터 지연 (2일)" },
      { date: vnYesterday(2), status: "green" },
      { date: vnYesterday(3), status: "green" },
      { date: vnYesterday(4), status: "red", reason: "Snapshot 미생성 — 스케줄러 오류" },
      { date: vnYesterday(5), status: "green" },
    ],
  },
];

// --- Chart 1: Daily message KB by source (30 days) ---
export interface DailySourceKB {
  date: string;
  zalo: number;
  swit: number;
  email: number;
  // cumulative for stacked lines
  zaloStack: number;
  switStack: number;
  emailStack: number;
}

// --- Chart 2: Daily message KB by company (30 days) ---
export interface DailyCompanyKB {
  date: string;
  hq: number;
  shrimp: number;
  bsfl: number;
  microalgae: number;
  bmd: number;
  // cumulative stacked
  hqStack: number;
  shrimpStack: number;
  bsflStack: number;
  microalgaeStack: number;
  bmdStack: number;
}

// Deterministic pseudo-random
function seededRand(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function generateDailySourceData(): DailySourceKB[] {
  const rand = seededRand(42);
  const data: DailySourceKB[] = [];
  const now = new Date();
  now.setHours(now.getHours() + 7);

  for (let i = 30; i >= 1; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const date = d.toISOString().slice(0, 10);
    const dow = d.getDay(); // 0=Sun

    // Weekend has less messages
    const weekendFactor = (dow === 0 || dow === 6) ? 0.3 : 1;

    const zalo = Math.round((80 + rand() * 120) * weekendFactor);
    const swit = Math.round((30 + rand() * 70) * weekendFactor);
    const email = Math.round((5 + rand() * 25) * weekendFactor);

    data.push({
      date,
      zalo,
      swit,
      email,
      zaloStack: zalo,
      switStack: zalo + swit,
      emailStack: zalo + swit + email,
    });
  }
  return data;
}

function generateDailyCompanyData(): DailyCompanyKB[] {
  const rand = seededRand(77);
  const data: DailyCompanyKB[] = [];
  const now = new Date();
  now.setHours(now.getHours() + 7);

  for (let i = 30; i >= 1; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const date = d.toISOString().slice(0, 10);
    const dow = d.getDay();
    const wf = (dow === 0 || dow === 6) ? 0.3 : 1;

    const hq = Math.round((40 + rand() * 40) * wf);
    const shrimp = Math.round((30 + rand() * 30) * wf);
    const bsfl = Math.round((20 + rand() * 30) * wf);
    const microalgae = Math.round((15 + rand() * 25) * wf);
    const bmd = Math.round((10 + rand() * 20) * wf);

    data.push({
      date,
      hq, shrimp, bsfl, microalgae, bmd,
      hqStack: hq,
      shrimpStack: hq + shrimp,
      bsflStack: hq + shrimp + bsfl,
      microalgaeStack: hq + shrimp + bsfl + microalgae,
      bmdStack: hq + shrimp + bsfl + microalgae + bmd,
    });
  }
  return data;
}

export const dailySourceData = generateDailySourceData();
export const dailyCompanyData = generateDailyCompanyData();
