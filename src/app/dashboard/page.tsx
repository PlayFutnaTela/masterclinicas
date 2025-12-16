// Página Visão Geral do Dashboard
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { getDashboardCards, getLeadsByStatus } from "@/lib/metrics";
import { query } from "@/lib/pg";
import { StatCard } from "@/components/dashboard/stat-card";
import { MetricsChart } from "@/components/charts/metrics-chart";

async function getDashboardData(userId: string, organizationId: string) {
    const [cards, leadsByStatus, recentLeads] = await Promise.all([
        getDashboardCards(userId, organizationId),
        getLeadsByStatus(userId, organizationId),
        query(`SELECT id, name, phone, procedure, status, created_at as "createdAt" FROM leads WHERE user_id = $1 AND organization_id = $2 ORDER BY created_at DESC LIMIT 5`, [userId, organizationId]).then(r => r.rows || []),
    ]);

    // Obter dados reais do banco para o gráfico (últimos 7 dias)
    const chartData = [];
    const metricEventsRes = await query(`SELECT type, metadata, created_at FROM metric_events WHERE user_id = $1 AND created_at >= $2 ORDER BY created_at ASC`, [userId, new Date(new Date().setDate(new Date().getDate() - 6))]);
    const metricEvents = metricEventsRes.rows || [];

    // Agrupar métricas por dia
    const metricsPerDay: { [key: string]: { leads: number; qualificados: number; agendamentos: number } } = {};
    for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toLocaleDateString("pt-BR", { weekday: "short", day: "numeric" });
        metricsPerDay[dateStr] = { leads: 0, qualificados: 0, agendamentos: 0 };
    }

    // Contar eventos de métrica por dia
    metricEvents.forEach((event: any) => {
        const dateStr = event.createdAt.toLocaleDateString("pt-BR", { weekday: "short", day: "numeric" });
        if (metricsPerDay[dateStr]) {
            if (event.type === "lead_received") metricsPerDay[dateStr].leads++;
            if (event.type === "qualified") metricsPerDay[dateStr].qualificados++;
            if (event.type === "scheduled" || event.type === "conversion") metricsPerDay[dateStr].agendamentos++;
        }
    });

    // Converter para array
    for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toLocaleDateString("pt-BR", { weekday: "short", day: "numeric" });
        chartData.push({
            date: dateStr,
            ...metricsPerDay[dateStr],
        });
    }

    return { cards, leadsByStatus, recentLeads, chartData };
}

export default async function DashboardPage() {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user?.id) {
        return null;
    }

    // Buscar role do usuário
    const { data: userData } = await supabase
        .from('users')
        .select('role, organizationId')
        .eq('id', user.id)
        .single();

    if (!userData) {
        return null;
    }

    // Determinar organização e carregar dados do dashboard de forma resiliente
    let organizationId: string = "";
    let cards = { totalLeads: 0, qualifiedLeads: 0, scheduledAppointments: 0, todayAppointments: 0 };
    let chartData: any[] = [];

    try {
        if (userData.role === "super_admin") {
            // Super admin vê dados de todas as organizações (usar primeira como padrão)
            const orgRes = await query("SELECT id FROM organizations ORDER BY created_at ASC LIMIT 1");
            organizationId = orgRes.rows[0]?.id || "";
        } else {
            // Admin/operador usa organização associada
            organizationId = userData.organizationId || "";
        }

        const dashboard = await getDashboardData(user.id, organizationId);
        cards = dashboard.cards;
        chartData = dashboard.chartData;
    } catch (err) {
        // Falha ao conectar/consultar o banco: logar e mostrar dashboard em modo degradado
        console.error("[DASHBOARD] Erro ao carregar dados do dashboard:", err);
        // cards/chartData permanecem em zeros/arrays vazias
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Visão Geral</h1>
                <p className="text-gray-500 mt-1">
                    Acompanhe o desempenho da sua clínica
                </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total de Leads"
                    value={cards.totalLeads}
                    description="Leads recebidos"
                    iconSrc="/assets/People/SVG/ic_fluent_people_48_color.svg"
                    color="rose"
                    trend={{ value: 12, isPositive: true }}
                />
                <StatCard
                    title="Qualificados"
                    value={cards.qualifiedLeads}
                    description="Leads qualificados"
                    iconSrc="/assets/Person/SVG/ic_fluent_person_48_color.svg"
                    color="purple"
                    trend={{ value: 8, isPositive: true }}
                />
                <StatCard
                    title="Agendamentos"
                    value={cards.scheduledAppointments}
                    description="Consultas agendadas"
                    iconSrc="/assets/Calendar/SVG/ic_fluent_calendar_48_color.svg"
                    color="blue"
                />
                <StatCard
                    title="Hoje"
                    value={cards.todayAppointments}
                    description="Consultas do dia"
                    iconSrc="/assets/Calendar/SVG/ic_fluent_calendar_48_color.svg"
                    color="green"
                />
            </div>

            {/* Chart */}
            <MetricsChart
                data={chartData}
                title="Evolução (Últimos 7 dias)"
            />

            {/* Quick Info */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Dicas Rápidas</h2>
                <div className="grid md:grid-cols-3 gap-4">
                    <div className="p-4 bg-rose-50 rounded-lg">
                        <p className="text-sm font-medium text-rose-900">Webhook Configurado</p>
                        <p className="text-xs text-rose-700 mt-1">
                            Configure o webhook nas configurações para receber leads do n8n
                        </p>
                    </div>
                    <div className="p-4 bg-blue-50 rounded-lg">
                        <p className="text-sm font-medium text-blue-900">WhatsApp</p>
                        <p className="text-xs text-blue-700 mt-1">
                            Adicione seu link do WhatsApp para o botão na página pública
                        </p>
                    </div>
                    <div className="p-4 bg-green-50 rounded-lg">
                        <p className="text-sm font-medium text-green-900">Integração n8n</p>
                        <p className="text-xs text-green-700 mt-1">
                            Os leads são sincronizados automaticamente via webhook
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
