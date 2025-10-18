"use client"

/**
 * Página do PDV (Ponto de Venda)
 * Interface completa para vendas com integração fiscal
 */

import { useState } from "react"
import { AppSidebar } from "@/components/layout/app-sidebar"
import { SiteHeader } from "@/components/dashboard/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { toast } from "sonner"
import {
  IconUser,
  IconCash,
} from "@tabler/icons-react"
import { BuscaProdutos } from "@/components/pdv/busca-produtos"
import { CarrinhoCompras, ItemVenda } from "@/components/pdv/carrinho-compras"
import { ModalPagamento } from "@/components/pdv/modal-pagamento"
import { usePDV } from "@/hooks/usePDV"
import type { Cliente } from "@/types/cliente"

interface Produto {
  id: number
  nome: string
  codigo: string
  preco: number
  estoque: number
  categoria?: string
  unidade?: string
}

export default function PDVPage() {
  const [buscaCliente, setBuscaCliente] = useState("")
  const [modalPagamentoAberto, setModalPagamentoAberto] = useState(false)

  // Usar hook do PDV
  const {
    itensVenda,
    cliente,
    carregando,
    adicionarProduto,
    alterarQuantidade,
    removerItem,
    limparCarrinho,
    selecionarCliente,
    removerCliente,
    calcularTotal,
    finalizarVenda,
    buscarProdutos,
    buscarProdutoPorCodigo,
    buscarClientes,
  } = usePDV()

  // Clientes simulados para fallback
  const clientesSimulados: Cliente[] = [
    {
      id: 1,
      razao_social: "João Silva",
      cnpj_cpf: "123.456.789-00",
      email: "joao@email.com",
      tipo_pessoa: "PF",
      ind_ie_dest: 9,
      consumidor_final: true,
      tipo_contato: "Cliente",
      status: "Ativo",
      limite_credito: 0,
      saldo_inicial: 0,
      prazo_pagamento: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 2,
      razao_social: "Maria Santos",
      cnpj_cpf: "987.654.321-00",
      email: "maria@email.com",
      tipo_pessoa: "PF",
      ind_ie_dest: 9,
      consumidor_final: true,
      tipo_contato: "Cliente",
      status: "Ativo",
      limite_credito: 0,
      saldo_inicial: 0,
      prazo_pagamento: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ]

  const handleSelecionarCliente = (clienteSelecionado: Cliente) => {
    selecionarCliente(clienteSelecionado)
    setBuscaCliente("")
  }

  const handleFinalizarVenda = async (dadosVenda: any) => {
    try {
      await finalizarVenda(dadosVenda)
      setModalPagamentoAberto(false)
    } catch (error) {
      // Erro já tratado no hook
      console.error("Erro ao finalizar venda:", error)
    }
  }

  const clientesFiltrados = clientesSimulados.filter(cliente =>
    cliente.razao_social.toLowerCase().includes(buscaCliente.toLowerCase()) ||
    cliente.cnpj_cpf.includes(buscaCliente)
  )

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              {/* Conteúdo Principal do PDV */}
              <div className="px-4 lg:px-6">
                <div className="flex h-[calc(100vh-12rem)] gap-6">
      {/* Coluna Esquerda - Busca de Produtos */}
      <div className="flex-1 space-y-6">
        <BuscaProdutos
          onAdicionarProduto={adicionarProduto}
          onBuscarProdutos={buscarProdutos}
          onBuscarPorCodigo={buscarProdutoPorCodigo}
        />

        {/* Cliente */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IconUser className="h-5 w-5" />
              Cliente
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {cliente ? (
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">{cliente.razao_social}</p>
                  <p className="text-sm text-muted-foreground">{cliente.cnpj_cpf}</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={removerCliente}
                >
                  Remover
                </Button>
              </div>
            ) : (
              <>
                <Input
                  placeholder="Buscar cliente por nome ou CPF..."
                  value={buscaCliente}
                  onChange={(e) => setBuscaCliente(e.target.value)}
                />
                {buscaCliente && (
                  <ScrollArea className="h-32">
                    <div className="space-y-2">
                      {clientesFiltrados.map((cliente) => (
                        <div
                          key={cliente.id}
                          className="flex items-center justify-between p-2 border rounded-lg hover:bg-muted cursor-pointer"
                          onClick={() => handleSelecionarCliente(cliente)}
                        >
                          <div>
                            <p className="font-medium">{cliente.razao_social}</p>
                            <p className="text-sm text-muted-foreground">{cliente.cnpj_cpf}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Coluna Direita - Carrinho e Finalização */}
      <div className="w-96 space-y-6">
        <CarrinhoCompras
          itens={itensVenda}
          onAlterarQuantidade={alterarQuantidade}
          onRemoverItem={removerItem}
          onLimparCarrinho={limparCarrinho}
        />

        {/* Finalização */}
        <Card>
          <CardHeader>
            <CardTitle>Finalizar Venda</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              className="w-full"
              size="lg"
              onClick={() => setModalPagamentoAberto(true)}
              disabled={itensVenda.length === 0 || carregando}
            >
              <IconCash className="h-4 w-4 mr-2" />
              Finalizar Venda
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Modal de Pagamento */}
      <ModalPagamento
        open={modalPagamentoAberto}
        onOpenChange={setModalPagamentoAberto}
        itens={itensVenda}
        cliente={cliente}
        total={calcularTotal()}
        onFinalizarVenda={handleFinalizarVenda}
      />
                </div>
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
