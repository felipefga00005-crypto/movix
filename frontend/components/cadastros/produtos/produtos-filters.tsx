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

interface ProdutosFiltersProps {
  onFilter?: (filters: ProdutoFilters) => void
}

export interface ProdutoFilters {
  search?: string
  status?: string
  categoria?: string
  marca?: string
  estoqueBaixo?: boolean
  precoMin?: number
  precoMax?: number
}

export function ProdutosFilters({ onFilter }: ProdutosFiltersProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [filters, setFilters] = useState<ProdutoFilters>({})

  const handleFilterChange = (key: keyof ProdutoFilters, value: string | boolean | number) => {
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

  const hasActiveFilters = Object.values(filters).some(value => value !== undefined && value !== "")

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
                  {Object.values(filters).filter(v => v !== undefined && v !== "").length}
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
            {/* Busca por nome/código */}
            <div className="space-y-2">
              <Label htmlFor="search">Buscar</Label>
              <Input
                id="search"
                placeholder="Nome ou código de barras..."
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

            {/* Categoria */}
            <div className="space-y-2">
              <Label htmlFor="categoria">Categoria</Label>
              <Input
                id="categoria"
                placeholder="Categoria..."
                value={filters.categoria || ""}
                onChange={(e) => handleFilterChange("categoria", e.target.value)}
              />
            </div>

            {/* Marca */}
            <div className="space-y-2">
              <Label htmlFor="marca">Marca</Label>
              <Input
                id="marca"
                placeholder="Marca..."
                value={filters.marca || ""}
                onChange={(e) => handleFilterChange("marca", e.target.value)}
              />
            </div>

            {/* Preço Mínimo */}
            <div className="space-y-2">
              <Label htmlFor="precoMin">Preço Mínimo</Label>
              <Input
                id="precoMin"
                type="number"
                placeholder="0.00"
                step="0.01"
                value={filters.precoMin || ""}
                onChange={(e) => handleFilterChange("precoMin", parseFloat(e.target.value) || 0)}
              />
            </div>

            {/* Preço Máximo */}
            <div className="space-y-2">
              <Label htmlFor="precoMax">Preço Máximo</Label>
              <Input
                id="precoMax"
                type="number"
                placeholder="0.00"
                step="0.01"
                value={filters.precoMax || ""}
                onChange={(e) => handleFilterChange("precoMax", parseFloat(e.target.value) || 0)}
              />
            </div>

            {/* Estoque Baixo */}
            <div className="space-y-2">
              <Label htmlFor="estoqueBaixo">Estoque</Label>
              <Select
                value={filters.estoqueBaixo === true ? "baixo" : filters.estoqueBaixo === false ? "normal" : "all"}
                onValueChange={(value) => handleFilterChange("estoqueBaixo", value === "baixo" ? true : value === "normal" ? false : "all")}
              >
                <SelectTrigger id="estoqueBaixo">
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="baixo">Estoque Baixo</SelectItem>
                  <SelectItem value="normal">Estoque Normal</SelectItem>
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

