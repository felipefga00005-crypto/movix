'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Separator } from '@/components/ui/separator';
import {
  Filter,
  X,
  Search,
  MapPin,
  Building2,
  Phone,
  Mail,
  Calendar,
  CreditCard,
  ChevronDown,
  ChevronUp,
  Users,
  DollarSign,
} from 'lucide-react';

export interface ClienteFilters {
  search: string;
  status: string;
  tipoContato: string;
  cidade: string;
  estado: string;
  consumidorFinal: string;
  dataInicio: string;
  dataFim: string;
  temEmail: string;
  temTelefone: string;
  temLimiteCredito: string;
  faixaLimiteMin: string;
  faixaLimiteMax: string;
  ultimaCompraInicio: string;
  ultimaCompraFim: string;
}

interface ClienteFiltersProps {
  filters: ClienteFilters;
  onFiltersChange: (filters: ClienteFilters) => void;
  onClearFilters: () => void;
  cidades?: string[];
  estados?: string[];
}

export function ClienteFilters({
  filters,
  onFiltersChange,
  onClearFilters,
  cidades = [],
  estados = [],
}: ClienteFiltersProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  const updateFilter = (key: keyof ClienteFilters, value: string) => {
    onFiltersChange({
      ...filters,
      [key]: value,
    });
  };

  const getActiveFiltersCount = () => {
    return Object.entries(filters).filter(([key, value]) => {
      if (key === 'search') return false; // Busca não conta como filtro avançado
      return value && value !== '' && value !== 'todos';
    }).length;
  };

  const hasActiveFilters = getActiveFiltersCount() > 0;

  const getActiveFiltersLabels = () => {
    const labels: string[] = [];

    if (filters.status && filters.status !== 'todos') labels.push(`Status: ${filters.status}`);
    if (filters.tipoContato && filters.tipoContato !== 'todos') labels.push(`Tipo: ${filters.tipoContato}`);
    if (filters.cidade && filters.cidade !== 'todos') labels.push(`Cidade: ${filters.cidade}`);
    if (filters.estado && filters.estado !== 'todos') labels.push(`Estado: ${filters.estado}`);
    if (filters.consumidorFinal && filters.consumidorFinal !== 'todos') labels.push(`Consumidor Final: ${filters.consumidorFinal === 'true' ? 'Sim' : 'Não'}`);
    if (filters.dataInicio) labels.push(`Cadastro de: ${new Date(filters.dataInicio).toLocaleDateString('pt-BR')}`);
    if (filters.dataFim) labels.push(`Cadastro até: ${new Date(filters.dataFim).toLocaleDateString('pt-BR')}`);
    if (filters.temEmail && filters.temEmail !== 'todos') labels.push(`Com Email: ${filters.temEmail === 'true' ? 'Sim' : 'Não'}`);
    if (filters.temTelefone && filters.temTelefone !== 'todos') labels.push(`Com Telefone: ${filters.temTelefone === 'true' ? 'Sim' : 'Não'}`);
    if (filters.temLimiteCredito && filters.temLimiteCredito !== 'todos') labels.push(`Com Limite: ${filters.temLimiteCredito === 'true' ? 'Sim' : 'Não'}`);
    if (filters.faixaLimiteMin) labels.push(`Limite min: R$ ${filters.faixaLimiteMin}`);
    if (filters.faixaLimiteMax) labels.push(`Limite max: R$ ${filters.faixaLimiteMax}`);
    if (filters.ultimaCompraInicio) labels.push(`Compra de: ${new Date(filters.ultimaCompraInicio).toLocaleDateString('pt-BR')}`);
    if (filters.ultimaCompraFim) labels.push(`Compra até: ${new Date(filters.ultimaCompraFim).toLocaleDateString('pt-BR')}`);

    return labels;
  };

  return (
    <div className="space-y-4">
      {/* Busca Principal */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome, CNPJ/CPF, email..."
            value={filters.search}
            onChange={(e) => updateFilter('search', e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Limpar Filtros (quando há filtros ativos) */}
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearFilters}
            className="gap-2"
          >
            <X className="h-4 w-4" />
            Limpar Filtros
          </Button>
        )}
      </div>

      {/* Card de Filtros Avançados */}
      <Card>
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Filter className="h-5 w-5 text-muted-foreground" />
                  <CardTitle className="text-lg">Filtros Avançados</CardTitle>
                  {hasActiveFilters && (
                    <Badge variant="secondary" className="ml-2">
                      {getActiveFiltersCount()} ativo{getActiveFiltersCount() > 1 ? 's' : ''}
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {hasActiveFilters && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onClearFilters();
                      }}
                      className="h-8 px-2 text-xs"
                    >
                      Limpar
                    </Button>
                  )}
                  {isOpen ? (
                    <ChevronUp className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
              </div>
              <CardDescription>
                Refine sua busca com filtros específicos
              </CardDescription>
            </CardHeader>
          </CollapsibleTrigger>

          <CollapsibleContent>
            <CardContent className="space-y-6 pt-0">
              {/* Seção 1: Informações Básicas */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  <Label className="text-sm font-semibold">Informações Básicas</Label>
                </div>
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="space-y-2">
                    <Label className="text-sm">Status</Label>
                    <Select
                      value={filters.status}
                      onValueChange={(value) => updateFilter('status', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Todos" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="todos">Todos</SelectItem>
                        <SelectItem value="Ativo">Ativo</SelectItem>
                        <SelectItem value="Inativo">Inativo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm">Tipo de Contato</Label>
                    <Select
                      value={filters.tipoContato}
                      onValueChange={(value) => updateFilter('tipoContato', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Todos" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="todos">Todos</SelectItem>
                        <SelectItem value="Cliente">Cliente</SelectItem>
                        <SelectItem value="Fornecedor">Fornecedor</SelectItem>
                        <SelectItem value="Ambos">Ambos</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm">Consumidor Final</Label>
                    <Select
                      value={filters.consumidorFinal}
                      onValueChange={(value) => updateFilter('consumidorFinal', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Todos" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="todos">Todos</SelectItem>
                        <SelectItem value="true">Sim</SelectItem>
                        <SelectItem value="false">Não</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Seção 2: Localização */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <Label className="text-sm font-semibold">Localização</Label>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label className="text-sm">Estado</Label>
                    <Select
                      value={filters.estado}
                      onValueChange={(value) => updateFilter('estado', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Todos os estados" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="todos">Todos os estados</SelectItem>
                        {estados.map((estado) => (
                          <SelectItem key={estado} value={estado}>
                            {estado}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm">Cidade</Label>
                    <Select
                      value={filters.cidade}
                      onValueChange={(value) => updateFilter('cidade', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Todas as cidades" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="todos">Todas as cidades</SelectItem>
                        {cidades.map((cidade) => (
                          <SelectItem key={cidade} value={cidade}>
                            {cidade}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Seção 3: Informações de Contato */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <Label className="text-sm font-semibold">Informações de Contato</Label>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label className="text-sm">Possui Email</Label>
                    <Select
                      value={filters.temEmail}
                      onValueChange={(value) => updateFilter('temEmail', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Todos" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="todos">Todos</SelectItem>
                        <SelectItem value="true">Sim</SelectItem>
                        <SelectItem value="false">Não</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm">Possui Telefone</Label>
                    <Select
                      value={filters.temTelefone}
                      onValueChange={(value) => updateFilter('temTelefone', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Todos" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="todos">Todos</SelectItem>
                        <SelectItem value="true">Sim</SelectItem>
                        <SelectItem value="false">Não</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Seção 4: Informações Financeiras */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <Label className="text-sm font-semibold">Informações Financeiras</Label>
                </div>
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="space-y-2">
                    <Label className="text-sm">Possui Limite de Crédito</Label>
                    <Select
                      value={filters.temLimiteCredito}
                      onValueChange={(value) => updateFilter('temLimiteCredito', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Todos" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="todos">Todos</SelectItem>
                        <SelectItem value="true">Sim</SelectItem>
                        <SelectItem value="false">Não</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm">Limite Mínimo (R$)</Label>
                    <Input
                      type="number"
                      placeholder="0,00"
                      value={filters.faixaLimiteMin}
                      onChange={(e) => updateFilter('faixaLimiteMin', e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm">Limite Máximo (R$)</Label>
                    <Input
                      type="number"
                      placeholder="999999,99"
                      value={filters.faixaLimiteMax}
                      onChange={(e) => updateFilter('faixaLimiteMax', e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Seção 5: Data de Cadastro */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <Label className="text-sm font-semibold">Data de Cadastro</Label>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label className="text-sm">De</Label>
                    <Input
                      type="date"
                      value={filters.dataInicio}
                      onChange={(e) => updateFilter('dataInicio', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm">Até</Label>
                    <Input
                      type="date"
                      value={filters.dataFim}
                      onChange={(e) => updateFilter('dataFim', e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Seção 6: Última Compra */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <Label className="text-sm font-semibold">Última Compra</Label>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label className="text-sm">De</Label>
                    <Input
                      type="date"
                      value={filters.ultimaCompraInicio}
                      onChange={(e) => updateFilter('ultimaCompraInicio', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm">Até</Label>
                    <Input
                      type="date"
                      value={filters.ultimaCompraFim}
                      onChange={(e) => updateFilter('ultimaCompraFim', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>

      {/* Filtros Ativos */}
      {hasActiveFilters && (
        <Card className="bg-muted/30">
          <CardContent className="pt-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-medium text-muted-foreground">
                Filtros ativos ({getActiveFiltersCount()}):
              </span>
              {getActiveFiltersLabels().map((label, index) => (
                <Badge key={index} variant="secondary" className="gap-1 text-xs">
                  {label}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-3 w-3 p-0 hover:bg-transparent"
                    onClick={() => {
                      // Lógica simplificada para remover filtros específicos
                      if (label.includes('Status:')) updateFilter('status', 'todos');
                      else if (label.includes('Tipo:')) updateFilter('tipoContato', 'todos');
                      else if (label.includes('Cidade:')) updateFilter('cidade', 'todos');
                      else if (label.includes('Estado:')) updateFilter('estado', 'todos');
                      else if (label.includes('Consumidor Final:')) updateFilter('consumidorFinal', 'todos');
                      else if (label.includes('Cadastro de:')) updateFilter('dataInicio', '');
                      else if (label.includes('Cadastro até:')) updateFilter('dataFim', '');
                      else if (label.includes('Com Email:')) updateFilter('temEmail', 'todos');
                      else if (label.includes('Com Telefone:')) updateFilter('temTelefone', 'todos');
                      else if (label.includes('Com Limite:')) updateFilter('temLimiteCredito', 'todos');
                      else if (label.includes('Limite min:')) updateFilter('faixaLimiteMin', '');
                      else if (label.includes('Limite max:')) updateFilter('faixaLimiteMax', '');
                      else if (label.includes('Compra de:')) updateFilter('ultimaCompraInicio', '');
                      else if (label.includes('Compra até:')) updateFilter('ultimaCompraFim', '');
                    }}
                  >
                    <X className="h-2 w-2" />
                  </Button>
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
