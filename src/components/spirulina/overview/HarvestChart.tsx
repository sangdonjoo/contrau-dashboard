"use client";

import type { ReactNode } from "react";
import {
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ComposedChart,
  ReferenceLine,
} from "recharts";
import { dailyHarvest, environmentData } from "@/data/spirulina-mock";
import { useIsMobile } from "@/lib/useIsMobile";

// Compute 30-day moving average ± std dev for cloud bands
function computeCloudBands(data: typeof dailyHarvest, window = 30) {
  return data.map((_, i) => {
    const start = Math.max(0, i - window + 1);
    const slice = data.slice(start, i + 1);

    const hVals = slice.map(d => d.harvestKg);
    const cVals = slice.map(d => d.avgColorIndex);

    const hAvg = hVals.reduce((a, b) => a + b, 0) / hVals.length;
    const cAvg = cVals.reduce((a, b) => a + b, 0) / cVals.length;

    const hStd = Math.sqrt(hVals.reduce((s, v) => s + (v - hAvg) ** 2, 0) / hVals.length);
    const cStd = Math.sqrt(cVals.reduce((s, v) => s + (v - cAvg) ** 2, 0) / cVals.length);

    const hUpper = Math.round(hAvg + hStd * 0.8);
    const hLower = Math.round(hAvg - hStd * 0.8);
    const cUpper = Math.round(cAvg + cStd * 0.8);
    const cLower = Math.round(cAvg - cStd * 0.8);

    return {
      ...data[i],
      harvestUpper: hUpper,
      harvestLower: hLower,
      ciUpper: cUpper,
      ciLower: cLower,
      harvestBand: [hLower, hUpper],
      ciBand: [cLower, cUpper],
    };
  });
}

