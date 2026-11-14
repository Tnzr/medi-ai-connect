"use client";

import { signOffEncounter } from "@/app/actions";
import type { Encounter } from "@/lib/types";

const MODALITY_LABEL: Record<Encounter["modality"], string> = {
  xray: "X-ray",
  fundus: "Fundus",
  teleconsult: "Teleconsult",
};

const MODALITY_STYLE: Record<Encounter["modality"], string> = {
  xray: "bg-sky-500/15 text-sky-700 dark:text-sky-300",
  fundus: "bg-violet-500/15 text-violet-700 dark:text-violet-300",
  teleconsult: "bg-teal-500/15 text-teal-700 dark:text-teal-300",
};

const STATUS_LABEL: Record<Encounter["status"], string> = {
  pending: "Pending review",
  signed_off: "Signed off",
  escalated: "Escalated",
};

const STATUS_STYLE: Record<Encounter["status"], string> = {
  pending: "bg-amber-500/15 text-amber-700 dark:text-amber-300",
  signed_off: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
  escalated: "bg-rose-500/15 text-rose-700 dark:text-rose-300",
};

function confidenceTone(c: number) {
  if (c >= 0.85) return "bg-emerald-500";
  if (c >= 0.7) return "bg-amber-500";
  return "bg-rose-500";
}

function formatCreated(s: string) {
  const d = new Date(s);
  return isNaN(d.getTime())
    ? s
    : d.toISOString().slice(0, 16).replace("T", " ");
}

export default function EncounterCard({ encounter }: { encounter: Encounter }) {
  const verified = encounter.status === "signed_off";
  const pct = Math.round(Math.min(1, Math.max(0, encounter.confidence)) * 100);

  return (
    <article className="relative overflow-hidden rounded-xl border border-black/10 dark:border-white/10 bg-black/[0.03] dark:bg-white/[0.04] p-4">
      {verified && (
        <div
          aria-hidden
          className="pointer-events-none absolute right-2 top-8 rotate-[-12deg] rounded border-2 border-emerald-500/70 px-3 py-1"
        >
          <span className="text-xs font-black uppercase tracking-widest text-emerald-600/90 dark:text-emerald-400/90">
            Clinician verified
          </span>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <span
          className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${MODALITY_STYLE[encounter.modality]}`}
        >
          {MODALITY_LABEL[encounter.modality]}
        </span>
        <span className="rounded-full border border-black/20 dark:border-white/20 px-2.5 py-0.5 text-xs">
          {encounter.facilityName}
        </span>
        <span className="rounded-full bg-black/10 dark:bg-white/10 px-2.5 py-0.5 text-xs uppercase tracking-wide">
          {encounter.region === "miami" ? "Miami" : "Rural"}
        </span>
      </div>

      <p className="mt-3 text-sm opacity-70">
        Patient {encounter.patientAge} ·{" "}
        {encounter.patientSex === "F"
          ? "Female"
          : encounter.patientSex === "M"
            ? "Male"
            : encounter.patientSex}{" "}
        · {formatCreated(encounter.createdAt)}
      </p>

      <p className="mt-2 text-sm font-medium">{encounter.aiFinding}</p>

      <div className="mt-3">
        <div className="flex items-baseline justify-between text-xs">
          <span className="opacity-70">AI confidence</span>
          <span className="font-semibold tabular-nums">{pct}%</span>
        </div>
        <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-black/10 dark:bg-white/10">
          <div
            className={`h-full rounded-full ${confidenceTone(encounter.confidence)}`}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between gap-2">
        <span
          className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_STYLE[encounter.status]}`}
        >
          {STATUS_LABEL[encounter.status]}
        </span>

        {encounter.status === "pending" && (
          <form action={signOffEncounter.bind(null, encounter.id)}>
            <input type="hidden" name="id" value={encounter.id} />
            <button
              type="submit"
              className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-emerald-500"
            >
              Sign off as clinician-verified
            </button>
          </form>
        )}
      </div>
    </article>
  );
}
