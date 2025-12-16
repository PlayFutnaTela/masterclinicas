// API Route para gerenciamento de agendamentos - Supabase Auth
import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { prisma } from "@/lib/db";
import { requireRole } from "@/lib/role-middleware";

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

        // Buscar role E organizationId do usuário no banco
        const userRecord = await prisma.user.findUnique({
            where: { id: user.id },
            select: { role: true, organizationId: true },
        });

        if (!userRecord) {
            return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
        }

        const userRole = userRecord.role;
        let organizationId: string | null = null;

        // ===== ROLE VALIDATION: Apenas admin e operador podem ver agendamentos =====
        requireRole(userRole, "operador");

        // Determinar organizationId baseado no role do usuário
        if (userRole === "super_admin") {
            // Super admin pode ver agendamentos de todas as organizações (ou especificar uma via query param)
            const url = new URL(request.url);
            organizationId = url.searchParams.get("organizationId");
            // Se super_admin não especificar organizationId, usar a dele (se houver) ou mostrar de todas
            if (!organizationId) {
                organizationId = userRecord.organizationId;
            }
        } else {
            // Admin/operador vê apenas da sua organização associada
            organizationId = userRecord.organizationId;
        }

        // Se não houver organização, retornar lista vazia
        if (!organizationId) {
            return NextResponse.json({
                appointments: [],
                pagination: {
                    page: 1,
                    limit: 10,
                    total: 0,
                    totalPages: 0,
                },
            });
        }

        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "10");
        const status = searchParams.get("status");
        const startDate = searchParams.get("startDate");
        const endDate = searchParams.get("endDate");

        const skip = (page - 1) * limit;

        const where: {
            organizationId?: string;
            status?: string;
            scheduledAt?: { gte?: Date; lte?: Date };
        } = {};

        // Se houver organizationId, adicionar ao filtro
        if (organizationId) {
            where.organizationId = organizationId;
        }

        if (status) {
            where.status = status;
        }

        if (startDate || endDate) {
            where.scheduledAt = {};
            try {
                if (startDate) where.scheduledAt.gte = new Date(startDate);
                if (endDate) where.scheduledAt.lte = new Date(endDate);
            } catch (dateError) {
                console.error("[API AGENDAMENTOS] Erro ao parsear datas:", dateError);
            }
        }

        // Tentar usar PG diretamente (mais resiliente para migração gradual). Se falhar, cair no Prisma.
        try {
            const { query } = await import("@/lib/pg");

            // Montar WHERE dinamicamente (atenção à orderBy / pagination)
            const whereClauses: string[] = ["organization_id = $1"];
            const params: any[] = [organizationId];
            let idx = 2;

            if (status) {
                whereClauses.push(`status = $${idx++}`);
                params.push(status);
            }

            if (startDate) {
                whereClauses.push(`scheduled_at >= $${idx++}`);
                params.push(new Date(startDate));
            }
            if (endDate) {
                whereClauses.push(`scheduled_at <= $${idx++}`);
                params.push(new Date(endDate));
            }

            const whereSql = whereClauses.length ? `WHERE ${whereClauses.join(" AND ")}` : "";

            const appointmentsSql = `SELECT a.id, a.scheduled_at as "scheduledAt", a.status, a.notes, a.lead_id as "leadId", l.id as "lead.id", l.name as "lead.name", l.phone as "lead.phone", l.procedure as "lead.procedure"
                FROM appointments a
                LEFT JOIN leads l ON l.id = a.lead_id
                ${whereSql}
                ORDER BY a.scheduled_at ASC
                OFFSET ${skip}
                LIMIT ${limit}`;

            const totalSql = `SELECT COUNT(*)::int as total FROM appointments a ${whereSql}`;

            const [appointmentsRes, totalRes] = await Promise.all([
                query(appointmentsSql, params),
                query(totalSql, params),
            ]);

            const appointments = appointmentsRes.rows.map((row: any) => ({
                id: row.id,
                scheduledAt: row.scheduledAt,
                status: row.status,
                notes: row.notes,
                lead: {
                    id: row["lead.id"],
                    name: row["lead.name"],
                    phone: row["lead.phone"],
                    procedure: row["lead.procedure"],
                },
            }));

            const total = totalRes.rows[0]?.total || 0;

            return NextResponse.json({
                appointments,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit),
                },
            });
        } catch (pgErr) {
            console.warn("[API AGENDAMENTOS] PG fallback: erro ao usar pg, usando Prisma", pgErr);
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
        }
    } catch (error) {
        console.error("[API AGENDAMENTOS] GET - Erro completo:", error);
        console.error("[API AGENDAMENTOS] GET - Stack:", error instanceof Error ? error.stack : "N/A");

        const msg = error instanceof Error ? error.message : String(error);
        const isDbDown = msg.includes("Can't reach database server") || msg.includes("PrismaClientInitializationError") || msg.includes('Environment variable not found');

        if (isDbDown) {
            return NextResponse.json(
                { error: "Banco de dados indisponível", details: msg },
                { status: 503 }
            );
        }

        return NextResponse.json(
            { error: "Erro interno do servidor", details: msg },
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
        const msg = error instanceof Error ? error.message : String(error);
        const isDbDown = msg.includes("Can't reach database server") || msg.includes("PrismaClientInitializationError") || msg.includes('Environment variable not found');
        if (isDbDown) {
            return NextResponse.json(
                { error: "Banco de dados indisponível", details: msg },
                { status: 503 }
            );
        }
        return NextResponse.json(
            { error: "Erro interno do servidor", details: msg },
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

        const updateData: { status?: string; notes?: string; updatedAt: Date } = {
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
        const msg = error instanceof Error ? error.message : String(error);
        const isDbDown = msg.includes("Can't reach database server") || msg.includes("PrismaClientInitializationError") || msg.includes('Environment variable not found');
        if (isDbDown) {
            return NextResponse.json(
                { error: "Banco de dados indisponível", details: msg },
                { status: 503 }
            );
        }
        return NextResponse.json(
            { error: "Erro interno do servidor", details: msg },
            { status: 500 }
        );
    }
}
