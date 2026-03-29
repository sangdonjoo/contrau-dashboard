// ─── Farm & Line Structure ───
export interface PhaseInfo {
  phase: "P1" | "P2" | "P3";
  areaHa: number;
  status: "empty" | "stocked" | "complete";
  batchId?: string;
  doc?: number;
  weightG?: number;
  pcsPerKg?: number;
  healthLevel?: 1 | 2 | 3 | 4;
  infraAlert?: boolean;
}

export interface LineInfo {
  id: number;
  name: string;
  farmId: string;
  ponds: PhaseInfo[];
}

export interface FarmInfo {
  farmId: string;
  name: string;
  location: string;
  areaHa: number;
  lines: LineInfo[];
}

// Health Level Logic (placeholder — to be calibrated with real operational data):
// 4 Excellent: ADG >= 0.5 g/day AND gut fullness >= 95%
// 3 Good: ADG >= 0.3 AND gut fullness >= 85%
// 2 Fair: ADG >= 0.15 OR gut fullness >= 70%
// 1 Poor: ADG < 0.15 AND gut fullness < 70%
// Note: These thresholds will be tuned by human factory manager

// ─── Farms (3 farms, 11 lines total) ───
export const farms: FarmInfo[] = [
  {
    farmId: "CM1",
    name: "Ca Mau 1",
    location: "Ca Mau",
    areaHa: 6,
    lines: [
      {
        id: 1,
        name: "Line 1",
        farmId: "CM1",
        ponds: [
          { phase: "P1", areaHa: 0.3, status: "empty" },
          { phase: "P2", areaHa: 1.2, status: "empty" },
          { phase: "P3", areaHa: 1.8, status: "stocked", batchId: "B11", doc: 66, weightG: 17.24, pcsPerKg: 58, healthLevel: 4 },
        ],
      },
    ],
  },
  {
    farmId: "KH1",
    name: "Khanh Hoa 1",
    location: "Khanh Hoa",
    areaHa: 25,
    lines: [
      {
        id: 1,
        name: "Line 1",
        farmId: "KH1",
        ponds: [
          { phase: "P1", areaHa: 0.3, status: "stocked", batchId: "B5", doc: 8, weightG: 0.42, pcsPerKg: 2381, healthLevel: 4 },
          { phase: "P2", areaHa: 1.2, status: "stocked", batchId: "B4", doc: 34, weightG: 6.5, pcsPerKg: 154, healthLevel: 3 },
          { phase: "P3", areaHa: 2.0, status: "stocked", batchId: "B3", doc: 70, weightG: 18.9, pcsPerKg: 53, healthLevel: 4 },
        ],
      },
      {
        id: 2,
        name: "Line 2",
        farmId: "KH1",
        ponds: [
          { phase: "P1", areaHa: 0.3, status: "stocked", batchId: "B3", doc: 5, weightG: 0.18, pcsPerKg: 5556, healthLevel: 3 },
          { phase: "P2", areaHa: 1.0, status: "stocked", batchId: "B2", doc: 28, weightG: 4.8, pcsPerKg: 208, healthLevel: 3 },
          { phase: "P3", areaHa: 1.5, status: "stocked", batchId: "B1", doc: 62, weightG: 15.1, pcsPerKg: 66, healthLevel: 4 },
        ],
      },
      {
        id: 3,
        name: "Line 3",
        farmId: "KH1",
        ponds: [
          { phase: "P1", areaHa: 0.3, status: "empty" },
          { phase: "P2", areaHa: 1.2, status: "stocked", batchId: "B2", doc: 22, weightG: 2.9, pcsPerKg: 345, healthLevel: 3, infraAlert: true },
          { phase: "P3", areaHa: 1.8, status: "stocked", batchId: "B1", doc: 55, weightG: 12.1, pcsPerKg: 83, healthLevel: 3 },
        ],
      },
      {
        id: 4,
        name: "Line 4",
        farmId: "KH1",
        ponds: [
          { phase: "P1", areaHa: 0.3, status: "stocked", batchId: "B4", doc: 10, weightG: 0.65, pcsPerKg: 1538, healthLevel: 4 },
          { phase: "P2", areaHa: 1.2, status: "stocked", batchId: "B3", doc: 36, weightG: 7.2, pcsPerKg: 139, healthLevel: 4 },
          { phase: "P3", areaHa: 2.0, status: "stocked", batchId: "B2", doc: 72, weightG: 19.5, pcsPerKg: 51, healthLevel: 4 },
        ],
      },
    ],
  },
  {
    farmId: "KH2",
    name: "Khanh Hoa 2",
    location: "Khanh Hoa",
    areaHa: 25,
    lines: [
      {
        id: 1,
        name: "Line 1",
        farmId: "KH2",
        ponds: [
          { phase: "P1", areaHa: 0.3, status: "stocked", batchId: "B6", doc: 6, weightG: 0.22, pcsPerKg: 4545, healthLevel: 3 },
          { phase: "P2", areaHa: 1.0, status: "stocked", batchId: "B5", doc: 32, weightG: 5.8, pcsPerKg: 172, healthLevel: 3 },
          { phase: "P3", areaHa: 1.5, status: "stocked", batchId: "B4", doc: 68, weightG: 16.3, pcsPerKg: 61, healthLevel: 4 },
        ],
      },
      {
        id: 2,
        name: "Line 2",
        farmId: "KH2",
        ponds: [
          { phase: "P1", areaHa: 0.3, status: "stocked", batchId: "B3", doc: 4, weightG: 0.14, pcsPerKg: 7143, healthLevel: 3 },
          { phase: "P2", areaHa: 1.0, status: "stocked", batchId: "B2", doc: 25, weightG: 3.6, pcsPerKg: 278, healthLevel: 2 },
          { phase: "P3", areaHa: 1.5, status: "stocked", batchId: "B1", doc: 58, weightG: 13.4, pcsPerKg: 75, healthLevel: 3 },
        ],
      },
      {
        id: 3,
        name: "Line 3",
        farmId: "KH2",
        ponds: [
          { phase: "P1", areaHa: 0.3, status: "empty" },
          { phase: "P2", areaHa: 1.2, status: "stocked", batchId: "B1", doc: 18, weightG: 1.6, pcsPerKg: 625, healthLevel: 2 },
          { phase: "P3", areaHa: 1.8, status: "empty" },
        ],
      },
      {
        id: 4,
        name: "Line 4",
        farmId: "KH2",
        ponds: [
          { phase: "P1", areaHa: 0.3, status: "empty" },
          { phase: "P2", areaHa: 1.2, status: "empty" },
          { phase: "P3", areaHa: 2.0, status: "stocked", batchId: "B2", doc: 45, weightG: 9.6, pcsPerKg: 104, healthLevel: 1 },
        ],
      },
      {
        id: 5,
        name: "Line 5",
        farmId: "KH2",
        ponds: [
          { phase: "P1", areaHa: 0.3, status: "empty" },
          { phase: "P2", areaHa: 1.0, status: "empty" },
          { phase: "P3", areaHa: 1.5, status: "empty" },
        ],
      },
      {
        id: 6,
        name: "Line 6",
        farmId: "KH2",
        ponds: [
          { phase: "P1", areaHa: 0.3, status: "stocked", batchId: "B2", doc: 11, weightG: 0.78, pcsPerKg: 1282, healthLevel: 4 },
          { phase: "P2", areaHa: 1.2, status: "stocked", batchId: "B1", doc: 42, weightG: 8.9, pcsPerKg: 112, healthLevel: 3 },
          { phase: "P3", areaHa: 2.0, status: "empty" },
        ],
      },
    ],
  },
];

