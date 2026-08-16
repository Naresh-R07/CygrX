# CygrX Cyber GRC Platform

Enterprise Cybersecurity Governance, Risk & Compliance Platform featuring 5x5 Risk Heatmaps, ISO 27001 & NIST CSF 2.0 trackers, Asset Vault, Evidence Management, Incident Response, and AI SOC Advisor.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, Vite 6, Tailwind CSS v4, TypeScript 5.8, Recharts |
| Backend | Express 4, SQLite (better-sqlite3), WebSocket (ws) |
| Auth | JWT (jsonwebtoken), bcrypt, role-based access (ADMIN/AUDITOR/VIEWER) |
| Deploy | Docker, docker-compose |

## Quick Start

```bash
npm install
npm run dev
```

**Default login:** `admin@cygrx.io` / `admin123`

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `PORT` | No | `3000` | Server port |
| `NODE_ENV` | No | `development` | `production` enables static file serving |
| `JWT_SECRET` | **Yes** | — | Secret for signing JWT tokens (fails hard if missing) |
| `ADMIN_PASSWORD` | No | `admin123` | Default admin password for database seeding |

## Project Structure

```
src/
  components/         # UI components
  api/client.ts       # API client with JWT refresh
  context/AuthContext.tsx
  hooks/useWebSocket.ts
  pages/LoginPage.tsx
  types.ts
  utils/riskEngine.ts

server/
  db/                 # SQLite schema, connection, seed
  routes/             # CRUD routes (auth, risks, assets, controls, evidence, incidents)
  middleware/auth.ts   # JWT + RBAC
  ws/handler.ts       # WebSocket broadcast

server.ts             # Express entry point
```

## Features

- 5x5 Risk Matrix & Threat Heatmap with cell filtering
- ISO 27001:2022 Annex A control tracking
- NIST CSF 2.0 framework maturity scoring
- Asset inventory (cloud, data, hardware, software, vendors)
- Evidence vault with real file upload/download and control linking
- Incident response command center
- AI SOC Threat Advisor (client-side, no external API required)
- JWT authentication with role-based access (ADMIN/AUDITOR/VIEWER)
- Real-time WebSocket updates on all mutations
- Docker deployment ready

## Work Status

| Phase | Status | % |
|-------|--------|---|
| UI Overhaul — noise removal, responsive, standardization | Done | 100% |
| Database — SQLite schema, connection, seed data | Done | 100% |
| Backend API — CRUD routes for all entities | Done | 100% |
| File Upload — evidence artifact upload/download | Done | 100% |
| Authentication — JWT, RBAC, login/register | Done | 100% |
| WebSocket — real-time event broadcast on mutations | Done | 100% |
| Frontend — API client, auth context, WebSocket hook | Done | 100% |
| Frontend — all components migrated to API | Done | 100% |
| Gemini AI — removed, AI advisor works locally | Done | 100% |
| UI Consistency — colors, shadows, gradients standardized | Done | 100% |
| Docker — Dockerfile + docker-compose.yml | Done | 100% |
| Type checking — tsc + vite build | Done | 100% |
| Security — fail-hard JWT_SECRET, sanitized filenames, req.user for uploads | Done | 100% |
| Dead code cleanup — unused imports, props, exports removed | Done | 100% |

**Overall: 100% complete**
