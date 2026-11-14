"use client";

import Link from "next/link";
import { signOut } from "@/app/actions";

export type NavRole = "clinician" | "official" | "chw";

const LINKS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/map", label: "Map" },
  { href: "/edge", label: "Edge Sync" },
  { href: "/encounters", label: "Encounters" },
  { href: "/insights", label: "Insights" },
];

const ROLE_LABEL: Record<NavRole, string> = {
  clinician: "Clinician",
  official: "Health Official",
  chw: "CHW",
};

export default function Nav({ role }: { role?: string }) {
  const signedIn = role === "clinician" || role === "official" || role === "chw";

  return (
    <header className="border-b border-black/10 dark:border-white/10">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-2 px-6 py-3">
        <Link href="/" className="flex items-center gap-2 text-sm font-bold tracking-tight">
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-emerald-500" aria-hidden />
          Medi-AI Connect
        </Link>

        <nav className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm" aria-label="Primary">
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} className="opacity-70 transition-opacity hover:opacity-100">
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-3">
          <span
            className="rounded-full bg-amber-500/15 px-2.5 py-0.5 text-xs font-semibold text-amber-700 dark:text-amber-300"
            title="All data in this demo is simulated. No PHI, no real patients."
          >
            SIMULATED DATA
          </span>

          {signedIn ? (
            <form action={signOut} className="flex items-center gap-2">
              <span className="text-xs opacity-70">{ROLE_LABEL[role as NavRole]}</span>
              <button
                type="submit"
                className="rounded-full border border-black/20 px-3 py-1 text-xs font-medium transition-colors hover:bg-black/5 dark:border-white/20 dark:hover:bg-white/10"
              >
                Sign out
              </button>
            </form>
          ) : (
            <Link
              href="/"
              className="rounded-full border border-black/20 px-3 py-1 text-xs font-medium transition-colors hover:bg-black/5 dark:border-white/20 dark:hover:bg-white/10"
            >
              Sign in
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
