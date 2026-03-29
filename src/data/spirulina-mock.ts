// ─── Spirulina Factory & Pond Interfaces ───

export interface Factory {
  id: string;
  name: string;
  location: string;
  zones: Zone[];
}

export interface Zone {
  id: string;
  label: string;
  ponds: Pond[];
  gridRow: number;
  gridCol: number;
}

export interface Pond {
  id: string;
  zoneId: string;
  areaM2: number;
  status: "active" | "inactive" | "pending";
  od: number | null;
  harvestPlanTomorrow: boolean;
  lastHarvestDate: string | null;
}

// ─── Daily Harvest Data ───
export interface DailyHarvest {
  date: string;
  harvestKg: number;
  avgColorIndex: number;
}

// ─── Monthly Harvest Data (for 12-month chart) ───
export interface MonthlyHarvest {
  month: string;
  harvestKg: number;
  avgColorIndex: number;
}

// ─── Environment Data ───
export interface EnvironmentData {
  month: string;
  tempC: number;
  sunlightHrs: number;
  rainfallMm: number;
  tempPct: number;
  sunlightPct: number;
  rainfallPct: number;
}

// ─── Operation Queue ───
export type OperationStage = "harvest" | "filtering" | "vbf" | "drying" | "return" | "completed";

export interface OperationCard {
  pondId: string;
  stage: OperationStage;
  startedAt: string;
  harvestKg?: number;
  note?: string;
  active: boolean; // true = currently being processed in this stage
}

// ─── Inventory ───
export interface Chemical {
  id: string;
  name: string;
  unit: string;
  peakCapacity: number;
  currentStock: number;
  todayPlannedUsage: number;
  reorderThreshold: number;
}

// ─── Output / QC ───
export interface SmallBag {
  lotNumber: string;
  date: string;
  weightKg: number;
  colorIndex: number | null;
  bigBagId?: string;
}

export interface BigBag {
  id: string;
  componentLots: string[];
  totalWeightKg: number;
  blendedColorIndex: number | null;
  status: "filling" | "pending_ci" | "measured";
  createdDate: string;
}

// ─── OD Color Helper ───
export function getOdColor(od: number | null): string {
  if (od === null || od < 0.5) return "#e5e7eb";
  if (od >= 1.5) return "#166534";
  if (od >= 1.0) return "#22c55e";
  return "#86efac";
}

export function getOdLabel(od: number | null): string {
  if (od === null) return "No data";
  if (od >= 1.5) return "Harvest Ready";
  if (od >= 1.0) return "Growing";
  if (od >= 0.5) return "Recovering";
  return "Low";
}

// ─── CI Color Helper ───
export function getCiColor(ci: number | null): string {
  if (ci === null) return "#9ca3af"; // grey
  if (ci >= 720) return "#2563eb"; // blue (excellent — bonus)
  if (ci >= 600) return "#93c5fd"; // light blue (export spec met)
  return "#eab308"; // yellow (below spec — can blend to meet 600 avg)
}

export function getCiBgClass(ci: number | null): string {
  if (ci === null) return "bg-gray-200 text-gray-500"; // grey — CI not yet submitted
  if (ci >= 720) return "bg-blue-100 text-blue-800 border-blue-400"; // blue — excellent
  if (ci >= 600) return "bg-blue-50 text-blue-700 border-blue-300"; // light blue — export spec
  return "bg-yellow-100 text-yellow-800 border-yellow-400"; // yellow — below spec
}

// ─── Mock Data: Factories ───

