"use client";

import type { Zone } from "@/data/spirulina-mock";
import PondCell from "./PondCell";

interface ZoneGroupProps {
  zone: Zone;
}

export default function ZoneGroup({ zone }: ZoneGroupProps) {
  const cols = zone.ponds.length <= 4 ? 2 : 4;

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-2">
      <p className="text-[10px] font-semibold text-gray-500 mb-1.5 text-center">
        {zone.label}
      </p>
      <div
        className="grid gap-1.5"
        style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
      >
        {zone.ponds.map((pond) => (
          <PondCell key={pond.id} pond={pond} />
        ))}
      </div>
    </div>
  );
}
