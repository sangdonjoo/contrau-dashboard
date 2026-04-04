"use client";

import { useEffect, useState } from "react";
import {
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  AreaChart,
} from "recharts";
import { useIsMobile } from "@/lib/useIsMobile";

type ChartItem = { date: string; microalgae: number; bsfl: number; shrimp: number; bmd: number; hq: number };

const COLORS = {
  microalgae: "#06b6d4",
  bsfl: "#22c55e",
  shrimp: "#f97316",
  bmd: "#8b5cf6",
  hq: "#6b7280",
};

const LABELS: Record<string, string> = {
  microalgae: "Microalgae",
  bsfl: "BSFL",
  shrimp: "Shrimp",
  bmd: "BMD",
  hq: "HQ",
};

export default function CompanyVolumeChart() {
  const isMobile = useIsMobile();
  const [chartData, setChartData] = useState<ChartItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/company/activity?days=30")
      .then(r => r.json())
      .then(j => {
        if (Array.isArray(j.data) && j.data.length > 0) {
          const filtered = j.data.filter((d: { date: string }) => d.date !== '2026-03-08');
          setChartData(filtered);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    const parts = dateStr.split("-");
    return parts.length >= 3 ? `${parts[1]}/${parts[2]}` : dateStr;
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-3 sm:p-5 shadow-sm">
      <h3 className="text-sm font-semibold text-gray-700 mb-1">
        Daily Message Volume by Company
      </h3>
      <p className="text-xs text-gray-400 mb-4">
        Daily text content volume (chars, attachments excluded) — last 30 days
      </p>
      {loading ? (
        <div className="flex items-center justify-center" style={{ height: isMobile ? 240 : 300 }}>
          <span className="text-xs text-gray-400">로딩 중...</span>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={isMobile ? 240 : 300}>
          <AreaChart
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
              label={isMobile ? undefined : { value: "건", position: "insideTopLeft", offset: -5, fontSize: 10 }}
            />
            <Tooltip
              contentStyle={{ fontSize: 12 }}
              labelFormatter={(label) => formatDate(String(label))}
              formatter={(value, name) => [
                Number(value).toLocaleString() + " 건",
                LABELS[String(name)] || String(name),
              ]}
            />
            <Legend
              wrapperStyle={{ fontSize: isMobile ? 10 : 11 }}
              formatter={(value: string) => LABELS[value] || value}
            />
            <Area type="monotone" dataKey="hq" stackId="stack" stroke={COLORS.hq} fill={COLORS.hq} fillOpacity={0.3} name="hq" />
            <Area type="monotone" dataKey="bmd" stackId="stack" stroke={COLORS.bmd} fill={COLORS.bmd} fillOpacity={0.3} name="bmd" />
            <Area type="monotone" dataKey="shrimp" stackId="stack" stroke={COLORS.shrimp} fill={COLORS.shrimp} fillOpacity={0.3} name="shrimp" />
            <Area type="monotone" dataKey="bsfl" stackId="stack" stroke={COLORS.bsfl} fill={COLORS.bsfl} fillOpacity={0.3} name="bsfl" />
            <Area type="monotone" dataKey="microalgae" stackId="stack" stroke={COLORS.microalgae} fill={COLORS.microalgae} fillOpacity={0.3} name="microalgae" />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
