"use client";

import { factories } from "@/data/spirulina-mock";

interface FactorySelectorProps {
  selectedId: string;
  onSelect: (id: string) => void;
}

export default function FactorySelector({ selectedId, onSelect }: FactorySelectorProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {factories.map((f) => (
        <button
          key={f.id}
          type="button"
          onClick={() => onSelect(f.id)}
          className={`px-3 py-1 text-xs font-medium rounded-full border transition-colors ${
            selectedId === f.id
              ? "bg-green-600 text-white border-green-600"
              : "bg-white text-gray-600 border-gray-300 hover:border-gray-400"
          }`}
        >
          {f.name}
        </button>
      ))}
    </div>
  );
}
