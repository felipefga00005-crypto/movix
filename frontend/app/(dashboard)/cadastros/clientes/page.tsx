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

        {/* Table */}
        <div className="px-4 lg:px-6">
          <ClientesTable
            clientes={clientes}
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