// ─── Backward-compatible allLines (derived from farms) ───
export const allLines: LineInfo[] = farms.flatMap((farm) => farm.lines);

// Keep line1Phases for backward compat
export const line1Phases: PhaseInfo[] = farms[0].lines[0].ponds;

// ─── KPI Summary (derived) ───
function computeKpi(lines: LineInfo[]) {
  let totalBiomass = 0;
  let activeBatches = 0;
  for (const line of lines) {
    for (const p of line.ponds) {
      if (p.status === "stocked" && p.weightG) {
        // rough estimate: biomass = weight * density * area
        // Using simplified estimate per pond
        const estimatedTons = (p.weightG * p.areaHa * 50000) / 1_000_000;
        totalBiomass += estimatedTons;
        activeBatches++;
      }
    }
  }
  return {
    totalBiomass: Math.round(totalBiomass * 10) / 10,
    activeBatches,
    avgSurvival: 92,
    nextHarvestDays: 5,
    ytdHarvest: 15,
  };
}

export const kpiSummary = computeKpi(allLines);

export function computeKpiForLines(lines: LineInfo[]) {
  return computeKpi(lines);
}

// ─── Batch B11 (current active — Ca Mau 1, Line 1) ───
export const batchB11 = {
  id: "B11",
  lineId: 1,
  cycleNumber: 11,
  stockingDate: "2026-01-23",
  stockingCount: 2_000_000,
  currentPhase: "P3" as const,
  status: "growing" as const,
  doc: 66,
  targetDoc: 90,
  avgWeightG: 17.24,
  avgLengthCm: 12.69,
  sizePcsPerKg: 58,
  survivalRate: 92.44,
  adg: 0.53,
  outputTons: 34.43,
  revenueVnd: 3.65e9,
  remainingEstimate: 1_849_000,
  fcr: null as number | null,
  uniformity: 85.03,
  cv: 14.97,
  intestineFullness: 98.47,
  ranking: "Top 24%",
};

