"use client";

import { useState } from "react";
import { pipelineStatus, pipelineDates, type PipelineStageInfo } from "@/data/company-mock";

const statusColor: Record<string, string> = {
  green: "bg-green-500",
  yellow: "bg-yellow-400",
  red: "bg-red-500",
};

const statusRing: Record<string, string> = {
  green: "ring-green-200",
  yellow: "ring-yellow-200",
  red: "ring-red-200",
};

const stageLabels: Record<string, string> = {
  R0: "R0",
  R1: "R1",
  W: "W",
  M: "M",
  Q: "Q",
  Snapshot: "Snapshot",
};

function stageDateLabel(stage: string): string {
  switch (stage) {
    case "R0":
      return pipelineDates.r0.join(", ");
    case "R1":
      return pipelineDates.r1.join(", ");
    case "W":
      return `주간 ${pipelineDates.w}`;
    case "M":
      return `월간 ${pipelineDates.m}`;
    case "Q":
      return `분기 ${pipelineDates.q}`;
    case "Snapshot":
      return pipelineDates.snapshot;
    default:
      return "";
  }
}

export default function PipelineStatus() {
  const [expanded, setExpanded] = useState<string | null>(null);

  const toggle = (stage: PipelineStageInfo) => {
    if (stage.status === "green") return;
    setExpanded((prev) => (prev === stage.stage ? null : stage.stage));
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 sm:p-5 shadow-sm">
      <h3 className="text-sm font-semibold text-gray-700 mb-1">
        Pipeline Status
      </h3>
      <p className="text-xs text-gray-400 mb-4">
        SSOT 파이프라인 수집 현황 — Vietnam time (UTC+7) 기준 어제자
      </p>

      <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
        {pipelineStatus.map((s) => (
          <button
            key={s.stage}
            onClick={() => toggle(s)}
            className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg border transition-all ${
              expanded === s.stage
                ? `border-gray-300 bg-gray-50 ring-2 ${statusRing[s.status]}`
                : "border-transparent hover:bg-gray-50"
            } ${s.status !== "green" ? "cursor-pointer" : "cursor-default"}`}
          >
            <div className={`w-4 h-4 rounded-full ${statusColor[s.status]} ${
              s.status === "red" ? "animate-pulse" : ""
            }`} />
            <span className="text-xs font-semibold text-gray-700">
              {stageLabels[s.stage]}
            </span>
            <span className="text-[10px] text-gray-400 leading-tight text-center max-w-[80px] truncate">
              {stageDateLabel(s.stage)}
            </span>
          </button>
        ))}

        <div className="ml-auto flex items-center gap-3 text-[10px] text-gray-400">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500 inline-block" /> OK</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-yellow-400 inline-block" /> Flag</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500 inline-block" /> Missing</span>
        </div>
      </div>

      {expanded && (() => {
        const info = pipelineStatus.find((s) => s.stage === expanded);
        if (!info || !info.reason) return null;
        return (
          <div className={`mt-3 p-3 rounded-lg text-xs ${
            info.status === "red"
              ? "bg-red-50 text-red-700 border border-red-200"
              : "bg-yellow-50 text-yellow-700 border border-yellow-200"
          }`}>
            <span className="font-semibold">{info.stage}:</span> {info.reason}
          </div>
        );
      })()}
    </div>
  );
}
