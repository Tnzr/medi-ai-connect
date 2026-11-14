import { createRequire } from 'node:module';
import { mkdirSync } from 'node:fs';
import path from 'node:path';

// node:sqlite is a Node built-in; better-sqlite3 is NOT usable here (needs
// node-gyp + Python). Load it via process.getBuiltinModule/createRequire so
// bundlers never have to resolve the 'node:sqlite' specifier themselves.
type SqliteModule = typeof import('node:sqlite');
type DatabaseSync = InstanceType<SqliteModule['DatabaseSync']>;
type StatementSync = InstanceType<SqliteModule['StatementSync']>;

function loadSqlite(): SqliteModule {
  const proc = process as unknown as { getBuiltinModule?: (id: string) => unknown };
  if (typeof proc.getBuiltinModule === 'function') {
    return proc.getBuiltinModule('node:sqlite') as SqliteModule;
  }
  return createRequire(path.join(process.cwd(), 'package.json'))('node:sqlite') as SqliteModule;
}

const { DatabaseSync } = loadSqlite();

const DB_PATH = path.join(process.cwd(), 'data', 'medi-ai.db');

let db: DatabaseSync | null = null;
let initialized = false;
const stmtCache = new Map<string, StatementSync>();

const SCHEMA = `
CREATE TABLE IF NOT EXISTS facilities (
  id     TEXT PRIMARY KEY,
  name   TEXT NOT NULL,
  type   TEXT NOT NULL,
  region TEXT NOT NULL,
  lat    REAL,
  lng    REAL
);
CREATE TABLE IF NOT EXISTS districts (
  id         TEXT PRIMARY KEY,
  name       TEXT NOT NULL,
  region     TEXT NOT NULL,
  lat        REAL,
  lng        REAL,
  population INTEGER
);
CREATE TABLE IF NOT EXISTS encounters (
  id            TEXT PRIMARY KEY,
  facility_name TEXT NOT NULL,
  region        TEXT NOT NULL,
  patient_age   INTEGER,
  patient_sex   TEXT,
  modality      TEXT,
  ai_finding    TEXT,
  confidence    REAL,
  status        TEXT,
  created_at    TEXT
);
CREATE TABLE IF NOT EXISTS disease_reports (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  district_id TEXT NOT NULL,
  week_start  TEXT NOT NULL,
  disease_key TEXT NOT NULL,
  cases       INTEGER
);
CREATE TABLE IF NOT EXISTS predictions (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  district_id     TEXT NOT NULL,
  disease_key     TEXT NOT NULL,
  horizon_days    INTEGER,
  predicted_cases REAL,
  lower_bound     REAL,
  upper_bound     REAL,
  risk_level      TEXT,
  generated_at    TEXT
);
CREATE TABLE IF NOT EXISTS sync_packets (
  id            TEXT PRIMARY KEY,
  cid           TEXT,
  region        TEXT,
  facility_name TEXT,
  node_name     TEXT,
  size_bytes    INTEGER,
  encrypted     INTEGER,
  status        TEXT,
  created_at    TEXT,
  synced_at     TEXT
);
CREATE TABLE IF NOT EXISTS users (
  id           TEXT PRIMARY KEY,
  role         TEXT,
  display_name TEXT
);
`;

export function getDb(): DatabaseSync {
  if (!db) {
    mkdirSync(path.dirname(DB_PATH), { recursive: true });
    db = new DatabaseSync(DB_PATH);
  }
  return db;
}

export function initDb(): DatabaseSync {
  const d = getDb();
  if (!initialized) {
    d.exec(SCHEMA);
    initialized = true;
  }
  return d;
}

/** Cached prepared statement — every write/read in this app goes through one. */
export function stmt(sql: string): StatementSync {
  const d = initDb();
  let s = stmtCache.get(sql);
  if (!s) {
    s = d.prepare(sql);
    stmtCache.set(sql, s);
  }
  return s;
}

export function all<T = Record<string, unknown>>(sql: string, ...params: unknown[]): T[] {
  return stmt(sql).all(...params) as T[];
}

export function get<T = Record<string, unknown>>(sql: string, ...params: unknown[]): T | undefined {
  return stmt(sql).get(...params) as T | undefined;
}

export function run(sql: string, ...params: unknown[]): void {
  stmt(sql).run(...params);
}

export function tx<T>(fn: () => T): T {
  const d = initDb();
  d.exec('BEGIN');
  try {
    const out = fn();
    d.exec('COMMIT');
    return out;
  } catch (e) {
    d.exec('ROLLBACK');
    throw e;
  }
}

export function dbPath(): string {
  return DB_PATH;
}
