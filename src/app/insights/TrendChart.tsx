"use client";

import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { DiseaseKey } from "@/lib/types";

export type WeekPoint = {
  week: string;
  [key: string]: string | number | undefined;
};

const DISEASE_META: { key: DiseaseKey; label: string; color: string }[] = [
  { key: "dengue", label: "Dengue", color: "#f97316" },
  { key: "tb", label: "TB", color: "#0ea5e9" },
  { key: "cholera", label: "Cholera", color: "#14b8a6" },
  { key: "malnutrition", label: "Malnutrition", color: "#ef4444" },
];

export default function TrendChart({ data }: { data: WeekPoint[] }) {
  if (!data || data.length === 0) {
    return (
      <p className="flex h-64 items-center justify-center rounded-lg border border-dashed border-black/20 dark:border-white/20 text-sm opacity-60">
        No weekly report data for this region yet.
      </p>
    );
  }

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.15} />
          <XAxis dataKey="week" tick={{ fontSize: 12 }} tickMargin={8} />
          <YAxis tick={{ fontSize: 12 }} width={36} allowDecimals={false} />
          <Tooltip />
          <Legend />
          {DISEASE_META.map((d) => (
            <Line
              key={d.key}
              type="monotone"
              dataKey={d.key}
              name={d.label}
              stroke={d.color}
              strokeWidth={2}
              dot={false}
              connectNulls
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
