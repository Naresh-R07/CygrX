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
# Install dependencies
npm install

# Development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

**Default login:** `admin@cygrx.io` / `admin123`

## Project Structure

```
src/
  components/         # UI components
    DashboardOverview.tsx
    RiskMatrixHeatmap.tsx
    ComplianceTracker.tsx
    AssetInventory.tsx
    EvidenceVault.tsx
    IncidentTracker.tsx
    AiSecurityAdvisor.tsx
    Header.tsx
    Sidebar.tsx
    RiskModal.tsx
  api/client.ts       # API client with JWT refresh
  context/AuthContext.tsx
  hooks/useWebSocket.ts
  pages/LoginPage.tsx
  types.ts
  utils/riskEngine.ts

server/
  db/
    schema.sql        # Database schema (6 tables)
    connection.ts     # SQLite singleton
    seed.ts           # Initial data seeding
  routes/
    auth.ts           # Login, register, refresh
    risks.ts          # CRUD
    assets.ts         # CRUD
    controls.ts       # GET + PUT
    evidence.ts       # CRUD + file upload
    incidents.ts      # CRUD
  middleware/auth.ts  # JWT + RBAC
  ws/handler.ts       # WebSocket broadcast

server.ts             # Express entry point
```

## Features

- 5x5 Risk Matrix & Threat Heatmap with cell filtering
- ISO 27001:2022 Annex A control tracking
- NIST CSF 2.0 framework maturity scoring
- Asset inventory (cloud, data, hardware, software, vendors)
- Evidence vault with file upload and control linking
- Incident response command center
- AI SOC Threat Advisor (client-side, no external API required)
- JWT authentication with role-based access
- Real-time WebSocket updates
- Docker deployment ready

## Work Status

| Phase | Status | % | Notes |
|-------|--------|---|-------|
| UI Overhaul — noise removal, responsive, standardization | Done | 100% | All 10 components cleaned up |
| Database — SQLite schema, connection, seed data | Done | 100% | 6 tables, seeded with initial data |
| Backend API — CRUD routes for all entities | Done | 100% | Risks, assets, controls, evidence, incidents |
| File Upload — evidence artifact upload/download | Partial | 70% | Server route works, but frontend never sends the actual file object to FormData |
| Authentication — JWT, RBAC, login/register | Done | 100% | ADMIN/AUDITOR/VIEWER roles |
| WebSocket — real-time event broadcast | Partial | 40% | Server handler and client hook exist, but broadcast() is never called by routes |
| Frontend — API client, auth context, WebSocket hook | Done | 100% | client.ts, AuthContext.tsx, useWebSocket.ts |
| Frontend — all components migrated to API | Done | 100% | No localStorage mutations remain |
| Gemini AI — removed, AI advisor works locally | Done | 100% | No external API dependency |
| UI Consistency — colors, shadows, gradients standardized | Done | 95% | One shadow-md remains on RiskModal submit button |
| Docker — Dockerfile + docker-compose.yml | Done | 100% | |
| Type checking — tsc + vite build | Done | 100% | Clean build |

### Known Issues

| # | Severity | Issue |
|---|----------|-------|
| 1 | Critical | Evidence upload form collects file metadata but never appends the File object to FormData — files never reach disk |
| 2 | High | WebSocket broadcast() imported but never called by any route — real-time updates are inert |
| 3 | Medium | Unused imports: broadcast in server.ts, RiskLevel in RiskMatrixHeatmap/RiskModal, Link2 in EvidenceVault, useCallback in useWebSocket |
| 4 | Medium | Unused prop: criticalRisksCount defined in HeaderProps but never destructured |
| 5 | Medium | seed.ts and auth.ts use require() instead of ESM imports (works but inconsistent) |
| 6 | Low | RiskModal.tsx submit button has shadow-md (all other buttons cleaned) |

**Overall: 90% complete**