// ─── Line Batches (phase -> batch mapping for detail page) ───
export interface LineBatchInfo {
  batchCode: string;
  doc: number;
  weight: number;
  pcsPerKg: number;
  status: "active" | "planned" | "complete";
}

export const lineBatches: Record<string, Record<"P1" | "P2" | "P3", LineBatchInfo | null>> = {
  "CM1-1": {
    P1: null,
    P2: null,
    P3: { batchCode: "B11", doc: 66, weight: 17.24, pcsPerKg: 58, status: "active" },
  },
  "KH1-1": {
    P1: { batchCode: "B5", doc: 8, weight: 0.42, pcsPerKg: 2381, status: "active" },
    P2: { batchCode: "B4", doc: 34, weight: 6.5, pcsPerKg: 154, status: "active" },
    P3: { batchCode: "B3", doc: 70, weight: 18.9, pcsPerKg: 53, status: "active" },
  },
  "KH1-2": {
    P1: { batchCode: "B3", doc: 5, weight: 0.18, pcsPerKg: 5556, status: "active" },
    P2: { batchCode: "B2", doc: 28, weight: 4.8, pcsPerKg: 208, status: "active" },
    P3: { batchCode: "B1", doc: 62, weight: 15.1, pcsPerKg: 66, status: "active" },
  },
};

// ─── Phase Navigator (Detail page) ───
export const phaseNavigator = [
  {
    phase: "P1" as const,
    status: "complete" as const,
    entryWeight: 0.01,
    exitWeight: 1.1,
    days: 19,
    entryDate: "2026-01-23",
  },
  {
    phase: "P2" as const,
    status: "complete" as const,
    entryWeight: 1.1,
    exitWeight: 9.8,
    days: 28,
    entryDate: "2026-02-11",
  },
  {
    phase: "P3" as const,
    status: "ongoing" as const,
    entryWeight: 9.8,
    exitWeight: 17.24,
    days: 19,
    entryDate: "2026-03-11",
  },
];

// ─── Growth Curve Data (with ADG on Y2) ───
function generateGrowthData() {
  const measured: { doc: number; weight: number }[] = [];
  const target: { doc: number; weight: number }[] = [];

  for (let d = 0; d <= 90; d++) {
    const tW =
      d <= 19
        ? 0.01 + (1.2 / 19) * d
        : d <= 47
          ? 1.2 + ((10.5 - 1.2) / 28) * (d - 19)
          : 10.5 + ((22 - 10.5) / 43) * (d - 47);
    target.push({ doc: d, weight: Math.round(tW * 100) / 100 });

    if (d <= 66) {
      const mW =
        d <= 19
          ? 0.01 + (1.1 / 19) * d
          : d <= 47
            ? 1.1 + ((9.8 - 1.1) / 28) * (d - 19)
            : 9.8 + ((17.24 - 9.8) / 19) * (d - 47);
      if (d % 3 === 0 || d === 66) {
        const noise = d > 5 ? (Math.sin(d * 0.7) * 0.15) : 0;
        measured.push({ doc: d, weight: Math.round((mW + noise) * 100) / 100 });
      }
    }
  }

  // Compute ADG as 3-day rolling average of daily weight change
  const adg: { doc: number; adg: number }[] = [];
  for (let i = 0; i < measured.length; i++) {
    if (i === 0) {
      adg.push({ doc: measured[i].doc, adg: 0 });
      continue;
    }
    // Collect up to 3 previous deltas for rolling average
    const windowSize = Math.min(i, 3);
    let totalDelta = 0;
    for (let j = i - windowSize; j < i; j++) {
      const docDiff = measured[j + 1].doc - measured[j].doc;
      const weightDiff = measured[j + 1].weight - measured[j].weight;
      totalDelta += docDiff > 0 ? weightDiff / docDiff : 0;
    }
    const avgAdg = totalDelta / windowSize;
    adg.push({ doc: measured[i].doc, adg: Math.round(Math.max(0, avgAdg) * 1000) / 1000 });
  }

  return { measured, target, adg };
}

