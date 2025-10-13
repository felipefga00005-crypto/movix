"use client"

import * as React from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  IconEdit,
  IconTrash,
  IconDots,
  IconSearch,
  IconUsers,
  IconMail,
  IconPhone,
  IconKey,
  IconCircle
} from "@tabler/icons-react"

import { Usuario, UsuarioStatus, UsuarioPerfil, UsuarioDepartamento } from "@/types/usuario"
import { usuarioUtils } from "@/lib/api/usuarios"

interface UsuarioTableProps {
  usuarios: Usuario[]
  isLoading?: boolean
  onEdit: (usuario: Usuario) => void
  onDelete: (usuario: Usuario) => void
  onChangePassword?: (usuario: Usuario) => void
}

export function UsuarioTable({ usuarios, isLoading, onEdit, onDelete, onChangePassword }: UsuarioTableProps) {
  const [searchTerm, setSearchTerm] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState<string>("all")
  const [perfilFilter, setPerfilFilter] = React.useState<string>("all")
  const [departamentoFilter, setDepartamentoFilter] = React.useState<string>("all")

  // Filtrar usuários
  const filteredUsuarios = React.useMemo(() => {
    return usuarios.filter(usuario => {
      const matchesSearch = searchTerm === "" || 
        usuario.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        usuario.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        usuario.cargo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        usuario.departamento?.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesStatus = statusFilter === "all" || usuario.status === statusFilter
      const matchesPerfil = perfilFilter === "all" || usuario.perfil === perfilFilter
      const matchesDepartamento = departamentoFilter === "all" || usuario.departamento === departamentoFilter

      return matchesSearch && matchesStatus && matchesPerfil && matchesDepartamento
    })
  }, [usuarios, searchTerm, statusFilter, perfilFilter, departamentoFilter])

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Usuários</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Skeleton para filtros */}
            <div className="flex gap-4">
              <div className="h-10 bg-gray-200 rounded animate-pulse flex-1"></div>
              <div className="h-10 bg-gray-200 rounded animate-pulse w-32"></div>
              <div className="h-10 bg-gray-200 rounded animate-pulse w-32"></div>
              <div className="h-10 bg-gray-200 rounded animate-pulse w-32"></div>
            </div>
            
            {/* Skeleton para tabela */}
            <div className="space-y-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-16 bg-gray-200 rounded animate-pulse"></div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <IconUsers className="h-5 w-5" />
          Usuários ({filteredUsuarios.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Filtros */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <IconSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Buscar por nome, email, cargo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value={UsuarioStatus.ATIVO}>Ativo</SelectItem>
                <SelectItem value={UsuarioStatus.INATIVO}>Inativo</SelectItem>
                <SelectItem value={UsuarioStatus.PENDENTE}>Pendente</SelectItem>
                <SelectItem value={UsuarioStatus.BLOQUEADO}>Bloqueado</SelectItem>
              </SelectContent>
            </Select>

            <Select value={perfilFilter} onValueChange={setPerfilFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Perfil" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value={UsuarioPerfil.ADMIN}>Administrador</SelectItem>
                <SelectItem value={UsuarioPerfil.GERENTE}>Gerente</SelectItem>
                <SelectItem value={UsuarioPerfil.VENDEDOR}>Vendedor</SelectItem>
                <SelectItem value={UsuarioPerfil.OPERADOR}>Operador</SelectItem>
                <SelectItem value={UsuarioPerfil.FINANCEIRO}>Financeiro</SelectItem>
                <SelectItem value={UsuarioPerfil.ESTOQUE}>Estoque</SelectItem>
              </SelectContent>
            </Select>

            <Select value={departamentoFilter} onValueChange={setDepartamentoFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Departamento" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value={UsuarioDepartamento.VENDAS}>Vendas</SelectItem>
                <SelectItem value={UsuarioDepartamento.FINANCEIRO}>Financeiro</SelectItem>
                <SelectItem value={UsuarioDepartamento.ESTOQUE}>Estoque</SelectItem>
                <SelectItem value={UsuarioDepartamento.COMPRAS}>Compras</SelectItem>
                <SelectItem value={UsuarioDepartamento.TI}>TI</SelectItem>
                <SelectItem value={UsuarioDepartamento.RH}>RH</SelectItem>
                <SelectItem value={UsuarioDepartamento.DIRETORIA}>Diretoria</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Tabela */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Usuário</TableHead>
                  <TableHead>Contato</TableHead>
                  <TableHead>Cargo/Depto</TableHead>
                  <TableHead>Perfil</TableHead>
                  <TableHead>Último Acesso</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsuarios.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      {searchTerm || statusFilter !== "all" || perfilFilter !== "all" || departamentoFilter !== "all"
                        ? "Nenhum usuário encontrado com os filtros aplicados."
                        : "Nenhum usuário cadastrado ainda."
                      }
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsuarios.map((usuario) => (
                    <TableRow key={usuario.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={usuario.avatar} alt={usuario.nome} />
                            <AvatarFallback className="text-xs">
                              {usuarioUtils.generateAvatarInitials(usuario.nome)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium flex items-center gap-2">
                              {usuario.nome}
                              {usuarioUtils.isOnline(usuario.ultimoAcesso) && (
                                <IconCircle className="h-2 w-2 fill-green-500 text-green-500" />
                              )}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {usuario.codigo}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-1 text-sm">
                            <IconMail className="h-3 w-3 text-gray-400" />
                            {usuario.email}
                          </div>
                          {usuario.telefone && (
                            <div className="flex items-center gap-1 text-sm">
                              <IconPhone className="h-3 w-3 text-gray-400" />
                              {usuarioUtils.formatTelefone(usuario.telefone)}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {usuario.cargo && (
                            <div className="font-medium">{usuario.cargo}</div>
                          )}
                          {usuario.departamento && (
                            <div className="text-muted-foreground">{usuario.departamento}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant="secondary" 
                          className={usuarioUtils.getPerfilColor(usuario.perfil)}
                        >
                          {usuarioUtils.getPerfilName(usuario.perfil)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {usuarioUtils.formatUltimoAcesso(usuario.ultimoAcesso)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant="secondary"
                          className={usuarioUtils.getStatusColor(usuario.status)}
                        >
                          {usuario.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Abrir menu</span>
                              <IconDots className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Ações</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => onEdit(usuario)}>
                              <IconEdit className="mr-2 h-4 w-4" />
                              Editar
                            </DropdownMenuItem>
                            {onChangePassword && (
                              <DropdownMenuItem onClick={() => onChangePassword(usuario)}>
                                <IconKey className="mr-2 h-4 w-4" />
                                Alterar Senha
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => onDelete(usuario)}
                              className="text-red-600"
                            >
                              <IconTrash className="mr-2 h-4 w-4" />
                              Excluir
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Informações da tabela */}
          {filteredUsuarios.length > 0 && (
            <div className="text-sm text-muted-foreground">
              Mostrando {filteredUsuarios.length} de {usuarios.length} usuários
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
