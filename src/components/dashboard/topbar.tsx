// Topbar do Dashboard
"use client";

import { useEffect, useState } from "react";
import { Bell, Search } from "lucide-react";
import { createClient } from "@/lib/supabase";
import { OrganizationSelector } from "./organization-selector";

export function Topbar() {
    const supabase = createClient();
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);
        };
        getUser();
    }, [supabase]);

    return (
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
            {/* Organization Selector + Search */}
            <div className="flex items-center gap-4 flex-1">
                {/* ===== MULTI-TENANT: Seletor de Clínica ===== */}
                <OrganizationSelector />
                
            <div className="flex-1 max-w-md">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Buscar leads, agendamentos..."
                        className="w-full pl-10 pr-4 py-2 text-sm text-rose-600 placeholder:text-rose-600 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                    />
                </div>
            </div>
            </div>

            {/* Right side */}
            <div className="flex items-center gap-4">
                {/* Notifications */}
                <button className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full" />
                </button>

                {/* User */}
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-gradient-to-br from-rose-400 to-rose-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-medium">
                            {user?.user_metadata?.name?.charAt(0).toUpperCase() || "U"}
                        </span>
                    </div>
                    <div className="hidden sm:block">
                        <p className="text-sm font-medium text-gray-900">
                            {user?.user_metadata?.name || "Usuário"}
                        </p>
                        <p className="text-xs text-gray-500">Administrador</p>
                    </div>
                </div>
            </div>
        </header>
    );
}