const traVinhPonds: Pond[] = [
  // RWP4 — 4 ponds, varying area
  { id: "RWP4-01", zoneId: "RWP4", areaM2: 840, status: "active", od: 1.6, harvestPlanTomorrow: true, lastHarvestDate: "2026-03-27" },
  { id: "RWP4-02", zoneId: "RWP4", areaM2: 920, status: "active", od: 1.2, harvestPlanTomorrow: false, lastHarvestDate: "2026-03-25" },
  { id: "RWP4-03", zoneId: "RWP4", areaM2: 1000, status: "active", od: 0.8, harvestPlanTomorrow: false, lastHarvestDate: "2026-03-20" },
  { id: "RWP4-04", zoneId: "RWP4", areaM2: 1080, status: "active", od: 1.8, harvestPlanTomorrow: true, lastHarvestDate: "2026-03-28" },
  // RWP5 — 4 ponds, 1500m2 each
  { id: "RWP5-01", zoneId: "RWP5", areaM2: 1500, status: "active", od: 1.1, harvestPlanTomorrow: false, lastHarvestDate: "2026-03-26" },
  { id: "RWP5-02", zoneId: "RWP5", areaM2: 1500, status: "active", od: 1.5, harvestPlanTomorrow: true, lastHarvestDate: "2026-03-27" },
  { id: "RWP5-03", zoneId: "RWP5", areaM2: 1500, status: "active", od: 0.4, harvestPlanTomorrow: false, lastHarvestDate: "2026-03-15" },
  { id: "RWP5-04", zoneId: "RWP5", areaM2: 1500, status: "active", od: 1.3, harvestPlanTomorrow: false, lastHarvestDate: "2026-03-24" },
  // RWP6 — 4 ponds, 1500m2 each
  { id: "RWP6-13", zoneId: "RWP6", areaM2: 1500, status: "active", od: 0.9, harvestPlanTomorrow: false, lastHarvestDate: "2026-03-22" },
  { id: "RWP6-14", zoneId: "RWP6", areaM2: 1500, status: "active", od: 1.7, harvestPlanTomorrow: true, lastHarvestDate: "2026-03-28" },
  { id: "RWP6-15", zoneId: "RWP6", areaM2: 1500, status: "active", od: 1.0, harvestPlanTomorrow: false, lastHarvestDate: "2026-03-21" },
  { id: "RWP6-16", zoneId: "RWP6", areaM2: 1500, status: "active", od: 0.6, harvestPlanTomorrow: false, lastHarvestDate: "2026-03-18" },
  // RWP7 — 12 ponds: 01-04 active, 05-08 pending, 09-12 active
  { id: "RWP7-01", zoneId: "RWP7", areaM2: 1500, status: "active", od: 1.4, harvestPlanTomorrow: false, lastHarvestDate: "2026-03-26" },
  { id: "RWP7-02", zoneId: "RWP7", areaM2: 1500, status: "active", od: 0.7, harvestPlanTomorrow: false, lastHarvestDate: "2026-03-19" },
  { id: "RWP7-03", zoneId: "RWP7", areaM2: 1500, status: "active", od: 1.9, harvestPlanTomorrow: true, lastHarvestDate: "2026-03-28" },
  { id: "RWP7-04", zoneId: "RWP7", areaM2: 1500, status: "active", od: 1.1, harvestPlanTomorrow: false, lastHarvestDate: "2026-03-23" },
  { id: "RWP7-05", zoneId: "RWP7", areaM2: 1500, status: "pending", od: null, harvestPlanTomorrow: false, lastHarvestDate: null },
  { id: "RWP7-06", zoneId: "RWP7", areaM2: 1500, status: "pending", od: null, harvestPlanTomorrow: false, lastHarvestDate: null },
  { id: "RWP7-07", zoneId: "RWP7", areaM2: 1500, status: "pending", od: null, harvestPlanTomorrow: false, lastHarvestDate: null },
  { id: "RWP7-08", zoneId: "RWP7", areaM2: 1500, status: "pending", od: null, harvestPlanTomorrow: false, lastHarvestDate: null },
  { id: "RWP7-09", zoneId: "RWP7", areaM2: 1500, status: "active", od: 1.2, harvestPlanTomorrow: false, lastHarvestDate: "2026-03-25" },
  { id: "RWP7-10", zoneId: "RWP7", areaM2: 1500, status: "active", od: 0.9, harvestPlanTomorrow: false, lastHarvestDate: "2026-03-22" },
  { id: "RWP7-11", zoneId: "RWP7", areaM2: 1500, status: "active", od: 1.6, harvestPlanTomorrow: true, lastHarvestDate: "2026-03-27" },
  { id: "RWP7-12", zoneId: "RWP7", areaM2: 1500, status: "active", od: 1.3, harvestPlanTomorrow: false, lastHarvestDate: "2026-03-24" },
];

