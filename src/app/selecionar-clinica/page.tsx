// Página de Seleção de Clínica - Simplified Roles
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export default async function SelectOrganizationPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  // Com roles simplificados, redirecionar diretamente
  // Super admin vai para /organizacoes, outros usuários vão para /dashboard
  if (session.user.role === "super_admin") {
    redirect("/organizacoes");
  } else {
    redirect("/dashboard");
  }
}
