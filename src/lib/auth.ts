// Auth.js (NextAuth v5) Configuration - Multi-Tenant
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { prisma } from "./db";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Senha", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email e senha são obrigatórios");
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
          include: {
            organizations: {
              include: { organization: true },
              orderBy: { createdAt: "desc" },
              take: 1,
            },
          },
        });

        if (!user) {
          throw new Error("Usuário não encontrado");
        }

        const isPasswordValid = await compare(
          credentials.password as string,
          user.password
        );

        if (!isPasswordValid) {
          throw new Error("Senha incorreta");
        }

        // Verificar se usuário tem organização
        if (!user.organizations || user.organizations.length === 0) {
          throw new Error("Usuário sem organização associada");
        }

        const userOrg = user.organizations[0];

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          organizationId: userOrg.organizationId,
          userRole: userOrg.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.organizationId = user.organizationId;
        token.userRole = user.userRole;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.organizationId = token.organizationId as string;
        session.user.userRole = token.userRole as any;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
});