export const growthData = generateGrowthData();

// ─── Gantt Timeline ───
export interface GanttBatch {
  id: string;
  phases: {
    phase: "P1" | "P2" | "P3";
    startDate: string;
    endDate: string;
    status: "success" | "failed" | "ongoing" | "planned";
  }[];
  failureReason?: string;
  status: "completed" | "failed" | "ongoing" | "planned";
}

export const ganttBatches: GanttBatch[] = [
  {
    id: "B8",
    phases: [
      { phase: "P1", startDate: "2025-08-01", endDate: "2025-08-25", status: "failed" },
    ],
    failureReason: "Machine Failure in P1",
    status: "failed",
  },
  {
    id: "B9",
    phases: [
      { phase: "P1", startDate: "2025-09-10", endDate: "2025-10-01", status: "success" },
      { phase: "P2", startDate: "2025-10-01", endDate: "2025-10-15", status: "failed" },
    ],
    failureReason: "Failed in P2 — Virus outbreak",
    status: "failed",
  },
  {
    id: "B10",
    phases: [
      { phase: "P1", startDate: "2025-10-20", endDate: "2025-11-08", status: "success" },
      { phase: "P2", startDate: "2025-11-08", endDate: "2025-12-05", status: "success" },
      { phase: "P3", startDate: "2025-12-05", endDate: "2025-12-12", status: "failed" },
    ],
    failureReason: "Failed in P3 — Water quality collapse",
    status: "failed",
  },
  {
    id: "B11",
    phases: [
      { phase: "P1", startDate: "2026-01-23", endDate: "2026-02-11", status: "success" },
      { phase: "P2", startDate: "2026-02-11", endDate: "2026-03-11", status: "success" },
      { phase: "P3", startDate: "2026-03-11", endDate: "2026-04-20", status: "ongoing" },
    ],
    status: "ongoing",
  },
  {
    id: "B12",
    phases: [
      { phase: "P1", startDate: "2026-04-06", endDate: "2026-04-26", status: "planned" },
    ],
    status: "planned",
  },
];

// ─── Today's Measurements ───
export const todayMeasurements = [
  { time: "06:00", weight: 17.10, length: 12.6, pcsKg: 59, cv: 15.2, uniformity: 84.8, gut: 97.5, adg: 0.52 },
  { time: "09:00", weight: 17.18, length: 12.65, pcsKg: 58, cv: 15.0, uniformity: 85.0, gut: 98.2, adg: 0.53 },
  { time: "12:00", weight: 17.24, length: 12.69, pcsKg: 58, cv: 14.97, uniformity: 85.03, gut: 98.47, adg: 0.53 },
  { time: "15:00", weight: 17.28, length: 12.71, pcsKg: 57, cv: 14.8, uniformity: 85.2, gut: 98.1, adg: 0.53 },
  { time: "18:00", weight: 17.31, length: 12.73, pcsKg: 57, cv: 14.9, uniformity: 85.1, gut: 97.8, adg: 0.53 },
  { time: "21:00", weight: 17.35, length: 12.75, pcsKg: 57, cv: 14.7, uniformity: 85.3, gut: 96.5, adg: 0.53 },
];

// ─── Tomota Individual Measurement Readings (7 days, ~40 readings, irregular intervals) ───
export interface TomotaReading {
  timestamp: string;    // "2026-03-23 06:32"
  weightG: number;
  lengthCm: number;
  cvPct: number;
  uniformityPct: number;
  gutFullnessPct: number;
  adgGPerDay: number;
}

