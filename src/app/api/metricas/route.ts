// API Route para métricas e analytics - Multi-Tenant
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { validateUserOrganization } from "@/lib/org-middleware";
import { getMetricsSummary, getMetricsOverTime, getDashboardCards } from "@/lib/metrics";

/**
 * GET /api/metricas
 * Obtém métricas agregadas para o dashboard
 */
export async function GET(request: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
        }

        // ===== MULTI-TENANT: Validar organização do usuário =====
        const organizationId = session.user.organizationId;
        if (!organizationId) {
            return NextResponse.json(
                { error: "Organização não encontrada na sessão" },
                { status: 400 }
            );
        }

        await validateUserOrganization(session.user.id, organizationId);
        // ===== FIM VALIDAÇÃO MULTI-TENANT =====

        const { searchParams } = new URL(request.url);
        const period = searchParams.get("period") || "30d"; // 7d, 30d, 90d, 365d
        const type = searchParams.get("type"); // summary, overtime, cards

        // Calcular datas baseado no período
        const endDate = new Date();
        const startDate = new Date();

        switch (period) {
            case "7d":
                startDate.setDate(endDate.getDate() - 7);
                break;
            case "30d":
                startDate.setDate(endDate.getDate() - 30);
                break;
            case "90d":
                startDate.setDate(endDate.getDate() - 90);
                break;
            case "365d":
                startDate.setDate(endDate.getDate() - 365);
                break;
            default:
                startDate.setDate(endDate.getDate() - 30);
        }

        // ===== MULTI-TENANT: Passar organizationId para funções de métrica =====
        // Retornar dados baseado no tipo solicitado
        switch (type) {
            case "summary":
                const summary = await getMetricsSummary(
                    session.user.id,
                    startDate,
                    endDate,
                    organizationId // ===== MULTI-TENANT: Passar organizationId =====
                );
                return NextResponse.json({ summary });

            case "overtime":
                const eventType = searchParams.get("eventType") as
                    | "lead_received"
                    | "qualified"
                    | "scheduled"
                    | "no_show"
                    | "follow_up"
                    | "conversion"
                    | undefined;
                const overtime = await getMetricsOverTime(
                    session.user.id,
                    startDate,
                    endDate,
                    eventType,
                    organizationId // ===== MULTI-TENANT: Passar organizationId =====
                );
                return NextResponse.json({ overtime });

            case "cards":
                const cards = await getDashboardCards(
                    session.user.id,
                    organizationId // ===== MULTI-TENANT: Passar organizationId =====
                );
                return NextResponse.json({ cards });

            default:
                // Retornar tudo
                const [allSummary, allOvertime, allCards] = await Promise.all([
                    getMetricsSummary(
                        session.user.id,
                        startDate,
                        endDate,
                        organizationId // ===== MULTI-TENANT: Passar organizationId =====
                    ),
                    getMetricsOverTime(
                        session.user.id,
                        startDate,
                        endDate,
                        undefined,
                        organizationId // ===== MULTI-TENANT: Passar organizationId =====
                    ),
                    getDashboardCards(
                        session.user.id,
                        organizationId // ===== MULTI-TENANT: Passar organizationId =====
                    ),
                ]);

                return NextResponse.json({
                    summary: allSummary,
                    overtime: allOvertime,
                    cards: allCards,
                    period: { start: startDate.toISOString(), end: endDate.toISOString() },
                });
        }
    } catch (error) {
        console.error("[API METRICAS] Erro:", error);
        return NextResponse.json(
            { error: "Erro interno do servidor" },
            { status: 500 }
        );
    }
}
