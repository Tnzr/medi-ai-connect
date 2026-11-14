import { getDistricts, getFacilities, getPredictions, getWeeklyReports } from '@/lib/queries';
import type { Region } from '@/lib/types';
import MapClient from './MapClient';

export const dynamic = 'force-dynamic';

export default async function MapPage({
  searchParams,
}: {
  searchParams?: { region?: string };
}) {
  const region: Region = searchParams?.region === 'rural' ? 'rural' : 'miami';

  const districts = getDistricts().filter((d) => d.region === region);
  const facilities = getFacilities().filter((f) => f.region === region);
  const reports = getWeeklyReports(region);
  const predictions = getPredictions(region);

  const weeks = Array.from(new Set(reports.map((r) => r.weekStartDate))).sort();
  const lastWeek = weeks[weeks.length - 1] ?? '';
  const lastWeekByDistrict = new Map<string, number>();
  for (const r of reports) {
    if (r.weekStartDate === lastWeek) {
      lastWeekByDistrict.set(r.districtId, (lastWeekByDistrict.get(r.districtId) ?? 0) + r.cases);
    }
  }
  const lastWeekTotal = Array.from(lastWeekByDistrict.values()).reduce((a, b) => a + b, 0);

  const riskRank: Record<string, number> = { low: 0, moderate: 1, high: 2, critical: 3 };
  const worstByDistrict = new Map<string, string>();
  for (const p of predictions) {
    const cur = worstByDistrict.get(p.districtId);
    if (!cur || riskRank[p.riskLevel] > riskRank[cur]) worstByDistrict.set(p.districtId, p.riskLevel);
  }

  const highCritical = predictions.filter((p) => p.riskLevel === 'high' || p.riskLevel === 'critical');

  return (
    <main className="min-h-screen px-6 py-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-4 flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-bold tracking-tight">Geospatial Health Insights</h1>
          <span className="rounded-full bg-amber-500/15 px-3 py-1 text-xs font-semibold text-amber-700 dark:text-amber-300">
            SIMULATED DATA
          </span>
        </header>
        <p className="mb-4 max-w-3xl text-sm opacity-70">
          District-level case heatmap, per-district risk and 7/14-day prediction rings for
          healthcare operations. Demo only — not for clinical or operational use.
        </p>
        <div className="mb-4 flex flex-wrap items-center gap-4 rounded-xl border border-black/10 bg-black/[0.03] px-4 py-3 text-sm dark:border-white/10 dark:bg-white/[0.04]">
          <span>
            Week of <strong>{lastWeek || '—'}</strong>: <strong>{lastWeekTotal}</strong> reported cases ({region === 'miami' ? 'Miami-Dade' : 'Rural pilot'})
          </span>
          <span>
            High/critical forecasts: <strong>{highCritical.length}</strong>
          </span>
          <span>
            Districts tracked: <strong>{districts.length}</strong>
          </span>
        </div>
        <MapClient
          region={region}
          districts={districts}
          facilities={facilities}
          reports={reports}
          predictions={predictions}
          lastWeekCases={Object.fromEntries(lastWeekByDistrict)}
        />
      </div>
    </main>
  );
}
