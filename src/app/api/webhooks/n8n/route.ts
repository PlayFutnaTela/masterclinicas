// Webhook endpoint para receber dados do n8n
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
    apiKey: string;
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
        if (!body.type || !body.apiKey) {
            return NextResponse.json(
                { error: "Tipo de evento e apiKey são obrigatórios" },
                { status: 400 }
            );
        }

        // Validar API key e obter usuário
        const user = await prisma.user.findUnique({
            where: { apiKey: body.apiKey },
        });

        if (!user) {
            return NextResponse.json(
                { error: "API key inválida" },
                { status: 401 }
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
                    },
                });

                // Criar evento de métrica
                await prisma.metricEvent.create({
                    data: {
                        type: "lead_received",
                        metadata: { leadId: lead.id },
                        userId: user.id,
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

                await prisma.lead.update({
                    where: { id: leadId, userId: user.id },
                    data: { status: "qualificado" },
                });

                await prisma.metricEvent.create({
                    data: {
                        type: "qualified",
                        metadata: { leadId },
                        userId: user.id,
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

                // Atualizar status do lead
                await prisma.lead.update({
                    where: { id: leadId, userId: user.id },
                    data: { status: "agendado" },
                });

                // Criar agendamento
                const appointment = await prisma.appointment.create({
                    data: {
                        leadId,
                        scheduledAt: new Date(scheduledAt),
                        status: "agendado",
                        userId: user.id,
                    },
                });

                await prisma.metricEvent.create({
                    data: {
                        type: "scheduled",
                        metadata: { leadId, appointmentId: appointment.id },
                        userId: user.id,
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
                        metadata: metadata || {},
                        userId: user.id,
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
        return NextResponse.json(
            { error: "Erro interno do servidor" },
            { status: 500 }
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
