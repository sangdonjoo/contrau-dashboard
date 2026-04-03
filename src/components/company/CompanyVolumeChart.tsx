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
import { dailyCompanyActivityData } from "@/data/company-mock";
import { useIsMobile } from "@/lib/useIsMobile";

const COLORS = {
  slg: "#06b6d4",
  bmd: "#22c55e",
  others: "#6b7280",
};

const LABELS: Record<string, string> = {
  slg: "Microalgae (SLG)",
  bmd: "BMD",
  others: "Others",
};

export default function CompanyVolumeChart() {
  const isMobile = useIsMobile();
  const [chartData, setChartData] = useState(dailyCompanyActivityData);

  useEffect(() => {
    fetch("/api/company/activity?days=30")
      .then(r => r.json())
      .then(j => {
        if (Array.isArray(j.data) && j.data.length > 0) {
          setChartData(j.data);
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
        Daily Activity Index by Company
      </h3>
      <p className="text-xs text-gray-400 mb-4">
        Zalo + Swit × 3 per company — last 30 days
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
            label={isMobile ? undefined : { value: "idx", position: "insideTopLeft", offset: -5, fontSize: 11 }}
          />
          <Tooltip
            contentStyle={{ fontSize: 12 }}
            labelFormatter={(label) => formatDate(String(label))}
            formatter={(value, name) => [
              Number(value).toFixed(0),
              LABELS[String(name)] || String(name),
            ]}
          />
          <Legend
            wrapperStyle={{ fontSize: isMobile ? 10 : 11 }}
            formatter={(value: string) => LABELS[value] || value}
          />
          <Line type="monotone" dataKey="slg" stroke={COLORS.slg} strokeWidth={2} dot={false} activeDot={{ r: 4 }} name="slg" />
          <Line type="monotone" dataKey="bmd" stroke={COLORS.bmd} strokeWidth={2} dot={false} activeDot={{ r: 4 }} name="bmd" />
          <Line type="monotone" dataKey="others" stroke={COLORS.others} strokeWidth={2} dot={false} activeDot={{ r: 4 }} name="others" />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
