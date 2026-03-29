"use client";

import SmallBagGrid from "@/components/spirulina/output/SmallBagGrid";
import BigBagGrid from "@/components/spirulina/output/BigBagGrid";
import ExportButton from "@/components/spirulina/output/ExportButton";

export default function OutputPage() {
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-sm font-semibold text-gray-700">
          Output — QC & Packaging
        </h2>
        <ExportButton />
      </div>
      <SmallBagGrid />
      <BigBagGrid />
    </div>
  );
}
