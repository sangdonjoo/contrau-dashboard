"use client";

import {
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ComposedChart,
} from "recharts";
import { dailyCompanyData } from "@/data/company-mock";
import { useIsMobile } from "@/lib/useIsMobile";

const COLORS = {
  hq: "#6b7280",
  shrimp: "#22c55e",
  bsfl: "#8b5cf6",
  microalgae: "#06b6d4",
  bmd: "#f59e0b",
};

const LABELS: Record<string, string> = {
  hqStack: "HQ",
  shrimpStack: "Shrimp",
  bsflStack: "BSFL",
  microalgaeStack: "Microalgae",
  bmdStack: "BMD",
};

export default function CompanyVolumeChart() {
  const isMobile = useIsMobile();

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    const parts = dateStr.split("-");
    return `${parts[1]}/${parts[2]}`;
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-3 sm:p-5 shadow-sm">
      <h3 className="text-sm font-semibold text-gray-700 mb-1">
        Daily Message Volume by Company
      </h3>
      <p className="text-xs text-gray-400 mb-4">
        Daily collection by company (KB, stacked lines) — last 30 days
      </p>
      <ResponsiveContainer width="100%" height={isMobile ? 240 : 300}>
        <ComposedChart
          data={dailyCompanyData}
          margin={isMobile ? { top: 5, right: 5, bottom: 5, left: -10 } : { top: 5, right: 20, bottom: 5, left: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
          <XAxis
            dataKey="date"
            tickFormatter={formatDate}
            tick={{ fontSize: isMobile ? 9 : 11 }}
            interval={isMobile ? 6 : 3}
          />
          <YAxis
            width={isMobile ? 35 : 50}
            tick={{ fontSize: isMobile ? 9 : 11 }}
            label={isMobile ? undefined : { value: "KB", position: "insideTopLeft", offset: -5, fontSize: 11 }}
          />
          <Tooltip
            contentStyle={{ fontSize: 12 }}
            labelFormatter={(label) => formatDate(String(label))}
            formatter={(value, name) => {
              const v = Number(value);
              const n = String(name);
              return [`${v.toLocaleString()} KB`, LABELS[n] || n];
            }}
          />
          <Legend
            wrapperStyle={{ fontSize: isMobile ? 10 : 11 }}
            formatter={(value: string) => LABELS[value] || value}
          />
          {/* Stacked from bottom to top: HQ → Shrimp → BSFL → Microalgae → BMD */}
          <Line type="monotone" dataKey="hqStack" stroke={COLORS.hq} strokeWidth={2} dot={false} activeDot={{ r: 4 }} name="hqStack" />
          <Line type="monotone" dataKey="shrimpStack" stroke={COLORS.shrimp} strokeWidth={2} dot={false} activeDot={{ r: 4 }} name="shrimpStack" />
          <Line type="monotone" dataKey="bsflStack" stroke={COLORS.bsfl} strokeWidth={2} dot={false} activeDot={{ r: 4 }} name="bsflStack" />
          <Line type="monotone" dataKey="microalgaeStack" stroke={COLORS.microalgae} strokeWidth={2} dot={false} activeDot={{ r: 4 }} name="microalgaeStack" />
          <Line type="monotone" dataKey="bmdStack" stroke={COLORS.bmd} strokeWidth={2} dot={false} activeDot={{ r: 4 }} name="bmdStack" />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
