// API Route para gerenciamento de leads - Supabase Auth
import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { query } from "@/lib/pg";
import { requireRole } from "@/lib/role-middleware";

// Local LeadStatus type matching Prisma schema to remove dependency on @prisma/client
type LeadStatus = "novo" | "qualificado" | "agendado" | "perdido";

/**
 * GET /api/leads
 * Lista leads do usuário logado com paginação e filtros
 */
export async function GET(request: NextRequest) {
    try {
        const supabase = await createServerSupabaseClient();
        const { data: { user }, error } = await supabase.auth.getUser();

        if (error || !user) {
            return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
        }

// Buscar role do usuário no banco via PG (mais confiável para remover Prisma)
    const { query } = await import("@/lib/pg");
        const userRes = await query("SELECT role, organization_id as \"organizationId\" FROM users WHERE id = $1", [user.id]);
        if (!userRes || userRes.rows.length === 0) {
            return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
        }
        const userRow = userRes.rows[0];
        const userRole = userRow.role;

        // ===== ROLE VALIDATION: Apenas admin e operador podem ver leads =====
        requireRole(userRole, "operador");

        // Determinar organização
        let organizationId: string | null = null;
        if (userRole === "super_admin") {
            const url = new URL(request.url);
            organizationId = url.searchParams.get("organizationId");
        } else {
            // Admin/operador vê apenas da organização padrão
            if (userRow.organizationId) {
                organizationId = userRow.organizationId;
            } else {
                const orgRes = await query("SELECT id FROM organizations ORDER BY created_at ASC LIMIT 1");
                organizationId = orgRes.rows[0]?.id || null;
            }
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

        // Prisma-compatible where object for fallback
        const where: any = { organizationId };
        if (status) where.status = status;
        if (search) where.OR = [
            { name: { contains: search, mode: "insensitive" } },
            { phone: { contains: search } },
        ];

        try {
            const whereClauses: string[] = ["l.organization_id = $1"];
            const params: any[] = [organizationId];
            let idx = 2;

            if (status) {
                whereClauses.push(`l.status = $${idx++}`);
                params.push(status);
            }

            if (search) {
                whereClauses.push(`(LOWER(l.name) LIKE $${idx} OR l.phone LIKE $${idx})`);
                params.push(`%${search.toLowerCase()}%`);
                idx++;
            }

            const whereSql = whereClauses.length ? `WHERE ${whereClauses.join(" AND ")}` : "";

            const leadsSql = `SELECT l.*, a.id as appointment_id, a.scheduled_at as appointment_scheduled_at, a.status as appointment_status
                FROM leads l
                LEFT JOIN LATERAL (
                    SELECT id, scheduled_at, status FROM appointments WHERE lead_id = l.id ORDER BY scheduled_at DESC LIMIT 1
                ) a ON true
                ${whereSql}
                ORDER BY l.created_at DESC
                OFFSET ${skip}
                LIMIT ${limit}`;

            const totalSql = `SELECT COUNT(*)::int as total FROM leads l ${whereSql}`;

            const [leadsRes, totalRes] = await Promise.all([
                query(leadsSql, params),
                query(totalSql, params),
            ]);

            const leads = leadsRes.rows.map((row: any) => ({
                id: row.id,
                name: row.name,
                phone: row.phone,
                procedure: row.procedure,
                status: row.status,
                source: row.source,
                notes: row.notes,
                createdAt: row.created_at,
                updatedAt: row.updated_at,
                appointments: row.appointment_id
                    ? [{ id: row.appointment_id, scheduledAt: row.appointment_scheduled_at, status: row.appointment_status }]
                    : [],
            }));

            const total = totalRes.rows[0]?.total || 0;

            return NextResponse.json({
                leads,
                pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
            });
        } catch (pgErr) {
            console.error("[API LEADS] PG error:", pgErr);
            return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
        }
    } catch (error) {
        console.error("[API LEADS] Erro:", error);
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
 * POST /api/leads
 * Cria novo lead manualmente
 */
export async function POST(request: NextRequest) {
    try {
        const supabase = await createServerSupabaseClient();
        const { data: { user }, error } = await supabase.auth.getUser();

        if (error || !user) {
            return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
        }

        // Buscar role do usuário no banco via PG
        const userRes = await query("SELECT role FROM users WHERE id = $1 LIMIT 1", [user.id]);
        if (!userRes.rows || userRes.rows.length === 0) {
            return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
        }
        const userRole = userRes.rows[0].role;

        // ===== ROLE VALIDATION: Apenas admin e operador podem criar leads =====
        requireRole(userRole, "operador");

        // Determinar organização
        let organizationId: string;
        if (userRole === "super_admin") {
            const body = await request.json();
            organizationId = body.organizationId;
            if (!organizationId) return NextResponse.json({ error: "Super admin deve especificar organizationId" }, { status: 400 });
        } else {
            const defaultRes = await query("SELECT id FROM organizations ORDER BY created_at ASC LIMIT 1");
            if (!defaultRes.rows || defaultRes.rows.length === 0) return NextResponse.json({ error: "Nenhuma organização encontrada" }, { status: 400 });
            organizationId = defaultRes.rows[0].id;
        }

        const body = await request.json();
        const { name, phone, procedure, source, notes } = body;

        if (!name || !phone) {
            return NextResponse.json(
                { error: "Nome e telefone são obrigatórios" },
                { status: 400 }
            );
        }

        try {
            const { query } = await import("@/lib/pg");
            await query("BEGIN");
            const insertLeadSql = `INSERT INTO leads (name, phone, procedure, source, notes, user_id, organization_id) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`;
            const leadRes = await query(insertLeadSql, [name, phone, procedure || "", source || "manual", notes || null, user.id, organizationId]);
            const lead = leadRes.rows[0];

            const insertMetricSql = `INSERT INTO metric_events (type, metadata, user_id, organization_id) VALUES ($1, $2::jsonb, $3, $4)`;
            await query(insertMetricSql, ["lead_received", JSON.stringify({ leadId: lead.id, source: "manual" }), user.id, organizationId]);

            await query("COMMIT");

            return NextResponse.json({ success: true, lead }, { status: 201 });
        } catch (pgErr) {
            try { await query("ROLLBACK"); } catch(_) {}
            console.error("[API LEADS] PG create error:", pgErr);
            return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
        }
    } catch (error) {
        console.error("[API LEADS] Erro:", error);
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
 * PATCH /api/leads
 * Atualiza status ou dados de um lead
 */
export async function PATCH(request: NextRequest) {
    try {
        const supabase = await createServerSupabaseClient();
        const { data: { user }, error } = await supabase.auth.getUser();

        if (error || !user) {
            return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
        }

        // Buscar role do usuário no banco via PG
        const userRes2 = await query("SELECT role FROM users WHERE id = $1 LIMIT 1", [user.id]);
        if (!userRes2.rows || userRes2.rows.length === 0) {
            return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
        }
        const userRole = userRes2.rows[0].role;

        // ===== ROLE VALIDATION: Apenas admin e operador podem atualizar leads =====
        requireRole(userRole, "operador");

        // Determinar organização
        let body: any;
        let organizationId: string;
        if (userRole === "super_admin") {
            body = await request.json();
            organizationId = body.organizationId;
            if (!organizationId) return NextResponse.json({ error: "Super admin deve especificar organizationId" }, { status: 400 });
        } else {
            const defaultRes = await query("SELECT id FROM organizations ORDER BY created_at ASC LIMIT 1");
            if (!defaultRes.rows || defaultRes.rows.length === 0) return NextResponse.json({ error: "Nenhuma organização encontrada" }, { status: 400 });
            organizationId = defaultRes.rows[0].id;
            body = await request.json();
        }

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

        try {
            const { query } = await import("@/lib/pg");
            await query("BEGIN");
            const setClauses: string[] = ["updated_at = $1"];
            const params: any[] = [updateData.updatedAt];
            let idx = 2;

            if (updateData.status) {
                setClauses.push(`status = $${idx++}`);
                params.push(updateData.status);
            }
            if (updateData.notes !== undefined) {
                setClauses.push(`notes = $${idx++}`);
                params.push(updateData.notes);
            }

            params.push(id, user.id, organizationId);

            const updateSql = `UPDATE leads SET ${setClauses.join(", ")} WHERE id = $${idx++} AND user_id = $${idx++} AND organization_id = $${idx++} RETURNING *`;
            const res = await query(updateSql, params);
            const lead = res.rows[0];

            if (status === "qualificado") {
                await query(`INSERT INTO metric_events (type, metadata, user_id, organization_id) VALUES ($1, $2::jsonb, $3, $4)`, [
                    "qualified",
                    JSON.stringify({ leadId: id }),
                    user.id,
                    organizationId,
                ]);
            }

            await query("COMMIT");
            return NextResponse.json({ success: true, lead });
        } catch (pgErr) {
            try { await query("ROLLBACK"); } catch(_) {}
            console.error("[API LEADS] PG update error:", pgErr);
            return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
        }
    } catch (error) {
        console.error("[API LEADS] Erro:", error);
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
