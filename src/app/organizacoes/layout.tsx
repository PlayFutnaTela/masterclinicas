// Layout para página de administração
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { SessionProvider } from "next-auth/react";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  // ===== MULTI-TENANT: Proteger acesso apenas para SUPER ADMIN (email específico) =====
  const SUPER_ADMIN_EMAIL = process.env.SUPER_ADMIN_EMAIL || "admin@masterclínicas.com";
  
  if (session.user.email !== SUPER_ADMIN_EMAIL) {
    redirect("/dashboard");
  }

  return (
    <SessionProvider session={session}>
      {children}
    </SessionProvider>
  );
}
