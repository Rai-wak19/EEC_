# EEC Transport Sector PMS — REST API Documentation

All endpoints (except `/api/auth/login` and `/api/auth/register`) require an `Authorization: Bearer <token>` header.

## 1. Authentication
- `POST /api/auth/login` — Authenticate and receive JWT token.
- `POST /api/auth/register` — Register a new user account.
- `GET /api/auth/me` — Return current authenticated user profile.

## 2. Executive Dashboard
- `GET /api/dashboard/overview` — High-level portfolio KPIs (Active, Green/Yellow/Red count, Weighted Progress, Average SPI, Total Received, Interventions Required).
- `GET /api/dashboard/project-status` — Project status table enriched with latest SPI, Health Status, and Financial Progress.
- `GET /api/dashboard/schedule` — Schedule metrics and delayed milestone count.
- `GET /api/dashboard/financial` — Invoicing, certification, and cash receipt performance across projects.
- `GET /api/dashboard/deliverables` — Aggregated deliverable status by category and critical delayed list.
- `GET /api/dashboard/resources` — Required vs available vs shortfall breakdown by resource type.
- `GET /api/dashboard/risks` — Active risk list sorted by rating.
- `GET /api/dashboard/issues` — Open issue list sorted by severity.
- `GET /api/dashboard/interventions` — Pending executive interventions sorted by urgency.
- `GET /api/dashboard/recovery` — Recovery plan monitoring for lagging projects.
- `GET /api/dashboard/forward-look` — Lookahead grouped into 30, 60, and 90-day periods.

## 3. Core Resource Registers
- `/api/projects` — Full CRUD for project portfolio register.
- `/api/contracts` — Contract registers.
- `/api/progress` — Monthly schedule progress updates.
- `/api/milestones` — Milestone register.
- `/api/deliverables` — Deliverable register.
- `/api/financials` — Financial performance records.
- `/api/risks` — Risk register.
- `/api/issues` — Issue register.
- `/api/resources` — Resource and staffing register.
- `/api/interventions` — Management intervention register.
- `/api/recovery` — Recovery plans.
- `/api/forward-look` — Forward look items.
- `/api/users` — User management (Admin only).
