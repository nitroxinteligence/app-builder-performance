"use client"

import * as React from "react"
import { motion } from "framer-motion"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"

export interface DadosAtividade {
  dia: string
  tarefas: number
  foco: number
  habitos: number
}

interface PropsGraficoAtividade {
  dados: DadosAtividade[]
  titulo?: string
}

function DicaPersonalizada({ active, payload, label }: {
  active?: boolean
  payload?: Array<{ value: number; name: string; color: string }>
  label?: string
}) {
  if (!active || !payload?.length) return null

  return (
    <div className="rounded-xl border border-[color:var(--borda-cartao)] bg-card p-3">
      <p className="mb-1.5 text-xs font-medium text-foreground">{label}</p>
      {payload.map((item) => (
        <div key={item.name} className="flex items-center gap-2 text-xs text-muted-foreground">
          <span
            className="h-2 w-2 rounded-full"
            style={{ backgroundColor: item.color }}
          />
          <span className="capitalize">{item.name}:</span>
          <span className="font-medium text-foreground">{item.value}</span>
        </div>
      ))}
    </div>
  )
}

export function GraficoAtividade({ dados, titulo = "Atividade semanal" }: PropsGraficoAtividade) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.3 }}
      className="rounded-2xl border border-[color:var(--borda-cartao)] bg-card p-6"
    >
      <h3 className="mb-4 font-titulo text-base font-semibold text-foreground">
        {titulo}
      </h3>
      <div className="h-[240px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={dados} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="gradienteLaranja" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.3} />
                <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gradienteVerde" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--chart-2)" stopOpacity={0.2} />
                <stop offset="100%" stopColor="var(--chart-2)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gradienteAzul" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--chart-3)" stopOpacity={0.2} />
                <stop offset="100%" stopColor="var(--chart-3)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="var(--border)"
              vertical={false}
            />
            <XAxis
              dataKey="dia"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
            />
            <Tooltip content={<DicaPersonalizada />} />
            <Area
              type="monotone"
              dataKey="tarefas"
              stroke="var(--chart-1)"
              strokeWidth={2}
              fill="url(#gradienteLaranja)"
              name="tarefas"
            />
            <Area
              type="monotone"
              dataKey="foco"
              stroke="var(--chart-2)"
              strokeWidth={2}
              fill="url(#gradienteVerde)"
              name="foco"
            />
            <Area
              type="monotone"
              dataKey="habitos"
              stroke="var(--chart-3)"
              strokeWidth={2}
              fill="url(#gradienteAzul)"
              name="habitos"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-3 flex items-center justify-center gap-5">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <span className="h-2 w-2 rounded-full bg-[var(--chart-1)]" />
          Tarefas
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <span className="h-2 w-2 rounded-full bg-[var(--chart-2)]" />
          Foco (h)
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <span className="h-2 w-2 rounded-full bg-[var(--chart-3)]" />
          Habitos
        </div>
      </div>
    </motion.div>
  )
}
