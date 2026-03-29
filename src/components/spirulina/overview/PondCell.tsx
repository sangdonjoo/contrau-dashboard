"use client";

import { useState } from "react";
import type { Pond } from "@/data/spirulina-mock";
import { getOdColor, getOdLabel } from "@/data/spirulina-mock";

interface PondCellProps {
  pond: Pond;
}

export default function PondCell({ pond }: PondCellProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  const bgColor = getOdColor(pond.od);
  const isPending = pond.status === "pending";
  const textColor = pond.od !== null && pond.od >= 1.0 ? "white" : "#374151";

  return (
    <div
      className="relative"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <div
        className={`flex items-center justify-center rounded-md text-[10px] font-semibold w-full aspect-square transition-all cursor-default ${
          pond.harvestPlanTomorrow ? "ring-2 ring-orange-400" : ""
        } ${isPending ? "border-2 border-dashed border-gray-300" : ""}`}
        style={{
          backgroundColor: isPending ? "#f9fafb" : bgColor,
          color: isPending ? "#9ca3af" : textColor,
        }}
      >
        {pond.id.split("-")[1]}
      </div>

      {showTooltip && (
        <div className="absolute z-20 bottom-full left-1/2 -translate-x-1/2 mb-1 w-40 bg-gray-900 text-white text-[10px] rounded-lg p-2 shadow-lg pointer-events-none">
          <p className="font-semibold">{pond.id}</p>
          <p>OD: {pond.od !== null ? pond.od.toFixed(1) : "N/A"} — {getOdLabel(pond.od)}</p>
          <p>Area: {pond.areaM2.toLocaleString()} m2</p>
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
