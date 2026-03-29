"use client";

import type { Factory, Pond } from "@/data/spirulina-mock";
import { getOdColor, getOdLabel } from "@/data/spirulina-mock";
import { useState } from "react";

interface PondMapProps {
  factory: Factory;
}

// ── Compute average OD for a list of ponds (active only) ──
function avgOd(ponds: Pond[]): number | null {
  const active = ponds.filter((p) => p.od !== null && p.status === "active");
  if (active.length === 0) return null;
  return active.reduce((s, p) => s + (p.od as number), 0) / active.length;
}

// ── Tooltip for an existing group ──
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

// ── Existing pond group box ──
function ExistingGroup({
  label,
  ponds,
  style,
}: {
  label: string;
  ponds: Pond[];
  style?: React.CSSProperties;
}) {
  const [hover, setHover] = useState(false);
  const od = avgOd(ponds);
  const bg = getOdColor(od);
  const isLight = od === null || od < 1.0;
  const textClass = isLight ? "text-gray-700" : "text-white";
  const odLabel = getOdLabel(od);
  const hasHarvest = ponds.some((p) => p.harvestPlanTomorrow);

  return (
    <div
      className="relative"
      style={style}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <div
        className={`rounded-lg h-full w-full flex flex-col items-center justify-center gap-0.5 cursor-default border-2 border-gray-700 ${hasHarvest ? "ring-2 ring-orange-400" : ""}`}
        style={{ backgroundColor: bg }}
      >
        <span className={`text-[10px] font-bold leading-none ${textClass}`}>{label}</span>
        <span className={`text-[8px] leading-none ${textClass} opacity-80`}>{odLabel}</span>
        {od !== null && (
          <span className={`text-[8px] leading-none ${textClass} opacity-70`}>
            OD {od.toFixed(1)}
          </span>
        )}
      </div>
      {hover && <GroupTooltip label={label} ponds={ponds} />}
    </div>
  );
}

// ── Existing group that needs relocation (purple border, grey fill) ──
function RelocateGroup({ label, style }: { label: string; style?: React.CSSProperties }) {
  return (
    <div
      className="rounded-lg h-full w-full flex flex-col items-center justify-center gap-0.5 border-2 border-purple-500 bg-gray-400"
      style={style}
    >
      <span className="text-[10px] font-bold text-gray-700 leading-none">{label}</span>
      <span className="text-[8px] text-gray-600 leading-none">relocate</span>
    </div>
  );
}

// ── Facility block (Indoor GH / Processing) ──
function FacilityBlock({
  label,
  style,
}: {
  label: string;
  style?: React.CSSProperties;
}) {
  return (
    <div
      className="rounded-lg h-full w-full flex flex-col items-center justify-center bg-orange-400 border-2 border-orange-500"
      style={style}
    >
      <span className="text-[10px] font-bold text-white text-center leading-tight px-1">{label}</span>
    </div>
  );
}

// ── Future phase box ──
type Phase = 1 | 2 | 3 | 4;
const phaseStyles: Record<Phase, string> = {
  1: "border-red-400",
  2: "border-purple-400",
  3: "border-green-400",
  4: "border-blue-500",
};
const phaseLabels: Record<Phase, string> = {
  1: "Ph.1",
  2: "Ph.2",
  3: "Ph.3",
  4: "Ph.4",
};

function FutureBox({ phase, style }: { phase: Phase; style?: React.CSSProperties }) {
  return (
    <div
      className={`rounded-lg h-full w-full flex items-center justify-center border-2 border-dashed ${phaseStyles[phase]}`}
      style={{ backgroundColor: "rgba(245,240,232,0.35)", ...style }}
    >
      <span className="text-[9px] font-semibold text-gray-400">{phaseLabels[phase]}</span>
    </div>
  );
}

