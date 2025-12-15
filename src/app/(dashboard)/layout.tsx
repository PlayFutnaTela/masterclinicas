// Layout do Dashboard - Simplified Roles
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { SessionProvider } from "next-auth/react";
import { Sidebar } from "@/components/dashboard/sidebar";
import { Topbar } from "@/components/dashboard/topbar";
import { db } from "@/lib/db";

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await auth();

    if (!session) {
        redirect("/login");
    }

    // Determinar organização para exibir no layout
    let clinicName = "MasterClínicas";
    if (session.user.role !== "super_admin") {
        // Para usuários normais, buscar organização padrão
        const organization = await db.organization.findFirst({
            orderBy: { createdAt: "asc" },
            select: { name: true },
        });
        clinicName = organization?.name || "Minha Clínica";
    }

    return (
        <SessionProvider session={session}>
            <div className="min-h-screen bg-gray-50">
                {/* Sidebar */}
                <Sidebar clinicName={clinicName} />

                {/* Main Content */}
                <div className="ml-64">
                    <Topbar />
                    <main className="p-6">{children}</main>
                </div>
            </div>
        </SessionProvider>
    );
}
