"use client";

import { useMemo, useState } from "react";
import { syncPackets } from "@/app/actions";
import type { SyncPacket } from "@/lib/types";

function formatSize(bytes: number): string {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  if (bytes >= 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${bytes} B`;
}

function truncateCid(cid: string): string {
  if (cid.length <= 20) return cid;
  return `${cid.slice(0, 10)}…${cid.slice(-6)}`;
}

function PacketRow({ packet, offline }: { packet: SyncPacket; offline: boolean }) {
  const [copied, setCopied] = useState(false);

  const copyCid = async () => {
    try {
      await navigator.clipboard.writeText(packet.cid);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard unavailable (e.g. insecure context) — no-op
    }
  };

  const pending = packet.status === "pending";

  return (
    <tr className="border-b border-black/10 last:border-0 dark:border-white/10">
      <td className="py-2 pr-4">
        <button
          type="button"
          onClick={copyCid}
          title={`Copy CID ${packet.cid}`}
          className="group font-mono text-xs tabular-nums hover:underline"
        >
          <span className="hidden sm:inline">{truncateCid(packet.cid)}</span>
          <span className="sm:hidden">{truncateCid(packet.cid)}</span>
          <span aria-live="polite" className="ml-1 text-[10px] opacity-0 transition-opacity group-hover:opacity-60">
            {copied ? "copied!" : "copy"}
          </span>
        </button>
      </td>
      <td className="py-2 pr-4 text-sm">{packet.nodeName}</td>
      <td className="py-2 pr-4 text-sm">{packet.facilityName}</td>
      <td className="py-2 pr-4 text-sm tabular-nums">{formatSize(packet.sizeBytes)}</td>
      <td className="py-2 pr-4" title={packet.encrypted ? "Encrypted payload" : "Unencrypted"}>
        {packet.encrypted ? (
          <span aria-label="encrypted" className="text-sm">🔒</span>
        ) : (
          <span aria-label="not encrypted" className="text-sm opacity-40">🔓</span>
        )}
      </td>
      <td className="py-2">
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
            pending
              ? "bg-amber-500/15 text-amber-700 dark:text-amber-300"
              : "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
          } ${pending && offline ? "animate-pulse" : ""}`}
        >
          {pending ? (offline ? "queued · offline" : "pending") : "synced"}
        </span>
      </td>
    </tr>
  );
}

export default function EdgeClient({ packets }: { packets: SyncPacket[] }) {
  const [offline, setOffline] = useState(false);

  const pendingCount = useMemo(() => packets.filter((p) => p.status === "pending").length, [packets]);

  const lastSynced = useMemo(() => {
    const times = packets
      .map((p) => p.syncedAt)
      .filter((t): t is string => Boolean(t))
      .sort();
    return times.length > 0 ? times[times.length - 1] : null;
  }, [packets]);

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-4 rounded-xl border border-black/10 bg-black/[0.03] p-4 dark:border-white/10 dark:bg-white/[0.04]">
        <label className="flex cursor-pointer items-center gap-2 text-sm font-medium">
          <input
            type="checkbox"
            checked={!offline}
            onChange={(e) => setOffline(!e.target.checked)}
            className="h-4 w-4 accent-emerald-600"
          />
          {offline ? "Offline — link down" : "Online — link up"}
        </label>

        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
            offline
              ? "bg-rose-500/15 text-rose-700 dark:text-rose-300"
              : "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
          }`}
        >
          <span className={`inline-block h-2 w-2 rounded-full ${offline ? "bg-rose-500" : "bg-emerald-500 animate-pulse"}`} aria-hidden />
          {offline ? "OFFLINE" : "ONLINE"}
        </span>

        <span className="text-sm opacity-70">
          {pendingCount} packet{pendingCount === 1 ? "" : "s"} pending
        </span>

        <form
          action={async () => {
            await syncPackets();
          }}
          className="ml-auto"
        >
          <button
            type="submit"
            disabled={offline || pendingCount === 0}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
              offline || pendingCount === 0
                ? "cursor-not-allowed border border-black/10 opacity-40 dark:border-white/10"
                : "bg-emerald-600 text-white hover:bg-emerald-500"
            }`}
          >
            {offline ? "Sync now (offline)" : `Sync now (${pendingCount})`}
          </button>
        </form>
      </div>

      <p className="mb-4 text-xs opacity-60" aria-live="polite">
        {lastSynced
          ? `Last synced: ${new Date(lastSynced).toLocaleString()}`
          : "No packets synced yet."}
        {offline && " — sync resumes automatically when the link returns."}
      </p>

      <div className="overflow-x-auto rounded-xl border border-black/10 dark:border-white/10">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-black/15 text-left text-xs uppercase tracking-wide opacity-60 dark:border-white/15">
              <th className="py-2 pr-4 font-semibold">CID</th>
              <th className="py-2 pr-4 font-semibold">Node</th>
              <th className="py-2 pr-4 font-semibold">Facility</th>
              <th className="py-2 pr-4 font-semibold">Size</th>
              <th className="py-2 pr-4 font-semibold">Enc</th>
              <th className="py-2 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody>
            {packets.map((p) => (
              <PacketRow key={p.id} packet={p} offline={offline} />
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-3 text-xs opacity-50">
        Toggle is a simulation of the node&apos;s connectivity — it demonstrates the
        store-and-forward behaviour only.
      </p>
    </div>
  );
}
