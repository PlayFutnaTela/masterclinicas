// Layout do Dashboard
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

    if (!session || !session.user.organizationId) {
        redirect("/login");
    }

    // ===== MULTI-TENANT: Buscar nome da organização =====
    const organization = await db.organization.findUnique({
        where: { id: session.user.organizationId },
        select: { name: true },
    });

    const clinicName = organization?.name || "Minha Clínica";

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
