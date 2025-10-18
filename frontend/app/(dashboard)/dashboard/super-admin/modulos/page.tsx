'use client';

import { useState, useEffect } from 'react';
import { LoadingSpinner } from '@/components/common/loading-spinner';
import { moduloService, type Modulo } from '@/lib/services/modulo.service';
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Package } from 'lucide-react';
import { toast } from 'sonner';

export default function ModulosPage() {
  const [modulos, setModulos] = useState<Modulo[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadModulos();
  }, []);

  const loadModulos = async () => {
    try {
      setIsLoading(true);
      const data = await moduloService.list();
      setModulos(data);
    } catch (error) {
      toast.error('Erro ao carregar módulos');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      <div className="px-4 lg:px-6">
        <h1 className="text-3xl font-bold tracking-tight">Módulos</h1>
        <p className="text-muted-foreground mt-2">Módulos disponíveis no sistema</p>
      </div>

      <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
        {modulos.map((modulo) => (
          <Card key={modulo.id} className="@container/card">
            <CardHeader>
              <CardDescription>{modulo.slug.toUpperCase()}</CardDescription>
              <CardTitle className="text-2xl font-semibold">{modulo.nome}</CardTitle>
              <CardAction>
                <Badge variant={modulo.ativo ? 'default' : 'secondary'}>
                  {modulo.ativo ? 'Ativo' : 'Inativo'}
                </Badge>
              </CardAction>
            </CardHeader>
            <CardFooter className="flex-col items-start gap-1.5 text-sm">
              <div className="line-clamp-2 font-medium">
                {modulo.descricao}
              </div>
              <div className="text-muted-foreground">
                Disponível para todas as empresas
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}

