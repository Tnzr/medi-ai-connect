'use client';

import { useMemo } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { District, Prediction, RiskLevel, WeeklyReport } from '@/lib/types';

const RISK_STYLE: Record<RiskLevel, string> = {
  low: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300',
  moderate: 'bg-amber-500/15 text-amber-700 dark:text-amber-300',
  high: 'bg-orange-500/15 text-orange-700 dark:text-orange-300',
  critical: 'bg-red-500/15 text-red-700 dark:text-red-300',
};
const DISEASE_COLOR: Record<string, string> = {
  dengue: '#f43f5e',
  tb: '#8b5cf6',
  cholera: '#06b6d4',
  malnutrition: '#f59e0b',
};

export default function DistrictPanel({
  district,
  reports,
  predictions,
  onClose,
}: {
  district: District;
  reports: WeeklyReport[];
  predictions: Prediction[];
  onClose: () => void;
}) {
  const series = useMemo(() => {
    const weeks = Array.from(
      new Set(reports.filter((r) => r.districtId === district.id).map((r) => r.weekStartDate)),
    ).sort();
    const map = new Map<string, Record<string, number>>();
    for (const w of weeks) map.set(w, {});
    for (const r of reports) {
      if (r.districtId !== district.id) continue;
      const row = map.get(r.weekStartDate);
      if (row) row[r.diseaseKey] = r.cases;
    }
    return weeks.map((w) => ({ week: w.slice(5), ...(map.get(w) ?? {}) }));
  }, [reports, district.id]);

  const preds = useMemo(
    () =>
      predictions
        .filter((p) => p.districtId === district.id)
        .sort((a, b) => a.horizonDays - b.horizonDays),
    [predictions, district.id],
  );

  const watch = preds.some((p) => p.riskLevel === 'high' || p.riskLevel === 'critical');

  return (
    <aside className="w-full shrink-0 rounded-xl border border-black/10 bg-black/[0.03] p-4 lg:w-[340px] dark:border-white/10 dark:bg-white/[0.04]">
      <div className="mb-2 flex items-start justify-between gap-2">
        <div>
          <h2 className="text-lg font-semibold">{district.name}</h2>
          <p className="text-xs opacity-60">
            Population {district.population.toLocaleString()} · {district.region === 'miami' ? 'Miami-Dade' : 'Rural pilot'} (simulated)
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-full border border-black/20 px-2 py-0.5 text-xs hover:bg-black/5 dark:border-white/20 dark:hover:bg-white/10"
        >
          ✕
        </button>
      </div>

      {watch && (
        <div className="mb-3 rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-xs font-semibold text-red-700 dark:text-red-300">
          ⚠ Outbreak watchlist — high/critical forecast active
        </div>
      )}

      <div className="mb-3">
        <h3 className="mb-1 text-xs font-semibold uppercase tracking-wide opacity-60">Weekly cases by disease</h3>
        <div className="h-40 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={series} margin={{ top: 4, right: 4, bottom: 0, left: -22 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(128,128,128,0.25)" />
              <XAxis dataKey="week" tick={{ fontSize: 10 }} interval={1} />
              <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
              <Tooltip contentStyle={{ fontSize: 12 }} />
              {Object.keys(DISEASE_COLOR).map((k) => (
                <Bar key={k} dataKey={k} stackId="a" fill={DISEASE_COLOR[k]} radius={k === 'malnutrition' ? [3, 3, 0, 0] : 0} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div>
        <h3 className="mb-1 text-xs font-semibold uppercase tracking-wide opacity-60">Forecasts</h3>
        {preds.length === 0 && <p className="text-xs opacity-60">No forecast rows for this district.</p>}
        <div className="space-y-2">
          {preds.map((p) => (
            <div key={p.diseaseKey + p.horizonDays} className="flex items-center justify-between gap-2 rounded-lg border border-black/10 px-3 py-2 text-sm dark:border-white/10">
              <div>
                <span className="font-medium capitalize">{p.diseaseKey}</span>
                <span className="ml-2 text-xs opacity-60">{p.horizonDays}-day</span>
                <div className="text-xs opacity-70">
                  {Math.round(p.predictedCases)} cases · range {Math.round(p.lowerBound)}–{Math.round(p.upperBound)}
                </div>
              </div>
              <span className={'rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase ' + RISK_STYLE[p.riskLevel]}>
                {p.riskLevel}
              </span>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}
