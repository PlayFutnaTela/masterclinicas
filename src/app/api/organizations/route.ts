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
      // TODO: Implementar associação específica de usuário à organização
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
      organizations.map((org) => ({
        ...org,
        role: userRole, // Role global do usuário
      }))
    );
  } catch (error) {
    console.error("[API] Erro ao listar organizações:", error);
    return Response.json(
      { error: "Erro ao listar organizações" },
      { status: 500 }
    );
  }
}
