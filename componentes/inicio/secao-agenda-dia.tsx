"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { CalendarClock, MapPin } from "lucide-react"

export interface EventoHoje {
  id: string
  horario: string
  titulo: string
  local?: string
  cor?: string
}

interface PropsSecaoAgendaDia {
  eventos: EventoHoje[]
}

export function SecaoAgendaDia({ eventos }: PropsSecaoAgendaDia) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.4 }}
      className="rounded-2xl border border-[color:var(--borda-cartao)] bg-card p-6"
    >
      <div className="flex items-center gap-2">
        <CalendarClock className="h-4 w-4 text-primary" />
        <h3 className="font-titulo text-base font-semibold text-foreground">
          Agenda de hoje
        </h3>
      </div>

      {eventos.length === 0 ? (
        <p className="mt-4 text-sm text-muted-foreground">
          Nenhum evento agendado para hoje.
        </p>
      ) : (
        <div className="mt-4 space-y-3">
          {eventos.map((evento, i) => (
            <motion.div
              key={evento.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.45 + i * 0.05 }}
              className="flex items-start gap-3"
            >
              <div className="flex flex-col items-center">
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: evento.cor || "var(--primary)" }}
                />
                {i < eventos.length - 1 ? (
                  <div className="mt-1 h-8 w-px bg-border" />
                ) : null}
              </div>
              <div className="flex-1">
                <div className="flex items-baseline justify-between gap-2">
                  <p className="text-sm font-medium text-foreground">
                    {evento.titulo}
                  </p>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {evento.horario}
                  </span>
                </div>
                {evento.local ? (
                  <div className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="h-3 w-3" />
                    {evento.local}
                  </div>
                ) : null}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  )
}
