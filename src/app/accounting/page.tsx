import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contrau — Accounting",
  description: "Accounting domain — MISA integration and financial analytics",
};

export default function AccountingPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-12 text-center">
        <p className="text-sm text-gray-400">Accounting dashboard — Supabase + AI 연동 구축 중</p>
      </div>
    </div>
  );
}
