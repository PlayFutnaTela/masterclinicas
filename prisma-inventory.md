# Inventário de usos do Prisma

Arquivos que usam `prisma` e devem ser refatorados para `pg`:

- src/lib/db.ts (Cria o cliente Prisma singleton)
- src/lib/metrics.ts (várias agregações: metricEvent, lead, appointment)
- src/app/selecionar-clinica/page.tsx
- src/app/dashboard/page.tsx
- src/app/api/webhooks/n8n/route.ts
- src/app/api/organizations/route.ts (já implementado fallback para PG)
- src/app/api/metricas/route.ts
- src/app/api/leads/route.ts
- src/app/api/agendamentos/route.ts
- src/app/api/admin/organizations/route.ts

Próximos passos sugeridos:
1. Refatorar endpoints GET simples primeiro (organizations já feito).
2. Refatorar CRUD de `leads` e `agendamentos` (mais usadas pelo app) usando transações/ prepared statements.
3. Refatorar métricas e webhooks (operações em lote/agrupamento) com SQL ou views.
4. Após ampla validação, remover `@prisma/client`, `prisma` e arquivos associados.
