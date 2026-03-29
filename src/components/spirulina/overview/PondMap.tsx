"use client";

import type { Factory, Pond } from "@/data/spirulina-mock";
import { getOdColor, getOdLabel } from "@/data/spirulina-mock";
import { useState } from "react";

interface PondMapProps {
  factory: Factory;
}

/* ── Thin vertical pond cell (runway shape) ── */
function PondCell({ pond }: { pond: Pond }) {
  const [showTooltip, setShowTooltip] = useState(false);
  const bgColor = getOdColor(pond.od);
  const isPending = pond.status === "pending";
  const textColor = pond.od !== null && pond.od >= 1.0 ? "white" : "#374151";
  const shortId = pond.id.split("-")[1];

  return (
    <div
      className="relative"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <div
        className={`flex items-center justify-center rounded-sm text-[8px] font-bold transition-all cursor-default ${
          pond.harvestPlanTomorrow ? "ring-2 ring-orange-400" : ""
        } ${isPending ? "border border-dashed border-gray-300" : ""}`}
        style={{
          width: 18,
          height: 64,
          backgroundColor: isPending ? "#f5f0e8" : bgColor,
          color: isPending ? "#9ca3af" : textColor,
          writingMode: "vertical-rl",
          textOrientation: "mixed",
        }}
      >
        {shortId}
      </div>
      {showTooltip && (
        <div className="absolute z-20 bottom-full left-1/2 -translate-x-1/2 mb-1 w-40 bg-gray-900 text-white text-[10px] rounded-lg p-2 shadow-lg pointer-events-none">
          <p className="font-semibold">{pond.id}</p>
          <p>OD: {pond.od !== null ? pond.od.toFixed(1) : "N/A"} — {getOdLabel(pond.od)}</p>
          <p>Area: {pond.areaM2.toLocaleString()} m²</p>
          <p>Status: {pond.status}</p>
          {pond.lastHarvestDate && <p>Last harvest: {pond.lastHarvestDate}</p>}
          {pond.harvestPlanTomorrow && (
            <p className="text-orange-300 font-semibold mt-0.5">Harvest planned tomorrow</p>
          )}
        </div>
      )}
    </div>
  );
}

/* ── Pond group: ponds side-by-side in pairs ── */
function PondGroup({ label, ponds }: { label: string; ponds: Pond[] }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <p className="text-[9px] font-semibold text-gray-500 leading-none">{label}</p>
      <div className="flex gap-0.5">
        {ponds.map((p) => (
          <PondCell key={p.id} pond={p} />
        ))}
      </div>
    </div>
  );
}

/* ── Facility block ── */
function Facility({ label, sublabel, className = "" }: { label: string; sublabel?: string; className?: string }) {
  return (
    <div className={`rounded border border-gray-300 bg-gray-200/60 flex flex-col items-center justify-center gap-0.5 ${className}`}>
      <span className="text-[9px] font-bold text-gray-500 text-center leading-tight">{label}</span>
      {sublabel && (
        <span className="text-[8px] text-gray-400 text-center leading-tight">{sublabel}</span>
      )}
    </div>
  );
}

