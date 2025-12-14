// API Client para comunicação com n8n
// Next.js envia eventos simples, não executa lógica

interface N8nEvent {
    type: string;
    data: Record<string, unknown>;
    timestamp?: string;
}

interface N8nClientConfig {
    webhookUrl: string;
    apiKey?: string;
}

export class N8nApiClient {
    private webhookUrl: string;
    private apiKey?: string;

    constructor(config: N8nClientConfig) {
        this.webhookUrl = config.webhookUrl;
        this.apiKey = config.apiKey;
    }

    /**
     * Envia evento para o n8n
     * Usado para notificar ações manuais do dashboard
     */
    async sendEvent(event: N8nEvent): Promise<boolean> {
        try {
            const response = await fetch(this.webhookUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...(this.apiKey && { Authorization: `Bearer ${this.apiKey}` }),
                },
                body: JSON.stringify({
                    ...event,
                    timestamp: event.timestamp || new Date().toISOString(),
                }),
            });

            if (!response.ok) {
                console.error(`[N8N] Erro ao enviar evento: ${response.status}`);
                return false;
            }

            return true;
        } catch (error) {
            console.error("[N8N] Erro de conexão:", error);
            return false;
        }
    }

    /**
     * Notifica atualização de status de lead
     */
    async notifyLeadStatusUpdate(leadId: string, newStatus: string, userId: string) {
        return this.sendEvent({
            type: "lead_status_update",
            data: { leadId, newStatus, userId },
        });
    }

    /**
     * Solicita reprocessamento de lead
     */
    async requestLeadReprocess(leadId: string, userId: string) {
        return this.sendEvent({
            type: "lead_reprocess",
            data: { leadId, userId },
        });
    }

    /**
     * Notifica criação manual de agendamento
     */
    async notifyAppointmentCreated(appointmentId: string, leadId: string, userId: string) {
        return this.sendEvent({
            type: "appointment_created",
            data: { appointmentId, leadId, userId },
        });
    }
}

/**
 * Cria instância do cliente N8N para um usuário
 */
export function createN8nClient(webhookUrl: string, apiKey?: string): N8nApiClient | null {
    if (!webhookUrl) {
        console.warn("[N8N] URL do webhook não configurada");
        return null;
    }
    return new N8nApiClient({ webhookUrl, apiKey });
}
