"use client";

interface KpiCardProps {
  title: string;
  value: string;
  unit?: string;
  subtitle?: string;
  accent?: boolean;
}

export default function KpiCard({ title, value, unit, subtitle, accent }: KpiCardProps) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-3 sm:p-4 shadow-sm">
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
        {title}
      </p>
      <p className="mt-1 flex items-baseline gap-1">
        <span
          className={`text-xl sm:text-2xl font-bold ${accent ? "text-green-600" : "text-gray-900"}`}
        >
          {value}
        </span>
        {unit && <span className="text-sm text-gray-500">{unit}</span>}
      </p>
      {subtitle && (
        <p className="text-[10px] text-gray-400 mt-0.5">{subtitle}</p>
      )}
    </div>
  );
}
