"use client";

import { useEffect, useState } from "react";
import type { HeadcountResponse } from "@/app/api/people/headcount/route";

export default function HeadcountPanel() {
  const [data, setData] = useState<HeadcountResponse | null>(null);

  useEffect(() => {
    fetch("/api/people/headcount")
      .then(r => r.json())
      .then(setData)
      .catch(() => {});
  }, []);

  if (!data?.available) return null;

  const unlinked = data.total - data.zaloLinked;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
      {/* 전체 요약 */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm px-5 py-4">
        <p className="text-xs text-gray-400 mb-2 font-medium">Headcount</p>
        <p className="text-3xl font-bold text-gray-900">{data.total}</p>
        <p className="text-xs text-gray-400 mt-1">across {data.byCompany.length} companies</p>

        <div className="mt-3 space-y-1.5">
          {data.byCompany.map(c => (
            <div key={c.company} className="flex items-center gap-2">
              <span className="text-xs text-gray-600 w-24 truncate">{c.company}</span>
              <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-400 rounded-full"
                  style={{ width: `${(c.total / data.total) * 100}%` }}
                />
              </div>
              <span className="text-xs text-gray-400 w-6 text-right">{c.total}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Zalo 온보딩 현황 */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm px-5 py-4">
        <p className="text-xs text-gray-400 mb-2 font-medium">Zalo Onboarding</p>
        <div className="flex items-end gap-3">
          <p className="text-3xl font-bold text-gray-900">{data.zaloLinked}</p>
          <p className="text-sm text-gray-400 mb-1">/ {data.total} linked</p>
        </div>

        {/* 전체 진행률 바 */}
        <div className="mt-2 h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-400 rounded-full transition-all"
            style={{ width: `${(data.zaloLinked / data.total) * 100}%` }}
          />
        </div>
        <p className="text-[10px] text-gray-400 mt-1">
          {Math.round((data.zaloLinked / data.total) * 100)}% connected
          {unlinked > 0 && (
            <span className="ml-2 text-amber-500 font-medium">{unlinked} not yet</span>
          )}
        </p>

        {/* 회사별 온보딩 */}
        <div className="mt-3 space-y-1.5">
          {data.byCompany.map(c => (
            <div key={c.company} className="flex items-center gap-2">
              <span className="text-xs text-gray-600 w-24 truncate">{c.company}</span>
              <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${c.zaloPct >= 80 ? 'bg-blue-400' : c.zaloPct >= 50 ? 'bg-amber-400' : 'bg-red-400'}`}
                  style={{ width: `${c.zaloPct}%` }}
                />
              </div>
              <span className="text-xs text-gray-400 w-12 text-right">
                {c.zaloLinked}/{c.total}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
