'use client';

import { StatsCard } from '@/components/admin/stats-card';

export default function AdminDashboard() {
  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
        <StatsCard
          title="Usuários"
          value="0"
          description="Nenhum usuário cadastrado"
          footerText="Adicione usuários à sua empresa"
        />
        <StatsCard
          title="Documentos Emitidos"
          value="0"
          description="Nenhum documento emitido"
          footerText="Comece a emitir documentos fiscais"
          trend={{ value: 0, isPositive: true }}
        />
        <StatsCard
          title="Módulos Ativos"
          value="0"
          description="Nenhum módulo ativo"
          footerText="Ative módulos para sua empresa"
        />
        <StatsCard
          title="Crescimento"
          value="0%"
          description="Sem dados suficientes"
          footerText="Dados do mês anterior"
          trend={{ value: 0, isPositive: true }}
        />
      </div>

      <div className="px-4 lg:px-6">
        <div className="rounded-xl bg-muted/50 p-6">
          <h2 className="text-xl font-semibold mb-4">Atividades Recentes</h2>
          <p className="text-muted-foreground">Nenhuma atividade recente</p>
        </div>
      </div>
    </div>
  );
}

