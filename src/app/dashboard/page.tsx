// Página Visão Geral do Dashboard
import { auth } from "@/lib/auth";
import { getDashboardCards, getLeadsByStatus } from "@/lib/metrics";
import { prisma } from "@/lib/db";
import { StatCard } from "@/components/dashboard/stat-card";
import { MetricsChart } from "@/components/charts/metrics-chart";
import { Users, UserCheck, Calendar, CalendarCheck } from "lucide-react";

async function getDashboardData(userId: string) {
    const [cards, leadsByStatus, recentLeads] = await Promise.all([
        getDashboardCards(userId),
        getLeadsByStatus(userId),
        prisma.lead.findMany({
            where: { userId },
            orderBy: { createdAt: "desc" },
            take: 5,
        }),
    ]);

    // Obter dados reais do banco para o gráfico (últimos 7 dias)
    const chartData = [];
    const metricEvents = await prisma.metricEvent.findMany({
        where: {
            userId,
            createdAt: {
                gte: new Date(new Date().setDate(new Date().getDate() - 6)),
            },
        },
        orderBy: { createdAt: "asc" },
    });

    // Agrupar métricas por dia
    const metricsPerDay: { [key: string]: { leads: number; qualificados: number; agendamentos: number } } = {};
    for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toLocaleDateString("pt-BR", { weekday: "short", day: "numeric" });
        metricsPerDay[dateStr] = { leads: 0, qualificados: 0, agendamentos: 0 };
    }

    // Contar eventos de métrica por dia
    metricEvents.forEach((event) => {
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
    const session = await auth();

    if (!session?.user?.id) {
        return null;
    }

    const { cards, chartData } = await getDashboardData(session.user.id);

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
                    icon={Users}
                    color="rose"
                    trend={{ value: 12, isPositive: true }}
                />
                <StatCard
                    title="Qualificados"
                    value={cards.qualifiedLeads}
                    description="Leads qualificados"
                    icon={UserCheck}
                    color="purple"
                    trend={{ value: 8, isPositive: true }}
                />
                <StatCard
                    title="Agendamentos"
                    value={cards.scheduledAppointments}
                    description="Consultas agendadas"
                    icon={Calendar}
                    color="blue"
                />
                <StatCard
                    title="Hoje"
                    value={cards.todayAppointments}
                    description="Consultas do dia"
                    icon={CalendarCheck}
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
