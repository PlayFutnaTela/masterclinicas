# Tarefas para remoção segura do Prisma

Resumo curto e pragmático para remover o Prisma do projeto sem quebrar a aplicação.

1. Criar branch `feat/remove-prisma` e fazer backup completo do banco.
2. Inventariar todos os pontos que usam `prisma` e mapear queries críticas.
3. Implementar camada de acesso a dados com `pg` (Pool) + endpoint `/api/health`.
4. Refatorar APIs críticas (leads, agendamentos, organizations, metricas, webhooks) para usar a nova camada com prepared statements.
5. Adicionar testes automatizados e validar manualmente em staging.
6. Remover `@prisma/client` e `prisma` do projeto e excluir arquivos do Prisma após validação.
7. Realizar deploy gradual em staging/produção com plano de rollback e monitoramento.

Observação: utilize as credenciais em `supabase-cred.md` para configurar a conexão no `.env` local ao testar.

Status atual: comecei a migração — adicionei `pg` e `src/lib/pg.ts`, implementei `/api/health`, e refatorei parcialmente `organizations` (GET), `agendamentos` (GET/POST/PATCH/DELETE) e `leads` (GET/POST/PATCH) para usar `pg` com fallback para Prisma. Próximo passo: refatorar métricas, webhooks e endpoints administrativos; remover arquivos do Prisma e executar testes em staging.

### Etapa 1: Diagnóstico Completo
1. Identificar todos os arquivos que utilizam Prisma (tipicamente arquivos contendo `import { PrismaClient }` ou similares)
2. Criar inventário de todas as operações de banco de dados (queries, creates, updates, deletes)
3. Documentar todas as entidades e relacionamentos definidos no schema do Prisma (`schema.prisma`)
4. Verificar scripts de deploy e CI/CD que utilizam Prisma (como `prisma migrate`)

### Etapa 2: Backup e Preparação
1. Fazer backup completo do banco de dados
2. Criar branch dedicada para remoção do Prisma (`feat/remove-prisma`)
3. Congelar novas funcionalidades que afetem o banco de dados durante a transição
4. Atualizar documentação do projeto indicando a mudança

### Etapa 3: Configuração da Nova Camada de Dados
1. Instalar dependências necessárias (`pg`, `dotenv`, `typescript` se necessário)
2. Criar nova camada de abstração para conexão com PostgreSQL (usando `pg.Pool`)
3. Definir interface clara para operações de banco de dados (padrão Repository Pattern)
4. Configurar variáveis de ambiente para conexão com o banco

### Etapa 4: Refatoração Segura
1. Substituir chamadas ao Prisma por queries diretas com `pg`
2. Manter consistência nos nomes das funções e estrutura de dados
3. Implementar tratamento de erros robusto para todas as operações de banco
4. Adotar prepared statements para evitar SQL injection
5. Manter cobertura de testes equivalentes às funcionalidades removidas

### Etapa 5: Garantia de Integridade dos Dados
1. Revisar manualmente todas as queries para garantir equivalência de funcionalidade
2. Implementar verificações de integridade referencial no código (onde antes era feita pelo Prisma)
3. Criar scripts de validação para comparar resultados entre versões com e sem Prisma
4. Realizar testes de carga para validar desempenho e estabilidade

### Etapa 6: Testes Abrangentes
1. Executar testes unitários e de integração existentes
2. Implementar testes específicos para a nova camada de dados
3. Validar todos os fluxos críticos do sistema (autenticação, CRUD de entidades principais)
4. Realizar testes manuais em ambiente de homologação

### Etapa 7: Deploy Gradual
1. Planejar janela de manutenção para deploy
2. Realizar deploy em ambiente de staging primeiro
3. Validar completamente o funcionamento do sistema
4. Realizar deploy em produção com plano de rollback imediato

### Etapa 8: Limpeza Final
1. Remover todas as dependências do Prisma (`@prisma/client`, `prisma`)
2. Excluir arquivos do Prisma (`schema.prisma`, migrations, seed)
3. Atualizar documentação técnica e README
4. Retreinar equipe sobre a nova arquitetura de banco de dados

## Recursos Necessários
- 2 desenvolvedores sêniores para execução das etapas 4 e 5
- 1 DBA para revisão das queries e otimização
- 1 QA para validação completa dos testes
- Acesso administrativo ao banco de dados para backups

## Riscos e Mitigação
1. **Perda de dados**: Backup completo antes do início e validação pós-mudança
2. **Falhas de desempenho**: Testes de carga e monitoramento pós-deploy
3. **Erros não detectados**: Cobertura de testes rigorosa e validação humana
4. **Interrupção de serviço**: Janela de manutenção planejada e plano de rollback

## Critérios de Sucesso
- Sistema operando corretamente sem o Prisma
- Todos os testes passando
- Tempo de resposta dentro dos limites aceitáveis
- Integridade dos dados mantida
- Equipe capacitada sobre a nova arquitetura