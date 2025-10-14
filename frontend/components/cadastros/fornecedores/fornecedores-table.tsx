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
import { Pencil, Trash2, Search, Eye } from 'lucide-react';

interface Fornecedor {
  id: number;
  codigo: string;
  razaoSocial: string;
  nomeFantasia: string;
  cnpj: string;
  email: string;
  telefone: string;
  cidade: string;
  uf: string;
  status: string;
  categoria: string;
  contato: string;
}

interface FornecedoresTableProps {
  fornecedores: Fornecedor[];
  onEdit?: (fornecedor: Fornecedor) => void;
  onDelete?: (id: number) => void;
  onView?: (fornecedor: Fornecedor) => void;
  loading?: boolean;
}

export function FornecedoresTable({ 
  fornecedores, 
  onEdit, 
  onDelete, 
  onView, 
  loading 
}: FornecedoresTableProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredFornecedores = fornecedores.filter(fornecedor =>
    fornecedor.razaoSocial.toLowerCase().includes(searchTerm.toLowerCase()) ||
    fornecedor.nomeFantasia.toLowerCase().includes(searchTerm.toLowerCase()) ||
    fornecedor.cnpj.includes(searchTerm) ||
    fornecedor.codigo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatCNPJ = (cnpj: string) => {
    // Remove caracteres não numéricos
    const cleaned = cnpj.replace(/\D/g, '');
    // Formata: 12.345.678/0001-90
    if (cleaned.length === 14) {
      return cleaned.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
    }
    return cnpj;
  };

  const formatPhone = (phone: string) => {
    if (!phone) return '-';
    // Remove caracteres não numéricos
    const cleaned = phone.replace(/\D/g, '');
    // Formata: (11) 3456-7890 ou (11) 93456-7890
    if (cleaned.length === 10) {
      return cleaned.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    } else if (cleaned.length === 11) {
      return cleaned.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    }
    return phone;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por razão social, nome fantasia, CNPJ ou código..."
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
              <TableHead>Razão Social</TableHead>
              <TableHead>Nome Fantasia</TableHead>
              <TableHead>CNPJ</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead>Cidade/UF</TableHead>
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
            ) : filteredFornecedores.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8">
                  Nenhum fornecedor encontrado
                </TableCell>
              </TableRow>
            ) : (
              filteredFornecedores.map((fornecedor) => (
                <TableRow key={fornecedor.id}>
                  <TableCell className="font-medium">{fornecedor.codigo}</TableCell>
                  <TableCell>{fornecedor.razaoSocial}</TableCell>
                  <TableCell>{fornecedor.nomeFantasia}</TableCell>
                  <TableCell>{formatCNPJ(fornecedor.cnpj)}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-muted-foreground px-1.5">
                      {fornecedor.categoria}
                    </Badge>
                  </TableCell>
                  <TableCell>{fornecedor.cidade}/{fornecedor.uf}</TableCell>
                  <TableCell>
                    <Badge variant={fornecedor.status === 'Ativo' ? 'default' : 'secondary'}>
                      {fornecedor.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      {onView && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onView(fornecedor)}
                          title="Visualizar"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      )}
                      {onEdit && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onEdit(fornecedor)}
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
                            if (confirm('Tem certeza que deseja excluir este fornecedor?')) {
                              onDelete(fornecedor.id);
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
        Mostrando {filteredFornecedores.length} de {fornecedores.length} fornecedores
      </div>
    </div>
  );
}

