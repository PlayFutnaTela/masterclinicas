// API Route para gerenciamento de agendamentos
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { AppointmentStatus } from "@prisma/client";

/**
 * GET /api/agendamentos
 * Lista agendamentos do usuário logado
 */
export async function GET(request: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "10");
        const status = searchParams.get("status") as AppointmentStatus | null;
        const startDate = searchParams.get("startDate");
        const endDate = searchParams.get("endDate");

        const skip = (page - 1) * limit;

        const where: {
            userId: string;
            status?: AppointmentStatus;
            scheduledAt?: { gte?: Date; lte?: Date };
        } = {
            userId: session.user.id,
        };

        if (status) {
            where.status = status;
        }

        if (startDate || endDate) {
            where.scheduledAt = {};
            if (startDate) where.scheduledAt.gte = new Date(startDate);
            if (endDate) where.scheduledAt.lte = new Date(endDate);
        }

        const [appointments, total] = await Promise.all([
            prisma.appointment.findMany({
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
            }),
            prisma.appointment.count({ where }),
        ]);

        return NextResponse.json({
            appointments,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error("[API AGENDAMENTOS] Erro:", error);
        return NextResponse.json(
            { error: "Erro interno do servidor" },
            { status: 500 }
        );
    }
}

/**
 * POST /api/agendamentos
 * Cria novo agendamento
 */
export async function POST(request: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
        }

        const body = await request.json();
        const { leadId, scheduledAt, notes } = body;

        if (!leadId || !scheduledAt) {
            return NextResponse.json(
                { error: "Lead e data/hora são obrigatórios" },
                { status: 400 }
            );
        }

        // Verificar se o lead pertence ao usuário
        const lead = await prisma.lead.findFirst({
            where: { id: leadId, userId: session.user.id },
        });

        if (!lead) {
            return NextResponse.json(
                { error: "Lead não encontrado" },
                { status: 404 }
            );
        }

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
                notes,
                userId: session.user.id,
            },
        });

        // Criar evento de métrica
        await prisma.metricEvent.create({
            data: {
                type: "scheduled",
                metadata: { leadId, appointmentId: appointment.id },
                userId: session.user.id,
            },
        });

        return NextResponse.json(
            { success: true, appointment },
            { status: 201 }
        );
    } catch (error) {
        console.error("[API AGENDAMENTOS] Erro:", error);
        return NextResponse.json(
            { error: "Erro interno do servidor" },
            { status: 500 }
        );
    }
}

/**
 * PATCH /api/agendamentos
 * Atualiza status de um agendamento
 */
export async function PATCH(request: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
        }

        const body = await request.json();
        const { id, status, notes } = body;

        if (!id) {
            return NextResponse.json(
                { error: "ID do agendamento é obrigatório" },
                { status: 400 }
            );
        }

        const updateData: { status?: AppointmentStatus; notes?: string; updatedAt: Date } = {
            updatedAt: new Date(),
        };

        if (status) updateData.status = status;
        if (notes !== undefined) updateData.notes = notes;

        const appointment = await prisma.appointment.update({
            where: { id, userId: session.user.id },
            data: updateData,
        });

        // Criar evento de métrica para no-show
        if (status === "no_show") {
            await prisma.metricEvent.create({
                data: {
                    type: "no_show",
                    metadata: { appointmentId: id },
                    userId: session.user.id,
                },
            });
        }

        return NextResponse.json({ success: true, appointment });
    } catch (error) {
        console.error("[API AGENDAMENTOS] Erro:", error);
        return NextResponse.json(
            { error: "Erro interno do servidor" },
            { status: 500 }
        );
    }
}
