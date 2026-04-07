"use client";

import { useEffect, useState } from "react";
import StockBar from "./StockBar";
import type { ChemicalRow } from "@/app/api/spirulina/inventory/route";

export default function ChemicalList() {
  const [chemicals, setChemicals] = useState<ChemicalRow[]>([]);
  const [available, setAvailable] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/spirulina/inventory")
      .then(r => r.json())
      .then(json => {
        setAvailable(json.available);
        setChemicals(json.data ?? []);
      })
      .catch(() => setAvailable(false))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <p className="text-xs text-gray-400">Loading inventory...</p>;
  }

  if (!available || chemicals.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-center">
        <p className="text-xs text-gray-400">
          {!available ? "No inventory data available yet." : "No chemicals in inventory."}
        </p>
        <p className="text-[10px] text-gray-300 mt-1">
          Syncs automatically when App3 stock-in entries are submitted.
        </p>
      </div>
    );
  }

  const alertCount = chemicals.filter(c => c.reorderThreshold > 0 && c.currentStock < c.reorderThreshold).length;

  return (
    <div className="space-y-3">
      {alertCount > 0 && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3">
          <p className="text-xs font-semibold text-red-700">
            {alertCount} chemical{alertCount !== 1 ? "s" : ""} below reorder threshold
          </p>
        </div>
      )}
      {chemicals.map(chem => (
        <StockBar key={chem.id} chemical={chem} />
      ))}
    </div>
  );
}
