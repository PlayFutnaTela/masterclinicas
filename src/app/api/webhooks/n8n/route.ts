// Webhook endpoint para receber dados do n8n - Simplified Roles
// Eventos: novo lead, lead qualificado, agendamento, métricas
import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/pg";

// Tipos de eventos aceitos
type WebhookEventType =
    | "new_lead"
    | "lead_qualified"
    | "appointment_created"
    | "metric_event";

interface WebhookPayload {
    type: WebhookEventType;
    organizationId: string;
    data: Record<string, unknown>;
}

/**
 * POST /api/webhooks/n8n
 * Recebe eventos do n8n e persiste no banco
 */
export async function POST(request: NextRequest) {
    try {
        const body: WebhookPayload = await request.json();

        // Validar payload
        if (!body.type) {
            return NextResponse.json(
                { error: "Tipo de evento é obrigatório" },
                { status: 400 }
            );
        }

        // Validar organizationId no payload
        if (!body.organizationId) {
            return NextResponse.json(
                { error: "organizationId é obrigatório" },
                { status: 400 }
            );
        }

        // Usar PG primariamente
        try {
            // Verificar org
            const orgRes = await query("SELECT id FROM organizations WHERE id = $1", [body.organizationId]);
            if (!orgRes.rows || orgRes.rows.length === 0) {
                return NextResponse.json({ error: "Organização não encontrada" }, { status: 404 });
            }

            // Escolher um usuário admin para atribuições (melhorar no futuro)
            const userRes = await query("SELECT id FROM users WHERE role = ANY($1::text[]) ORDER BY created_at ASC LIMIT 1", [["admin", "super_admin"]]);
            const user = userRes.rows[0];
            if (!user) return NextResponse.json({ error: "Nenhum usuário administrador encontrado" }, { status: 500 });

            switch (body.type) {
                case "new_lead": {
                    try {
                        await query("BEGIN");
                        const insertLeadSql = `INSERT INTO leads (name, phone, procedure, source, status, user_id, organization_id) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING id`;
                        const leadRes = await query(insertLeadSql, [
                            (body.data.name as string) || "Sem nome",
                            (body.data.phone as string) || "",
                            (body.data.procedure as string) || "",
                            (body.data.source as string) || "n8n",
                            "novo",
                            user.id,
                            body.organizationId,
                        ]);
                        const leadId = leadRes.rows[0].id;

                        await query(`INSERT INTO metric_events (type, metadata, user_id, organization_id) VALUES ($1, $2::jsonb, $3, $4)`, [
                            "lead_received",
                            JSON.stringify({ leadId }),
                            user.id,
                            body.organizationId,
                        ]);

                        await query("COMMIT");

                        return NextResponse.json({ success: true, leadId });
                    } catch (pgErr) {
                        await query("ROLLBACK").catch(() => {});
                        console.error("[WEBHOOK N8N] PG create lead failed:", pgErr);
                        return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
                    }
                }

                case "lead_qualified": {
                    const leadId = body.data.leadId as string;
                    if (!leadId) return NextResponse.json({ error: "leadId é obrigatório" }, { status: 400 });

                    const leadRes = await query("SELECT id FROM leads WHERE id = $1 AND organization_id = $2 LIMIT 1", [leadId, body.organizationId]);
                    if (!leadRes.rows || leadRes.rows.length === 0) return NextResponse.json({ error: "Lead não encontrado ou não pertence a esta organização" }, { status: 404 });

                    await query("UPDATE leads SET status = $1 WHERE id = $2", ["qualificado", leadId]);
                    await query(`INSERT INTO metric_events (type, metadata, user_id, organization_id) VALUES ($1, $2::jsonb, $3, $4)`, [
                        "qualified",
                        JSON.stringify({ leadId }),
                        user.id,
                        body.organizationId,
                    ]);

                    return NextResponse.json({ success: true });
                }

                case "appointment_created": {
                    const { leadId, scheduledAt } = body.data as { leadId: string; scheduledAt: string };
                    if (!leadId || !scheduledAt) return NextResponse.json({ error: "leadId e scheduledAt são obrigatórios" }, { status: 400 });

                    const leadRes = await query("SELECT id FROM leads WHERE id = $1 AND organization_id = $2 LIMIT 1", [leadId, body.organizationId]);
                    if (!leadRes.rows || leadRes.rows.length === 0) return NextResponse.json({ error: "Lead não encontrado ou não pertence a esta organização" }, { status: 404 });

                    try {
                        await query("BEGIN");
                        await query("UPDATE leads SET status = $1 WHERE id = $2", ["agendado", leadId]);
                        const apptRes = await query("INSERT INTO appointments (lead_id, scheduled_at, status, user_id, organization_id) VALUES ($1,$2,$3,$4,$5) RETURNING id", [leadId, new Date(scheduledAt), "agendado", user.id, body.organizationId]);
                        const appointmentId = apptRes.rows[0].id;

                        await query(`INSERT INTO metric_events (type, metadata, user_id, organization_id) VALUES ($1, $2::jsonb, $3, $4)`, [
                            "scheduled",
                            JSON.stringify({ leadId, appointmentId }),
                            user.id,
                            body.organizationId,
                        ]);

                        await query("COMMIT");

                        return NextResponse.json({ success: true, appointmentId });
                    } catch (pgErr) {
                        await query("ROLLBACK").catch(() => {});
                        console.error("[WEBHOOK N8N] PG create appointment failed:", pgErr);
                        return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
                    }
                }

                case "metric_event": {
                    const { eventType, metadata } = body.data as { eventType: string; metadata?: Record<string, unknown> };
                    if (!eventType) return NextResponse.json({ error: "eventType é obrigatório" }, { status: 400 });

                    await query(`INSERT INTO metric_events (type, metadata, user_id, organization_id) VALUES ($1, $2::jsonb, $3, $4)`, [
                        eventType,
                        JSON.stringify(metadata || {}),
                        user.id,
                        body.organizationId,
                    ]);

                    return NextResponse.json({ success: true });
                }

                default:
                    return NextResponse.json({ error: `Tipo de evento desconhecido: ${body.type}` }, { status: 400 });
            }
        } catch (err) {
            console.error('[WEBHOOK N8N] PG processing error:', err);
            return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
        }

        // Prisma fallback removido — agora usamos apenas `pg` (transações/insert) e retornamos erro 500 em falhas.
    } catch (error) {
        console.error("[WEBHOOK N8N] Erro:", error);

        // ===== MULTI-TENANT: Mensagem de erro em português =====
        const errorMessage = error instanceof Error
            ? error.message
            : "Erro interno do servidor";

        return NextResponse.json(
            { error: errorMessage },
            { status: error instanceof Error && error.message.includes("Acesso negado") ? 403 : 500 }
        );
    }
}

/**
 * GET /api/webhooks/n8n
 * Health check do endpoint
 */
export async function GET() {
    return NextResponse.json({
        status: "ok",
        message: "Webhook n8n ativo",
        acceptedEvents: ["new_lead", "lead_qualified", "appointment_created", "metric_event"],
    });
}
