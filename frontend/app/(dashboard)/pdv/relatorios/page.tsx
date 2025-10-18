'use client'

/**
 * Página de Relatórios do PDV
 * Relatórios e análises de vendas
 */

import { useState } from "react"
import { AppSidebar } from "@/components/layout/app-sidebar"
import { SiteHeader } from "@/components/dashboard/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  IconDownload,
  IconCalendar,
  IconChartBar,
  IconUsers,
  IconPackage,
  IconCash,
  IconTrendingUp,
} from "@tabler/icons-react"
import { RelatorioVendasPorPeriodo } from "@/components/pdv/relatorios/relatorio-vendas-periodo"
import { RelatorioVendasPorProduto } from "@/components/pdv/relatorios/relatorio-vendas-produto"
import { RelatorioVendasPorCliente } from "@/components/pdv/relatorios/relatorio-vendas-cliente"
import { RelatorioFormaPagamento } from "@/components/pdv/relatorios/relatorio-forma-pagamento"
import { DashboardVendas } from "@/components/pdv/relatorios/dashboard-vendas"

export default function RelatoriosPage() {
  const [dataInicio, setDataInicio] = useState("")
  const [dataFim, setDataFim] = useState("")
  const [tipoRelatorio, setTipoRelatorio] = useState("periodo")

  const handleExportarRelatorio = () => {
    // TODO: Implementar exportação
    console.log("Exportar relatório:", { tipoRelatorio, dataInicio, dataFim })
  }

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              {/* Header */}
              <div className="px-4 lg:px-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-2xl font-bold tracking-tight">Relatórios</h1>
                    <p className="text-muted-foreground">
                      Análises e relatórios de vendas do PDV
                    </p>
                  </div>
                  <Button onClick={handleExportarRelatorio}>
                    <IconDownload className="mr-2 h-4 w-4" />
                    Exportar
                  </Button>
                </div>
              </div>

              {/* Filtros */}
              <div className="px-4 lg:px-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <IconCalendar className="h-5 w-5" />
                      Filtros
                    </CardTitle>
                    <CardDescription>
                      Configure o período e tipo de relatório
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="dataInicio">Data Início</Label>
                        <Input
                          id="dataInicio"
                          type="date"
                          value={dataInicio}
                          onChange={(e) => setDataInicio(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="dataFim">Data Fim</Label>
                        <Input
                          id="dataFim"
                          type="date"
                          value={dataFim}
                          onChange={(e) => setDataFim(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="tipoRelatorio">Tipo de Relatório</Label>
                        <Select value={tipoRelatorio} onValueChange={setTipoRelatorio}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="periodo">Por Período</SelectItem>
                            <SelectItem value="produto">Por Produto</SelectItem>
                            <SelectItem value="cliente">Por Cliente</SelectItem>
                            <SelectItem value="pagamento">Por Forma de Pagamento</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex items-end">
                        <Button className="w-full">
                          <IconChartBar className="mr-2 h-4 w-4" />
                          Gerar Relatório
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Conteúdo dos Relatórios */}
              <div className="px-4 lg:px-6">
                <Tabs value="dashboard" className="w-full">
                  <TabsList className="grid w-full grid-cols-5">
                    <TabsTrigger value="dashboard" className="flex items-center gap-2">
                      <IconTrendingUp className="h-4 w-4" />
                      Dashboard
                    </TabsTrigger>
                    <TabsTrigger value="periodo" className="flex items-center gap-2">
                      <IconCalendar className="h-4 w-4" />
                      Por Período
                    </TabsTrigger>
                    <TabsTrigger value="produtos" className="flex items-center gap-2">
                      <IconPackage className="h-4 w-4" />
                      Por Produto
                    </TabsTrigger>
                    <TabsTrigger value="clientes" className="flex items-center gap-2">
                      <IconUsers className="h-4 w-4" />
                      Por Cliente
                    </TabsTrigger>
                    <TabsTrigger value="pagamento" className="flex items-center gap-2">
                      <IconCash className="h-4 w-4" />
                      Forma Pagamento
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="dashboard" className="space-y-6">
                    <DashboardVendas />
                  </TabsContent>

                  <TabsContent value="periodo" className="space-y-6">
                    <RelatorioVendasPorPeriodo
                      dataInicio={dataInicio}
                      dataFim={dataFim}
                    />
                  </TabsContent>

                  <TabsContent value="produtos" className="space-y-6">
                    <RelatorioVendasPorProduto
                      dataInicio={dataInicio}
                      dataFim={dataFim}
                    />
                  </TabsContent>

                  <TabsContent value="clientes" className="space-y-6">
                    <RelatorioVendasPorCliente
                      dataInicio={dataInicio}
                      dataFim={dataFim}
                    />
                  </TabsContent>

                  <TabsContent value="pagamento" className="space-y-6">
                    <RelatorioFormaPagamento
                      dataInicio={dataInicio}
                      dataFim={dataFim}
                    />
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
