// Página de Agendamentos
"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge, getAppointmentStatusBadge } from "@/components/ui/badge";
import { Calendar, Clock, User, ChevronLeft, ChevronRight, Filter } from "lucide-react";

interface Appointment {
    id: string;
    scheduledAt: string;
    status: string;
    notes?: string;
    lead: {
        id: string;
        name: string;
        phone: string;
        procedure: string;
    };
}

export default function AgendamentosPage() {
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
    const [isLoading, setIsLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState<string>("");

    const fetchAppointments = useCallback(async (page = 1) => {
        setIsLoading(true);
        try {
            const params = new URLSearchParams({ page: String(page), limit: "10" });
            if (statusFilter) params.append("status", statusFilter);

            const res = await fetch(`/api/agendamentos?${params}`);
            const data = await res.json();

            setAppointments(data.appointments || []);
            setPagination(data.pagination || { page: 1, totalPages: 1, total: 0 });
        } catch (error) {
            console.error("Erro ao carregar agendamentos:", error);
        } finally {
            setIsLoading(false);
        }
    }, [statusFilter]);

    useEffect(() => {
        fetchAppointments();
    }, [fetchAppointments]);

    const handleStatusChange = async (id: string, status: string) => {
        try {
            await fetch("/api/agendamentos", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id, status }),
            });
            fetchAppointments(pagination.page);
        } catch (error) {
            console.error("Erro ao atualizar status:", error);
        }
    };

    const statusOptions = [
        { value: "", label: "Todos os status" },
        { value: "agendado", label: "Agendados" },
        { value: "confirmado", label: "Confirmados" },
        { value: "realizado", label: "Realizados" },
        { value: "cancelado", label: "Cancelados" },
        { value: "no_show", label: "Não compareceram" },
    ];

    const formatDateTime = (dateStr: string) => {
        const date = new Date(dateStr);
        return {
            date: date.toLocaleDateString("pt-BR"),
            time: date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
        };
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Agendamentos</h1>
                    <p className="text-gray-500 mt-1">Gerencie suas consultas</p>
                </div>
            </div>

            {/* Filter */}
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

            {/* Appointments List */}
            {isLoading ? (
                <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                    <div className="animate-spin w-8 h-8 border-4 border-rose-500 border-t-transparent rounded-full mx-auto" />
                    <p className="mt-4 text-gray-500">Carregando agendamentos...</p>
                </div>
            ) : appointments.length === 0 ? (
                <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                    <Calendar className="w-12 h-12 text-gray-300 mx-auto" />
                    <p className="mt-4 text-gray-500">Nenhum agendamento encontrado</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {appointments.map((appointment) => {
                        const { date, time } = formatDateTime(appointment.scheduledAt);
                        const statusBadge = getAppointmentStatusBadge(appointment.status);

                        return (
                            <div
                                key={appointment.id}
                                className="bg-white rounded-xl border border-gray-200 p-6 hover:border-gray-300 transition-colors"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex gap-6">
                                        {/* Date/Time */}
                                        <div className="text-center">
                                            <div className="w-16 h-16 bg-rose-50 rounded-xl flex flex-col items-center justify-center">
                                                <Calendar className="w-5 h-5 text-rose-600" />
                                                <p className="text-xs font-medium text-rose-600 mt-1">{date}</p>
                                            </div>
                                            <div className="flex items-center gap-1 mt-2 text-gray-500">
                                                <Clock className="w-3 h-3" />
                                                <span className="text-sm">{time}</span>
                                            </div>
                                        </div>

                                        {/* Client Info */}
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <User className="w-4 h-4 text-gray-400" />
                                                <h3 className="font-semibold text-gray-900">
                                                    {appointment.lead.name}
                                                </h3>
                                            </div>
                                            <p className="text-sm text-gray-500 mt-1">
                                                {appointment.lead.phone}
                                            </p>
                                            <p className="text-sm text-gray-600 mt-1">
                                                {appointment.lead.procedure || "Procedimento não especificado"}
                                            </p>
                                            {appointment.notes && (
                                                <p className="text-sm text-gray-400 mt-2 italic">
                                                    {appointment.notes}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Status & Actions */}
                                    <div className="text-right">
                                        <Badge variant={statusBadge.variant}>{statusBadge.label}</Badge>
                                        <div className="mt-4 flex gap-2">
                                            {appointment.status === "agendado" && (
                                                <>
                                                    <Button
                                                        size="sm"
                                                        variant="secondary"
                                                        onClick={() => handleStatusChange(appointment.id, "confirmado")}
                                                    >
                                                        Confirmar
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={() => handleStatusChange(appointment.id, "cancelado")}
                                                    >
                                                        Cancelar
                                                    </Button>
                                                </>
                                            )}
                                            {appointment.status === "confirmado" && (
                                                <>
                                                    <Button
                                                        size="sm"
                                                        onClick={() => handleStatusChange(appointment.id, "realizado")}
                                                    >
                                                        Realizado
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="danger"
                                                        onClick={() => handleStatusChange(appointment.id, "no_show")}
                                                    >
                                                        Não veio
                                                    </Button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}

                    {/* Pagination */}
                    {pagination.totalPages > 1 && (
                        <div className="flex items-center justify-between pt-4">
                            <p className="text-sm text-gray-500">
                                Página {pagination.page} de {pagination.totalPages}
                            </p>
                            <div className="flex gap-2">
                                <Button
                                    variant="secondary"
                                    size="sm"
                                    onClick={() => fetchAppointments(pagination.page - 1)}
                                    disabled={pagination.page === 1}
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                </Button>
                                <Button
                                    variant="secondary"
                                    size="sm"
                                    onClick={() => fetchAppointments(pagination.page + 1)}
                                    disabled={pagination.page === pagination.totalPages}
                                >
                                    <ChevronRight className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
