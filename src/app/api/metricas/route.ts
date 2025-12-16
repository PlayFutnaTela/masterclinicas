// API Route para métricas e analytics - Supabase Auth
import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { requireRole } from "@/lib/role-middleware";
import { getMetricsSummary, getMetricsOverTime, getDashboardCards } from "@/lib/metrics";
import { prisma } from "@/lib/db";

/**
 * GET /api/metricas
 * Obtém métricas agregadas para o dashboard
 */
export async function GET(request: NextRequest) {
    try {
        const supabase = await createServerSupabaseClient();
        const { data: { user }, error } = await supabase.auth.getUser();

        if (error || !user) {
            return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
        }

        // Buscar role do usuário no banco
        const userRecord = await prisma.user.findUnique({
            where: { id: user.id },
            select: { role: true },
        });

        if (!userRecord) {
            return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
        }

        const userRole = userRecord.role;

        // ===== ROLE VALIDATION: Apenas admin e operador podem ver métricas =====
        requireRole(userRole, "operador");

        // Determinar organização
        let organizationId: string;
        if (userRole === "super_admin") {
            const url = new URL(request.url);
            organizationId = url.searchParams.get("organizationId") || "";
            if (!organizationId) {
                return NextResponse.json(
                    { error: "Super admin deve especificar organizationId" },
                    { status: 400 }
                );
            }
        } else {
            // Admin/operador usa organização padrão
            const defaultOrg = await prisma.organization.findFirst({
                orderBy: { createdAt: "asc" },
                select: { id: true }
            });
            if (!defaultOrg) {
                return NextResponse.json(
                    { error: "Nenhuma organização encontrada" },
                    { status: 400 }
                );
            }
            organizationId = defaultOrg.id;
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

        // ===== MULTI-TENANT: Passar organizationId para funções de métrica =====
        // Retornar dados baseado no tipo solicitado
        switch (type) {
            case "summary":
                const summary = await getMetricsSummary(
                    user.id,
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
                    user.id,
                    startDate,
                    endDate,
                    eventType,
                    organizationId // ===== MULTI-TENANT: Passar organizationId =====
                );
                return NextResponse.json({ overtime });

            case "cards":
                const cards = await getDashboardCards(
                    user.id,
                    organizationId // ===== MULTI-TENANT: Passar organizationId =====
                );
                return NextResponse.json({ cards });

            default:
                // Retornar tudo
                const [allSummary, allOvertime, allCards] = await Promise.all([
                    getMetricsSummary(
                        user.id,
                        startDate,
                        endDate,
                        organizationId // ===== MULTI-TENANT: Passar organizationId =====
                    ),
                    getMetricsOverTime(
                        user.id,
                        startDate,
                        endDate,
                        undefined,
                        organizationId // ===== MULTI-TENANT: Passar organizationId =====
                    ),
                    getDashboardCards(
                        user.id,
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
        const msg = error instanceof Error ? error.message : String(error);
        const isDbDown = msg.includes("Can't reach database server") || msg.includes("PrismaClientInitializationError") || msg.includes('Environment variable not found');
        if (isDbDown) {
            return NextResponse.json(
                { error: "Banco de dados indisponível", details: msg },
                { status: 503 }
            );
        }
        return NextResponse.json(
            { error: "Erro interno do servidor", details: msg },
            { status: 500 }
        );
    }
}
