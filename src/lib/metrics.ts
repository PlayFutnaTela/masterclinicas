// Utilitários de métricas para agregação de dados - Multi-Tenant
// Use PG for metrics aggregation to remove Prisma dependency gradually
import { query as pgQuery } from "./pg";

// Local MetricEventType to avoid importing from @prisma/client
type MetricEventType =
    | "lead_received"
    | "qualified"
    | "scheduled"
    | "no_show"
    | "follow_up"
    | "conversion";

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
    const sql = `
        SELECT type, COUNT(*)::int as cnt
        FROM metric_events
        WHERE user_id = $1 AND organization_id = $2 AND created_at >= $3 AND created_at <= $4
        GROUP BY type
    `;

    const res = await pgQuery(sql, [userId, organizationId, startDate.toISOString(), endDate.toISOString()]);

    const summary: MetricsSummary = {
        leadsReceived: 0,
        qualified: 0,
        scheduled: 0,
        noShow: 0,
        conversions: 0,
    };

    res.rows.forEach((row: any) => {
        switch (row.type) {
            case "lead_received":
                summary.leadsReceived = row.cnt;
                break;
            case "qualified":
                summary.qualified = row.cnt;
                break;
            case "scheduled":
                summary.scheduled = row.cnt;
                break;
            case "no_show":
                summary.noShow = row.cnt;
                break;
            case "conversion":
                summary.conversions = row.cnt;
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
    const sql = `
        SELECT date_trunc('day', created_at)::date as day, type, COUNT(*)::int as cnt
        FROM metric_events
        WHERE user_id = $1 AND organization_id = $2 AND created_at >= $3 AND created_at <= $4
        ${eventType ? "AND type = $5" : ""}
        GROUP BY day, type
        ORDER BY day ASC
    `;

    const params: any[] = [userId, organizationId, startDate.toISOString(), endDate.toISOString()];
    if (eventType) params.push(eventType);

    const res = await pgQuery(sql, params);

    return res.rows.map((row: any) => ({
        date: new Date(row.day).toLocaleDateString("pt-BR"),
        count: row.cnt,
        type: row.type,
    }));
}

/**
 * Obtém contagem de leads por status
 */
export async function getLeadsByStatus(
    userId: string,
    organizationId: string // ===== MULTI-TENANT: Adicionar organizationId =====
) {
    const sql = `SELECT status, COUNT(*)::int as count FROM leads WHERE user_id = $1 AND organization_id = $2 GROUP BY status`;
    const res = await pgQuery(sql, [userId, organizationId]);
    return res.rows;
}

/**
 * Obtém contagem de agendamentos por status
 */
export async function getAppointmentsByStatus(
    userId: string,
    organizationId: string // ===== MULTI-TENANT: Adicionar organizationId =====
) {
    const sql = `SELECT status, COUNT(*)::int as count FROM appointments WHERE user_id = $1 AND organization_id = $2 GROUP BY status`;
    const res = await pgQuery(sql, [userId, organizationId]);
    return res.rows;
}

/**
 * Cards do dashboard com dados agregados
 */
export async function getDashboardCards(
    userId: string,
    organizationId: string // ===== MULTI-TENANT: Adicionar organizationId =====
) {
    const startToday = new Date(new Date().setHours(0, 0, 0, 0)).toISOString();
    const endToday = new Date(new Date().setHours(23, 59, 59, 999)).toISOString();

    const [totalLeadsRes, qualifiedLeadsRes, scheduledAppointmentsRes, todayAppointmentsRes] = await Promise.all([
        pgQuery(`SELECT COUNT(*)::int as total FROM leads WHERE user_id = $1 AND organization_id = $2`, [userId, organizationId]),
        pgQuery(`SELECT COUNT(*)::int as total FROM leads WHERE user_id = $1 AND organization_id = $2 AND status = $3`, [userId, organizationId, "qualificado"]),
        pgQuery(`SELECT COUNT(*)::int as total FROM appointments WHERE user_id = $1 AND organization_id = $2 AND status = ANY($3::text[])`, [userId, organizationId, ["agendado", "confirmado"]]),
        pgQuery(`SELECT COUNT(*)::int as total FROM appointments WHERE user_id = $1 AND organization_id = $2 AND scheduled_at >= $3 AND scheduled_at < $4`, [userId, organizationId, startToday, endToday]),
    ]);

    return {
        totalLeads: totalLeadsRes.rows[0]?.total || 0,
        qualifiedLeads: qualifiedLeadsRes.rows[0]?.total || 0,
        scheduledAppointments: scheduledAppointmentsRes.rows[0]?.total || 0,
        todayAppointments: todayAppointmentsRes.rows[0]?.total || 0,
    };
}
