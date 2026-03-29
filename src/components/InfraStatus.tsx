"use client";

import { infraStatus } from "@/data/mock";

const icons: Record<string, string> = {
  zap: "\u26A1",
  battery: "\uD83D\uDD0B",
  wind: "\uD83D\uDCA8",
};

export default function InfraStatus() {
  return (
    <div>
      <h3 className="text-sm font-semibold text-gray-700 mb-3">
        Infrastructure Status
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {infraStatus.map((item) => (
          <div
            key={item.device}
            className="rounded-xl border border-gray-200 bg-white p-3 sm:p-4 shadow-sm"
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl">{icons[item.icon] || ""}</span>
              <span className="text-sm font-semibold text-gray-700">
                {item.device}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-green-500 inline-block" />
              <span className="text-sm font-bold text-green-700">
                {item.status}
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-1">{item.detail}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
