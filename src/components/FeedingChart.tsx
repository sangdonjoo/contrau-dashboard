"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { feedingData } from "@/data/mock";

export default function FeedingChart() {
  return (
    <div>
      <h3 className="text-sm font-semibold text-gray-700 mb-1">
        Feeding Summary — Last 7 Days
      </h3>
      <p className="text-xs text-gray-400 mb-3">Daily feed (kg)</p>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={feedingData} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
          <XAxis dataKey="day" tick={{ fontSize: 10 }} />
          <YAxis tick={{ fontSize: 10 }} domain={[1300, 1500]} />
          <Tooltip contentStyle={{ fontSize: 12 }} formatter={(v) => [`${v} kg`]} />
          <Bar dataKey="amount" fill="#22c55e" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
