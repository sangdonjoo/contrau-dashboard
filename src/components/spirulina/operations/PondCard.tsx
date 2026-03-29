"use client";

import type { OperationCard } from "@/data/spirulina-mock";

interface PondCardProps {
  card: OperationCard;
}

export default function PondCard({ card }: PondCardProps) {
  const isActive = card.active;
  const isCompleted = card.stage === "completed";
  const isQueued = !isActive && card.stage === "harvest" && card.startedAt === "-";

  return (
    <div className={`rounded-lg border p-2.5 shadow-sm transition-all ${
      isActive
        ? "border-green-500 bg-green-100 ring-2 ring-green-400"
        : isCompleted
          ? "border-gray-200 bg-gray-50 opacity-60"
          : isQueued
            ? "border-gray-200 bg-white opacity-70"
            : "border-gray-200 bg-white"
    }`}>
      <p className={`text-xs font-semibold ${isActive ? "text-green-800" : "text-gray-800"}`}>
        {card.pondId}
      </p>
      {card.harvestKg !== undefined && (
        <p className="text-[10px] text-gray-500 mt-0.5">{card.harvestKg} kg</p>
      )}
      {card.startedAt !== "-" && (
        <p className="text-[10px] text-gray-400 mt-0.5">{card.startedAt}</p>
      )}
      {isQueued && (
        <p className="text-[10px] text-gray-400 mt-0.5">Queued</p>
      )}
    </div>
  );
}
