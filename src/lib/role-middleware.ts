// Middleware para validação de roles - Simplified System
import { UserRole } from "@prisma/client";

export function hasPermission(
  userRole: UserRole,
  requiredRole: "super_admin" | "admin" | "operador"
): boolean {
  const roleHierarchy: { [key in UserRole]: number } = {
    super_admin: 4,
    admin: 3,
    operador: 1,
  };

  return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
}

export function requireRole(
  userRole: UserRole,
  requiredRole: "super_admin" | "admin" | "operador"
) {
  const hasAccess = hasPermission(userRole, requiredRole);
  if (!hasAccess) {
    throw new Error(
      `Acesso negado: requer permissão de ${requiredRole}`
    );
  }
}

export function isSuperAdmin(userRole: UserRole): boolean {
  return userRole === "super_admin";
}

export function isAdmin(userRole: UserRole): boolean {
  return userRole === "admin" || userRole === "super_admin";
}

export function isOperador(userRole: UserRole): boolean {
  return userRole === "operador";
}