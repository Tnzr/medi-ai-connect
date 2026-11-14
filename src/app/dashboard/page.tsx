import Link from "next/link";
import { cookies } from "next/headers";
import { getStats } from "@/lib/queries";
import StatsGrid from "./StatsGrid";

export const dynamic = "force-dynamic";

const ROLE_LABEL: Record<string, string> = {
  clinician: "Clinician",
  official: "Health Official",
  chw: "Community Health Worker",
};

export default function DashboardPage() {
  const role = cookies().get("medi_role")?.value;
  const stats = getStats();

  const quickLinks =
    role === "official"
      ? [
          { href: "/map", label: "Open district map" },
          { href: "/insights", label: "Epidemiological insights" },
        ]
      : role === "clinician"
        ? [{ href: "/encounters", label: "Review clinical queue" }]
        : role === "chw"
          ? [{ href: "/edge", label: "Sync edge packets" }]
          : [];

  return (
    <main className="min-h-screen px-6 py-8">
      <div className="mx-auto max-w-6xl">
        <header className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight">Operations Dashboard — SIMULATED DATA</h1>
          <p className="mt-2 text-sm opacity-80">
            {role && ROLE_LABEL[role] ? (
              <>
                Signed in as <strong>{ROLE_LABEL[role]}</strong>.
              </>
            ) : (
              <>
                You are browsing as a <strong>guest</strong> — pick a role on the{" "}
                <Link href="/" className="underline hover:opacity-100">home page</Link> to unlock role-specific views.
              </>
            )}
          </p>
        </header>

        <StatsGrid stats={stats} />

        {quickLinks.length > 0 && (
          <section className="mt-8">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide opacity-60">
              Quick links for your role
            </h2>
            <div className="flex flex-wrap gap-3">
              {quickLinks.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className="rounded-full border border-black/20 px-4 py-2 text-sm font-medium transition-colors hover:bg-black/5 dark:border-white/20 dark:hover:bg-white/10"
                >
                  {l.label} →
                </Link>
              ))}
            </div>
          </section>
        )}

        <p className="mt-10 text-xs opacity-50">
          Demo build. All data simulated. No PHI, no real patients.
        </p>
      </div>
    </main>
  );
}
