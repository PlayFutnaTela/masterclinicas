# MasterClínicas - Plataforma de Gestão para Clínicas

## Visão Geral

MasterClínicas é uma plataforma web moderna desenvolvida com Next.js 16, projetada especificamente para gerenciar clínicas e consultórios médicos. A plataforma oferece um sistema completo de gerenciamento que inclui agendamentos, gestão de leads, métricas de desempenho e configurações administrativas, tudo integrado em uma interface intuitiva e responsiva.

## Arquitetura e Tecnologias

### Frontend
- **Next.js 16**: Framework React para renderização do lado do servidor (SSR) e construção de aplicações web modernas
- **React 19.2.1**: Biblioteca JavaScript para construção de interfaces de usuário
- **TypeScript**: Tipagem estática para melhor manutenção e prevenção de erros
- **Tailwind CSS**: Framework de estilização utilitário para interfaces modernas
- **Lucide React**: Biblioteca de ícones para componentes visuais

### Backend e Autenticação
- **NextAuth.js**: Sistema de autenticação para gerenciamento de sessões e usuários
- **Supabase**: Banco de dados PostgreSQL com autenticação, autorização e funcionalidades de backend como serviço
- **Prisma**: ORM (Object-Relational Mapping) para manipulação eficiente do banco de dados

### Visualização de Dados
- **Recharts**: Biblioteca para criação de gráficos e visualização de métricas

## Funcionalidades Principais

### 1. Arquitetura Multi-Tenant
MasterClínicas agora suporta múltiplas clínicas (tenants) em uma única instância da plataforma:

- **Organização (Tenant)**: Cada clínica é uma organização independente com seus próprios dados
- **Isolamento de Dados**: Dados de uma clínica não são visíveis para outras clínicas
- **Controle de Acesso Baseado em Função (RBAC)**: 
  - **Admin**: Acesso total à organização (gerenciamento de usuários, configurações)
  - **Gerente**: Acesso de leitura e escrita aos dados operacionais
  - **Operador**: Acesso limitado apenas aos dados necessários para operações
- **Row-Level Security (RLS)**: Camada extra de proteção no banco de dados Supabase

**Modelos de Dados:**
- `Organization`: Representa cada clínica (nome, slug único, webhook, metadata)
- `UserOrganization`: Tabela de junção que vincula usuários a organizações com seus respectivos roles
- Dados isolados: `Lead`, `Appointment`, `MetricEvent` incluem `organizationId` para isolamento

### 2. Dashboard
- Interface central com visão geral das operações da clínica
- Cartões de estatísticas para métricas importantes (específicas da organização)
- Componentes de gráficos para visualização de dados
- Exibe o nome da clínica dinâmico baseado na organização do usuário

### 3. Agendamentos
- Sistema completo de gerenciamento de agendamentos
- Interface para visualização e edição de compromissos
- Dados isolados por organização
- Integração com o banco de dados para persistência dos dados

### 4. Gestão de Leads
- Sistema para capturar, gerenciar e converter leads
- Tabela de leads com informações detalhadas
- Funcionalidades de filtragem e organização
- Isolamento de leads por organização

### 5. Métricas e Análises
- Painel de métricas com dados estatísticos
- Gráficos interativos para análise de desempenho
- Visualização de tendências e KPIs da clínica
- Dados filtrados por organização do usuário

### 6. Configurações
- Painel de configurações administrativas
- Gerenciamento de parâmetros da clínica
- Personalização do sistema
- Acesso restrito a usuários com role de admin

### 7. Autenticação Multi-Tenant
- Sistema de login seguro
- Gerenciamento de sessão de usuário
- Validação automática da organização na sessão
- Proteção de rotas privadas com verificação de organização

## Estrutura do Projeto

```
src/
├── app/                 # Rotas da aplicação (App Router)
│   ├── (dashboard)/     # Página principal após login
│   ├── agendamentos/    # Funcionalidade de agendamentos
│   ├── api/            # Endpoints da API
│   ├── configuracoes/  # Configurações da plataforma
│   ├── dashboard/      # Dashboard principal
│   ├── leads/          # Gestão de leads
│   ├── login/          # Página de autenticação
│   ├── metricas/       # Métricas e relatórios
│   └── ...             # Outras rotas
├── components/         # Componentes reutilizáveis
│   ├── dashboard/      # Componentes do dashboard
│   ├── charts/         # Componentes de gráficos
│   └── ui/            # Componentes de UI genéricos
├── lib/               # Bibliotecas e utilitários
│   ├── supabase.ts    # Configuração do cliente Supabase
│   ├── api-client.ts  # Cliente de API
│   ├── auth.ts        # Funções de autenticação
│   └── ...            # Outras bibliotecas
└── types/             # Definições de tipos TypeScript
```

## Integração com Supabase

O sistema utiliza o Supabase como backend como serviço, proporcionando:

- **Banco de dados PostgreSQL** para armazenamento seguro e escalável
- **Autenticação de usuários** com suporte a login via e-mail e provedores OAuth
- **Controle de acesso** baseado em permissões
- **API REST e GraphQL** para operações de dados
- **Armazenamento de arquivos** para upload e gerenciamento de documentos

As credenciais do Supabase são gerenciadas de forma segura através de variáveis de ambiente:

- `NEXT_PUBLIC_SUPABASE_URL`: URL do projeto Supabase
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Chave pública para operações anônimas
- `SUPABASE_SERVICE_ROLE_KEY`: Chave de serviço para operações privilegiadas

## Middleware e Segurança

