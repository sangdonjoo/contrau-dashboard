"use client";

import { smallBags } from "@/data/spirulina-mock";
import BagCard from "./BagCard";

export default function SmallBagGrid() {
  // Group by date
  const byDate = new Map<string, typeof smallBags>();
  for (const bag of smallBags) {
    const existing = byDate.get(bag.date) || [];
    existing.push(bag);
    byDate.set(bag.date, existing);
  }

  const sortedDates = Array.from(byDate.keys()).sort().reverse();

  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-4">
      <h3 className="text-sm font-semibold text-gray-700 mb-3">
        25kg Bags — Rolling 7 Days
      </h3>
      <div className="space-y-3">
        {sortedDates.map((date) => {
          const bags = byDate.get(date)!;
          return (
            <div key={date}>
              <p className="text-[10px] font-medium text-gray-400 mb-1.5">{date}</p>
              <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-7 gap-2">
                {bags.map((bag) => (
                  <BagCard
                    key={bag.lotNumber}
                    lotNumber={bag.lotNumber}
                    weightKg={bag.weightKg}
                    colorIndex={bag.colorIndex}
                    size="small"
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
