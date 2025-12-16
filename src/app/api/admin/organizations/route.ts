// API para SUPER ADMIN gerenciar TODAS as organizações - Supabase Auth
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { query } from "@/lib/pg";

// GET: Listar TODAS as organizações (SUPER ADMIN ONLY)
export async function GET(request: Request) {
  const supabase = await createServerSupabaseClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    return Response.json(
      { error: "Não autenticado" },
      { status: 401 }
    );
  }

  // Buscar role do usuário no banco via PG
  const userRes = await query("SELECT role FROM users WHERE id = $1 LIMIT 1", [user.id]);
  if (!userRes.rows || userRes.rows.length === 0 || userRes.rows[0].role !== "super_admin") {
    return Response.json({ error: "Acesso negado. Apenas super admins podem acessar." }, { status: 403 });
  }

  try {
    // Buscar TODAS as organizações com contagem de dados via SQL
    const sql = `
      SELECT o.id, o.name, o.slug, o.whatsapp_link as "whatsappLink", o.webhook_url as "webhookUrl", o.created_at as "createdAt",
        (SELECT COUNT(*) FROM leads l WHERE l.organization_id = o.id) as leads_count,
        (SELECT COUNT(*) FROM appointments a WHERE a.organization_id = o.id) as appointments_count,
        (SELECT COUNT(*) FROM users u WHERE u.organization_id = o.id) as users_count
      FROM organizations o
      ORDER BY o.created_at DESC
    `;

    const res = await query(sql);
    const organizations = (res.rows || []).map((r: any) => ({
      id: r.id,
      name: r.name,
      slug: r.slug,
      whatsappLink: r.whatsappLink,
      webhookUrl: r.webhookUrl,
      createdAt: r.createdAt,
      _count: {
        leads: parseInt(r.leads_count || 0, 10),
        appointments: parseInt(r.appointments_count || 0, 10),
        users: parseInt(r.users_count || 0, 10),
      },
    }));

    return Response.json(organizations);
  } catch (error) {
    console.error("[API ADMIN] Erro ao listar organizações:", error);
    return Response.json(
      { error: "Erro ao listar organizações" },
      { status: 500 }
    );
  }
}

// POST: Criar nova organização (ADMIN ONLY)
export async function POST(request: Request) {
  const supabase = await createServerSupabaseClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    return Response.json(
      { error: "Não autenticado" },
      { status: 401 }
    );
  }

  // Buscar role do usuário no banco via PG
  const userRes2 = await query("SELECT role FROM users WHERE id = $1 LIMIT 1", [user.id]);
  if (!userRes2.rows || userRes2.rows.length === 0 || userRes2.rows[0].role !== "super_admin") {
    return Response.json({ error: "Acesso negado. Apenas super admins podem criar organizações." }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { name, slug, whatsappLink, webhookUrl } = body;

    // Validação básica
    if (!name || !slug) {
      return Response.json(
        { error: "Nome e slug são obrigatórios" },
        { status: 400 }
      );
    }

    // Verificar se slug já existe
    const existingRes = await query("SELECT id FROM organizations WHERE slug = $1 LIMIT 1", [slug.toLowerCase()]);
    if (existingRes.rows && existingRes.rows.length > 0) return Response.json({ error: "Este slug já está em uso" }, { status: 400 });

    // ===== MULTI-TENANT: Criar nova organização via SQL =====
    const insertSql = `INSERT INTO organizations (name, slug, whatsapp_link, webhook_url) VALUES ($1, $2, $3, $4) RETURNING id, name, slug, whatsapp_link as "whatsappLink", webhook_url as "webhookUrl", created_at as "createdAt"`;
    const insertRes = await query(insertSql, [name, slug.toLowerCase(), whatsappLink || null, webhookUrl || null]);
    const row = insertRes.rows[0];

    const organization = {
      ...row,
      _count: { leads: 0, appointments: 0, users: 0 },
      message: "Organização criada com sucesso",
    };

    return Response.json(organization, { status: 201 });
  } catch (error) {
    console.error("[API ADMIN] Erro ao criar organização:", error);
    return Response.json(
      { error: "Erro ao criar organização" },
      { status: 500 }
    );
  }
}
