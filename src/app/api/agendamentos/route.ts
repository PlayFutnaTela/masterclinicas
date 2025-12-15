// API Route para gerenciamento de agendamentos - Supabase Auth
import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { prisma } from "@/lib/db";
import { requireRole } from "@/lib/role-middleware";
import { AppointmentStatus } from "@prisma/client";

/**
 * GET /api/agendamentos
 * Lista agendamentos do usuário logado
 */
export async function GET(request: NextRequest) {
    try {
        const supabase = await createServerSupabaseClient();
        const { data: { user }, error } = await supabase.auth.getUser();

        if (error || !user) {
            return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
        }

        // Buscar role do usuário no banco
        const userRecord = await prisma.user.findUnique({
            where: { id: user.id },
            select: { role: true },
        });

        if (!userRecord) {
            return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
        }

        const userRole = userRecord.role;

        // ===== ROLE VALIDATION: Apenas admin e operador podem ver agendamentos =====
        requireRole(userRole, "operador");

        // Para usuários não super-admin, usar organização padrão
        let organizationId: string | null = null;
        if (userRole === "super_admin") {
            // Super admin pode ver agendamentos de todas as organizações
            // Se não especificar organização, mostrar todas
            const url = new URL(request.url);
            organizationId = url.searchParams.get("organizationId");
        } else {
            // Admin/operador vê apenas da organização padrão
            const defaultOrg = await prisma.organization.findFirst({
                orderBy: { createdAt: "asc" },
                select: { id: true }
            });
            organizationId = defaultOrg?.id || null;
        }

        if (!organizationId) {
            return NextResponse.json(
                { error: "Organização não encontrada" },
                { status: 400 }
            );
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
            organizationId: string;
            status?: AppointmentStatus;
            scheduledAt?: { gte?: Date; lte?: Date };
        } = {
            userId: user.id,
            organizationId, // ===== MULTI-TENANT: Adicionar organizationId ao WHERE =====
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
        const supabase = await createServerSupabaseClient();
        const { data: { user }, error } = await supabase.auth.getUser();

        if (error || !user) {
            return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
        }

        // Buscar role do usuário no banco
        const userRecord = await prisma.user.findUnique({
            where: { id: user.id },
            select: { role: true },
        });

        if (!userRecord) {
            return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
        }

        const userRole = userRecord.role;

        // ===== ROLE VALIDATION: Apenas admin e operador podem criar agendamentos =====
        requireRole(userRole, "operador");

        // Determinar organização
        let organizationId: string;
        if (userRole === "super_admin") {
            // Super admin precisa especificar a organização
            const body = await request.json();
            organizationId = body.organizationId;
            if (!organizationId) {
                return NextResponse.json(
                    { error: "Super admin deve especificar organizationId" },
                    { status: 400 }
                );
            }
        } else {
            // Admin/operador usa organização padrão
            const defaultOrg = await prisma.organization.findFirst({
                orderBy: { createdAt: "asc" },
                select: { id: true }
            });
            if (!defaultOrg) {
                return NextResponse.json(
                    { error: "Nenhuma organização encontrada" },
                    { status: 400 }
                );
            }
            organizationId = defaultOrg.id;
        }

        const body = await request.json();
        const { leadId, scheduledAt, notes } = body;

        if (!leadId || !scheduledAt) {
            return NextResponse.json(
                { error: "Lead e data/hora são obrigatórios" },
                { status: 400 }
            );
        }

        // Verificar se o lead pertence ao usuário E à organização
        const lead = await prisma.lead.findFirst({
            where: {
                id: leadId,
                userId: user.id,
                organizationId,
            },
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
                userId: user.id,
                organizationId, // ===== MULTI-TENANT: Adicionar organizationId na criação =====
            },
        });

        // Criar evento de métrica
        await prisma.metricEvent.create({
            data: {
                type: "scheduled",
                metadata: { leadId, appointmentId: appointment.id },
                userId: user.id,
                organizationId, // ===== MULTI-TENANT: Adicionar organizationId na criação =====
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
        const supabase = await createServerSupabaseClient();
        const { data: { user }, error } = await supabase.auth.getUser();

        if (error || !user) {
            return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
        }

        // Buscar role do usuário no banco
        const userRecord = await prisma.user.findUnique({
            where: { id: user.id },
            select: { role: true },
        });

        if (!userRecord) {
            return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
        }

        const userRole = userRecord.role;

        // ===== ROLE VALIDATION: Apenas admin e operador podem atualizar agendamentos =====
        requireRole(userRole, "operador");

        // Determinar organização
        let organizationId: string;
        if (userRole === "super_admin") {
            const body = await request.json();
            organizationId = body.organizationId;
            if (!organizationId) {
                return NextResponse.json(
                    { error: "Super admin deve especificar organizationId" },
                    { status: 400 }
                );
            }
        } else {
            const defaultOrg = await prisma.organization.findFirst({
                orderBy: { createdAt: "asc" },
                select: { id: true }
            });
            if (!defaultOrg) {
                return NextResponse.json(
                    { error: "Nenhuma organização encontrada" },
                    { status: 400 }
                );
            }
            organizationId = defaultOrg.id;
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
            where: {
                id,
                userId: user.id,
                organizationId,
            },
            data: updateData,
        });

        // Criar evento de métrica para no-show
        if (status === "no_show") {
            await prisma.metricEvent.create({
                data: {
                    type: "no_show",
                    metadata: { appointmentId: id },
                    userId: user.id,
                    organizationId,
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
