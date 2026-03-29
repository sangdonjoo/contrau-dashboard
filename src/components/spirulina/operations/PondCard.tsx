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
    <div
      className="rounded-lg border p-2.5 shadow-sm transition-all"
      style={
        isActive
          ? { borderColor: "#22c55e", backgroundColor: "#dcfce7", boxShadow: "0 0 0 2px #4ade80" }
          : isCompleted
            ? { borderColor: "#e5e7eb", backgroundColor: "#f9fafb", opacity: 0.6 }
            : isQueued
              ? { borderColor: "#e5e7eb", backgroundColor: "#ffffff", opacity: 0.7 }
              : { borderColor: "#e5e7eb", backgroundColor: "#ffffff" }
      }
    >
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
