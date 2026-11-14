'use client';

import dynamic from 'next/dynamic';
import type { District, Facility, Prediction, Region, WeeklyReport } from '@/lib/types';

// Leaflet touches window at import time; load the canvas only in the browser.
const MapCanvas = dynamic(() => import('./MapCanvas'), {
  ssr: false,
  loading: () => (
    <div className="flex h-[560px] w-full items-center justify-center rounded-xl border border-black/10 bg-slate-800 text-sm text-slate-300 dark:border-white/10">
      Loading map&hellip;
    </div>
  ),
});

export default function MapClient(props: {
  region: Region;
  districts: District[];
  facilities: Facility[];
  reports: WeeklyReport[];
  predictions: Prediction[];
  lastWeekCases: Record<string, number>;
}) {
  return (
    <div className="flex flex-col gap-3 lg:flex-row">
      <MapCanvas {...props} />
      <ScenarioSide region={props.region} />
    </div>
  );
}

function ScenarioSide({ region }: { region: Region }) {
  return (
    <aside className="w-full shrink-0 space-y-3 lg:w-[300px]">
      <div className="rounded-xl border border-emerald-500/40 bg-emerald-500/5 p-4">
        <p className="text-xs font-semibold uppercase tracking-widest text-emerald-700 dark:text-emerald-400">
          Demo scenario — {region === 'rural' ? 'semi-rural, underserved' : 'urban health equity'}
        </p>
        <h2 className="mt-1 text-lg font-semibold">{region === 'rural' ? 'San Miguel pilot' : 'Miami-Dade equity view'}</h2>
        <p className="mt-2 text-sm opacity-80">
          {region === 'rural'
            ? 'One health post serves six villages (~17k people). Encounters are captured offline by community health workers, encrypted at the edge, and batch-synced when a link returns — so the surveillance feed lags reality by hours, not weeks.'
            : 'Safety-net clinics across 12 Miami-Dade districts feed the same surveillance pipeline. The equity view highlights where enterprise AI capacity cross-subsidizes community screening — same platform, urban setting.'}
        </p>
      </div>
      <div className="rounded-xl border border-black/10 bg-black/[0.03] p-4 text-sm dark:border-white/10 dark:bg-white/[0.04]">
        <h3 className="text-xs font-semibold uppercase tracking-wide opacity-60">Try in the demo</h3>
        <ul className="mt-2 space-y-2 text-sm opacity-80">
          <li>1. Toggle <strong>Rural Pilot</strong> &mdash; San Miguel turns dark red.</li>
          <li>2. Switch the overlay to <strong>14-day</strong> &mdash; the outbreak ring expands.</li>
          <li>3. Click a district circle &mdash; weekly cases by disease + forecasts.</li>
          <li>4. Open <strong>Edge Sync</strong> &mdash; 5 encrypted packets await, then Sync now.</li>
        </ul>
        <p className="mt-3 text-xs opacity-60">
          Facilities spotted via OpenStreetMap tiles (open, no API key). All health data simulated.
        </p>
      </div>
    </aside>
  );
}
