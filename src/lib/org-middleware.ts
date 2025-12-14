// Middleware para validação de organização
import { prisma } from "./db";
import { UserRole } from "@prisma/client";

export async function validateUserOrganization(
  userId: string,
  organizationId: string
) {
  const userOrg = await prisma.userOrganization.findUnique({
    where: {
      userId_organizationId: {
        userId,
        organizationId,
      },
    },
  });

  if (!userOrg) {
    throw new Error("Acesso negado: usuário não pertence a esta organização");
  }

  return userOrg;
}

export async function getOrganizationRole(
  userId: string,
  organizationId: string
): Promise<UserRole> {
  const userOrg = await validateUserOrganization(userId, organizationId);
  return userOrg.role;
}

export async function hasPermission(
  userId: string,
  organizationId: string,
  requiredRole: "admin" | "gerente" | "operador"
): Promise<boolean> {
  try {
    const role = await getOrganizationRole(userId, organizationId);

    const roleHierarchy: { [key in UserRole]: number } = {
      admin: 3,
      gerente: 2,
      operador: 1,
    };

    return roleHierarchy[role] >= roleHierarchy[requiredRole];
  } catch {
    return false;
  }
}

export async function requireRole(
  userId: string,
  organizationId: string,
  requiredRole: "admin" | "gerente" | "operador"
) {
  const hasAccess = await hasPermission(userId, organizationId, requiredRole);
  if (!hasAccess) {
    throw new Error(
      `Acesso negado: requer permissão de ${requiredRole}`
    );
  }
}
