"use client";

import type { Stats } from "@/lib/types";

const LABELS: Record<keyof Stats, { label: string; hint: string; tone: string }> = {
  encountersToday: {
    label: "Encounters today",
    hint: "Captures dated today across all nodes",
    tone: "text-foreground",
  },
  pendingSignoffs: {
    label: "Pending sign-offs",
    hint: "DRAFT AI findings awaiting clinician review",
    tone: "text-amber-600 dark:text-amber-400",
  },
  pendingPackets: {
    label: "Packets queued",
    hint: "Encrypted edge packets not yet synced",
    tone: "text-amber-600 dark:text-amber-400",
  },
  totalPackets: {
    label: "Packets total",
    hint: "All sync packets, queued and synced",
    tone: "text-foreground",
  },
  criticalPredictions: {
    label: "Critical predictions",
    hint: "District×disease forecasts flagged critical",
    tone: "text-rose-600 dark:text-rose-400",
  },
};

export default function StatsGrid({ stats }: { stats: Stats }) {
  const keys = Object.keys(LABELS) as (keyof Stats)[];

  return (
    <section aria-label="Key operations metrics">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {keys.map((k) => {
          const meta = LABELS[k];
          return (
            <div
              key={k}
              title={meta.hint}
              className="rounded-xl border border-black/10 bg-black/[0.03] p-4 dark:border-white/10 dark:bg-white/[0.04]"
            >
              <p className="text-xs font-medium uppercase tracking-wide opacity-60">{meta.label}</p>
              <p className={`mt-2 text-3xl font-bold tabular-nums ${meta.tone}`}>{stats[k]}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