export default function HarvestChart() {
  const isMobile = useIsMobile();
  const chartData = computeCloudBands(dailyHarvest);

  // Format daily date → monthly tick label ("Apr", "May", …)
  // Only show label on the 1st of each month to avoid clutter
  const formatDateTick = (dateStr: string) => {
    if (!dateStr || typeof dateStr !== "string") return "";
    const parts = dateStr.split("-");
    if (parts.length < 3) return "";
    const day = parseInt(parts[2], 10);
    if (day !== 1) return "";
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return months[parseInt(parts[1], 10) - 1] ?? "";
  };

  const formatMonthTick = (label: ReactNode) => {
    const m = String(label);
    if (!m) return "";
    const [, month] = m.split("-");
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return months[parseInt(month, 10) - 1] ?? m;
  };

  return (
    <div className="space-y-4">
      {/* Chart 1: Daily Harvest + Color Index — two lines */}
      <div className="rounded-xl border border-gray-200 bg-white p-3 sm:p-5 shadow-sm">
        <h3 className="text-sm font-semibold text-gray-700 mb-1">
          Daily Harvest &amp; Color Index
        </h3>
        <p className="text-xs text-gray-400 mb-4">
          Daily harvest (kg, left axis) + Avg Color Index (right axis) — 365 days
        </p>
        <ResponsiveContainer width="100%" height={isMobile ? 240 : 300}>
          <ComposedChart
            data={chartData}
            margin={isMobile ? { top: 5, right: 5, bottom: 5, left: -10 } : { top: 5, right: 20, bottom: 5, left: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
            {/* Rainy season markers: Jun 1 and Nov 1 */}
            <ReferenceLine yAxisId="left" x="2025-06-01" stroke="#ef4444" strokeDasharray="6 3" strokeWidth={1.5} label={isMobile ? undefined : { value: "Rainy", position: "top", fontSize: 9, fill: "#ef4444" }} />
            <ReferenceLine yAxisId="left" x="2025-11-01" stroke="#ef4444" strokeDasharray="6 3" strokeWidth={1.5} label={isMobile ? undefined : { value: "Dry", position: "top", fontSize: 9, fill: "#ef4444" }} />
            <XAxis
              dataKey="date"
              tickFormatter={formatDateTick}
              tick={{ fontSize: isMobile ? 9 : 11 }}
              ticks={chartData.filter(d => d.date.endsWith("-01")).map(d => d.date)}
            />
            <YAxis
              yAxisId="left"
              width={isMobile ? 35 : 50}
              tick={{ fontSize: isMobile ? 9 : 11 }}
              label={isMobile ? undefined : { value: "kg", position: "insideTopLeft", offset: -5, fontSize: 11 }}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              domain={[600, 800]}
              width={isMobile ? 35 : 50}
              tick={{ fontSize: isMobile ? 9 : 11 }}
              label={isMobile ? undefined : { value: "CI", position: "insideTopRight", offset: -5, fontSize: 11 }}
            />
            <Tooltip
              contentStyle={{ fontSize: 12 }}
              formatter={(value, name) => {
                const v = Number(value);
                if (name === "Avg Color Index") return [v.toFixed(0), name];
                return [`${v.toLocaleString()} kg`, name];
              }}
            />
            <Legend wrapperStyle={{ fontSize: isMobile ? 10 : 11 }} />
            {/* Cloud bands — 30-day moving avg ± 0.8 std dev, rendered as range area */}
            <Area
              yAxisId="left"
              type="monotone"
              dataKey="harvestBand"
              fill="#22c55e"
              fillOpacity={0.15}
              stroke="none"
              legendType="none"
              name=""
              isAnimationActive={false}
            />
            <Area
              yAxisId="right"
              type="monotone"
              dataKey="ciBand"
              fill="#ca8a04"
              fillOpacity={0.15}
              stroke="none"
              legendType="none"
              name=""
              isAnimationActive={false}
            />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="harvestKg"
              stroke="#22c55e"
              strokeWidth={1.5}
              dot={false}
              activeDot={{ r: 4 }}
              name="Daily Harvest (kg)"
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="avgColorIndex"
              stroke="#ca8a04"
              strokeWidth={1.5}
              dot={false}
              activeDot={{ r: 4 }}
              name="Avg Color Index"
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Chart 2: Monthly Environment Conditions */}
      <div className="rounded-xl border border-gray-200 bg-white p-3 sm:p-5 shadow-sm">
        <h3 className="text-sm font-semibold text-gray-700 mb-1">
          Monthly Environment Conditions
        </h3>
        <p className="text-xs text-gray-400 mb-4">
          Temperature, Sunlight, Rainfall — normalized to 0-100% scale, 12 months
        </p>
        <ResponsiveContainer width="100%" height={isMobile ? 220 : 280}>
          <ComposedChart
            data={environmentData}
            margin={isMobile ? { top: 5, right: 5, bottom: 5, left: -10 } : { top: 5, right: 20, bottom: 5, left: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
            {/* Rainy season markers */}
            <ReferenceLine x="2025-06" stroke="#ef4444" strokeDasharray="6 3" strokeWidth={1.5} label={isMobile ? undefined : { value: "Rainy", position: "top", fontSize: 9, fill: "#ef4444" }} />
            <ReferenceLine x="2025-11" stroke="#ef4444" strokeDasharray="6 3" strokeWidth={1.5} label={isMobile ? undefined : { value: "Dry", position: "top", fontSize: 9, fill: "#ef4444" }} />
            <XAxis
              dataKey="month"
              tickFormatter={formatMonthTick}
              tick={{ fontSize: isMobile ? 9 : 11 }}
            />
            <YAxis
              domain={[0, 100]}
              width={isMobile ? 30 : 40}
              tick={{ fontSize: isMobile ? 9 : 11 }}
              tickFormatter={(v: number) => `${v}%`}
            />
            <Tooltip
              contentStyle={{ fontSize: 12 }}
              labelFormatter={formatMonthTick}
              formatter={(value, name, props) => {
                const v = Number(value);
                const p = props.payload as Record<string, number>;
                if (name === "Temperature") return [`${p.tempC}\u00B0C (${v}%)`, name];
                if (name === "Sunlight") return [`${p.sunlightHrs} hrs/day (${v}%)`, name];
                if (name === "Rainfall") return [`${p.rainfallMm} mm (${v}%)`, name];
                return [v, name];
              }}
            />
            <Legend wrapperStyle={{ fontSize: isMobile ? 10 : 11 }} />
            <Line
              type="monotone"
              dataKey="tempPct"
              stroke="#ef4444"
              strokeWidth={2}
              dot={{ r: 2 }}
              name="Temperature"
            />
            <Line
              type="monotone"
              dataKey="sunlightPct"
              stroke="#eab308"
              strokeWidth={2}
              dot={{ r: 2 }}
              name="Sunlight"
            />
            <Line
              type="monotone"
              dataKey="rainfallPct"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={{ r: 2 }}
              name="Rainfall"
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
