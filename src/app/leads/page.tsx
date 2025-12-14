// Página de Leads
"use client";

import { useState, useEffect, useCallback } from "react";
import { LeadTable } from "@/components/dashboard/lead-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Filter } from "lucide-react";

interface Lead {
    id: string;
    name: string;
    phone: string;
    procedure: string;
    status: string;
    source?: string;
    createdAt: string;
}

interface Pagination {
    page: number;
    totalPages: number;
    total: number;
}

export default function LeadsPage() {
    const [leads, setLeads] = useState<Lead[]>([]);
    const [pagination, setPagination] = useState<Pagination>({
        page: 1,
        totalPages: 1,
        total: 0,
    });
    const [isLoading, setIsLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState<string>("");
    const [search, setSearch] = useState("");

    const fetchLeads = useCallback(async (page = 1) => {
        setIsLoading(true);
        try {
            const params = new URLSearchParams({ page: String(page), limit: "10" });
            if (statusFilter) params.append("status", statusFilter);
            if (search) params.append("search", search);

            const res = await fetch(`/api/leads?${params}`);
            const data = await res.json();

            setLeads(data.leads || []);
            setPagination(data.pagination || { page: 1, totalPages: 1, total: 0 });
        } catch (error) {
            console.error("Erro ao carregar leads:", error);
        } finally {
            setIsLoading(false);
        }
    }, [statusFilter, search]);

    useEffect(() => {
        fetchLeads();
    }, [fetchLeads]);

    const handleStatusChange = async (id: string, status: string) => {
        try {
            await fetch("/api/leads", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id, status }),
            });
            fetchLeads(pagination.page);
        } catch (error) {
            console.error("Erro ao atualizar status:", error);
        }
    };

    const statusOptions = [
        { value: "", label: "Todos os status" },
        { value: "novo", label: "Novos" },
        { value: "qualificado", label: "Qualificados" },
        { value: "agendado", label: "Agendados" },
        { value: "perdido", label: "Perdidos" },
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Leads</h1>
                    <p className="text-gray-500 mt-1">
                        Gerencie seus potenciais clientes
                    </p>
                </div>
                <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Novo Lead
                </Button>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-4">
                <div className="flex-1 min-w-64">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                            placeholder="Buscar por nome ou telefone..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-gray-400" />
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
                    >
                        {statusOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Table */}
            {isLoading ? (
                <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                    <div className="animate-spin w-8 h-8 border-4 border-rose-500 border-t-transparent rounded-full mx-auto" />
                    <p className="mt-4 text-gray-500">Carregando leads...</p>
                </div>
            ) : (
                <LeadTable
                    leads={leads}
                    pagination={pagination}
                    onPageChange={(page) => fetchLeads(page)}
                    onStatusChange={handleStatusChange}
                />
            )}
        </div>
    );
}
