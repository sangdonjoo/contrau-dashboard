// Mock data for Override page — Deep Dive, Monthly Plan, Special Task

export type TicketStatus = "pending" | "in_progress" | "submitted" | "draft" | "reviewing" | "confirmed" | "completed";

export interface DeepDive {
  id: string;
  issuedBy: string;
  issuedByLevel: number;
  interviewee: string;
  intervieweeLevel: number;
  title: string;
  description: string;
  status: "pending" | "in_progress" | "submitted";
  domain: string;
  createdAt: string;
  filePath: string;
}

export interface MonthlyPlan {
  id: string;
  project: string;
  projectLabel: string;
  period: string;
  plName: string;
  plLevel: number;
  title: string;
  description: string;
  status: "ai_draft" | "pl_review" | "pl_confirmed" | "ceo_review" | "ceo_feedback" | "final" | "confirmed";
  version: string;
  createdAt: string;
  filePath: string;
}

export interface SpecialTask {
  id: string;
  issuedBy: string;
  issuedByLevel: number;
  assignee: string;
  assigneeLevel: number;
  title: string;
  description: string;
  status: "pending" | "in_progress" | "completed";
  progress: number; // 0-100
  createdAt: string;
  filePath: string;
}

// --- Real Deep Dive data from SSOT ---
export const deepDives: DeepDive[] = [
  {
    id: "DD-20260319-001",
    issuedBy: "Sangdon",
    issuedByLevel: 1,
    interviewee: "Sangdon (as Charlie)",
    intervieweeLevel: 1,
    title: "Production Domain Founding Interview — Solagron Factory / Process / Scale",
    description: "Tra Vinh MicroAlgae Factory (Solagron) full production overview: 20 ponds, Staircase→VBF→Spray Dryer chain, daily 15-20m³/pond target, Spirulina paste (15% DM) + powder (95% DM) product structure.",
    status: "submitted",
    domain: "production",
    createdAt: "2026-03-19",
    filePath: "07_context-override/pull-interview/interviews/DD-20260319-001.md",
  },
  {
    id: "DD-20260327-001",
    issuedBy: "Sangdon",
    issuedByLevel: 1,
    interviewee: "Sangdon",
    intervieweeLevel: 1,
    title: "Investor DD Round 1 — Response to 7 Queries from Shin Tae-ho",
    description: "GNT JV SHA signing imminent (Con Trau 55%/Ali 40%/GNT 5%), Phase 1 200t USD 2.4M, Phase 2 150t USD 800K. GNT call option after year 4 at EBIT×9. Comprehensive statement on legal, production, and financials.",
    status: "submitted",
    domain: "company, legal, production",
    createdAt: "2026-03-27",
    filePath: "07_context-override/pull-interview/interviews/DD-20260327-001.md",
  },
  {
    id: "DD-20260327-002",
    issuedBy: "Sangdon",
    issuedByLevel: 1,
    interviewee: "Charlie",
    intervieweeLevel: 3,
    title: "Production Round 2 — Deep Ops (yield, quality, equipment)",
    description: "Follow-up to the founding interview. In-depth interview on production figures, quality control, yield optimization, and equipment condition.",
    status: "in_progress",
    domain: "production",
    createdAt: "2026-03-27",
    filePath: "07_context-override/pull-interview/interviews/DD-20260327-002.md",
  },
];

