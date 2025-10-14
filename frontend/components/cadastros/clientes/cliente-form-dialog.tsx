'use client';

import { useState } from 'react';
import { Cliente, CreateClienteRequest } from '@/lib/services/cliente.service';
import { ClienteForm } from './cliente-form';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
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
  onSubmit: (data: CreateClienteRequest) => Promise<void>;
}

export function ClienteFormDialog({ open, onClose, cliente, onSubmit }: ClienteFormDialogProps) {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (data: CreateClienteRequest) => {
    setLoading(true);
    try {
      await onSubmit(data);
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
            {cliente ? 'Editar Cliente' : 'Novo Cliente'}
          </DialogTitle>
          <DialogDescription>
            {cliente
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
          />
        </div>

        {/* Footer Fixo */}
        <DialogFooter className="px-6 py-4 border-t shrink-0">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" form="cliente-form" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {cliente ? 'Atualizar' : 'Criar'} Cliente
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

