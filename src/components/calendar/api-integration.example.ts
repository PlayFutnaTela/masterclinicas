// Exemplo de Integração com API
// Este arquivo mostra como integrar o EventManager com endpoints reais

import { EventManager, type Event } from "@/components/calendar/event-manager"

/**
 * Exemplo completo de página de agendamentos com integração de API
 */

export async function fetchAppointments(): Promise<Event[]> {
  try {
    const response = await fetch("/api/agendamentos", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      throw new Error("Erro ao carregar agendamentos")
    }

    const data = await response.json()

    // Converter dados da API para formato Event
    return data.appointments.map((apt: any) => ({
      id: apt.id,
      title: apt.lead?.name || "Sem nome",
      description: apt.notes || apt.lead?.procedure,
      startTime: new Date(apt.scheduledAt),
      endTime: new Date(new Date(apt.scheduledAt).getTime() + 60 * 60 * 1000), // 1 hora por padrão
      color: getColorByStatus(apt.status),
      category: apt.lead?.procedure || "Consulta",
      tags: [apt.status],
    }))
  } catch (error) {
    console.error("Erro ao buscar agendamentos:", error)
    return []
  }
}

export async function createAppointment(event: Omit<Event, "id">): Promise<void> {
  try {
    const response = await fetch("/api/agendamentos", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        scheduledAt: event.startTime.toISOString(),
        notes: event.description,
        status: "agendado",
      }),
    })

    if (!response.ok) {
      throw new Error("Erro ao criar agendamento")
    }
  } catch (error) {
    console.error("Erro ao criar agendamento:", error)
    throw error
  }
}

export async function updateAppointment(
  id: string,
  updates: Partial<Event>
): Promise<void> {
  try {
    const response = await fetch("/api/agendamentos", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id,
        scheduledAt: updates.startTime?.toISOString(),
        notes: updates.description,
        status: updates.tags?.[0] || "agendado",
      }),
    })

    if (!response.ok) {
      throw new Error("Erro ao atualizar agendamento")
    }
  } catch (error) {
    console.error("Erro ao atualizar agendamento:", error)
    throw error
  }
}

export async function deleteAppointment(id: string): Promise<void> {
  try {
    const response = await fetch("/api/agendamentos", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id }),
    })

    if (!response.ok) {
      throw new Error("Erro ao deletar agendamento")
    }
  } catch (error) {
    console.error("Erro ao deletar agendamento:", error)
    throw error
  }
}

/**
 * Mapeamento de cores baseado no status
 */
function getColorByStatus(status: string): string {
  const colorMap: Record<string, string> = {
    agendado: "blue",
    confirmado: "green",
    realizado: "purple",
    cancelado: "red",
    no_show: "orange",
  }
  return colorMap[status] || "blue"
}

/**
 * Mapeamento de tags baseado no status
 */
export function getTagsByStatus(status: string): string[] {
  const tagMap: Record<string, string[]> = {
    agendado: ["Agendado"],
    confirmado: ["Confirmado"],
    realizado: ["Realizado"],
    cancelado: ["Cancelado"],
    no_show: ["Não Compareceu"],
  }
  return tagMap[status] || []
}

/**
 * Exemplo de uso em componente React
 */
/*
"use client"

import { useState, useEffect } from "react"
import { EventManager, type Event } from "@/components/calendar/event-manager"

export default function AgendamentosPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadEvents()
  }, [])

  async function loadEvents() {
    setIsLoading(true)
    try {
      const loadedEvents = await fetchAppointments()
      setEvents(loadedEvents)
    } finally {
      setIsLoading(false)
    }
  }

  async function handleEventCreate(event: Omit<Event, "id">) {
    try {
      await createAppointment(event)
      await loadEvents() // Recarregar eventos
    } catch (error) {
      console.error("Erro ao criar evento:", error)
    }
  }

  async function handleEventUpdate(id: string, updates: Partial<Event>) {
    try {
      await updateAppointment(id, updates)
      await loadEvents() // Recarregar eventos
    } catch (error) {
      console.error("Erro ao atualizar evento:", error)
    }
  }

  async function handleEventDelete(id: string) {
    try {
      await deleteAppointment(id)
      await loadEvents() // Recarregar eventos
    } catch (error) {
      console.error("Erro ao deletar evento:", error)
    }
  }

  if (isLoading) {
    return <div>Carregando agenda...</div>
  }

  return (
    <EventManager
      events={events}
      onEventCreate={handleEventCreate}
      onEventUpdate={handleEventUpdate}
      onEventDelete={handleEventDelete}
      categories={["Consulta", "Procedimento", "Avaliação", "Acompanhamento"]}
      defaultView="month"
      availableTags={["Agendado", "Confirmado", "Realizado", "Cancelado", "Não Compareceu"]}
      colors={[
        { name: "Azul", value: "blue", bg: "bg-blue-500", text: "text-blue-700" },
        { name: "Verde", value: "green", bg: "bg-green-500", text: "text-green-700" },
        { name: "Roxo", value: "purple", bg: "bg-purple-500", text: "text-purple-700" },
        { name: "Laranja", value: "orange", bg: "bg-orange-500", text: "text-orange-700" },
        { name: "Rosa", value: "pink", bg: "bg-pink-500", text: "text-pink-700" },
        { name: "Vermelho", value: "red", bg: "bg-red-500", text: "text-red-700" },
      ]}
    />
  )
}
*/
