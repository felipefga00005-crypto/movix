'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { clienteService, Cliente } from '@/lib/services/cliente.service';
import { ClienteFormDialog } from '@/components/cadastros/clientes/cliente-form-dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Edit, Trash2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export default function ClienteViewPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  useEffect(() => {
    loadCliente();
  }, [id]);

  const loadCliente = async () => {
    try {
      setLoading(true);
      const data = await clienteService.getById(Number(id));
      setCliente(data);
    } catch (error) {
      toast.error('Erro ao carregar cliente');
      router.push('/cadastros/clientes');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setEditDialogOpen(true);
  };

  const handleUpdate = async (data: any) => {
    await clienteService.update(Number(id), data);
    toast.success('Cliente atualizado com sucesso!');
    setEditDialogOpen(false);
    loadCliente(); // Recarrega os dados
  };

  const handleDelete = async () => {
    try {
      setDeleting(true);
      await clienteService.delete(Number(id));
      toast.success('Cliente excluído com sucesso!');
      router.push('/cadastros/clientes');
    } catch (error) {
      toast.error('Erro ao excluir cliente');
    } finally {
      setDeleting(false);
      setDeleteDialogOpen(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!cliente) {
    return null;
  }

  const clienteData = cliente as any;

  return (
    <div className="@container/main flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{clienteData.razao_social || clienteData.nome}</h1>
            <p className="text-sm text-muted-foreground">
              {clienteData.nome_fantasia && `${clienteData.nome_fantasia} • `}
              {clienteData.cnpj_cpf || clienteData.cpf}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={cliente.status === 'Ativo' ? 'default' : 'secondary'}>
            {cliente.status}
          </Badge>
          <Button variant="outline" onClick={handleEdit}>
            <Edit className="mr-2 h-4 w-4" />
            Editar
          </Button>
          <Button variant="destructive" onClick={() => setDeleteDialogOpen(true)}>
            <Trash2 className="mr-2 h-4 w-4" />
            Excluir
          </Button>
        </div>
      </div>

      <Separator />

      {/* Dados Básicos */}
      <Card>
        <CardHeader>
          <CardTitle>Dados Básicos</CardTitle>
          <CardDescription>Informações principais do cliente</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div>
            <p className="text-sm font-medium text-muted-foreground">CPF/CNPJ</p>
            <p className="text-base">{clienteData.cnpj_cpf || clienteData.cpf || '-'}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">IE/RG</p>
            <p className="text-base">{clienteData.ie || clienteData.ie_rg || '-'}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Inscrição Municipal</p>
            <p className="text-base">{clienteData.im || clienteData.inscricao_municipal || '-'}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Razão Social / Nome</p>
            <p className="text-base">{clienteData.razao_social || cliente.nome}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Nome Fantasia</p>
            <p className="text-base">{cliente.nome_fantasia || '-'}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Tipo de Contato</p>
            <p className="text-base">{cliente.tipo_contato}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Consumidor Final</p>
            <p className="text-base">{cliente.consumidor_final ? 'Sim' : 'Não'}</p>
          </div>
        </CardContent>
      </Card>

      {/* Contatos */}
      <Card>
        <CardHeader>
          <CardTitle>Contatos</CardTitle>
          <CardDescription>Informações de contato</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Email</p>
            <p className="text-base">{cliente.email || '-'}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Telefone Fixo</p>
            <p className="text-base">{clienteData.fone || clienteData.telefone_fixo || '-'}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Celular</p>
            <p className="text-base">{cliente.celular || '-'}</p>
          </div>
          <div className="md:col-span-2 lg:col-span-3">
            <p className="text-sm font-medium text-muted-foreground">Ponto de Referência</p>
            <p className="text-base">{cliente.ponto_referencia || '-'}</p>
          </div>
        </CardContent>
      </Card>

      {/* Endereço Principal */}
      <Card>
        <CardHeader>
          <CardTitle>Endereço Principal</CardTitle>
          <CardDescription>Endereço fiscal do cliente</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div className="md:col-span-2">
            <p className="text-sm font-medium text-muted-foreground">Logradouro</p>
            <p className="text-base">{clienteData.logradouro || cliente.endereco || '-'}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Número</p>
            <p className="text-base">{cliente.numero || '-'}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Complemento</p>
            <p className="text-base">{cliente.complemento || '-'}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Bairro</p>
            <p className="text-base">{cliente.bairro || '-'}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">CEP</p>
            <p className="text-base">{cliente.cep || '-'}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Cidade</p>
            <p className="text-base">{clienteData.municipio || cliente.cidade || '-'}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Estado</p>
            <p className="text-base">{clienteData.uf || cliente.estado || '-'}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Código IBGE</p>
            <p className="text-base">{cliente.codigo_ibge || '-'}</p>
          </div>
        </CardContent>
      </Card>

      {/* Endereço de Entrega */}
      {(clienteData.logradouro_entrega || cliente.endereco_entrega) && (
        <Card>
          <CardHeader>
            <CardTitle>Endereço de Entrega</CardTitle>
            <CardDescription>Endereço alternativo para entrega</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <div className="md:col-span-2">
              <p className="text-sm font-medium text-muted-foreground">Logradouro</p>
              <p className="text-base">{clienteData.logradouro_entrega || cliente.endereco_entrega || '-'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Número</p>
              <p className="text-base">{cliente.numero_entrega || '-'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Complemento</p>
              <p className="text-base">{cliente.complemento_entrega || '-'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Bairro</p>
              <p className="text-base">{cliente.bairro_entrega || '-'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">CEP</p>
              <p className="text-base">{cliente.cep_entrega || '-'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Cidade</p>
              <p className="text-base">{clienteData.municipio_entrega || cliente.cidade_entrega || '-'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Estado</p>
              <p className="text-base">{clienteData.uf_entrega || cliente.estado_entrega || '-'}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Dados Financeiros */}
      <Card>
        <CardHeader>
          <CardTitle>Dados Financeiros</CardTitle>
          <CardDescription>Informações financeiras e comerciais</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Limite de Crédito</p>
            <p className="text-base">
              {cliente.limite_credito 
                ? `R$ ${Number(cliente.limite_credito).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
                : '-'}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Saldo Inicial</p>
            <p className="text-base">
              {cliente.saldo_inicial 
                ? `R$ ${Number(cliente.saldo_inicial).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
                : '-'}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Prazo de Pagamento</p>
            <p className="text-base">{cliente.prazo_pagamento ? `${cliente.prazo_pagamento} dias` : '-'}</p>
          </div>
        </CardContent>
      </Card>

      {/* Dialog de Edição */}
      <ClienteFormDialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        cliente={cliente}
        onSubmit={handleUpdate}
      />

      {/* Dialog de Confirmação de Exclusão */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o cliente <strong>{clienteData.razao_social || cliente.nome}</strong>?
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={deleting} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {deleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

