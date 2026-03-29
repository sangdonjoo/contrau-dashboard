"use client";

import type { OperationCard } from "@/data/spirulina-mock";
import PondCard from "./PondCard";

interface KanbanColumnProps {
  label: string;
  cards: OperationCard[];
  isLast?: boolean;
}

export default function KanbanColumn({ label, cards, isLast }: KanbanColumnProps) {
  return (
    <div className="flex items-start gap-1">
      <div className="flex-1 min-w-0">
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-2 min-h-[120px]">
          <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-2 text-center">
            {label}
          </p>
          <div className="space-y-2">
            {cards.length === 0 && (
              <p className="text-[10px] text-gray-300 text-center py-4">Empty</p>
            )}
            {cards.map((card) => (
              <PondCard key={card.pondId} card={card} />
            ))}
          </div>
        </div>
      </div>
      {!isLast && (
        <div className="hidden sm:flex items-center pt-12 text-gray-300 text-lg shrink-0">
          &rarr;
        </div>
      )}
    </div>
  );
}
