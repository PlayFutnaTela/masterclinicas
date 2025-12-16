// API para gerenciar organizações - Supabase Auth
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { query } from "@/lib/pg";

// GET: Listar organizações acessíveis ao usuário
export async function GET(request: Request) {
  const supabase = await createServerSupabaseClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    return Response.json(
      { error: "Não autenticado" },
      { status: 401 }
    );
  }

  // Buscar role do usuário no banco via pg
  const userRes = await query("SELECT role FROM users WHERE id = $1 LIMIT 1", [user.id]);
  if (!userRes.rows || userRes.rows.length === 0) {
    return Response.json({ error: "Usuário não encontrado" }, { status: 404 });
  }
  const userRole = userRes.rows[0].role;

  try {
    if (userRole === "super_admin") {
      const res = await query(`SELECT id, name, slug, created_at as "createdAt" FROM organizations ORDER BY created_at DESC`);
      const organizations = res.rows || [];
      return Response.json(organizations.map((org: any) => ({ ...org, role: userRole })));
    } else {
      const res = await query(`SELECT id, name, slug, created_at as "createdAt" FROM organizations ORDER BY created_at ASC LIMIT 1`);
      const organizations = res.rows || [];
      return Response.json(organizations.map((org: any) => ({ ...org, role: userRole })));
    }
  } catch (error) {
    console.error("[API] Erro ao listar organizações:", error);
    const msg = error instanceof Error ? error.message : String(error);
    const isDbDown = msg.includes("Can't reach database server") || msg.includes("PrismaClientInitializationError") || msg.includes('Environment variable not found');
    if (isDbDown) {
      return Response.json({ error: "Banco de dados indisponível", details: msg }, { status: 503 });
    }
    return Response.json({ error: "Erro ao listar organizações", details: msg }, { status: 500 });
  }
}
