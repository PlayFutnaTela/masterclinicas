// Página de Seleção de Clínica - Supabase Auth
import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { query } from "@/lib/pg";

export default async function SelectOrganizationPage() {
  const supabase = await createServerSupabaseClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/login");
  }

  // Buscar role do usuário no banco via PG
  const userRes = await query("SELECT role FROM users WHERE id = $1 LIMIT 1", [user.id]);
  if (!userRes.rows || userRes.rows.length === 0) {
    redirect("/login");
  }

  const role = userRes.rows[0].role;
  if (role === "super_admin") {
    redirect("/organizacoes");
  } else {
    redirect("/dashboard");
  }
}
