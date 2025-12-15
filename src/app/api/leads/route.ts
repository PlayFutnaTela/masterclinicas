// API Route para gerenciamento de leads - Simplified Roles
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { requireRole } from "@/lib/role-middleware";
import { LeadStatus } from "@prisma/client";

/**
 * GET /api/leads
 * Lista leads do usuário logado com paginação e filtros
 */
export async function GET(request: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
        }

        // ===== ROLE VALIDATION: Apenas admin e operador podem ver leads =====
        requireRole(session.user.role, "operador");

        // Determinar organização
        let organizationId: string | null = null;
        if (session.user.role === "super_admin") {
            // Super admin pode ver leads de todas as organizações
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
        const status = searchParams.get("status") as LeadStatus | null;
        const search = searchParams.get("search");

        const skip = (page - 1) * limit;

        const where: {
            userId: string;
            organizationId: string;
            status?: LeadStatus;
            OR?: Array<{ name: { contains: string; mode: "insensitive" } } | { phone: { contains: string } }>;
        } = {
            userId: session.user.id,
            organizationId, // ===== MULTI-TENANT: Adicionar organizationId ao WHERE =====
        };

        if (status) {
            where.status = status;
        }

        if (search) {
            where.OR = [
                { name: { contains: search, mode: "insensitive" } },
                { phone: { contains: search } },
            ];
        }

        const [leads, total] = await Promise.all([
            prisma.lead.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: "desc" },
                include: {
                    appointments: {
                        orderBy: { scheduledAt: "desc" },
                        take: 1,
                    },
                },
            }),
            prisma.lead.count({ where }),
        ]);

        return NextResponse.json({
            leads,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error("[API LEADS] Erro:", error);
        return NextResponse.json(
            { error: "Erro interno do servidor" },
            { status: 500 }
        );
    }
}

/**
 * POST /api/leads
 * Cria novo lead manualmente
 */
export async function POST(request: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
        }

        // ===== ROLE VALIDATION: Apenas admin e operador podem criar leads =====
        requireRole(session.user.role, "operador");

        // Determinar organização
        let organizationId: string;
        if (session.user.role === "super_admin") {
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
        const { name, phone, procedure, source, notes } = body;

        if (!name || !phone) {
            return NextResponse.json(
                { error: "Nome e telefone são obrigatórios" },
                { status: 400 }
            );
        }

        const lead = await prisma.lead.create({
            data: {
                name,
                phone,
                procedure: procedure || "",
                source: source || "manual",
                notes,
                userId: session.user.id,
                organizationId, // ===== MULTI-TENANT: Adicionar organizationId na criação =====
            },
        });

        // Criar evento de métrica
        await prisma.metricEvent.create({
            data: {
                type: "lead_received",
                metadata: { leadId: lead.id, source: "manual" },
                userId: session.user.id,
                organizationId, // ===== MULTI-TENANT: Adicionar organizationId na criação =====
            },
        });

        return NextResponse.json({ success: true, lead }, { status: 201 });
    } catch (error) {
        console.error("[API LEADS] Erro:", error);
        return NextResponse.json(
            { error: "Erro interno do servidor" },
            { status: 500 }
        );
    }
}

/**
 * PATCH /api/leads
 * Atualiza status ou dados de um lead
 */
export async function PATCH(request: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
        }

        // ===== ROLE VALIDATION: Apenas admin e operador podem atualizar leads =====
        requireRole(session.user.role, "operador");

        // Determinar organização
        let organizationId: string;
        if (session.user.role === "super_admin") {
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
        if (!organizationId) {
            return NextResponse.json(
                { error: "Organização não encontrada" },
                { status: 400 }
            );
        }

        const body = await request.json();
        const { id, status, notes } = body;

        if (!id) {
            return NextResponse.json(
                { error: "ID do lead é obrigatório" },
                { status: 400 }
            );
        }

        const updateData: { status?: LeadStatus; notes?: string; updatedAt: Date } = {
            updatedAt: new Date(),
        };

        if (status) updateData.status = status;
        if (notes !== undefined) updateData.notes = notes;

        const lead = await prisma.lead.update({
            where: {
                id,
                userId: session.user.id,
                organizationId, // ===== MULTI-TENANT: Adicionar organizationId ao WHERE =====
            },
            data: updateData,
        });

        // Criar evento de métrica para mudança de status
        if (status === "qualificado") {
            await prisma.metricEvent.create({
                data: {
                    type: "qualified",
                    metadata: { leadId: id },
                    userId: session.user.id,
                    organizationId, // ===== MULTI-TENANT: Adicionar organizationId na criação =====
                },
            });
        }

        return NextResponse.json({ success: true, lead });
    } catch (error) {
        console.error("[API LEADS] Erro:", error);
        return NextResponse.json(
            { error: "Erro interno do servidor" },
            { status: 500 }
        );
    }
}
