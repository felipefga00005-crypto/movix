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
import { Loader2, Search } from 'lucide-react';

interface ClienteFormProps {
  cliente?: Cliente;
  onSubmit: (data: CreateClienteRequest) => Promise<void>;
  onCancel: () => void;
}

export function ClienteForm({ cliente, onSubmit, onCancel }: ClienteFormProps) {
  const [loading, setLoading] = useState(false);
  const [loadingCEP, setLoadingCEP] = useState(false);
  const [loadingCNPJ, setLoadingCNPJ] = useState(false);

  // Função para mapear dados do cliente
  const mapClienteToFormData = (clienteData: any): CreateClienteRequest => ({
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

  const [formData, setFormData] = useState<CreateClienteRequest>(
    mapClienteToFormData(cliente)
  );

  // Atualiza o formulário quando o cliente mudar
  useEffect(() => {
    if (cliente) {
      setFormData(mapClienteToFormData(cliente));
    }
  }, [cliente]);

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
    } catch (error) {
      // Silenciosamente ignora erro - campos permanecem vazios
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
    } catch (error) {
      // Silenciosamente ignora erro - campos permanecem vazios
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
        cep_entrega: formData.cep_entrega?.replace(/\D/g, '') || '',
      };
      await onSubmit(cleanedData);
    } finally {
      setLoading(false);
    }
  };

  const copiarEnderecoParaEntrega = () => {
    setFormData(prev => ({
      ...prev,
      cep_entrega: prev.cep,
      endereco_entrega: prev.endereco,
      numero_entrega: prev.numero,
      complemento_entrega: prev.complemento,
      bairro_entrega: prev.bairro,
      cidade_entrega: prev.cidade,
      estado_entrega: prev.estado,
    }));
  };

  return (
    <form id="cliente-form" onSubmit={handleSubmit} className="space-y-6">
      <Tabs defaultValue="dados-basicos" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="dados-basicos">Dados Básicos</TabsTrigger>
          <TabsTrigger value="endereco">Endereço</TabsTrigger>
          <TabsTrigger value="entrega">Entrega</TabsTrigger>
          <TabsTrigger value="financeiro">Financeiro</TabsTrigger>
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
                 
                />
                {loadingCNPJ && <Loader2 className="h-4 w-4 animate-spin mt-2" />}
              </div>
              <p className="text-xs text-muted-foreground">
                Digite 14 dígitos para buscar CNPJ automaticamente
              </p>
            </div>

            <div className="space-y-2 lg:col-span-2">
              <Label htmlFor="nome">Razão Social / Nome Completo *</Label>
              <Input
                id="nome"
                value={formData.nome}
                onChange={(e) => handleChange('nome', e.target.value)}
                placeholder="Nome completo ou razão social"
                required
               
              />
            </div>

            <div className="space-y-2 lg:col-span-2">
              <Label htmlFor="nomeFantasia">Nome Fantasia</Label>
              <Input
               
                id="nomeFantasia"
                value={formData.nome_fantasia}
                onChange={(e) => handleChange('nome_fantasia', e.target.value)}
                placeholder="Nome fantasia (opcional)"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tipo_contato">Tipo de Contato</Label>
              <Select value={formData.tipo_contato} onValueChange={(value) => handleChange('tipo_contato', value)}>
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
                value={formData.ie_rg}
                onChange={(e) => handleChange('ie_rg', e.target.value)}
                placeholder="RG ou IE"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="inscricaoMunicipal">Inscrição Municipal</Label>
              <Input
                id="inscricaoMunicipal"
                value={formData.inscricao_municipal}
                onChange={(e) => handleChange('inscricao_municipal', e.target.value)}
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
              <Label htmlFor="telefone_fixo">Telefone Fixo</Label>
              <Input
                id="telefone_fixo"
                value={formData.telefone_fixo}
                onChange={(e) => handleChange('telefone_fixo', e.target.value)}
                placeholder="(00) 0000-0000"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="telefone_alternativo">Telefone Alternativo</Label>
              <Input
                id="telefone_alternativo"
                value={formData.telefone_alternativo}
                onChange={(e) => handleChange('telefone_alternativo', e.target.value)}
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
              <Label htmlFor="data_nascimento">Data de Nascimento</Label>
              <Input
                id="data_nascimento"
                type="date"
                value={formData.data_nascimento}
                onChange={(e) => handleChange('data_nascimento', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dataAbertura">Data de Abertura (Empresa)</Label>
              <Input
                id="dataAbertura"
                type="date"
                value={formData.data_abertura}
                onChange={(e) => handleChange('data_abertura', e.target.value)}
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
                id="consumidor_final"
                checked={formData.consumidor_final}
                onCheckedChange={(checked) => handleChange('consumidor_final', checked)}
               
              />
              <Label htmlFor="consumidor_final" className="cursor-pointer">
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
              <Label htmlFor="cep_entrega">CEP</Label>
              <Input
                id="cep_entrega"
                value={formData.cep_entrega}
                onChange={(e) => handleChange('cep_entrega', e.target.value)}
                onBlur={(e) => buscarCEP(e.target.value, true)}
                placeholder="00000-000"
              />
            </div>

            <div className="col-span-2 space-y-2">
              <Label htmlFor="endereco_entrega">Endereço</Label>
              <Input
                id="endereco_entrega"
                value={formData.endereco_entrega}
                onChange={(e) => handleChange('endereco_entrega', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="numero_entrega">Número</Label>
              <Input
                id="numero_entrega"
                value={formData.numero_entrega}
                onChange={(e) => handleChange('numero_entrega', e.target.value)}
              />
            </div>

            <div className="col-span-2 space-y-2">
              <Label htmlFor="complemento_entrega">Complemento</Label>
              <Input
                id="complemento_entrega"
                value={formData.complemento_entrega}
                onChange={(e) => handleChange('complemento_entrega', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bairro_entrega">Bairro</Label>
              <Input
                id="bairro_entrega"
                value={formData.bairro_entrega}
                onChange={(e) => handleChange('bairro_entrega', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cidade_entrega">Cidade</Label>
              <Input
                id="cidade_entrega"
                value={formData.cidade_entrega}
                onChange={(e) => handleChange('cidade_entrega', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="estado_entrega">Estado</Label>
              <Input
                id="estado_entrega"
                value={formData.estado_entrega}
                onChange={(e) => handleChange('estado_entrega', e.target.value)}
                maxLength={2}
                placeholder="UF"
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
                value={formData.limite_credito}
                onChange={(e) => handleChange('limite_credito', e.target.value)}
                placeholder="R$ 0,00"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="saldoInicial">Saldo Inicial</Label>
              <Input
                id="saldoInicial"
                value={formData.saldo_inicial}
                onChange={(e) => handleChange('saldo_inicial', e.target.value)}
                placeholder="R$ 0,00"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="prazoPagamento">Prazo de Pagamento</Label>
              <Input
                id="prazoPagamento"
                value={formData.prazo_pagamento}
                onChange={(e) => handleChange('prazo_pagamento', e.target.value)}
                placeholder="30 dias"
              />
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </form>
  );
}