export const factories: Factory[] = [
  {
    id: "TV1",
    name: "Tra Vinh 1",
    location: "Tra Vinh, Vietnam",
    zones: [
      {
        id: "RWP4",
        label: "RWP4",
        gridRow: 1,
        gridCol: 1,
        ponds: traVinhPonds.filter((p) => p.zoneId === "RWP4"),
      },
      {
        id: "RWP5",
        label: "RWP5",
        gridRow: 2,
        gridCol: 1,
        ponds: traVinhPonds.filter((p) => p.zoneId === "RWP5"),
      },
      {
        id: "RWP6",
        label: "RWP6",
        gridRow: 2,
        gridCol: 2,
        ponds: traVinhPonds.filter((p) => p.zoneId === "RWP6"),
      },
      {
        id: "RWP7",
        label: "RWP7",
        gridRow: 3,
        gridCol: 1,
        ponds: traVinhPonds.filter((p) => p.zoneId === "RWP7"),
      },
    ],
  },
  {
    id: "NT2",
    name: "Ninh Thuan 2",
    location: "Ninh Thuan, Vietnam",
    zones: [],
  },
];

// ─── Mock Data: Daily Harvest (365 days, Apr 2025 – Mar 2026) ───
// 19 active ponds × ~10 kg/pond/day avg = ~190 kg/day baseline
// Seasonal variation: dry season (Nov-Apr) higher, rainy season (Jun-Oct) lower
function generateDailyHarvest(): DailyHarvest[] {
  const data: DailyHarvest[] = [];
  const start = new Date("2025-04-01");
  // Monthly baseline harvest kg (19 ponds, varies by season)
  const monthlyBase: Record<number, number> = {
    4: 190, 5: 185, 6: 170, 7: 155, 8: 145, 9: 150,
    10: 165, 11: 185, 12: 200, 1: 205, 2: 200, 3: 195,
  };
  // Monthly baseline color index
  const monthlyCI: Record<number, number> = {
    4: 690, 5: 695, 6: 680, 7: 665, 8: 655, 9: 660,
    10: 695, 11: 710, 12: 720, 1: 725, 2: 718, 3: 712,
  };
  // Simple seeded pseudo-random for reproducibility
  let seed = 42;
  function rand() {
    seed = (seed * 1664525 + 1013904223) & 0x7fffffff;
    return seed / 0x7fffffff;
  }

  for (let i = 0; i < 365; i++) {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    const month = d.getMonth() + 1;
    const base = monthlyBase[month] ?? 190;
    const ciBase = monthlyCI[month] ?? 700;
    // Daily noise: ±30 kg around monthly base
    const harvestKg = Math.round(base + (rand() - 0.5) * 60);
    // CI noise: ±20 around monthly base
    const avgColorIndex = Math.round(ciBase + (rand() - 0.5) * 40);
    data.push({
      date: d.toISOString().slice(0, 10),
      harvestKg: Math.max(100, harvestKg),
      avgColorIndex: Math.min(780, Math.max(620, avgColorIndex)),
    });
  }
  return data;
}

export const dailyHarvest: DailyHarvest[] = generateDailyHarvest();

