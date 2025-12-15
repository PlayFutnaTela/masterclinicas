// Layout do Dashboard - Supabase Auth
import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { Sidebar } from "@/components/dashboard/sidebar";
import { Topbar } from "@/components/dashboard/topbar";

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    // Determinar organização para exibir no layout
    let clinicName = "MasterClínicas";
    
    // Buscar role do usuário
    const { data: userData } = await supabase
        .from('users')
        .select('role, organizationId')
        .eq('id', user.id)
        .single();

    if (userData?.role !== "super_admin") {
        // Para usuários normais, buscar organização associada
        if (userData?.organizationId) {
            const { data: orgData } = await supabase
                .from('organizations')
                .select('name')
                .eq('id', userData.organizationId)
                .single();
            clinicName = orgData?.name || "Minha Clínica";
        }
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Sidebar */}
            <Sidebar clinicName={clinicName} />

            {/* Main Content */}
            <div className="ml-64">
                <Topbar />
                <main className="p-6">{children}</main>
            </div>
        </div>
    );
}
