# Análise de Lentidão no Sistema MasterClínicas

## Introdução

Após uma análise minuciosa e detalhada do código-fonte da aplicação MasterClínicas, foram identificados diversos problemas de performance que explicam a lentidão excessiva relatada, especialmente nas páginas de login e `/agendamentos`. Este documento detalha as causas raiz dos problemas e propõe soluções para otimizar o desempenho do sistema.

## Causas Raiz da Lentidão

### 1. Múltiplas Chamadas ao Banco de Dados

**Problema encontrado:** Durante o processo de renderização de páginas críticas como o dashboard e `/agendamentos`, ocorrem múltiplas chamadas ao banco de dados em sequência, sem otimização de consultas.

**Detalhes:**
- No layout do dashboard (`src/app/(dashboard)/layout.tsx`), há uma chamada para obter o usuário, seguida por outra para obter o papel (role) do usuário na tabela `users`, e finalmente uma terceira para obter o nome da organização.
- Cada uma dessas operações é uma consulta separada ao banco de dados.
- Na página `/agendamentos` (`src/app/agendamentos/page.tsx`), o componente `useEffect` faz uma chamada para buscar os agendamentos via API (`/api/agendamentos`), o que por sua vez executa consultas múltiplas no banco de dados.

### 2. Consultas Ineficientes na API de Agendamentos

**Problema encontrado:** A rota `/api/agendamentos` (`src/app/api/agendamentos/route.ts`) executa consultas complexas sem otimização adequada.

**Detalhes:**
- A consulta para buscar agendamentos inclui uma operação de `include` para carregar os dados do lead associado, o que pode resultar em consultas N+1 se não forem otimizadas.
- O código executa duas consultas separadas para obter os agendamentos e a contagem total (usada para paginação), quando poderiam ser otimizadas.
- As validações de papel do usuário ocorrem em todas as requisições, exigindo buscas adicionais na tabela `users`.

### 3. Operações de Banco de Dados em Componentes Client-Side

**Problema encontrado:** Vários componentes client-side fazem chamadas diretas ao Supabase para obter informações do usuário.

**Detalhes:**
- O componente `Sidebar` (`src/components/dashboard/sidebar.tsx`) faz uma chamada para obter o papel do usuário usando `supabase.from('users').select('role')` diretamente no cliente.
- O componente `Topbar` (`src/components/dashboard/topbar.tsx`) também faz chamadas para obter informações do usuário no cliente.
- O componente `OrganizationSelector` (`src/components/dashboard/organization-selector.tsx`) faz uma chamada para a API `/api/organizations` que, por sua vez, faz operações no banco de dados.

### 4. Renderização Ineficiente de Componentes Complexos

**Problema encontrado:** O componente `EventManager` (`src/components/calendar/event-manager.tsx`) é extremamente complexo e pesado.

**Detalhes:**
- Este componente tem mais de 1300 linhas de código e implementa múltiplas visualizações (mês, semana, dia, lista).
- A renderização de cada evento envolve cálculos complexos de posicionamento e agrupamento.
- O componente mantém estado local para filtros avançados, busca e interações de arrastar e soltar, o que pode causar re-renderizações frequentes e caras.
- O componente carrega todos os eventos no estado cliente para aplicar filtros localmente, em vez de filtrar no servidor.

### 5. Problemas de Caching e Otimização

**Problema encontrado:** A aplicação não implementa estratégias adequadas de caching.

**Detalhes:**
- As informações de organização e papel do usuário são buscadas repetidamente em múltiplas páginas e componentes.
- Não há implementação de caching para dados que mudam com pouca frequência, como informações de organização.
- A API não implementa caching HTTP adequado para endpoints que retornam dados que não mudam com frequência.

### 6. Problemas de Autenticação e Autorização

**Problema encontrado:** A autenticação e autorização são verificadas em múltiplos níveis sem otimização.

**Detalhes:**
- Cada requisição à API envolve múltiplas verificações: primeiro a validação do token de usuário, depois a busca do papel do usuário no banco de dados.
- A função `requireRole` e funções auxiliares são chamadas em cada requisição, adicionando latência.

## Soluções Propostas

### 1. Otimização de Consultas ao Banco de Dados

