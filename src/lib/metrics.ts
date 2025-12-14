// Utilitários de métricas para agregação de dados
import { prisma } from "./db";
import { MetricEventType } from "@prisma/client";

interface MetricsSummary {
    leadsReceived: number;
    qualified: number;
    scheduled: number;
    noShow: number;
    conversions: number;
}

interface MetricsOverTime {
    date: string;
    count: number;
    type: MetricEventType;
}

/**
 * Obtém resumo de métricas para um usuário em um período
 */
export async function getMetricsSummary(
    userId: string,
    startDate: Date,
    endDate: Date
): Promise<MetricsSummary> {
    const events = await prisma.metricEvent.groupBy({
        by: ["type"],
        where: {
            userId,
            createdAt: {
                gte: startDate,
                lte: endDate,
            },
        },
        _count: {
            type: true,
        },
    });

    const summary: MetricsSummary = {
        leadsReceived: 0,
        qualified: 0,
        scheduled: 0,
        noShow: 0,
        conversions: 0,
    };

    events.forEach((event) => {
        switch (event.type) {
            case "lead_received":
                summary.leadsReceived = event._count.type;
                break;
            case "qualified":
                summary.qualified = event._count.type;
                break;
            case "scheduled":
                summary.scheduled = event._count.type;
                break;
            case "no_show":
                summary.noShow = event._count.type;
                break;
            case "conversion":
                summary.conversions = event._count.type;
                break;
        }
    });

    return summary;
}

/**
 * Obtém dados de métricas ao longo do tempo para gráficos
 */
export async function getMetricsOverTime(
    userId: string,
    startDate: Date,
    endDate: Date,
    eventType?: MetricEventType
): Promise<MetricsOverTime[]> {
    const whereClause: {
        userId: string;
        createdAt: { gte: Date; lte: Date };
        type?: MetricEventType;
    } = {
        userId,
        createdAt: {
            gte: startDate,
            lte: endDate,
        },
    };

    if (eventType) {
        whereClause.type = eventType;
    }

    const events = await prisma.metricEvent.findMany({
        where: whereClause,
        orderBy: { createdAt: "asc" },
    });

    // Agrupar por data
    const grouped = events.reduce((acc, event) => {
        const dateKey = event.createdAt.toISOString().split("T")[0];
        const key = `${dateKey}-${event.type}`;

        if (!acc[key]) {
            acc[key] = {
                date: dateKey,
                count: 0,
                type: event.type,
            };
        }
        acc[key].count++;
        return acc;
    }, {} as Record<string, MetricsOverTime>);

    return Object.values(grouped);
}

/**
 * Conta leads por status para um usuário
 */
export async function getLeadsByStatus(userId: string) {
    return prisma.lead.groupBy({
        by: ["status"],
        where: { userId },
        _count: { status: true },
    });
}

/**
 * Conta agendamentos por status para um usuário
 */
export async function getAppointmentsByStatus(userId: string) {
    return prisma.appointment.groupBy({
        by: ["status"],
        where: { userId },
        _count: { status: true },
    });
}

/**
 * Obtém dados para os cards do dashboard
 */
export async function getDashboardCards(userId: string) {
    const [totalLeads, qualifiedLeads, scheduledAppointments, todayAppointments] =
        await Promise.all([
            prisma.lead.count({ where: { userId } }),
            prisma.lead.count({ where: { userId, status: "qualificado" } }),
            prisma.appointment.count({
                where: { userId, status: { in: ["agendado", "confirmado"] } },
            }),
            prisma.appointment.count({
                where: {
                    userId,
                    scheduledAt: {
                        gte: new Date(new Date().setHours(0, 0, 0, 0)),
                        lt: new Date(new Date().setHours(23, 59, 59, 999)),
                    },
                },
            }),
        ]);

    return {
        totalLeads,
        qualifiedLeads,
        scheduledAppointments,
        todayAppointments,
    };
}
