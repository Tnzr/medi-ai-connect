'use client';
import DistrictPanel from './DistrictPanel';
import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.heat';
import type { District, Facility, Prediction, Region, RiskLevel, WeeklyReport } from '@/lib/types';

const RISK_COLOR: Record<RiskLevel, string> = {
  low: '#22c55e',
  moderate: '#f59e0b',
  high: '#f97316',
  critical: '#dc2626',
};
const RISK_RANK: Record<RiskLevel, number> = { low: 0, moderate: 1, high: 2, critical: 3 };
const CENTER_BY_REGION: Record<Region, [number, number]> = {
  miami: [25.83, -80.25],
  rural: [9.16, -83.62],
};
const ZOOM_BY_REGION: Record<Region, number> = { miami: 10, rural: 10 };

export default function MapCanvas({
  region,
  districts,
  facilities,
  reports,
  predictions,
  lastWeekCases,
}: {
  region: Region;
  districts: District[];
  facilities: Facility[];
  reports: WeeklyReport[];
  predictions: Prediction[];
  lastWeekCases: Record<string, number>;
}) {
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const layersRef = useRef<{ heat?: L.Layer; districts?: L.LayerGroup; rings?: L.LayerGroup; facilities?: L.LayerGroup }>({});
  const [showPredictions, setShowPredictions] = useState(true);
  const [horizon, setHorizon] = useState<7 | 14>(7);
  const [selected, setSelected] = useState<District | null>(null);
  const [mapReady, setMapReady] = useState(false);

  const weeks = useMemo(
    () => Array.from(new Set(reports.map((r) => r.weekStartDate))).sort(),
    [reports],
  );
  const lastWeek = weeks[weeks.length - 1] ?? '';

  const riskByDistrict = useMemo(() => {
    const rank: Partial<Record<string, RiskLevel>> = {};
    for (const p of predictions) {
      const cur = rank[p.districtId];
      if (!cur || RISK_RANK[p.riskLevel] > RISK_RANK[cur]) rank[p.districtId] = p.riskLevel;
    }
    return rank;
  }, [predictions]);

  const worstPrediction = useMemo(() => {
    let worst: Prediction | null = null;
    for (const p of predictions) {
      if (!worst || RISK_RANK[p.riskLevel] > RISK_RANK[worst.riskLevel]) worst = p;
    }
    return worst;
  }, [predictions]);

  // Layer rebuild runs on the client whenever inputs change.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReady) return;
    const layers = layersRef.current;

    if (layers.districts) map.removeLayer(layers.districts);
    if (layers.rings) map.removeLayer(layers.rings);
    if (layers.heat) map.removeLayer(layers.heat);

    const lg = L.layerGroup().addTo(map);
    for (const d of districts) {
      const cases = lastWeekCases[d.id] ?? 0;
      const risk = riskByDistrict[d.id] ?? 'moderate';
      const radius = 12 + Math.min(38, Math.sqrt(cases) * 3.2);
      L.circleMarker([d.lat, d.lng], {
        radius,
        color: RISK_COLOR[risk],
        weight: 2,
        fillColor: RISK_COLOR[risk],
        fillOpacity: 0.35,
      })
        .bindTooltip(
          d.name + ' — ' + cases + ' cases last week · risk: ' + risk.toUpperCase(),
          { direction: 'top' },
        )
        .on('click', () => setSelected(d))
        .addTo(lg);
    }
    layers.districts = lg;

    const heatPoints = districts
      .map((d) => [d.lat, d.lng, Math.min(1, (lastWeekCases[d.id] ?? 0) / 60)] as [number, number, number])
      .filter((p) => p[2] > 0);
    if (heatPoints.length > 0) {
      const anyL = L as unknown as { heatLayer?: (pts: [number, number, number][], opts: Record<string, unknown>) => L.Layer };
      if (anyL.heatLayer) {
        layers.heat = anyL.heatLayer(heatPoints, {
          radius: 42,
          blur: 24,
          maxZoom: 12,
          gradient: { 0.2: '#22c55e', 0.45: '#f59e0b', 0.7: '#f97316', 0.9: '#dc2626' },
        }).addTo(map);
      }
    }

    const rg = L.layerGroup();
    if (showPredictions) {
      for (const p of predictions) {
        if (p.horizonDays !== horizon) continue;
        if (p.riskLevel === 'low') continue;
        const color = RISK_COLOR[p.riskLevel];
        const ringRadiusMeters = 900 + Math.sqrt(p.predictedCases) * 260;
        L.circle([districts.find((d) => d.id === p.districtId)?.lat ?? 0, districts.find((d) => d.id === p.districtId)?.lng ?? 0], {
          radius: ringRadiusMeters,
          color,
          weight: 1.5,
          fillColor: color,
          fillOpacity: 0.1,
          dashArray: '4 4',
        })
          .bindTooltip(
            p.districtName + ' — ' + Math.round(p.predictedCases) + ' cases predicted (' + horizon + 'd), range ' +
              Math.round(p.lowerBound) + '–' + Math.round(p.upperBound) + ', ' + p.riskLevel.toUpperCase(),
            { direction: 'top' },
          )
          .addTo(rg);
      }
      rg.addTo(map);
    }
    layers.rings = rg;
  }, [mapReady, districts, lastWeekCases, riskByDistrict, predictions, showPredictions, horizon]);

  // Map init/teardown on region change.
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    const map = L.map(containerRef.current, {
      center: CENTER_BY_REGION[region],
      zoom: ZOOM_BY_REGION[region],
      scrollWheelZoom: true,
    });
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 18,
    }).addTo(map);
    mapRef.current = map;
    setMapReady(true);

    const fg = L.layerGroup().addTo(map);
    const iconFor = (type: string) =>
      L.divIcon({
        className: '',
        html:
          '<div style="width:12px;height:12px;border-radius:3px;background:' +
          (type === 'hospital' ? '#3b82f6' : type === 'mobile' ? '#0ea5e9' : '#e2e8f0') +
          ';border:1.5px solid #1e293b"></div>',
        iconSize: [12, 12],
      });
    for (const f of facilities) {
      L.marker([f.lat, f.lng], { icon: iconFor(f.type) })
        .bindPopup(
          '<strong>' + f.name + '</strong><br/>Type: ' + f.type + '<br/><em>Simulated facility</em>',
        )
        .addTo(fg);
    }
    layersRef.current.facilities = fg;

    return () => {
      map.remove();
      mapRef.current = null;
      layersRef.current = {};
      setMapReady(false);
    };
  }, [region, facilities]);

  // Fly to region center when toggling.
  useEffect(() => {
    mapRef.current?.flyTo(CENTER_BY_REGION[region], ZOOM_BY_REGION[region], { duration: 0.8 });
  }, [region]);

  return (
    <div className="relative">
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <Link
          href="/map?region=miami"
          className={
            'rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ' +
            (region === 'miami'
              ? 'border-transparent bg-foreground text-background'
              : 'border-black/20 opacity-70 hover:opacity-100 dark:border-white/20')
          }
        >
          Miami-Dade
        </Link>
        <Link
          href="/map?region=rural"
          className={
            'rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ' +
            (region === 'rural'
              ? 'border-transparent bg-foreground text-background'
              : 'border-black/20 opacity-70 hover:opacity-100 dark:border-white/20')
          }
        >
          Rural Pilot
        </Link>
        <span className="mx-2 h-5 w-px bg-black/15 dark:bg-white/15" />
        <button
          type="button"
          onClick={() => setShowPredictions((v) => !v)}
          className={
            'rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ' +
            (showPredictions
              ? 'border-transparent bg-foreground text-background'
              : 'border-black/20 opacity-70 hover:opacity-100 dark:border-white/20')
          }
        >
          Prediction overlay {showPredictions ? 'ON' : 'OFF'}
        </button>
        {showPredictions &&
          ([7, 14] as const).map((h) => (
            <button
              key={h}
              type="button"
              onClick={() => setHorizon(h)}
              className={
                'rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ' +
                (horizon === h
                  ? 'border-transparent bg-foreground text-background'
                  : 'border-black/20 opacity-70 hover:opacity-100 dark:border-white/20')
              }
            >
              {h}-day
            </button>
          ))}
        {worstPrediction && RISK_RANK[worstPrediction.riskLevel] >= 2 && (
          <span className="rounded-full bg-red-500/15 px-3 py-1 text-xs font-semibold text-red-700 dark:text-red-300">
            ⚠ {worstPrediction.districtName}: {worstPrediction.diseaseKey} — {worstPrediction.riskLevel.toUpperCase()}
          </span>
        )}
      </div>

      <div className="flex flex-col gap-3 lg:flex-row">
        <div className="relative flex-1">
          <div
            ref={containerRef}
            className="h-[560px] w-full overflow-hidden rounded-xl border border-black/10 bg-slate-800 dark:border-white/10"
          />
          <div className="pointer-events-none absolute bottom-3 left-3 z-[500] rounded-lg border border-black/10 bg-white/90 px-3 py-2 text-xs shadow dark:border-white/10 dark:bg-slate-900/90">
            <div className="mb-1 font-semibold">Risk (latest forecast)</div>
            <div className="flex items-center gap-1.5"><span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: RISK_COLOR.low }} /> low</div>
            <div className="flex items-center gap-1.5"><span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: RISK_COLOR.moderate }} /> moderate</div>
            <div className="flex items-center gap-1.5"><span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: RISK_COLOR.high }} /> high</div>
            <div className="flex items-center gap-1.5"><span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: RISK_COLOR.critical }} /> critical</div>
            <div className="mt-1 border-t border-black/10 pt-1 dark:border-white/10">Dashed rings: {horizon}-day forecast</div>
          </div>
          {!lastWeek && (
            <div className="absolute inset-0 z-[600] flex items-center justify-center rounded-xl bg-slate-800/80 text-sm text-slate-200">
              No simulated reports for this region yet.
            </div>
          )}
        </div>
        {selected && <DistrictPanel district={selected} reports={reports} predictions={predictions} onClose={() => setSelected(null)} />}
      </div>
    </div>
  );
}
