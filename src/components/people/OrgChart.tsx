"use client";

import { useEffect, useState } from "react";
import type { OrgChartResponse, OrgCompany } from "@/app/api/people/orgchart/route";

const LEVEL_STYLE: Record<number, { bg: string; text: string; label: string }> = {
  1: { bg: "bg-purple-100", text: "text-purple-700", label: "CEO" },
  2: { bg: "bg-blue-100",   text: "text-blue-700",   label: "Director" },
  3: { bg: "bg-emerald-100",text: "text-emerald-700", label: "Lead" },
  4: { bg: "bg-gray-100",   text: "text-gray-600",   label: "Staff" },
  5: { bg: "bg-gray-50",    text: "text-gray-400",   label: "Team" },
};

function CompanyCard({ company }: { company: OrgCompany }) {
  const grouped: Record<number, typeof company.people> = {};
  for (const p of company.people) {
    if (!grouped[p.level]) grouped[p.level] = [];
    grouped[p.level].push(p);
  }
  const levels = Object.keys(grouped).map(Number).sort();

  return (
    <div className="space-y-3">
      {levels.map(level => {
        const style = LEVEL_STYLE[level] ?? LEVEL_STYLE[5];
        const people = grouped[level];
        return (
          <div key={level}>
            <p className={`text-[10px] font-semibold uppercase tracking-wider mb-1.5 ${style.text}`}>
              {style.label} · L{level}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {people.map(p => (
                <div
                  key={p.name}
                  className={`rounded-lg px-2.5 py-1.5 ${style.bg}`}
                >
                  <p className={`text-xs font-medium ${style.text}`}>{p.name}</p>
                  {p.role && (
                    <p className="text-[10px] text-gray-400 mt-0.5">{p.role}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function OrgChart() {
  const [data, setData] = useState<OrgChartResponse | null>(null);
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    fetch("/api/people/orgchart")
      .then(r => r.json())
      .then(setData)
      .catch(() => {});
  }, []);

  if (!data?.available || !data.companies.length) return null;

  const total = data.companies.length;
  const company = data.companies[idx];

  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm px-5 py-4 h-full">
      {/* 헤더 + 화살표 */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-xs text-gray-400 font-medium">Org Chart</p>
          <h3 className="text-base font-bold text-gray-900">{company.name}</h3>
          <p className="text-[10px] text-gray-400">{company.people.length} members</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIdx((idx - 1 + total) % total)}
            className="w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 hover:bg-gray-50 transition-colors"
          >
            ‹
          </button>
          <span className="text-[10px] text-gray-400">{idx + 1} / {total}</span>
          <button
            onClick={() => setIdx((idx + 1) % total)}
            className="w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 hover:bg-gray-50 transition-colors"
          >
            ›
          </button>
        </div>
      </div>

      {/* 회사 탭 */}
      <div className="flex gap-1 mb-4 overflow-x-auto [&::-webkit-scrollbar]:hidden">
        {data.companies.map((c, i) => (
          <button
            key={c.name}
            onClick={() => setIdx(i)}
            className={`shrink-0 px-2.5 py-1 rounded-full text-[11px] font-medium transition-colors ${
              i === idx
                ? "bg-emerald-600 text-white"
                : "bg-gray-100 text-gray-500 hover:bg-gray-200"
            }`}
          >
            {c.name}
          </button>
        ))}
      </div>

      <CompanyCard company={company} />
    </div>
  );
}
