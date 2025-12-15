// Seletor de Clínica - Simplified Roles
"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { ChevronDown, Building2 } from "lucide-react";
import Link from "next/link";

interface Organization {
  id: string;
  name: string;
  slug: string;
  role: string;
}

export function OrganizationSelector() {
  const { data: session } = useSession();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [selectedOrgId, setSelectedOrgId] = useState<string>("");
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Buscar organizações acessíveis ao usuário
  useEffect(() => {
    const fetchOrganizations = async () => {
      try {
        const response = await fetch("/api/organizations");
        if (response.ok) {
          const data = await response.json();
          setOrganizations(data);

          // Para usuários não super-admin, definir a primeira organização como selecionada
          if (data.length > 0) {
            setSelectedOrgId(data[0].id);
          }
        }
      } catch (error) {
        console.error("Erro ao buscar organizações:", error);
      } finally {
        setLoading(false);
      }
    };

    if (session?.user?.id) {
      fetchOrganizations();
    }
  }, [session?.user?.id]);

  const selectedOrg = organizations.find((org) => org.id === selectedOrgId);

  // Se usuário tem apenas 1 organização, não mostrar seletor
  if (organizations.length <= 1) {
    return null;
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg transition-colors"
      >
        <Building2 className="w-4 h-4 text-rose-600" />
        <span className="truncate max-w-xs">{selectedOrg?.name || "Selecione..."}</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          <div className="py-2">
            {organizations.map((org) => (
              <button
                key={org.id}
                onClick={() => {
                  setSelectedOrgId(org.id);
                  setIsOpen(false);
                  // Aqui você pode adicionar lógica para trocar de organização
                  // Por enquanto, apenas atualizar o state local
                  window.location.reload(); // Recarregar para atualizar session
                }}
                className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                  org.id === selectedOrgId
                    ? "bg-rose-50 text-rose-700 font-medium"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{org.name}</p>
                    <p className="text-xs text-gray-500">{org.slug}</p>
                  </div>
                  {org.id === selectedOrgId && (
                    <span className="text-rose-600 font-bold">✓</span>
                  )}
                </div>
              </button>
            ))}
          </div>

          <div className="border-t border-gray-200 px-4 py-2">
            <Link
              href="/organizacoes"
              className="block text-center px-3 py-1.5 text-sm font-medium text-rose-600 hover:bg-rose-50 rounded transition-colors"
            >
              + Criar/Gerenciar Clínicas
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
