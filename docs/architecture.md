# EEC Transport Sector PMS — Architecture Overview

## 1. System Architecture

The EEC Transport Sector Planning & Monitoring System is built as a clean, tiered enterprise application:

```text
                     EEC TRANSPORT SECTOR
                              |
                              v
                   React + Vite Frontend
                    (Chakra UI + Recharts)
                              |
                          REST API
                      (Axios + JWT Auth)
                              |
                              v
                      Node.js + Express
                              |
                     Controllers & Services
                              |
                          Sequelize
                              |
                              v
                         PostgreSQL
```

## 2. Layer Separation

- **Frontend (`/frontend`)**: Single-page application using React 18, React Router v6, Chakra UI for dark-mode enterprise UI, Recharts for executive visualizations, and React Hook Form for validated registers.
- **API Routing (`/backend/src/routes`)**: Express router definitions enforcing JWT token validation and role-based permissions (`ADMIN`, `TRANSPORT_MANAGER`, `PLANNING_MANAGER`, `PROJECT_MANAGER`, `FINANCE`, `VIEWER`).
- **Controllers (`/backend/src/controllers`)**: HTTP request parameter extraction and error handling wrappers.
- **Services (`/backend/src/services`)**: Business logic, derived calculation engines, and database query coordination.
- **Calculations Utility (`/backend/src/utils/calculations.js`)**: Single source of truth for all KPI formulas (SPI, Health Status, Risk Rating, Resource Shortfall, Financial Progress).
- **Models (`/backend/src/models`)**: Sequelize ORM models mapping to PostgreSQL tables with strict foreign-key cascades and validation.

## 3. Security Architecture

- **Passwords**: Hashed using `bcryptjs` with salt work factor of 10–12.
- **Authentication**: Stateless JSON Web Tokens (JWT) with 8-hour expiry.
- **Authorization**: Granular role-based authorization middleware on both API routes and frontend UI elements.
- **HTTP Security**: `helmet` security headers enabled, CORS configuration locked to configured client origin.
