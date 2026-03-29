"use client";

import { chemicals } from "@/data/spirulina-mock";
import StockBar from "./StockBar";

export default function ChemicalList() {
  const alertCount = chemicals.filter((c) => c.currentStock < c.reorderThreshold).length;

  return (
    <div className="space-y-3">
      {alertCount > 0 && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3">
          <p className="text-xs font-semibold text-red-700">
            {alertCount} chemical{alertCount !== 1 ? "s" : ""} below reorder threshold
          </p>
        </div>
      )}
      {chemicals.map((chem) => (
        <StockBar key={chem.id} chemical={chem} />
      ))}
    </div>
  );
}
