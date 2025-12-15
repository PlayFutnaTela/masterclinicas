// Página de Seleção de Clínica - Supabase Auth
import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { prisma } from "@/lib/db";

export default async function SelectOrganizationPage() {
  const supabase = await createServerSupabaseClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/login");
  }

  // Buscar role do usuário no banco
  const userRecord = await prisma.user.findUnique({
    where: { id: user.id },
    select: { role: true },
  });

  if (!userRecord) {
    redirect("/login");
  }

  // Com roles simplificados, redirecionar diretamente
  // Super admin vai para /organizacoes, outros usuários vão para /dashboard
  if (userRecord.role === "super_admin") {
    redirect("/organizacoes");
  } else {
    redirect("/dashboard");
  }
}
