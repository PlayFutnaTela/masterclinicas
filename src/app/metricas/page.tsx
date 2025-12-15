// Página de Métricas
"use client";

import { useState, useEffect } from "react";
import { MetricsChart } from "@/components/charts/metrics-chart";
import { BarChartCard } from "@/components/charts/bar-chart";
import { StatCard } from "@/components/dashboard/stat-card";

interface MetricsSummary {
    leadsReceived: number;
    qualified: number;
    scheduled: number;
    noShow: number;
    conversions: number;
}

export default function MetricasPage() {
    const [period, setPeriod] = useState("30d");
    const [summary, setSummary] = useState<MetricsSummary | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Dados de exemplo para os gráficos
    const chartData = [
        { date: "Seg", leads: 4, qualificados: 2, agendamentos: 1 },
        { date: "Ter", leads: 6, qualificados: 3, agendamentos: 2 },
        { date: "Qua", leads: 8, qualificados: 4, agendamentos: 3 },
        { date: "Qui", leads: 5, qualificados: 2, agendamentos: 2 },
        { date: "Sex", leads: 9, qualificados: 5, agendamentos: 4 },
        { date: "Sáb", leads: 3, qualificados: 1, agendamentos: 1 },
        { date: "Dom", leads: 1, qualificados: 0, agendamentos: 0 },
    ];

    const barData = [
        { name: "Novos", value: 45 },
        { name: "Qualificados", value: 28 },
        { name: "Agendados", value: 18 },
        { name: "Perdidos", value: 9 },
    ];

    const sourceData = [
        { name: "Instagram", value: 35 },
        { name: "WhatsApp", value: 25 },
        { name: "Google", value: 20 },
        { name: "Indicação", value: 15 },
        { name: "Outros", value: 5 },
    ];

    useEffect(() => {
        const fetchMetrics = async () => {
            setIsLoading(true);
            try {
                const res = await fetch(`/api/metricas?period=${period}&type=summary`);
                const data = await res.json();
                setSummary(data.summary);
            } catch (error) {
                console.error("Erro ao carregar métricas:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchMetrics();
    }, [period]);

    const periods = [
        { value: "7d", label: "7 dias" },
        { value: "30d", label: "30 dias" },
        { value: "90d", label: "90 dias" },
        { value: "365d", label: "1 ano" },
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Métricas</h1>
                    <p className="text-gray-500 mt-1">Analise o desempenho da sua clínica</p>
                </div>
                <div className="flex gap-2">
                    {periods.map((p) => (
                        <button
                            key={p.value}
                            onClick={() => setPeriod(p.value)}
                            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${period === p.value
                                    ? "bg-rose-600 text-white"
                                    : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                                }`}
                        >
                            {p.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Summary Cards */}
            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="bg-white rounded-xl p-6 border border-gray-200 animate-pulse">
                            <div className="h-4 bg-gray-200 rounded w-24 mb-4" />
                            <div className="h-8 bg-gray-200 rounded w-16" />
                        </div>
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard
                        title="Leads Recebidos"
                        value={summary?.leadsReceived || 0}
                        iconSrc="/assets/People/SVG/ic_fluent_people_48_color.svg"
                        color="rose"
                    />
                    <StatCard
                        title="Taxa de Qualificação"
                        value={summary?.leadsReceived
                            ? `${Math.round((summary.qualified / summary.leadsReceived) * 100)}%`
                            : "0%"}
                        iconSrc="/assets/Data Bar Vertical Ascending/SVG/ic_fluent_data_bar_vertical_ascending_24_color.svg"
                        color="purple"
                    />
                    <StatCard
                        title="Agendamentos"
                        value={summary?.scheduled || 0}
                        iconSrc="/assets/Calendar/SVG/ic_fluent_calendar_48_color.svg"
                        color="blue"
                    />
                    <StatCard
                        title="Conversões"
                        value={summary?.conversions || 0}
                        iconSrc="/assets/Chat/SVG/ic_fluent_chat_48_color.svg"
                        color="green"
                    />
                </div>
            )}

            {/* Charts */}
            <div className="grid lg:grid-cols-2 gap-6">
                <MetricsChart data={chartData} title="Evolução de Leads" />
                <BarChartCard data={barData} title="Leads por Status" color="#f43f5e" />
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
                <BarChartCard data={sourceData} title="Leads por Origem" color="#8b5cf6" />
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Resumo do Período</h3>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center py-3 border-b border-gray-100">
                            <span className="text-gray-600">Total de leads</span>
                            <span className="font-semibold">{summary?.leadsReceived || 0}</span>
                        </div>
                        <div className="flex justify-between items-center py-3 border-b border-gray-100">
                            <span className="text-gray-600">Leads qualificados</span>
                            <span className="font-semibold">{summary?.qualified || 0}</span>
                        </div>
                        <div className="flex justify-between items-center py-3 border-b border-gray-100">
                            <span className="text-gray-600">Consultas agendadas</span>
                            <span className="font-semibold">{summary?.scheduled || 0}</span>
                        </div>
                        <div className="flex justify-between items-center py-3 border-b border-gray-100">
                            <span className="text-gray-600">No-shows</span>
                            <span className="font-semibold text-red-600">{summary?.noShow || 0}</span>
                        </div>
                        <div className="flex justify-between items-center py-3">
                            <span className="text-gray-600">Conversões</span>
                            <span className="font-semibold text-green-600">{summary?.conversions || 0}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
