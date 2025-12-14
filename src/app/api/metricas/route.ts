// API Route para métricas e analytics
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
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

        // Retornar dados baseado no tipo solicitado
        switch (type) {
            case "summary":
                const summary = await getMetricsSummary(session.user.id, startDate, endDate);
                return NextResponse.json({ summary });

            case "overtime":
                const eventType = searchParams.get("eventType") as
                    "lead_received" | "qualified" | "scheduled" | "no_show" | "follow_up" | "conversion" | undefined;
                const overtime = await getMetricsOverTime(session.user.id, startDate, endDate, eventType);
                return NextResponse.json({ overtime });

            case "cards":
                const cards = await getDashboardCards(session.user.id);
                return NextResponse.json({ cards });

            default:
                // Retornar tudo
                const [allSummary, allOvertime, allCards] = await Promise.all([
                    getMetricsSummary(session.user.id, startDate, endDate),
                    getMetricsOverTime(session.user.id, startDate, endDate),
                    getDashboardCards(session.user.id),
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
