// Página de Administração - Gerenciamento de Todas as Clínicas
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Plus, Building2, Copy, Trash2 } from "lucide-react";
import Link from "next/link";

interface Organization {
  id: string;
  name: string;
  slug: string;
  whatsappLink?: string;
  webhookUrl?: string;
  createdAt: string;
  _count?: {
    leads: number;
    appointments: number;
    users: number;
  };
}

export default function OrganizationsPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    whatsappLink: "",
    webhookUrl: "",
  });

  // ===== MULTI-TENANT: Buscar TODAS as organizações (admin-only) =====
  useEffect(() => {
    const fetchOrganizations = async () => {
      try {
        const response = await fetch("/api/admin/organizations");
        if (!response.ok) {
          throw new Error("Erro ao buscar organizações");
        }
        const data = await response.json();
        setOrganizations(data);
      } catch (err) {
        setError("Erro ao carregar organizações");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (status === "authenticated") {
      fetchOrganizations();
    }
  }, [status]);

  // ===== MULTI-TENANT: Criar nova organização =====
  const handleCreateOrganization = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsCreating(true);

    try {
      if (!formData.name || !formData.slug) {
        setError("Nome e slug são obrigatórios");
        return;
      }

      const response = await fetch("/api/admin/organizations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Erro ao criar organização");
      }

      const newOrg = await response.json();

      // Adicionar à lista
      setOrganizations([
        {
          ...newOrg,
          role: "admin",
          createdAt: new Date().toISOString(),
        },
        ...organizations,
      ]);

      // Limpar formulário
      setFormData({
        name: "",
        slug: "",
        whatsappLink: "",
        webhookUrl: "",
      });

      alert("Organização criada com sucesso!");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erro ao criar organização"
      );
    } finally {
      setIsCreating(false);
    }
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-")
      .replace(/[^\w-]/g, "");
  };

  if (status === "unauthenticated") {
    router.push("/login");
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/dashboard">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4" />
                </Button>
              </Link>
              <h1 className="text-3xl font-bold flex items-center gap-2">
                <Building2 className="w-8 h-8 text-rose-600" />
                Gerenciar Clínicas
              </h1>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Formulário de Criação */}
          <Card className="lg:col-span-1 p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Plus className="w-5 h-5 text-rose-600" />
              Nova Clínica
            </h2>

            <form onSubmit={handleCreateOrganization} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome da Clínica *
                </label>
                <Input
                  type="text"
                  value={formData.name}
                  onChange={(e) => {
                    setFormData({
                      ...formData,
                      name: e.target.value,
                      slug: formData.slug || generateSlug(e.target.value),
                    });
                  }}
                  placeholder="Ex: Clínica Beleza"
                  disabled={isCreating}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Slug *
                </label>
                <Input
                  type="text"
                  value={formData.slug}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      slug: e.target.value.toLowerCase().replace(/\s+/g, "-"),
                    })
                  }
                  placeholder="Ex: clinica-beleza"
                  disabled={isCreating}
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  URL amigável (sem espaços ou caracteres especiais)
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  WhatsApp (Opcional)
                </label>
                <Input
                  type="url"
                  value={formData.whatsappLink}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      whatsappLink: e.target.value,
                    })
                  }
                  placeholder="Ex: https://wa.me/5511999999999"
                  disabled={isCreating}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Webhook URL (Opcional)
                </label>
                <Input
                  type="url"
                  value={formData.webhookUrl}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      webhookUrl: e.target.value,
                    })
                  }
                  placeholder="Ex: https://seu-dominio.com/webhook"
                  disabled={isCreating}
                />
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                disabled={isCreating}
                className="w-full bg-rose-600 hover:bg-rose-700"
              >
                {isCreating ? "Criando..." : "Criar Clínica"}
              </Button>
            </form>
          </Card>

          {/* Lista de Organizações */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">
                Todas as Clínicas ({organizations.length})
              </h2>
            </div>

            {loading ? (
              <div className="text-center py-8">
                <p className="text-gray-500">Carregando clínicas...</p>
              </div>
            ) : organizations.length === 0 ? (
              <Card className="p-8 text-center">
                <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">
                  Nenhuma clínica cadastrada ainda.
                </p>
                <p className="text-sm text-gray-400 mt-2">
                  Crie a primeira clínica usando o formulário ao lado.
                </p>
              </Card>
            ) : (
              <div className="space-y-3">
                {organizations.map((org) => (
                  <Card
                    key={org.id}
                    className="p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">
                          {org.name}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1 font-mono">
                          {org.slug}
                        </p>
                        {/* ===== MULTI-TENANT: Mostrar stats da clínica ===== */}
                        <div className="flex gap-4 mt-3 text-sm text-gray-600">
                          <span>👥 {org._count?.users || 0} usuários</span>
                          <span>📋 {org._count?.leads || 0} leads</span>
                          <span>📅 {org._count?.appointments || 0} agendamentos</span>
                        </div>
                        <p className="text-xs text-gray-400 mt-2">
                          Criada em{" "}
                          {new Date(org.createdAt).toLocaleDateString("pt-BR")}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigator.clipboard.writeText(org.slug);
                            alert("Slug copiado!");
                          }}
                          title="Copiar slug"
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => {
                            if (confirm(`Deseja deletar ${org.name}?`)) {
                              // Implementar delete depois
                              alert("Delete não implementado ainda");
                            }
                          }}
                          title="Deletar clínica"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