export const tomotaReadings: TomotaReading[] = [
  // Day 1 — Mar 23 (6 readings)
  { timestamp: "2026-03-23 06:15", weightG: 15.52, lengthCm: 11.82, cvPct: 17.1, uniformityPct: 79.2, gutFullnessPct: 91.4, adgGPerDay: 0.47 },
  { timestamp: "2026-03-23 09:22", weightG: 15.61, lengthCm: 11.87, cvPct: 16.8, uniformityPct: 79.8, gutFullnessPct: 93.6, adgGPerDay: 0.48 },
  { timestamp: "2026-03-23 12:08", weightG: 15.68, lengthCm: 11.91, cvPct: 17.3, uniformityPct: 78.9, gutFullnessPct: 95.2, adgGPerDay: 0.47 },
  { timestamp: "2026-03-23 15:31", weightG: 15.74, lengthCm: 11.95, cvPct: 16.5, uniformityPct: 80.1, gutFullnessPct: 96.4, adgGPerDay: 0.48 },
  { timestamp: "2026-03-23 18:04", weightG: 15.79, lengthCm: 11.98, cvPct: 16.9, uniformityPct: 79.5, gutFullnessPct: 97.1, adgGPerDay: 0.49 },
  { timestamp: "2026-03-23 21:12", weightG: 15.83, lengthCm: 12.01, cvPct: 17.2, uniformityPct: 79.0, gutFullnessPct: 94.8, adgGPerDay: 0.48 },

  // Day 2 — Mar 24 (4 readings, skipped some feedings)
  { timestamp: "2026-03-24 06:44", weightG: 15.94, lengthCm: 12.06, cvPct: 16.4, uniformityPct: 80.3, gutFullnessPct: 92.1, adgGPerDay: 0.49 },
  { timestamp: "2026-03-24 10:17", weightG: 16.05, lengthCm: 12.11, cvPct: 15.9, uniformityPct: 81.0, gutFullnessPct: 95.7, adgGPerDay: 0.50 },
  { timestamp: "2026-03-24 15:52", weightG: 16.13, lengthCm: 12.15, cvPct: 16.2, uniformityPct: 80.6, gutFullnessPct: 97.3, adgGPerDay: 0.50 },
  { timestamp: "2026-03-24 20:38", weightG: 16.19, lengthCm: 12.18, cvPct: 15.7, uniformityPct: 81.4, gutFullnessPct: 95.0, adgGPerDay: 0.51 },

  // Day 3 — Mar 25 (7 readings)
  { timestamp: "2026-03-25 06:05", weightG: 16.28, lengthCm: 12.22, cvPct: 15.8, uniformityPct: 81.7, gutFullnessPct: 91.8, adgGPerDay: 0.50 },
  { timestamp: "2026-03-25 08:50", weightG: 16.33, lengthCm: 12.25, cvPct: 16.1, uniformityPct: 81.2, gutFullnessPct: 93.9, adgGPerDay: 0.51 },
  { timestamp: "2026-03-25 11:28", weightG: 16.39, lengthCm: 12.28, cvPct: 15.5, uniformityPct: 82.1, gutFullnessPct: 96.1, adgGPerDay: 0.51 },
  { timestamp: "2026-03-25 13:47", weightG: 16.43, lengthCm: 12.30, cvPct: 15.3, uniformityPct: 82.5, gutFullnessPct: 97.4, adgGPerDay: 0.52 },
  { timestamp: "2026-03-25 16:19", weightG: 16.48, lengthCm: 12.33, cvPct: 15.6, uniformityPct: 82.0, gutFullnessPct: 98.2, adgGPerDay: 0.51 },
  { timestamp: "2026-03-25 19:03", weightG: 16.52, lengthCm: 12.36, cvPct: 14.9, uniformityPct: 82.8, gutFullnessPct: 97.6, adgGPerDay: 0.52 },
  { timestamp: "2026-03-25 22:11", weightG: 16.55, lengthCm: 12.38, cvPct: 15.2, uniformityPct: 82.3, gutFullnessPct: 95.3, adgGPerDay: 0.52 },

  // Day 4 — Mar 26 (6 readings)
  { timestamp: "2026-03-26 06:31", weightG: 16.63, lengthCm: 12.42, cvPct: 14.8, uniformityPct: 83.1, gutFullnessPct: 92.4, adgGPerDay: 0.52 },
  { timestamp: "2026-03-26 09:14", weightG: 16.69, lengthCm: 12.45, cvPct: 15.0, uniformityPct: 82.9, gutFullnessPct: 94.8, adgGPerDay: 0.53 },
  { timestamp: "2026-03-26 12:44", weightG: 16.74, lengthCm: 12.48, cvPct: 14.6, uniformityPct: 83.5, gutFullnessPct: 96.9, adgGPerDay: 0.53 },
  { timestamp: "2026-03-26 15:22", weightG: 16.79, lengthCm: 12.51, cvPct: 14.9, uniformityPct: 83.0, gutFullnessPct: 98.0, adgGPerDay: 0.52 },
  { timestamp: "2026-03-26 18:57", weightG: 16.83, lengthCm: 12.53, cvPct: 14.4, uniformityPct: 83.8, gutFullnessPct: 97.5, adgGPerDay: 0.53 },
  { timestamp: "2026-03-26 21:35", weightG: 16.87, lengthCm: 12.56, cvPct: 14.7, uniformityPct: 83.2, gutFullnessPct: 95.8, adgGPerDay: 0.53 },

  // Day 5 — Mar 27 (5 readings)
  { timestamp: "2026-03-27 07:08", weightG: 16.94, lengthCm: 12.59, cvPct: 14.3, uniformityPct: 84.0, gutFullnessPct: 93.2, adgGPerDay: 0.53 },
  { timestamp: "2026-03-27 10:42", weightG: 16.99, lengthCm: 12.62, cvPct: 13.9, uniformityPct: 84.5, gutFullnessPct: 96.3, adgGPerDay: 0.54 },
  { timestamp: "2026-03-27 14:15", weightG: 17.04, lengthCm: 12.64, cvPct: 14.1, uniformityPct: 84.2, gutFullnessPct: 97.8, adgGPerDay: 0.53 },
  { timestamp: "2026-03-27 17:53", weightG: 17.08, lengthCm: 12.66, cvPct: 13.8, uniformityPct: 84.7, gutFullnessPct: 98.4, adgGPerDay: 0.54 },
  { timestamp: "2026-03-27 21:27", weightG: 17.11, lengthCm: 12.67, cvPct: 14.0, uniformityPct: 84.3, gutFullnessPct: 96.1, adgGPerDay: 0.53 },

  // Day 6 — Mar 28 (8 readings, extra measurements)
  { timestamp: "2026-03-28 05:48", weightG: 17.14, lengthCm: 12.59, cvPct: 13.7, uniformityPct: 84.8, gutFullnessPct: 88.9, adgGPerDay: 0.53 },
  { timestamp: "2026-03-28 07:22", weightG: 17.16, lengthCm: 12.61, cvPct: 14.2, uniformityPct: 84.4, gutFullnessPct: 92.6, adgGPerDay: 0.54 },
  { timestamp: "2026-03-28 09:51", weightG: 17.19, lengthCm: 12.63, cvPct: 13.5, uniformityPct: 85.1, gutFullnessPct: 95.4, adgGPerDay: 0.54 },
  { timestamp: "2026-03-28 12:17", weightG: 17.22, lengthCm: 12.65, cvPct: 13.8, uniformityPct: 84.9, gutFullnessPct: 97.2, adgGPerDay: 0.53 },
  { timestamp: "2026-03-28 14:33", weightG: 17.24, lengthCm: 12.66, cvPct: 13.6, uniformityPct: 85.3, gutFullnessPct: 97.9, adgGPerDay: 0.54 },
  { timestamp: "2026-03-28 16:58", weightG: 17.26, lengthCm: 12.67, cvPct: 13.4, uniformityPct: 85.5, gutFullnessPct: 98.6, adgGPerDay: 0.54 },
  { timestamp: "2026-03-28 19:41", weightG: 17.28, lengthCm: 12.68, cvPct: 13.7, uniformityPct: 85.2, gutFullnessPct: 97.4, adgGPerDay: 0.53 },
  { timestamp: "2026-03-28 22:05", weightG: 17.30, lengthCm: 12.69, cvPct: 13.9, uniformityPct: 84.8, gutFullnessPct: 95.7, adgGPerDay: 0.54 },

  // Day 7 — Mar 29 today (6 readings)
  { timestamp: "2026-03-29 06:18", weightG: 17.12, lengthCm: 12.60, cvPct: 13.6, uniformityPct: 85.0, gutFullnessPct: 90.3, adgGPerDay: 0.53 },
  { timestamp: "2026-03-29 09:05", weightG: 17.18, lengthCm: 12.63, cvPct: 13.4, uniformityPct: 85.4, gutFullnessPct: 94.7, adgGPerDay: 0.54 },
  { timestamp: "2026-03-29 12:32", weightG: 17.22, lengthCm: 12.66, cvPct: 13.2, uniformityPct: 85.7, gutFullnessPct: 97.1, adgGPerDay: 0.54 },
  { timestamp: "2026-03-29 15:14", weightG: 17.24, lengthCm: 12.68, cvPct: 13.5, uniformityPct: 85.3, gutFullnessPct: 98.1, adgGPerDay: 0.53 },
  { timestamp: "2026-03-29 17:49", weightG: 17.23, lengthCm: 12.68, cvPct: 13.3, uniformityPct: 85.6, gutFullnessPct: 98.5, adgGPerDay: 0.54 },
  { timestamp: "2026-03-29 20:07", weightG: 17.24, lengthCm: 12.69, cvPct: 13.1, uniformityPct: 85.8, gutFullnessPct: 97.8, adgGPerDay: 0.54 },
];

