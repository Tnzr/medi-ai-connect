// SIMULATED DATA for the Medi-AI Connect hackathon demo.
// Every district, facility, patient, encounter and packet below is fictional,
// generated for demo purposes only — no real patient or surveillance data.

import type {
  District,
  Facility,
  User,
  Encounter,
  SyncPacket,
  DiseaseKey,
  Prediction,
} from './types';

/** Deterministic PRNG (mulberry32) so re-seeding produces identical data. */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return function () {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ---------------------------------------------------------------- districts

export const DISTRICTS: District[] = [
  // Miami-Dade (region 'miami')
  { id: 'mia-01', name: 'Little Haiti', region: 'miami', lat: 25.8275, lng: -80.1934, population: 31200 },
  { id: 'mia-02', name: 'Little Havana', region: 'miami', lat: 25.7617, lng: -80.2138, population: 48500 },
  { id: 'mia-03', name: 'Liberty City', region: 'miami', lat: 25.8445, lng: -80.2098, population: 27400 },
  { id: 'mia-04', name: 'Overtown', region: 'miami', lat: 25.7761, lng: -80.1984, population: 10800 },
  { id: 'mia-05', name: 'Wynwood', region: 'miami', lat: 25.8007, lng: -80.1997, population: 16800 },
  { id: 'mia-06', name: 'Downtown', region: 'miami', lat: 25.7743, lng: -80.1937, population: 42100 },
  { id: 'mia-07', name: 'Coral Gables', region: 'miami', lat: 25.7215, lng: -80.2684, population: 49300 },
  { id: 'mia-08', name: 'Hialeah', region: 'miami', lat: 25.8576, lng: -80.2784, population: 223100 },
  { id: 'mia-09', name: 'Kendall', region: 'miami', lat: 25.7102, lng: -80.318, population: 78100 },
  { id: 'mia-10', name: 'Homestead', region: 'miami', lat: 25.7355, lng: -80.398, population: 80300 },
  { id: 'mia-11', name: 'Miami Beach', region: 'miami', lat: 25.7907, lng: -80.1300, population: 82700 },
  { id: 'mia-12', name: 'Aventura', region: 'miami', lat: 25.9565, lng: -80.1409, population: 39200 },
  // Rural pilot districts (region 'rural', fictional)
  { id: 'rur-01', name: 'Cerro Alto', region: 'rural', lat: 9.2136, lng: -83.6129, population: 4200 },
  { id: 'rur-02', name: 'Rio Verde', region: 'rural', lat: 9.3303, lng: -83.7052, population: 1850 },
  { id: 'rur-03', name: 'San Miguel', region: 'rural', lat: 9.1532, lng: -83.7018, population: 5600 },
  { id: 'rur-04', name: 'La Ceiba', region: 'rural', lat: 9.0871, lng: -83.5117, population: 900 },
  { id: 'rur-05', name: 'Palo Blanco', region: 'rural', lat: 9.3078, lng: -83.5392, population: 3100 },
  { id: 'rur-06', name: 'El Rosario', region: 'rural', lat: 8.9926, lng: -83.5785, population: 2400 },
];

// ---------------------------------------------------------------- facilities

export const FACILITIES: Facility[] = [
  { id: 'fac-m01', name: 'Jackson Memorial Hospital', type: 'hospital', region: 'miami', lat: 25.7916, lng: -80.2089 },
  { id: 'fac-m02', name: 'Little Haiti Health Center', type: 'clinic', region: 'miami', lat: 25.8281, lng: -80.1922 },
  { id: 'fac-m03', name: 'Little Havana Comprehensive Clinic', type: 'clinic', region: 'miami', lat: 25.7602, lng: -80.2146 },
  { id: 'fac-m04', name: 'Liberty City Family Health', type: 'clinic', region: 'miami', lat: 25.8438, lng: -80.2081 },
  { id: 'fac-m05', name: 'Overtown Community Clinic', type: 'clinic', region: 'miami', lat: 25.7768, lng: -80.1971 },
  { id: 'fac-m06', name: 'Wynwood Walk-In Center', type: 'clinic', region: 'miami', lat: 25.7998, lng: -80.1989 },
  { id: 'fac-m07', name: 'Hialeah Urgent Care', type: 'clinic', region: 'miami', lat: 25.8569, lng: -80.2772 },
  { id: 'fac-m08', name: 'Kendall Regional Clinic', type: 'clinic', region: 'miami', lat: 25.6802, lng: -80.3155 },
  { id: 'fac-m09', name: 'Miami Beach Community Health', type: 'clinic', region: 'miami', lat: 25.7897, lng: -80.1311 },
  { id: 'fac-m10', name: 'Downtown Mobile Health Unit', type: 'mobile', region: 'miami', lat: 25.7738, lng: -80.1928 },
  { id: 'fac-r01', name: 'San Miguel Health Post', type: 'health_post', region: 'rural', lat: 9.1539, lng: -83.7029 },
  { id: 'fac-r02', name: 'Cerro Alto Health Post', type: 'health_post', region: 'rural', lat: 9.2142, lng: -83.6136 },
  { id: 'fac-r03', name: 'Rio Verde Health Post', type: 'health_post', region: 'rural', lat: 9.3310, lng: -83.7059 },
  { id: 'fac-r04', name: 'La Ceiba Health Post', type: 'health_post', region: 'rural', lat: 9.0878, lng: -83.5123 },
  { id: 'fac-r05', name: 'Palo Blanco Health Post', type: 'health_post', region: 'rural', lat: 9.3085, lng: -83.5398 },
  { id: 'fac-r06', name: 'Rosario Outreach Vehicle', type: 'mobile', region: 'rural', lat: 8.9932, lng: -83.5791 },
];

// ---------------------------------------------------------------- users

export const USERS: User[] = [
  { id: 'usr-clinician', role: 'clinician', displayName: 'Dr. Amara Osei' },
  { id: 'usr-official', role: 'official', displayName: 'Health Official — Carmen Delgado' },
  { id: 'usr-chw', role: 'chw', displayName: 'CHW — Luis Ramirez' },
];

// ---------------------------------------------------------------- encounters

function hoursAgo(h: number): string {
  return new Date(Date.now() - h * 3600_000).toISOString();
}

export const ENCOUNTERS: Encounter[] = [
  {
    id: 'enc-xr-01', facilityName: 'San Miguel Health Post', region: 'rural',
    patientAge: 34, patientSex: 'M', modality: 'xray',
    aiFinding: 'Consolidation in right upper lobe — possible active TB (DRAFT FINDING — requires clinician sign-off)',
    confidence: 0.91, status: 'pending', createdAt: hoursAgo(6),
  },
  {
    id: 'enc-xr-02', facilityName: 'Little Haiti Health Center', region: 'miami',
    patientAge: 58, patientSex: 'F', modality: 'xray',
    aiFinding: 'Cavitary lesion left apex — suspicious for pulmonary TB (DRAFT FINDING — requires clinician sign-off)',
    confidence: 0.87, status: 'pending', createdAt: hoursAgo(11),
  },
  {
    id: 'enc-xr-03', facilityName: 'Cerro Alto Health Post', region: 'rural',
    patientAge: 45, patientSex: 'M', modality: 'xray',
    aiFinding: 'Retrocardiac opacity — possible pneumonia, TB less likely (DRAFT FINDING — requires clinician sign-off)',
    confidence: 0.78, status: 'signed_off', createdAt: hoursAgo(26),
  },
  {
    id: 'enc-xr-04', facilityName: 'Jackson Memorial Hospital', region: 'miami',
    patientAge: 29, patientSex: 'F', modality: 'xray',
    aiFinding: 'Diffuse interstitial markings — atypical infection pattern (DRAFT FINDING — requires clinician sign-off)',
    confidence: 0.62, status: 'escalated', createdAt: hoursAgo(40),
  },
  {
    id: 'enc-fd-01', facilityName: 'Little Havana Comprehensive Clinic', region: 'miami',
    patientAge: 61, patientSex: 'M', modality: 'fundus',
    aiFinding: 'Diabetic retinopathy grading: moderate NPDR, no DME (DRAFT FINDING — requires clinician sign-off)',
    confidence: 0.84, status: 'pending', createdAt: hoursAgo(8),
  },
  {
    id: 'enc-fd-02', facilityName: 'Palo Blanco Health Post', region: 'rural',
    patientAge: 52, patientSex: 'F', modality: 'fundus',
    aiFinding: 'Diabetic retinopathy grading: severe NPDR, refer within 4 weeks (DRAFT FINDING — requires clinician sign-off)',
    confidence: 0.9, status: 'escalated', createdAt: hoursAgo(20),
  },
  {
    id: 'enc-fd-03', facilityName: 'Kendall Regional Clinic', region: 'miami',
    patientAge: 47, patientSex: 'M', modality: 'fundus',
    aiFinding: 'Diabetic retinopathy grading: mild NPDR, routine follow-up (DRAFT FINDING — requires clinician sign-off)',
    confidence: 0.74, status: 'signed_off', createdAt: hoursAgo(55),
  },
  {
    id: 'enc-tc-01', facilityName: 'Rio Verde Health Post', region: 'rural',
    patientAge: 7, patientSex: 'M', modality: 'teleconsult',
    aiFinding: 'Fever 3 days, vomiting, abdominal pain — dengue warning signs absent, watch closely',
    confidence: 0.69, status: 'pending', createdAt: hoursAgo(4),
  },
  {
    id: 'enc-tc-02', facilityName: 'Overtown Community Clinic', region: 'miami',
    patientAge: 39, patientSex: 'F', modality: 'teleconsult',
    aiFinding: 'Fever, rash, retro-orbital headache — dengue suspected, PCR ordered',
    confidence: 0.81, status: 'signed_off', createdAt: hoursAgo(14),
  },
  {
    id: 'enc-tc-03', facilityName: 'Downtown Mobile Health Unit', region: 'miami',
    patientAge: 66, patientSex: 'M', modality: 'teleconsult',
    aiFinding: 'Chest tightness on exertion, hypertensive — cardiology referral advised',
    confidence: 0.73, status: 'escalated', createdAt: hoursAgo(31),
  },
  {
    id: 'enc-tc-04', facilityName: 'La Ceiba Health Post', region: 'rural',
    patientAge: 24, patientSex: 'F', modality: 'teleconsult',
    aiFinding: 'Acute watery diarrhea, mild dehydration — ORS plan A, recheck 48h',
    confidence: 0.66, status: 'signed_off', createdAt: hoursAgo(70),
  },
  {
    id: 'enc-tc-05', facilityName: 'Wynwood Walk-In Center', region: 'miami',
    patientAge: 31, patientSex: 'M', modality: 'teleconsult',
    aiFinding: 'Persistent cough 3 weeks, night sweats — sputum smear requested',
    confidence: 0.94, status: 'pending', createdAt: hoursAgo(90),
  },
];

// ---------------------------------------------------------------- sync packets

function hex(rnd: () => number, len: number): string {
  let s = '';
  for (let i = 0; i < len; i++) s += Math.floor(rnd() * 16).toString(16);
  return s;
}

function minutesAgo(m: number): string {
  return new Date(Date.now() - m * 60_000).toISOString();
}

export function buildSyncPackets(seed = 42): SyncPacket[] {
  const rnd = mulberry32(seed);
  const packets: SyncPacket[] = [
    { id: 'pkt-01', cid: 'bafy' + hex(rnd, 48), region: 'rural', facilityName: 'San Miguel Health Post', nodeName: 'edge-node-01 San Miguel', sizeBytes: 1_842_113, encrypted: 1, status: 'pending', createdAt: minutesAgo(38), syncedAt: null },
    { id: 'pkt-02', cid: 'bafy' + hex(rnd, 48), region: 'rural', facilityName: 'Cerro Alto Health Post', nodeName: 'edge-node-02 Cerro Alto', sizeBytes: 412_870, encrypted: 1, status: 'pending', createdAt: minutesAgo(85), syncedAt: null },
    { id: 'pkt-03', cid: 'bafy' + hex(rnd, 48), region: 'rural', facilityName: 'Rio Verde Health Post', nodeName: 'edge-node-03 Rio Verde', sizeBytes: 51_240, encrypted: 1, status: 'pending', createdAt: minutesAgo(140), syncedAt: null },
    { id: 'pkt-04', cid: 'bafy' + hex(rnd, 48), region: 'miami', facilityName: 'Downtown Mobile Health Unit', nodeName: 'edge-node-04 Downtown Miami', sizeBytes: 920_004, encrypted: 1, status: 'pending', createdAt: minutesAgo(210), syncedAt: null },
    { id: 'pkt-05', cid: 'bafy' + hex(rnd, 48), region: 'rural', facilityName: 'La Ceiba Health Post', nodeName: 'edge-node-05 La Ceiba', sizeBytes: 133_890, encrypted: 1, status: 'pending', createdAt: minutesAgo(300), syncedAt: null },
    { id: 'pkt-06', cid: 'bafy' + hex(rnd, 48), region: 'miami', facilityName: 'Little Haiti Health Center', nodeName: 'edge-node-06 Little Haiti', sizeBytes: 2_104_664, encrypted: 1, status: 'synced', createdAt: minutesAgo(90), syncedAt: minutesAgo(30) },
    { id: 'pkt-07', cid: 'bafy' + hex(rnd, 48), region: 'miami', facilityName: 'Wynwood Walk-In Center', nodeName: 'edge-node-07 Wynwood', sizeBytes: 68_400, encrypted: 1, status: 'synced', createdAt: minutesAgo(180), syncedAt: minutesAgo(95) },
    { id: 'pkt-08', cid: 'bafy' + hex(rnd, 48), region: 'rural', facilityName: 'Palo Blanco Health Post', nodeName: 'edge-node-08 Palo Blanco', sizeBytes: 380_112, encrypted: 1, status: 'synced', createdAt: minutesAgo(320), syncedAt: minutesAgo(240) },
  ];
  return packets;
}

// ---------------------------------------------------------------- epidemiology

export const DISEASE_KEYS: DiseaseKey[] = ['dengue', 'tb', 'cholera', 'malnutrition'];
export const WEEKS_COUNT = 8;

/**
 * Weekly surveillance rows for every district × 4 diseases × 8 weeks.
 * weekStart dates anchor to seed time (last week ends at the run date),
 * rounded to midnight UTC for stable ISO date strings.
 */
export function buildWeeklyReports(now = Date.now()): {
  rows: { districtId: string; weekStart: string; diseaseKey: DiseaseKey; cases: number }[];
  weekDates: string[];
} {
  const weekDates: string[] = [];
  for (let k = WEEKS_COUNT - 1; k >= 0; k--) {
    const d = new Date(now - k * 7 * 86_400_000);
    d.setUTCHours(0, 0, 0, 0);
    weekDates.push(d.toISOString().slice(0, 10));
  }

  const rows: { districtId: string; weekStart: string; diseaseKey: DiseaseKey; cases: number }[] = [];
  const rnd = mulberry32(2024_11_14);

  for (const district of DISTRICTS) {
    const rural = district.region === 'rural';
    const scale = rural ? 0.45 : 1.0;
    const popFactor = Math.max(district.population, 1) / 40_000;

    // Dengue
    if (district.id === 'rur-03') {
      // San Miguel: clear outbreak curve — baseline weeks 1–3, steep final 3 weeks.
      const curve = [4, 3, 6, 9, 11, 14, 31, 58];
      curve.forEach((cases, i) => rows.push({ districtId: district.id, weekStart: weekDates[i], diseaseKey: 'dengue', cases }));
    } else if (district.id === 'mia-05') {
      // Wynwood: mild uptick — last two weeks ~2x baseline (~12–15).
      const curve = [5, 6, 7, 6, 8, 7, 12, 15];
      curve.forEach((cases, i) => rows.push({ districtId: district.id, weekStart: weekDates[i], diseaseKey: 'dengue', cases }));
    } else {
      const base = 3 + 4 * popFactor * scale;
      for (let i = 0; i < WEEKS_COUNT; i++) {
        const ramp = 1 + i * 0.06; // mild seasonal ramp
        const jitter = 0.8 + rnd() * 0.4;
        rows.push({ districtId: district.id, weekStart: weekDates[i], diseaseKey: 'dengue', cases: Math.max(0, Math.round(base * ramp * jitter)) });
      }
    }

    // TB / cholera / malnutrition
    for (const diseaseKey of ['tb', 'cholera', 'malnutrition'] as const) {
      let base: number;
      if (diseaseKey === 'tb') base = rural ? 1 + popFactor * 0.3 : 2 + popFactor * 2.2;
      else if (diseaseKey === 'cholera') base = rural ? 0.6 : 1.1 + popFactor * 0.7;
      else base = rural ? 3 + popFactor * 2.4 : 2 + popFactor * 1.1; // malnutrition: higher in rural
      for (let i = 0; i < WEEKS_COUNT; i++) {
        const ramp = 1 + i * 0.04;
        const jitter = 0.75 + rnd() * 0.5;
        rows.push({ districtId: district.id, weekStart: weekDates[i], diseaseKey, cases: Math.max(0, Math.round(base * ramp * jitter)) });
      }
    }
  }
  return { rows, weekDates };
}

/** Predictions for every district × disease × horizon (7 & 14 days). */
export function buildPredictions(generatedAt = new Date().toISOString()): {
  districtId: string;
  diseaseKey: DiseaseKey;
  horizonDays: 7 | 14;
  predictedCases: number;
  lowerBound: number;
  upperBound: number;
  riskLevel: string;
}[] {
  const rows: {
    districtId: string;
    diseaseKey: DiseaseKey;
    horizonDays: 7 | 14;
    predictedCases: number;
    lowerBound: number;
    upperBound: number;
    riskLevel: string;
  }[] = [];

  for (const district of DISTRICTS) {
    const rural = district.region === 'rural';
    const scale = rural ? 0.45 : 1.0;
    const popFactor = Math.max(district.population, 1) / 40_000;

    for (const diseaseKey of DISEASE_KEYS) {
      // Latest observed weekly count to project from.
      let latest: number;
      if (diseaseKey === 'dengue' && district.id === 'rur-03') latest = 58;
      else if (diseaseKey === 'dengue' && district.id === 'mia-05') latest = 15;
      else {
        const base =
          diseaseKey === 'dengue' ? 3 + 4 * popFactor * scale
          : diseaseKey === 'tb' ? (rural ? 1 + popFactor * 0.3 : 2 + popFactor * 2.2)
          : diseaseKey === 'cholera' ? (rural ? 0.6 : 1.1 + popFactor * 0.7)
          : rural ? 3 + popFactor * 2.4 : 2 + popFactor * 1.1;
        latest = Math.max(1, Math.round(base * (1 + WEEKS_COUNT * 0.05)));
      }

      for (const horizonDays of [7, 14] as const) {
        const growth = horizonDays === 7 ? 1.12 : 1.24;
        const predicted = Math.max(1, Math.round(latest * growth));
        rows.push({
          districtId: district.id,
          diseaseKey,
          horizonDays,
          predictedCases: predicted,
          lowerBound: Math.round(predicted * 0.8 * 10) / 10,
          upperBound: Math.round(predicted * 1.25 * 10) / 10,
          riskLevel: riskFor(district.id, diseaseKey, horizonDays, predicted),
        });
      }
    }
  }
  return rows;
}

function riskFor(districtId: string, diseaseKey: string, horizonDays: number, predicted: number): string {
  if (districtId === 'rur-03' && diseaseKey === 'dengue') return 'critical'; // both horizons
  if (districtId === 'mia-05' && diseaseKey === 'dengue' && horizonDays === 7) return 'high';
  if (predicted >= 30) return 'high';
  if (predicted >= 12) return 'moderate';
  if (predicted >= 5) return 'low';
  return predicted >= 3 ? 'moderate' : 'low';
}
