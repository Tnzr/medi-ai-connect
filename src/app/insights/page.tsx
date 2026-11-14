import Link from "next/link";
import { getPredictions, getWeeklyReports } from "@/lib/queries";
import type { DiseaseKey, Prediction, WeeklyReport } from "@/lib/types";
import TrendChart, { type WeekPoint } from "./TrendChart";

export const dynamic = "force-dynamic";

const REGIONS = ["miami", "rural"] as const;
type Region = (typeof REGIONS)[number];

const DISEASE_LABEL: Record<DiseaseKey, string> = {
  dengue: "Dengue",
  tb: "TB",
  cholera: "Cholera",
  malnutrition: "Malnutrition",
};

const ABSTENTION_ROWS = [
  { cohort: "Skin phototype V–VI", reviewRate: "6.2%", flag: "OK" },
  { cohort: "Age 65+", reviewRate: "9.8%", flag: "Review" },
  { cohort: "Rural edge nodes", reviewRate: "12.4%", flag: "Review" },
  { cohort: "Under-5 nutritional", reviewRate: "4.1%", flag: "OK" },
];

function buildWeekPoints(reports: WeeklyReport[]): WeekPoint[] {
  const byWeek = new Map<string, { week: string; values: Partial<Record<DiseaseKey, number>> }>();
  for (const r of reports) {
    if (!REGIONS.includes(r.region as Region)) continue;
    let entry = byWeek.get(r.weekStartDate);
    if (!entry) {
      entry = { week: r.weekStartDate, values: {} };
      byWeek.set(r.weekStartDate, entry);
    }
    entry.values[r.diseaseKey as DiseaseKey] =
      (entry.values[r.diseaseKey as DiseaseKey] ?? 0) + r.cases;
  }
  return Array.from(byWeek.values())
    .sort((a, b) => a.week.localeCompare(b.week))
    .map((e): WeekPoint => {
      const row: WeekPoint = { week: e.week };
      for (const [key, value] of Object.entries(e.values)) {
        if (typeof value === "number") row[key] = value;
      }
      return row;
    });
}

function malnutritionSentence(points: WeekPoint[]): string {
  const series = points.map(
    (p): number => (typeof p.malnutrition === "number" ? p.malnutrition : 0)
  );
  if (series.length === 0) {
    return "No malnutrition data available for this region yet.";
  }
  const last = series[series.length - 1];
  const window = series.slice(-4);
  const avg4 =
    window.reduce((sum, v) => sum + v, 0) / window.length;
  const delta = last - avg4;
  const pctDelta = avg4 !== 0 ? (delta / avg4) * 100 : 0;
  if (Math.abs(pctDelta) < 5) {
    return `Malnutrition demand is holding steady: latest week ${last} cases vs a 4-week average of ${avg4.toFixed(1)} (${delta >= 0 ? "+" : ""}${pctDelta.toFixed(0)}%).`;
  }
  return delta > 0
    ? `Malnutrition demand is rising: latest week ${last} cases, ${pctDelta.toFixed(0)}% above the 4-week average of ${avg4.toFixed(1)}.`
    : `Malnutrition demand is falling: latest week ${last} cases, ${Math.abs(pctDelta).toFixed(0)}% below the 4-week average of ${avg4.toFixed(1)}.`;
}

function worstRank(level: Prediction["riskLevel"]): number {
  switch (level) {
    case "critical":
      return 0;
    case "high":
      return 1;
    case "moderate":
      return 2;
    default:
      return 3;
  }
}

