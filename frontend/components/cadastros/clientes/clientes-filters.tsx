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
import { DateInput } from "@/components/ui/date-input"

interface ClientesFiltersProps {
  onFilter?: (filters: ClienteFilters) => void
}

export interface ClienteFilters {
  search?: string
  status?: string  // Usar string em vez de Status enum
  tipoCliente?: string
  cidade?: string
  estado?: string
  dataInicio?: Date
  dataFim?: Date
}

export function ClientesFilters({ onFilter }: ClientesFiltersProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [filters, setFilters] = useState<ClienteFilters>({})

  const handleFilterChange = (key: keyof ClienteFilters, value: string | Date | undefined) => {
    const newFilters = {
      ...filters,
      [key]: typeof value === "string" ? (value === "all" ? undefined : value || undefined) : value
    }
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
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {/* Busca por nome/CPF */}
            <div className="space-y-2">
              <Label htmlFor="search">Buscar</Label>
              <Input
                id="search"
                placeholder="Nome ou CPF..."
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
                  <SelectItem value="Pendente">Pendente</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Tipo de Cliente */}
            <div className="space-y-2">
              <Label htmlFor="tipoCliente">Tipo de Cliente</Label>
              <Select
                value={filters.tipoCliente || "all"}
                onValueChange={(value) => handleFilterChange("tipoCliente", value)}
              >
                <SelectTrigger id="tipoCliente">
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="Cliente">Cliente</SelectItem>
                  <SelectItem value="Fornecedor">Fornecedor</SelectItem>
                  <SelectItem value="Cliente/Fornecedor">Cliente/Fornecedor</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Data Inicial */}
            <div className="space-y-2">
              <Label>Data Inicial</Label>
              <DateInput
                date={filters.dataInicio}
                onDateChange={(date) => handleFilterChange("dataInicio", date)}
                placeholder="Data inicial"
              />
            </div>

            {/* Data Final */}
            <div className="space-y-2">
              <Label>Data Final</Label>
              <DateInput
                date={filters.dataFim}
                onDateChange={(date) => handleFilterChange("dataFim", date)}
                placeholder="Data final"
              />
            </div>

            {/* Cidade */}
            <div className="space-y-2">
              <Label htmlFor="cidade">Cidade</Label>
              <Input
                id="cidade"
                placeholder="Digite a cidade..."
                value={filters.cidade || ""}
                onChange={(e) => handleFilterChange("cidade", e.target.value)}
              />
            </div>

            {/* Estado */}
            <div className="space-y-2">
              <Label htmlFor="estado">Estado</Label>
              <Select
                value={filters.estado || "all"}
                onValueChange={(value) => handleFilterChange("estado", value)}
              >
                <SelectTrigger id="estado">
                  <SelectValue placeholder="Todos os estados" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os estados</SelectItem>
                  <SelectItem value="SP">São Paulo</SelectItem>
                  <SelectItem value="RJ">Rio de Janeiro</SelectItem>
                  <SelectItem value="MG">Minas Gerais</SelectItem>
                  <SelectItem value="RS">Rio Grande do Sul</SelectItem>
                  <SelectItem value="PR">Paraná</SelectItem>
                  <SelectItem value="SC">Santa Catarina</SelectItem>
                  <SelectItem value="BA">Bahia</SelectItem>
                  <SelectItem value="GO">Goiás</SelectItem>
                  <SelectItem value="PE">Pernambuco</SelectItem>
                  <SelectItem value="CE">Ceará</SelectItem>
                  <SelectItem value="DF">Distrito Federal</SelectItem>
                  <SelectItem value="ES">Espírito Santo</SelectItem>
                  <SelectItem value="MT">Mato Grosso</SelectItem>
                  <SelectItem value="MS">Mato Grosso do Sul</SelectItem>
                  <SelectItem value="PA">Pará</SelectItem>
                  <SelectItem value="PB">Paraíba</SelectItem>
                  <SelectItem value="AL">Alagoas</SelectItem>
                  <SelectItem value="AM">Amazonas</SelectItem>
                  <SelectItem value="RN">Rio Grande do Norte</SelectItem>
                  <SelectItem value="RO">Rondônia</SelectItem>
                  <SelectItem value="RR">Roraima</SelectItem>
                  <SelectItem value="SE">Sergipe</SelectItem>
                  <SelectItem value="TO">Tocantins</SelectItem>
                  <SelectItem value="AC">Acre</SelectItem>
                  <SelectItem value="AP">Amapá</SelectItem>
                  <SelectItem value="MA">Maranhão</SelectItem>
                  <SelectItem value="PI">Piauí</SelectItem>
                </SelectContent>
              </Select>
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

