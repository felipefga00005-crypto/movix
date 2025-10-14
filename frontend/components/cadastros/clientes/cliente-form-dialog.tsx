'use client';

import { useState } from 'react';
import { Cliente, CreateClienteRequest } from '@/lib/services/cliente.service';
import { ClienteForm } from './cliente-form';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface ClienteFormDialogProps {
  open: boolean;
  onClose: () => void;
  cliente: Cliente | null;
  isViewMode?: boolean;
  onSubmit: (data: CreateClienteRequest) => Promise<void>;
}

export function ClienteFormDialog({ open, onClose, cliente, isViewMode = false, onSubmit }: ClienteFormDialogProps) {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (data: CreateClienteRequest) => {
    if (isViewMode) return; // Não permite submit em modo visualização

    setLoading(true);
    try {
      await onSubmit(data);
    } catch (error: any) {
      // Tratamento de erros específicos
      const errorMessage = error?.message || String(error);

      if (errorMessage.includes('duplicate key') && errorMessage.includes('cnpjcpf')) {
        toast.error('CNPJ/CPF já cadastrado', {
          description: 'Já existe um cliente cadastrado com este CNPJ/CPF.',
        });
      } else if (errorMessage.includes('duplicate key')) {
        toast.error('Registro duplicado', {
          description: 'Já existe um registro com estas informações.',
        });
      } else {
        toast.error('Erro ao salvar cliente', {
          description: errorMessage,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] p-0 flex flex-col gap-0">
        {/* Header Fixo */}
        <DialogHeader className="px-6 py-4 border-b shrink-0">
          <DialogTitle>
            {isViewMode ? 'Visualizar Cliente' : cliente ? 'Editar Cliente' : 'Novo Cliente'}
          </DialogTitle>
          <DialogDescription>
            {isViewMode
              ? 'Informações detalhadas do cliente'
              : cliente
              ? 'Atualize as informações do cliente'
              : 'Preencha os dados para cadastrar um novo cliente'}
          </DialogDescription>
        </DialogHeader>

        {/* Conteúdo com Scroll */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <ClienteForm
            cliente={cliente || undefined}
            onSubmit={handleSubmit}
            onCancel={onClose}
            isViewMode={isViewMode}
          />
        </div>

        {/* Footer Fixo */}
        <DialogFooter className="px-6 py-4 border-t shrink-0">
          <Button type="button" variant="outline" onClick={onClose}>
            {isViewMode ? 'Fechar' : 'Cancelar'}
          </Button>
          {!isViewMode && (
            <Button type="submit" form="cliente-form" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {cliente ? 'Atualizar' : 'Criar'} Cliente
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

