"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/auth";
import { Loader2 } from "lucide-react";

interface PublicRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
}

/**
 * Componente para rotas públicas (login, register, etc)
 * Redireciona para o dashboard se o usuário já estiver autenticado
 *
 * @param children - Conteúdo a ser renderizado se não autenticado
 * @param redirectTo - Rota para redirecionar se autenticado (padrão: /dashboard)
 */
export function PublicRoute({
  children,
  redirectTo = "/dashboard"
}: PublicRouteProps) {
  const router = useRouter();
  const { isAuthenticated, loading } = useAuth();

  useEffect(() => {
    // Aguarda o carregamento inicial
    if (loading) return;

    // Redireciona para dashboard se já autenticado
    if (isAuthenticated) {
      router.push(redirectTo);
    }
  }, [isAuthenticated, loading, redirectTo, router]);

  // Mostra loading enquanto verifica autenticação
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground text-sm">Carregando...</p>
        </div>
      </div>
    );
  }

  // Não renderiza nada se autenticado (evita flash de conteúdo)
  if (isAuthenticated) {
    return null;
  }

  // Renderiza o conteúdo público
  return <>{children}</>;
}

