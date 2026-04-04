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

type ChartItem = { date: string; zalo: number; swit: number; email: number };

const COLORS = {
  zalo: "#22c55e",
  swit: "#3b82f6",
  email: "#f59e0b",
};

export default function SourceVolumeChart() {
  const isMobile = useIsMobile();
  const [chartData, setChartData] = useState<ChartItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/company/volume/source?days=30")
      .then(r => r.json())
      .then(j => {
        if (Array.isArray(j.data) && j.data.length > 0) {
          const raw = j.data as Record<string, string | number>[];
          const mapped: ChartItem[] = raw
            .filter(d => d.date !== '2026-03-08')
            .map(d => ({
              date: String(d.date),
              zalo: Number(d.zalo ?? 0),
              swit: Number(d.swit ?? 0),
              email: Number(d.gmail ?? 0),
            }));
          setChartData(mapped);
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
        Daily Message Volume by Source
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
              formatter={(value, name) => {
                const v = Number(value);
                const labels: Record<string, string> = { zalo: "Zalo", swit: "Swit", email: "Email" };
                return [v.toLocaleString() + " 건", labels[String(name)] || String(name)];
              }}
            />
            <Legend wrapperStyle={{ fontSize: isMobile ? 10 : 11 }} />
            <Area type="monotone" dataKey="email" stackId="stack" stroke={COLORS.email} fill={COLORS.email} fillOpacity={0.3} name="email" />
            <Area type="monotone" dataKey="swit" stackId="stack" stroke={COLORS.swit} fill={COLORS.swit} fillOpacity={0.3} name="swit" />
            <Area type="monotone" dataKey="zalo" stackId="stack" stroke={COLORS.zalo} fill={COLORS.zalo} fillOpacity={0.3} name="zalo" />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