// ─── Legacy 7-Day Measurement Data (kept for backward compat) ───
export interface MeasurementReading {
  date: string;
  time: string;
  weight: number;
  length: number;
  cv: number;
  uniformity: number;
  gut: number;
  adg: number;
}

export interface DailyMeasurementAvg {
  date: string;
  label: string;
  weight: number;
  length: number;
  cv: number;
  uniformity: number;
  gut: number;
  adg: number;
}

function generateMeasurement7d(): { readings: MeasurementReading[]; dailyAvg: DailyMeasurementAvg[] } {
  const readings: MeasurementReading[] = [];
  const dailyAvg: DailyMeasurementAvg[] = [];
  const times = ["06:00", "09:00", "12:00", "15:00", "18:00", "21:00"];

  // Base values at day -6 (DOC 60): shrimp were smaller
  const baseWeight = 14.8;
  const baseLength = 11.8;
  const baseCv = 16.5;
  const baseUniformity = 83.5;
  const baseGut = 95.0;
  const baseAdg = 0.48;

  for (let dayOffset = 6; dayOffset >= 0; dayOffset--) {
    const dayIndex = 6 - dayOffset; // 0..6
    const dateObj = new Date(2026, 2, 23 + dayIndex); // Mar 23..29
    const dateStr = dateObj.toISOString().slice(0, 10);
    const dayLabel = dateObj.toLocaleDateString("en", { month: "short", day: "numeric" });

    // Progressive improvement over 7 days
    const progress = dayIndex / 6;
    const dayWeight = baseWeight + (17.35 - baseWeight) * progress;
    const dayLength = baseLength + (12.75 - baseLength) * progress;
    const dayCv = baseCv + (14.7 - baseCv) * progress;
    const dayUniformity = baseUniformity + (85.3 - baseUniformity) * progress;
    const dayGut = baseGut + (98.0 - baseGut) * progress;
    const dayAdg = baseAdg + (0.53 - baseAdg) * progress;

    let sumW = 0, sumL = 0, sumCv = 0, sumU = 0, sumG = 0, sumA = 0;

    for (let t = 0; t < times.length; t++) {
      // Slight intraday variation + noise
      const intraDayFactor = t / (times.length - 1); // 0..1 through the day
      const noise = Math.sin((dayIndex * 7 + t) * 1.3) * 0.08;

      const w = Math.round((dayWeight + intraDayFactor * 0.25 + noise) * 100) / 100;
      const l = Math.round((dayLength + intraDayFactor * 0.15 + noise * 0.3) * 100) / 100;
      const cv = Math.round((dayCv + (Math.sin((dayIndex + t) * 0.9) * 0.3)) * 100) / 100;
      const u = Math.round((dayUniformity + (Math.sin((dayIndex + t) * 0.9) * -0.3)) * 100) / 100;
      const g = Math.round((dayGut + intraDayFactor * 1.5 - (t === 5 ? 1.5 : 0) + noise * 0.5) * 100) / 100;
      const a = Math.round((dayAdg + noise * 0.02) * 1000) / 1000;

      readings.push({ date: dateStr, time: times[t], weight: w, length: l, cv, uniformity: u, gut: g, adg: a });
      sumW += w; sumL += l; sumCv += cv; sumU += u; sumG += g; sumA += a;
    }

    const n = times.length;
    dailyAvg.push({
      date: dateStr,
      label: dayLabel,
      weight: Math.round((sumW / n) * 100) / 100,
      length: Math.round((sumL / n) * 100) / 100,
      cv: Math.round((sumCv / n) * 100) / 100,
      uniformity: Math.round((sumU / n) * 100) / 100,
      gut: Math.round((sumG / n) * 100) / 100,
      adg: Math.round((sumA / n) * 1000) / 1000,
    });
  }

  return { readings, dailyAvg };
}

