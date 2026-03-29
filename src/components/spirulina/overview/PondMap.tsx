"use client";

import type { Factory, Pond } from "@/data/spirulina-mock";
import { getOdColor, getOdLabel } from "@/data/spirulina-mock";
import { useState } from "react";

interface PondMapProps {
  factory: Factory;
}

function avgOd(ponds: Pond[]): number | null {
  const active = ponds.filter((p) => p.od !== null && p.status === "active");
  if (active.length === 0) return null;
  return active.reduce((s, p) => s + (p.od as number), 0) / active.length;
}

function GroupTooltip({ label, ponds }: { label: string; ponds: Pond[] }) {
  return (
    <div className="absolute z-30 bottom-full left-1/2 -translate-x-1/2 mb-1 w-44 bg-gray-900 text-white text-[10px] rounded-lg p-2 shadow-xl pointer-events-none whitespace-nowrap">
      <p className="font-semibold mb-1">{label}</p>
      {ponds.map((p) => (
        <p key={p.id} className="leading-tight">
          {p.id.split("-")[1]}: OD {p.od !== null ? p.od.toFixed(1) : "N/A"}
          {p.harvestPlanTomorrow ? " 🟠" : ""}
        </p>
      ))}
    </div>
  );
}

function ExistingGroup({ label, ponds, style }: { label: string; ponds: Pond[]; style?: React.CSSProperties }) {
  const [hover, setHover] = useState(false);
  const od = avgOd(ponds);
  const bg = getOdColor(od);
  const isLight = od === null || od < 1.0;
  const textClass = isLight ? "text-gray-700" : "text-white";
  const odLabel = getOdLabel(od);
  const hasHarvest = ponds.some((p) => p.harvestPlanTomorrow);

  return (
    <div className="relative h-full" style={style} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
      <div
        className={`rounded-lg h-full w-full flex flex-col items-center justify-center gap-0.5 cursor-default border-2 border-gray-700 ${hasHarvest ? "ring-2 ring-orange-400" : ""}`}
        style={{ backgroundColor: bg }}
      >
        <span className={`text-[10px] font-bold leading-none ${textClass}`}>{label}</span>
        <span className={`text-[8px] leading-none ${textClass} opacity-80`}>{odLabel}</span>
        {od !== null && <span className={`text-[8px] leading-none ${textClass} opacity-70`}>OD {od.toFixed(1)}</span>}
      </div>
      {hover && <GroupTooltip label={label} ponds={ponds} />}
    </div>
  );
}

function RelocateGroup({ label }: { label: string }) {
  return (
    <div className="rounded-lg h-full w-full flex flex-col items-center justify-center gap-0.5 border-2 border-purple-500 bg-gray-400">
      <span className="text-[10px] font-bold text-gray-700 leading-none">{label}</span>
      <span className="text-[8px] text-gray-600 leading-none">relocate</span>
    </div>
  );
}

function FacilityBlock({ label }: { label: string }) {
  return (
    <div className="rounded-lg h-full w-full flex flex-col items-center justify-center bg-orange-400 border-2 border-orange-500">
      <span className="text-[10px] font-bold text-white text-center leading-tight px-1">{label}</span>
    </div>
  );
}

type Phase = 1 | 2 | 3 | 4;
const phaseStyles: Record<Phase, string> = { 1: "border-red-400", 2: "border-purple-400", 3: "border-green-400", 4: "border-blue-500" };
const phaseLabels: Record<Phase, string> = { 1: "Ph.1", 2: "Ph.2", 3: "Ph.3", 4: "Ph.4" };

function FutureBox({ phase }: { phase: Phase }) {
  return (
    <div className={`rounded-lg h-full w-full flex items-center justify-center border-2 border-dashed ${phaseStyles[phase]}`} style={{ backgroundColor: "rgba(245,240,232,0.35)" }}>
      <span className="text-[9px] font-semibold text-gray-400">{phaseLabels[phase]}</span>
    </div>
  );
}

function Cell({ row, col, rowSpan = 1, colSpan = 1, children }: { row: number; col: number; rowSpan?: number; colSpan?: number; children: React.ReactNode }) {
  return (
    <div style={{ gridRow: rowSpan > 1 ? `${row} / span ${rowSpan}` : row, gridColumn: colSpan > 1 ? `${col} / span ${colSpan}` : col }}>
      {children}
    </div>
  );
}

