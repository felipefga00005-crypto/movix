'use client';

import { useState, useEffect } from 'react';
import { Cliente, CreateClienteRequest } from '@/lib/services/cliente.service';
import { externalAPIService } from '@/lib/services/external-api.service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { Loader2, Search } from 'lucide-react';

interface ClienteFormProps {
  cliente?: Cliente;
  onSubmit: (data: CreateClienteRequest) => Promise<void>;
  onCancel: () => void;
  isViewMode?: boolean;
}

export function ClienteForm({ cliente, onSubmit, onCancel, isViewMode = false }: ClienteFormProps) {
  const [loading, setLoading] = useState(false);
  const [loadingCEP, setLoadingCEP] = useState(false);
  const [loadingCNPJ, setLoadingCNPJ] = useState(false);

  // Mapeia os dados do cliente do backend (snake_case) para o formulário
  const clienteData = cliente as any;
  const [formData, setFormData] = useState<CreateClienteRequest>({
    cpf: clienteData?.cnpj_cpf || clienteData?.cpf || '',
    ie_rg: clienteData?.ie || clienteData?.ie_rg || '',
    inscricao_municipal: clienteData?.im || clienteData?.inscricao_municipal || '',
    nome: clienteData?.razao_social || clienteData?.nome || '',
    nome_fantasia: clienteData?.nome_fantasia || '',
    tipo_contato: clienteData?.tipo_contato || 'Cliente',
    consumidor_final: clienteData?.consumidor_final || false,
    email: clienteData?.email || '',
    ponto_referencia: clienteData?.ponto_referencia || '',
    telefone_fixo: clienteData?.fone || clienteData?.telefone_fixo || '',
    telefone_alternativo: clienteData?.telefone_alternativo || '',
    celular: clienteData?.celular || '',
    cep: clienteData?.cep || '',
    endereco: clienteData?.logradouro || clienteData?.endereco || '',
    numero: clienteData?.numero || '',
    complemento: clienteData?.complemento || '',
    bairro: clienteData?.bairro || '',
    cidade: clienteData?.municipio || clienteData?.cidade || '',
    estado: clienteData?.uf || clienteData?.estado || '',
    codigo_ibge: clienteData?.codigo_ibge || '',
    cep_entrega: clienteData?.cep_entrega || '',
    endereco_entrega: clienteData?.logradouro_entrega || clienteData?.endereco_entrega || '',
    numero_entrega: clienteData?.numero_entrega || '',
    complemento_entrega: clienteData?.complemento_entrega || '',
    bairro_entrega: clienteData?.bairro_entrega || '',
    cidade_entrega: clienteData?.municipio_entrega || clienteData?.cidade_entrega || '',
    estado_entrega: clienteData?.uf_entrega || clienteData?.estado_entrega || '',
    limite_credito: clienteData?.limite_credito?.toString() || '',
    saldo_inicial: clienteData?.saldo_inicial?.toString() || '0',
    prazo_pagamento: clienteData?.prazo_pagamento?.toString() || '',
    data_nascimento: clienteData?.data_nascimento || '',
    data_abertura: clienteData?.data_abertura || '',
    status: clienteData?.status || 'Ativo',
  });

  const handleChange = (field: keyof CreateClienteRequest, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCPFCNPJChange = (value: string) => {
    setFormData(prev => ({ ...prev, cpf: value }));

    // Remove caracteres não numéricos
    const limpo = value.replace(/\D/g, '');

    // Se tiver 14 dígitos, é CNPJ - busca automaticamente
    if (limpo.length === 14) {
      buscarCNPJ(limpo);
    }
  };

  const buscarCNPJ = async (cnpj: string) => {
    setLoadingCNPJ(true);
    try {
      const data = await externalAPIService.buscarCNPJ(cnpj);

      setFormData(prev => ({
        ...prev,
        nome: data.razao_social || prev.nome,
        nome_fantasia: data.nome_fantasia || prev.nome_fantasia,
        email: data.contato?.email || prev.email,
        telefone_fixo: data.contato?.telefone || prev.telefone_fixo,
        cep: data.endereco?.cep?.replace(/\D/g, '') || prev.cep,
        endereco: data.endereco?.logradouro || prev.endereco,
        numero: data.endereco?.numero || prev.numero,
        complemento: data.endereco?.complemento || prev.complemento,
        bairro: data.endereco?.bairro || prev.bairro,
        cidade: data.endereco?.cidade || prev.cidade,
        estado: data.endereco?.estado || prev.estado,
        ie_rg: data.inscricao_estadual || prev.ie_rg,
        data_abertura: data.data_abertura || prev.data_abertura,
      }));

      toast.success('Dados do CNPJ carregados com sucesso!');
    } catch (error) {
      toast.error('CNPJ não encontrado ou inválido');
    } finally {
      setLoadingCNPJ(false);
    }
  };

  const buscarCEP = async (cep: string, isEntrega: boolean = false) => {
    const cepLimpo = cep.replace(/\D/g, '');
    if (cepLimpo.length !== 8) return;

    setLoadingCEP(true);
    try {
      const data = await externalAPIService.buscarCEP(cepLimpo);

      if (isEntrega) {
        setFormData(prev => ({
          ...prev,
          endereco_entrega: data.logradouro,
          bairro_entrega: data.bairro,
          cidade_entrega: data.localidade,
          estado_entrega: data.uf,
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          endereco: data.logradouro,
          bairro: data.bairro,
          cidade: data.localidade,
          estado: data.uf,
          codigo_ibge: data.ibge,
        }));
      }
      toast.success('CEP encontrado!');
    } catch (error) {
      toast.error('CEP não encontrado');
    } finally {
      setLoadingCEP(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Limpar CPF/CNPJ e CEPs removendo formatação
      const cleanedData = {
        ...formData,
        cpf: formData.cpf.replace(/\D/g, ''), // Remove tudo que não é número
        cep: formData.cep?.replace(/\D/g, '') || '',
        cepEntrega: formData.cepEntrega?.replace(/\D/g, '') || '',
      };
      await onSubmit(cleanedData);
    } finally {
      setLoading(false);
    }
  };

  const copiarEnderecoParaEntrega = () => {
    setFormData(prev => ({
      ...prev,
      cepEntrega: prev.cep,
      enderecoEntrega: prev.endereco,
      numeroEntrega: prev.numero,
      complementoEntrega: prev.complemento,
      bairroEntrega: prev.bairro,
      cidadeEntrega: prev.cidade,
      estadoEntrega: prev.estado,
    }));
    toast.success('Endereço copiado para entrega!');
  };

  return (
    <form id="cliente-form" onSubmit={handleSubmit} className="space-y-6">
      <Tabs defaultValue="dados-basicos" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="dados-basicos" disabled={isViewMode}>Dados Básicos</TabsTrigger>
          <TabsTrigger value="endereco" disabled={isViewMode}>Endereço</TabsTrigger>
          <TabsTrigger value="entrega" disabled={isViewMode}>Entrega</TabsTrigger>
          <TabsTrigger value="financeiro" disabled={isViewMode}>Financeiro</TabsTrigger>
        </TabsList>

        <TabsContent value="dados-basicos" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* CPF/CNPJ - PRIMEIRO CAMPO */}
            <div className="space-y-2 lg:col-span-1">
              <Label htmlFor="cpf">CPF / CNPJ *</Label>
              <div className="flex gap-2">
                <Input
                  id="cpf"
                  value={formData.cpf}
                  onChange={(e) => handleCPFCNPJChange(e.target.value)}
                  placeholder="000.000.000-00 ou 00.000.000/0000-00"
                  required
                  maxLength={18}
                  disabled={isViewMode}
                />
                {loadingCNPJ && !isViewMode && <Loader2 className="h-4 w-4 animate-spin mt-2" />}
              </div>
              {!isViewMode && (
                <p className="text-xs text-muted-foreground">
                  Digite 14 dígitos para buscar CNPJ automaticamente
                </p>
              )}
            </div>

            <div className="space-y-2 lg:col-span-2">
              <Label htmlFor="nome">Razão Social / Nome Completo *</Label>
              <Input
                id="nome"
                value={formData.nome}
                onChange={(e) => handleChange('nome', e.target.value)}
                placeholder="Nome completo ou razão social"
                required
                disabled={isViewMode}
              />
            </div>

            <div className="space-y-2 lg:col-span-2">
              <Label htmlFor="nomeFantasia">Nome Fantasia</Label>
              <Input
                disabled={isViewMode}
                id="nomeFantasia"
                value={formData.nomeFantasia}
                onChange={(e) => handleChange('nomeFantasia', e.target.value)}
                placeholder="Nome fantasia (opcional)"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tipoContato">Tipo de Contato</Label>
              <Select value={formData.tipoContato} onValueChange={(value) => handleChange('tipoContato', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Cliente">Cliente</SelectItem>
                  <SelectItem value="Fornecedor">Fornecedor</SelectItem>
                  <SelectItem value="Ambos">Ambos</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="ieRg">RG / Inscrição Estadual</Label>
              <Input
                id="ieRg"
                value={formData.ieRg}
                onChange={(e) => handleChange('ieRg', e.target.value)}
                placeholder="RG ou IE"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="inscricaoMunicipal">Inscrição Municipal</Label>
              <Input
                id="inscricaoMunicipal"
                value={formData.inscricaoMunicipal}
                onChange={(e) => handleChange('inscricaoMunicipal', e.target.value)}
                placeholder="Inscrição municipal"
              />
            </div>

            <div className="space-y-2 lg:col-span-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="email@exemplo.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="telefoneFixo">Telefone Fixo</Label>
              <Input
                id="telefoneFixo"
                value={formData.telefoneFixo}
                onChange={(e) => handleChange('telefoneFixo', e.target.value)}
                placeholder="(00) 0000-0000"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="telefoneAlternativo">Telefone Alternativo</Label>
              <Input
                id="telefoneAlternativo"
                value={formData.telefoneAlternativo}
                onChange={(e) => handleChange('telefoneAlternativo', e.target.value)}
                placeholder="(00) 0000-0000"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="celular">Celular / WhatsApp</Label>
              <Input
                id="celular"
                value={formData.celular}
                onChange={(e) => handleChange('celular', e.target.value)}
                placeholder="(00) 00000-0000"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dataNascimento">Data de Nascimento</Label>
              <Input
                id="dataNascimento"
                type="date"
                value={formData.dataNascimento}
                onChange={(e) => handleChange('dataNascimento', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dataAbertura">Data de Abertura (Empresa)</Label>
              <Input
                id="dataAbertura"
                type="date"
                value={formData.dataAbertura}
                onChange={(e) => handleChange('dataAbertura', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value) => handleChange('status', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Ativo">Ativo</SelectItem>
                  <SelectItem value="Inativo">Inativo</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 flex items-center gap-2 pt-8">
              <Checkbox
                id="consumidorFinal"
                checked={formData.consumidorFinal}
                onCheckedChange={(checked) => handleChange('consumidorFinal', checked)}
              />
              <Label htmlFor="consumidorFinal" className="cursor-pointer">
                Consumidor Final
              </Label>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="endereco" className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cep">CEP</Label>
              <div className="flex gap-2">
                <Input
                  id="cep"
                  value={formData.cep}
                  onChange={(e) => handleChange('cep', e.target.value)}
                  onBlur={(e) => buscarCEP(e.target.value)}
                  placeholder="00000-000"
                />
                {loadingCEP && <Loader2 className="h-4 w-4 animate-spin" />}
              </div>
            </div>

            <div className="col-span-2 space-y-2">
              <Label htmlFor="endereco">Endereço</Label>
              <Input
                id="endereco"
                value={formData.endereco}
                onChange={(e) => handleChange('endereco', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="numero">Número</Label>
              <Input
                id="numero"
                value={formData.numero}
                onChange={(e) => handleChange('numero', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="complemento">Complemento</Label>
              <Input
                id="complemento"
                value={formData.complemento}
                onChange={(e) => handleChange('complemento', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bairro">Bairro</Label>
              <Input
                id="bairro"
                value={formData.bairro}
                onChange={(e) => handleChange('bairro', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cidade">Cidade</Label>
              <Input
                id="cidade"
                value={formData.cidade}
                onChange={(e) => handleChange('cidade', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="estado">Estado</Label>
              <Input
                id="estado"
                value={formData.estado}
                onChange={(e) => handleChange('estado', e.target.value)}
                maxLength={2}
                placeholder="UF"
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="entrega" className="space-y-4">
          <Button type="button" variant="outline" onClick={copiarEnderecoParaEntrega}>
            Copiar do Endereço Principal
          </Button>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cepEntrega">CEP</Label>
              <Input
                id="cepEntrega"
                value={formData.cepEntrega}
                onChange={(e) => handleChange('cepEntrega', e.target.value)}
                onBlur={(e) => buscarCEP(e.target.value, true)}
              />
            </div>

            <div className="col-span-2 space-y-2">
              <Label htmlFor="enderecoEntrega">Endereço</Label>
              <Input
                id="enderecoEntrega"
                value={formData.enderecoEntrega}
                onChange={(e) => handleChange('enderecoEntrega', e.target.value)}
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="financeiro" className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="limiteCredito">Limite de Crédito</Label>
              <Input
                id="limiteCredito"
                value={formData.limiteCredito}
                onChange={(e) => handleChange('limiteCredito', e.target.value)}
                placeholder="R$ 0,00"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="saldoInicial">Saldo Inicial</Label>
              <Input
                id="saldoInicial"
                value={formData.saldoInicial}
                onChange={(e) => handleChange('saldoInicial', e.target.value)}
                placeholder="R$ 0,00"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="prazoPagamento">Prazo de Pagamento</Label>
              <Input
                id="prazoPagamento"
                value={formData.prazoPagamento}
                onChange={(e) => handleChange('prazoPagamento', e.target.value)}
                placeholder="30 dias"
              />
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </form>
  );
}

