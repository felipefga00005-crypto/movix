"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { IconChevronDown, IconFilter, IconX } from "@tabler/icons-react"

interface UsuariosFiltersProps {
  onFilter?: (filters: UsuarioFilters) => void
}

export interface UsuarioFilters {
  search?: string
  status?: string
  perfil?: string
  departamento?: string
}

export function UsuariosFilters({ onFilter }: UsuariosFiltersProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [filters, setFilters] = useState<UsuarioFilters>({})

  const handleFilterChange = (key: keyof UsuarioFilters, value: string) => {
    const newFilters = { ...filters, [key]: value === "all" ? undefined : value || undefined }
    setFilters(newFilters)
  }

  const handleApplyFilters = () => {
    onFilter?.(filters)
  }

  const handleClearFilters = () => {
    setFilters({})
    onFilter?.({})
  }

  const hasActiveFilters = Object.values(filters).some(value => value)

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="w-full">
      <div className="rounded-lg border bg-card">
        <CollapsibleTrigger asChild>
          <button className="flex w-full items-center justify-between p-4 hover:bg-muted/50 transition-colors">
            <div className="flex items-center gap-2">
              <IconFilter className="h-4 w-4" />
              <span className="font-medium">Filtros Avançados</span>
              {hasActiveFilters && (
                <span className="ml-2 rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">
                  {Object.values(filters).filter(Boolean).length}
                </span>
              )}
            </div>
            <IconChevronDown
              className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
            />
          </button>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="border-t p-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {/* Busca por nome/email */}
            <div className="space-y-2">
              <Label htmlFor="search">Buscar</Label>
              <Input
                id="search"
                placeholder="Nome ou email..."
                value={filters.search || ""}
                onChange={(e) => handleFilterChange("search", e.target.value)}
              />
            </div>

            {/* Status */}
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={filters.status || "all"}
                onValueChange={(value) => handleFilterChange("status", value)}
              >
                <SelectTrigger id="status">
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="Ativo">Ativo</SelectItem>
                  <SelectItem value="Inativo">Inativo</SelectItem>
                  <SelectItem value="Bloqueado">Bloqueado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Perfil */}
            <div className="space-y-2">
              <Label htmlFor="perfil">Perfil</Label>
              <Select
                value={filters.perfil || "all"}
                onValueChange={(value) => handleFilterChange("perfil", value)}
              >
                <SelectTrigger id="perfil">
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="Administrador">Administrador</SelectItem>
                  <SelectItem value="Gerente">Gerente</SelectItem>
                  <SelectItem value="Vendedor">Vendedor</SelectItem>
                  <SelectItem value="Operador">Operador</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Departamento */}
            <div className="space-y-2">
              <Label htmlFor="departamento">Departamento</Label>
              <Input
                id="departamento"
                placeholder="Departamento..."
                value={filters.departamento || ""}
                onChange={(e) => handleFilterChange("departamento", e.target.value)}
              />
            </div>
          </div>

            {/* Botões de ação */}
            <div className="mt-4 flex items-center justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearFilters}
                disabled={!hasActiveFilters}
              >
                <IconX className="h-4 w-4" />
                Limpar
              </Button>
              <Button size="sm" onClick={handleApplyFilters}>
                <IconFilter className="h-4 w-4" />
                Aplicar Filtros
              </Button>
            </div>
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  )
}

