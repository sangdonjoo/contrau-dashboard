"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import MeasurementsGrid from "@/components/MeasurementsGrid";
import GrowthChart from "@/components/GrowthChart";
import GanttTimeline from "@/components/GanttTimeline";
import WaterQualityGrid from "@/components/WaterQualityGrid";
import InfraStatus from "@/components/InfraStatus";
import {
  batchB11,
  batchScoreboard,
  lineBatches,
  farms,
} from "@/data/mock";
import type { LineBatchInfo } from "@/data/mock";

type Phase = "P1" | "P2" | "P3";

const PHASE_LABELS: Record<Phase, string> = {
  P1: "Nursery",
  P2: "Intermediate",
  P3: "Grow-out",
};

export default function LineDetailPage() {
  const params = useParams();
  const rawId = params.id as string;

  // Parse farmId-lineNum format (e.g. "CM1-1") or fall back to legacy numeric id
  let lineKey = rawId;
  let displayFarm = "";
  let displayLine = "";
  let lineAreaHa = 0;
  if (rawId.includes("-")) {
    const [farmId, lineNum] = rawId.split("-");
    lineKey = `${farmId}-${lineNum}`;
    const farm = farms.find((f) => f.farmId === farmId);
    displayFarm = farm ? farm.name : farmId;
    displayLine = `Line ${lineNum}`;
    const line = farm?.lines.find((l) => l.id === Number(lineNum));
    if (line) {
      lineAreaHa = line.ponds.reduce((sum, p) => sum + p.areaHa, 0);
    }
  } else {
    lineKey = rawId;
    displayLine = `Line ${rawId}`;
  }

  const phases = lineBatches[lineKey] ?? { P1: null, P2: null, P3: null };

  const defaultPhase = (["P3", "P2", "P1"] as Phase[]).find(
    (p) => phases[p] !== null
  ) ?? null;

  const [selectedPhase, setSelectedPhase] = useState<Phase | null>(defaultPhase);

  const selectedBatch: LineBatchInfo | null =
    selectedPhase ? phases[selectedPhase] : null;

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      {/* Header: Farm + Line (always visible) */}
      <header className="rounded-xl border border-gray-200 bg-white p-4 sm:p-5 shadow-sm mb-4 sm:mb-6">
        <Link
          href="/"
          className="text-xs text-green-600 hover:text-green-700 font-medium"
        >
          &larr; Back to Overview
        </Link>
        <h1 className="text-lg font-bold text-gray-900 mt-2">
          {displayFarm ? <>{displayFarm} &mdash; </> : ""}{displayLine}
        </h1>
        <p className="text-xs text-gray-500 mt-0.5">
          Status: {selectedBatch ? "Active" : "Idle"}{lineAreaHa > 0 ? ` | ${Math.round(lineAreaHa * 10) / 10}ha` : ""}
        </p>
      </header>

      {/* Batch Timeline (Gantt) */}
      <section className="mb-4 sm:mb-6">
        <GanttTimeline />
      </section>

      {/* Phase Navigator — Tab Selector */}
      <section className="rounded-xl border border-gray-200 bg-white p-4 sm:p-5 shadow-sm mb-4 sm:mb-6">
        <h3 className="text-sm font-semibold text-gray-700 mb-3 sm:mb-4">
          Phase Navigator
        </h3>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          {(["P1", "P2", "P3"] as Phase[]).map((phase, i) => {
            const batch = phases[phase];
            const isEmpty = batch === null;
            const isSelected = selectedPhase === phase;

            return (
              <div key={phase} className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={isEmpty}
                  onClick={() => !isEmpty && setSelectedPhase(phase)}
                  title={
                    isEmpty
                      ? `${phase} — Empty`
                      : `${batch.batchCode} | DOC ${batch.doc} | ${batch.weight}g | ${batch.status}`
                  }
                  className={`rounded-lg px-3 py-2 sm:px-4 sm:py-3 min-w-0 sm:min-w-[160px] w-full sm:w-auto text-left transition-all ${
                    isEmpty
                      ? "border-2 border-dashed border-gray-300 bg-gray-50 cursor-not-allowed opacity-60"
                      : isSelected
                        ? "border-2 border-green-500 bg-white shadow-md ring-1 ring-green-200 cursor-pointer"
                        : "border-2 border-gray-200 bg-gray-50 hover:border-gray-400 hover:shadow-sm cursor-pointer"
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        isEmpty
                          ? "bg-gray-300"
                          : isSelected
                            ? "bg-green-500"
                            : "bg-blue-400"
                      }`}
                    />
                    <span className="text-xs font-semibold text-gray-700">
                      {phase}
                      {batch ? ` — ${batch.batchCode}` : ""}
                    </span>
                  </div>
                  {isEmpty ? (
                    <p className="text-[11px] text-gray-400 mt-1">Empty</p>
                  ) : (
                    <>
                      <p className="text-[11px] text-gray-500 mt-1">
                        DOC {batch.doc} | {batch.weight}g
                      </p>
                      <p className="text-[10px] text-gray-400">
                        {batch.pcsPerKg} pcs/kg | {batch.status}
                      </p>
                    </>
                  )}
                </button>
                {i < 2 && (
                  <svg
                    width="24"
                    height="16"
                    viewBox="0 0 24 16"
                    className="text-gray-300 shrink-0 hidden sm:block"
                  >
                    <path
                      d="M0 8h18M14 3l6 5-6 5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    />
                  </svg>
                )}
              </div>
            );
          })}
        </div>
        {selectedBatch && (
          <p className="text-xs text-gray-400 mt-3">
            Showing details for{" "}
            <span className="font-semibold text-gray-600">
              {selectedBatch.batchCode}
            </span>{" "}
            in {selectedPhase} ({PHASE_LABELS[selectedPhase!]})
          </p>
        )}
      </section>

      {/* Batch Title */}
      {selectedBatch ? (
        <section className="rounded-xl border border-gray-200 bg-white p-4 sm:p-5 shadow-sm mb-4 sm:mb-6">
          <h2 className="text-base font-bold text-gray-900">
            {displayFarm ? <>{displayFarm} &mdash; </> : ""}{displayLine} &mdash; Batch {selectedBatch.batchCode.replace("B", "")}
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            DOC: {selectedBatch.doc}/{batchB11.targetDoc} | Started: {batchB11.stockingDate}
          </p>
        </section>
      ) : (
        <section className="rounded-xl border border-gray-200 bg-white p-4 sm:p-5 shadow-sm mb-4 sm:mb-6">
          <h2 className="text-base font-bold text-gray-900">
            {displayFarm ? <>{displayFarm} &mdash; </> : ""}{displayLine} &mdash; Batch 11
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            DOC: {batchB11.doc}/{batchB11.targetDoc} | Started: {batchB11.stockingDate}
          </p>
        </section>
      )}

      {/* 1. Shrimp Measurements — 7 Day Trend */}
      <section className="mb-4 sm:mb-6">
        <MeasurementsGrid />
      </section>

      {/* 2. Water Quality */}
      <section className="mb-4 sm:mb-6">
        <WaterQualityGrid />
      </section>

      {/* 3. Growth Curve */}
      <section className="mb-4 sm:mb-6">
        <GrowthChart />
      </section>

      {/* 4. Batch Scoreboard */}
      <section className="rounded-xl border border-gray-200 bg-white p-4 sm:p-5 shadow-sm mb-4 sm:mb-6">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">
          Batch Scoreboard
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
          {batchScoreboard.map((item) => (
            <div
              key={item.label}
              className="rounded-lg border border-gray-100 bg-gray-50 p-3 text-center"
            >
              <p className="text-[11px] text-gray-500 uppercase tracking-wide">
                {item.label}
              </p>
              <p className="text-lg font-bold text-gray-900 mt-0.5">
                {item.value}
              </p>
              {item.sub && (
                <p className="text-[10px] text-gray-400">{item.sub}</p>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* 5. Infrastructure Status */}
      <section className="mb-4 sm:mb-6">
        <InfraStatus />
      </section>
    </div>
  );
}
