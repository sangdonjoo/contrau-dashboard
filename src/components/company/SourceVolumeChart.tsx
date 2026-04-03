"use client";

import { useEffect, useState } from "react";
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
  const [chartData, setChartData] = useState(dailySourceData);

  useEffect(() => {
    fetch("/api/company/volume/source?days=30")
      .then(r => r.json())
      .then(j => {
        if (Array.isArray(j.data) && j.data.length > 0) {
          // API returns binary presence (0/1); map to stacked lines format
          const mapped = j.data.map((d: Record<string, string | number>) => {
            const zalo = Number(d.zalo ?? 0);
            const swit = Number(d.swit ?? 0);
            const email = Number(d.gmail ?? 0);
            return {
              date: String(d.date),
              zalo,
              swit,
              email,
              zaloStack: zalo,
              switStack: zalo + swit,
              emailStack: zalo + swit + email,
            };
          });
          setChartData(mapped);
        }
      })
      .catch(() => { /* keep mock fallback */ });
  }, []);

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    const parts = dateStr.split("-");
    return parts.length >= 3 ? `${parts[1]}/${parts[2]}` : dateStr;
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-3 sm:p-5 shadow-sm">
      <h3 className="text-sm font-semibold text-gray-700 mb-1">
        Daily Message Volume by Source
      </h3>
      <p className="text-xs text-gray-400 mb-4">
        Daily collection by source (KB, stacked lines) — last 30 days
      </p>
      <ResponsiveContainer width="100%" height={isMobile ? 240 : 300}>
        <ComposedChart
          data={chartData}
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
