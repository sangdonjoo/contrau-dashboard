// DB Status mock data — Tra Vinh Spirulina Factory data collection status

export interface DataEntry {
  id: string;
  label: string;
  frequency: string; // e.g. "2x/day", "1x/day", "per drum"
  // last 5 days: true = collected, false = missing
  last5: boolean[];
}

export interface DataGroup {
  id: string;
  teamName: string;
  responsible: string;
  role: string;
  entries: DataEntry[];
}

// Deterministic pattern generator
function pattern(seed: number): boolean[] {
  const patterns: boolean[][] = [
    [true, true, true, true, true],
    [true, true, true, true, false],
    [true, true, false, true, true],
    [true, true, true, false, true],
    [false, true, true, true, true],
    [true, false, true, true, true],
    [true, true, true, true, true],
    [true, true, false, false, true],
  ];
  return patterns[seed % patterns.length];
}

// Vietnam timezone: last 5 days labels
export function getLast5Dates(): string[] {
  const dates: string[] = [];
  const now = new Date();
  now.setHours(now.getHours() + 7);
  for (let i = 5; i >= 1; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    dates.push(`${d.getMonth() + 1}/${d.getDate()}`);
  }
  return dates;
}

export const dataGroups: DataGroup[] = [
  {
    id: "cultivation",
    teamName: "Cultivation Team",
    responsible: "Na",
    role: "Pond Supervisor",
    entries: [
      { id: "od-am", label: "OD (Morning)", frequency: "1x/day", last5: pattern(0) },
      { id: "od-pm", label: "OD (Evening)", frequency: "1x/day", last5: pattern(1) },
      { id: "depth", label: "Water Depth", frequency: "1x/day", last5: pattern(0) },
      { id: "flow", label: "Flow Speed", frequency: "1x/day", last5: pattern(2) },
      { id: "leak", label: "Leakage Check", frequency: "1x/day", last5: pattern(0) },
      { id: "nutrition", label: "Nutrition Feeding", frequency: "per event", last5: pattern(3) },
    ],
  },
  {
    id: "harvest",
    teamName: "Harvest Team",
    responsible: "Dien",
    role: "Harvest Lead",
    entries: [
      { id: "harvest-vol", label: "Harvest Volume (m³)", frequency: "1x/day", last5: pattern(0) },
      { id: "harvest-time", label: "Harvest Start/End Time", frequency: "1x/day", last5: pattern(4) },
      { id: "staircase", label: "Staircase Pre-filter Log", frequency: "1x/day", last5: pattern(0) },
      { id: "water-add", label: "Water Addition Record", frequency: "per event", last5: pattern(1) },
    ],
  },
  {
    id: "qc",
    teamName: "Quality Control",
    responsible: "Ngan",
    role: "QC Lead",
    entries: [
      { id: "od-check", label: "OD Lab Verification", frequency: "1x/day", last5: pattern(0) },
      { id: "paste-ci-1", label: "Paste Color Index (08:00)", frequency: "1x/day", last5: pattern(0) },
      { id: "paste-ci-2", label: "Paste Color Index (12:00)", frequency: "1x/day", last5: pattern(5) },
      { id: "paste-ci-3", label: "Paste Color Index (16:00)", frequency: "1x/day", last5: pattern(1) },
      { id: "paste-moisture", label: "Paste Moisture (%DM)", frequency: "1x/day", last5: pattern(0) },
      { id: "weekly-report", label: "Weekly Quality Report", frequency: "1x/week", last5: [true, false, false, false, false] },
    ],
  },
  {
    id: "drying",
    teamName: "Drying Team",
    responsible: "Linh",
    role: "Drying Shift Lead",
    entries: [
      { id: "drum-count", label: "Drum Count (25kg)", frequency: "per shift", last5: pattern(0) },
      { id: "powder-output", label: "Powder Output (kg)", frequency: "1x/day", last5: pattern(3) },
      { id: "powder-ci", label: "Powder Color Index (per drum)", frequency: "per drum", last5: pattern(2) },
      { id: "dryer-temp", label: "Spray Dryer Inlet/Outlet Temp", frequency: "per shift", last5: pattern(0) },
      { id: "dryer-runtime", label: "Dryer Run Time (hrs)", frequency: "1x/day", last5: pattern(0) },
    ],
  },
  {
    id: "vbf",
    teamName: "VBF (Dewatering)",
    responsible: "Say",
    role: "VBF Operator",
    entries: [
      { id: "vbf-input", label: "VBF Input Volume (m³)", frequency: "1x/day", last5: pattern(0) },
      { id: "vbf-output", label: "Paste Output (kg)", frequency: "1x/day", last5: pattern(1) },
      { id: "vbf-dm", label: "Paste DM% (target 15%)", frequency: "1x/day", last5: pattern(0) },
      { id: "vbf-runtime", label: "VBF Run Time (hrs)", frequency: "1x/day", last5: pattern(5) },
    ],
  },
  {
    id: "environment",
    teamName: "Environment Sensors",
    responsible: "Con",
    role: "Technical Lead",
    entries: [
      { id: "solar", label: "Solar Radiation", frequency: "1x/day", last5: pattern(0) },
      { id: "rainfall", label: "Rainfall (mm)", frequency: "1x/day", last5: pattern(0) },
      { id: "air-temp-am", label: "Air Temp (Morning)", frequency: "1x/day", last5: pattern(0) },
      { id: "air-temp-pm", label: "Air Temp (Afternoon)", frequency: "1x/day", last5: pattern(4) },
      { id: "water-temp-am", label: "Water Temp (Morning)", frequency: "1x/day", last5: pattern(0) },
      { id: "water-temp-pm", label: "Water Temp (Afternoon)", frequency: "1x/day", last5: pattern(1) },
    ],
  },
  {
    id: "technical",
    teamName: "Technical / Maintenance",
    responsible: "Khang",
    role: "Maintenance Lead",
    entries: [
      { id: "equip-status", label: "Equipment Status Check", frequency: "1x/day", last5: pattern(0) },
      { id: "aerator", label: "Aerator Operation Log", frequency: "1x/day", last5: pattern(3) },
      { id: "pump-log", label: "Pump Run Log", frequency: "1x/day", last5: pattern(7) },
      { id: "deviation", label: "Deviation / Incident Report", frequency: "per event", last5: [false, false, true, false, false] },
    ],
  },
  {
    id: "accounting",
    teamName: "Factory Accounting",
    responsible: "Giau",
    role: "Accounting Lead",
    entries: [
      { id: "daily-cost", label: "Daily Cost Record", frequency: "1x/day", last5: pattern(0) },
      { id: "material-in", label: "Material Purchase Log", frequency: "per event", last5: pattern(5) },
      { id: "shipment", label: "Product Shipment Log", frequency: "per event", last5: [true, false, true, false, true] },
    ],
  },
];
