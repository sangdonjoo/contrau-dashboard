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
          // Normalize each source to its own peak (80% of scale)
          const raw = j.data as Record<string, string | number>[];
          const zaloMax = Math.max(...raw.map(d => Number(d.zalo ?? 0)), 1);
          const switMax = Math.max(...raw.map(d => Number(d.swit ?? 0)), 1);
          const emailMax = Math.max(...raw.map(d => Number(d.gmail ?? 0)), 1);
          const mapped = raw.map(d => ({
            date: String(d.date),
            zalo: Math.round((Number(d.zalo ?? 0) / zaloMax) * 80 * 10) / 10,
            swit: Math.round((Number(d.swit ?? 0) / switMax) * 80 * 10) / 10,
            email: Math.round((Number(d.gmail ?? 0) / emailMax) * 80 * 10) / 10,
          }));
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
        Daily collection (% of peak per source) — last 30 days
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
            domain={[0, 100]}
            width={isMobile ? 35 : 50}
            tick={{ fontSize: isMobile ? 9 : 11 }}
            label={isMobile ? undefined : { value: "%", position: "insideTopLeft", offset: -5, fontSize: 11 }}
          />
          <Tooltip
            contentStyle={{ fontSize: 12 }}
            labelFormatter={(label) => formatDate(String(label))}
            formatter={(value, name) => {
              const v = Number(value);
              const labels: Record<string, string> = { zalo: "Zalo", swit: "Swit", email: "Email" };
              return [`${v.toFixed(1)}%`, labels[String(name)] || String(name)];
            }}
          />
          <Legend wrapperStyle={{ fontSize: isMobile ? 10 : 11 }} />
          <Line type="monotone" dataKey="zalo" stroke={COLORS.zalo} strokeWidth={2} dot={false} activeDot={{ r: 4 }} name="zalo" />
          <Line type="monotone" dataKey="swit" stroke={COLORS.swit} strokeWidth={2} dot={false} activeDot={{ r: 4 }} name="swit" />
          <Line type="monotone" dataKey="email" stroke={COLORS.email} strokeWidth={2} dot={false} activeDot={{ r: 4 }} name="email" />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
