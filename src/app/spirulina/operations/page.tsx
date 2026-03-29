"use client";

import KanbanBoard from "@/components/spirulina/operations/KanbanBoard";

export default function OperationsPage() {
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-sm font-semibold text-gray-700">
          Today&apos;s Operation Queue
        </h2>
        <p className="text-xs text-gray-400">{today}</p>
      </div>
      <KanbanBoard />
    </div>
  );
}