A aplicação inclui middleware abrangente para:
- Proteger rotas que exigem autenticação
- Redirecionar usuários não autenticados
- Verificar status de autenticação antes de acessar áreas restritas
- **Validação de Organização**: Garantir que usuários só acessem dados de sua organização
- **Verificação de Permissões**: Validar roles (admin, gerente, operador) para operações específicas

### Camadas de Segurança Multi-Tenant:

1. **Middleware Next.js**: Validação inicial de autenticação e organização
2. **NextAuth.js**: Gerenciamento de sessão com `organizationId` e `userRole`
3. **org-middleware.ts**: Funções de validação de organização e permissões
4. **Row-Level Security (RLS)**: Políticas SQL no Supabase para isolamento no nível do banco

**Funções de Validação Disponíveis:**
- `validateUserOrganization(userId, organizationId)`: Verifica se usuário pertence à organização
- `getOrganizationRole(userId, organizationId)`: Retorna o role do usuário na organização
- `hasPermission(userId, organizationId, requiredRole)`: Valida permissão hierárquica
- `requireRole(userId, organizationId, requiredRole)`: Lança erro se role insuficiente

## API Routes

A plataforma implementa várias rotas de API para:

- **Gestão de agendamentos**: CRUD de agendamentos com isolamento por organização
  - `GET /api/agendamentos`: Lista agendamentos da organização do usuário
  - `POST /api/agendamentos`: Cria novo agendamento validando organização
  - `PATCH /api/agendamentos`: Atualiza status do agendamento
  
- **Autenticação**: Integração com NextAuth.js com suporte multi-tenant
  - Retorna `organizationId` e `userRole` na sessão
  
- **Gestão de leads**: Operações com dados de leads isolados por organização
  - `GET /api/leads`: Lista leads da organização
  - `POST /api/leads`: Cria novo lead na organização
  - `PATCH /api/leads`: Atualiza status do lead
  
- **Métricas**: Recuperação de dados estatísticos com agregação por organização
  - `GET /api/metricas`: Retorna métricas filtradas pela organização do usuário
  - Suporta parâmetros: `period` (7d, 30d, 90d, 365d) e `type` (summary, overtime, cards)
  
- **Webhooks**: Integração com serviços externos (ex: n8n) com validação de organização
  - `POST /api/webhooks/n8n`: Recebe eventos validando organização
  - Suporta: `new_lead`, `lead_qualified`, `appointment_created`, `metric_event`

**Padrão de Segurança em Todas as APIs:**
```typescript
// Validação em todas as rotas
const { organizationId } = session.user;
await validateUserOrganization(session.user.id, organizationId);

// Filtragem de dados
const data = await prisma.lead.findMany({
  where: {
    userId: session.user.id,
    organizationId  // Isolamento obrigatório
  }
});
```

## Componentes de Interface

### Componentes de Dashboard
- **Sidebar**: Navegação lateral com links para todas as seções
- **Topbar**: Barra superior com informações do usuário e notificações
- **StatCard**: Cartões para exibição de métricas importantes
- **LeadTable**: Tabela interativa para visualização de leads

### Componentes de Gráficos
- **BarChart**: Gráficos de barras para visualização de métricas
- **MetricsChart**: Componentes especializados para diferentes tipos de dados

### Componentes de UI
- Componentes reutilizáveis como botões, cards e inputs com estilos consistentes

## Segurança e Privacidade

- Autenticação baseada em JWT (JSON Web Tokens)
- Proteção de rotas privadas com validação de organização
- **Row-Level Security (RLS)**: Políticas SQL no Supabase garantem isolamento de dados
  - Usuários só podem ver dados de suas organizações mesmo se tentarem contornar a aplicação
  - Admins podem gerenciar membros de sua organização
- Variáveis de ambiente para credenciais sensíveis
- Práticas recomendadas de segurança do Next.js
- **Validação de Organização em Cada Requisição**: Garante que um usuário não acesse dados de outra clínica
- **Hierarquia de Permissões**: Admin > Gerente > Operador com validação em operações críticas

## Dados de Teste Multi-Tenant

A plataforma é fornecida com dados de exemplo para teste:

**Organização:** Clínica Beleza & Estética

**Usuário Admin:**
- Email: `admin@clinica.com`
- Senha: `123456`
- Role: `admin`

**Usuário Operador:**
- Email: `exemplo@exemplo.com`
- Senha: `#Natalia2017`
- Role: `operador`

**Dados Inclusos:**
- 8 leads de exemplo
- 2 agendamentos agendados
- 7 eventos de métrica para demonstração

## Conclusão

MasterClínicas é uma plataforma completa e moderna para gestão de clínicas com arquitetura **multi-tenant enterprise-grade**. Oferece todas as funcionalidades necessárias para operações diárias de múltiplas clínicas, desde agendamentos até análise de métricas, com isolamento completo de dados.

### Destaques da Implementação Multi-Tenant:

✅ **Isolamento de Dados Completo**: Cada clínica tem seus próprios dados separados
✅ **Controle de Acesso Granular**: Sistema de roles (admin, gerente, operador) com permissões hierárquicas
✅ **Segurança em Camadas**: Middleware, aplicação e banco de dados (RLS)
✅ **Escalabilidade**: Arquitetura preparada para crescimento de múltiplos tenants
✅ **NextAuth.js com Session Multi-Tenant**: Suporte automático para `organizationId` e `userRole`
✅ **APIs Isoladas**: Todas as rotas validam organização antes de acessar dados
✅ **Row-Level Security**: Proteção no nível do banco de dados Supabase

Com sua arquitetura baseada em Next.js 16, Prisma e Supabase, proporciona escalabilidade, segurança e uma experiência de usuário excepcional para gerenciamento de múltiplas clínicas simultaneamente.