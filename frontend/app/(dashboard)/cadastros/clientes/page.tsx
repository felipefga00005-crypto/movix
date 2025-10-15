'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Users, UserCheck, UserX, TrendingUp } from "lucide-react";
import { ClientesTable } from "@/components/cadastros/clientes/clientes-table";
import { ClienteFormDialog } from "@/components/cadastros/clientes/cliente-form-dialog";
import { useClientes, useClienteStats } from "@/hooks/use-clientes";
import { Cliente } from "@/lib/services/cliente.service";

export default function ClientesPage() {
  const router = useRouter();
  const { clientes, loading, createCliente, updateCliente, deleteCliente } = useClientes();
  const { stats } = useClienteStats();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(null);

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

  // Funções para ações em massa
  const handleBulkDelete = async (ids: number[]) => {
    try {
      // Implementar exclusão em massa
      for (const id of ids) {
        await deleteCliente(id);
      }
      // Mostrar notificação de sucesso
      console.log(`${ids.length} cliente(s) excluído(s) com sucesso`);
    } catch (error) {
      console.error('Erro ao excluir clientes:', error);
    }
  };

  const handleBulkStatusChange = async (ids: number[], status: string) => {
    try {
      // Implementar alteração de status em massa
      for (const id of ids) {
        const cliente = clientes?.find(c => c.id === id);
        if (cliente) {
          await updateCliente(id, { ...cliente, status } as any);
        }
      }
      // Mostrar notificação de sucesso
      console.log(`Status de ${ids.length} cliente(s) alterado para ${status}`);
    } catch (error) {
      console.error('Erro ao alterar status dos clientes:', error);
    }
  };

  const handleBulkExport = (clientes: any[]) => {
    // A exportação já é tratada no componente da tabela
    console.log(`Exportando ${clientes.length} cliente(s) selecionado(s)`);
  };



  return (
    <div className="@container/main flex flex-1 flex-col gap-2">
      <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
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

        {/* Table com Sistema de Filtros Integrado */}
        <div className="px-4 lg:px-6">
          <ClientesTable
            clientes={clientes || []}
            onEdit={handleEdit}
            onView={handleView}
            onDelete={deleteCliente}
            onBulkDelete={handleBulkDelete}
            onBulkStatusChange={handleBulkStatusChange}
            onBulkExport={handleBulkExport}
            onCreate={handleCreate}
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
