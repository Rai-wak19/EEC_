# EEC Transport Sector — Project Planning & Monitoring System (PMS)

A production-quality full-stack Project Portfolio Planning & Monitoring Information System built for the **EEC Transport Sector Planning & Monitoring Team**.

The system enables senior management to understand the entire transport sector portfolio within **2–5 minutes** by answering:
- **Where are we?** (Overall portfolio planned vs. actual progress, average SPI, financial progress)
- **Are we on plan?** (Traffic-light health indicators: Green $\ge 0.95$, Yellow $0.80-0.95$, Red $< 0.80$)
- **What is going wrong?** (Critical milestones delayed, resource deficits, severity-ranked issues)
- **Why?** (Underlying risks and root-cause issue tracking)
- **What is the impact?** (Detailed schedule slip, delayed deliverables, uncertified revenues)
- **What decision is required?** (Prominently displayed Management Interventions and decisions with deadlines)
- **What happens next?** (Recovery plans with target gap trends and 30/60/90-day forward looks)

---

## Tech Stack

- **Frontend**: React 18, Vite, React Router v6, Chakra UI, Recharts, React Hook Form, Axios
- **Backend**: Node.js, Express.js, Sequelize ORM, PostgreSQL, JWT Authentication, bcryptjs
- **Database**: PostgreSQL (Relational schema with 13 entities and foreign-key cascading)

---

## Getting Started

### 1. Prerequisites
- Node.js (v18+)
- PostgreSQL installed and running (default port `5432`)
- A database created: `CREATE DATABASE eec_transport;`

### 2. Configure Backend Environment
Create `backend/.env` (or copy from `backend/.env.example`):
```env
PORT=5000
DATABASE_URL=postgres://postgres:password@localhost:5432/eec_transport
JWT_SECRET=super_secret_jwt_key_for_eec_transport_pms
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

### 3. Database Migration & Realistic Seed Data
Run the migration script to create all tables, then seed with 12 realistic projects (5 GREEN, 4 YELLOW, 3 RED including the critical IRAMS project):
```bash
cd backend
npm run migrate
npm run seed
```

### 4. Run the Backend Server
```bash
cd backend
npm run dev
# Server will run on http://localhost:5000
```

### 5. Run the Frontend Client
```bash
cd frontend
npm run dev
# Vite will serve on http://localhost:5173
```

---

## Default Demo Accounts

| Role | Email | Password | Permissions |
| :--- | :--- | :--- | :--- |
| **ADMIN** | `admin@eec.com` | `Admin@123` | Full access, user management, project creation & deletion |
| **TRANSPORT_MANAGER** | `manager@eec.com` | `Manager@123` | Executive dashboard, all registers, decision/intervention approvals |
| **PLANNING_MANAGER** | `planning@eec.com` | `Plan@123` | Create/update projects, progress, milestones, risks & recovery |
| **PROJECT_MANAGER** | `pm1@eec.com` | `Pm1@123` | View assigned projects, update progress, deliverables & issues |
| **FINANCE** | `finance@eec.com` | `Finance@123` | Financial records, invoicing, certification & cash collections |
| **VIEWER** | `viewer@eec.com` | `View@123` | Read-only access across all dashboards and registers |

---

## Documentation Links

- [Architecture Design](docs/architecture.md)
- [Database Schema & Relationships](docs/database.md)
- [REST API Reference](docs/api.md)
- [KPI Calculation Methodology](docs/calculations.md)