// ─── Mock Data: Environment (12 months, Tra Vinh tropical) ───
// Temp: 26-35C, Sunlight: 4-9 hrs/day, Rainfall: 5-350 mm/month
const envRaw = [
  { month: "2025-04", tempC: 33, sunlightHrs: 8.5, rainfallMm: 45 },
  { month: "2025-05", tempC: 32, sunlightHrs: 7.0, rainfallMm: 120 },
  { month: "2025-06", tempC: 30, sunlightHrs: 5.5, rainfallMm: 220 },
  { month: "2025-07", tempC: 29, sunlightHrs: 5.0, rainfallMm: 280 },
  { month: "2025-08", tempC: 29, sunlightHrs: 4.5, rainfallMm: 310 },
  { month: "2025-09", tempC: 28, sunlightHrs: 4.8, rainfallMm: 350 },
  { month: "2025-10", tempC: 29, sunlightHrs: 5.5, rainfallMm: 260 },
  { month: "2025-11", tempC: 30, sunlightHrs: 7.0, rainfallMm: 110 },
  { month: "2025-12", tempC: 31, sunlightHrs: 8.0, rainfallMm: 30 },
  { month: "2026-01", tempC: 32, sunlightHrs: 8.5, rainfallMm: 15 },
  { month: "2026-02", tempC: 33, sunlightHrs: 9.0, rainfallMm: 10 },
  { month: "2026-03", tempC: 34, sunlightHrs: 8.8, rainfallMm: 25 },
];

// Normalize to 0-100% scale
const tempMin = 26, tempMax = 36;
const sunMin = 3, sunMax = 10;
const rainMin = 0, rainMax = 400;

export const environmentData: EnvironmentData[] = envRaw.map((d) => ({
  ...d,
  tempPct: Math.round(((d.tempC - tempMin) / (tempMax - tempMin)) * 100),
  sunlightPct: Math.round(((d.sunlightHrs - sunMin) / (sunMax - sunMin)) * 100),
  rainfallPct: Math.round(((d.rainfallMm - rainMin) / (rainMax - rainMin)) * 100),
}));

// ─── Mock Data: Operation Queue ───
export const operationCards: OperationCard[] = [
  // Harvest backlog — 10 ponds queued for today's harvest, 1 active (currently being harvested)
  { pondId: "RWP7-02", stage: "harvest", startedAt: "09:30", harvestKg: 115, active: true },
  { pondId: "RWP7-09", stage: "harvest", startedAt: "-", active: false },
  { pondId: "RWP7-10", stage: "harvest", startedAt: "-", active: false },
  { pondId: "RWP7-11", stage: "harvest", startedAt: "-", active: false },
  { pondId: "RWP5-04", stage: "harvest", startedAt: "-", active: false },
  { pondId: "RWP6-13", stage: "harvest", startedAt: "-", active: false },
  { pondId: "RWP6-16", stage: "harvest", startedAt: "-", active: false },
  { pondId: "RWP4-03", stage: "harvest", startedAt: "-", active: false },
  { pondId: "RWP7-12", stage: "harvest", startedAt: "-", active: false },
  { pondId: "RWP4-02", stage: "harvest", startedAt: "-", active: false },
  // Filtering — always 1 card, active (previous harvest now filtering)
  { pondId: "RWP5-02", stage: "filtering", startedAt: "09:00", harvestKg: 95, active: true },
  // VBF — always 1 card, active
  { pondId: "RWP4-04", stage: "vbf", startedAt: "08:15", harvestKg: 85, active: true },
  // Drying — multiple cards (chilling tank buffer), first-in is active (FIFO)
  { pondId: "RWP6-14", stage: "drying", startedAt: "05:00", harvestKg: 110, active: true },  // first in = active
  { pondId: "RWP7-03", stage: "drying", startedAt: "06:00", harvestKg: 130, active: false },
  { pondId: "RWP4-01", stage: "drying", startedAt: "07:00", harvestKg: 120, active: false },
  // Return — 1 card active (currently pumping water back to this pond)
  { pondId: "RWP7-01", stage: "return", startedAt: "08:30", harvestKg: 105, active: true },
  // Completed — all inactive (return finished)
  { pondId: "RWP5-01", stage: "completed", startedAt: "03:00", harvestKg: 90, active: false },
  { pondId: "RWP6-15", stage: "completed", startedAt: "04:00", harvestKg: 100, active: false },
  { pondId: "RWP7-04", stage: "completed", startedAt: "05:00", harvestKg: 108, active: false },
];

export const operationStages: { key: OperationStage; label: string }[] = [
  { key: "harvest", label: "Harvest" },
  { key: "filtering", label: "Filtering" },
  { key: "vbf", label: "VBF" },
  { key: "drying", label: "Drying" },
  { key: "return", label: "Return" },
  { key: "completed", label: "Completed" },
];

