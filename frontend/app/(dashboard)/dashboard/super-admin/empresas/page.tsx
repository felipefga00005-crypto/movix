'use client';

import { useState, useEffect } from 'react';
import { EmpresaCard } from '@/components/admin/empresa-card';
import { EmpresaForm } from '@/components/admin/empresa-form';
import { EmptyState } from '@/components/common/empty-state';
import { LoadingSpinner } from '@/components/common/loading-spinner';
import { ConfirmDialog } from '@/components/common/confirm-dialog';
import { Button } from '@/components/ui/button';
import { empresaService, type Empresa, type CreateEmpresaRequest } from '@/lib/services/empresa.service';
import { Building2, Plus } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export default function EmpresasPage() {
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedEmpresa, setSelectedEmpresa] = useState<Empresa | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [empresaToDelete, setEmpresaToDelete] = useState<Empresa | undefined>();

  useEffect(() => {
    loadEmpresas();
  }, []);

  const loadEmpresas = async () => {
    try {
      setIsLoading(true);
      const data = await empresaService.list();
      setEmpresas(data);
    } catch (error) {
      toast.error('Erro ao carregar empresas');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = () => {
    setSelectedEmpresa(undefined);
    setIsDialogOpen(true);
  };

  const handleEdit = (empresa: Empresa) => {
    setSelectedEmpresa(empresa);
    setIsDialogOpen(true);
  };

  const handleDelete = (empresa: Empresa) => {
    setEmpresaToDelete(empresa);
    setIsConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!empresaToDelete) return;

    try {
      await empresaService.delete(empresaToDelete.id);
      toast.success('Empresa deletada com sucesso');
      setIsConfirmOpen(false);
      setEmpresaToDelete(undefined);
      loadEmpresas();
    } catch (error) {
      toast.error('Erro ao deletar empresa');
    }
  };

  const handleSubmit = async (data: CreateEmpresaRequest) => {
    try {
      setIsSubmitting(true);
      if (selectedEmpresa) {
        await empresaService.update(selectedEmpresa.id, data);
        toast.success('Empresa atualizada com sucesso');
      } else {
        await empresaService.create(data);
        toast.success('Empresa criada com sucesso');
      }
      setIsDialogOpen(false);
      loadEmpresas();
    } catch (error) {
      toast.error('Erro ao salvar empresa');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      <div className="flex items-center justify-between px-4 lg:px-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Empresas</h1>
          <p className="text-muted-foreground mt-2">Gerencie as empresas do sistema</p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Nova Empresa
        </Button>
      </div>

      <div className="px-4 lg:px-6">
        {empresas.length === 0 ? (
          <EmptyState
            icon={Building2}
            title="Nenhuma empresa cadastrada"
            description="Comece criando sua primeira empresa no sistema"
            action={{
              label: 'Criar Empresa',
              onClick: handleCreate,
            }}
          />
        ) : (
          <div className="grid grid-cols-1 gap-4 @xl/main:grid-cols-2 @5xl/main:grid-cols-3">
            {empresas.map((empresa) => (
              <EmpresaCard
                key={empresa.id}
                empresa={empresa}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedEmpresa ? 'Editar Empresa' : 'Nova Empresa'}
            </DialogTitle>
            <DialogDescription>
              {selectedEmpresa
                ? 'Atualize as informações da empresa'
                : 'Preencha os dados para criar uma nova empresa'}
            </DialogDescription>
          </DialogHeader>
          <EmpresaForm
            empresa={selectedEmpresa}
            onSubmit={handleSubmit}
            onCancel={() => setIsDialogOpen(false)}
            isLoading={isSubmitting}
          />
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={isConfirmOpen}
        onOpenChange={setIsConfirmOpen}
        title="Deletar Empresa"
        description={`Tem certeza que deseja deletar a empresa "${empresaToDelete?.nome}"? Esta ação não pode ser desfeita.`}
        onConfirm={confirmDelete}
        confirmText="Deletar"
        cancelText="Cancelar"
        variant="destructive"
      />
    </div>
  );
}

