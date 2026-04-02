"use client";

import { dataGroups, getLast5Dates } from "@/data/db-status-mock";

function StatusDots({ last5, dates }: { last5: boolean[]; dates: string[] }) {
  return (
    <div className="flex gap-1 items-center">
      {last5.map((ok, i) => (
        <span
          key={i}
          title={`${dates[i]}: ${ok ? "Collected" : "Missing"}`}
          className={`w-2 h-2 rounded-full ${ok ? "bg-green-500" : "bg-red-400"}`}
        />
      ))}
    </div>
  );
}

function GroupCard({
  group,
  dates,
}: {
  group: (typeof dataGroups)[0];
  dates: string[];
}) {
  const totalEntries = group.entries.length * 5;
  const collected = group.entries.reduce(
    (sum, e) => sum + e.last5.filter(Boolean).length,
    0
  );
  const rate = Math.round((collected / totalEntries) * 100);
  const rateColor =
    rate >= 90
      ? "text-green-600"
      : rate >= 70
        ? "text-yellow-600"
        : "text-red-600";

  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-3 py-2.5 bg-gray-50 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-gray-800">
              {group.teamName}
            </h3>
            <p className="text-[11px] text-gray-400">
              {group.responsible} — {group.role}
            </p>
          </div>
          <span className={`text-sm font-bold ${rateColor}`}>{rate}%</span>
        </div>
      </div>

      {/* Entries */}
      <div className="divide-y divide-gray-50">
        {group.entries.map((entry) => (
          <div
            key={entry.id}
            className="px-3 py-2 flex items-center justify-between gap-2"
          >
            <div className="min-w-0 flex-1">
              <span className="text-xs text-gray-700 block truncate">
                {entry.label}
              </span>
              <span className="text-[10px] text-gray-400">
                {entry.frequency}
              </span>
            </div>
            <StatusDots last5={entry.last5} dates={dates} />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function DataStatusPage() {
  const dates = getLast5Dates();

  // Summary stats
  const totalEntries = dataGroups.reduce((s, g) => s + g.entries.length, 0);
  const totalSlots = totalEntries * 5;
  const totalCollected = dataGroups.reduce(
    (s, g) =>
      s + g.entries.reduce((s2, e) => s2 + e.last5.filter(Boolean).length, 0),
    0
  );
  const overallRate = Math.round((totalCollected / totalSlots) * 100);

  return (
    <div className="space-y-4">
      {/* Summary bar */}
      <div className="rounded-xl border border-gray-200 bg-white p-3 sm:p-4 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h2 className="text-sm font-semibold text-gray-700">
              DB Collection Status — Tra Vinh Factory
            </h2>
            <p className="text-[11px] text-gray-400">
              Last 5-day collection status ({dates[0]} ~ {dates[4]})
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="text-2xl font-bold text-gray-800">
                {overallRate}%
              </span>
              <p className="text-[10px] text-gray-400">
                {totalCollected}/{totalSlots} entries
              </p>
            </div>
            <div className="flex items-center gap-2 text-[10px] text-gray-400">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-green-500" /> OK
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-red-400" /> Missing
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Grid of group cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {dataGroups.map((group) => (
          <GroupCard key={group.id} group={group} dates={dates} />
        ))}
      </div>
    </div>
  );
}
