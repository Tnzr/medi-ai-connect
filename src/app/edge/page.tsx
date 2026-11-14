import { getSyncPackets } from "@/lib/queries";
import EdgeClient from "./EdgeClient";

export const dynamic = "force-dynamic";

export default function EdgePage() {
  const packets = getSyncPackets();

  return (
    <main className="min-h-screen px-6 py-8">
      <div className="mx-auto max-w-6xl">
        <header className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight">Edge Node Sync — store-and-forward</h1>
          <p className="mt-2 max-w-3xl text-sm opacity-80">
            Community health posts run offline; encrypted encounter packets queue
            locally and batch-sync when a link returns. CIDs are content
            identifiers of encrypted payloads — PHI never leaves the device
            unencrypted.
          </p>
          <p className="mt-2 text-xs font-medium uppercase tracking-wide opacity-60">
            SIMULATED DATA
          </p>
        </header>

        <EdgeClient packets={packets} />
      </div>
    </main>
  );
}
