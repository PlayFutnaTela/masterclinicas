// Utilitários de métricas para agregação de dados - Multi-Tenant
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
    endDate: Date,
    organizationId: string // ===== MULTI-TENANT: Adicionar organizationId =====
): Promise<MetricsSummary> {
    const events = await prisma.metricEvent.groupBy({
        by: ["type"],
        where: {
            userId,
            organizationId, // ===== MULTI-TENANT: Adicionar organizationId ao WHERE =====
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
                summary.leadsReceived += event._count.type;
                break;
            case "qualified":
                summary.qualified += event._count.type;
                break;
            case "scheduled":
                summary.scheduled += event._count.type;
                break;
            case "no_show":
                summary.noShow += event._count.type;
                break;
            case "conversion":
                summary.conversions += event._count.type;
                break;
        }
    });

    return summary;
}

/**
 * Obtém métricas ao longo do tempo para um usuário
 */
export async function getMetricsOverTime(
    userId: string,
    startDate: Date,
    endDate: Date,
    eventType?: MetricEventType,
    organizationId?: string // ===== MULTI-TENANT: Adicionar organizationId =====
): Promise<MetricsOverTime[]> {
    const events = await prisma.metricEvent.findMany({
        where: {
            userId,
            organizationId, // ===== MULTI-TENANT: Adicionar organizationId ao WHERE =====
            createdAt: {
                gte: startDate,
                lte: endDate,
            },
            ...(eventType && { type: eventType }),
        },
        orderBy: { createdAt: "asc" },
    });

    // Agrupar por data e tipo
    const grouped = new Map<string, { count: number; type: MetricEventType }>();

    events.forEach((event) => {
        const date = event.createdAt.toLocaleDateString("pt-BR");
        const key = `${date}-${event.type}`;

        if (grouped.has(key)) {
            const existing = grouped.get(key)!;
            existing.count += 1;
        } else {
            grouped.set(key, { count: 1, type: event.type });
        }
    });

    return Array.from(grouped.entries()).map(([_, value]) => ({
        date: value.type,
        count: value.count,
        type: value.type,
    }));
}

/**
 * Obtém contagem de leads por status
 */
export async function getLeadsByStatus(
    userId: string,
    organizationId: string // ===== MULTI-TENANT: Adicionar organizationId =====
) {
    return await prisma.lead.groupBy({
        by: ["status"],
        where: {
            userId,
            organizationId, // ===== MULTI-TENANT: Adicionar organizationId ao WHERE =====
        },
        _count: {
            status: true,
        },
    });
}

/**
 * Obtém contagem de agendamentos por status
 */
export async function getAppointmentsByStatus(
    userId: string,
    organizationId: string // ===== MULTI-TENANT: Adicionar organizationId =====
) {
    return await prisma.appointment.groupBy({
        by: ["status"],
        where: {
            userId,
            organizationId, // ===== MULTI-TENANT: Adicionar organizationId ao WHERE =====
        },
        _count: {
            status: true,
        },
    });
}

/**
 * Cards do dashboard com dados agregados
 */
export async function getDashboardCards(
    userId: string,
    organizationId: string // ===== MULTI-TENANT: Adicionar organizationId =====
) {
    const where = {
        userId,
        organizationId, // ===== MULTI-TENANT: Adicionar organizationId ao WHERE =====
    };

    const [
        totalLeads,
        qualifiedLeads,
        scheduledAppointments,
        todayAppointments,
    ] = await Promise.all([
        prisma.lead.count({ where }),
        prisma.lead.count({
            where: { ...where, status: "qualificado" },
        }),
        prisma.appointment.count({
            where: {
                ...where,
                status: { in: ["agendado", "confirmado"] },
            },
        }),
        prisma.appointment.count({
            where: {
                ...where,
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
