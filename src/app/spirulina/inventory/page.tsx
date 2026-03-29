"use client";

import ChemicalList from "@/components/spirulina/inventory/ChemicalList";

export default function InventoryPage() {
  return (
    <div className="space-y-4">
      <h2 className="text-sm font-semibold text-gray-700">Chemical Inventory</h2>
      <ChemicalList />
    </div>
  );
}
