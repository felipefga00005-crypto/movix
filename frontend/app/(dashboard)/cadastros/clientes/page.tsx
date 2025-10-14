'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Users, UserCheck, UserX, TrendingUp } from "lucide-react";
import { ClientesTable } from "@/components/cadastros/clientes/clientes-table";
import { ClienteFormDialog } from "@/components/cadastros/clientes/cliente-form-dialog";
import { ClienteFilters, type ClienteFilters as ClienteFiltersType } from "@/components/cadastros/clientes/clientes-filters";
import { useClientes, useClienteStats } from "@/hooks/use-clientes";
import { Cliente } from "@/lib/services/cliente.service";

export default function ClientesPage() {
  const router = useRouter();
  const { clientes, loading, createCliente, updateCliente, deleteCliente } = useClientes();
  const { stats } = useClienteStats();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(null);

  // Estado dos filtros
  const [filters, setFilters] = useState<ClienteFiltersType>({
    search: '',
    status: 'todos',
    tipoContato: 'todos',
    cidade: 'todos',
    estado: 'todos',
    consumidorFinal: 'todos',
    dataInicio: '',
    dataFim: '',
    temEmail: 'todos',
    temTelefone: 'todos',
    temLimiteCredito: 'todos',
    faixaLimiteMin: '',
    faixaLimiteMax: '',
    ultimaCompraInicio: '',
    ultimaCompraFim: '',
  });

  const handleEdit = (cliente: Cliente) => {
    setSelectedCliente(cliente);
    setIsDialogOpen(true);
  };

  const handleView = (cliente: Cliente) => {
    router.push(`/cadastros/clientes/${cliente.id}`);
  };

  const handleCreate = () => {
    setSelectedCliente(null);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setSelectedCliente(null);
  };

  // Lógica de filtragem
  const filteredClientes = useMemo(() => {
    if (!clientes) return [];

    return clientes.filter((cliente) => {
      // Busca geral
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        const searchFields = [
          cliente.nome || '',
          cliente.razao_social || '',
          cliente.nome_fantasia || '',
          cliente.email || '',
          cliente.cnpj_cpf || '',
          cliente.cpf || '',
        ].join(' ').toLowerCase();

        if (!searchFields.includes(searchTerm)) {
          return false;
        }
      }

      // Filtro por status
      if (filters.status && filters.status !== 'todos' && cliente.status !== filters.status) {
        return false;
      }

      // Filtro por tipo de contato
      if (filters.tipoContato && filters.tipoContato !== 'todos' && cliente.tipo_contato !== filters.tipoContato) {
        return false;
      }

      // Filtro por cidade
      if (filters.cidade && filters.cidade !== 'todos' && cliente.cidade !== filters.cidade) {
        return false;
      }

      // Filtro por estado
      if (filters.estado && filters.estado !== 'todos' && cliente.estado !== filters.estado) {
        return false;
      }

      // Filtro por consumidor final
      if (filters.consumidorFinal && filters.consumidorFinal !== 'todos') {
        const isConsumidorFinal = filters.consumidorFinal === 'true';
        if (cliente.consumidor_final !== isConsumidorFinal) {
          return false;
        }
      }

      // Filtro por data de cadastro
      if (filters.dataInicio || filters.dataFim) {
        const dataCadastro = new Date(cliente.data_cadastro);

        if (filters.dataInicio) {
          const dataInicio = new Date(filters.dataInicio);
          if (dataCadastro < dataInicio) {
            return false;
          }
        }

        if (filters.dataFim) {
          const dataFim = new Date(filters.dataFim);
          dataFim.setHours(23, 59, 59, 999); // Inclui o dia inteiro
          if (dataCadastro > dataFim) {
            return false;
          }
        }
      }

      // Filtro por email
      if (filters.temEmail && filters.temEmail !== 'todos') {
        const temEmail = filters.temEmail === 'true';
        const clienteTemEmail = !!(cliente.email && cliente.email.trim() !== '');
        if (clienteTemEmail !== temEmail) {
          return false;
        }
      }

      // Filtro por telefone
      if (filters.temTelefone && filters.temTelefone !== 'todos') {
        const temTelefone = filters.temTelefone === 'true';
        const clienteTemTelefone = !!(
          (cliente.celular && cliente.celular.trim() !== '') ||
          (cliente.telefone_fixo && cliente.telefone_fixo.trim() !== '') ||
          (cliente.fone && cliente.fone.trim() !== '')
        );
        if (clienteTemTelefone !== temTelefone) {
          return false;
        }
      }

      // Filtro por limite de crédito
      if (filters.temLimiteCredito && filters.temLimiteCredito !== 'todos') {
        const temLimite = filters.temLimiteCredito === 'true';
        const clienteTemLimite = !!(cliente.limite_credito && Number(cliente.limite_credito) > 0);
        if (clienteTemLimite !== temLimite) {
          return false;
        }
      }

      // Filtro por faixa de limite de crédito
      if (filters.faixaLimiteMin || filters.faixaLimiteMax) {
        const limiteCliente = Number(cliente.limite_credito) || 0;

        if (filters.faixaLimiteMin) {
          const limiteMin = Number(filters.faixaLimiteMin);
          if (limiteCliente < limiteMin) {
            return false;
          }
        }

        if (filters.faixaLimiteMax) {
          const limiteMax = Number(filters.faixaLimiteMax);
          if (limiteCliente > limiteMax) {
            return false;
          }
        }
      }

      // Filtro por última compra
      if (filters.ultimaCompraInicio || filters.ultimaCompraFim) {
        if (!cliente.ultima_compra) {
          return false; // Se não tem data de última compra, não passa no filtro
        }

        const ultimaCompra = new Date(cliente.ultima_compra);

        if (filters.ultimaCompraInicio) {
          const dataInicio = new Date(filters.ultimaCompraInicio);
          if (ultimaCompra < dataInicio) {
            return false;
          }
        }

        if (filters.ultimaCompraFim) {
          const dataFim = new Date(filters.ultimaCompraFim);
          dataFim.setHours(23, 59, 59, 999);
          if (ultimaCompra > dataFim) {
            return false;
          }
        }
      }

      return true;
    });
  }, [clientes, filters]);

  // Extrair listas únicas para os filtros
  const cidades = useMemo(() => {
    if (!clientes) return [];
    const cidadesSet = new Set(
      clientes
        .map(cliente => cliente.cidade)
        .filter(cidade => cidade && cidade.trim() !== '')
    );
    return Array.from(cidadesSet).sort();
  }, [clientes]);

  const estados = useMemo(() => {
    if (!clientes) return [];
    const estadosSet = new Set(
      clientes
        .map(cliente => cliente.estado)
        .filter(estado => estado && estado.trim() !== '')
    );
    return Array.from(estadosSet).sort();
  }, [clientes]);

  const handleFiltersChange = (newFilters: ClienteFiltersType) => {
    setFilters(newFilters);
  };

  const handleClearFilters = () => {
    setFilters({
      search: '',
      status: 'todos',
      tipoContato: 'todos',
      cidade: 'todos',
      estado: 'todos',
      consumidorFinal: 'todos',
      dataInicio: '',
      dataFim: '',
      temEmail: 'todos',
      temTelefone: 'todos',
      temLimiteCredito: 'todos',
      faixaLimiteMin: '',
      faixaLimiteMax: '',
      ultimaCompraInicio: '',
      ultimaCompraFim: '',
    });
  };

  return (
    <div className="@container/main flex flex-1 flex-col gap-2">
      <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
        {/* Header */}
        <div className="flex items-center justify-end px-4 lg:px-6">
          <Button onClick={handleCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Novo Cliente
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 px-4 md:grid-cols-2 lg:grid-cols-4 lg:px-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total de Clientes
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.total || 0}</div>
              <p className="text-xs text-muted-foreground">
                Clientes cadastrados
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Clientes Ativos
              </CardTitle>
              <UserCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.ativos || 0}</div>
              <p className="text-xs text-muted-foreground">
                Com status ativo
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Clientes Inativos
              </CardTitle>
              <UserX className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.inativos || 0}</div>
              <p className="text-xs text-muted-foreground">
                Com status inativo
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Novos este Mês
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.novos_mes || 0}</div>
              <p className="text-xs text-muted-foreground">
                Cadastrados recentemente
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filtros */}
        <div className="px-4 lg:px-6">
          <ClienteFilters
            filters={filters}
            onFiltersChange={handleFiltersChange}
            onClearFilters={handleClearFilters}
            cidades={cidades}
            estados={estados}
          />
        </div>

        {/* Table */}
        <div className="px-4 lg:px-6">
          <ClientesTable
            clientes={filteredClientes}
            onEdit={handleEdit}
            onView={handleView}
            onDelete={deleteCliente}
            loading={loading}
          />
        </div>
      </div>

      {/* Dialog for Create/Edit */}
      <ClienteFormDialog
        open={isDialogOpen}
        onClose={handleCloseDialog}
        cliente={selectedCliente}
        onSubmit={async (data) => {
          if (selectedCliente) {
            await updateCliente(selectedCliente.id, data);
          } else {
            await createCliente(data);
          }
          handleCloseDialog();
        }}
      />
    </div>
  );
}
