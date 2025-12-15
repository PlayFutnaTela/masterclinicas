"use client"

import { useState, useEffect } from "react"
import { EventManager, type Event } from "@/components/calendar/event-manager"

interface Appointment {
  id: string
  scheduledAt: string
  status: string
  notes?: string
  lead: {
    id: string
    name: string
    phone: string
    procedure: string
  }
}

/**
 * Mapeia status para cores do calendário
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
 * Converte agendamento do banco para formato Event
 */
function convertAppointmentToEvent(appointment: Appointment): Event {
  const startTime = new Date(appointment.scheduledAt)
  const endTime = new Date(startTime.getTime() + 60 * 60 * 1000) // 1 hora por padrão

  return {
    id: appointment.id,
    title: `${appointment.lead.name}`,
    description: appointment.notes || appointment.lead.procedure,
    startTime,
    endTime,
    color: getColorByStatus(appointment.status),
    category: appointment.lead.procedure || "Consulta",
    tags: [appointment.status],
  }
}

export default function AgendamentosPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Carregar agendamentos do banco de dados
  useEffect(() => {
    const loadAppointments = async () => {
      try {
        setIsLoading(true)
        setError(null)

        const response = await fetch("/api/agendamentos", {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        })

        if (!response.ok) {
          throw new Error(`Erro ${response.status}: ${response.statusText}`)
        }

        const data = await response.json()
        const appointments: Appointment[] = data.appointments || []

        // Converter agendamentos para eventos
        const convertedEvents = appointments.map(convertAppointmentToEvent)
        setEvents(convertedEvents)
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : "Erro desconhecido"
        console.error("Erro ao carregar agendamentos:", errorMsg)
        setError(errorMsg)
      } finally {
        setIsLoading(false)
      }
    }

    loadAppointments()
  }, [])

  const handleEventCreate = async (event: Omit<Event, "id">) => {
    try {
      const response = await fetch("/api/agendamentos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scheduledAt: event.startTime.toISOString(),
          notes: event.description,
          status: event.tags?.[0] || "agendado",
        }),
      })

      if (!response.ok) {
        throw new Error("Erro ao criar agendamento")
      }

      // Recarregar lista
      const reloadResponse = await fetch("/api/agendamentos")
      const reloadData = await reloadResponse.json()
      const appointments: Appointment[] = reloadData.appointments || []
      setEvents(appointments.map(convertAppointmentToEvent))
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Erro desconhecido"
      console.error("Erro ao criar evento:", errorMsg)
      setError(errorMsg)
    }
  }

  const handleEventUpdate = async (id: string, updates: Partial<Event>) => {
    try {
      const response = await fetch("/api/agendamentos", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
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

      // Recarregar lista
      const reloadResponse = await fetch("/api/agendamentos")
      const reloadData = await reloadResponse.json()
      const appointments: Appointment[] = reloadData.appointments || []
      setEvents(appointments.map(convertAppointmentToEvent))
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Erro desconhecido"
      console.error("Erro ao atualizar evento:", errorMsg)
      setError(errorMsg)
    }
  }

  const handleEventDelete = async (id: string) => {
    try {
      const response = await fetch("/api/agendamentos", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      })

      if (!response.ok) {
        throw new Error("Erro ao deletar agendamento")
      }

      // Recarregar lista
      const reloadResponse = await fetch("/api/agendamentos")
      const reloadData = await reloadResponse.json()
      const appointments: Appointment[] = reloadData.appointments || []
      setEvents(appointments.map(convertAppointmentToEvent))
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Erro desconhecido"
      console.error("Erro ao deletar evento:", errorMsg)
      setError(errorMsg)
    }
  }

  return (
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-black mb-2">Agendamentos</h1>
          <p className="text-gray-600">
            Gerencie os compromissos e agendamentos da sua clínica
          </p>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-500/20 border border-red-500/50 rounded-lg">
            <p className="text-red-300">
              <strong>Erro:</strong> {error}
            </p>
          </div>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center h-96">
            <div className="text-gray-600">Carregando agendamentos...</div>
          </div>
        ) : (
          <EventManager
            events={events}
            onEventCreate={handleEventCreate}
            onEventUpdate={handleEventUpdate}
            onEventDelete={handleEventDelete}
          />
        )}
      </div>
    </div>
  )
}
