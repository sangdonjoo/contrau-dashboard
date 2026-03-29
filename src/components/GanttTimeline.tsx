"use client";

import { ganttBatches } from "@/data/mock";

const GANTT_START = new Date("2025-08-01");
const GANTT_END = new Date("2026-06-01");
const TOTAL_DAYS =
  (GANTT_END.getTime() - GANTT_START.getTime()) / (1000 * 60 * 60 * 24);

function dayOffset(dateStr: string) {
  return (
    (new Date(dateStr).getTime() - GANTT_START.getTime()) /
    (1000 * 60 * 60 * 24)
  );
}

function pct(days: number) {
  return (days / TOTAL_DAYS) * 100;
}

// Phase color styling based on status
function phaseStyle(status: string): string {
  switch (status) {
    case "success":
      // Past success: outline only, not filled
      return "border-2 border-green-400 bg-transparent";
    case "failed":
      // Softer failure: light rose background with border
      return "border-2 border-rose-300 bg-rose-50";
    case "ongoing":
      // Active: filled green
      return "border-2 border-green-500 bg-green-500";
    case "planned":
      // Future: dashed outline
      return "border-2 border-dashed border-gray-300 bg-transparent";
    default:
      return "border-2 border-gray-200 bg-gray-50";
  }
}

const months = [
  "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May",
];
const monthDates = [
  "2025-08-01", "2025-09-01", "2025-10-01", "2025-11-01", "2025-12-01",
  "2026-01-01", "2026-02-01", "2026-03-01", "2026-04-01", "2026-05-01",
];

export default function GanttTimeline() {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-3 sm:p-5 shadow-sm">
      <h3 className="text-sm font-semibold text-gray-700 mb-4">
        Batch Timeline
      </h3>
      <div className="space-y-2.5">
        {ganttBatches.map((batch) => (
          <div key={batch.id} className="flex items-center gap-3">
            <span className="w-8 sm:w-10 text-[10px] sm:text-xs font-semibold text-gray-600 shrink-0">
              {batch.id}
            </span>
            <div className="relative h-7 flex-1 bg-gray-50/50 rounded">
              {batch.phases.map((phase, i) => {
                const left = pct(dayOffset(phase.startDate));
                const width = pct(
                  dayOffset(phase.endDate) - dayOffset(phase.startDate)
                );
                return (
                  <div
                    key={i}
                    className={`absolute top-0.5 h-6 rounded ${phaseStyle(phase.status)}`}
                    style={{ left: `${left}%`, width: `${Math.max(width, 0.8)}%` }}
                    title={`${phase.phase}: ${phase.startDate} - ${phase.endDate}`}
                  >
                    {/* Show phase label inside only for ongoing */}
                    {phase.status === "ongoing" && (
                      <span className="absolute inset-0 flex items-center justify-center text-[9px] font-bold text-white">
                        {phase.phase}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
            {/* Labels on the right side of the row — hidden on mobile */}
            <span className="hidden sm:block w-40 shrink-0 text-[10px] text-gray-500 truncate">
              {batch.failureReason && (
                <span className="text-rose-500 font-medium">{batch.failureReason}</span>
              )}
              {batch.status === "ongoing" && (
                <span className="text-green-600 font-medium">Active</span>
              )}
              {batch.status === "planned" && (
                <span className="text-gray-400">Planned</span>
              )}
              {batch.status === "completed" && (
                <span className="text-gray-400">Completed</span>
              )}
            </span>
          </div>
        ))}
      </div>

      {/* Month axis */}
      <div className="relative h-5 mt-3 ml-[40px] sm:ml-[52px] mr-2 sm:mr-[172px]">
        {months.map((m, i) => (
          <span
            key={m}
            className="absolute text-[10px] text-gray-400"
            style={{ left: `${pct(dayOffset(monthDates[i]))}%` }}
          >
            {m}
          </span>
        ))}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 sm:gap-4 mt-2 ml-[40px] sm:ml-[52px] text-[10px] text-gray-500">
        <span className="flex items-center gap-1">
          <span className="w-4 h-3 rounded border-2 border-green-400 bg-transparent inline-block" />
          Past (success)
        </span>
        <span className="flex items-center gap-1">
          <span className="w-4 h-3 rounded border-2 border-rose-300 bg-rose-50 inline-block" />
          Failed
        </span>
        <span className="flex items-center gap-1">
          <span className="w-4 h-3 rounded border-2 border-green-500 bg-green-500 inline-block" />
          Active
        </span>
        <span className="flex items-center gap-1">
          <span className="w-4 h-3 rounded border-2 border-dashed border-gray-300 bg-transparent inline-block" />
          Planned
        </span>
      </div>
    </div>
  );
}
