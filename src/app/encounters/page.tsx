import Link from "next/link";
import { getEncounters, getStats } from "@/lib/queries";
import EncounterCard from "./EncounterCard";

export const dynamic = "force-dynamic";

const STATUS_TABS = [
  { key: "all", label: "All" },
  { key: "pending", label: "Pending" },
  { key: "signed_off", label: "Signed off" },
  { key: "escalated", label: "Escalated" },
] as const;

type StatusKey = (typeof STATUS_TABS)[number]["key"];

export default function EncountersPage({
  searchParams,
}: {
  searchParams?: { status?: string };
}) {
  const raw = searchParams?.status ?? "all";
  const status: StatusKey = STATUS_TABS.some((t) => t.key === raw)
    ? (raw as StatusKey)
    : "all";

  const all = getEncounters();
  const stats = getStats();
  const encounters =
    status === "all" ? all : all.filter((e) => e.status === status);

  const counts = {
    all: all.length,
    pending: all.filter((e) => e.status === "pending").length,
    signed_off: all.filter((e) => e.status === "signed_off").length,
    escalated: all.filter((e) => e.status === "escalated").length,
  };

  return (
    <main className="min-h-screen px-6 py-8">
      <div className="mx-auto max-w-6xl">
        <header className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight">
            Clinical Review Queue
          </h1>
          <p className="mt-1 text-sm opacity-70">
            SIMULATED DATA — Medi-AI Connect demo. {stats.encountersToday}{" "}
            encounters today · {stats.pendingSignoffs} pending sign-offs.
          </p>
        </header>

        <div
          role="note"
          className="mb-6 flex items-start gap-3 rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-3"
        >
          <span aria-hidden className="text-lg leading-none">
            ⚠️
          </span>
          <p className="text-sm font-medium text-amber-800 dark:text-amber-300">
            AI outputs are DRAFT FINDINGS. Nothing is diagnostic until a
            licensed clinician signs off.
          </p>
        </div>

        <nav className="mb-6 flex flex-wrap gap-2" aria-label="Filter by status">
          {STATUS_TABS.map((tab) => {
            const active = tab.key === status;
            return (
              <Link
                key={tab.key}
                href={tab.key === "all" ? "/encounters" : `/encounters?status=${tab.key}`}
                aria-current={active ? "page" : undefined}
                className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
                  active
                    ? "border-transparent bg-foreground text-background"
                    : "border-black/20 dark:border-white/20 opacity-70 hover:opacity-100"
                }`}
              >
                {tab.label}
                <span className="ml-2 rounded-full bg-black/10 px-2 py-0.5 text-xs tabular-nums dark:bg-white/10">
                  {counts[tab.key]}
                </span>
              </Link>
            );
          })}
        </nav>

        {encounters.length === 0 ? (
          <p className="rounded-lg border border-dashed border-black/20 dark:border-white/20 px-4 py-10 text-center text-sm opacity-60">
            No {status === "all" ? "" : status.replace("_", " ")} encounters.
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {encounters.map((encounter) => (
              <EncounterCard key={encounter.id} encounter={encounter} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
