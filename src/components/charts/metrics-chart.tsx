// Gráfico de linha para evolução de métricas
"use client";

import React from "react";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
} from "recharts";

interface DataPoint {
    date: string;
    leads?: number;
    qualificados?: number;
    agendamentos?: number;
    [key: string]: string | number | undefined;
}

interface MetricsChartProps {
    data: DataPoint[];
    title?: string;
    lines?: Array<{
        key: string;
        name: string;
        color: string;
    }>;
}

const defaultLines = [
    { key: "leads", name: "Leads", color: "#f43f5e" },
    { key: "qualificados", name: "Qualificados", color: "#8b5cf6" },
    { key: "agendamentos", name: "Agendamentos", color: "#10b981" },
];

export function MetricsChart({
    data,
    title = "Evolução",
    lines = defaultLines,
}: MetricsChartProps) {
    const [isClient, setIsClient] = React.useState(false);

    React.useEffect(() => {
        setIsClient(true);
    }, []);

    if (!isClient) {
        return (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
                <div className="h-80 bg-gray-50 rounded-lg animate-pulse" />
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
            <div className="h-80 w-full" style={{ minHeight: "20rem" }}>
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis
                            dataKey="date"
                            stroke="#94a3b8"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                        />
                        <YAxis
                            stroke="#94a3b8"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: "white",
                                border: "1px solid #e2e8f0",
                                borderRadius: "0.5rem",
                                boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                            }}
                        />
                        <Legend />
                        {lines.map((line) => (
                            <Line
                                key={line.key}
                                type="monotone"
                                dataKey={line.key}
                                name={line.name}
                                stroke={line.color}
                                strokeWidth={2}
                                dot={false}
                                activeDot={{ r: 4, strokeWidth: 0 }}
                            />
                        ))}
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
