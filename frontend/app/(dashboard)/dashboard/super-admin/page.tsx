'use client';

import { StatsCard } from '@/components/admin/stats-card';

export default function SuperAdminDashboard() {
  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
        <StatsCard
          title="Total de Empresas"
          value="0"
          description="Nenhuma empresa cadastrada"
          footerText="Comece criando sua primeira empresa"
        />
        <StatsCard
          title="Total de Usuários"
          value="1"
          description="Super Admin ativo"
          footerText="Crie convites para novos usuários"
          trend={{ value: 0, isPositive: true }}
        />
        <StatsCard
          title="Módulos Ativos"
          value="4"
          description="Todos os módulos disponíveis"
          footerText="NF-e, NFC-e, CT-e, MDF-e"
        />
        <StatsCard
          title="Sistema"
          value="Online"
          description="Todos os serviços operacionais"
          footerText="Performance estável"
          trend={{ value: 100, isPositive: true }}
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

