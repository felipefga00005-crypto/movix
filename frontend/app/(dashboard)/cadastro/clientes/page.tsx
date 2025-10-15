'use client'

/**
 * Página de Cadastro de Clientes
 * Gerenciamento completo de clientes com integração ao backend
 */

import { useState, useEffect } from "react"
import {
  IconPlus,
  IconSearch,
  IconFilter,
  IconDownload,
  IconEdit,
  IconTrash,
  IconEye,
  IconRefresh,
} from "@tabler/icons-react"
import { AppSidebar } from "@/components/layout/app-sidebar"
import { SiteHeader } from "@/components/dashboard/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { clienteService } from "@/lib/services/cliente.service"
import type { Cliente, ClienteStats } from "@/types/cliente"
import { toast } from "sonner"

export default function ClientesPage() {
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [stats, setStats] = useState<ClienteStats | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>("all")

  // Carrega clientes ao montar o componente
  useEffect(() => {
    loadClientes()
    loadStats()
  }, [])

  const loadClientes = async () => {
    try {
      setIsLoading(true)
      const data = await clienteService.getAll()
      setClientes(data)
    } catch (error: any) {
      toast.error(error.message || 'Erro ao carregar clientes')
    } finally {
      setIsLoading(false)
    }
  }

  const loadStats = async () => {
    try {
      const data = await clienteService.getStats()
      setStats(data)
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error)
    }
  }

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      loadClientes()
      return
    }

    try {
      setIsLoading(true)
      const data = await clienteService.search(searchTerm)
      setClientes(data)
    } catch (error: any) {
      toast.error(error.message || 'Erro ao buscar clientes')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Tem certeza que deseja excluir este cliente?')) {
      return
    }

    try {
      await clienteService.delete(id)
      toast.success('Cliente excluído com sucesso!')
      loadClientes()
      loadStats()
    } catch (error: any) {
      toast.error(error.message || 'Erro ao excluir cliente')
    }
  }

  // Filtra clientes por status
  const filteredClientes = clientes.filter((cliente) => {
    if (statusFilter !== "all" && cliente.status !== statusFilter) {
      return false
    }
    return true
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Ativo":
        return "default"
      case "Inativo":
        return "secondary"
      default:
        return "outline"
    }
  }

  const getTipoPessoaLabel = (tipo: string) => {
    return tipo === 'PF' ? 'Pessoa Física' : 'Pessoa Jurídica'
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
        <div className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
          {/* Header */}
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Clientes</h1>
              <p className="text-muted-foreground">
                Gerencie o cadastro de clientes
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={loadClientes}>
                <IconRefresh className="mr-2 h-4 w-4" />
                Atualizar
              </Button>
              <Button>
                <IconPlus className="mr-2 h-4 w-4" />
                Novo Cliente
              </Button>
            </div>
          </div>

          {/* Estatísticas */}
          {stats && (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Total de Clientes</CardDescription>
                  <CardTitle className="text-3xl">{stats.total}</CardTitle>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Ativos</CardDescription>
                  <CardTitle className="text-3xl text-green-600">{stats.ativos}</CardTitle>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Inativos</CardDescription>
                  <CardTitle className="text-3xl text-gray-600">{stats.inativos}</CardTitle>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Pessoa Física</CardDescription>
                  <CardTitle className="text-3xl">{stats.pessoaFisica}</CardTitle>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Pessoa Jurídica</CardDescription>
                  <CardTitle className="text-3xl">{stats.pessoaJuridica}</CardTitle>
                </CardHeader>
              </Card>
            </div>
          )}

          {/* Filtros */}
          <Card>
            <CardHeader>
              <CardTitle>Filtros</CardTitle>
              <CardDescription>
                Busque e filtre clientes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-4 md:flex-row">
                  <div className="flex-1">
                    <div className="relative">
                      <IconSearch className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="search"
                        placeholder="Buscar por razão social, CPF/CNPJ..."
                        className="pl-8"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                      />
                    </div>
                  </div>
                  <Button onClick={handleSearch}>
                    <IconSearch className="mr-2 h-4 w-4" />
                    Buscar
                  </Button>
                  <Button variant="outline">
                    <IconDownload className="mr-2 h-4 w-4" />
                    Exportar
                  </Button>
                </div>

                {/* Filtro por Status */}
                <div className="flex gap-2">
                  <Button
                    variant={statusFilter === "all" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setStatusFilter("all")}
                  >
                    Todos
                  </Button>
                  <Button
                    variant={statusFilter === "Ativo" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setStatusFilter("Ativo")}
                  >
                    Ativos
                  </Button>
                  <Button
                    variant={statusFilter === "Inativo" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setStatusFilter("Inativo")}
                  >
                    Inativos
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tabela */}
          <Card>
            <CardHeader>
              <CardTitle>Lista de Clientes</CardTitle>
              <CardDescription>
                {filteredClientes.length} cliente(s) encontrado(s)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Código</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Nome</TableHead>
                      <TableHead>CPF/CNPJ</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Telefone</TableHead>
                      <TableHead>Cidade/UF</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredClientes.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={9} className="text-center h-24">
                          Nenhum cliente encontrado
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredClientes.map((cliente) => (
                        <TableRow key={cliente.id}>
                          <TableCell className="font-medium">
                            {cliente.codigo}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {cliente.tipo}
                            </Badge>
                          </TableCell>
                          <TableCell>{cliente.nome}</TableCell>
                          <TableCell className="font-mono text-sm">
                            {cliente.cpf_cnpj}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {cliente.email}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {cliente.telefone}
                          </TableCell>
                          <TableCell>
                            {cliente.cidade}/{cliente.estado}
                          </TableCell>
                          <TableCell>
                            <Badge variant={getStatusColor(cliente.status)}>
                              {cliente.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="sm">
                              Editar
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