// ── Cell wrapper: positions a box on the CSS grid ──
function Cell({
  row,
  col,
  rowSpan = 1,
  colSpan = 1,
  children,
}: {
  row: number;
  col: number;
  rowSpan?: number;
  colSpan?: number;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        gridRow: rowSpan > 1 ? `${row} / span ${rowSpan}` : row,
        gridColumn: colSpan > 1 ? `${col} / span ${colSpan}` : col,
      }}
    >
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

  const rwp4 = factory.zones.find((z) => z.id === "RWP4");
  const rwp5 = factory.zones.find((z) => z.id === "RWP5");
  const rwp6 = factory.zones.find((z) => z.id === "RWP6");
  const rwp7 = factory.zones.find((z) => z.id === "RWP7");

  // RWP7: 01-04 (top sub-group), 09-12 (bottom sub-group), 05-08 pending → split into two display groups
  const rwp7a = rwp7?.ponds.filter((p) => {
    const n = parseInt(p.id.split("-")[1], 10);
    return n >= 1 && n <= 4;
  }) ?? [];
  const rwp7b = rwp7?.ponds.filter((p) => {
    const n = parseInt(p.id.split("-")[1], 10);
    return n >= 9 && n <= 12;
  }) ?? [];

  const cellH = 72; // base cell height px
  const gap = 6;    // grid gap px

  const gridStyle: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: "repeat(10, 1fr)",
    gridTemplateRows: `${cellH}px ${cellH}px ${cellH}px ${cellH}px`,
    gap: `${gap}px`,
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-4">
      <h3 className="text-sm font-semibold text-gray-700 mb-3">Factory Pond Map — Tra Vinh</h3>

      <div
        className="rounded-lg p-3"
        style={{
          backgroundColor: "#ede8db",
          backgroundImage:
            "radial-gradient(circle at 20% 80%, rgba(180,170,140,0.15) 0%, transparent 50%)",
        }}
      >
        <div style={gridStyle}>
          {/* ─── ROW 1 ─── */}

          {/* Col 1: Future Ph.1 (red dashed) */}
          <Cell row={1} col={1}>
            <FutureBox phase={1} />
          </Cell>

          {/* Col 2: Existing RWP4 (tall — spans rows 1-2) */}
          <Cell row={1} col={2} rowSpan={2}>
            {rwp4 && (
              <ExistingGroup label="RWP4" ponds={rwp4.ponds} style={{ height: "100%" }} />
            )}
          </Cell>

          {/* Col 3: Indoor Greenhouse (orange, spans rows 1-2) */}
          <Cell row={1} col={3} rowSpan={2}>
            <FacilityBlock label="1 Indoor GH" style={{ height: "100%" }} />
          </Cell>

          {/* Col 4: Existing small group (row 1 only) */}
          <Cell row={1} col={4}>
            {rwp5 && (
              <ExistingGroup label="RWP5" ponds={rwp5.ponds} style={{ height: "100%" }} />
            )}
          </Cell>

          {/* ─── ROW 2 ─── */}

          {/* Col 1 row 2: placeholder (part of a gap) */}
          <Cell row={2} col={1}>
            <div className="h-full" />
          </Cell>

          {/* Col 4 row 2: Processing/Warehouse (orange, below RWP5) */}
          <Cell row={2} col={4}>
            <FacilityBlock label="2 Processing" style={{ height: "100%" }} />
          </Cell>

          {/* Col 5-6 row 2: 2 existing groups */}
          <Cell row={2} col={5}>
            {rwp6 && (
              <ExistingGroup label="RWP6" ponds={rwp6.ponds} style={{ height: "100%" }} />
            )}
          </Cell>
          <Cell row={2} col={6}>
            {rwp7a.length > 0 && (
              <ExistingGroup label="RWP7a" ponds={rwp7a} style={{ height: "100%" }} />
            )}
          </Cell>

          {/* Col 7 row 2: Future Ph.1 (red dashed) */}
          <Cell row={2} col={7}>
            <FutureBox phase={1} />
          </Cell>

          {/* Col 8-10 row 2: 3x Future Ph.4 (blue dashed) */}
          <Cell row={2} col={8}>
            <FutureBox phase={4} />
          </Cell>
          <Cell row={2} col={9}>
            <FutureBox phase={4} />
          </Cell>
          <Cell row={2} col={10}>
            <FutureBox phase={4} />
          </Cell>

          {/* ─── ROW 3 ─── */}

          {/* Col 1-3 row 3: 3x Future Ph.3 (green dashed) */}
          <Cell row={3} col={1}>
            <FutureBox phase={3} />
          </Cell>
          <Cell row={3} col={2}>
            <FutureBox phase={3} />
          </Cell>
          <Cell row={3} col={3}>
            <FutureBox phase={3} />
          </Cell>

          {/* Col 4 row 3: Existing group needing relocation (purple border, grey fill) */}
          <Cell row={3} col={4}>
            <RelocateGroup label="RWP?" style={{ height: "100%" }} />
          </Cell>

          {/* Col 5 row 3-4: Future Ph.2 (purple dashed, spans 2 rows) */}
          <Cell row={3} col={5} rowSpan={2}>
            <FutureBox phase={2} style={{ height: "100%" }} />
          </Cell>

          {/* Col 6 row 3: Existing group */}
          <Cell row={3} col={6}>
            {rwp7b.length > 0 && (
              <ExistingGroup label="RWP7b" ponds={rwp7b} style={{ height: "100%" }} />
            )}
          </Cell>

          {/* Col 7 row 3: Future Ph.1 (red dashed) */}
          <Cell row={3} col={7}>
            <FutureBox phase={1} />
          </Cell>

          {/* Col 8-10 row 3: 3x Future Ph.4 (blue dashed) */}
          <Cell row={3} col={8}>
            <FutureBox phase={4} />
          </Cell>
          <Cell row={3} col={9}>
            <FutureBox phase={4} />
          </Cell>
          <Cell row={3} col={10}>
            <FutureBox phase={4} />
          </Cell>

          {/* ─── ROW 4 ─── */}

          {/* Col 1-3 row 4: 3x Future Ph.3 (green dashed) */}
          <Cell row={4} col={1}>
            <FutureBox phase={3} />
          </Cell>
          <Cell row={4} col={2}>
            <FutureBox phase={3} />
          </Cell>
          <Cell row={4} col={3}>
            <FutureBox phase={3} />
          </Cell>

          {/* Col 4 row 4: Future Ph.2 (purple dashed) */}
          <Cell row={4} col={4}>
            <FutureBox phase={2} />
          </Cell>

          {/* Col 5 row 4: occupied by Ph.2 span from row 3 */}

          {/* Col 6-7 row 4: empty / padding */}
        </div>
      </div>

      {/* ── Legend ── */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-3 text-[10px] text-gray-500">
        {/* Existing active */}
        <span className="flex items-center gap-1">
          <span className="inline-block rounded w-4 h-4 bg-gray-800 border-2 border-gray-700" />
          Existing (active)
        </span>
        {/* Relocate */}
        <span className="flex items-center gap-1">
          <span className="inline-block rounded w-4 h-4 bg-gray-400 border-2 border-purple-500" />
          Relocate
        </span>
        {/* Indoor / Processing */}
        <span className="flex items-center gap-1">
          <span className="inline-block rounded w-4 h-4 bg-orange-400 border-2 border-orange-500" />
          Facility (GH / Processing)
        </span>
        {/* Ph.1 */}
        <span className="flex items-center gap-1">
          <span
            className="inline-block rounded w-4 h-4 border-2 border-dashed border-red-400"
            style={{ backgroundColor: "rgba(245,240,232,0.35)" }}
          />
          Future Ph.1
        </span>
        {/* Ph.2 */}
        <span className="flex items-center gap-1">
          <span
            className="inline-block rounded w-4 h-4 border-2 border-dashed border-purple-400"
            style={{ backgroundColor: "rgba(245,240,232,0.35)" }}
          />
          Future Ph.2
        </span>
        {/* Ph.3 */}
        <span className="flex items-center gap-1">
          <span
            className="inline-block rounded w-4 h-4 border-2 border-dashed border-green-400"
            style={{ backgroundColor: "rgba(245,240,232,0.35)" }}
          />
          Future Ph.3
        </span>
        {/* Ph.4 */}
        <span className="flex items-center gap-1">
          <span
            className="inline-block rounded w-4 h-4 border-2 border-dashed border-blue-500"
            style={{ backgroundColor: "rgba(245,240,232,0.35)" }}
          />
          Future Ph.4
        </span>
        {/* OD scale */}
        <span className="flex items-center gap-1 ml-2 pl-2 border-l border-gray-200">
          <span className="inline-block rounded w-3 h-3" style={{ backgroundColor: "#166534" }} />
          OD ≥1.5
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block rounded w-3 h-3" style={{ backgroundColor: "#22c55e" }} />
          OD ≥1.0
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block rounded w-3 h-3" style={{ backgroundColor: "#86efac" }} />
          OD ≥0.5
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block rounded w-3 h-3 bg-gray-200 border border-gray-300" />
          Low / N/A
        </span>
        <span className="flex items-center gap-1 ml-2 pl-2 border-l border-gray-200">
          <span className="inline-block rounded w-3 h-3 ring-2 ring-orange-400 bg-white" />
          Harvest planned
        </span>
      </div>
    </div>
  );
}
