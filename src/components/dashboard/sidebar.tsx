// Sidebar do Dashboard com Supabase Auth
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import {
    LogOut,
} from "lucide-react";
import { ThemeToggleButton } from "./theme-toggle-button";

interface NavItem {
    label: string;
    href: string;
    icon: string;
}

const navItems: NavItem[] = [
    {
        label: "Visão Geral",
        href: "/dashboard",
        icon: "/assets/Home/SVG/ic_fluent_home_48_color.svg",
    },
    {
        label: "Leads",
        href: "/leads",
        icon: "/assets/People/SVG/ic_fluent_people_48_color.svg",
    },
    {
        label: "Agendamentos",
        href: "/agendamentos",
        icon: "/assets/Calendar/SVG/ic_fluent_calendar_48_color.svg",
    },
    {
        label: "Métricas",
        href: "/metricas",
        icon: "/assets/Poll/SVG/ic_fluent_poll_32_color.svg",
    },
    {
        label: "Configurações",
        href: "/configuracoes",
        icon: "/assets/Settings/SVG/ic_fluent_settings_48_color.svg",
    },
    // ===== MULTI-TENANT: Menu de Clínicas =====
    {
        label: "Minhas Clínicas",
        href: "/organizacoes",
        icon: "/assets/Building/SVG/ic_fluent_building_48_color.svg",
    },
];

interface SidebarProps {
    clinicName?: string;
}

export function Sidebar({ clinicName = "Clínica" }: SidebarProps) {
    const pathname = usePathname();
    const supabase = createClient();
    const [userRole, setUserRole] = useState<string | null>(null);

    useEffect(() => {
        const getUserRole = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data } = await supabase
                    .from('users')
                    .select('role')
                    .eq('id', user.id)
                    .single();
                setUserRole(data?.role || null);
            }
        };
        getUserRole();
    }, []);

    // ===== MULTI-TENANT: Verificar se é SUPER ADMIN =====
    const isSuperAdmin = userRole === "super_admin";

    const handleLogout = async () => {
        await supabase.auth.signOut();
        window.location.href = "/login";
    };

    return (
        <aside className="fixed left-0 top-0 z-40 h-screen w-52 bg-white border-r border-gray-200">
            {/* Logo / Marca */}
            <div className="flex items-center gap-3 px-4 py-4 border-b border-gray-100">
                <div className="w-10 h-10 rounded-xl overflow-hidden flex items-center justify-center flex-shrink-0">
                    <img src="/logo2-masterclinicas.png" alt="MasterClínicas" className="w-full h-full object-contain" />
                </div>
                <div className="min-w-0">
                    <h1 className="font-semibold text-gray-900 truncate text-sm">{clinicName}</h1>
                    <p className="text-xs text-gray-500 truncate">Painel Administrativo</p>
                </div>
            </div>

            {/* Navegação */}
            <nav className="px-2 py-3 space-y-0.5">
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
                flex items-center gap-2 px-3 py-2 rounded-lg
                transition-all duration-200
                ${isActive
                                    ? "bg-rose-50 text-rose-700 font-medium"
                                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                                }
              `}
                        >
                            <img src={item.icon} alt="" className="w-5 h-5 flex-shrink-0" />
                            <span className="text-sm truncate">{item.label}</span>
                        </Link>
                    );
                })}
            </nav>

            {/* Theme Toggle and Logout */}
            <div className="absolute bottom-0 left-0 right-0 p-2 border-t border-gray-100 space-y-1">
                <ThemeToggleButton />
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-all duration-200"
                >
                    <LogOut className="w-5 h-5 flex-shrink-0" />
                    <span className="text-sm">Sair</span>
                </button>
            </div>
        </aside>
    );
}
