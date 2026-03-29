"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  Dot,
} from "recharts";
import { tomotaReadings, TomotaReading } from "@/data/mock";

interface MetricConfig {
  label: string;
  unit: string;
  decimals: number;
  color: string;
}

const metricConfigs: Record<MetricKey, MetricConfig> = {
  weightG:        { label: "Weight",             unit: "g",     decimals: 2, color: "#2563eb" },
  lengthCm:       { label: "Length",             unit: "cm",    decimals: 2, color: "#7c3aed" },
  cvPct:          { label: "CV",                 unit: "%",     decimals: 1, color: "#d97706" },
  uniformityPct:  { label: "Uniformity",         unit: "%",     decimals: 1, color: "#059669" },
  gutFullnessPct: { label: "Intestine Fullness", unit: "%",     decimals: 1, color: "#0891b2" },
  adgGPerDay:     { label: "ADG",                unit: "g/day", decimals: 3, color: "#dc2626" },
} as const;

type MetricKey = keyof Omit<TomotaReading, "timestamp">;

// Parse "2026-03-23 06:15" → numeric ms timestamp for x-axis positioning
function parseTs(ts: string): number {
  return new Date(ts.replace(" ", "T")).getTime();
}

// Format ms timestamp → "3/23" day label
function formatDay(ms: number): string {
  const d = new Date(ms);
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

// Format ms timestamp → "Mar 28, 15:31" for tooltip
function formatTooltipTs(ms: number): string {
  const d = new Date(ms);
  const month = d.toLocaleString("en", { month: "short" });
  const day = d.getDate();
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${month} ${day}, ${hh}:${mm}`;
}

// Build x-axis tick positions: one tick per distinct day
function buildDayTicks(readings: typeof tomotaReadings): number[] {
  const seen = new Set<string>();
  const ticks: number[] = [];
  for (const r of readings) {
    const day = r.timestamp.slice(0, 10);
    if (!seen.has(day)) {
      seen.add(day);
      // Use first reading of that day as tick position
      ticks.push(parseTs(r.timestamp));
    }
  }
  return ticks;
}

const dayTicks = buildDayTicks(tomotaReadings);

function MeasurementMiniChart({ metricKey }: { metricKey: MetricKey }) {
  const config = metricConfigs[metricKey];

  const data = tomotaReadings.map((r) => ({
    ts: parseTs(r.timestamp),
    rawTs: r.timestamp,
    value: r[metricKey] as number,
  }));

  const allValues = data.map((d) => d.value);
  const min = Math.min(...allValues);
  const max = Math.max(...allValues);
  const padding = (max - min) * 0.15 || 0.1;
  const domainMin = Math.floor((min - padding) * 100) / 100;
  const domainMax = Math.ceil((max + padding) * 100) / 100;

  const current = data[data.length - 1].value;

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-3">
      <div className="flex justify-between items-baseline mb-1">
        <span className="text-xs font-semibold text-gray-600">
          {config.label}
        </span>
        <span className="text-[10px] text-gray-400">{config.unit}</span>
      </div>
      <div className="text-lg font-bold text-gray-900 mb-1">
        {current.toFixed(config.decimals)}
        <span className="text-xs text-gray-400 ml-1">{config.unit}</span>
      </div>
      <ResponsiveContainer width="100%" height={80}>
        <LineChart data={data} margin={{ top: 2, right: 2, bottom: 0, left: 0 }}>
          <YAxis domain={[domainMin, domainMax]} hide />
          <XAxis
            dataKey="ts"
            type="number"
            scale="time"
            domain={["dataMin", "dataMax"]}
            ticks={dayTicks}
            tickFormatter={formatDay}
            tick={{ fontSize: 8, fill: "#9ca3af" }}
            axisLine={false}
            tickLine={false}
            height={14}
          />
          <Tooltip
            contentStyle={{ fontSize: 10, padding: "4px 8px" }}
            formatter={(v) => [Number(v).toFixed(config.decimals), config.label]}
            labelFormatter={(ms) => formatTooltipTs(Number(ms))}
          />
          <Line
            type="monotone"
            dataKey="value"
            stroke={config.color}
            strokeWidth={1.5}
            dot={<Dot r={2} fill={config.color} strokeWidth={0} />}
            activeDot={{ r: 3 }}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
      <div className="flex justify-between text-[9px] text-gray-400 mt-0.5">
        <span>Mar 23</span>
        <span>7-day trend ({tomotaReadings.length} readings)</span>
        <span>Mar 29</span>
      </div>
    </div>
  );
}

export default function MeasurementsGrid() {
  const metrics: MetricKey[] = [
    "weightG",
    "lengthCm",
    "cvPct",
    "uniformityPct",
    "gutFullnessPct",
    "adgGPerDay",
  ];
  return (
    <div>
      <h3 className="text-sm font-semibold text-gray-700 mb-3">
        Shrimp Measurements &mdash; 7 Day Trend
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {metrics.map((k) => (
          <MeasurementMiniChart key={k} metricKey={k} />
        ))}
      </div>
    </div>
  );
}
