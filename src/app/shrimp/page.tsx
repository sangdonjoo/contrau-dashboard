"use client";

import { useState } from "react";
import Link from "next/link";
import KpiCard from "@/components/KpiCard";
import PondRow from "@/components/PhaseFlow";
import { farms, computeKpiForLines } from "@/data/mock";
import type { FarmInfo, LineInfo } from "@/data/mock";

const BATCH_REPORTS: Array<{
  batch: number; status: string; period: string;
  harvestKg: number | null; revenueB: string | null;
  survivalRate: string | null; grossMargin: string | null; note: string | null;
}> = [
  {
    batch: 11, status: 'completed',
    period: 'Jan 23 – Apr 8, 2026 (75일)',
    harvestKg: 25067, revenueB: '2.54', survivalRate: '~71%',
    grossMargin: 'COGS 계산 중',
    note: 'B11: 첫 상업 수확 성공. 주요 바이어: Vu Duong, Nguyen Chi Nguyen',
  },
  {
    batch: 10, status: 'completed',
    period: 'Nov 8 – Dec 24, 2025 (47일)',
    harvestKg: 10326, revenueB: '0.80', survivalRate: '54.8%',
    grossMargin: null,
    note: '6–8g급. P1→P2→P3 운영',
  },
  {
    batch: 9, status: 'completed',
    period: 'Sep 21 – Oct 26, 2025 (36일)',
    harvestKg: 7915, revenueB: '0.33', survivalRate: '79.2%',
    grossMargin: null,
    note: '5g급 급매. 33일차 바이러스 감염 증세',
  },
  {
    batch: 7, status: 'completed',
    period: 'Jul 7 – Aug 19, 2025 (44일)',
    harvestKg: 3189, revenueB: null, survivalRate: '52.8%',
    grossMargin: null,
    note: 'P2에서 폐사 발생 후 전량 급매',
  },
  {
    batch: 3, status: 'completed',
    period: 'Jan 11 – Mar 14, 2025',
    harvestKg: 2422, revenueB: '0.18', survivalRate: '8.8%',
    grossMargin: '-',
    note: 'COGS 1.2B / 매출 0.18B — 손실',
  },
];

export default function OverviewPage() {
  const [selectedFarmId, setSelectedFarmId] = useState<string | null>(null);
  const [selectedBatch, setSelectedBatch] = useState<number | null>(null);

  const completedBatches = BATCH_REPORTS.filter(b => b.status === 'completed');
  const avgHarvest = completedBatches.reduce((s, b) => s + (b.harvestKg ?? 0), 0) / completedBatches.length;
  const avgSurvival = completedBatches.filter(b => b.survivalRate).length;
  const activeBatch = BATCH_REPORTS.find(b => b.status === 'active') ?? null;
  const displayBatch = selectedBatch !== null ? BATCH_REPORTS.find(b => b.batch === selectedBatch) : null;

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
    <div className="max-w-6xl mx-auto px-4 py-6">
      <header className="mb-4">
        <h1 className="text-xl font-bold text-gray-900">Shrimp Production</h1>
        <p className="text-xs text-gray-400 mt-0.5">
          Ca Mau — farm lines, batch tracking, harvest forecast
        </p>
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

      {/* Batch Reports */}
      <section className="mb-6">
        <h2 className="text-sm font-semibold text-gray-700 mb-3">Batch Reports</h2>
        <div className="flex gap-3 flex-col md:flex-row">

          {/* 전체 평균 카드 (항상 표시) */}
          <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 shadow-sm w-full md:w-56 flex-shrink-0">
            <p className="text-[10px] font-semibold text-blue-500 uppercase tracking-wide mb-2">Overall Average</p>
            <div className="space-y-2">
              <div>
                <p className="text-[10px] text-gray-400">Avg Harvest / Batch</p>
                <p className="text-sm font-bold text-gray-800">{(avgHarvest / 1000).toFixed(1)} MT</p>
              </div>
              <div>
                <p className="text-[10px] text-gray-400">Total Batches</p>
                <p className="text-sm font-bold text-gray-800">{BATCH_REPORTS.length}</p>
              </div>
              <div>
                <p className="text-[10px] text-gray-400">Best Batch</p>
                <p className="text-sm font-bold text-green-600">B11 — 25.1 MT</p>
              </div>
              {activeBatch && (
                <div className="pt-1 border-t border-blue-200">
                  <p className="text-[10px] text-green-600 font-semibold">● Active: B{activeBatch.batch}</p>
                </div>
              )}
            </div>
          </div>

          {/* 배치 선택 + 카드 */}
          <div className="flex-1">
            {/* 배치 선택 버튼 */}
            <div className="flex flex-wrap gap-2 mb-3">
              {BATCH_REPORTS.map((b) => (
                <button
                  key={b.batch}
                  type="button"
                  onClick={() => setSelectedBatch(selectedBatch === b.batch ? null : b.batch)}
                  className={`px-3 py-1 text-xs font-medium rounded-full border transition-colors ${
                    selectedBatch === b.batch
                      ? 'bg-green-600 text-white border-green-600'
                      : b.status === 'active'
                      ? 'bg-green-50 text-green-700 border-green-300'
                      : 'bg-white text-gray-600 border-gray-300 hover:border-gray-400'
                  }`}
                >
                  B{b.batch} {b.status === 'active' ? '●' : ''}
                </button>
              ))}
              {selectedBatch !== null && (
                <button
                  type="button"
                  onClick={() => setSelectedBatch(null)}
                  className="px-3 py-1 text-xs text-gray-400 hover:text-gray-600"
                >
                  ✕ 닫기
                </button>
              )}
            </div>

            {/* 선택된 배치 카드 */}
            {displayBatch ? (
              <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-bold text-gray-800">Batch {displayBatch.batch}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                    displayBatch.status === 'completed' ? 'bg-gray-100 text-gray-500' : 'bg-green-100 text-green-700'
                  }`}>
                    {displayBatch.status === 'completed' ? 'Completed' : 'Active'}
                  </span>
                </div>
                <p className="text-[10px] text-gray-400 mb-3">{displayBatch.period}</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
                  <div>
                    <p className="text-[10px] text-gray-400">Harvest</p>
                    <p className="text-sm font-semibold text-gray-800">{displayBatch.harvestKg ? `${(displayBatch.harvestKg/1000).toFixed(1)} MT` : '—'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400">Revenue</p>
                    <p className="text-sm font-semibold text-gray-800">{displayBatch.revenueB ? `${displayBatch.revenueB}B ₫` : '—'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400">Survival Rate</p>
                    <p className="text-sm font-semibold text-gray-800">{displayBatch.survivalRate ?? '—'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400">Gross Margin</p>
                    <p className={`text-sm font-semibold ${
                      !displayBatch.grossMargin ? 'text-gray-400' :
                      displayBatch.grossMargin.startsWith('-') ? 'text-red-500' : 'text-green-600'
                    }`}>
                      {displayBatch.grossMargin ?? 'COGS 계산 중'}
                    </p>
                  </div>
                </div>
                {displayBatch.note && (
                  <p className="text-[10px] text-gray-400 border-t border-gray-100 pt-2">{displayBatch.note}</p>
                )}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-gray-200 p-4 text-center text-xs text-gray-400">
                배치를 선택하면 상세 정보를 볼 수 있어요
              </div>
            )}
          </div>
        </div>
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
