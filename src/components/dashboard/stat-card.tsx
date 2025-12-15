// Card de estatística para o dashboard
import { LucideIcon } from "lucide-react";

interface StatCardProps {
    title: string;
    value: string | number;
    description?: string;
    icon?: LucideIcon;
    iconSrc?: string;
    trend?: {
        value: number;
        isPositive: boolean;
    };
    color?: "rose" | "blue" | "green" | "purple" | "orange";
}

export function StatCard({
    title,
    value,
    description,
    icon: Icon,
    iconSrc,
    trend,
    color = "rose",
}: StatCardProps) {
    const colors = {
        rose: {
            bg: "bg-rose-50",
            icon: "text-rose-600",
            ring: "ring-rose-100",
        },
        blue: {
            bg: "bg-blue-50",
            icon: "text-blue-600",
            ring: "ring-blue-100",
        },
        green: {
            bg: "bg-green-50",
            icon: "text-green-600",
            ring: "ring-green-100",
        },
        purple: {
            bg: "bg-purple-50",
            icon: "text-purple-600",
            ring: "ring-purple-100",
        },
        orange: {
            bg: "bg-orange-50",
            icon: "text-orange-600",
            ring: "ring-orange-100",
        },
    };

    const colorClasses = colors[color];

    return (
        <div className="bg-white rounded-xl p-6 border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all duration-200">
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <p className="text-sm font-medium text-gray-500">{title}</p>
                    <p className="mt-2 text-3xl font-bold text-gray-900">{value}</p>
                    {description && (
                        <p className="mt-1 text-sm text-gray-500">{description}</p>
                    )}
                    {trend && (
                        <p
                            className={`mt-2 text-sm font-medium ${trend.isPositive ? "text-green-600" : "text-red-600"
                                }`}
                        >
                            {trend.isPositive ? "+" : "-"}{Math.abs(trend.value)}%{" "}
                            <span className="text-gray-500 font-normal">vs mês anterior</span>
                        </p>
                    )}
                </div>
                <div
                    className={`w-12 h-12 ${colorClasses.bg} rounded-xl flex items-center justify-center ring-8 ${colorClasses.ring}`}
                >
                    {iconSrc ? (
                        <img src={iconSrc} alt="" className="w-6 h-6" />
                    ) : Icon ? (
                        <Icon className={`w-6 h-6 ${colorClasses.icon}`} />
                    ) : null}
                </div>
            </div>
        </div>
    );
}
