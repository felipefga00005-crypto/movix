'use client';

import { useState } from 'react';
import { Cliente, CreateClienteRequest } from '@/lib/services/cliente.service';
import { ClienteForm } from './cliente-form';
import { Button } from '@/components/ui/button';
import { Loader2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface ClienteFormDialogProps {
  open: boolean;
  onClose: () => void;
  cliente: Cliente | null;
  onSubmit: (data: CreateClienteRequest) => Promise<void>;
}

export function ClienteFormDialog({ open, onClose, cliente, onSubmit }: ClienteFormDialogProps) {
  const [loading, setLoading] = useState(false);
  const [errorDialogOpen, setErrorDialogOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState({ title: '', description: '' });

  const handleSubmit = async (data: CreateClienteRequest) => {

    setLoading(true);
    try {
      await onSubmit(data);
    } catch (error: any) {
      // Tratamento de erros específicos
      const errorMsg = error?.message || String(error);

      if (errorMsg.includes('duplicate key') && errorMsg.includes('cnpjcpf')) {
        setErrorMessage({
          title: 'CNPJ/CPF já cadastrado',
          description: 'Já existe um cliente cadastrado com este CNPJ/CPF. Por favor, verifique os dados e tente novamente.',
        });
        setErrorDialogOpen(true);
      } else if (errorMsg.includes('duplicate key') && errorMsg.includes('email')) {
        setErrorMessage({
          title: 'Email já cadastrado',
          description: 'Já existe um cliente cadastrado com este email. Por favor, utilize outro email.',
        });
        setErrorDialogOpen(true);
      } else if (errorMsg.includes('duplicate key')) {
        setErrorMessage({
          title: 'Registro duplicado',
          description: 'Já existe um registro com estas informações. Por favor, verifique os dados.',
        });
        setErrorDialogOpen(true);
      } else if (errorMsg.includes('required') || errorMsg.includes('obrigatório')) {
        setErrorMessage({
          title: 'Campos obrigatórios',
          description: 'Por favor, preencha todos os campos obrigatórios antes de continuar.',
        });
        setErrorDialogOpen(true);
      } else if (errorMsg.includes('invalid') || errorMsg.includes('inválido')) {
        setErrorMessage({
          title: 'Dados inválidos',
          description: 'Alguns dados fornecidos são inválidos. Por favor, verifique e tente novamente.',
        });
        setErrorDialogOpen(true);
      } else {
        setErrorMessage({
          title: 'Erro ao salvar cliente',
          description: errorMsg || 'Ocorreu um erro inesperado. Por favor, tente novamente.',
        });
        setErrorDialogOpen(true);
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

      {/* AlertDialog de Erro */}
      <AlertDialog open={errorDialogOpen} onOpenChange={setErrorDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              <AlertDialogTitle>{errorMessage.title}</AlertDialogTitle>
            </div>
            <AlertDialogDescription className="pt-2">
              {errorMessage.description}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setErrorDialogOpen(false)}>
              Entendi
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Dialog>
  );
}