// --- Mock Monthly Plan data ---
export const monthlyPlans: MonthlyPlan[] = [
  {
    id: "MP-202604-solagron",
    project: "solagron",
    projectLabel: "Solagron (Microalgae)",
    period: "2026-04",
    plName: "Charlie",
    plLevel: 3,
    title: "Apr Solagron Monthly Plan — Spray Dryer Operation + First Export Shipment",
    description: "Past: Mar paste 12t produced, powder trial run complete. This month: COGS 350M VND, CAPEX Spray Dryer filter replacement 80M. Target: first powder export 2t.",
    status: "pl_review",
    version: "v1 (AI draft)",
    createdAt: "2026-04-01",
    filePath: "07_context-override/monthly-plan/2026-04/solagron_2026-04.md",
  },
  {
    id: "MP-202604-shrimp",
    project: "shrimp",
    projectLabel: "Shrimp (Ca Mau)",
    period: "2026-04",
    plName: "Quynh",
    plLevel: 3,
    title: "Apr Shrimp Monthly Plan — Phase 2 Farming Start + 3ha Expansion Prep",
    description: "Past: Mar P1 harvest 4.2t (ASP 180K/kg). This month: P2 stock 6ha, feed cost 420M VND. CAPEX: aerator ×12 replacement 150M. Target: survival rate ≥75%.",
    status: "ai_draft",
    version: "v1 (AI draft)",
    createdAt: "2026-04-01",
    filePath: "07_context-override/monthly-plan/2026-04/shrimp_2026-04.md",
  },
  {
    id: "MP-202604-bsfl",
    project: "bsfl",
    projectLabel: "BSFL",
    period: "2026-04",
    plName: "Youngin",
    plLevel: 3,
    title: "Apr BSFL Monthly Plan — Pilot Cycle 2 Data Collection",
    description: "Past: Mar pilot cycle 1 complete (10kg larvae harvested). This month: cycle 2 target 20kg, feed formula optimization. No CAPEX. Target: FCR ≤1.5.",
    status: "ceo_review",
    version: "v2 (PL confirmed)",
    createdAt: "2026-03-28",
    filePath: "07_context-override/monthly-plan/2026-04/bsfl_2026-04.md",
  },
];

// --- Mock Special Task data ---
export const specialTasks: SpecialTask[] = [
  {
    id: "TK-20260401-001",
    issuedBy: "Sangdon",
    issuedByLevel: 1,
    assignee: "Youngin",
    assigneeLevel: 3,
    title: "Solagron 2-Year Accounting Data AI Interview",
    description: "Conduct an AI interview on the accounting system (AI+Supabase) covering the last 2 years of data, answering every line-by-line query from the AI. Goal: complete explanation of all entries.",
    status: "in_progress",
    progress: 35,
    createdAt: "2026-04-01",
    filePath: "07_context-override/pull-task/cards/TK-20260401-001.md",
  },
  {
    id: "TK-20260401-002",
    issuedBy: "Sangdon",
    issuedByLevel: 1,
    assignee: "Nhi",
    assigneeLevel: 2,
    title: "All Subsidiaries Q1 Legal Document Currency Check",
    description: "Review Q1 legal documents (contracts, permits, licenses) across 3 subsidiaries (Shrimp/Microalgae/BSF) + BMD + HQ against the Legal Index for expiry and renewal status.",
    status: "pending",
    progress: 0,
    createdAt: "2026-04-02",
    filePath: "07_context-override/pull-task/cards/TK-20260401-002.md",
  },
  {
    id: "TK-20260330-001",
    issuedBy: "Sangdon",
    issuedByLevel: 1,
    assignee: "Vicky",
    assigneeLevel: 2,
    title: "People Domain 66-Person Roster Verification + Level Reassignment",
    description: "Verify all 66 roster entries in people.db: current employment status, position changes, and Level (1–5) accuracy with HR. Deactivate resigned employees.",
    status: "in_progress",
    progress: 72,
    createdAt: "2026-03-30",
    filePath: "07_context-override/pull-task/cards/TK-20260330-001.md",
  },
];

// Status display helpers
export const ddStatusMap: Record<string, { label: string; color: string }> = {
  pending: { label: "Pending", color: "bg-gray-100 text-gray-600" },
  in_progress: { label: "In Progress", color: "bg-yellow-50 text-yellow-700" },
  submitted: { label: "Submitted", color: "bg-green-50 text-green-700" },
  closed: { label: "Completed", color: "bg-green-50 text-green-700" },
};

export const mpStatusMap: Record<string, { label: string; color: string }> = {
  ai_draft: { label: "AI Draft", color: "bg-gray-100 text-gray-600" },
  pl_review: { label: "PL Review", color: "bg-blue-50 text-blue-700" },
  pl_confirmed: { label: "PL Confirmed", color: "bg-blue-100 text-blue-800" },
  ceo_review: { label: "CEO Review", color: "bg-yellow-50 text-yellow-700" },
  ceo_feedback: { label: "CEO Feedback", color: "bg-orange-50 text-orange-700" },
  final: { label: "Final Draft", color: "bg-purple-50 text-purple-700" },
  confirmed: { label: "Confirmed", color: "bg-green-50 text-green-700" },
};

export const tkStatusMap: Record<string, { label: string; color: string }> = {
  pending: { label: "Pending", color: "bg-gray-100 text-gray-600" },
  in_progress: { label: "In Progress", color: "bg-blue-50 text-blue-700" },
  completed: { label: "Completed", color: "bg-green-50 text-green-700" },
};
