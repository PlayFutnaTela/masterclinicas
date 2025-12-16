Title: feat(remove-prisma): migrate DB access from Prisma to `pg` and remove Prisma artifacts

Body:

Resumo
-----
Esta PR remove o uso do Prisma e substitui por acesso direto ao Postgres via `pg` (Pool + query helper). A mudança foi feita de forma incremental e validada localmente com testes de tipo e smoke tests.

Principais alterações
---------------------
- Adicionado `src/lib/pg.ts` — Pool wrapper + `query()` e `checkConnection()`.
- Migrados endpoints para `pg` com SQL/transactions: webhooks (n8n), organizations, agendamentos (CRUD), leads (list/create/update), métricas e admin organizations.
- Atualizadas páginas que faziam lookups com Prisma para utilizar `pg` (dashboard, selecionar-clinica).
- Removida pasta `prisma/` (schema, seed, migrations) e atualizado `src/lib/db.ts` para lançar erro claro em caso de uso legado de `prisma`.
- Adicionado `scripts/test-webhook-n8n.ts` (smoke test) e `npm run test:webhook`.

Testes e validação
------------------
- `npx tsc --noEmit` executado com sucesso.
- Smoke test do webhook: `npm run test:webhook` passou localmente.
- Recomendo executar E2E em staging (com Supabase DB) e rodar CI (integração) antes de merge.

Checklist
---------
- [x] Migrar lógica para `pg` com queries e transações
- [x] Remover fallbacks do Prisma
- [x] Rodar `npx tsc` e corrigir erros de tipagem
- [x] Adicionar smoke test para webhook
- [x] Remover pasta `prisma/` e arquivos relacionados
- [ ] Executar testes E2E em staging
- [ ] Atualizar CI para remover passos de Prisma (se aplicável)

Observações
-----------
- Após merge, remover as dependências `@prisma/client` e `prisma` do package.json se ainda estiverem presentes e ajustar CI/CD para não usar `prisma migrate`.
- Se preferir, posso abrir o PR (usar a URL: https://github.com/PlayFutnaTela/masterclinicas/pull/new/feat/remove-prisma) ou abrir via `gh` quando disponível no ambiente.
