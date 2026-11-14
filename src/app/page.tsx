import Link from "next/link";
import { signIn } from "./actions";

const ROLES = [
  {
    role: "official",
    title: "Health Official",
    tagline: "Regional view for the demo lead",
    detail: "Outbreak watchlist, district KPIs and where to send the mobile unit next.",
    href: "/insights",
    highlight: true,
  },
  {
    role: "clinician",
    title: "Clinician",
    tagline: "Dr. Amara Osei",
    detail: "Review draft AI findings on X-ray and fundus captures, then sign off or escalate.",
    href: "/encounters",
    highlight: false,
  },
  {
    role: "chw",
    title: "Community Health Worker",
    tagline: "Luis Ramirez, edge nodes",
    detail: "Queue encrypted encounter packets offline and batch-sync them when a link returns.",
    href: "/edge",
    highlight: false,
  },
] as const;

export default function Home() {
  return (
    <main className="min-h-screen px-6 py-10">
      <div className="mx-auto max-w-6xl">
        <section className="mb-10">
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
            Hackathon demo — Medi-AI Connect
          </p>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Medi-AI Connect</h1>
          <p className="mt-4 max-w-2xl text-base opacity-80">
            Geospatial health insights and case prediction for healthcare operations —
            with a clinician firmly in the loop over every AI draft, and offline-first
            edge sync so community health posts never lose an encounter.
          </p>
          <div className="mt-4">
            <span className="rounded-full bg-amber-500/15 px-3 py-1 text-xs font-semibold text-amber-700 dark:text-amber-300">
              SIMULATED DATA — demo only, not for clinical or operational use
            </span>
          </div>
        </section>

        <section className="mb-10">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide opacity-60">
            Pick a role to explore
          </h2>
          <div className="grid gap-4 md:grid-cols-3">
            {ROLES.map((r) => (
              <div
                key={r.role}
                className={`flex flex-col rounded-xl border p-5 ${
                  r.highlight
                    ? "border-emerald-500/40 bg-emerald-500/5"
                    : "border-black/10 bg-black/[0.03] dark:border-white/10 dark:bg-white/[0.04]"
                }`}
              >
                <h3 className="text-lg font-semibold">{r.title}</h3>
                <p className="text-xs uppercase tracking-wide opacity-50">{r.tagline}</p>
                <p className="mt-3 flex-1 text-sm opacity-80">{r.detail}</p>
                <form action={signIn} className="mt-4">
                  <input type="hidden" name="role" value={r.role} />
                  <button
                    type="submit"
                    className={`w-full rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                      r.highlight
                        ? "bg-emerald-600 text-white hover:bg-emerald-500"
                        : "border border-black/20 hover:bg-black/5 dark:border-white/20 dark:hover:bg-white/10"
                    }`}
                  >
                    Continue as {r.title}
                  </button>
                </form>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-10">
          <Link
            href="/map"
            className="inline-block rounded-full border border-black/20 px-4 py-2 text-sm font-medium transition-colors hover:bg-black/5 dark:border-white/20 dark:hover:bg-white/10"
          >
            Explore the map as a guest →
          </Link>
        </section>

        <footer className="border-t border-black/10 pt-4 text-xs opacity-60 dark:border-white/10">
          Demo build. All data simulated. No PHI, no real patients.
        </footer>
      </div>
    </main>
  );
}
