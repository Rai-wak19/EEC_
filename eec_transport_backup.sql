-- ============================================================
-- EEC Transport PMS — PostgreSQL Database Backup
-- Generated from Sequelize models + seed data
-- Database: eec_transport
-- Generated: 2026-08-23
-- ============================================================

-- Drop tables if they exist (in reverse FK order)
DROP TABLE IF EXISTS "forward_looks"     CASCADE;
DROP TABLE IF EXISTS "recovery_plans"    CASCADE;
DROP TABLE IF EXISTS "interventions"     CASCADE;
DROP TABLE IF EXISTS "resources"         CASCADE;
DROP TABLE IF EXISTS "issues"            CASCADE;
DROP TABLE IF EXISTS "risks"             CASCADE;
DROP TABLE IF EXISTS "financial_records" CASCADE;
DROP TABLE IF EXISTS "deliverables"      CASCADE;
DROP TABLE IF EXISTS "milestones"        CASCADE;
DROP TABLE IF EXISTS "project_progress"  CASCADE;
DROP TABLE IF EXISTS "contracts"         CASCADE;
DROP TABLE IF EXISTS "projects"          CASCADE;
DROP TABLE IF EXISTS "users"             CASCADE;

-- Drop ENUM types if they exist
DROP TYPE IF EXISTS "enum_users_role"                CASCADE;
DROP TYPE IF EXISTS "enum_projects_project_status"   CASCADE;
DROP TYPE IF EXISTS "enum_projects_project_type"     CASCADE;
DROP TYPE IF EXISTS "enum_contracts_contract_status" CASCADE;
DROP TYPE IF EXISTS "enum_milestones_status"         CASCADE;
DROP TYPE IF EXISTS "enum_deliverables_category"     CASCADE;
DROP TYPE IF EXISTS "enum_deliverables_status"       CASCADE;
DROP TYPE IF EXISTS "enum_risks_probability"         CASCADE;
DROP TYPE IF EXISTS "enum_risks_impact"              CASCADE;
DROP TYPE IF EXISTS "enum_risks_status"              CASCADE;
DROP TYPE IF EXISTS "enum_issues_severity"           CASCADE;
DROP TYPE IF EXISTS "enum_issues_status"             CASCADE;
DROP TYPE IF EXISTS "enum_resources_resource_type"   CASCADE;
DROP TYPE IF EXISTS "enum_interventions_priority"    CASCADE;
DROP TYPE IF EXISTS "enum_interventions_status"      CASCADE;
DROP TYPE IF EXISTS "enum_recovery_plans_recovery_status" CASCADE;
DROP TYPE IF EXISTS "enum_forward_looks_period"      CASCADE;
DROP TYPE IF EXISTS "enum_forward_looks_category"    CASCADE;

-- ============================================================
-- ENUM TYPES
-- ============================================================

CREATE TYPE "enum_users_role" AS ENUM (
  'ADMIN', 'MANAGING_DIRECTOR', 'PPM_MANAGER',
  'SECTOR_FINANCE', 'DESIGN_DIRECTOR', 'CONTRACT_ADMIN_DIRECTOR',
  'TRANSPORT_MANAGER', 'PLANNING_MANAGER', 'PROJECT_MANAGER',
  'FINANCE', 'VIEWER'
);

CREATE TYPE "enum_projects_project_status" AS ENUM (
  'ACTIVE', 'COMPLETED', 'SUSPENDED', 'CANCELLED', 'ON_HOLD'
);

CREATE TYPE "enum_projects_project_type" AS ENUM (
  'DESIGN', 'SUPERVISION'
);

CREATE TYPE "enum_contracts_contract_status" AS ENUM (
  'ACTIVE', 'COMPLETED', 'EXPIRED', 'SUSPENDED', 'TERMINATED'
);

CREATE TYPE "enum_milestones_status" AS ENUM (
  'NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'DELAYED', 'AT_RISK', 'CANCELLED'
);

CREATE TYPE "enum_deliverables_category" AS ENUM (
  'REPORT', 'SURVEY', 'DESIGN', 'TRAINING', 'SOFTWARE', 'DOCUMENTATION', 'OTHER'
);

CREATE TYPE "enum_deliverables_status" AS ENUM (
  'PLANNED', 'IN_PROGRESS', 'COMPLETED', 'DELAYED', 'AT_RISK', 'CANCELLED'
);

CREATE TYPE "enum_risks_probability" AS ENUM ('LOW', 'MEDIUM', 'HIGH');
CREATE TYPE "enum_risks_impact"      AS ENUM ('LOW', 'MEDIUM', 'HIGH');
CREATE TYPE "enum_risks_status"      AS ENUM ('OPEN', 'MITIGATING', 'CLOSED', 'ESCALATED');

CREATE TYPE "enum_issues_severity" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');
CREATE TYPE "enum_issues_status"   AS ENUM ('OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED', 'ESCALATED');

CREATE TYPE "enum_resources_resource_type" AS ENUM (
  'HUMAN_RESOURCE', 'VEHICLE', 'EQUIPMENT', 'SUBCONSULTANT', 'OTHER'
);

CREATE TYPE "enum_interventions_priority" AS ENUM ('CRITICAL', 'HIGH', 'MEDIUM', 'LOW');
CREATE TYPE "enum_interventions_status"   AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'OVERDUE', 'CANCELLED');

CREATE TYPE "enum_recovery_plans_recovery_status" AS ENUM (
  'NOT_STARTED', 'IMPROVING', 'ON_TRACK', 'AT_RISK', 'FAILED', 'COMPLETED'
);

CREATE TYPE "enum_forward_looks_period" AS ENUM (
  'NEXT_30_DAYS', 'NEXT_60_DAYS', 'NEXT_90_DAYS'
);

CREATE TYPE "enum_forward_looks_category" AS ENUM (
  'MILESTONE', 'DELIVERABLE', 'INVOICE', 'PROCUREMENT',
  'RESOURCE', 'DECISION', 'CONTRACTUAL_DEADLINE', 'RISK', 'OTHER'
);

