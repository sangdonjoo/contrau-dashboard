"use client";

import { getCiBgClass } from "@/data/spirulina-mock";

interface BagCardProps {
  lotNumber: string;
  weightKg: number;
  colorIndex: number | null;
  size: "small" | "big";
  extraInfo?: string;
  onHover?: () => void;
  onLeave?: () => void;
}

export default function BagCard({
  lotNumber,
  weightKg,
  colorIndex,
  size,
  extraInfo,
  onHover,
  onLeave,
}: BagCardProps) {
  const ciClass = getCiBgClass(colorIndex);
  const isSmall = size === "small";

  return (
    <div
      className={`rounded-lg border shadow-sm transition-all hover:shadow-md cursor-default ${ciClass} ${
        isSmall ? "p-2" : "p-3"
      }`}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
    >
      <p className={`font-semibold truncate ${isSmall ? "text-[10px]" : "text-xs"}`}>
        {lotNumber}
      </p>
      <p className={`mt-0.5 ${isSmall ? "text-[10px]" : "text-xs"}`}>
        {weightKg} kg
      </p>
      <p className={`mt-0.5 ${isSmall ? "text-[10px]" : "text-xs"}`}>
        CI: {colorIndex !== null ? colorIndex : "--"}
      </p>
      {extraInfo && (
        <p className={`mt-0.5 opacity-75 ${isSmall ? "text-[9px]" : "text-[10px]"}`}>
          {extraInfo}
        </p>
      )}
    </div>
  );
}
