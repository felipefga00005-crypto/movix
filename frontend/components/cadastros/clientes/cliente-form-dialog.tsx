'use client';

import { Cliente, CreateClienteRequest } from '@/lib/services/cliente.service';
import { ClienteForm } from './cliente-form';
import {
  DialogLarge,
  DialogLargeContent,
  DialogLargeDescription,
  DialogLargeHeader,
  DialogLargeTitle,
} from '@/components/ui/dialog-large';

interface ClienteFormDialogProps {
  open: boolean;
  onClose: () => void;
  cliente: Cliente | null;
  onSubmit: (data: CreateClienteRequest) => Promise<void>;
}

export function ClienteFormDialog({ open, onClose, cliente, onSubmit }: ClienteFormDialogProps) {
  return (
    <DialogLarge open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogLargeContent>
        <DialogLargeHeader className="space-y-3 pb-4">
          <DialogLargeTitle className="text-3xl font-bold">
            {cliente ? 'Editar Cliente' : 'Novo Cliente'}
          </DialogLargeTitle>
          <DialogLargeDescription className="text-base">
            {cliente
              ? 'Atualize as informações do cliente'
              : 'Preencha os dados para cadastrar um novo cliente'}
          </DialogLargeDescription>
        </DialogLargeHeader>
        <div className="mt-2">
          <ClienteForm
            cliente={cliente || undefined}
            onSubmit={onSubmit}
            onCancel={onClose}
          />
        </div>
      </DialogLargeContent>
    </DialogLarge>
  );
}

