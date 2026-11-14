// SIMULATED DATA for the Medi-AI Connect hackathon demo.
// Every district, facility, patient and record below is fictional,
// generated for demo purposes only. No real patient or surveillance data.

export type Region = 'miami' | 'rural';
export type DiseaseKey = 'dengue' | 'tb' | 'cholera' | 'malnutrition';
export type EncounterModality = 'xray' | 'fundus' | 'teleconsult';
export type EncounterStatus = 'pending' | 'signed_off' | 'escalated';
export type SyncStatus = 'pending' | 'synced';
export type RiskLevel = 'low' | 'moderate' | 'high' | 'critical';
export type FacilityType = 'hospital' | 'clinic' | 'health_post' | 'mobile';
export type UserRole = 'clinician' | 'official' | 'chw';

export interface District {
  id: string;
  name: string;
  region: Region;
  lat: number;
  lng: number;
  population: number;
}

export interface Facility {
  id: string;
  name: string;
  type: FacilityType;
  region: Region;
  lat: number;
  lng: number;
}

export interface User {
  id: string;
  role: UserRole;
  displayName: string;
}

export interface Encounter {
  id: string;
  facilityName: string;
  region: Region;
  patientAge: number;
  patientSex: string;
  modality: EncounterModality;
  aiFinding: string;
  confidence: number;
  status: EncounterStatus;
  createdAt: string;
}

export interface WeeklyReport {
  districtId: string;
  districtName: string;
  region: Region;
  weekStartDate: string;
  diseaseKey: DiseaseKey;
  cases: number;
}

export interface Prediction {
  districtId: string;
  districtName: string;
  region: Region;
  diseaseKey: DiseaseKey;
  horizonDays: 7 | 14;
  predictedCases: number;
  lowerBound: number;
  upperBound: number;
  riskLevel: RiskLevel;
  generatedAt: string;
}

export interface SyncPacket {
  id: string;
  cid: string;
  region: Region;
  facilityName: string;
  nodeName: string;
  sizeBytes: number;
  encrypted: 0 | 1;
  status: SyncStatus;
  createdAt: string;
  syncedAt: string | null;
}

export interface Stats {
  encountersToday: number;
  pendingSignoffs: number;
  pendingPackets: number;
  totalPackets: number;
  criticalPredictions: number;
}