export default function InsightsPage({
  searchParams,
}: {
  searchParams?: { region?: string };
}) {
  const raw = searchParams?.region ?? "miami";
  const region: Region = REGIONS.includes(raw as Region)
    ? (raw as Region)
    : "miami";

  const reports = getWeeklyReports(region);
  const predictions = getPredictions(region);
  const points = buildWeekPoints(reports);

  const watchlist = predictions
    .filter((p) => p.riskLevel === "high" || p.riskLevel === "critical")
    .sort((a, b) => worstRank(b.riskLevel) - worstRank(a.riskLevel) || b.predictedCases - a.predictedCases);

  const malnutrition = malnutritionSentence(points);

  return (
    <main className="min-h-screen px-6 py-8">
      <div className="mx-auto max-w-6xl">
        <header className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight">
            Epidemiological Insights — SIMULATED DATA
          </h1>
          <p className="mt-1 text-sm opacity-70">
            Regional trends, model abstention and outbreak watchlist. Demo only —
            not for clinical or operational use.
          </p>
          <nav className="mt-3 flex gap-2" aria-label="Filter by region">
            {REGIONS.map((r) => {
              const active = r === region;
              return (
                <Link
                  key={r}
                  href={`/insights?region=${r}`}
                  aria-current={active ? "page" : undefined}
                  className={`rounded-full border px-4 py-1.5 text-sm font-medium capitalize transition-colors ${
                    active
                      ? "border-transparent bg-foreground text-background"
                      : "border-black/20 dark:border-white/20 opacity-70 hover:opacity-100"
                  }`}
                >
                  {r === "miami" ? "Miami" : "Rural"}
                </Link>
              );
            })}
          </nav>
        </header>

        <section className="mb-6 rounded-xl border border-black/10 dark:border-white/10 bg-black/[0.03] dark:bg-white/[0.04] p-4">
          <h2 className="mb-1 text-sm font-semibold">
            Weekly cases by disease — {region === "miami" ? "Miami" : "Rural"}
          </h2>
          <TrendChart data={points} />
        </section>

        <section className="mb-6 rounded-xl border border-amber-500/40 bg-amber-500/10 p-4">
          <h2 className="text-sm font-semibold text-amber-800 dark:text-amber-300">
            Nutritional demand signal
          </h2>
          <p className="mt-1 text-sm text-amber-900 dark:text-amber-200">
            {malnutrition}
          </p>
        </section>

        <section className="mb-6 rounded-xl border border-black/10 dark:border-white/10 bg-black/[0.03] dark:bg-white/[0.04] p-4">
          <div className="mb-3 flex items-center justify-between gap-2">
            <h2 className="text-sm font-semibold">
              Stratified model abstention
            </h2>
            <span className="rounded-full bg-black/10 dark:bg-white/10 px-2.5 py-0.5 text-xs font-medium opacity-70">
              illustrative
            </span>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-black/15 dark:border-white/15 text-left text-xs uppercase tracking-wide opacity-60">
                <th className="py-2 pr-4 font-semibold">Cohort</th>
                <th className="py-2 pr-4 font-semibold">Review rate</th>
                <th className="py-2 font-semibold">Abstention flag</th>
              </tr>
            </thead>
            <tbody>
              {ABSTENTION_ROWS.map((row) => (
                <tr key={row.cohort} className="border-b border-black/10 dark:border-white/10 last:border-0">
                  <td className="py-2 pr-4">{row.cohort}</td>
                  <td className="py-2 pr-4 tabular-nums">{row.reviewRate}</td>
                  <td className="py-2">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        row.flag === "OK"
                          ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                          : "bg-amber-500/15 text-amber-700 dark:text-amber-300"
                      }`}
                    >
                      {row.flag}
                      {row.flag === "Review" && <span aria-hidden> ⚑</span>}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className="rounded-xl border border-black/10 dark:border-white/10 bg-black/[0.03] dark:bg-white/[0.04] p-4">
          <h2 className="mb-3 text-sm font-semibold">Outbreak watchlist</h2>
          {watchlist.length === 0 ? (
            <p className="text-sm opacity-60">
              No high or critical predictions for this region.
            </p>
          ) : (
            <ul className="divide-y divide-black/10 dark:divide-white/10">
              {watchlist.map((p) => (
                <li
                  key={`${p.districtId}-${p.diseaseKey}-${p.horizonDays}`}
                  className="flex flex-wrap items-center justify-between gap-2 py-2 first:pt-0 last:pb-0"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-bold uppercase ${
                        p.riskLevel === "critical"
                          ? "bg-rose-500/15 text-rose-700 dark:text-rose-300"
                          : "bg-amber-500/15 text-amber-700 dark:text-amber-300"
                      }`}
                    >
                      {p.riskLevel}
                    </span>
                    <span className="text-sm font-medium">
                      {p.districtName}
                    </span>
                    <span className="text-xs opacity-70">
                      {DISEASE_LABEL[p.diseaseKey as DiseaseKey] ?? p.diseaseKey}
                    </span>
                  </div>
                  <div className="text-xs tabular-nums opacity-80">
                    ~{p.predictedCases} cases · {p.horizonDays}-day horizon
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}
