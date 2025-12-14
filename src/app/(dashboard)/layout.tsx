// Layout do Dashboard
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { SessionProvider } from "next-auth/react";
import { Sidebar } from "@/components/dashboard/sidebar";
import { Topbar } from "@/components/dashboard/topbar";

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await auth();

    if (!session) {
        redirect("/login");
    }

    return (
        <SessionProvider session={session}>
            <div className="min-h-screen bg-gray-50">
                {/* Sidebar */}
                <Sidebar clinicName={session.user.clinicName || "Minha Clínica"} />

                {/* Main Content */}
                <div className="ml-64">
                    <Topbar />
                    <main className="p-6">{children}</main>
                </div>
            </div>
        </SessionProvider>
    );
}
