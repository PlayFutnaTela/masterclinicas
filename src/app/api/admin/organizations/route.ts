// API para SUPER ADMIN gerenciar TODAS as organizações
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

// GET: Listar TODAS as organizações (SUPER ADMIN ONLY)
export async function GET(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return Response.json(
      { error: "Não autenticado" },
      { status: 401 }
    );
  }

  // ===== Verificar se é SUPER ADMIN =====
  if (session.user.role !== "super_admin") {
    return Response.json(
      { error: "Acesso negado. Apenas super admins podem acessar." },
      { status: 403 }
    );
  }

  try {
    // Buscar TODAS as organizações com contagem de dados
    const organizations = await prisma.organization.findMany({
      include: {
        _count: {
          select: {
            leads: true,
            appointments: true,
            users: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

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
  const session = await auth();

  if (!session?.user?.id) {
    return Response.json(
      { error: "Não autenticado" },
      { status: 401 }
    );
  }

  // ===== Verificar se é SUPER ADMIN =====
  if (session.user.role !== "super_admin") {
    return Response.json(
      { error: "Acesso negado. Apenas super admins podem criar organizações." },
      { status: 403 }
    );
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
    const existingOrg = await prisma.organization.findUnique({
      where: { slug: slug.toLowerCase() },
    });

    if (existingOrg) {
      return Response.json(
        { error: "Este slug já está em uso" },
        { status: 400 }
      );
    }

    // ===== MULTI-TENANT: Criar nova organização =====
    const organization = await prisma.organization.create({
      data: {
        name,
        slug: slug.toLowerCase(),
        whatsappLink,
        webhookUrl,
      },
      include: {
        _count: {
          select: {
            leads: true,
            appointments: true,
            users: true,
          },
        },
      },
    });

    return Response.json(
      {
        ...organization,
        message: "Organização criada com sucesso",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[API ADMIN] Erro ao criar organização:", error);
    return Response.json(
      { error: "Erro ao criar organização" },
      { status: 500 }
    );
  }
}
