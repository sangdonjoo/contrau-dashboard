"use client";

import { smallBags, bigBags } from "@/data/spirulina-mock";

export default function ExportButton() {
  const handleExport = () => {
    const lines: string[] = [];

    // Small bags section
    lines.push("=== 25kg Bags ===");
    lines.push("Lot Number,Date,Weight (kg),Color Index");
    for (const bag of smallBags) {
      lines.push(
        `${bag.lotNumber},${bag.date},${bag.weightKg},${bag.colorIndex ?? "unmeasured"}`
      );
    }

    lines.push("");
    lines.push("=== 500kg Big Bags ===");
    lines.push("ID,Total Weight (kg),Blended CI,Status,Created,Component Lots");
    for (const bag of bigBags) {
      lines.push(
        `${bag.id},${bag.totalWeightKg},${bag.blendedColorIndex ?? "pending"},${bag.status},${bag.createdDate},"${bag.componentLots.join("; ")}"`
      );
    }

    const csv = lines.join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `spirulina-output-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <button
      type="button"
      onClick={handleExport}
      className="px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-colors"
    >
      Export CSV
    </button>
  );
}