export default function PondMap({ factory }: PondMapProps) {
  if (factory.zones.length === 0) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-8 text-center">
        <p className="text-sm text-gray-400">No pond data available for {factory.name}</p>
      </div>
    );
  }

  // NOTE: RWP4 = small group near warehouse (top right), RWP5 = larger group (top left next to Indoor GH)
  const rwp4 = factory.zones.find((z) => z.id === "RWP4"); // small, near warehouse
  const rwp5 = factory.zones.find((z) => z.id === "RWP5");
  const rwp6 = factory.zones.find((z) => z.id === "RWP6");
  const rwp7 = factory.zones.find((z) => z.id === "RWP7");

  const rwp7a = rwp7?.ponds.filter((p) => { const n = parseInt(p.id.split("-")[1], 10); return n >= 1 && n <= 4; }) ?? [];
  const rwp7b = rwp7?.ponds.filter((p) => { const n = parseInt(p.id.split("-")[1], 10); return n >= 9 && n <= 12; }) ?? [];

  // 10 cols × 3 rows. Row heights: row1=taller (has Indoor GH spanning), rows 2-3 = standard
  // Left side (cols 1-4): all 3 rows used
  // Right side (cols 5-10): only rows 2-3 (row 1 empty)
  const cellH = 72;

  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-4">
      <h3 className="text-sm font-semibold text-gray-700 mb-3">Factory Pond Map — Tra Vinh</h3>

      <div className="rounded-lg p-3 overflow-x-auto" style={{ backgroundColor: "#ede8db" }}>
        {(() => {
          const borderColors: Record<number, string> = {
            // 검은색 (existing)
            2: "#1f2937", 10: "#1f2937", 20: "#1f2937", 8: "#1f2937", 4: "#1f2937",
            // 녹색 (Phase 3)
            5: "#22c55e", 6: "#22c55e", 7: "#22c55e", 15: "#22c55e", 16: "#22c55e", 17: "#22c55e",
            // 노란색 (Phase 2)
            9: "#eab308", 18: "#eab308", 19: "#eab308",
            // 빨간색 (Phase 1)
            1: "#ef4444", 11: "#ef4444", 21: "#ef4444",
            // 파란색 (Phase 4)
            12: "#3b82f6", 13: "#3b82f6", 14: "#3b82f6", 22: "#3b82f6", 23: "#3b82f6", 24: "#3b82f6",
          };
          // 8: currently operating (black) but needs relocation during Phase 2
          borderColors[8] = "#1f2937";

          const rows = [[1,2,3,4], [5,6,7,8,9,10,11,12,13,14], [15,16,17,18,19,20,21,22,23,24]];

          return (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(10, minmax(40px, 1fr))", gridAutoRows: "180px", gap: "4px" }}>
              {rows.map((row, ri) =>
                row.map((n, ci) => (
                  <Cell key={n} row={ri + 1} col={ci + 1}>
                    {n === 3 ? (
                      <div className="rounded h-full w-full flex items-center justify-center bg-gray-300" style={{ border: `3px solid ${borderColors[n] || "#9ca3af"}` }}>
                        <span className="text-xs font-bold text-gray-600">Indoor</span>
                      </div>
                    ) : (
                      <div className="rounded h-full w-full flex items-center justify-center bg-white relative" style={{ border: `3px solid ${borderColors[n] || "#9ca3af"}` }}>
                        <span className="text-sm font-bold text-gray-600">{n}</span>
                        {n === 8 && (
                          <span className="absolute top-1 right-1 text-[8px] font-bold text-yellow-600 bg-yellow-100 px-1 rounded">↻</span>
                        )}
                      </div>
                    )}
                  </Cell>
                ))
              )}
            </div>
          );
        })()}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-3 text-[10px] text-gray-500">
        <span className="flex items-center gap-1"><span className="inline-block rounded w-4 h-4 bg-white" style={{ border: "3px solid #1f2937" }} /> Active (5 groups)</span>
        <span className="flex items-center gap-1"><span className="inline-block rounded w-4 h-4 bg-gray-300" style={{ border: "3px solid #9ca3af" }} /> Indoor</span>
        <span className="flex items-center gap-1"><span className="inline-block rounded w-4 h-4 bg-white" style={{ border: "3px solid #ef4444" }} /> Ph.1 Expansion</span>
        <span className="flex items-center gap-1"><span className="inline-block rounded w-4 h-4 bg-white" style={{ border: "3px solid #eab308" }} /> Ph.2 Expansion</span>
        <span className="flex items-center gap-1"><span className="inline-block rounded w-4 h-4 bg-white" style={{ border: "3px solid #22c55e" }} /> Ph.3 Expansion</span>
        <span className="flex items-center gap-1"><span className="inline-block rounded w-4 h-4 bg-white" style={{ border: "3px solid #3b82f6" }} /> Ph.4 Expansion</span>
        <span className="flex items-center gap-1"><span className="inline-block rounded w-4 h-4 bg-white relative" style={{ border: "3px solid #1f2937" }}><span className="absolute top-0 right-0 text-[6px] text-yellow-600">↻</span></span> Relocate (Ph.2)</span>
      </div>
    </div>
  );
}
