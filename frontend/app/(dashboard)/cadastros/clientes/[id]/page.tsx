'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { clienteService, Cliente } from '@/lib/services/cliente.service';
import { ClienteFormDialog } from '@/components/cadastros/clientes/cliente-form-dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  ArrowLeft,
  Edit,
  Trash2,
  Loader2,
  User,
  Building2,
  Phone,
  Mail,
  MapPin,
  CreditCard,
  Calendar,
  FileText,
  Settings,
  Copy,
  ExternalLink,
  MoreHorizontal
} from 'lucide-react';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

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

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copiado para a área de transferência`);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="@container/main flex flex-1 flex-col gap-6 p-4 lg:gap-8 lg:p-6">
      {/* Header Moderno */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex items-start gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="mt-1">
            <ArrowLeft className="h-4 w-4" />
          </Button>

          <div className="flex items-start gap-4">
            <Avatar className="h-16 w-16 lg:h-20 lg:w-20">
              <AvatarFallback className="text-lg font-semibold bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                {getInitials(clienteData.razao_social || clienteData.nome)}
              </AvatarFallback>
            </Avatar>

            <div className="space-y-2">
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">
                  {clienteData.razao_social || clienteData.nome}
                </h1>
                {clienteData.nome_fantasia && (
                  <p className="text-lg text-muted-foreground font-medium">
                    {clienteData.nome_fantasia}
                  </p>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Badge
                  variant={cliente.status === 'Ativo' ? 'default' : 'secondary'}
                  className="text-xs"
                >
                  {cliente.status}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {cliente.tipo_contato}
                </Badge>
                {cliente.consumidor_final && (
                  <Badge variant="outline" className="text-xs">
                    Consumidor Final
                  </Badge>
                )}
              </div>

              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <FileText className="h-4 w-4" />
                  <span>{clienteData.cnpj_cpf || clienteData.cpf}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={() => copyToClipboard(clienteData.cnpj_cpf || clienteData.cpf, 'CPF/CNPJ')}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
                {cliente.email && (
                  <div className="flex items-center gap-1">
                    <Mail className="h-4 w-4" />
                    <span>{cliente.email}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleEdit} className="gap-2">
            <Edit className="h-4 w-4" />
            Editar
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Ações</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => copyToClipboard(window.location.href, 'Link')}>
                <ExternalLink className="h-4 w-4 mr-2" />
                Copiar Link
              </DropdownMenuItem>
              <DropdownMenuItem>
                <FileText className="h-4 w-4 mr-2" />
                Gerar Relatório
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => setDeleteDialogOpen(true)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Excluir Cliente
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Tabs Modernas */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:grid-cols-4">
          <TabsTrigger value="overview" className="gap-2">
            <User className="h-4 w-4" />
            Visão Geral
          </TabsTrigger>
          <TabsTrigger value="contact" className="gap-2">
            <Phone className="h-4 w-4" />
            Contato
          </TabsTrigger>
          <TabsTrigger value="address" className="gap-2">
            <MapPin className="h-4 w-4" />
            Endereços
          </TabsTrigger>
          <TabsTrigger value="financial" className="gap-2">
            <CreditCard className="h-4 w-4" />
            Financeiro
          </TabsTrigger>
        </TabsList>

        {/* Tab: Visão Geral */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Dados Básicos */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-muted-foreground" />
                  <CardTitle className="text-lg">Dados Básicos</CardTitle>
                </div>
                <CardDescription>Informações principais do cliente</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">CPF/CNPJ</p>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-mono">{clienteData.cnpj_cpf || clienteData.cpf || '-'}</p>
                      {(clienteData.cnpj_cpf || clienteData.cpf) && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={() => copyToClipboard(clienteData.cnpj_cpf || clienteData.cpf, 'CPF/CNPJ')}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">IE/RG</p>
                    <p className="text-sm">{clienteData.ie || clienteData.ie_rg || '-'}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Inscrição Municipal</p>
                    <p className="text-sm">{clienteData.im || clienteData.inscricao_municipal || '-'}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Tipo de Contato</p>
                    <Badge variant="outline" className="text-xs">
                      {cliente.tipo_contato}
                    </Badge>
                  </div>
                </div>

                <Separator />

                <div className="space-y-3">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Razão Social / Nome</p>
                    <p className="font-medium">{clienteData.razao_social || cliente.nome}</p>
                  </div>
                  {cliente.nome_fantasia && (
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">Nome Fantasia</p>
                      <p className="text-sm">{cliente.nome_fantasia}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Informações Adicionais */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <Settings className="h-5 w-5 text-muted-foreground" />
                  <CardTitle className="text-lg">Informações Adicionais</CardTitle>
                </div>
                <CardDescription>Configurações e preferências</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Consumidor Final</span>
                  <Badge variant={cliente.consumidor_final ? "default" : "secondary"}>
                    {cliente.consumidor_final ? 'Sim' : 'Não'}
                  </Badge>
                </div>

                <Separator />

                <div className="space-y-3">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Data de Cadastro</p>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <p className="text-sm">{new Date(cliente.data_cadastro).toLocaleDateString('pt-BR')}</p>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Última Atualização</p>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <p className="text-sm">{new Date(cliente.data_atualizacao).toLocaleDateString('pt-BR')}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Tab: Contato */}
        <TabsContent value="contact" className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Phone className="h-5 w-5 text-muted-foreground" />
                <CardTitle className="text-lg">Informações de Contato</CardTitle>
              </div>
              <CardDescription>Canais de comunicação com o cliente</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 sm:grid-cols-2">
                {/* Email */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <p className="text-sm font-medium">Email</p>
                  </div>
                  {cliente.email ? (
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-mono">{cliente.email}</p>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={() => copyToClipboard(cliente.email, 'Email')}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={() => window.open(`mailto:${cliente.email}`)}
                      >
                        <ExternalLink className="h-3 w-3" />
                      </Button>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">Não informado</p>
                  )}
                </div>

                {/* Telefone Fixo */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <p className="text-sm font-medium">Telefone Fixo</p>
                  </div>
                  {(clienteData.fone || clienteData.telefone_fixo) ? (
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-mono">{clienteData.fone || clienteData.telefone_fixo}</p>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={() => copyToClipboard(clienteData.fone || clienteData.telefone_fixo, 'Telefone')}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={() => window.open(`tel:${clienteData.fone || clienteData.telefone_fixo}`)}
                      >
                        <ExternalLink className="h-3 w-3" />
                      </Button>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">Não informado</p>
                  )}
                </div>

                {/* Celular */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <p className="text-sm font-medium">Celular</p>
                  </div>
                  {cliente.celular ? (
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-mono">{cliente.celular}</p>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={() => copyToClipboard(cliente.celular, 'Celular')}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={() => window.open(`tel:${cliente.celular}`)}
                      >
                        <ExternalLink className="h-3 w-3" />
                      </Button>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">Não informado</p>
                  )}
                </div>
              </div>

              {/* Ponto de Referência */}
              {cliente.ponto_referencia && (
                <>
                  <Separator />
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <p className="text-sm font-medium">Ponto de Referência</p>
                    </div>
                    <p className="text-sm">{cliente.ponto_referencia}</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Endereços */}
        <TabsContent value="address" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Endereço Principal */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-muted-foreground" />
                  <CardTitle className="text-lg">Endereço Principal</CardTitle>
                </div>
                <CardDescription>Endereço fiscal do cliente</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Logradouro</p>
                    <p className="text-sm">{clienteData.logradouro || cliente.endereco || 'Não informado'}</p>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">Número</p>
                      <p className="text-sm">{cliente.numero || 'S/N'}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">Complemento</p>
                      <p className="text-sm">{cliente.complemento || '-'}</p>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Bairro</p>
                    <p className="text-sm">{cliente.bairro || 'Não informado'}</p>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">CEP</p>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-mono">{cliente.cep || 'Não informado'}</p>
                        {cliente.cep && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={() => copyToClipboard(cliente.cep, 'CEP')}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">Código IBGE</p>
                      <p className="text-sm font-mono">{cliente.codigo_ibge || '-'}</p>
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">Cidade</p>
                      <p className="text-sm">{clienteData.municipio || cliente.cidade || 'Não informado'}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">Estado</p>
                      <Badge variant="outline" className="text-xs">
                        {clienteData.uf || cliente.estado || 'N/A'}
                      </Badge>
                    </div>
                  </div>
                </div>

                {(clienteData.logradouro || cliente.endereco) && (
                  <div className="pt-3">
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2"
                      onClick={() => {
                        const address = `${clienteData.logradouro || cliente.endereco}, ${cliente.numero || 'S/N'}, ${cliente.bairro}, ${clienteData.municipio || cliente.cidade}, ${clienteData.uf || cliente.estado}`;
                        window.open(`https://maps.google.com/maps?q=${encodeURIComponent(address)}`, '_blank');
                      }}
                    >
                      <ExternalLink className="h-4 w-4" />
                      Ver no Mapa
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Endereço de Entrega */}
            {(clienteData.logradouro_entrega || cliente.endereco_entrega) && (
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-muted-foreground" />
                    <CardTitle className="text-lg">Endereço de Entrega</CardTitle>
                  </div>
                  <CardDescription>Endereço alternativo para entrega</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">Logradouro</p>
                      <p className="text-sm">{clienteData.logradouro_entrega || cliente.endereco_entrega}</p>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-muted-foreground">Número</p>
                        <p className="text-sm">{cliente.numero_entrega || 'S/N'}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-muted-foreground">Complemento</p>
                        <p className="text-sm">{cliente.complemento_entrega || '-'}</p>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">Bairro</p>
                      <p className="text-sm">{cliente.bairro_entrega || 'Não informado'}</p>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-muted-foreground">CEP</p>
                        <p className="text-sm font-mono">{cliente.cep_entrega || 'Não informado'}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-muted-foreground">Estado</p>
                        <Badge variant="outline" className="text-xs">
                          {clienteData.uf_entrega || cliente.estado_entrega || 'N/A'}
                        </Badge>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">Cidade</p>
                      <p className="text-sm">{clienteData.municipio_entrega || cliente.cidade_entrega || 'Não informado'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Tab: Financeiro */}
        <TabsContent value="financial" className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-muted-foreground" />
                <CardTitle className="text-lg">Dados Financeiros</CardTitle>
              </div>
              <CardDescription>Informações financeiras e comerciais</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {/* Limite de Crédito */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-muted-foreground" />
                    <p className="text-sm font-medium">Limite de Crédito</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-2xl font-bold text-green-600">
                      {cliente.limite_credito
                        ? `R$ ${Number(cliente.limite_credito).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
                        : 'Não definido'}
                    </p>
                    {cliente.limite_credito && (
                      <p className="text-xs text-muted-foreground">Limite disponível para compras</p>
                    )}
                  </div>
                </div>

                {/* Saldo Inicial */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-muted-foreground" />
                    <p className="text-sm font-medium">Saldo Inicial</p>
                  </div>
                  <div className="space-y-1">
                    <p className={`text-2xl font-bold ${
                      cliente.saldo_inicial && Number(cliente.saldo_inicial) >= 0
                        ? 'text-green-600'
                        : 'text-red-600'
                    }`}>
                      {cliente.saldo_inicial
                        ? `R$ ${Number(cliente.saldo_inicial).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
                        : 'R$ 0,00'}
                    </p>
                    <p className="text-xs text-muted-foreground">Saldo inicial do cliente</p>
                  </div>
                </div>

                {/* Prazo de Pagamento */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <p className="text-sm font-medium">Prazo de Pagamento</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-2xl font-bold text-blue-600">
                      {cliente.prazo_pagamento ? `${cliente.prazo_pagamento}` : '0'}
                      <span className="text-sm font-normal text-muted-foreground ml-1">dias</span>
                    </p>
                    <p className="text-xs text-muted-foreground">Prazo padrão para pagamento</p>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Resumo Financeiro */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium">Resumo Financeiro</h4>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <span className="text-sm text-muted-foreground">Status Financeiro</span>
                    <Badge variant="default">Ativo</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <span className="text-sm text-muted-foreground">Última Compra</span>
                    <span className="text-sm">
                      {cliente.ultima_compra
                        ? new Date(cliente.ultima_compra).toLocaleDateString('pt-BR')
                        : 'Nunca'
                      }
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

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

