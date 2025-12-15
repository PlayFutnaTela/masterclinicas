// Página de Configurações - Supabase Auth
"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Save, Copy, RefreshCw, Check, ExternalLink } from "lucide-react";

export default function ConfiguracoesPage() {
    const supabase = createClient();
    const [user, setUser] = useState<any>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [copied, setCopied] = useState<string | null>(null);

    const [settings, setSettings] = useState({
        clinicName: "",
        whatsappLink: "",
        webhookUrl: "",
        apiKey: "",
    });

    // Get user
    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);
        };
        getUser();
    }, [supabase]);

    useEffect(() => {
        // Carregar configurações do usuário
        if (user) {
            setSettings({
                clinicName: "",
                whatsappLink: "",
                webhookUrl: "",
                apiKey: "",
            });
        }
    }, [user]);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            // TODO: Implementar API de atualização de configurações
            await new Promise((resolve) => setTimeout(resolve, 1000));
            alert("Configurações salvas com sucesso!");
        } catch (error) {
            console.error("Erro ao salvar:", error);
        } finally {
            setIsSaving(false);
        }
    };

    const copyToClipboard = (text: string, key: string) => {
        navigator.clipboard.writeText(text);
        setCopied(key);
        setTimeout(() => setCopied(null), 2000);
    };

    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const generateNewApiKey = () => {
        const newKey = `sk_${crypto.randomUUID().replace(/-/g, "").substring(0, 32)}`;
        setSettings({ ...settings, apiKey: newKey });
    };

    // URL do webhook para configurar no n8n
    const webhookEndpoint = mounted && typeof window !== "undefined"
        ? `${window.location.origin}/api/webhooks/n8n`
        : `http://localhost:3000/api/webhooks/n8n`;

    return (
        <div className="space-y-6 max-w-3xl">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Configurações</h1>
                <p className="text-gray-500 mt-1">Gerencie as configurações da sua clínica</p>
            </div>

            {/* Clinic Info */}
            <Card variant="bordered">
                <CardHeader>
                    <CardTitle>Informações da Clínica</CardTitle>
                    <CardDescription>Dados exibidos na página pública</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Input
                        label="Nome da Clínica"
                        value={settings.clinicName}
                        onChange={(e) => setSettings({ ...settings, clinicName: e.target.value })}
                        placeholder="Ex: Clínica Beleza & Estética"
                    />
                    <Input
                        label="Link do WhatsApp"
                        value={settings.whatsappLink}
                        onChange={(e) => setSettings({ ...settings, whatsappLink: e.target.value })}
                        placeholder="https://wa.me/5511999999999"
                        helperText="Link para o botão de WhatsApp na página pública"
                    />
                </CardContent>
            </Card>

            {/* Integration */}
            <Card variant="bordered">
                <CardHeader>
                    <CardTitle>Integração n8n</CardTitle>
                    <CardDescription>Configure a comunicação com suas automações</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Webhook URL (para n8n chamar) */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            URL do Webhook (para configurar no n8n)
                        </label>
                        <div className="flex gap-2">
                            <Input
                                value={webhookEndpoint}
                                readOnly
                                className="bg-gray-50"
                            />
                            <Button
                                variant="secondary"
                                onClick={() => copyToClipboard(webhookEndpoint, "webhook")}
                            >
                                {copied === "webhook" ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                            </Button>
                        </div>
                        <p className="mt-1.5 text-sm text-gray-500">
                            Configure este endpoint no seu fluxo n8n para enviar leads
                        </p>
                    </div>

                    {/* API Key */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Chave de API
                        </label>
                        <div className="flex gap-2">
                            <Input
                                value={settings.apiKey || "Nenhuma chave gerada"}
                                readOnly
                                className="bg-gray-50 font-mono text-sm"
                            />
                            <Button
                                variant="secondary"
                                onClick={() => copyToClipboard(settings.apiKey, "apiKey")}
                                disabled={!settings.apiKey}
                            >
                                {copied === "apiKey" ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                            </Button>
                            <Button variant="secondary" onClick={generateNewApiKey}>
                                <RefreshCw className="w-4 h-4" />
                            </Button>
                        </div>
                        <p className="mt-1.5 text-sm text-gray-500">
                            Inclua esta chave no campo apiKey ao chamar o webhook
                        </p>
                    </div>

                    {/* n8n Webhook URL (para Next chamar) */}
                    <Input
                        label="URL do Webhook do n8n (opcional)"
                        value={settings.webhookUrl}
                        onChange={(e) => setSettings({ ...settings, webhookUrl: e.target.value })}
                        placeholder="https://n8n.seuservidor.com/webhook/xxx"
                        helperText="Para enviar eventos de volta ao n8n (atualização de status, etc.)"
                    />
                </CardContent>
            </Card>

            {/* Documentation */}
            <Card variant="bordered">
                <CardHeader>
                    <CardTitle>Documentação da API</CardTitle>
                    <CardDescription>Como usar o webhook para enviar leads</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                        <pre className="text-sm text-gray-100">
                            {`POST ${webhookEndpoint}
Content-Type: application/json

{
  "type": "new_lead",
  "apiKey": "${settings.apiKey || "SUA_API_KEY"}",
  "data": {
    "name": "Nome do Lead",
    "phone": "11999999999",
    "procedure": "Botox",
    "source": "Instagram"
  }
}`}
                        </pre>
                    </div>
                    <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                        <p className="text-sm text-blue-800">
                            <strong>Eventos aceitos:</strong> new_lead, lead_qualified, appointment_created, metric_event
                        </p>
                    </div>
                    <a
                        href="/api/webhooks/n8n"
                        target="_blank"
                        className="inline-flex items-center gap-2 mt-4 text-sm text-rose-600 hover:text-rose-700"
                    >
                        Ver documentação completa da API
                        <ExternalLink className="w-4 h-4" />
                    </a>
                </CardContent>
            </Card>

            {/* Save Button */}
            <div className="flex justify-end">
                <Button onClick={handleSave} isLoading={isSaving}>
                    <Save className="w-4 h-4 mr-2" />
                    Salvar Configurações
                </Button>
            </div>
        </div>
    );
}