export const measurement7d = generateMeasurement7d();

// ─── Water Quality (48h data) ───
// DO safe range: 4.0–10 mg/L  — excursion at hours 30–32 (nighttime dip below 4.0)
// pH safe range: 7.5–8.5      — excursion at hour 20 (algae bloom spike above 8.5)
function generateWaterQuality() {
  const data: {
    time: string;
    ph: number;
    do_mgl: number;
    temp: number;
    tan: number;
    no2: number;
    salinity: number;
  }[] = [];

  const now = new Date("2026-03-29T18:00:00");
  for (let h = 48; h >= 0; h--) {
    const t = new Date(now.getTime() - h * 3600000);
    const hour = t.getHours();
    const dayFactor = Math.sin(((hour - 6) / 24) * Math.PI * 2) * 0.5 + 0.5;

    // DO: normal 5.5–7.5, but dip below 4.0 at hours 30–32 (nighttime oxygen depletion)
    let do_mgl = 5.5 + dayFactor * 2.0 + (Math.sin(h * 0.7) * 0.15);
    if (h >= 30 && h <= 32) {
      // Dip to 3.2–3.8 during this window
      const dipProgress = h === 31 ? 1.0 : 0.6; // deepest at h=31
      do_mgl = 3.8 - dipProgress * 0.6 + (Math.sin(h * 1.3) * 0.1);
    }

    // pH: normal 7.8–8.2, but spike above 8.5 at hour 20 (algae bloom)
    let ph = 7.8 + dayFactor * 0.4 + (Math.sin(h * 0.5) * 0.05);
    if (h === 20) {
      ph = 8.72;
    } else if (h === 21 || h === 19) {
      ph = 8.55 + (Math.sin(h * 0.9) * 0.03);
    }

    data.push({
      time: t.toISOString(),
      ph: Math.round(ph * 100) / 100,
      do_mgl: Math.round(do_mgl * 100) / 100,
      temp: Math.round((29.0 + dayFactor * 2.0 + (Math.sin(h * 0.8) * 0.15)) * 100) / 100,
      tan: Math.round((0.15 + Math.sin(h * 0.4) * 0.04) * 1000) / 1000,
      no2: Math.round((0.08 + Math.sin(h * 0.6) * 0.02) * 1000) / 1000,
      salinity: Math.round((20 + Math.sin(h * 0.3) * 0.5) * 100) / 100,
    });
  }
  return data;
}

