// Typed query functions over the seeded SQLite store (node:sqlite).
// All functions are synchronous — safe to call directly from server components.
// Every dataset returned is SIMULATED demo data.

import { all } from './db';
import { seed } from './seed';
import type {
  District,
  Facility,
  WeeklyReport,
  Prediction,
  Encounter,
  SyncPacket,
  Stats,
  Region,
} from './types';

// Lazily create the schema + seed demo data on the first query so any page
// works without a manual seed step.
let ready = false;
function initOnce(): void {
  if (!ready) {
    seed();
    ready = true;
  }
}

export function getDistricts(): District[] {
  initOnce();
  return all<District>('SELECT id, name, region, lat, lng, population FROM districts ORDER BY id').map(
    (r) => ({ ...r, population: Number(r.population) })
  );
}

export function getFacilities(): Facility[] {
  initOnce();
  return all<Facility>('SELECT id, name, type, region, lat, lng FROM facilities ORDER BY id').map(
    (r) => ({ ...r })
  );
}

export function getWeeklyReports(region: Region): WeeklyReport[] {
  initOnce();
  return all<WeeklyReport>(
    `SELECT r.district_id AS districtId, d.name AS districtName, d.region AS region,
            r.week_start AS weekStartDate, r.disease_key AS diseaseKey, r.cases
     FROM disease_reports r JOIN districts d ON d.id = r.district_id
     WHERE d.region = ?
     ORDER BY r.week_start, r.district_id, r.disease_key`,
    region
  ).map((r) => ({ ...r }));
}

export function getPredictions(region: Region): Prediction[] {
  initOnce();
  return all<Omit<Prediction, 'horizonDays'> & { horizonDays: number }>(
    `SELECT p.district_id AS districtId, d.name AS districtName, d.region AS region,
            p.disease_key AS diseaseKey, p.horizon_days AS horizonDays,
            p.predicted_cases AS predictedCases, p.lower_bound AS lowerBound,
            p.upper_bound AS upperBound, p.risk_level AS riskLevel, p.generated_at AS generatedAt
     FROM predictions p JOIN districts d ON d.id = p.district_id
     WHERE d.region = ?
     ORDER BY p.district_id, p.disease_key, p.horizon_days`,
    region
  ).map((r) => ({ ...r, horizonDays: r.horizonDays as 7 | 14 }));
}

export function getEncounters(): Encounter[] {
  initOnce();
  return all<Encounter>(
    `SELECT id, facility_name AS facilityName, region, patient_age AS patientAge,
            patient_sex AS patientSex, modality, ai_finding AS aiFinding,
            confidence, status, created_at AS createdAt
     FROM encounters
     ORDER BY created_at DESC`
  ).map((r) => ({ ...r, patientAge: Number(r.patientAge), confidence: Number(r.confidence) }));
}

export function getSyncPackets(): SyncPacket[] {
  initOnce();
  return all<SyncPacket>(
    `SELECT id, cid, region, facility_name AS facilityName, node_name AS nodeName,
            size_bytes AS sizeBytes, encrypted, status, created_at AS createdAt, synced_at AS syncedAt
     FROM sync_packets
     ORDER BY created_at DESC`
  ).map((r) => ({
    ...r,
    sizeBytes: Number(r.sizeBytes),
    encrypted: Number(r.encrypted) as 0 | 1,
    syncedAt: r.syncedAt ?? null,
  }));
}

export function getStats(): Stats {
  initOnce();
  const one = (sql: string, ...params: unknown[]): number => {
    const row = all<{ n: number | bigint }>(sql, ...params)[0];
    return row ? Number(row.n) : 0;
  };
  return {
    encountersToday: one(
      `SELECT COUNT(*) AS n FROM encounters WHERE substr(created_at, 1, 10) = substr(?, 1, 10)`, new Date().toISOString()
    ),
    pendingSignoffs: one(`SELECT COUNT(*) AS n FROM encounters WHERE status = 'pending'`),
    pendingPackets: one(`SELECT COUNT(*) AS n FROM sync_packets WHERE status = 'pending'`),
    totalPackets: one(`SELECT COUNT(*) AS n FROM sync_packets`),
    criticalPredictions: one(`SELECT COUNT(*) AS n FROM predictions WHERE risk_level = 'critical'`),
  };
}
