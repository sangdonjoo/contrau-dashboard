"use client";

import { useState } from "react";
import type { PhaseInfo } from "@/data/mock";

const healthColors: Record<number, string> = {
  4: "border-green-600",
  3: "border-lime-600",
  2: "border-yellow-600",
  1: "border-red-600",
};

const healthBgColors: Record<number, string> = {
  4: "#22c55e",
  3: "#84cc16",
  2: "#eab308",
  1: "#ef4444",
};

export default function PondRow({ ponds, showInfraAlert }: { ponds: PhaseInfo[]; showInfraAlert?: boolean }) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  // Compute total area for proportional flex sizing
  const totalArea = ponds.reduce((s, p) => s + p.areaHa, 0);

  return (
    <div className="flex items-center gap-1 w-full relative">
      {ponds.map((p, i) => {
        const isStocked = p.status === "stocked";
        const level = p.healthLevel ?? 4;
        // flex-grow proportional to pond area so they fill the card width
        const flexGrow = p.areaHa / totalArea;
        return (
          <div
            key={i}
            className="relative min-w-0"
            style={{ flex: `${flexGrow} 1 0%` }}
            onMouseEnter={() => isStocked && setHoveredIdx(i)}
            onMouseLeave={() => setHoveredIdx(null)}
          >
            <div
              className={`
                h-7 w-full rounded border transition-all
                ${isStocked ? healthColors[level] : "border-gray-300 border-dashed bg-gray-100"}
              `}
              style={isStocked ? { backgroundColor: healthBgColors[level] } : undefined}
            >
              {isStocked && (
                <div className="flex items-center justify-center h-full gap-1 overflow-hidden">
                  <span className={`font-bold text-white drop-shadow-sm ${p.phase === "P1" ? "text-[10px]" : "text-[10px]"}`}>
                    {p.batchId}
                  </span>
                  {p.phase !== "P1" && (
                    <span className="text-[9px] text-white/80">
                      {p.doc}d
                    </span>
                  )}
                </div>
              )}
            </div>
            {hoveredIdx === i && isStocked && (() => {
              // Position tooltip to the right for leftmost pond (i===0), left for rightmost, centered otherwise
              const isFirst = i === 0;
              const isLast = i === ponds.length - 1;
              const posClass = isFirst
                ? "left-0"
                : isLast
                  ? "right-0"
                  : "left-1/2 -translate-x-1/2";
              const arrowClass = isFirst
                ? "left-4"
                : isLast
                  ? "right-4"
                  : "left-1/2 -translate-x-1/2";
              return (
                <div className={`absolute z-50 bottom-full ${posClass} mb-2 bg-gray-900 text-white text-[11px] rounded-lg px-3 py-2 whitespace-nowrap shadow-lg pointer-events-none`}>
                  <div className="font-semibold">{p.batchId} - {p.phase}</div>
                  <div className="text-gray-300 mt-0.5">
                    DOC: {p.doc} | {p.weightG}g | {p.pcsPerKg} pcs/kg
                  </div>
                  <div className={`absolute top-full ${arrowClass} w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900`} />
                </div>
              );
            })()}
          </div>
        );
      })}
      {showInfraAlert && (
        <span
          className="ml-1 text-base animate-bounce"
          style={{ color: "#ef4444", textShadow: "0 0 6px rgba(239,68,68,0.7), 0 0 12px rgba(239,68,68,0.4)" }}
          title="Infrastructure alert — action required!"
        >
          &#x26A1;
        </span>
      )}
    </div>
  );
}
