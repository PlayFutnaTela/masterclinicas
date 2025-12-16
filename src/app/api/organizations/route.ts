// API para gerenciar organizações - Supabase Auth
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { prisma } from "@/lib/db";

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

  // Buscar role do usuário no banco
  const userRecord = await prisma.user.findUnique({
    where: { id: user.id },
    select: { role: true },
  });

  if (!userRecord) {
    return Response.json(
      { error: "Usuário não encontrado" },
      { status: 404 }
    );
  }

  const userRole = userRecord.role;

  try {
    // Tentativa otimista: usar PG direto; se falhar, cair para Prisma
    try {
      const { query } = await import("@/lib/pg");
      if (userRole === "super_admin") {
        const res = await query(
          `SELECT id, name, slug, created_at as "createdAt" FROM organizations ORDER BY created_at DESC` // tabela 'organizations'
        );
        const organizations = res.rows;
        return Response.json(
          organizations.map((org: any) => ({ ...org, role: userRole }))
        );
      } else {
        const res = await query(
          `SELECT id, name, slug, created_at as "createdAt" FROM organizations ORDER BY created_at ASC LIMIT 1`
        );
        const organizations = res.rows;
        return Response.json(
          organizations.map((org: any) => ({ ...org, role: userRole }))
        );
      }
    } catch (pgErr) {
      console.warn("[API ORGANIZATIONS] PG fallback: erro ao usar pg, usando Prisma", pgErr);
      // Fallback para Prisma (preserva comportamento atual)
      let organizations;

      if (userRole === "super_admin") {
        // Super admin vê todas as organizações
        organizations = await prisma.organization.findMany({
          select: {
            id: true,
            name: true,
            slug: true,
            createdAt: true,
          },
          orderBy: { createdAt: "desc" },
        });
      } else {
        // Admin/operador vê apenas a organização padrão (por enquanto)
        const defaultOrg = await prisma.organization.findFirst({
          orderBy: { createdAt: "asc" },
          select: {
            id: true,
            name: true,
            slug: true,
            createdAt: true,
          },
        });

        organizations = defaultOrg ? [defaultOrg] : [];
      }

      return Response.json(
        organizations.map((org: any) => ({
          ...org,
          role: userRole, // Role global do usuário
        }))
      );
    }
  } catch (error) {
    console.error("[API] Erro ao listar organizações:", error);
    const msg = error instanceof Error ? error.message : String(error);
    const isDbDown = msg.includes("Can't reach database server") || msg.includes("PrismaClientInitializationError") || msg.includes('Environment variable not found');
    if (isDbDown) {
      return Response.json(
        { error: "Banco de dados indisponível", details: msg },
        { status: 503 }
      );
    }
    return Response.json(
      { error: "Erro ao listar organizações", details: msg },
      { status: 500 }
    );
  }
}
