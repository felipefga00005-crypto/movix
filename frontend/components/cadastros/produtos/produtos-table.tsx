'use client';

import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Pencil, Trash2, Search, Eye, AlertTriangle } from 'lucide-react';

interface Produto {
  id: number;
  codigo: string;
  nome: string;
  categoria: string;
  subcategoria: string;
  marca: string;
  modelo: string;
  preco: number;
  precoCusto: number;
  estoque: number;
  estoqueMinimo: number;
  unidade: string;
  status: string;
  fornecedor: string;
}

interface ProdutosTableProps {
  produtos: Produto[];
  onEdit?: (produto: Produto) => void;
  onDelete?: (id: number) => void;
  onView?: (produto: Produto) => void;
  loading?: boolean;
}

export function ProdutosTable({ 
  produtos, 
  onEdit, 
  onDelete, 
  onView, 
  loading 
}: ProdutosTableProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredProdutos = produtos.filter(produto =>
    produto.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    produto.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    produto.categoria.toLowerCase().includes(searchTerm.toLowerCase()) ||
    produto.marca.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const isEstoqueBaixo = (estoque: number, estoqueMinimo: number) => {
    return estoque <= estoqueMinimo;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome, código, categoria ou marca..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Código</TableHead>
              <TableHead>Nome</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead>Marca</TableHead>
              <TableHead className="text-right">Preço</TableHead>
              <TableHead className="text-center">Estoque</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8">
                  Carregando...
                </TableCell>
              </TableRow>
            ) : filteredProdutos.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8">
                  Nenhum produto encontrado
                </TableCell>
              </TableRow>
            ) : (
              filteredProdutos.map((produto) => (
                <TableRow key={produto.id}>
                  <TableCell className="font-medium">{produto.codigo}</TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{produto.nome}</div>
                      {produto.modelo && (
                        <div className="text-sm text-muted-foreground">{produto.modelo}</div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div>{produto.categoria}</div>
                      {produto.subcategoria && (
                        <div className="text-sm text-muted-foreground">{produto.subcategoria}</div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{produto.marca}</TableCell>
                  <TableCell className="text-right">
                    <div>
                      <div className="font-medium">{formatCurrency(produto.preco)}</div>
                      <div className="text-sm text-muted-foreground">
                        Custo: {formatCurrency(produto.precoCusto)}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-1">
                      {isEstoqueBaixo(produto.estoque, produto.estoqueMinimo) && (
                        <AlertTriangle className="h-4 w-4 text-yellow-500" />
                      )}
                      <span className={isEstoqueBaixo(produto.estoque, produto.estoqueMinimo) ? 'text-yellow-600 font-medium' : ''}>
                        {produto.estoque}
                      </span>
                      <span className="text-muted-foreground text-sm">
                        / {produto.estoqueMinimo}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={produto.status === 'Ativo' ? 'default' : 'secondary'}>
                      {produto.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      {onView && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onView(produto)}
                          title="Visualizar"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      )}
                      {onEdit && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onEdit(produto)}
                          title="Editar"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      )}
                      {onDelete && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            if (confirm('Tem certeza que deseja excluir este produto?')) {
                              onDelete(produto.id);
                            }
                          }}
                          title="Excluir"
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="text-sm text-muted-foreground">
        Mostrando {filteredProdutos.length} de {produtos.length} produtos
      </div>
    </div>
  );
}

