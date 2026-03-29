"use client";

import { useState } from "react";
import { bigBags } from "@/data/spirulina-mock";
import BagCard from "./BagCard";

export default function BigBagGrid() {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-4">
      <h3 className="text-sm font-semibold text-gray-700 mb-3">
        500kg Big Bags — Current Inventory
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {bigBags.map((bag) => (
          <div key={bag.id} className="relative">
            <BagCard
              lotNumber={bag.id}
              weightKg={bag.totalWeightKg}
              colorIndex={bag.blendedColorIndex}
              size="big"
              extraInfo={`${bag.componentLots.length} lots | ${bag.status.replace("_", " ")}`}
              onHover={() => setHoveredId(bag.id)}
              onLeave={() => setHoveredId(null)}
            />
            {hoveredId === bag.id && (
              <div className="absolute z-20 bottom-full left-0 mb-2 w-56 bg-gray-900 text-white text-[10px] rounded-lg p-2.5 shadow-lg pointer-events-none">
                <p className="font-semibold mb-1">Component Lots:</p>
                <div className="space-y-0.5 max-h-32 overflow-y-auto">
                  {bag.componentLots.map((lot) => (
                    <p key={lot} className="text-gray-300">{lot}</p>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
