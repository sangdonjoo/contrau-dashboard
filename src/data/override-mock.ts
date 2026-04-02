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
    title: "Production 도메인 파운딩 인터뷰 — Solagron 공장/공정/스케일",
    description: "Tra Vinh MicroAlgae Factory(Solagron) 생산 공정 전반: 20개 연못, Staircase→VBF→Spray Dryer 체인, 일일 15-20m³/연못 목표, Spirulina paste(15% DM) + powder(95% DM) 제품 구조.",
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
    title: "투자실사 1차 — 신태호 대표 DD 질의 7건 대응",
    description: "GNT JV SHA 날인 임박(Con Trau 55%/Ali 40%/GNT 5%), Phase 1 200톤 USD 2.4M, Phase 2 150톤 USD 800K. GNT 콜옵션 4주년 후 EBIT×9배. 회사 전반 법무·생산·재무 현황 종합 진술.",
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
    title: "Production Round 2 — 운영 심층 (수율, 품질, 장비)",
    description: "1차 파운딩 인터뷰 후속. 생산 수치, 품질 관리, 수율 최적화, 장비 상태 등 운영 디테일 심층 인터뷰.",
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
    title: "4월 Solagron 월간플랜 — Spray Dryer 가동 + 수출 첫 선적",
    description: "과거실적: 3월 paste 12톤 생산, powder 시운전 완료. 이번달: COGS 350M VND, CAPEX Spray Dryer 필터 교체 80M. 목표: powder 첫 수출 2톤.",
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
    title: "4월 새우 월간플랜 — Phase 2 양식 시작 + 3ha 추가 준비",
    description: "과거실적: 3월 P1 수확 4.2톤(ASP 180K/kg). 이번달: P2 투입 6ha, 사료비 420M VND. CAPEX: 에어레이터 12대 교체 150M. 목표: 생존율 75% 이상.",
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
    title: "4월 BSFL 월간플랜 — 파일럿 2차 사이클 데이터 수집",
    description: "과거실적: 3월 파일럿 1차 완료(10kg 유충 수확). 이번달: 2차 사이클 20kg 목표, 사료 배합 최적화. CAPEX 없음. 목표: FCR 1.5 이하 달성.",
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
    title: "Solagron 최근 2년 회계 데이터 AI 인터뷰 수행",
    description: "AI+Supabase로 런칭된 회계 시스템에서 최근 2년간 데이터에 대해 AI가 한줄한줄 설명 요구하면 다 답변하는 인터뷰 수행. 모든 항목에 대해 설명 완료가 목표.",
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
    title: "전 자회사 Q1 법무 문서 현행화 점검",
    description: "3개 자회사(Shrimp/Microalgae/BSF) + BMD + HQ의 Q1 법무 문서(계약서, 허가증, 라이선스) 만료/갱신 현황을 Legal Index와 대조 점검.",
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
    title: "People 도메인 66명 roster 검증 + Level 재배정",
    description: "people.db 66명 로스터에 대해 현재 재직 여부, 직급 변동, Level(1-5) 정확성을 HR 담당자와 함께 검증. 퇴직자 비활성화 처리.",
    status: "in_progress",
    progress: 72,
    createdAt: "2026-03-30",
    filePath: "07_context-override/pull-task/cards/TK-20260330-001.md",
  },
];

// Status display helpers
export const ddStatusMap: Record<string, { label: string; color: string }> = {
  pending: { label: "대기 중", color: "bg-gray-100 text-gray-600" },
  in_progress: { label: "작성 중", color: "bg-blue-50 text-blue-700" },
  submitted: { label: "제출됨", color: "bg-green-50 text-green-700" },
};

export const mpStatusMap: Record<string, { label: string; color: string }> = {
  ai_draft: { label: "AI 초안", color: "bg-gray-100 text-gray-600" },
  pl_review: { label: "PL 검토 중", color: "bg-blue-50 text-blue-700" },
  pl_confirmed: { label: "PL 확인", color: "bg-blue-100 text-blue-800" },
  ceo_review: { label: "대표 검토 중", color: "bg-yellow-50 text-yellow-700" },
  ceo_feedback: { label: "대표 피드백", color: "bg-orange-50 text-orange-700" },
  final: { label: "최종안", color: "bg-purple-50 text-purple-700" },
  confirmed: { label: "확정", color: "bg-green-50 text-green-700" },
};

export const tkStatusMap: Record<string, { label: string; color: string }> = {
  pending: { label: "대기 중", color: "bg-gray-100 text-gray-600" },
  in_progress: { label: "진행 중", color: "bg-blue-50 text-blue-700" },
  completed: { label: "완료", color: "bg-green-50 text-green-700" },
};
