# Database Schema & Entity Relationships

## 1. Entity Overview

The PostgreSQL database contains 13 relational entities:

1. `users` — System user accounts with role-based access control.
2. `projects` — Central portfolio register for transport sector projects.
3. `contracts` — Commercial contracts and variations tied to projects.
4. `project_progress` — Monthly planned vs. actual progress, schedule variance, and SPI.
5. `milestones` — Key project milestones with critical path flags and target dates.
6. `deliverables` — Technical reports, surveys, designs, software modules, and documentation.
7. `financial_records` — Monthly invoicing, certified sums, disbursements, and costs.
8. `risks` — Potential threats evaluated by Probability × Impact score.
9. `issues` — Active materialized problems categorized by severity.
10. `resources` — Human resources, vehicles, equipment, and subconsultants.
11. `interventions` — High-priority executive management decisions and actions required.
12. `recovery_plans` — Remediation plans for RED / lagging projects.
13. `forward_looks` — 30 / 60 / 90-day lookahead items.

## 2. Core Relational Diagram

```text
               +---------------+
               |     users     |
               +-------+-------+
                       | 1:N (project_manager)
                       v
               +---------------+
+------------> |   projects    | <------------+
|              +-------+-------+              |
| 1:N                  | 1:N                  | 1:N
|                      +----------------+     |
v                      v                v     v
contracts      project_progress    milestones deliverables
financial_records   risks             issues    resources
recovery_plans   interventions     forward_looks
```
