import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contrau — People",
  description: "People domain — organizational structure and HR analytics",
};

export default function PeoplePage() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <header className="mb-5">
        <h1 className="text-xl font-bold text-gray-900">People</h1>
        <p className="text-xs text-gray-400 mt-0.5">
          조직 구조 · 인사 분석 · People Level 1-5 관리
        </p>
      </header>
      <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-12 text-center">
        <p className="text-sm text-gray-400">Coming soon — people.db 66명 로스터 연동 예정</p>
      </div>
    </div>
  );
}
