// Componente Badge para status
import { HTMLAttributes, forwardRef } from "react";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
    variant?: "default" | "success" | "warning" | "danger" | "info";
}

const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
    ({ className = "", variant = "default", children, ...props }, ref) => {
        const variants = {
            default: "bg-secondary text-secondary-foreground",
            success: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200",
            warning: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-200",
            danger: "bg-destructive text-destructive-foreground",
            info: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200",
        };

        return (
            <span
                ref={ref}
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variants[variant]} ${className}`}
                {...props}
            >
                {children}
            </span>
        );
    }
);

Badge.displayName = "Badge";

// Helper para mapear status de lead
export const getLeadStatusBadge = (status: string) => {
    const statusMap: Record<string, { variant: BadgeProps["variant"]; label: string }> = {
        novo: { variant: "info", label: "Novo" },
        qualificado: { variant: "success", label: "Qualificado" },
        agendado: { variant: "warning", label: "Agendado" },
        perdido: { variant: "danger", label: "Perdido" },
    };
    return statusMap[status] || { variant: "default", label: status };
};

// Helper para mapear status de agendamento
export const getAppointmentStatusBadge = (status: string) => {
    const statusMap: Record<string, { variant: BadgeProps["variant"]; label: string }> = {
        agendado: { variant: "warning", label: "Agendado" },
        confirmado: { variant: "info", label: "Confirmado" },
        realizado: { variant: "success", label: "Realizado" },
        cancelado: { variant: "danger", label: "Cancelado" },
        no_show: { variant: "danger", label: "Não compareceu" },
    };
    return statusMap[status] || { variant: "default", label: status };
};

export { Badge };
