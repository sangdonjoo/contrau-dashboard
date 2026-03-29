"use client";

import { useState } from "react";
import Link from "next/link";
import KpiCard from "@/components/KpiCard";
import PondRow from "@/components/PhaseFlow";
import { farms, computeKpiForLines } from "@/data/mock";
import type { FarmInfo, LineInfo } from "@/data/mock";

export default function OverviewPage() {
  const [selectedFarmId, setSelectedFarmId] = useState<string | null>(null);

  const now = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const filteredFarms: FarmInfo[] = selectedFarmId
    ? farms.filter((f) => f.farmId === selectedFarmId)
    : farms;

  const filteredLines: LineInfo[] = filteredFarms.flatMap((f) => f.lines);
  const kpi = computeKpiForLines(filteredLines);

  const totalLines = filteredLines.length;
  const activeLines = filteredLines.filter((l) =>
    l.ponds.some((p) => p.status === "stocked")
  ).length;
  const idleLines = totalLines - activeLines;

  const headerText = selectedFarmId
    ? (() => {
        const farm = farms.find((f) => f.farmId === selectedFarmId)!;
        return `${farm.name}: ${totalLines} line${totalLines !== 1 ? "s" : ""} (${activeLines} active${idleLines > 0 ? ` / ${idleLines} idle` : ""})`;
      })()
    : `Lines: ${totalLines} total (${activeLines} active / ${idleLines} idle) across ${farms.length} farms`;

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">
            Contrau Shrimp Production
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">{headerText}</p>
        </div>
        <p className="text-xs text-gray-400 mt-1 sm:mt-0">{now}</p>
      </header>

      {/* Row 2: Farm Filter Buttons (global) */}
      <section className="flex flex-wrap items-center gap-2 mb-4">
        <button
          type="button"
          onClick={() => setSelectedFarmId(null)}
          className={`px-3 py-1 text-xs font-medium rounded-full border transition-colors ${
            selectedFarmId === null
              ? "bg-green-600 text-white border-green-600"
              : "bg-white text-gray-600 border-gray-300 hover:border-gray-400"
          }`}
        >
          All
        </button>
        {farms.map((farm) => (
          <button
            key={farm.farmId}
            type="button"
            onClick={() => setSelectedFarmId(farm.farmId)}
            className={`px-3 py-1 text-xs font-medium rounded-full border transition-colors ${
              selectedFarmId === farm.farmId
                ? "bg-green-600 text-white border-green-600"
                : "bg-white text-gray-600 border-gray-300 hover:border-gray-400"
            }`}
          >
            {farm.name}
          </button>
        ))}
        <span className="text-xs text-gray-400 ml-2 hidden sm:inline">{headerText}</span>
      </section>

      {/* Row 3: KPI Summary Bar */}
      <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
        <KpiCard
          title="Total Biomass"
          value={`${kpi.totalBiomass}`}
          unit="tons"
          subtitle="Live weight, all lines"
          accent
        />
        <KpiCard title="Active Batches" value={`${kpi.activeBatches}`} />
        <KpiCard
          title="Avg Survival"
          value={`${kpi.avgSurvival}%`}
          accent
        />
        <KpiCard
          title="Next Harvest"
          value={`${kpi.nextHarvestDays}`}
          unit="days"
        />
        <KpiCard
          title="YTD Harvest"
          value={`${kpi.ytdHarvest}`}
          unit="tons"
          subtitle="Cumulative this year"
        />
      </section>

      {/* Production Lines — Factory Floor Panel */}
      <section className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        {/* Legend */}
        <div className="px-4 py-3 border-b border-gray-100">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <h2 className="text-sm font-semibold text-gray-700">
              Production Lines
            </h2>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-gray-400">
              <span className="flex items-center gap-1">
                <span className="w-3 h-2 rounded-sm inline-block" style={{ backgroundColor: "#22c55e" }} />
                Excellent
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-2 rounded-sm inline-block" style={{ backgroundColor: "#84cc16" }} />
                Good
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-2 rounded-sm inline-block" style={{ backgroundColor: "#eab308" }} />
                Fair
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-2 rounded-sm inline-block" style={{ backgroundColor: "#ef4444" }} />
                Poor
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-2 rounded-sm bg-gray-100 border border-dashed border-gray-300 inline-block" />
                Empty
              </span>
              <span className="flex items-center gap-1 ml-1 border-l border-gray-200 pl-2">
                <span className="text-base animate-bounce" style={{ color: "#ef4444", textShadow: "0 0 6px rgba(239,68,68,0.7)" }}>&#x26A1;</span>
                Infra Alert
              </span>
            </div>
          </div>
        </div>

        {/* Farm Groups */}
        <div className="divide-y divide-gray-100">
          {filteredFarms.map((farm) => (
            <div key={farm.farmId} className="px-4 py-3">
              {/* Farm Header */}
              <div className="flex items-center gap-2 mb-3">
                <div className="h-px flex-1 bg-gray-200" />
                <span className="text-[11px] font-semibold text-gray-500 whitespace-nowrap">
                  {farm.name} ({farm.areaHa}ha, {farm.lines.length} line{farm.lines.length !== 1 ? "s" : ""})
                </span>
                <div className="h-px flex-1 bg-gray-200" />
              </div>

              {/* 3-column grid of line cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {farm.lines.map((line) => {
                  const hasStock = line.ponds.some((p) => p.status === "stocked");
                  const hasInfraAlert = line.ponds.some((p) => p.infraAlert);
                  return (
                    <Link
                      key={`${farm.farmId}-${line.id}`}
                      href={`/shrimp/line/${farm.farmId}-${line.id}`}
                      className={`block rounded-lg border p-3 hover:shadow-sm transition-all cursor-pointer overflow-visible ${
                        !hasStock ? "opacity-60" : ""
                      } ${hasInfraAlert ? "infra-alert-border" : "border-gray-200 hover:border-green-300"}`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold text-gray-700">
                          {line.name}
                        </span>
                        {hasInfraAlert && (
                          <span
                            className="text-base animate-bounce"
                            style={{ color: "#ef4444", textShadow: "0 0 6px rgba(239,68,68,0.7)" }}
                          >
                            &#x26A1;
                          </span>
                        )}
                      </div>
                      <PondRow ponds={line.ponds} showInfraAlert={false} />
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