-- ============================================================
-- TABLE: users
-- ============================================================
CREATE TABLE "users" (
  "id"            SERIAL PRIMARY KEY,
  "name"          VARCHAR(255) NOT NULL,
  "email"         VARCHAR(255) NOT NULL UNIQUE,
  "password_hash" VARCHAR(255) NOT NULL,
  "role"          "enum_users_role" NOT NULL DEFAULT 'PPM_MANAGER',
  "is_active"     BOOLEAN DEFAULT TRUE,
  "created_at"    TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  "updated_at"    TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLE: projects
-- ============================================================
CREATE TABLE "projects" (
  "id"                  SERIAL PRIMARY KEY,
  "project_code"        VARCHAR(255) NOT NULL UNIQUE,
  "project_name"        VARCHAR(255) NOT NULL,
  "client"              VARCHAR(255),
  "employer"            VARCHAR(255),
  "contract_no"         VARCHAR(255),
  "consultant"          VARCHAR(255),
  "responsible_team"    VARCHAR(255),
  "project_manager_id"  INTEGER REFERENCES "users"("id") ON DELETE SET NULL,
  "commencement_date"   DATE,
  "completion_date"     DATE,
  "duration_months"     DECIMAL(10, 2),
  "contract_value"      DECIMAL(15, 2),
  "currency"            VARCHAR(255),
  "project_status"      "enum_projects_project_status" DEFAULT 'ACTIVE',
  "project_type"        "enum_projects_project_type"   DEFAULT 'SUPERVISION',
  "created_at"          TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  "updated_at"          TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLE: contracts
-- ============================================================
CREATE TABLE "contracts" (
  "id"                      SERIAL PRIMARY KEY,
  "project_id"              INTEGER NOT NULL REFERENCES "projects"("id") ON DELETE CASCADE,
  "contract_no"             VARCHAR(255),
  "contract_title"          VARCHAR(255),
  "client"                  VARCHAR(255),
  "contractor_or_consultant" VARCHAR(255),
  "original_contract_value" DECIMAL(15, 2) DEFAULT 0,
  "variation_value"         DECIMAL(15, 2) DEFAULT 0,
  "revised_contract_value"  DECIMAL(15, 2) DEFAULT 0,
  "currency"                VARCHAR(255),
  "contract_start_date"     DATE,
  "contract_end_date"       DATE,
  "contract_status"         "enum_contracts_contract_status" DEFAULT 'ACTIVE',
  "notes"                   TEXT,
  "created_at"              TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  "updated_at"              TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLE: project_progress
-- ============================================================
CREATE TABLE "project_progress" (
  "id"                   SERIAL PRIMARY KEY,
  "project_id"           INTEGER NOT NULL REFERENCES "projects"("id") ON DELETE CASCADE,
  "reporting_month"      DATE NOT NULL,
  "planned_progress"     DECIMAL(5, 2),
  "actual_progress"      DECIMAL(5, 2),
  "schedule_variance"    DECIMAL(5, 2),
  "spi"                  DECIMAL(5, 2),
  "time_elapsed_percent" DECIMAL(5, 2),
  "time_remaining_percent" DECIMAL(5, 2),
  "notes"                TEXT,
  "created_at"           TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  "updated_at"           TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLE: milestones
-- ============================================================
CREATE TABLE "milestones" (
  "id"                 SERIAL PRIMARY KEY,
  "project_id"         INTEGER NOT NULL REFERENCES "projects"("id") ON DELETE CASCADE,
  "name"               VARCHAR(255) NOT NULL,
  "description"        TEXT,
  "planned_date"       DATE,
  "actual_date"        DATE,
  "status"             "enum_milestones_status" DEFAULT 'NOT_STARTED',
  "responsible_person" VARCHAR(255),
  "is_critical"        BOOLEAN DEFAULT FALSE,
  "notes"              TEXT,
  "created_at"         TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  "updated_at"         TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLE: deliverables
-- ============================================================
CREATE TABLE "deliverables" (
  "id"                 SERIAL PRIMARY KEY,
  "project_id"         INTEGER NOT NULL REFERENCES "projects"("id") ON DELETE CASCADE,
  "name"               VARCHAR(255) NOT NULL,
  "category"           "enum_deliverables_category" NOT NULL,
  "planned_date"       DATE,
  "actual_date"        DATE,
  "status"             "enum_deliverables_status" DEFAULT 'PLANNED',
  "responsible_person" VARCHAR(255),
  "is_critical"        BOOLEAN DEFAULT FALSE,
  "description"        TEXT,
  "created_at"         TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  "updated_at"         TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLE: financial_records
-- ============================================================
CREATE TABLE "financial_records" (
  "id"                      SERIAL PRIMARY KEY,
  "project_id"              INTEGER NOT NULL REFERENCES "projects"("id") ON DELETE CASCADE,
  "reporting_month"         DATE NOT NULL,
  "original_contract_value" DECIMAL(15, 2),
  "variation_value"         DECIMAL(15, 2),
  "revised_contract_value"  DECIMAL(15, 2),
  "planned_invoicing"       DECIMAL(15, 2),
  "actual_invoicing"        DECIMAL(15, 2),
  "amount_certified"        DECIMAL(15, 2),
  "amount_received"         DECIMAL(15, 2),
  "outstanding_payment"     DECIMAL(15, 2),
  "planned_cost"            DECIMAL(15, 2),
  "actual_cost"             DECIMAL(15, 2),
  "forecast_cost"           DECIMAL(15, 2),
  "created_at"              TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  "updated_at"              TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLE: risks
-- ============================================================
CREATE TABLE "risks" (
  "id"                  SERIAL PRIMARY KEY,
  "project_id"          INTEGER NOT NULL REFERENCES "projects"("id") ON DELETE CASCADE,
  "risk_code"           VARCHAR(255) NOT NULL,
  "description"         TEXT NOT NULL,
  "category"            VARCHAR(255),
  "probability"         "enum_risks_probability" NOT NULL,
  "impact"              "enum_risks_impact" NOT NULL,
  "rating"              INTEGER,
  "mitigation_action"   TEXT,
  "responsible_person"  VARCHAR(255),
  "target_date"         DATE,
  "status"              "enum_risks_status" DEFAULT 'OPEN',
  "created_at"          TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  "updated_at"          TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLE: issues
-- ============================================================
CREATE TABLE "issues" (
  "id"                 SERIAL PRIMARY KEY,
  "project_id"         INTEGER NOT NULL REFERENCES "projects"("id") ON DELETE CASCADE,
  "issue_code"         VARCHAR(255) NOT NULL,
  "description"        TEXT NOT NULL,
  "category"           VARCHAR(255),
  "severity"           "enum_issues_severity" NOT NULL,
  "impact"             TEXT,
  "action_required"    TEXT,
  "responsible_person" VARCHAR(255),
  "target_date"        DATE,
  "status"             "enum_issues_status" DEFAULT 'OPEN',
  "created_at"         TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  "updated_at"         TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLE: resources
-- ============================================================
CREATE TABLE "resources" (
  "id"                   SERIAL PRIMARY KEY,
  "project_id"           INTEGER NOT NULL REFERENCES "projects"("id") ON DELETE CASCADE,
  "resource_type"        "enum_resources_resource_type" NOT NULL,
  "resource_name"        VARCHAR(255) NOT NULL,
  "required_quantity"    INTEGER DEFAULT 0,
  "available_quantity"   INTEGER DEFAULT 0,
  "operational_quantity" INTEGER DEFAULT 0,
  "shortfall"            INTEGER,
  "status"               VARCHAR(255),
  "notes"                TEXT,
  "created_at"           TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  "updated_at"           TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLE: interventions
-- ============================================================
CREATE TABLE "interventions" (
  "id"                 SERIAL PRIMARY KEY,
  "project_id"         INTEGER NOT NULL REFERENCES "projects"("id") ON DELETE CASCADE,
  "risk_id"            INTEGER REFERENCES "risks"("id") ON DELETE SET NULL,
  "issue_id"           INTEGER REFERENCES "issues"("id") ON DELETE SET NULL,
  "priority"           "enum_interventions_priority" NOT NULL,
  "problem"            TEXT NOT NULL,
  "impact"             TEXT,
  "required_decision"  TEXT NOT NULL,
  "responsible_person" VARCHAR(255),
  "deadline"           DATE,
  "status"             "enum_interventions_status" DEFAULT 'PENDING',
  "resolution"         TEXT,
  "created_at"         TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  "updated_at"         TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLE: recovery_plans
-- ============================================================
CREATE TABLE "recovery_plans" (
  "id"                   SERIAL PRIMARY KEY,
  "project_id"           INTEGER NOT NULL REFERENCES "projects"("id") ON DELETE CASCADE,
  "original_gap"         DECIMAL(5, 2),
  "recovery_target_gap"  DECIMAL(5, 2),
  "current_gap"          DECIMAL(5, 2),
  "recovery_status"      "enum_recovery_plans_recovery_status" DEFAULT 'NOT_STARTED',
  "recovery_action"      TEXT,
  "responsible_person"   VARCHAR(255),
  "target_date"          DATE,
  "notes"                TEXT,
  "created_at"           TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  "updated_at"           TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLE: forward_looks
-- ============================================================
CREATE TABLE "forward_looks" (
  "id"                 SERIAL PRIMARY KEY,
  "project_id"         INTEGER NOT NULL REFERENCES "projects"("id") ON DELETE CASCADE,
  "period"             "enum_forward_looks_period" NOT NULL,
  "category"           "enum_forward_looks_category" NOT NULL,
  "description"        TEXT NOT NULL,
  "expected_date"      DATE,
  "responsible_person" VARCHAR(255),
  "status"             VARCHAR(255),
  "impact"             TEXT,
  "created_at"         TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  "updated_at"         TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- ============================================================
-- SEED DATA: USERS
-- Passwords (bcrypt): Admin@123, Manager@123, Plan@123,
--   Pm1@123, Finance@123, View@123, Pm2@123, Pm3@123
-- Run: npm run seed   to re-generate with real hashes
-- ============================================================
INSERT INTO "users" ("name","email","password_hash","role","is_active","created_at","updated_at") VALUES
  ('System Admin',     'admin@eec.com',    '$2a$10$REPLACE_WITH_REAL_HASH', 'ADMIN',             TRUE,NOW(),NOW()),
  ('James Thornton',   'manager@eec.com',  '$2a$10$REPLACE_WITH_REAL_HASH', 'TRANSPORT_MANAGER', TRUE,NOW(),NOW()),
  ('Sarah Mensah',     'planning@eec.com', '$2a$10$REPLACE_WITH_REAL_HASH', 'PLANNING_MANAGER',  TRUE,NOW(),NOW()),
  ('Kofi Amponsah',    'pm1@eec.com',      '$2a$10$REPLACE_WITH_REAL_HASH', 'PROJECT_MANAGER',   TRUE,NOW(),NOW()),
  ('Abena Osei',       'finance@eec.com',  '$2a$10$REPLACE_WITH_REAL_HASH', 'FINANCE',           TRUE,NOW(),NOW()),
  ('David Asante',     'viewer@eec.com',   '$2a$10$REPLACE_WITH_REAL_HASH', 'VIEWER',            TRUE,NOW(),NOW()),
  ('Emmanuel Boateng', 'pm2@eec.com',      '$2a$10$REPLACE_WITH_REAL_HASH', 'PROJECT_MANAGER',   TRUE,NOW(),NOW()),
  ('Ama Darko',        'pm3@eec.com',      '$2a$10$REPLACE_WITH_REAL_HASH', 'PROJECT_MANAGER',   TRUE,NOW(),NOW());

-- ============================================================
-- SEED DATA: PROJECTS
-- project_manager_id: kofi=4, boateng=7, ama=8
-- ============================================================
INSERT INTO "projects" ("project_code","project_name","client","employer","contract_no","consultant","responsible_team","project_manager_id","commencement_date","completion_date","duration_months","contract_value","currency","project_status","created_at","updated_at") VALUES
  ('TSP-001','National Highways Rehabilitation',  'Ministry of Roads','MoR', 'MOR/2024/001',  'EEC Transport','Roads Team A', 4,'2024-03-01','2026-09-30',30,12500000,'USD','ACTIVE',NOW(),NOW()),
  ('TSP-002','Accra Urban Transit Improvement',   'Metropolitan Auth','Metro','MA/2024/015',   'EEC Transport','Urban Team',   7,'2024-06-01','2026-11-30',30, 8750000,'USD','ACTIVE',NOW(),NOW()),
  ('TSP-003','Eastern Corridor Road Safety',      'NRSA',            'NRSA','NRSA/2025/003', 'EEC Transport','Safety Team',  8,'2025-01-15','2026-12-31',24, 5200000,'USD','ACTIVE',NOW(),NOW()),
  ('TSP-004','Port Access Road Upgrade',          'Ghana Ports',     'GPHA','GPHA/2024/008', 'EEC Transport','Ports Team',   4,'2024-04-01','2026-09-30',30, 9800000,'USD','ACTIVE',NOW(),NOW()),
  ('TSP-005','Rural Feeder Roads Phase 2',        'DRAP',            'DRAP','DRAP/2025/001', 'EEC Transport','Rural Team',   7,'2025-02-01','2027-01-31',24, 6300000,'USD','ACTIVE',NOW(),NOW()),
  ('TSP-006','Bridge Maintenance Program',        'GHA',             'GHA', 'GHA/2024/012',  'EEC Transport','Bridges Team', 8,'2024-07-01','2026-12-31',30,14200000,'USD','ACTIVE',NOW(),NOW()),
  ('TSP-007','Traffic Management System Kumasi',  'KMA',             'KMA', 'KMA/2025/004',  'EEC Transport','ITS Team',     4,'2025-03-01','2027-02-28',24, 7100000,'USD','ACTIVE',NOW(),NOW()),
  ('TSP-008','Northern Corridor Infrastructure',  'KEEA',            'KEEA','KEEA/2024/009', 'EEC Transport','North Team',   7,'2024-08-01','2026-10-31',27,18500000,'USD','ACTIVE',NOW(),NOW()),
  ('TSP-009','Pedestrian Walkway Network Accra',  'AMA',             'AMA', 'AMA/2025/007',  'EEC Transport','Urban Team',   8,'2025-01-01','2026-12-31',24, 3900000,'USD','ACTIVE',NOW(),NOW()),
  ('TSP-010','Volta River Bridge Construction',   'MoR',             'MoR', 'MOR/2023/044',  'EEC Transport','Bridges Team', 4,'2023-09-01','2026-08-31',36,32000000,'USD','ACTIVE',NOW(),NOW()),
  ('IRAMS',  'Integrated Road Asset Mgmt System', 'MoR',             'MoR', 'MOR/2024/IRAMS','EEC Transport','ICT Team',     7,'2024-02-01','2026-08-31',30, 4750000,'USD','ACTIVE',NOW(),NOW()),
  ('TSP-012','Tema Motorway Expansion',           'NRA',             'NRA', 'NRA/2023/019',  'EEC Transport','Roads Team B', 8,'2023-06-01','2026-09-30',40,48000000,'USD','ACTIVE',NOW(),NOW());

-- ============================================================
-- SEED DATA: CONTRACTS (one per project, auto-computed values)
-- ============================================================
INSERT INTO "contracts" ("project_id","contract_no","contract_title","client","contractor_or_consultant","original_contract_value","variation_value","revised_contract_value","currency","contract_start_date","contract_end_date","contract_status","created_at","updated_at")
SELECT
  p.id, p.contract_no,
  p.project_name || ' — Main Contract',
  p.client,
  'EEC Transport Consultants Ltd',
  p.contract_value,
  ROUND((p.contract_value * 0.05)::numeric, 2),
  ROUND((p.contract_value * 1.05)::numeric, 2),
  p.currency,
  p.commencement_date,
  p.completion_date,
  'ACTIVE', NOW(), NOW()
FROM "projects" p;

-- ============================================================
-- SEED DATA: PROJECT PROGRESS — June 2026
-- ============================================================
INSERT INTO "project_progress" ("project_id","reporting_month","planned_progress","actual_progress","schedule_variance","spi","time_elapsed_percent","time_remaining_percent","created_at","updated_at")
SELECT p.id,'2026-06-01',
  (CASE p.project_code WHEN 'TSP-001' THEN 60 WHEN 'TSP-002' THEN 43 WHEN 'TSP-003' THEN 56 WHEN 'TSP-004' THEN 68 WHEN 'TSP-005' THEN 33 WHEN 'TSP-006' THEN 46 WHEN 'TSP-007' THEN 23 WHEN 'TSP-008' THEN 63 WHEN 'TSP-009' THEN 40 WHEN 'TSP-010' THEN 76 WHEN 'IRAMS' THEN 42.4 WHEN 'TSP-012' THEN 66 END)::numeric,
  (CASE p.project_code WHEN 'TSP-001' THEN 59 WHEN 'TSP-002' THEN 42 WHEN 'TSP-003' THEN 55 WHEN 'TSP-004' THEN 67 WHEN 'TSP-005' THEN 32 WHEN 'TSP-006' THEN 39 WHEN 'TSP-007' THEN 18 WHEN 'TSP-008' THEN 53 WHEN 'TSP-009' THEN 32 WHEN 'TSP-010' THEN 56 WHEN 'IRAMS' THEN 16.5 WHEN 'TSP-012' THEN 42 END)::numeric,
  (CASE p.project_code WHEN 'TSP-001' THEN -1.0 WHEN 'TSP-002' THEN -1.0 WHEN 'TSP-003' THEN -1.0 WHEN 'TSP-004' THEN -1.0 WHEN 'TSP-005' THEN -1.0 WHEN 'TSP-006' THEN -7.0 WHEN 'TSP-007' THEN -5.0 WHEN 'TSP-008' THEN -10.0 WHEN 'TSP-009' THEN -8.0 WHEN 'TSP-010' THEN -20.0 WHEN 'IRAMS' THEN -25.9 WHEN 'TSP-012' THEN -24.0 END)::numeric,
  (CASE p.project_code WHEN 'TSP-001' THEN 0.98 WHEN 'TSP-002' THEN 0.98 WHEN 'TSP-003' THEN 0.98 WHEN 'TSP-004' THEN 0.99 WHEN 'TSP-005' THEN 0.97 WHEN 'TSP-006' THEN 0.85 WHEN 'TSP-007' THEN 0.78 WHEN 'TSP-008' THEN 0.84 WHEN 'TSP-009' THEN 0.80 WHEN 'TSP-010' THEN 0.74 WHEN 'IRAMS' THEN 0.52 WHEN 'TSP-012' THEN 0.64 END)::numeric,
  60, 40, NOW(), NOW()
FROM "projects" p;

-- SEED DATA: PROJECT PROGRESS — July 2026
INSERT INTO "project_progress" ("project_id","reporting_month","planned_progress","actual_progress","schedule_variance","spi","time_elapsed_percent","time_remaining_percent","created_at","updated_at")
SELECT p.id,'2026-07-01',
  (CASE p.project_code WHEN 'TSP-001' THEN 66 WHEN 'TSP-002' THEN 49 WHEN 'TSP-003' THEN 62 WHEN 'TSP-004' THEN 74 WHEN 'TSP-005' THEN 39 WHEN 'TSP-006' THEN 52 WHEN 'TSP-007' THEN 29 WHEN 'TSP-008' THEN 69 WHEN 'TSP-009' THEN 46 WHEN 'TSP-010' THEN 82 WHEN 'IRAMS' THEN 48.4 WHEN 'TSP-012' THEN 72 END)::numeric,
  (CASE p.project_code WHEN 'TSP-001' THEN 65 WHEN 'TSP-002' THEN 48 WHEN 'TSP-003' THEN 61 WHEN 'TSP-004' THEN 73 WHEN 'TSP-005' THEN 38 WHEN 'TSP-006' THEN 45 WHEN 'TSP-007' THEN 24 WHEN 'TSP-008' THEN 59 WHEN 'TSP-009' THEN 38 WHEN 'TSP-010' THEN 62 WHEN 'IRAMS' THEN 22.5 WHEN 'TSP-012' THEN 48 END)::numeric,
  (CASE p.project_code WHEN 'TSP-001' THEN -1.0 WHEN 'TSP-002' THEN -1.0 WHEN 'TSP-003' THEN -1.0 WHEN 'TSP-004' THEN -1.0 WHEN 'TSP-005' THEN -1.0 WHEN 'TSP-006' THEN -7.0 WHEN 'TSP-007' THEN -5.0 WHEN 'TSP-008' THEN -10.0 WHEN 'TSP-009' THEN -8.0 WHEN 'TSP-010' THEN -20.0 WHEN 'IRAMS' THEN -25.9 WHEN 'TSP-012' THEN -24.0 END)::numeric,
  (CASE p.project_code WHEN 'TSP-001' THEN 0.98 WHEN 'TSP-002' THEN 0.98 WHEN 'TSP-003' THEN 0.98 WHEN 'TSP-004' THEN 0.99 WHEN 'TSP-005' THEN 0.97 WHEN 'TSP-006' THEN 0.87 WHEN 'TSP-007' THEN 0.83 WHEN 'TSP-008' THEN 0.86 WHEN 'TSP-009' THEN 0.83 WHEN 'TSP-010' THEN 0.76 WHEN 'IRAMS' THEN 0.47 WHEN 'TSP-012' THEN 0.67 END)::numeric,
  66, 34, NOW(), NOW()
FROM "projects" p;

-- SEED DATA: PROJECT PROGRESS — August 2026
INSERT INTO "project_progress" ("project_id","reporting_month","planned_progress","actual_progress","schedule_variance","spi","time_elapsed_percent","time_remaining_percent","created_at","updated_at")
SELECT p.id,'2026-08-01',
  (CASE p.project_code WHEN 'TSP-001' THEN 72 WHEN 'TSP-002' THEN 55 WHEN 'TSP-003' THEN 68 WHEN 'TSP-004' THEN 80 WHEN 'TSP-005' THEN 45 WHEN 'TSP-006' THEN 58 WHEN 'TSP-007' THEN 35 WHEN 'TSP-008' THEN 75 WHEN 'TSP-009' THEN 52 WHEN 'TSP-010' THEN 88 WHEN 'IRAMS' THEN 54.4 WHEN 'TSP-012' THEN 78 END)::numeric,
  (CASE p.project_code WHEN 'TSP-001' THEN 71 WHEN 'TSP-002' THEN 54 WHEN 'TSP-003' THEN 67 WHEN 'TSP-004' THEN 79 WHEN 'TSP-005' THEN 44 WHEN 'TSP-006' THEN 51 WHEN 'TSP-007' THEN 30 WHEN 'TSP-008' THEN 65 WHEN 'TSP-009' THEN 44 WHEN 'TSP-010' THEN 68 WHEN 'IRAMS' THEN 28.5 WHEN 'TSP-012' THEN 54 END)::numeric,
  (CASE p.project_code WHEN 'TSP-001' THEN -1.0 WHEN 'TSP-002' THEN -1.0 WHEN 'TSP-003' THEN -1.0 WHEN 'TSP-004' THEN -1.0 WHEN 'TSP-005' THEN -1.0 WHEN 'TSP-006' THEN -7.0 WHEN 'TSP-007' THEN -5.0 WHEN 'TSP-008' THEN -10.0 WHEN 'TSP-009' THEN -8.0 WHEN 'TSP-010' THEN -20.0 WHEN 'IRAMS' THEN -25.9 WHEN 'TSP-012' THEN -24.0 END)::numeric,
  (CASE p.project_code WHEN 'TSP-001' THEN 0.99 WHEN 'TSP-002' THEN 0.98 WHEN 'TSP-003' THEN 0.99 WHEN 'TSP-004' THEN 0.99 WHEN 'TSP-005' THEN 0.98 WHEN 'TSP-006' THEN 0.88 WHEN 'TSP-007' THEN 0.86 WHEN 'TSP-008' THEN 0.87 WHEN 'TSP-009' THEN 0.85 WHEN 'TSP-010' THEN 0.77 WHEN 'IRAMS' THEN 0.52 WHEN 'TSP-012' THEN 0.69 END)::numeric,
  72, 28, NOW(), NOW()
FROM "projects" p;

-- ============================================================
-- SEED DATA: FINANCIAL RECORDS (August 2026)
-- ============================================================
INSERT INTO "financial_records" ("project_id","reporting_month","original_contract_value","variation_value","revised_contract_value","planned_invoicing","actual_invoicing","amount_certified","amount_received","outstanding_payment","planned_cost","actual_cost","forecast_cost","created_at","updated_at")
SELECT
  p.id,'2026-08-01',
  p.contract_value,
  ROUND((p.contract_value*0.05)::numeric,2),
  ROUND((p.contract_value*1.05)::numeric,2),
  ROUND((p.contract_value*1.05*fd.plan_pct/100)::numeric,2),
  ROUND((p.contract_value*1.05*fd.act_pct/100)::numeric,2),
  ROUND((p.contract_value*1.05*fd.cert_pct/100)::numeric,2),
  ROUND((p.contract_value*1.05*fd.recv_pct/100)::numeric,2),
  ROUND((p.contract_value*1.05*(fd.cert_pct-fd.recv_pct)/100)::numeric,2),
  ROUND((p.contract_value*1.05*fd.plan_pct/100*0.85)::numeric,2),
  ROUND((p.contract_value*1.05*fd.act_pct/100*0.88)::numeric,2),
  ROUND((p.contract_value*1.05*0.92)::numeric,2),
  NOW(),NOW()
FROM "projects" p
JOIN (VALUES
  ('TSP-001',70,72,70,71),('TSP-002',52,55,52,53),('TSP-003',65,68,66,66),
  ('TSP-004',78,80,78,79),('TSP-005',43,45,44,44),('TSP-006',45,58,49,50),
  ('TSP-007',26,35,28,28),('TSP-008',60,75,62,63),('TSP-009',40,52,42,43),
  ('TSP-010',60,88,65,67),('IRAMS',25,54,27,28),('TSP-012',48,78,50,52)
) AS fd(code,recv_pct,plan_pct,act_pct,cert_pct) ON p.project_code=fd.code;

-- ============================================================
-- SEED DATA: MILESTONES
-- ============================================================
INSERT INTO "milestones" ("project_id","name","planned_date","actual_date","status","is_critical","responsible_person","notes","created_at","updated_at") VALUES
  ((SELECT id FROM projects WHERE project_code='IRAMS'),  'Software Requirements Specification','2025-06-30','2025-09-15','COMPLETED',  TRUE, 'Boateng E.',NULL,NOW(),NOW()),
  ((SELECT id FROM projects WHERE project_code='IRAMS'),  'System Architecture Design',         '2025-09-30','2026-01-20','COMPLETED',  TRUE, 'Boateng E.',NULL,NOW(),NOW()),
  ((SELECT id FROM projects WHERE project_code='IRAMS'),  'RAMS Module Development',            '2026-03-31',NULL,        'DELAYED',    TRUE, 'Boateng E.','Procurement delay of RAMS software license',NOW(),NOW()),
  ((SELECT id FROM projects WHERE project_code='IRAMS'),  'User Acceptance Testing',            '2026-06-30',NULL,        'AT_RISK',    TRUE, 'Boateng E.',NULL,NOW(),NOW()),
  ((SELECT id FROM projects WHERE project_code='IRAMS'),  'System Deployment',                  '2026-08-31',NULL,        'AT_RISK',    TRUE, 'Boateng E.',NULL,NOW(),NOW()),
  ((SELECT id FROM projects WHERE project_code='TSP-010'),'Foundation Works Completion',        '2025-12-31','2026-02-28','COMPLETED',  TRUE, 'Kofi A.',   NULL,NOW(),NOW()),
  ((SELECT id FROM projects WHERE project_code='TSP-010'),'Bridge Deck Construction 50%',       '2026-05-31',NULL,        'DELAYED',    TRUE, 'Kofi A.',   'Material supply issues from contractor',NOW(),NOW()),
  ((SELECT id FROM projects WHERE project_code='TSP-010'),'Bridge Deck Completion',             '2026-07-31',NULL,        'DELAYED',    TRUE, 'Kofi A.',   NULL,NOW(),NOW()),
  ((SELECT id FROM projects WHERE project_code='TSP-012'),'Design Approval',                    '2024-09-30','2025-01-15','COMPLETED',  FALSE,'Ama D.',    NULL,NOW(),NOW()),
  ((SELECT id FROM projects WHERE project_code='TSP-012'),'Mobilisation Complete',              '2025-01-31','2025-04-30','COMPLETED',  TRUE, 'Ama D.',    NULL,NOW(),NOW()),
  ((SELECT id FROM projects WHERE project_code='TSP-012'),'Phase 1 Earthworks',                 '2026-03-31',NULL,        'DELAYED',    TRUE, 'Ama D.',    NULL,NOW(),NOW()),
  ((SELECT id FROM projects WHERE project_code='TSP-001'),'Pavement Design Approval',           '2025-12-31','2025-12-15','COMPLETED',  TRUE, 'Kofi A.',   NULL,NOW(),NOW()),
  ((SELECT id FROM projects WHERE project_code='TSP-001'),'Rehabilitation 50% Complete',        '2026-06-30','2026-06-25','COMPLETED',  TRUE, 'Kofi A.',   NULL,NOW(),NOW()),
  ((SELECT id FROM projects WHERE project_code='TSP-001'),'Project Completion',                 '2026-09-30',NULL,        'IN_PROGRESS',TRUE, 'Kofi A.',   NULL,NOW(),NOW());

-- ============================================================
-- SEED DATA: DELIVERABLES
-- ============================================================
INSERT INTO "deliverables" ("project_id","name","category","planned_date","actual_date","status","is_critical","responsible_person","description","created_at","updated_at") VALUES
  ((SELECT id FROM projects WHERE project_code='IRAMS'),  'Inception Report',              'REPORT',       '2024-04-30','2024-05-15','COMPLETED',  TRUE, 'Boateng E.',NULL,NOW(),NOW()),
  ((SELECT id FROM projects WHERE project_code='IRAMS'),  'Road Asset Inventory Database', 'SOFTWARE',     '2025-12-31',NULL,        'DELAYED',    TRUE, 'Boateng E.','RAMS software procurement delay',NOW(),NOW()),
  ((SELECT id FROM projects WHERE project_code='IRAMS'),  'Stakeholder Training Module 1', 'TRAINING',     '2026-05-31',NULL,        'AT_RISK',    FALSE,'Boateng E.',NULL,NOW(),NOW()),
  ((SELECT id FROM projects WHERE project_code='IRAMS'),  'System User Manual',            'DOCUMENTATION','2026-07-31',NULL,        'PLANNED',    FALSE,'Boateng E.',NULL,NOW(),NOW()),
  ((SELECT id FROM projects WHERE project_code='TSP-010'),'Geotechnical Survey Report',    'SURVEY',       '2024-03-31','2024-04-15','COMPLETED',  FALSE,'Kofi A.',   NULL,NOW(),NOW()),
  ((SELECT id FROM projects WHERE project_code='TSP-010'),'Structural Design Report',      'DESIGN',       '2024-09-30','2024-10-05','COMPLETED',  TRUE, 'Kofi A.',   NULL,NOW(),NOW()),
  ((SELECT id FROM projects WHERE project_code='TSP-010'),'Monthly Progress Report Aug 26','REPORT',       '2026-08-15',NULL,        'DELAYED',    FALSE,'Kofi A.',   NULL,NOW(),NOW()),
  ((SELECT id FROM projects WHERE project_code='TSP-001'),'Inception Report',              'REPORT',       '2024-04-30','2024-04-28','COMPLETED',  FALSE,'Kofi A.',   NULL,NOW(),NOW()),
  ((SELECT id FROM projects WHERE project_code='TSP-001'),'Pavement Assessment',           'SURVEY',       '2024-08-31','2024-08-20','COMPLETED',  TRUE, 'Kofi A.',   NULL,NOW(),NOW()),
  ((SELECT id FROM projects WHERE project_code='TSP-001'),'Final Design Report',           'DESIGN',       '2025-02-28','2025-02-25','COMPLETED',  TRUE, 'Kofi A.',   NULL,NOW(),NOW()),
  ((SELECT id FROM projects WHERE project_code='TSP-001'),'Completion Report',             'REPORT',       '2026-10-31',NULL,        'IN_PROGRESS',TRUE, 'Kofi A.',   NULL,NOW(),NOW()),
  ((SELECT id FROM projects WHERE project_code='TSP-012'),'Feasibility Study',             'REPORT',       '2024-03-31','2024-04-30','COMPLETED',  FALSE,'Ama D.',    NULL,NOW(),NOW()),
  ((SELECT id FROM projects WHERE project_code='TSP-012'),'Environmental Impact Assessment','REPORT',       '2024-06-30','2024-08-31','COMPLETED',  TRUE, 'Ama D.',    NULL,NOW(),NOW()),
  ((SELECT id FROM projects WHERE project_code='TSP-012'),'Detailed Engineering Design',   'DESIGN',       '2025-06-30',NULL,        'DELAYED',    TRUE, 'Ama D.',    NULL,NOW(),NOW());

-- ============================================================
-- SEED DATA: RISKS
-- ============================================================
INSERT INTO "risks" ("project_id","risk_code","description","category","probability","impact","rating","mitigation_action","responsible_person","target_date","status","created_at","updated_at") VALUES
  ((SELECT id FROM projects WHERE project_code='IRAMS'),  'R-IRAMS-01','RAMS software license procurement may fail/be rejected',      'Procurement', 'HIGH',  'HIGH',  9,'Identify alternative COTS RAMS vendors; prepare contingency procurement plan','Boateng E.','2026-08-30','ESCALATED',NOW(),NOW()),
  ((SELECT id FROM projects WHERE project_code='IRAMS'),  'R-IRAMS-02','Key ICT staff attrition risk during system development',       'HR',          'MEDIUM','HIGH',  6,'Retention package and cross-training of junior staff',                        'Boateng E.','2026-09-30','OPEN',     NOW(),NOW()),
  ((SELECT id FROM projects WHERE project_code='TSP-010'),'R-VOL-01', 'Contractor material supply chain disruption',                   'Supply Chain','HIGH',  'HIGH',  9,'Activate alternative material suppliers; escalate to Ministry',                'Kofi A.',  '2026-09-15','ESCALATED',NOW(),NOW()),
  ((SELECT id FROM projects WHERE project_code='TSP-010'),'R-VOL-02', 'Flooding risk to bridge construction zone',                     'Environmental','MEDIUM','HIGH', 6,'Implement flood protection measures; monitor river levels',                    'Kofi A.',  '2026-10-31','OPEN',     NOW(),NOW()),
  ((SELECT id FROM projects WHERE project_code='TSP-012'),'R-TEM-01', 'Right-of-way acquisition delays along motorway',                'Legal',       'HIGH',  'HIGH',  9,'Engage Ministry of Lands; prioritize ROW compensation',                        'Ama D.',   '2026-09-30','OPEN',     NOW(),NOW()),
  ((SELECT id FROM projects WHERE project_code='TSP-006'),'R-BMP-01', 'Subcontractor bridge inspection quality issues',                'Quality',     'MEDIUM','MEDIUM',4,'Increase independent QA inspections',                                         'Ama D.',   '2026-09-30','MITIGATING',NOW(),NOW()),
  ((SELECT id FROM projects WHERE project_code='TSP-008'),'R-NCI-01', 'Community resistance to infrastructure access',                 'Social',      'MEDIUM','MEDIUM',4,'Escalate community liaison; engage local chiefs',                              'Boateng E.','2026-10-31','OPEN',    NOW(),NOW()),
  ((SELECT id FROM projects WHERE project_code='TSP-001'),'R-NHR-01', 'Rainy season delays to surfacing works',                        'Environmental','LOW',  'MEDIUM',2,'Adjust programme; work in drier periods',                                      'Kofi A.',  '2026-09-15','MITIGATING',NOW(),NOW());

-- ============================================================
-- SEED DATA: ISSUES
-- ============================================================
INSERT INTO "issues" ("project_id","issue_code","description","category","severity","impact","action_required","responsible_person","target_date","status","created_at","updated_at") VALUES
  ((SELECT id FROM projects WHERE project_code='IRAMS'),  'I-IRAMS-01','RAMS software procurement stalled — no vendor selected after 8 months','Procurement','CRITICAL','Critical path delay of 5+ months; entire IRAMS delivery at risk',      'Management to approve alternative procurement strategy immediately',             'Boateng E.','2026-08-30','ESCALATED',  NOW(),NOW()),
  ((SELECT id FROM projects WHERE project_code='IRAMS'),  'I-IRAMS-02','Client review comments on SRS outstanding for 3 months',               'Client',     'HIGH',    'Blocking detailed design; causing cascade delays',                      'Schedule urgent client meeting; set firm response deadline',                     'Boateng E.','2026-08-15','OPEN',        NOW(),NOW()),
  ((SELECT id FROM projects WHERE project_code='TSP-010'),'I-VOL-01', 'Steel reinforcement supply shortfall — contractor unable to procure',   'Supply Chain','CRITICAL','Bridge deck construction halted; 3 month delay to completion forecast','Emergency procurement of alternative steel supplier approved by MoR',            'Kofi A.',  '2026-08-25','IN_PROGRESS',  NOW(),NOW()),
  ((SELECT id FROM projects WHERE project_code='TSP-012'),'I-TEM-01', 'ROW parcels — 45 plots not yet compensated; access blocked',            'Legal',      'HIGH',    'Earthworks on 12km section cannot proceed; 6-month programme delay',   'MoR to release ROW compensation funds urgently',                                 'Ama D.',   '2026-09-15','OPEN',        NOW(),NOW()),
  ((SELECT id FROM projects WHERE project_code='TSP-008'),'I-NCI-01', 'Community roadblocks preventing equipment access at Tamale site',       'Social',     'HIGH',    'Works suspended on 8km section; delay accumulating',                   'Regional coordinating council to mediate',                                       'Boateng E.','2026-08-20','IN_PROGRESS',  NOW(),NOW()),
  ((SELECT id FROM projects WHERE project_code='TSP-006'),'I-BMP-01', 'Defective bearing plates identified on 3 bridges',                      'Technical',  'HIGH',    'Safety risk; remedial works required before continuing',               'Structural engineer review and approve remedial design',                         'Ama D.',   '2026-08-31','IN_PROGRESS',  NOW(),NOW());

-- ============================================================
-- SEED DATA: RESOURCES
-- ============================================================
INSERT INTO "resources" ("project_id","resource_type","resource_name","required_quantity","available_quantity","operational_quantity","shortfall","status","notes","created_at","updated_at") VALUES
  ((SELECT id FROM projects WHERE project_code='IRAMS'),  'HUMAN_RESOURCE','Senior Software Engineers',5, 3, 3, 2,'SHORTAGE','2 positions vacant; recruitment in progress',NOW(),NOW()),
  ((SELECT id FROM projects WHERE project_code='IRAMS'),  'EQUIPMENT',     'Development Servers',      4, 2, 2, 2,'SHORTAGE','Procurement pending Ministry approval',       NOW(),NOW()),
  ((SELECT id FROM projects WHERE project_code='TSP-010'),'HUMAN_RESOURCE','Bridge Engineers',          8, 6, 6, 2,'PARTIAL', NULL,NOW(),NOW()),
  ((SELECT id FROM projects WHERE project_code='TSP-010'),'VEHICLE',       'Heavy Duty Vehicles',       20,14,12, 6,'SHORTAGE','6 vehicles breakdown — under repair',         NOW(),NOW()),
  ((SELECT id FROM projects WHERE project_code='TSP-010'),'EQUIPMENT',     'Tower Cranes',              3, 2, 2, 1,'PARTIAL', NULL,NOW(),NOW()),
  ((SELECT id FROM projects WHERE project_code='TSP-012'),'HUMAN_RESOURCE','Site Engineers',            12, 9, 8, 3,'PARTIAL', NULL,NOW(),NOW()),
  ((SELECT id FROM projects WHERE project_code='TSP-012'),'VEHICLE',       'Construction Vehicles',     35,22,19,13,'SHORTAGE','ROW issue limiting equipment deployment to site',NOW(),NOW()),
  ((SELECT id FROM projects WHERE project_code='TSP-001'),'HUMAN_RESOURCE','Road Engineers',            6, 6, 6, 0,'ADEQUATE',NULL,NOW(),NOW()),
  ((SELECT id FROM projects WHERE project_code='TSP-001'),'VEHICLE',       'Road Construction Vehicles',15,14,13, 1,'ADEQUATE',NULL,NOW(),NOW());

-- ============================================================
-- SEED DATA: INTERVENTIONS
-- ============================================================
INSERT INTO "interventions" ("project_id","risk_id","issue_id","priority","problem","impact","required_decision","responsible_person","deadline","status","created_at","updated_at") VALUES
  (
    (SELECT id FROM projects WHERE project_code='IRAMS'),
    (SELECT id FROM risks  WHERE risk_code='R-IRAMS-01'),
    (SELECT id FROM issues WHERE issue_code='I-IRAMS-01'),
    'CRITICAL',
    'RAMS software procurement has stalled for 8 months. No vendor selected. Critical path delay of 5+ months threatens project delivery by August 2026 deadline.',
    'IRAMS project will fail to deliver by contract end date. Risk of contract termination and reputational damage.',
    'Approve alternative procurement strategy: Direct contracting with pre-qualified RAMS vendor under emergency procurement rules.',
    'James Thornton (Transport Manager)','2026-08-30','PENDING',NOW(),NOW()
  ),
  (
    (SELECT id FROM projects WHERE project_code='TSP-010'),
    NULL,
    (SELECT id FROM issues WHERE issue_code='I-VOL-01'),
    'CRITICAL',
    'Steel reinforcement supply to Volta River Bridge site has halted. Contractor unable to source from original supplier. Bridge deck construction suspended.',
    '3-month delay to bridge completion. August 2026 deadline cannot be met. Financial penalties may apply.',
    'Approve emergency procurement of alternative steel supplier and cost variation.',
    'James Thornton (Transport Manager)','2026-08-25','IN_PROGRESS',NOW(),NOW()
  ),
  (
    (SELECT id FROM projects WHERE project_code='TSP-012'),
    NULL,
    (SELECT id FROM issues WHERE issue_code='I-TEM-01'),
    'HIGH',
    '45 ROW plots uncompensated. Communities blocking access to 12km section of Tema Motorway. Works suspended.',
    '6-month programme delay. Financial penalties projected at USD 1.2M if completion date is not extended.',
    'Ministry of Roads to urgently release ROW compensation funds (USD 850,000) and approve time extension.',
    'James Thornton (Transport Manager)','2026-09-15','PENDING',NOW(),NOW()
  ),
  (
    (SELECT id FROM projects WHERE project_code='TSP-006'),
    NULL,NULL,
    'HIGH',
    'Defective bearing plates discovered on 3 bridges during inspection. Structural safety concern.',
    'Works must be suspended until remedial design approved. Delay to programme.',
    'Approve emergency structural review and remedial works contract variation.',
    'Sarah Mensah (Planning Manager)','2026-08-31','IN_PROGRESS',NOW(),NOW()
  ),
  (
    (SELECT id FROM projects WHERE project_code='TSP-008'),
    NULL,NULL,
    'MEDIUM',
    'Community roadblocks at Tamale site preventing equipment access for 3 weeks.',
    'Works suspended on 8km section. Schedule slipping further.',
    'Authorize Regional Coordinating Council mediation and community compensation package.',
    'Sarah Mensah (Planning Manager)','2026-08-20','IN_PROGRESS',NOW(),NOW()
  );

-- ============================================================
-- SEED DATA: RECOVERY PLANS
-- ============================================================
INSERT INTO "recovery_plans" ("project_id","original_gap","recovery_target_gap","current_gap","recovery_status","recovery_action","responsible_person","target_date","notes","created_at","updated_at") VALUES
  (
    (SELECT id FROM projects WHERE project_code='IRAMS'),
    -25.9,-10.0,-25.9,'NOT_STARTED',
    '1. Resolve software procurement immediately.' || chr(10) || '2. Mobilize additional ICT staff.' || chr(10) || '3. Implement accelerated development sprints.' || chr(10) || '4. Fast-track UAT process.',
    'Boateng E.','2026-08-31','Recovery cannot commence until procurement decision is made.',NOW(),NOW()
  ),
  (
    (SELECT id FROM projects WHERE project_code='TSP-010'),
    -20.0,-8.0,-20.0,'AT_RISK',
    '1. Emergency procurement of alternative steel supplier.' || chr(10) || '2. Increase workforce by 30%.' || chr(10) || '3. Extended working hours (7 days/week).' || chr(10) || '4. Seek time extension from client.',
    'Kofi A.','2026-09-30',NULL,NOW(),NOW()
  ),
  (
    (SELECT id FROM projects WHERE project_code='TSP-012'),
    -24.0,-12.0,-24.0,'NOT_STARTED',
    '1. Urgently resolve ROW issues with Ministry support.' || chr(10) || '2. Mobilize additional earth-moving equipment.' || chr(10) || '3. Accelerate works on unaffected sections.',
    'Ama D.','2026-10-31','Recovery blocked by ROW issue.',NOW(),NOW()
  );

-- ============================================================
-- SEED DATA: FORWARD LOOKS
-- ============================================================
INSERT INTO "forward_looks" ("project_id","period","category","description","expected_date","responsible_person","status","impact","created_at","updated_at") VALUES
  ((SELECT id FROM projects WHERE project_code='IRAMS'), 'NEXT_30_DAYS','DECISION',             'Management decision on alternative RAMS procurement strategy required',       '2026-08-30','Transport Manager','PENDING','Critical — project delivery at risk without this decision',NOW(),NOW()),
  ((SELECT id FROM projects WHERE project_code='IRAMS'), 'NEXT_30_DAYS','PROCUREMENT',          'Issue RFP to pre-qualified RAMS vendors if decision approved',                 '2026-09-05','Boateng E.',      'PENDING','High',NOW(),NOW()),
  ((SELECT id FROM projects WHERE project_code='IRAMS'), 'NEXT_60_DAYS','MILESTONE',            'Commence RAMS module development with new vendor',                            '2026-10-01','Boateng E.',      'PENDING','High',NOW(),NOW()),
  ((SELECT id FROM projects WHERE project_code='IRAMS'), 'NEXT_90_DAYS','RISK',                 'Review delivery feasibility — consider time extension request',               '2026-10-31','Boateng E.',      'PENDING','High',NOW(),NOW()),
  ((SELECT id FROM projects WHERE project_code='TSP-010'),'NEXT_30_DAYS','DECISION',            'Confirm alternative steel supplier and approve emergency variation order',     '2026-08-25','Transport Manager','PENDING','Critical',NOW(),NOW()),
  ((SELECT id FROM projects WHERE project_code='TSP-010'),'NEXT_30_DAYS','MILESTONE',           'Resume bridge deck construction after steel supply restored',                  '2026-09-10','Kofi A.',         'PENDING','Critical',NOW(),NOW()),
  ((SELECT id FROM projects WHERE project_code='TSP-010'),'NEXT_60_DAYS','CONTRACTUAL_DEADLINE','Contract completion date review with MoR — time extension submission',        '2026-09-30','Kofi A.',         'PENDING','High',NOW(),NOW()),
  ((SELECT id FROM projects WHERE project_code='TSP-012'),'NEXT_30_DAYS','DECISION',            'Ministry of Roads to release ROW compensation funds — urgent',                '2026-09-15','Transport Manager','PENDING','Critical',NOW(),NOW()),
  ((SELECT id FROM projects WHERE project_code='TSP-012'),'NEXT_60_DAYS','MILESTONE',           'Commence earthworks on cleared ROW sections',                                 '2026-10-15','Ama D.',          'PENDING','High',NOW(),NOW()),
  ((SELECT id FROM projects WHERE project_code='TSP-001'),'NEXT_30_DAYS','INVOICE',             'Interim Payment Certificate #8 — USD 850,000 expected',                       '2026-09-05','Abena O.',        'PENDING','Medium',NOW(),NOW()),
  ((SELECT id FROM projects WHERE project_code='TSP-001'),'NEXT_30_DAYS','MILESTONE',           'Pavement wearing course application — final 15km',                            '2026-09-20','Kofi A.',         'PENDING','High',NOW(),NOW()),
  ((SELECT id FROM projects WHERE project_code='TSP-001'),'NEXT_60_DAYS','MILESTONE',           'Project completion and handover to client',                                   '2026-09-30','Kofi A.',         'PENDING','High',NOW(),NOW()),
  ((SELECT id FROM projects WHERE project_code='TSP-004'),'NEXT_30_DAYS','INVOICE',             'Invoice #7 submission — USD 720,000',                                         '2026-09-01','Abena O.',        'PENDING','Medium',NOW(),NOW()),
  ((SELECT id FROM projects WHERE project_code='TSP-008'),'NEXT_30_DAYS','RESOURCE',            'Mobilize 3 additional site engineers for Northern Corridor',                  '2026-09-01','Boateng E.',      'PENDING','Medium',NOW(),NOW());

-- ============================================================
-- RESET SEQUENCES (run after import to avoid ID conflicts)
-- ============================================================
SELECT setval('users_id_seq',            (SELECT COALESCE(MAX(id),1) FROM users));
SELECT setval('projects_id_seq',         (SELECT COALESCE(MAX(id),1) FROM projects));
SELECT setval('contracts_id_seq',        (SELECT COALESCE(MAX(id),1) FROM contracts));
SELECT setval('project_progress_id_seq', (SELECT COALESCE(MAX(id),1) FROM project_progress));
SELECT setval('milestones_id_seq',       (SELECT COALESCE(MAX(id),1) FROM milestones));
SELECT setval('deliverables_id_seq',     (SELECT COALESCE(MAX(id),1) FROM deliverables));
SELECT setval('financial_records_id_seq',(SELECT COALESCE(MAX(id),1) FROM financial_records));
SELECT setval('risks_id_seq',            (SELECT COALESCE(MAX(id),1) FROM risks));
SELECT setval('issues_id_seq',           (SELECT COALESCE(MAX(id),1) FROM issues));
SELECT setval('resources_id_seq',        (SELECT COALESCE(MAX(id),1) FROM resources));
SELECT setval('interventions_id_seq',    (SELECT COALESCE(MAX(id),1) FROM interventions));
SELECT setval('recovery_plans_id_seq',   (SELECT COALESCE(MAX(id),1) FROM recovery_plans));
SELECT setval('forward_looks_id_seq',    (SELECT COALESCE(MAX(id),1) FROM forward_looks));

-- ============================================================
-- END OF BACKUP
-- ============================================================
