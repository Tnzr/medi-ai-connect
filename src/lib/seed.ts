import { tx, get, run } from './db';
import {
  DISTRICTS,
  FACILITIES,
  USERS,
  ENCOUNTERS,
  buildSyncPackets,
  buildWeeklyReports,
  buildPredictions,
} from './seed-data';

/** Idempotent: inserts everything only if the users table is empty. */
export function seed(): void {
  tx(() => {
    if (userCount() > 0) return;

    const generatedAt = new Date().toISOString();
    const { rows: reportRows } = buildWeeklyReports();
    const predictionRows = buildPredictions();
    const packets = buildSyncPackets();

    for (const u of USERS) {
      run('INSERT INTO users (id, role, display_name) VALUES (?, ?, ?)', u.id, u.role, u.displayName);
    }
    for (const d of DISTRICTS) {
      run('INSERT INTO districts (id, name, region, lat, lng, population) VALUES (?, ?, ?, ?, ?, ?)', d.id, d.name, d.region, d.lat, d.lng, d.population);
    }
    for (const f of FACILITIES) {
      run('INSERT INTO facilities (id, name, type, region, lat, lng) VALUES (?, ?, ?, ?, ?, ?)', f.id, f.name, f.type, f.region, f.lat, f.lng);
    }
    for (const e of ENCOUNTERS) {
      run(
        'INSERT INTO encounters (id, facility_name, region, patient_age, patient_sex, modality, ai_finding, confidence, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        e.id, e.facilityName, e.region, e.patientAge, e.patientSex, e.modality, e.aiFinding, e.confidence, e.status, e.createdAt
      );
    }
    for (const p of packets) {
      run(
        'INSERT INTO sync_packets (id, cid, region, facility_name, node_name, size_bytes, encrypted, status, created_at, synced_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        p.id, p.cid, p.region, p.facilityName, p.nodeName, p.sizeBytes, p.encrypted, p.status, p.createdAt, p.syncedAt
      );
    }
    for (const r of reportRows) {
      run('INSERT INTO disease_reports (district_id, week_start, disease_key, cases) VALUES (?, ?, ?, ?)', r.districtId, r.weekStart, r.diseaseKey, r.cases);
    }
    for (const p of predictionRows) {
      run(
        'INSERT INTO predictions (district_id, disease_key, horizon_days, predicted_cases, lower_bound, upper_bound, risk_level, generated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        p.districtId, p.diseaseKey, p.horizonDays, p.predictedCases, p.lowerBound, p.upperBound, p.riskLevel, generatedAt
      );
    }
  });
}

/** Drop everything and reseed from scratch (used by data/seed-demo.ts). */
export function reseed(): void {
  tx(() => {
    for (const t of ['disease_reports', 'predictions', 'sync_packets', 'encounters', 'facilities', 'districts', 'users']) {
      run(`DELETE FROM ${t}`);
    }
  });
  seed();
}

function userCount(): number {
  const row = get<{ n: number }>('SELECT COUNT(*) AS n FROM users');
  return row ? Number(row.n) : 0;
}
