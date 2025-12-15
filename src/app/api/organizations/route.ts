// API para gerenciar organizações - Simplified Roles
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

// GET: Listar organizações acessíveis ao usuário
export async function GET(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return Response.json(
      { error: "Não autenticado" },
      { status: 401 }
    );
  }

  try {
    let organizations;

    if (session.user.role === "super_admin") {
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
        role: session.user.role, // Role global do usuário
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
