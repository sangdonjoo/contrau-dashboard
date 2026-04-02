"use client";

import { useState } from "react";
import { pipelineStatus, pipelineDates, type PipelineStageInfo } from "@/data/company-mock";

const statusColor: Record<string, string> = {
  green: "bg-green-500",
  yellow: "bg-yellow-400",
  red: "bg-red-500",
};

const stageLabels: Record<string, string> = {
  R0: "R0",
  R1: "R1",
  W: "W",
  M: "M",
  Q: "Q",
  Snapshot: "Snapshot",
};

function singleDateLabel(stage: string): string {
  switch (stage) {
    case "W":
      return `주간 ${pipelineDates.w}`;
    case "M":
      return `월간 ${pipelineDates.m}`;
    case "Q":
      return `분기 ${pipelineDates.q}`;
    default:
      return "";
  }
}

type ExpandedKey = { stage: string; dayIndex?: number } | null;

export default function PipelineStatus() {
  const [expanded, setExpanded] = useState<ExpandedKey>(null);

  const handleDotClick = (stage: string, status: string, dayIndex?: number) => {
    if (status === "green") return;
    setExpanded((prev) => {
      const same =
        prev?.stage === stage &&
        (dayIndex === undefined ? prev?.dayIndex === undefined : prev?.dayIndex === dayIndex);
      return same ? null : { stage, dayIndex };
    });
  };

  const getExpandedInfo = (): { label: string; reason: string; status: string } | null => {
    if (!expanded) return null;
    const s = pipelineStatus.find((s) => s.stage === expanded.stage);
    if (!s) return null;
    if (expanded.dayIndex !== undefined && s.days) {
      const day = s.days[expanded.dayIndex];
      if (!day?.reason) return null;
      return { label: `${s.stage} (${day.date})`, reason: day.reason, status: day.status };
    }
    if (!s.reason) return null;
    return { label: s.stage, reason: s.reason, status: s.status };
  };

  const info = getExpandedInfo();

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 sm:p-5 shadow-sm">
      <h3 className="text-sm font-semibold text-gray-700 mb-1">Pipeline Status</h3>
      <p className="text-xs text-gray-400 mb-4">
        SSOT 파이프라인 수집 현황 — Vietnam time (UTC+7) 기준 어제자
      </p>

      <div className="flex items-start gap-3 sm:gap-4 flex-wrap">
        {pipelineStatus.map((s) => (
          <div key={s.stage} className="flex flex-col items-center gap-1.5">
            <span className="text-xs font-semibold text-gray-700">{stageLabels[s.stage]}</span>

            {s.days ? (
              /* Multi-dot: R0, R1, Snapshot */
              <div className="flex items-center gap-1">
                {s.days.map((day, i) => (
                  <button
                    key={day.date}
                    title={day.date}
                    onClick={() => handleDotClick(s.stage, day.status, i)}
                    className={[
                      "w-2.5 h-2.5 rounded-full transition-transform",
                      statusColor[day.status],
                      day.status === "red" ? "animate-pulse" : "",
                      day.status !== "green" ? "cursor-pointer hover:scale-125" : "cursor-default",
                      expanded?.stage === s.stage && expanded?.dayIndex === i
                        ? "ring-2 ring-offset-1 ring-gray-400 scale-110"
                        : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                  />
                ))}
              </div>
            ) : (
              /* Single dot: W, M, Q */
              <button
                title={singleDateLabel(s.stage)}
                onClick={() => handleDotClick(s.stage, s.status)}
                className={[
                  "w-2.5 h-2.5 rounded-full transition-transform",
                  statusColor[s.status],
                  s.status === "red" ? "animate-pulse" : "",
                  s.status !== "green" ? "cursor-pointer hover:scale-125" : "cursor-default",
                  expanded?.stage === s.stage && expanded?.dayIndex === undefined
                    ? "ring-2 ring-offset-1 ring-gray-400 scale-110"
                    : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
              />
            )}

            {!s.days && (
              <span className="text-[10px] text-gray-400 leading-tight text-center max-w-[72px] truncate">
                {singleDateLabel(s.stage)}
              </span>
            )}
          </div>
        ))}

        <div className="ml-auto flex items-center gap-3 text-[10px] text-gray-400 self-start pt-1">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-green-500 inline-block" /> OK
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-yellow-400 inline-block" /> Flag
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-red-500 inline-block" /> Missing
          </span>
        </div>
      </div>

      {info && (
        <div
          className={`mt-3 p-3 rounded-lg text-xs ${
            info.status === "red"
              ? "bg-red-50 text-red-700 border border-red-200"
              : "bg-yellow-50 text-yellow-700 border border-yellow-200"
          }`}
        >
          <span className="font-semibold">{info.label}:</span> {info.reason}
        </div>
      )}
    </div>
  );
}
