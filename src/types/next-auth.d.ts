import NextAuth from "next-auth";

// Local UserRole type mirroring Prisma schema enums. This avoids depending on @prisma/client types.
type UserRole = "super_admin" | "admin" | "operador";

declare module "next-auth" {
  interface User {
    id: string;
    email: string;
    name: string;
    role: UserRole;
  }

  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      role: UserRole;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: UserRole;
  }
}
