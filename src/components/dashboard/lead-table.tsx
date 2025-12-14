// Tabela de Leads
"use client";

import { useState } from "react";
import { Badge, getLeadStatusBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, MoreVertical, Phone } from "lucide-react";

interface Lead {
    id: string;
    name: string;
    phone: string;
    procedure: string;
    status: string;
    source?: string;
    createdAt: string;
}

interface LeadTableProps {
    leads: Lead[];
    pagination: {
        page: number;
        totalPages: number;
        total: number;
    };
    onPageChange: (page: number) => void;
    onStatusChange?: (id: string, status: string) => void;
}

export function LeadTable({
    leads,
    pagination,
    onPageChange,
    onStatusChange,
}: LeadTableProps) {
    const [openMenu, setOpenMenu] = useState<string | null>(null);

    const statusOptions = ["novo", "qualificado", "agendado", "perdido"];

    return (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Lead
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Telefone
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Procedimento
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Status
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Data
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Ações
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {leads.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                    Nenhum lead encontrado
                                </td>
                            </tr>
                        ) : (
                            leads.map((lead) => {
                                const statusBadge = getLeadStatusBadge(lead.status);
                                return (
                                    <tr key={lead.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div>
                                                <p className="font-medium text-gray-900">{lead.name}</p>
                                                {lead.source && (
                                                    <p className="text-xs text-gray-500">{lead.source}</p>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <a
                                                href={`tel:${lead.phone}`}
                                                className="inline-flex items-center gap-1.5 text-gray-600 hover:text-rose-600 transition-colors"
                                            >
                                                <Phone className="w-4 h-4" />
                                                {lead.phone}
                                            </a>
                                        </td>
                                        <td className="px-6 py-4 text-gray-600">
                                            {lead.procedure || "-"}
                                        </td>
                                        <td className="px-6 py-4">
                                            <Badge variant={statusBadge.variant}>
                                                {statusBadge.label}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {new Date(lead.createdAt).toLocaleDateString("pt-BR")}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="relative">
                                                <button
                                                    onClick={() =>
                                                        setOpenMenu(openMenu === lead.id ? null : lead.id)
                                                    }
                                                    className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                                                >
                                                    <MoreVertical className="w-5 h-5" />
                                                </button>
                                                {openMenu === lead.id && (
                                                    <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                                                        {statusOptions.map((status) => (
                                                            <button
                                                                key={status}
                                                                onClick={() => {
                                                                    onStatusChange?.(lead.id, status);
                                                                    setOpenMenu(null);
                                                                }}
                                                                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                                                            >
                                                                Marcar como {getLeadStatusBadge(status).label}
                                                            </button>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
                    <p className="text-sm text-gray-500">
                        Página {pagination.page} de {pagination.totalPages} ({pagination.total} leads)
                    </p>
                    <div className="flex gap-2">
                        <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => onPageChange(pagination.page - 1)}
                            disabled={pagination.page === 1}
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </Button>
                        <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => onPageChange(pagination.page + 1)}
                            disabled={pagination.page === pagination.totalPages}
                        >
                            <ChevronRight className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
