"use client";

import { operationCards, operationStages } from "@/data/spirulina-mock";
import type { OperationStage } from "@/data/spirulina-mock";
import KanbanColumn from "./KanbanColumn";
import PondCard from "./PondCard";

export default function KanbanBoard() {
  const cardsByStage = (stage: OperationStage) =>
    operationCards.filter((c) => c.stage === stage);

  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-4">
      {/* Desktop: horizontal 6 columns */}
      <div className="hidden sm:grid sm:grid-cols-6 gap-1">
        {operationStages.map((stage, i) => (
          <KanbanColumn
            key={stage.key}
            label={stage.label}
            cards={cardsByStage(stage.key)}
            isLast={i === operationStages.length - 1}
          />
        ))}
      </div>

      {/* Mobile: vertical stack */}
      <div className="sm:hidden space-y-3">
        {operationStages.map((stage) => {
          const cards = cardsByStage(stage.key);
          return (
            <div key={stage.key}>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide">
                  {stage.label}
                </span>
                <span className="text-[10px] text-gray-400">({cards.length})</span>
                <div className="h-px flex-1 bg-gray-200" />
              </div>
              {cards.length === 0 ? (
                <p className="text-[10px] text-gray-300 pl-2">No cards</p>
              ) : (
                <div className="space-y-1.5 pl-2">
                  {cards.map((card) => (
                    <PondCard key={card.pondId} card={card} />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
