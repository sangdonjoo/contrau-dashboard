"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { growthData } from "@/data/mock";
import { useIsMobile } from "@/lib/useIsMobile";

export default function GrowthChart() {
  const isMobile = useIsMobile();

  // Merge measured, target, and adg into one array keyed by doc
  const merged = new Map<number, { doc: number; measured?: number; target?: number; adg?: number }>();

  for (const p of growthData.target) {
    merged.set(p.doc, { doc: p.doc, target: p.weight });
  }
  for (const p of growthData.measured) {
    const existing = merged.get(p.doc) || { doc: p.doc };
    existing.measured = p.weight;
    merged.set(p.doc, existing);
  }
  for (const p of growthData.adg) {
    const existing = merged.get(p.doc) || { doc: p.doc };
    existing.adg = p.adg;
    merged.set(p.doc, existing);
  }

  const allData = Array.from(merged.values()).sort((a, b) => a.doc - b.doc);

  // Auto-scale X axis: show up to currentDOC + ~20% padding (min 5 days), capped at 90
  const currentDoc = Math.max(...growthData.measured.map((p) => p.doc));
  const xPadding = Math.max(5, Math.round(currentDoc * 0.2));
  const xMax = Math.min(90, currentDoc + xPadding);

  // Filter chart data to visible range
  const chartData = allData.filter((d) => d.doc <= xMax);

  // Auto-scale Y axis: based on visible data only
  const visibleWeights = chartData
    .flatMap((d) => [d.measured, d.target])
    .filter((v): v is number => v != null);
  const yMax = Math.ceil(Math.max(...visibleWeights) * 1.15); // 15% headroom

  // Compute ADG domain (also scoped to visible range)
  const adgValues = growthData.adg.filter((d) => d.doc <= xMax).map((d) => d.adg).filter((v) => v > 0);
  const adgMax = adgValues.length > 0 ? Math.ceil(Math.max(...adgValues) * 10) / 10 + 0.1 : 1;

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-3 sm:p-5 shadow-sm">
      <h3 className="text-sm font-semibold text-gray-700 mb-1">
        Growth Curve — B11
      </h3>
      <p className="text-xs text-gray-400 mb-4">
        Weight (g) over Days of Culture. Target: 20g at DOC 80. Green line: ADG (g/day).
      </p>
      <ResponsiveContainer width="100%" height={isMobile ? 260 : 320}>
        <LineChart
          data={chartData}
          margin={isMobile
            ? { top: 5, right: 5, bottom: 5, left: -10 }
            : { top: 5, right: 40, bottom: 5, left: 0 }
          }
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
          <XAxis
            dataKey="doc"
            tick={{ fontSize: isMobile ? 9 : 11 }}
            label={{ value: "DOC", position: "insideBottomRight", offset: -5, fontSize: isMobile ? 9 : 11 }}
          />
          <YAxis
            yAxisId="left"
            width={isMobile ? 30 : 60}
            tick={{ fontSize: isMobile ? 9 : 11 }}
            label={isMobile ? undefined : { value: "g", position: "insideTopLeft", offset: -5, fontSize: 11 }}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            domain={[0, adgMax]}
            width={isMobile ? 30 : 60}
            tick={{ fontSize: isMobile ? 8 : 10 }}
            label={isMobile ? undefined : { value: "g/day", position: "insideTopRight", offset: -5, fontSize: 10 }}
          />
          <Tooltip
            contentStyle={{ fontSize: 12 }}
            formatter={(v, name) => {
              const n = Number(v);
              if (name === "ADG (g/day)") return [`${n.toFixed(3)} g/day`];
              return [`${n.toFixed(2)}g`];
            }}
          />
          <Legend wrapperStyle={{ fontSize: isMobile ? 10 : 11 }} />
          {/* Phase transition lines — hide labels on mobile */}
          <ReferenceLine
            yAxisId="left"
            x={19}
            stroke="#d1d5db"
            strokeDasharray="4 4"
            label={isMobile ? undefined : { value: "P1\u2192P2", fontSize: 10, fill: "#9ca3af" }}
          />
          <ReferenceLine
            yAxisId="left"
            x={47}
            stroke="#d1d5db"
            strokeDasharray="4 4"
            label={isMobile ? undefined : { value: "P2\u2192P3", fontSize: 10, fill: "#9ca3af" }}
          />
          {/* Target curve */}
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="target"
            stroke="#f97316"
            strokeDasharray="6 3"
            strokeWidth={2}
            dot={false}
            name="Target"
          />
          {/* Measured curve */}
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="measured"
            stroke="#2563eb"
            strokeWidth={2}
            dot={{ r: 2, fill: "#2563eb" }}
            name="Measured"
            connectNulls
          />
          {/* ADG curve */}
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="adg"
            stroke="#22c55e"
            strokeWidth={1.5}
            dot={false}
            name="ADG (g/day)"
            connectNulls
          />
        </LineChart>
      </ResponsiveContainer>
      {/* Mobile-only axis legend */}
      {isMobile && (
        <p className="text-[10px] text-gray-400 text-center mt-1">
          Left axis: Weight (g) &nbsp;|&nbsp; Right axis: ADG (g/day)
        </p>
      )}
    </div>
  );
}