// ─── Mock Data: Chemicals ───
export const chemicals: Chemical[] = [
  { id: "nahco3", name: "NaHCO3", unit: "kg", peakCapacity: 1000, currentStock: 800, todayPlannedUsage: 120, reorderThreshold: 200 },
  { id: "urea", name: "Urea", unit: "kg", peakCapacity: 1000, currentStock: 180, todayPlannedUsage: 80, reorderThreshold: 250 },
  { id: "feso4", name: "FeSO4", unit: "kg", peakCapacity: 500, currentStock: 420, todayPlannedUsage: 15, reorderThreshold: 80 },
  { id: "npk", name: "NPK 16-16-8", unit: "kg", peakCapacity: 800, currentStock: 550, todayPlannedUsage: 60, reorderThreshold: 150 },
  { id: "naoh", name: "NaOH", unit: "kg", peakCapacity: 300, currentStock: 210, todayPlannedUsage: 25, reorderThreshold: 50 },
  { id: "mgso4", name: "MgSO4", unit: "kg", peakCapacity: 400, currentStock: 90, todayPlannedUsage: 30, reorderThreshold: 100 },
  { id: "cacl2", name: "CaCl2", unit: "kg", peakCapacity: 300, currentStock: 260, todayPlannedUsage: 20, reorderThreshold: 60 },
  { id: "edta", name: "EDTA", unit: "kg", peakCapacity: 200, currentStock: 150, todayPlannedUsage: 10, reorderThreshold: 40 },
  { id: "chlorine", name: "Chlorine", unit: "L", peakCapacity: 500, currentStock: 350, todayPlannedUsage: 40, reorderThreshold: 100 },
  { id: "citric", name: "Citric Acid", unit: "kg", peakCapacity: 200, currentStock: 45, todayPlannedUsage: 15, reorderThreshold: 50 },
];

// ─── Mock Data: Small Bags (7 days rolling) ───
function generateSmallBags(): SmallBag[] {
  const bags: SmallBag[] = [];
  const baseDate = new Date("2026-03-23");
  let counter = 1;
  for (let day = 0; day < 7; day++) {
    const date = new Date(baseDate);
    date.setDate(date.getDate() + day);
    const dateStr = date.toISOString().slice(0, 10);
    const bagsPerDay = 3 + Math.floor(Math.random() * 3); // 3-5 bags
    for (let b = 0; b < bagsPerDay; b++) {
      const lot = `TV1-${dateStr.replace(/-/g, "")}-${String(counter).padStart(2, "0")}`;
      const hasCi = Math.random() > 0.15;
      bags.push({
        lotNumber: lot,
        date: dateStr,
        weightKg: +(24.5 + Math.random() * 1).toFixed(1),
        colorIndex: hasCi ? Math.round(580 + Math.random() * 180) : null,
      });
      counter++;
    }
  }
  return bags;
}

export const smallBags: SmallBag[] = generateSmallBags();

// ─── Mock Data: Big Bags ───
export const bigBags: BigBag[] = [
  {
    id: "BB-001",
    componentLots: smallBags.slice(0, 5).map((b) => b.lotNumber),
    totalWeightKg: 500,
    blendedColorIndex: 710,
    status: "measured",
    createdDate: "2026-03-25",
  },
  {
    id: "BB-002",
    componentLots: smallBags.slice(5, 10).map((b) => b.lotNumber),
    totalWeightKg: 487,
    blendedColorIndex: null,
    status: "pending_ci",
    createdDate: "2026-03-27",
  },
  {
    id: "BB-003",
    componentLots: smallBags.slice(10, 15).map((b) => b.lotNumber),
    totalWeightKg: 500,
    blendedColorIndex: 740,
    status: "measured",
    createdDate: "2026-03-28",
  },
  {
    id: "BB-004",
    componentLots: smallBags.slice(15, 19).map((b) => b.lotNumber),
    totalWeightKg: 375,
    blendedColorIndex: null,
    status: "filling",
    createdDate: "2026-03-29",
  },
];
