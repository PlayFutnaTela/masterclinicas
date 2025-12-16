# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

### Added
- Migrate database access from Prisma to `pg` (connection pool + query helper).
- New `src/lib/pg.ts` with Pool wrapper and `checkConnection()` health helper.
- `scripts/test-webhook-n8n.ts` smoke test for n8n webhook.

### Changed
- Replaced Prisma usage across API endpoints and pages with `pg` SQL queries and transactions:
  - `src/app/api/webhooks/n8n/route.ts` — fully migrated to `pg` with transaction handling and metric events.
  - `src/app/api/organizations/route.ts`, `src/app/api/agendamentos/route.ts`, `src/app/api/leads/route.ts`, `src/app/api/metricas/route.ts`, `src/app/api/admin/organizations/route.ts` — migrated to `pg`.
  - `src/app/dashboard/page.tsx`, `src/app/selecionar-clinica/page.tsx` — replaced Prisma lookups with `pg` queries.
- Removed Prisma schema, seed and migrations; added a deprecation stub in `src/lib/db.ts` to fail fast if `prisma` is used.

### Removed
- Removed `prisma/` folder (schema, seed, migrations) and the `@prisma/client` usages.

### Notes
- All changes were committed on branch `feat/remove-prisma` and pushed to remote. Please run E2E tests in staging before merging.

---

Please ensure CI runs integration and E2E tests before merging this PR. If you'd like, I can prepare a PR body with checklist to guide the reviewer.