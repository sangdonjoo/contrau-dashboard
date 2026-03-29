"use client";

import {
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  ReferenceArea,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { waterQualityData, waterQualityRanges } from "@/data/mock";

type ParamKey = keyof typeof waterQualityRanges;

function WqMiniChart({ paramKey }: { paramKey: ParamKey }) {
  const range = waterQualityRanges[paramKey];

  const data = waterQualityData.map((d, i) => {
    const raw = Math.round((d[paramKey as keyof typeof d] as number) * 100) / 100;
    const isOut = raw < range.min || raw > range.max;
    return {
      idx: i,
      value: raw,
      // outRange: only populated for out-of-range points
      outRange: isOut ? raw : null,
      time: new Date(d.time).toLocaleTimeString("en", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
  });

  // No bridging needed — green line shows full data, red line overlays only out-of-range segments
  const dataWithBridges = data;

  const allValues = data.map((d) => d.value);
  const domainMin = Math.min(range.critLow, ...allValues) * 0.95;
  const domainMax = Math.max(range.critHigh, ...allValues) * 1.05;

  const current = data[data.length - 1].value;
  const currentOutOfRange = current < range.min || current > range.max;

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-3">
      <div className="flex justify-between items-baseline mb-1">
        <span className="text-xs font-semibold text-gray-600">
          {range.label}
        </span>
        <span className="text-[10px] text-gray-400">{range.unit}</span>
      </div>
      <div
        className={`text-lg font-bold mb-1 ${
          currentOutOfRange ? "text-red-600" : "text-gray-900"
        }`}
      >
        {current}
        <span className="text-xs text-gray-400 ml-1">{range.unit}</span>
      </div>
      <ResponsiveContainer width="100%" height={80}>
        <ComposedChart
          data={dataWithBridges}
          margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
        >
          {/* Safe zone band */}
          <ReferenceArea
            y1={range.min}
            y2={range.max}
            fill="#22c55e"
            fillOpacity={0.08}
          />
          <YAxis domain={[domainMin, domainMax]} hide />
          <XAxis dataKey="idx" hide />
          <Tooltip
            contentStyle={{ fontSize: 10, padding: "4px 8px" }}
            formatter={(v, name) => {
              if (v == null) return [null, null];
              const label = name === "outRange" ? `${range.label} (OUT OF RANGE)` : range.label;
              return [Number(v).toFixed(2), label];
            }}
            labelFormatter={(i) => data[Number(i)]?.time || ""}
          />
          {/* Out-of-range vertical bands: light red columns where value exceeds safe range */}
          {(() => {
            const segments: { start: number; end: number }[] = [];
            let segStart: number | null = null;
            for (let j = 0; j < data.length; j++) {
              const isOut = data[j].value < range.min || data[j].value > range.max;
              if (isOut && segStart === null) segStart = j;
              if (!isOut && segStart !== null) {
                segments.push({ start: segStart, end: j - 1 });
                segStart = null;
              }
            }
            if (segStart !== null) segments.push({ start: segStart, end: data.length - 1 });
            return segments.map((seg, si) => (
              <ReferenceArea
                key={`out-${si}`}
                x1={data[seg.start].idx}
                x2={data[seg.end].idx}
                fill="#ef4444"
                fillOpacity={0.18}
                ifOverflow="extendDomain"
              />
            ));
          })()}
          {/* Single green line: always visible */}
          <Line
            type="monotone"
            dataKey="value"
            stroke="#22c55e"
            strokeWidth={1.5}
            dot={false}
            activeDot={{ r: 3 }}
            isAnimationActive={false}
            name="value"
          />
        </ComposedChart>
      </ResponsiveContainer>
      <div className="flex justify-between text-[9px] text-gray-400 mt-0.5">
        <span>48h ago</span>
        <span>
          Safe: {range.min}–{range.max}
        </span>
        <span>Now</span>
      </div>
    </div>
  );
}

export default function WaterQualityGrid() {
  const params: ParamKey[] = ["ph", "do_mgl", "temp", "tan", "no2", "salinity"];
  return (
    <div>
      <h3 className="text-sm font-semibold text-gray-700 mb-3">
        Water Quality — P3 (48h)
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {params.map((k) => (
          <WqMiniChart key={k} paramKey={k} />
        ))}
      </div>
    </div>
  );
}
