// API Route para gerenciamento de agendamentos - Supabase Auth
import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { query } from "@/lib/pg";
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

        // Buscar role E organizationId do usuário no banco via PG
        const userRes = await query("SELECT role, organization_id as \"organizationId\" FROM users WHERE id = $1 LIMIT 1", [user.id]);
        if (!userRes.rows || userRes.rows.length === 0) {
            return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
        }
        const userRole = userRes.rows[0].role;
        let organizationId: string | null = userRes.rows[0].organizationId || null; 

        // ===== ROLE VALIDATION: Apenas admin e operador podem ver agendamentos =====
        requireRole(userRole, "operador");

        // Determinar organizationId baseado no role do usuário
        if (userRole === "super_admin") {
            // Super admin pode ver agendamentos de todas as organizações (ou especificar uma via query param)
            const url = new URL(request.url);
            organizationId = url.searchParams.get("organizationId");
            // Se super_admin não especificar organizationId, usar a dele (se houver) ou mostrar de todas
            if (!organizationId) {
                organizationId = userRes.rows[0].organizationId;
            }
        } else {
            // Admin/operador vê apenas da sua organização associada
            organizationId = userRes.rows[0].organizationId;
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

        // Usar PG diretamente
        try {
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
            console.error("[API AGENDAMENTOS] PG error:", pgErr);
            return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
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

        // Buscar role do usuário no banco via PG
        const userRes = await query("SELECT role FROM users WHERE id = $1 LIMIT 1", [user.id]);
        if (!userRes.rows || userRes.rows.length === 0) {
            return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
        }
        const userRole = userRes.rows[0].role;

        // ===== ROLE VALIDATION: Apenas admin e operador podem criar agendamentos =====
        requireRole(userRole, "operador");

        // Determinar organização
        let organizationId: string;
        if (userRole === "super_admin") {
            // Super admin precisa especificar a organização
            const body = await request.json();
            organizationId = body.organizationId;
            if (!organizationId) {
                return NextResponse.json({ error: "Super admin deve especificar organizationId" }, { status: 400 });
            }
        } else {
            // Admin/operador usa organização padrão -> buscar via PG
            const defaultRes = await query("SELECT id FROM organizations ORDER BY created_at ASC LIMIT 1");
            if (!defaultRes.rows || defaultRes.rows.length === 0) {
                return NextResponse.json({ error: "Nenhuma organização encontrada" }, { status: 400 });
            }
            organizationId = defaultRes.rows[0].id;
        }

        const body = await request.json();
        const { leadId, scheduledAt, notes } = body;

        if (!leadId || !scheduledAt) {
            return NextResponse.json(
                { error: "Lead e data/hora são obrigatórios" },
                { status: 400 }
            );
        }

        try {
            const { query } = await import("@/lib/pg");
            await query("BEGIN");

            // Verificar se o lead pertence ao usuário E à organização
            const leadRes = await query("SELECT id FROM leads WHERE id = $1 AND user_id = $2 AND organization_id = $3", [leadId, user.id, organizationId]);
            if (!leadRes.rows || leadRes.rows.length === 0) {
                await query("ROLLBACK");
                return NextResponse.json(
                    { error: "Lead não encontrado" },
                    { status: 404 }
                );
            }

            // Atualizar status do lead
            await query("UPDATE leads SET status = $1, updated_at = now() WHERE id = $2", ["agendado", leadId]);

            // Criar agendamento
            const insertAppointmentSql = `INSERT INTO appointments (lead_id, scheduled_at, notes, user_id, organization_id) VALUES ($1, $2, $3, $4, $5) RETURNING *`;
            const appointmentRes = await query(insertAppointmentSql, [leadId, new Date(scheduledAt), notes || null, user.id, organizationId]);
            const appointment = appointmentRes.rows[0];

            // Criar evento de métrica
            await query(`INSERT INTO metric_events (type, metadata, user_id, organization_id) VALUES ($1, $2::jsonb, $3, $4)`, [
                "scheduled",
                JSON.stringify({ leadId, appointmentId: appointment.id }),
                user.id,
                organizationId,
            ]);

            await query("COMMIT");

            return NextResponse.json(
                { success: true, appointment },
                { status: 201 }
            );
        } catch (pgErr) {
            try { await query("ROLLBACK"); } catch(_) {}
            console.error("[API AGENDAMENTOS] PG create error:", pgErr);
            return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
        }
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

        // Buscar role do usuário no banco via PG
        const userRes2 = await query("SELECT role FROM users WHERE id = $1 LIMIT 1", [user.id]);
        if (!userRes2.rows || userRes2.rows.length === 0) {
            return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
        }
        const userRole = userRes2.rows[0].role;

        // ===== ROLE VALIDATION: Apenas admin e operador podem atualizar agendamentos =====
        requireRole(userRole, "operador");

        // Determinar organização
        let organizationId: string;
        if (userRole === "super_admin") {
            const body = await request.json();
            organizationId = body.organizationId;
            if (!organizationId) {
                return NextResponse.json({ error: "Super admin deve especificar organizationId" }, { status: 400 });
            }
        } else {
            const defaultRes2 = await query("SELECT id FROM organizations ORDER BY created_at ASC LIMIT 1");
            if (!defaultRes2.rows || defaultRes2.rows.length === 0) {
                return NextResponse.json({ error: "Nenhuma organização encontrada" }, { status: 400 });
            }
            organizationId = defaultRes2.rows[0].id;
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

            const updateSql = `UPDATE appointments SET ${setClauses.join(", ")} WHERE id = $${idx++} AND user_id = $${idx++} AND organization_id = $${idx++} RETURNING *`;
            const res = await query(updateSql, params);
            const appointment = res.rows[0];

            if (status === "no_show") {
                await query(`INSERT INTO metric_events (type, metadata, user_id, organization_id) VALUES ($1, $2::jsonb, $3, $4)`, [
                    "no_show",
                    JSON.stringify({ appointmentId: id }),
                    user.id,
                    organizationId,
                ]);
            }

            await query("COMMIT");
            return NextResponse.json({ success: true, appointment });
        } catch (pgErr) {
            try { await query("ROLLBACK"); } catch(_) {}
            console.error("[API AGENDAMENTOS] PG update error:", pgErr);
            return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
        }
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

// DELETE /api/agendamentos
export async function DELETE(request: NextRequest) {
    try {
        const supabase = await createServerSupabaseClient();
        const { data: { user }, error } = await supabase.auth.getUser();

        if (error || !user) {
            return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
        }

        const body = await request.json();
        const { id, organizationId: providedOrg } = body;

        if (!id) return NextResponse.json({ error: "ID do agendamento é obrigatório" }, { status: 400 });

        // Buscar role do usuário via PG
        const userRes3 = await query("SELECT role FROM users WHERE id = $1 LIMIT 1", [user.id]);
        if (!userRes3.rows || userRes3.rows.length === 0) return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
        const userRole2 = userRes3.rows[0].role;
        requireRole(userRole2, "operador");

        // Determinar organizationId
        let organizationId: string;
        if (userRole2 === "super_admin") {
            if (!providedOrg) return NextResponse.json({ error: "Super admin deve especificar organizationId" }, { status: 400 });
            organizationId = providedOrg;
        } else {
            const defaultRes3 = await query("SELECT id FROM organizations ORDER BY created_at ASC LIMIT 1");
            if (!defaultRes3.rows || defaultRes3.rows.length === 0) return NextResponse.json({ error: "Nenhuma organização encontrada" }, { status: 400 });
            organizationId = defaultRes3.rows[0].id;
        }

        try {
            const res = await query("DELETE FROM appointments WHERE id = $1 AND user_id = $2 AND organization_id = $3 RETURNING *", [id, user.id, organizationId]);
            const deleted = res.rows[0];
            if (!deleted) return NextResponse.json({ error: "Agendamento não encontrado" }, { status: 404 });

            // opcional: criar evento de métrica para exclusão
            await query(`INSERT INTO metric_events (type, metadata, user_id, organization_id) VALUES ($1, $2::jsonb, $3, $4)`, [
                "no_show",
                JSON.stringify({ appointmentId: id }),
                user.id,
                organizationId,
            ]).catch(() => {});

            return NextResponse.json({ success: true, deleted });
        } catch (pgErr) {
            console.error("[API AGENDAMENTOS] PG delete error:", pgErr);
            return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
        }
    } catch (error) {
        console.error("[API AGENDAMENTOS] DELETE - Erro:", error);
        return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
    }
}

