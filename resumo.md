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

### 1. Dashboard
- Interface central com visão geral das operações da clínica
- Cartões de estatísticas para métricas importantes
- Componentes de gráficos para visualização de dados

### 2. Agendamentos
- Sistema completo de gerenciamento de agendamentos
- Interface para visualização e edição de compromissos
- Integração com o banco de dados para persistência dos dados

### 3. Gestão de Leads
- Sistema para capturar, gerenciar e converter leads
- Tabela de leads com informações detalhadas
- Funcionalidades de filtragem e organização

### 4. Métricas e Análises
- Painel de métricas com dados estatísticos
- Gráficos interativos para análise de desempenho
- Visualização de tendências e KPIs da clínica

### 5. Configurações
- Painel de configurações administrativas
- Gerenciamento de parâmetros da clínica
- Personalização do sistema

### 6. Autenticação
- Sistema de login seguro
- Gerenciamento de sessão de usuário
- Proteção de rotas privadas

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

A aplicação inclui middleware para:
- Proteger rotas que exigem autenticação
- Redirecionar usuários não autenticados
- Verificar status de autenticação antes de acessar áreas restritas

## API Routes

A plataforma implementa várias rotas de API para:

- **Gestão de agendamentos**: CRUD de agendamentos
- **Autenticação**: Integração com NextAuth.js
- **Gestão de leads**: Operações com dados de leads
- **Métricas**: Recuperação de dados estatísticos
- **Webhooks**: Integração com serviços externos (ex: n8n)

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
- Proteção de rotas privadas
- Variáveis de ambiente para credenciais sensíveis
- Práticas recomendadas de segurança do Next.js

## Conclusão

MasterClínicas é uma plataforma completa e moderna para gestão de clínicas, oferecendo todas as funcionalidades necessárias para operações diárias, desde agendamentos até análise de métricas. Com sua arquitetura baseada em Next.js e integração com Supabase, proporciona escalabilidade, segurança e uma experiência de usuário excepcional.