/* ── Future expansion zone ── */
function FutureZone({ label, phase, className = "" }: { label: string; phase: string; className?: string }) {
  return (
    <div className={`rounded border border-dashed flex flex-col items-center justify-center gap-0.5 ${className}`}
      style={{ borderColor: "#d4c9a8", backgroundColor: "rgba(212,201,168,0.08)" }}
    >
      <span className="text-[8px] font-semibold text-gray-400 text-center leading-tight">{label}</span>
      <span className="text-[7px] text-gray-300 text-center leading-tight">{phase}</span>
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

  const rwp7Active01_04 = rwp7?.ponds.filter((p) => {
    const n = parseInt(p.id.split("-")[1], 10);
    return n >= 1 && n <= 4;
  }) ?? [];
  const rwp7Active09_12 = rwp7?.ponds.filter((p) => {
    const n = parseInt(p.id.split("-")[1], 10);
    return n >= 9 && n <= 12;
  }) ?? [];
  const rwp7Pending = rwp7?.ponds.filter((p) => p.status === "pending") ?? [];

  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-4">
      <h3 className="text-sm font-semibold text-gray-700 mb-3">Factory Pond Map — Tra Vinh</h3>

      {/* Satellite-style map container */}
      <div
        className="relative rounded-lg overflow-hidden p-3"
        style={{
          backgroundColor: "#ede8db",
          backgroundImage: "radial-gradient(circle at 20% 80%, rgba(180,170,140,0.15) 0%, transparent 50%)",
        }}
      >
        {/*
          Layout grid: 5 columns x 3 rows
          Row 1: RWP4 | RWP5 | Greenhouse | RWP6 | Warehouse
          Row 2: future green | future yellow | future red | RWP7 01-04 + 09-12 | RWP7 pending
          Row 3: (future green cont) | (future yellow) | (future blue zones)
        */}
        <div
          className="grid gap-2"
          style={{
            gridTemplateColumns: "auto auto 1.2fr auto auto",
            gridTemplateRows: "auto auto auto",
          }}
        >
          {/* ── Row 1 ── */}
          {rwp4 && (
            <div className="row-start-1 col-start-1">
              <PondGroup label="RWP4" ponds={rwp4.ponds} />
            </div>
          )}
          {rwp5 && (
            <div className="row-start-1 col-start-2">
              <PondGroup label="RWP5" ponds={rwp5.ponds} />
            </div>
          )}
          <Facility
            label="Indoor GH"
            sublabel="Greenhouse"
            className="row-start-1 col-start-3 min-h-[72px] min-w-[80px] px-2"
          />
          {rwp6 && (
            <div className="row-start-1 col-start-4">
              <PondGroup label="RWP6" ponds={rwp6.ponds} />
            </div>
          )}
          <Facility
            label="Processing"
            sublabel="VBF / Dryer / WH"
            className="row-start-1 col-start-5 min-h-[72px] px-2"
          />

          {/* ── Row 2 ── */}
          <FutureZone
            label="Green Zone"
            phase="Phase 3"
            className="row-start-2 col-start-1 col-end-3 min-h-[52px]"
          />
          <FutureZone
            label="Yellow Zone"
            phase="Phase 2"
            className="row-start-2 col-start-3 min-h-[52px]"
          />
          {/* RWP7 active: 01-04 and 09-12 as two rows of 4 thin ponds */}
          <div className="row-start-2 col-start-4 flex flex-col items-center gap-1">
            <p className="text-[9px] font-semibold text-gray-500 leading-none">RWP7</p>
            <div className="flex gap-0.5">
              {rwp7Active01_04.map((p) => (
                <PondCell key={p.id} pond={p} />
              ))}
            </div>
            <div className="flex gap-0.5">
              {rwp7Active09_12.map((p) => (
                <PondCell key={p.id} pond={p} />
              ))}
            </div>
          </div>
          {/* RWP7 pending */}
          {rwp7Pending.length > 0 && (
            <div className="row-start-2 col-start-5 flex flex-col items-center gap-1">
              <p className="text-[9px] font-semibold text-gray-400 leading-none">RWP7 Pending</p>
              <div className="flex gap-0.5 flex-wrap justify-center" style={{ maxWidth: 80 }}>
                {rwp7Pending.map((p) => (
                  <PondCell key={p.id} pond={p} />
                ))}
              </div>
            </div>
          )}

          {/* ── Row 3: Future expansion zones ── */}
          <FutureZone
            label="Red Zone"
            phase="Phase 1"
            className="row-start-3 col-start-1 col-end-3 min-h-[40px]"
          />
          <FutureZone
            label="Blue Zone A"
            phase="Phase 4"
            className="row-start-3 col-start-3 min-h-[40px]"
          />
          <FutureZone
            label="Blue Zone B"
            phase="Phase 4"
            className="row-start-3 col-start-4 min-h-[40px]"
          />
          <FutureZone
            label="Blue Zone C"
            phase="Phase 4"
            className="row-start-3 col-start-5 min-h-[40px]"
          />
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-3 text-[10px] text-gray-400">
        <span className="flex items-center gap-1">
          <span className="inline-block rounded-sm" style={{ width: 8, height: 20, backgroundColor: "#166534" }} />
          High OD (&ge;1.5)
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block rounded-sm" style={{ width: 8, height: 20, backgroundColor: "#22c55e" }} />
          Mid (&ge;1.0)
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block rounded-sm" style={{ width: 8, height: 20, backgroundColor: "#86efac" }} />
          Low (&ge;0.5)
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block rounded-sm" style={{ width: 8, height: 20, backgroundColor: "#e5e7eb" }} />
          Inactive
        </span>
        <span className="flex items-center gap-1 ml-1 border-l border-gray-200 pl-2">
          <span className="inline-block rounded-sm ring-2 ring-orange-400 bg-white" style={{ width: 8, height: 20 }} />
          Harvest planned
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block rounded-sm border border-dashed border-gray-300" style={{ width: 8, height: 20, backgroundColor: "#f5f0e8" }} />
          Pending
        </span>
        <span className="flex items-center gap-1 ml-1 border-l border-gray-200 pl-2">
          <span className="inline-block rounded-sm border border-dashed" style={{ width: 12, height: 12, borderColor: "#d4c9a8" }} />
          Future zone
        </span>
      </div>
    </div>
  );
}