export const waterQualityData = generateWaterQuality();

export const waterQualityRanges = {
  ph: { min: 7.5, max: 8.5, critLow: 7.0, critHigh: 9.0, label: "pH", unit: "" },
  do_mgl: { min: 4.0, max: 10, critLow: 3.0, critHigh: 12, label: "DO", unit: "mg/L" },
  temp: { min: 28, max: 32, critLow: 26, critHigh: 34, label: "Temp", unit: "\u00B0C" },
  tan: { min: 0, max: 0.5, critLow: 0, critHigh: 1.0, label: "TAN", unit: "mg/L" },
  no2: { min: 0, max: 0.3, critLow: 0, critHigh: 0.5, label: "NO2", unit: "mg/L" },
  salinity: { min: 15, max: 25, critLow: 10, critHigh: 35, label: "Salinity", unit: "ppt" },
};

// ─── Infrastructure Status ───
export const infraStatus = [
  {
    device: "Power Grid",
    icon: "zap",
    status: "ONLINE" as const,
    color: "green" as const,
    detail: "Stable for 72h",
  },
  {
    device: "Generator",
    icon: "battery",
    status: "STANDBY" as const,
    color: "green" as const,
    detail: "Last test: 2d ago",
  },
  {
    device: "Air Blower",
    icon: "wind",
    status: "RUNNING" as const,
    color: "green" as const,
    detail: "Current: 12.4A",
  },
];

// ─── Feeding Summary (last 7 days) ───
export const feedingData = [
  { day: "Mar 23", amount: 1380 },
  { day: "Mar 24", amount: 1405 },
  { day: "Mar 25", amount: 1420 },
  { day: "Mar 26", amount: 1435 },
  { day: "Mar 27", amount: 1440 },
  { day: "Mar 28", amount: 1445 },
  { day: "Mar 29", amount: 1448 },
];

// ─── Batch Scoreboard ───
export const batchScoreboard = [
  { label: "Stocking", value: "2,000,000", sub: "pcs" },
  { label: "Remaining", value: "~1,849,000", sub: "est." },
  { label: "Survival", value: "92.4%", sub: "rate" },
  { label: "Size", value: "58", sub: "pcs/kg" },
  { label: "Biomass", value: "34.4", sub: "tons" },
  { label: "FCR", value: "---", sub: "pending" },
  { label: "ADG", value: "0.53", sub: "g/day" },
  { label: "Revenue", value: "3.65B", sub: "VND" },
  { label: "Uniformity", value: "85.03%", sub: "" },
  { label: "CV", value: "14.97%", sub: "" },
  { label: "Gut Full", value: "98.47%", sub: "" },
  { label: "Ranking", value: "Top 24%", sub: "#2812" },
];
