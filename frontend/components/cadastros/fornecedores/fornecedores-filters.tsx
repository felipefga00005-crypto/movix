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

interface FornecedoresFiltersProps {
  onFilter?: (filters: FornecedorFilters) => void
}

export interface FornecedorFilters {
  search?: string
  status?: string
  tipo?: string
  cidade?: string
  estado?: string
}

export function FornecedoresFilters({ onFilter }: FornecedoresFiltersProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [filters, setFilters] = useState<FornecedorFilters>({})

  const handleFilterChange = (key: keyof FornecedorFilters, value: string) => {
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
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {/* Busca por nome/CNPJ */}
            <div className="space-y-2">
              <Label htmlFor="search">Buscar</Label>
              <Input
                id="search"
                placeholder="Nome ou CNPJ..."
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
                </SelectContent>
              </Select>
            </div>

            {/* Tipo */}
            <div className="space-y-2">
              <Label htmlFor="tipo">Tipo</Label>
              <Select
                value={filters.tipo || "all"}
                onValueChange={(value) => handleFilterChange("tipo", value)}
              >
                <SelectTrigger id="tipo">
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="Fabricante">Fabricante</SelectItem>
                  <SelectItem value="Distribuidor">Distribuidor</SelectItem>
                  <SelectItem value="Importador">Importador</SelectItem>
                  <SelectItem value="Prestador de Serviço">Prestador de Serviço</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Cidade */}
            <div className="space-y-2">
              <Label htmlFor="cidade">Cidade</Label>
              <Input
                id="cidade"
                placeholder="Cidade..."
                value={filters.cidade || ""}
                onChange={(e) => handleFilterChange("cidade", e.target.value)}
              />
            </div>

            {/* Estado */}
            <div className="space-y-2">
              <Label htmlFor="estado">Estado</Label>
              <Input
                id="estado"
                placeholder="UF..."
                maxLength={2}
                value={filters.estado || ""}
                onChange={(e) => handleFilterChange("estado", e.target.value.toUpperCase())}
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