**Recomendações:**
- **Junção de consultas:** Combine as múltiplas consultas separadas no layout do dashboard em uma única consulta com `include` ou `join`.
- **Uso de select específico:** Em vez de selecionar todos os campos com `select('*')`, especifique apenas os campos necessários.
- **Consulta única para agendamentos:** Otimize a consulta na rota `/api/agendamentos` para minimizar o número de operações de banco de dados.

### 2. Implementação de Caching

**Recomendações:**
- **Caching de informações do usuário:** Armazene em cache informações estáticas do usuário (papel, organização) no cliente após o login.
- **Caching HTTP:** Implemente cabeçalhos de caching adequados para endpoints de dados estáticos.
- **Next.js Data Cache:** Utilize o sistema de caching do Next.js 16 para dados que não mudam com frequência.

### 3. Otimização do Componente de Calendário

**Recomendações:**
- **Paginação no servidor:** Implemente paginação real no servidor para carregar apenas os eventos visíveis.
- **Virtualização:** Use técnicas de virtualização para renderizar apenas os componentes visíveis na tela.
- **Memoização:** Implemente `React.memo`, `useMemo` e `useCallback` adequadamente para evitar re-renderizações desnecessárias.
- **Separação de responsabilidades:** Divida o componente em componentes menores e mais especializados.

### 4. Melhoria na Arquitetura de Dados

**Recomendações:**
- **Índices adequados:** Verifique se os índices do banco de dados estão otimizados para as consultas mais frequentes.
- **Consulta avançada:** Considere o uso de consultas mais avançadas com `groupBy` e agregações diretamente no banco de dados em vez de processamento no cliente.

### 5. Otimização de Chamadas Client-Side

**Recomendações:**
- **Server Components:** Utilize mais Server Components para operações que requerem acesso direto ao banco de dados, reduzindo a carga no cliente.
- **Carregamento antecipado:** Carregue informações necessárias no servidor e passe para os componentes cliente via props.

### 6. Implementação de SSR/SSG Estratégico

**Recomendações:**
- **SSR para páginas críticas:** Use SSR para páginas como dashboard e agendamentos para melhorar o tempo de resposta percebido pelo usuário.
- **Pré-carregamento:** Considere o uso de SSG para páginas com conteúdo que não muda com frequência.

## Implementação Recomendada

### Exemplo de otimização para o layout do dashboard:

```typescript
// Layout otimizado para reduzir chamadas múltiplas ao banco
export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    // Consulta única para obter papel do usuário e informações da organização
    const { data: userData } = await supabase
        .from('users')
        .select('role, organizationId')
        .eq('id', user.id)
        .single();

    if (!userData) {
        redirect("/login");
    }

    let clinicName = "MasterClínicas";

    if (userData?.role !== "super_admin" && userData?.organizationId) {
        const { data: orgData } = await supabase
            .from('organizations')
            .select('name')
            .eq('id', userData.organizationId)
            .single();
        clinicName = orgData?.name || "Minha Clínica";
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Sidebar clinicName={clinicName} userRole={userData.role} />
            <div className="ml-52">
                <Topbar />
                <main className="p-6">{children}</main>
            </div>
        </div>
    );
}
```

### Exemplo de otimização para a API de agendamentos:

```typescript
// Na rota /api/agendamentos, otimizar para buscar informações em uma única consulta
const appointments = await prisma.appointment.findMany({
    where,
    skip,
    take: limit,
    orderBy: { scheduledAt: "asc" },
    include: {
        lead: {
            select: {
                id: true,
                name: true,
                phone: true,
                procedure: true,
            },
        },
    },
});

// Ao invés de fazer duas consultas separadas, usar uma consulta com count
const [appointments, total] = await Promise.all([
    prisma.appointment.findMany({ where, skip, take: limit, orderBy: { scheduledAt: "asc" }, include: { lead: {...} } }),
    prisma.appointment.count({ where })
]);
```

## Conclusão

A lentidão excessiva no sistema MasterClínicas é resultado de uma combinação de fatores, principalmente relacionados à ineficiência nas operações de banco de dados, componentes complexos sem otimização adequada e arquitetura que não utiliza eficientemente os recursos do Next.js. Implementando as soluções propostas, especialmente a otimização de consultas, implementação de caching e melhoria na arquitetura de dados, espera-se uma melhoria significativa no desempenho do sistema, especialmente nas páginas críticas de login e agendamentos.