# Database Seeding (Plan Addendum)

Seed the app database with **realistic, market-style data** for Projects, Tickets, Notes, and Policies so agents have useful content to sync to Watson KBs and so the Tracking UI and demos look credible.

**Scope:** After the new Prisma models exist (Project, Ticket, Note, Policy per the main plan), add a seed step that inserts a **good average volume** of sample data—enough to exercise lists, filters, and KB sync without being excessive.

---

## 1. Models to seed (from main plan)

- **Project** — `id`, `name`, `slug`, `description`, `whereHosted`, `status`, `createdAt`, `updatedAt`, optional `createdBy`
- **Ticket** — `id`, `projectId`, `title`, `description`, `status`, `kind`, `createdAt`, `updatedAt`, optional `createdBy`, optional `assigneeId`
- **Note** — `id`, `title`, `content`, optional `projectId`, optional `tag`/category, `createdAt`, `updatedAt`, `createdBy`
- **Policy** — `id`, `title`, `content`, `category` (e.g. hr, it, security, compliance), `effectiveAt`, `createdAt`, `updatedAt`, optional `createdBy`

Seeding assumes at least one **User** exists (e.g. from auth) to use as `createdBy` / `assigneeId` where applicable; the seed script can create a dedicated “system” user or use the first existing user.

---

## 2. Volume (good average / market-like)

| Entity   | Suggested count | Rationale |
|----------|------------------|-----------|
| Projects | 6–12             | Enough to show multiple teams/products; real companies often have 5–20 active projects. |
| Tickets  | 30–80            | Mix of open/done; 3–10 per project on average; realistic backlog. |
| Notes    | 15–30            | Runbooks, how-tos, meeting notes; 2–4 per project + global. |
| Policies | 8–18             | HR (3–5), IT (2–4), security (2–4), compliance (2–3). |

Total: on the order of 60–140 rows. Adjust up or down for “a lot” vs “light” demos; this range is a good average for market-style demos and dev.

---

## 3. Content guidelines (market-style data)

- **Projects:** Realistic product/team names (e.g. “Customer Portal”, “Data Pipeline”, “Mobile App”), short descriptions, and `whereHosted` with placeholder URLs (e.g. GitHub repo, staging URL, docs link). Status: `active` / `archived` / `planning`.
- **Tickets:** Titles like “Fix login timeout”, “Add API rate limits”, “Document deployment process”; `kind`: `bug`, `task`, `feature`, `incident`. Status: `open`, `in_progress`, `done`. Spread across projects.
- **Notes:** Titles like “Deploy to staging”, “Incident escalation”, “New hire checklist”; `content` as short runbooks or bullet steps. Use `tag` or category: `runbook`, `how-to`, `meeting`, `onboarding`.
- **Policies:** Titles like “PTO policy”, “VPN and remote access”, “PII handling”, “Production access approval”; `content` as short policy text (2–4 paragraphs). `category`: `hr`, `it`, `security`, `compliance`. Set `effectiveAt` to past dates.

Use **consistent, neutral names** (no real customer names) so the data is obviously sample but plausible for any software company.

---

## 4. Example seed data (templates)

Below are minimal examples; the actual seed script can expand these or use arrays of variants.

**Projects (6–12):**

- Customer Portal — “Public-facing customer account and billing.” — Hosted: GitHub `org/customer-portal`, staging `https://portal.staging.example.com`, docs `.../wiki`.
- Data Pipeline — “ETL and analytics pipelines.” — Hosted: GitHub `org/data-pipeline`, Airflow `https://airflow.internal.example.com`.
- Mobile App (iOS/Android) — “Native mobile apps.” — Hosted: GitHub `org/mobile-app`, TestFlight / Play Internal.
- Internal API Gateway — “Auth and routing for internal services.” — Hosted: GitHub `org/api-gateway`, Kubernetes `api-gateway.default.svc`.
- Admin Dashboard — “Internal ops and support dashboard.” — Hosted: GitHub `org/admin-dashboard`, `https://admin.internal.example.com`.
- Notification Service — “Email and push notifications.” — Hosted: GitHub `org/notifications`, AWS SQS + Lambda.

**Tickets (sample titles per kind):**

- Bug: “Login timeout on slow networks”, “Stale cache after deploy”, “Wrong redirect after password reset”.
- Task: “Add API rate limiting”, “Document deployment runbook”, “Upgrade Node to LTS”.
- Feature: “SSO for enterprise”, “Export to CSV”, “Dark mode”.
- Incident: “Outage 2024-01-15 database”, “High error rate API gateway”.

Spread across the projects above; set a mix of `open` / `in_progress` / `done`.

**Notes (sample titles + short content):**

- “Deploy to staging” — Steps: build, run tests, deploy to staging, smoke test, notify.
- “Incident escalation” — When to page on-call, who to notify, war room link.
- “New hire dev setup” — Install IDE, clone repos, run `./scripts/setup`, request access to Slack and Jira.
- “Request production access” — Form link, manager approval, security review, access granted within 48h.

**Policies (sample titles + category):**

- HR: “PTO policy”, “Code of conduct”, “Remote work policy”, “Parental leave”.
- IT: “VPN and remote access”, “Laptop and device policy”, “Software approval”.
- Security: “PII handling”, “Production access”, “Incident response”.
- Compliance: “Data retention”, “Audit and logging”, “Third-party data sharing”.

Each policy record has 2–4 paragraphs of placeholder text and an `effectiveAt` date.

---

## 5. Implementation

- **Mechanism:** Use Prisma’s seed: in [package.json](package.json) set `"prisma": { "seed": "ts-node prisma/seed.ts" }` (or `tsx prisma/seed.ts`), and add [prisma/seed.ts](prisma/seed.ts) that:
  1. Ensures at least one user exists (or create a seed user).
  2. Creates Projects (6–12).
  3. Creates Tickets (30–80) linked to projects.
  4. Creates Notes (15–30), some with `projectId`, some global; set `createdBy` where required.
  5. Creates Policies (8–18) with category and content.
- **Idempotency:** Seed can use `upsert` by a stable key (e.g. `slug` for Project, or a `seedId` field) so re-running doesn’t duplicate; or truncate seed tables (Project, Ticket, Note, Policy) then insert. Avoid deleting User/Session/ChatThread.
- **Order:** Project → Ticket (needs projectId); Note and Policy can be created after User. Policy and Note may need `createdBy` → create after User.

---

## 6. Where this fits in the build

1. Add Prisma models (Project, Ticket, Note, Policy) and migrate.
2. Add **database seed** (this doc): implement `prisma/seed.ts` with the volumes and content above.
3. Run `pnpm prisma db seed` (or equivalent) after migrate when setting up dev/demo.
4. Later: “Sync to Watson” job reads these entities and pushes text docs to the appropriate Watson KBs per agent.

This gives you a single place for “market-style” seed data and keeps the plan updated for building. If anything pops up during implementation (e.g. schema changes, extra fields), the seed can be adjusted in the same place.
