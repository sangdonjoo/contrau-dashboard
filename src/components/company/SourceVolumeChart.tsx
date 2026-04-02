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
import { dailySourceData } from "@/data/company-mock";
import { useIsMobile } from "@/lib/useIsMobile";

const COLORS = {
  zalo: "#22c55e",
  swit: "#3b82f6",
  email: "#f59e0b",
};

export default function SourceVolumeChart() {
  const isMobile = useIsMobile();

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    const parts = dateStr.split("-");
    return `${parts[1]}/${parts[2]}`;
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-3 sm:p-5 shadow-sm">
      <h3 className="text-sm font-semibold text-gray-700 mb-1">
        Daily Message Volume by Source
      </h3>
      <p className="text-xs text-gray-400 mb-4">
        소스별 일별 수집량 (KB, 축적 실선) — 최근 30일
      </p>
      <ResponsiveContainer width="100%" height={isMobile ? 240 : 300}>
        <ComposedChart
          data={dailySourceData}
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
              const labels: Record<string, string> = {
                emailStack: "Email (total)",
                switStack: "Swit (total)",
                zaloStack: "Zalo",
              };
              return [`${v.toLocaleString()} KB`, labels[n] || n];
            }}
          />
          <Legend
            wrapperStyle={{ fontSize: isMobile ? 10 : 11 }}
            formatter={(value: string) => {
              const labels: Record<string, string> = {
                emailStack: "Email",
                switStack: "Swit",
                zaloStack: "Zalo",
              };
              return labels[value] || value;
            }}
          />
          {/* Bottom layer: Zalo only */}
          <Line
            type="monotone"
            dataKey="zaloStack"
            stroke={COLORS.zalo}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4 }}
            name="zaloStack"
          />
          {/* Middle layer: Zalo + Swit */}
          <Line
            type="monotone"
            dataKey="switStack"
            stroke={COLORS.swit}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4 }}
            name="switStack"
          />
          {/* Top layer: Zalo + Swit + Email */}
          <Line
            type="monotone"
            dataKey="emailStack"
            stroke={COLORS.email}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4 }}
            name="emailStack"
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
