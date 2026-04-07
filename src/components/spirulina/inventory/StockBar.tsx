"use client";

import type { ChemicalRow } from "@/app/api/spirulina/inventory/route";

interface StockBarProps {
  chemical: ChemicalRow;
}

export default function StockBar({ chemical }: StockBarProps) {
  const { peakCapacity, currentStock, todayPlannedUsage, reorderThreshold } = chemical;
  const stockPct = (currentStock / peakCapacity) * 100;
  const reorderPct = (reorderThreshold / peakCapacity) * 100;
  const usagePct = (todayPlannedUsage / peakCapacity) * 100;
  const usageStartPct = Math.max(0, stockPct - usagePct);
  const belowThreshold = currentStock < reorderThreshold;
  const fillColor = belowThreshold ? "#ef4444" : "#22c55e";

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-3 shadow-sm">
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-gray-800">{chemical.name}</span>
          {belowThreshold && (
            <span className="text-red-500 text-sm" title="Below reorder threshold">
              &#9888;
            </span>
          )}
        </div>
        <span className="text-[10px] text-gray-400">
          {currentStock.toLocaleString()} / {peakCapacity.toLocaleString()} {chemical.unit}
        </span>
      </div>

      {/* Bar */}
      <div className="relative h-6 bg-gray-100 rounded-md overflow-visible">
        {/* Current stock fill */}
        <div
          className="absolute top-0 left-0 h-full rounded-md transition-all"
          style={{
            width: `${Math.min(stockPct, 100)}%`,
            backgroundColor: fillColor,
            opacity: 0.7,
          }}
        />

        {/* Today planned usage bracket */}
        {todayPlannedUsage > 0 && (
          <div
            className="absolute top-0 h-full border-2 border-gray-800 rounded-sm"
            style={{
              left: `${Math.min(usageStartPct, 100)}%`,
              width: `${Math.min(usagePct, 100 - usageStartPct)}%`,
            }}
            title={`Planned usage: ${todayPlannedUsage} ${chemical.unit}`}
          />
        )}

        {/* Reorder threshold line */}
        <div
          className="absolute top-0 h-full w-0.5 bg-red-500"
          style={{ left: `${Math.min(reorderPct, 100)}%` }}
          title={`Reorder at ${reorderThreshold} ${chemical.unit}`}
        />
      </div>

      {/* Details row */}
      <div className="flex items-center gap-3 mt-1 text-[10px] text-gray-400">
        <span>Planned: {todayPlannedUsage} {chemical.unit}</span>
        <span>Min: {reorderThreshold} {chemical.unit}</span>
        {belowThreshold && (
          <span className="text-red-500 font-semibold">REORDER NEEDED</span>
        )}
      </div>
    </div>
  );
}
