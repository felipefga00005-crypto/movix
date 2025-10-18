'use client'

/**
 * Formulário de Produto
 * Componente para criar/editar produtos
 */

import { useState, useEffect } from 'react'
import { IconDeviceFloppy, IconX, IconLoader2, IconCalculator, IconBarcode } from '@tabler/icons-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Checkbox } from '@/components/ui/checkbox'
import { produtoService } from '@/lib/services/produto.service'
import type { Produto, CreateProdutoRequest } from '@/types/produto'
import { toast } from 'sonner'

interface ProdutoFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  produto?: Produto | null
  onSuccess?: () => void
}

export function ProdutoForm({
  open,
  onOpenChange,
  produto,
  onSuccess,
}: ProdutoFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isCalculatingMargem, setIsCalculatingMargem] = useState(false)
  const [formData, setFormData] = useState<CreateProdutoRequest>({
    nome: '',
    unidadeMedida: 'UN',
    preco: 0,
    precoCusto: 0,
    estoque: 0,
    ativo: true,
    controlaEstoque: true,
  })

  const isEditing = !!produto

  // Carregar dados do produto quando estiver editando
  useEffect(() => {
    if (produto && open) {
      setFormData({
        nome: produto.nome || '',
        codigo: produto.codigo || '',
        codigoBarras: produto.codigo_barras || '',
        sku: produto.sku || '',
        descricao: produto.descricao || '',
        descricaoCurta: produto.descricao_curta || '',
        marca: produto.marca || '',
        modelo: produto.modelo || '',
        categoria: produto.categoria || '',
        subcategoria: produto.subcategoria || '',
        grupo: produto.grupo || '',
        subgrupo: produto.subgrupo || '',
        unidadeMedida: produto.unidade_medida || 'UN',
        unidadeCompra: produto.unidade_compra || '',
        unidadeVenda: produto.unidade_venda || '',
        fatorConversao: produto.fator_conversao || 1,
        preco: produto.preco || 0,
        precoCusto: produto.preco_custo || 0,
        precoPromocional: produto.preco_promocional || 0,
        margemLucro: produto.margem_lucro || 0,
        markup: produto.markup || 0,
        estoque: produto.estoque || 0,
        estoqueMinimo: produto.estoque_minimo || 0,
        estoqueMaximo: produto.estoque_maximo || 0,
        pontoReposicao: produto.ponto_reposicao || 0,
        fornecedorPrincipal: produto.fornecedor_principal || '',
        codigoFornecedor: produto.codigo_fornecedor || '',
        ncm: produto.ncm || '',
        cest: produto.cest || '',
        cfopEntrada: produto.cfop_entrada || '',
        cfopSaida: produto.cfop_saida || '',
        cstIcms: produto.cst_icms || '',
        cstPis: produto.cst_pis || '',
        cstCofins: produto.cst_cofins || '',
        aliquotaIcms: produto.aliquota_icms || 0,
        aliquotaPis: produto.aliquota_pis || 0,
        aliquotaCofins: produto.aliquota_cofins || 0,
        origem: produto.origem || 0,
        pesoBruto: produto.peso_bruto || 0,
        pesoLiquido: produto.peso_liquido || 0,
        altura: produto.altura || 0,
        largura: produto.largura || 0,
        profundidade: produto.profundidade || 0,
        volume: produto.volume || 0,
        ativo: produto.ativo ?? true,
        destaque: produto.destaque || false,
        promocao: produto.promocao || false,
        controlaEstoque: produto.controla_estoque ?? true,
        permiteVendaEstoqueZerado: produto.permite_venda_estoque_zerado || false,
        dataValidade: produto.data_validade || '',
        observacoes: produto.observacoes || '',
        observacoesInternas: produto.observacoes_internas || '',
        localizacao: produto.localizacao || '',
        corredor: produto.corredor || '',
        prateleira: produto.prateleira || '',
        posicao: produto.posicao || '',
      })
    } else if (!open) {
      // Resetar quando fechar
      resetForm()
    }
  }, [produto, open])

  // Função para calcular margem de lucro automaticamente
  const calcularMargem = async () => {
    if (formData.precoCusto > 0 && formData.preco > 0) {
      try {
        setIsCalculatingMargem(true)
        const resultado = await produtoService.calcularMargem(formData.precoCusto, formData.preco)
        setFormData(prev => ({
          ...prev,
          margemLucro: resultado.margemLucro,
          markup: resultado.markup
        }))
      } catch (error: any) {
        console.error('Erro ao calcular margem:', error)
      } finally {
        setIsCalculatingMargem(false)
      }
    }
  }

  // Função para gerar código automático
  const gerarCodigo = async () => {
    try {
      const codigo = await produtoService.gerarCodigo(formData.categoria)
      setFormData(prev => ({ ...prev, codigo }))
      toast.success('Código gerado automaticamente')
    } catch (error: any) {
      toast.error('Erro ao gerar código')
    }
  }

  // Handler para mudança no preço de custo ou venda
  const handlePrecoChange = (field: 'preco' | 'precoCusto', value: number) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Calcular margem automaticamente após um pequeno delay
    setTimeout(() => {
      if (formData.precoCusto > 0 && formData.preco > 0) {
        calcularMargem()
      }
    }, 500)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.nome.trim()) {
      toast.error('Nome do produto é obrigatório')
      return
    }

    if (formData.preco <= 0) {
      toast.error('Preço de venda deve ser maior que zero')
      return
    }

    if (formData.precoCusto < 0) {
      toast.error('Preço de custo não pode ser negativo')
      return
    }

    try {
      setIsLoading(true)
      
      if (isEditing) {
        await produtoService.update(produto.id, formData)
        toast.success('Produto atualizado com sucesso!')
      } else {
        await produtoService.create(formData)
        toast.success('Produto criado com sucesso!')
      }
      
      onSuccess?.()
      onOpenChange(false)
      resetForm()
    } catch (error: any) {
      toast.error(error.message || 'Erro ao salvar produto')
    } finally {
      setIsLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      nome: '',
      unidadeMedida: 'UN',
      preco: 0,
      precoCusto: 0,
      estoque: 0,
      ativo: true,
      controlaEstoque: true,
    })
  }

  const handleClose = () => {
    onOpenChange(false)
    resetForm()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-[95vw] max-w-[95vw] w-full h-[90vh] max-h-[90vh] p-0 gap-0 overflow-hidden flex flex-col"
        showCloseButton={false}
      >
        <DialogHeader className="flex-shrink-0 border-b px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-1">
              <DialogTitle className="text-lg font-semibold">
                {isEditing ? 'Editar Produto' : 'Novo Produto'}
              </DialogTitle>
              <DialogDescription className="text-xs">
                {isEditing
                  ? 'Atualize as informações do produto'
                  : 'Preencha os dados para cadastrar um novo produto'
                }
              </DialogDescription>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={handleClose}
              className="h-7 w-7 rounded-full"
            >
              <IconX className="h-4 w-4" />
              <span className="sr-only">Fechar</span>
            </Button>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto px-4 py-3">
            {/* Dados Gerais - Fora das Tabs */}
            <div className="mb-4">
              <h3 className="text-sm font-semibold mb-3 text-muted-foreground">Dados Gerais</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="nome">
                    Nome do Produto *
                  </Label>
                  <Input
                    id="nome"
                    value={formData.nome}
                    onChange={(e) =>
                      setFormData({ ...formData, nome: e.target.value })
                    }
                    placeholder="Digite o nome do produto"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="codigo">
                    Código
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      id="codigo"
                      value={formData.codigo || ''}
                      onChange={(e) =>
                        setFormData({ ...formData, codigo: e.target.value })
                      }
                      placeholder="Código do produto"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={gerarCodigo}
                      title="Gerar código automático"
                    >
                      <IconBarcode className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="codigoBarras">
                    Código de Barras
                  </Label>
                  <Input
                    id="codigoBarras"
                    value={formData.codigoBarras || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, codigoBarras: e.target.value })
                    }
                    placeholder="EAN/UPC"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sku">
                    SKU
                  </Label>
                  <Input
                    id="sku"
                    value={formData.sku || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, sku: e.target.value })
                    }
                    placeholder="SKU do produto"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="unidadeMedida">
                    Unidade de Medida *
                  </Label>
                  <Select
                    value={formData.unidadeMedida}
                    onValueChange={(value) =>
                      setFormData({ ...formData, unidadeMedida: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="UN">Unidade (UN)</SelectItem>
                      <SelectItem value="KG">Quilograma (KG)</SelectItem>
                      <SelectItem value="G">Grama (G)</SelectItem>
                      <SelectItem value="L">Litro (L)</SelectItem>
                      <SelectItem value="ML">Mililitro (ML)</SelectItem>
                      <SelectItem value="M">Metro (M)</SelectItem>
                      <SelectItem value="CM">Centímetro (CM)</SelectItem>
                      <SelectItem value="M2">Metro Quadrado (M²)</SelectItem>
                      <SelectItem value="M3">Metro Cúbico (M³)</SelectItem>
                      <SelectItem value="CX">Caixa (CX)</SelectItem>
                      <SelectItem value="PC">Peça (PC)</SelectItem>
                      <SelectItem value="PAR">Par (PAR)</SelectItem>
                      <SelectItem value="DZ">Dúzia (DZ)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Tabs - Preços, Estoque, Classificação, Fiscal, Dimensões */}
            <Tabs defaultValue="precos" className="w-full">
              <TabsList className="grid w-full grid-cols-5 mb-4 h-9">
                <TabsTrigger value="precos" className="text-sm">Preços</TabsTrigger>
                <TabsTrigger value="estoque" className="text-sm">Estoque</TabsTrigger>
                <TabsTrigger value="classificacao" className="text-sm">Classificação</TabsTrigger>
                <TabsTrigger value="fiscal" className="text-sm">Fiscal</TabsTrigger>
                <TabsTrigger value="dimensoes" className="text-sm">Dimensões</TabsTrigger>
              </TabsList>

              <div>
                <TabsContent value="precos" className="space-y-4 mt-0">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="precoCusto">Preço de Custo (R$)</Label>
                      <Input
                        id="precoCusto"
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.precoCusto || ''}
                        onChange={(e) =>
                          handlePrecoChange('precoCusto', parseFloat(e.target.value) || 0)
                        }
                        placeholder="0.00"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="preco">Preço de Venda (R$) *</Label>
                      <Input
                        id="preco"
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.preco || ''}
                        onChange={(e) =>
                          handlePrecoChange('preco', parseFloat(e.target.value) || 0)
                        }
                        placeholder="0.00"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="precoPromocional">Preço Promocional (R$)</Label>
                      <Input
                        id="precoPromocional"
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.precoPromocional || ''}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            precoPromocional: parseFloat(e.target.value) || 0
                          })
                        }
                        placeholder="0.00"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="margemLucro">
                        Margem de Lucro (%)
                        {isCalculatingMargem && (
                          <IconLoader2 className="inline ml-2 h-3 w-3 animate-spin" />
                        )}
                      </Label>
                      <div className="flex gap-2">
                        <Input
                          id="margemLucro"
                          type="number"
                          step="0.01"
                          value={formData.margemLucro || ''}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              margemLucro: parseFloat(e.target.value) || 0
                            })
                          }
                          placeholder="0.00"
                          readOnly
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={calcularMargem}
                          disabled={isCalculatingMargem}
                          title="Calcular margem"
                        >
                          <IconCalculator className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="markup">Markup (%)</Label>
                      <Input
                        id="markup"
                        type="number"
                        step="0.01"
                        value={formData.markup || ''}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            markup: parseFloat(e.target.value) || 0
                          })
                        }
                        placeholder="0.00"
                        readOnly
                      />
                    </div>
                  </div>

                  {/* Checkboxes de Status */}
                  <div className="mt-6 pt-6 border-t">
                    <h4 className="text-sm font-semibold mb-3 text-muted-foreground">Status do Produto</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="ativo"
                          checked={formData.ativo}
                          onCheckedChange={(checked) =>
                            setFormData({ ...formData, ativo: !!checked })
                          }
                        />
                        <Label htmlFor="ativo">Produto Ativo</Label>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="destaque"
                          checked={formData.destaque}
                          onCheckedChange={(checked) =>
                            setFormData({ ...formData, destaque: !!checked })
                          }
                        />
                        <Label htmlFor="destaque">Em Destaque</Label>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="promocao"
                          checked={formData.promocao}
                          onCheckedChange={(checked) =>
                            setFormData({ ...formData, promocao: !!checked })
                          }
                        />
                        <Label htmlFor="promocao">Em Promoção</Label>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="controlaEstoque"
                          checked={formData.controlaEstoque}
                          onCheckedChange={(checked) =>
                            setFormData({ ...formData, controlaEstoque: !!checked })
                          }
                        />
                        <Label htmlFor="controlaEstoque">Controla Estoque</Label>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="estoque" className="space-y-4 mt-0">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="estoque">Estoque Atual</Label>
                      <Input
                        id="estoque"
                        type="number"
                        min="0"
                        value={formData.estoque || ''}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            estoque: parseInt(e.target.value) || 0
                          })
                        }
                        placeholder="0"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="estoqueMinimo">Estoque Mínimo</Label>
                      <Input
                        id="estoqueMinimo"
                        type="number"
                        min="0"
                        value={formData.estoqueMinimo || ''}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            estoqueMinimo: parseInt(e.target.value) || 0
                          })
                        }
                        placeholder="0"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="estoqueMaximo">Estoque Máximo</Label>
                      <Input
                        id="estoqueMaximo"
                        type="number"
                        min="0"
                        value={formData.estoqueMaximo || ''}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            estoqueMaximo: parseInt(e.target.value) || 0
                          })
                        }
                        placeholder="0"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="pontoReposicao">Ponto de Reposição</Label>
                      <Input
                        id="pontoReposicao"
                        type="number"
                        min="0"
                        value={formData.pontoReposicao || ''}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            pontoReposicao: parseInt(e.target.value) || 0
                          })
                        }
                        placeholder="0"
                      />
                    </div>
                  </div>

                  {/* Localização no Estoque */}
                  <div className="mt-6 pt-6 border-t">
                    <h4 className="text-sm font-semibold mb-3 text-muted-foreground">Localização no Estoque</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="localizacao">Localização</Label>
                        <Input
                          id="localizacao"
                          value={formData.localizacao || ''}
                          onChange={(e) =>
                            setFormData({ ...formData, localizacao: e.target.value })
                          }
                          placeholder="Ex: Depósito A"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="corredor">Corredor</Label>
                        <Input
                          id="corredor"
                          value={formData.corredor || ''}
                          onChange={(e) =>
                            setFormData({ ...formData, corredor: e.target.value })
                          }
                          placeholder="Ex: C01"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="prateleira">Prateleira</Label>
                        <Input
                          id="prateleira"
                          value={formData.prateleira || ''}
                          onChange={(e) =>
                            setFormData({ ...formData, prateleira: e.target.value })
                          }
                          placeholder="Ex: P03"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="posicao">Posição</Label>
                        <Input
                          id="posicao"
                          value={formData.posicao || ''}
                          onChange={(e) =>
                            setFormData({ ...formData, posicao: e.target.value })
                          }
                          placeholder="Ex: 001"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Configurações de Estoque */}
                  <div className="mt-6 pt-6 border-t">
                    <h4 className="text-sm font-semibold mb-3 text-muted-foreground">Configurações</h4>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="permiteVendaEstoqueZerado"
                        checked={formData.permiteVendaEstoqueZerado}
                        onCheckedChange={(checked) =>
                          setFormData({ ...formData, permiteVendaEstoqueZerado: !!checked })
                        }
                      />
                      <Label htmlFor="permiteVendaEstoqueZerado">
                        Permite venda com estoque zerado
                      </Label>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="classificacao" className="space-y-4 mt-0">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="categoria">Categoria</Label>
                      <Input
                        id="categoria"
                        value={formData.categoria || ''}
                        onChange={(e) =>
                          setFormData({ ...formData, categoria: e.target.value })
                        }
                        placeholder="Ex: Eletrônicos"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="subcategoria">Subcategoria</Label>
                      <Input
                        id="subcategoria"
                        value={formData.subcategoria || ''}
                        onChange={(e) =>
                          setFormData({ ...formData, subcategoria: e.target.value })
                        }
                        placeholder="Ex: Smartphones"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="grupo">Grupo</Label>
                      <Input
                        id="grupo"
                        value={formData.grupo || ''}
                        onChange={(e) =>
                          setFormData({ ...formData, grupo: e.target.value })
                        }
                        placeholder="Ex: Celulares"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="subgrupo">Subgrupo</Label>
                      <Input
                        id="subgrupo"
                        value={formData.subgrupo || ''}
                        onChange={(e) =>
                          setFormData({ ...formData, subgrupo: e.target.value })
                        }
                        placeholder="Ex: Android"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="marca">Marca</Label>
                      <Input
                        id="marca"
                        value={formData.marca || ''}
                        onChange={(e) =>
                          setFormData({ ...formData, marca: e.target.value })
                        }
                        placeholder="Ex: Samsung"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="modelo">Modelo</Label>
                      <Input
                        id="modelo"
                        value={formData.modelo || ''}
                        onChange={(e) =>
                          setFormData({ ...formData, modelo: e.target.value })
                        }
                        placeholder="Ex: Galaxy S23"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="fornecedorPrincipal">Fornecedor Principal</Label>
                      <Input
                        id="fornecedorPrincipal"
                        value={formData.fornecedorPrincipal || ''}
                        onChange={(e) =>
                          setFormData({ ...formData, fornecedorPrincipal: e.target.value })
                        }
                        placeholder="Nome do fornecedor"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="codigoFornecedor">Código do Fornecedor</Label>
                      <Input
                        id="codigoFornecedor"
                        value={formData.codigoFornecedor || ''}
                        onChange={(e) =>
                          setFormData({ ...formData, codigoFornecedor: e.target.value })
                        }
                        placeholder="Código no fornecedor"
                      />
                    </div>
                  </div>

                  {/* Descrições */}
                  <div className="mt-6 pt-6 border-t">
                    <h4 className="text-sm font-semibold mb-3 text-muted-foreground">Descrições</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="descricaoCurta">Descrição Curta</Label>
                        <Textarea
                          id="descricaoCurta"
                          value={formData.descricaoCurta || ''}
                          onChange={(e) =>
                            setFormData({ ...formData, descricaoCurta: e.target.value })
                          }
                          placeholder="Descrição resumida do produto..."
                          rows={3}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="descricao">Descrição Completa</Label>
                        <Textarea
                          id="descricao"
                          value={formData.descricao || ''}
                          onChange={(e) =>
                            setFormData({ ...formData, descricao: e.target.value })
                          }
                          placeholder="Descrição detalhada do produto..."
                          rows={3}
                        />
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="fiscal" className="space-y-4 mt-0">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="ncm">NCM</Label>
                      <Input
                        id="ncm"
                        value={formData.ncm || ''}
                        onChange={(e) =>
                          setFormData({ ...formData, ncm: e.target.value })
                        }
                        placeholder="0000.00.00"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="cest">CEST</Label>
                      <Input
                        id="cest"
                        value={formData.cest || ''}
                        onChange={(e) =>
                          setFormData({ ...formData, cest: e.target.value })
                        }
                        placeholder="00.000.00"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="origem">Origem</Label>
                      <Select
                        value={formData.origem?.toString() || '0'}
                        onValueChange={(value) =>
                          setFormData({ ...formData, origem: parseInt(value) })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0">0 - Nacional</SelectItem>
                          <SelectItem value="1">1 - Estrangeira - Importação direta</SelectItem>
                          <SelectItem value="2">2 - Estrangeira - Adquirida no mercado interno</SelectItem>
                          <SelectItem value="3">3 - Nacional - Mercadoria com Conteúdo de Importação superior a 40%</SelectItem>
                          <SelectItem value="4">4 - Nacional - Cuja produção tenha sido feita em conformidade com os processos produtivos básicos</SelectItem>
                          <SelectItem value="5">5 - Nacional - Mercadoria com Conteúdo de Importação inferior ou igual a 40%</SelectItem>
                          <SelectItem value="6">6 - Estrangeira - Importação direta, sem similar nacional</SelectItem>
                          <SelectItem value="7">7 - Estrangeira - Adquirida no mercado interno, sem similar nacional</SelectItem>
                          <SelectItem value="8">8 - Nacional - Mercadoria com Conteúdo de Importação superior a 70%</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="cfopEntrada">CFOP Entrada</Label>
                      <Input
                        id="cfopEntrada"
                        value={formData.cfopEntrada || ''}
                        onChange={(e) =>
                          setFormData({ ...formData, cfopEntrada: e.target.value })
                        }
                        placeholder="0000"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="cfopSaida">CFOP Saída</Label>
                      <Input
                        id="cfopSaida"
                        value={formData.cfopSaida || ''}
                        onChange={(e) =>
                          setFormData({ ...formData, cfopSaida: e.target.value })
                        }
                        placeholder="0000"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="cstIcms">CST ICMS</Label>
                      <Input
                        id="cstIcms"
                        value={formData.cstIcms || ''}
                        onChange={(e) =>
                          setFormData({ ...formData, cstIcms: e.target.value })
                        }
                        placeholder="000"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="aliquotaIcms">Alíquota ICMS (%)</Label>
                      <Input
                        id="aliquotaIcms"
                        type="number"
                        step="0.01"
                        min="0"
                        max="100"
                        value={formData.aliquotaIcms || ''}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            aliquotaIcms: parseFloat(e.target.value) || 0
                          })
                        }
                        placeholder="0.00"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="cstPis">CST PIS</Label>
                      <Input
                        id="cstPis"
                        value={formData.cstPis || ''}
                        onChange={(e) =>
                          setFormData({ ...formData, cstPis: e.target.value })
                        }
                        placeholder="00"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="aliquotaPis">Alíquota PIS (%)</Label>
                      <Input
                        id="aliquotaPis"
                        type="number"
                        step="0.01"
                        min="0"
                        max="100"
                        value={formData.aliquotaPis || ''}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            aliquotaPis: parseFloat(e.target.value) || 0
                          })
                        }
                        placeholder="0.00"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="cstCofins">CST COFINS</Label>
                      <Input
                        id="cstCofins"
                        value={formData.cstCofins || ''}
                        onChange={(e) =>
                          setFormData({ ...formData, cstCofins: e.target.value })
                        }
                        placeholder="00"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="aliquotaCofins">Alíquota COFINS (%)</Label>
                      <Input
                        id="aliquotaCofins"
                        type="number"
                        step="0.01"
                        min="0"
                        max="100"
                        value={formData.aliquotaCofins || ''}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            aliquotaCofins: parseFloat(e.target.value) || 0
                          })
                        }
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="dimensoes" className="space-y-4 mt-0">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="pesoBruto">Peso Bruto (kg)</Label>
                      <Input
                        id="pesoBruto"
                        type="number"
                        step="0.001"
                        min="0"
                        value={formData.pesoBruto || ''}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            pesoBruto: parseFloat(e.target.value) || 0
                          })
                        }
                        placeholder="0.000"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="pesoLiquido">Peso Líquido (kg)</Label>
                      <Input
                        id="pesoLiquido"
                        type="number"
                        step="0.001"
                        min="0"
                        value={formData.pesoLiquido || ''}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            pesoLiquido: parseFloat(e.target.value) || 0
                          })
                        }
                        placeholder="0.000"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="altura">Altura (cm)</Label>
                      <Input
                        id="altura"
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.altura || ''}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            altura: parseFloat(e.target.value) || 0
                          })
                        }
                        placeholder="0.00"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="largura">Largura (cm)</Label>
                      <Input
                        id="largura"
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.largura || ''}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            largura: parseFloat(e.target.value) || 0
                          })
                        }
                        placeholder="0.00"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="profundidade">Profundidade (cm)</Label>
                      <Input
                        id="profundidade"
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.profundidade || ''}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            profundidade: parseFloat(e.target.value) || 0
                          })
                        }
                        placeholder="0.00"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="volume">Volume (m³)</Label>
                      <Input
                        id="volume"
                        type="number"
                        step="0.001"
                        min="0"
                        value={formData.volume || ''}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            volume: parseFloat(e.target.value) || 0
                          })
                        }
                        placeholder="0.000"
                      />
                    </div>
                  </div>

                  {/* Observações */}
                  <div className="mt-6 pt-6 border-t">
                    <h4 className="text-sm font-semibold mb-3 text-muted-foreground">Observações</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="observacoes">Observações Gerais</Label>
                        <Textarea
                          id="observacoes"
                          value={formData.observacoes || ''}
                          onChange={(e) =>
                            setFormData({ ...formData, observacoes: e.target.value })
                          }
                          placeholder="Observações sobre o produto..."
                          rows={4}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="observacoesInternas">Observações Internas</Label>
                        <Textarea
                          id="observacoesInternas"
                          value={formData.observacoesInternas || ''}
                          onChange={(e) =>
                            setFormData({ ...formData, observacoesInternas: e.target.value })
                          }
                          placeholder="Observações internas sobre o produto..."
                          rows={4}
                        />
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </div>
            </Tabs>
          </div>

          <DialogFooter className="flex-shrink-0 border-t px-4 py-3 mt-0 flex flex-row justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
              size="sm"
              className="min-w-[100px]"
            >
              <IconX className="mr-2 h-3.5 w-3.5" />
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              size="sm"
              className="min-w-[100px]"
            >
              {isLoading ? (
                <>
                  <IconLoader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <IconDeviceFloppy className="mr-2 h-3.5 w-3.5" />
                  Salvar
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
