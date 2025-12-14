import NextAuth from "next-auth";
import { UserRole } from "@prisma/client";

declare module "next-auth" {
  interface User {
    id: string;
    email: string;
    name: string;
    organizationId: string;
    userRole: UserRole;
  }

  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      organizationId: string;
      userRole: UserRole;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    organizationId?: string;
    userRole?: UserRole;
  }
}
