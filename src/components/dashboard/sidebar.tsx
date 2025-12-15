// Sidebar do Dashboard
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import {
    LayoutDashboard,
    Users,
    Calendar,
    BarChart3,
    Settings,
    LogOut,
    Sparkles,
    Building2,
} from "lucide-react";
import { signOut } from "next-auth/react";
import { ThemeToggleButton } from "./theme-toggle-button";

interface NavItem {
    label: string;
    href: string;
    icon: React.ReactNode;
}

const navItems: NavItem[] = [
    {
        label: "Visão Geral",
        href: "/dashboard",
        icon: <LayoutDashboard className="w-5 h-5" />,
    },
    {
        label: "Leads",
        href: "/leads",
        icon: <Users className="w-5 h-5" />,
    },
    {
        label: "Agendamentos",
        href: "/agendamentos",
        icon: <Calendar className="w-5 h-5" />,
    },
    {
        label: "Métricas",
        href: "/metricas",
        icon: <BarChart3 className="w-5 h-5" />,
    },
    {
        label: "Configurações",
        href: "/configuracoes",
        icon: <Settings className="w-5 h-5" />,
    },
    // ===== MULTI-TENANT: Menu de Clínicas =====
    {
        label: "Minhas Clínicas",
        href: "/organizacoes",
        icon: <Building2 className="w-5 h-5" />,
    },
];

interface SidebarProps {
    clinicName?: string;
}

export function Sidebar({ clinicName = "Clínica" }: SidebarProps) {
    const pathname = usePathname();
    const { data: session } = useSession();

    // ===== MULTI-TENANT: Verificar se é SUPER ADMIN =====
    const SUPER_ADMIN_EMAIL = process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAIL || "admin@masterclínicas.com";
    const isSuperAdmin = session?.user?.email === SUPER_ADMIN_EMAIL;

    return (
        <aside className="fixed left-0 top-0 z-40 h-screen w-64 bg-white border-r border-gray-200">
            {/* Logo / Marca */}
            <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-100">
                <div className="w-10 h-10 bg-gradient-to-br from-rose-500 to-rose-600 rounded-xl flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                    <h1 className="font-semibold text-gray-900 truncate">{clinicName}</h1>
                    <p className="text-xs text-gray-500">Painel Administrativo</p>
                </div>
            </div>

            {/* Navegação */}
            <nav className="px-3 py-4 space-y-1">
                {navItems.map((item) => {
                    // ===== MULTI-TENANT: Mostrar menu de clínicas apenas para SUPER ADMIN =====
                    if (item.href === "/organizacoes" && !isSuperAdmin) {
                        return null;
                    }

                    const isActive = pathname === item.href ||
                        (item.href !== "/dashboard" && pathname.startsWith(item.href));

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`
                flex items-center gap-3 px-3 py-2.5 rounded-lg
                transition-all duration-200
                ${isActive
                                    ? "bg-rose-50 text-rose-700 font-medium"
                                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                                }
              `}
                        >
                            {item.icon}
                            <span>{item.label}</span>
                        </Link>
                    );
                })}
            </nav>

            {/* Theme Toggle and Logout */}
            <div className="absolute bottom-0 left-0 right-0 p-3 border-t border-gray-100">
                <ThemeToggleButton />
                <button
                    onClick={() => signOut({ callbackUrl: "/login" })}
                    className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-all duration-200"
                >
                    <LogOut className="w-5 h-5" />
                    <span>Sair</span>
                </button>
            </div>
        </aside>
    );
}
