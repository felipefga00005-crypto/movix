"use client"

import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const chartData = [
  { date: "2024-04-01", vendas: 2220, transacoes: 150 },
  { date: "2024-04-02", vendas: 2970, transacoes: 180 },
  { date: "2024-04-03", vendas: 1670, transacoes: 120 },
  { date: "2024-04-04", vendas: 2420, transacoes: 160 },
  { date: "2024-04-05", vendas: 3730, transacoes: 220 },
  { date: "2024-04-06", vendas: 2090, transacoes: 140 },
  { date: "2024-04-07", vendas: 4200, transacoes: 250 },
  { date: "2024-04-08", vendas: 3100, transacoes: 190 },
  { date: "2024-04-09", vendas: 2800, transacoes: 170 },
  { date: "2024-04-10", vendas: 3900, transacoes: 230 },
  { date: "2024-04-11", vendas: 2600, transacoes: 160 },
  { date: "2024-04-12", vendas: 4500, transacoes: 280 },
  { date: "2024-04-13", vendas: 3200, transacoes: 200 },
  { date: "2024-04-14", vendas: 2900, transacoes: 180 },
  { date: "2024-04-15", vendas: 3800, transacoes: 240 },
  { date: "2024-04-16", vendas: 3300, transacoes: 210 },
  { date: "2024-04-17", vendas: 4100, transacoes: 260 },
  { date: "2024-04-18", vendas: 2700, transacoes: 170 },
  { date: "2024-04-19", vendas: 3600, transacoes: 220 },
  { date: "2024-04-20", vendas: 4000, transacoes: 250 },
  { date: "2024-04-21", vendas: 3400, transacoes: 210 },
  { date: "2024-04-22", vendas: 4300, transacoes: 270 },
  { date: "2024-04-23", vendas: 3700, transacoes: 230 },
  { date: "2024-04-24", vendas: 4600, transacoes: 290 },
  { date: "2024-04-25", vendas: 3900, transacoes: 240 },
  { date: "2024-04-26", vendas: 4200, transacoes: 260 },
  { date: "2024-04-27", vendas: 3800, transacoes: 230 },
  { date: "2024-04-28", vendas: 4400, transacoes: 280 },
  { date: "2024-04-29", vendas: 4100, transacoes: 250 },
  { date: "2024-04-30", vendas: 4700, transacoes: 300 },
]

const chartConfig = {
  visitors: {
    label: "Visitors",
  },
  vendas: {
    label: "Vendas (R$)",
    color: "hsl(var(--chart-1))",
  },
  transacoes: {
    label: "Transações",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig

export function PdvChartInteractive() {
  const [timeRange, setTimeRange] = React.useState("30d")

  const filteredData = chartData.filter((item) => {
    const date = new Date(item.date)
    const now = new Date()
    let daysToSubtract = 30
    if (timeRange === "90d") {
      daysToSubtract = 90
    } else if (timeRange === "7d") {
      daysToSubtract = 7
    }
    const startDate = new Date(now.getTime() - daysToSubtract * 24 * 60 * 60 * 1000)
    return date >= startDate
  })

  return (
    <Card>
      <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
        <div className="grid flex-1 gap-1 text-center sm:text-left">
          <CardTitle>Vendas e Transações - PDV</CardTitle>
          <CardDescription>
            Mostrando o total de vendas e número de transações
          </CardDescription>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger
            className="w-[160px] rounded-lg sm:ml-auto"
            aria-label="Selecionar período"
          >
            <SelectValue placeholder="Últimos 30 dias" />
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            <SelectItem value="7d" className="rounded-lg">
              Últimos 7 dias
            </SelectItem>
            <SelectItem value="30d" className="rounded-lg">
              Últimos 30 dias
            </SelectItem>
            <SelectItem value="90d" className="rounded-lg">
              Últimos 90 dias
            </SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-full"
        >
          <AreaChart data={filteredData}>
            <defs>
              <linearGradient id="fillVendas" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-vendas)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-vendas)"
                  stopOpacity={0.1}
                />
              </linearGradient>
              <linearGradient id="fillTransacoes" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-transacoes)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-transacoes)"
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value)
                return date.toLocaleDateString("pt-BR", {
                  month: "short",
                  day: "numeric",
                })
              }}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => {
                    return new Date(value).toLocaleDateString("pt-BR", {
                      month: "short",
                      day: "numeric",
                    })
                  }}
                  indicator="dot"
                />
              }
            />
            <Area
              dataKey="transacoes"
              type="natural"
              fill="url(#fillTransacoes)"
              stroke="var(--color-transacoes)"
              stackId="a"
            />
            <Area
              dataKey="vendas"
              type="natural"
              fill="url(#fillVendas)"
              stroke="var(--color-vendas)"
              stackId="a"
            />
            <ChartLegend content={<ChartLegendContent />} />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
