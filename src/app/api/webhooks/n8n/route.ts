// Webhook endpoint para receber dados do n8n - Simplified Roles
// Eventos: novo lead, lead qualificado, agendamento, métricas
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

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

        // Verificar se a organização existe
        const organization = await prisma.organization.findUnique({
            where: { id: body.organizationId },
        });

        if (!organization) {
            return NextResponse.json(
                { error: "Organização não encontrada" },
                { status: 404 }
            );
        }

        // Para webhooks, usar o primeiro usuário admin da organização
        // TODO: Melhorar isso no futuro com API keys específicas
        const user = await prisma.user.findFirst({
            where: {
                role: { in: ["admin", "super_admin"] }
            },
            orderBy: { createdAt: "asc" }
        });

        if (!user) {
            return NextResponse.json(
                { error: "Nenhum usuário administrador encontrado" },
                { status: 500 }
            );
        }

        // Processar evento por tipo
        switch (body.type) {
            case "new_lead": {
                const lead = await prisma.lead.create({
                    data: {
                        name: (body.data.name as string) || "Sem nome",
                        phone: (body.data.phone as string) || "",
                        procedure: (body.data.procedure as string) || "",
                        source: (body.data.source as string) || "n8n",
                        status: "novo",
                        userId: user.id,
                        organizationId: body.organizationId, // ===== MULTI-TENANT: Adicionar organizationId na criação =====
                    },
                });

                // Criar evento de métrica
                await prisma.metricEvent.create({
                    data: {
                        type: "lead_received",
                        metadata: { leadId: lead.id },
                        userId: user.id,
                        organizationId: body.organizationId, // ===== MULTI-TENANT: Adicionar organizationId na criação =====
                    },
                });

                return NextResponse.json({ success: true, leadId: lead.id });
            }

            case "lead_qualified": {
                const leadId = body.data.leadId as string;
                if (!leadId) {
                    return NextResponse.json(
                        { error: "leadId é obrigatório" },
                        { status: 400 }
                    );
                }

                // ===== MULTI-TENANT: Validar que o lead pertence à organização =====
                const lead = await prisma.lead.findFirst({
                    where: {
                        id: leadId,
                        userId: user.id,
                        organizationId: body.organizationId,
                    },
                });

                if (!lead) {
                    return NextResponse.json(
                        { error: "Lead não encontrado ou não pertence a esta organização" },
                        { status: 404 }
                    );
                }
                // ===== FIM VALIDAÇÃO MULTI-TENANT =====

                await prisma.lead.update({
                    where: { id: leadId },
                    data: { status: "qualificado" },
                });

                await prisma.metricEvent.create({
                    data: {
                        type: "qualified",
                        metadata: { leadId },
                        userId: user.id,
                        organizationId: body.organizationId, // ===== MULTI-TENANT: Adicionar organizationId na criação =====
                    },
                });

                return NextResponse.json({ success: true });
            }

            case "appointment_created": {
                const { leadId, scheduledAt } = body.data as {
                    leadId: string;
                    scheduledAt: string;
                };

                if (!leadId || !scheduledAt) {
                    return NextResponse.json(
                        { error: "leadId e scheduledAt são obrigatórios" },
                        { status: 400 }
                    );
                }

                // ===== MULTI-TENANT: Validar que o lead pertence à organização =====
                const lead = await prisma.lead.findFirst({
                    where: {
                        id: leadId,
                        userId: user.id,
                        organizationId: body.organizationId,
                    },
                });

                if (!lead) {
                    return NextResponse.json(
                        { error: "Lead não encontrado ou não pertence a esta organização" },
                        { status: 404 }
                    );
                }
                // ===== FIM VALIDAÇÃO MULTI-TENANT =====

                // Atualizar status do lead
                await prisma.lead.update({
                    where: { id: leadId },
                    data: { status: "agendado" },
                });

                // Criar agendamento
                const appointment = await prisma.appointment.create({
                    data: {
                        leadId,
                        scheduledAt: new Date(scheduledAt),
                        status: "agendado",
                        userId: user.id,
                        organizationId: body.organizationId, // ===== MULTI-TENANT: Adicionar organizationId na criação =====
                    },
                });

                await prisma.metricEvent.create({
                    data: {
                        type: "scheduled",
                        metadata: { leadId, appointmentId: appointment.id },
                        userId: user.id,
                        organizationId: body.organizationId, // ===== MULTI-TENANT: Adicionar organizationId na criação =====
                    },
                });

                return NextResponse.json({
                    success: true,
                    appointmentId: appointment.id,
                });
            }

            case "metric_event": {
                const { eventType, metadata } = body.data as {
                    eventType: string;
                    metadata?: Record<string, unknown>;
                };

                if (!eventType) {
                    return NextResponse.json(
                        { error: "eventType é obrigatório" },
                        { status: 400 }
                    );
                }

                await prisma.metricEvent.create({
                    data: {
                        type: eventType as "lead_received" | "qualified" | "scheduled" | "no_show" | "follow_up" | "conversion",
                        metadata: (metadata || {}) as any,
                        userId: user.id,
                        organizationId: body.organizationId,
                    },
                });

                return NextResponse.json({ success: true });
            }

            default:
                return NextResponse.json(
                    { error: `Tipo de evento desconhecido: ${body.type}` },
                    { status: 400 }
                );
        }
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
