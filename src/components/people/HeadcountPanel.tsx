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

  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm px-5 py-4 h-full">
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
  );
}
