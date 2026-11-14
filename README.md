# Medi-AI Connect — Hackathon Demo (SIMULATED DATA)

A 5-minute, localhost-only demo of the Medi-AI Connect platform concept: geospatial health insights + prediction, clinician-in-the-loop AI review, and offline-first edge sync for community health posts.

**Everything is simulated. No real patients, no PHI, no live ML. AI findings are clearly marked DRAFT.**

## Run it

```bash
cd medi-ai
npm install
npm run dev
# open http://localhost:3000
```

Node 24+ required (uses the built-in `node:sqlite` module). No Python, no Docker, no external services — works on conference wifi.

## The 5-minute demo script

1. **Land (`/`)** — pick a role. Sign in as **Health Official** (the demo lead path).
2. **Map (`/map`)** — the centerpiece: case heatmap, district bubbles, facilities. Toggle the **7/14-day prediction overlay** — outbreak rings appear.
3. **Flip region to Rural Pilot (`/map?region=rural`)** — San Miguel lights up critical (dengue outbreak curve in the simulated feed).
4. **Edge Sync (`/edge`)** — 5 encrypted packets queued at offline health posts. Click **Sync now** — packets flip to synced; CIDs are content identifiers of encrypted payloads (PHI never leaves the device unencrypted — mirrors the store-and-forward design).
5. **Insights (`/insights`)** — disease trend lines, nutritional-demand signal, outbreak watchlist, illustrative stratified-abstention panel.
6. **Switch role to Clinician (`/`)** → **Encounters (`/encounters`)** — sign off a draft TB finding (regulatory banner: nothing is diagnostic until clinician sign-off).

## Architecture (demo-shaped)

- **Next.js 14 App Router + TypeScript + Tailwind** — one process, zero config
- **node:sqlite (`DatabaseSync`)** file DB at `data/medi-ai.db`, auto-seeded on first query — no native builds, no DB server
- **Leaflet + leaflet.heat + OpenStreetMap tiles** (no API key); district circles/rings carry the data layer even if tiles fail offline
- **Recharts** for trends
- **Server actions** for sign-in/sign-out, clinician sign-off, edge packet sync
- All epidemiology numbers are synthetic deterministic seed data (seeded PRNG), generated at first run

## Demo data model

`districts`, `facilities`, `encounters`, `disease_reports` (8 weeks × 18 districts × 4 diseases), `predictions` (7/14-day with confidence bands), `sync_packets` (CID ledger), `users` (3 demo roles).

## Out of scope (on purpose, for the 2-hour build)

Real IPFS daemon (CIDs are simulated but real-format), real auth (cookie role picker), live FHIR integration, WebRTC video, FDA/regulatory claims.
