'use client';

import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { IconEdit, IconTrash } from '@tabler/icons-react';
import type { Empresa } from '@/lib/services/empresa.service';

interface EmpresaCardProps {
  empresa: Empresa;
  onEdit?: (empresa: Empresa) => void;
  onDelete?: (empresa: Empresa) => void;
}

export function EmpresaCard({ empresa, onEdit, onDelete }: EmpresaCardProps) {
  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'active':
        return 'default';
      case 'inactive':
        return 'secondary';
      case 'suspended':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active':
        return 'Ativo';
      case 'inactive':
        return 'Inativo';
      case 'suspended':
        return 'Suspenso';
      default:
        return status;
    }
  };

  const getPlanoLabel = (plano: string) => {
    switch (plano) {
      case 'premium':
        return 'Premium';
      case 'pro':
        return 'Pro';
      case 'basic':
        return 'Básico';
      default:
        return plano;
    }
  };

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardDescription>{empresa.razao_social || 'Sem razão social'}</CardDescription>
        <CardTitle className="text-2xl font-semibold">{empresa.nome}</CardTitle>
        <CardAction>
          <Badge variant={getStatusVariant(empresa.status)}>
            {getStatusLabel(empresa.status)}
          </Badge>
        </CardAction>
      </CardHeader>
      <CardFooter className="flex-col items-start gap-3 text-sm">
        <div className="flex w-full items-center justify-between">
          <div className="flex gap-2">
            <Badge variant="outline">{getPlanoLabel(empresa.plano)}</Badge>
          </div>
          <div className="text-muted-foreground text-xs">
            {new Date(empresa.created_at).toLocaleDateString('pt-BR')}
          </div>
        </div>
        <div className="flex w-full gap-2">
          {onEdit && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(empresa)}
              className="flex-1"
            >
              <IconEdit className="mr-2 h-4 w-4" />
              Editar
            </Button>
          )}
          {onDelete && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDelete(empresa)}
              className="flex-1"
            >
              <IconTrash className="mr-2 h-4 w-4" />
              Deletar
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}

