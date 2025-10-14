"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/auth";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredPermissions?: string[];
}

/**
 * Componente para proteger rotas que requerem autenticação
 *
 * @param children - Conteúdo a ser renderizado se autenticado
 * @param requiredPermissions - Permissões necessárias (opcional)
 */
export function ProtectedRoute({
  children,
  requiredPermissions = []
}: ProtectedRouteProps) {
  const router = useRouter();
  const { isAuthenticated, loading, user } = useAuth();

  useEffect(() => {
    // Aguarda o carregamento inicial
    if (loading) return;

    // Redireciona para login se não autenticado
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    // Verifica permissões se necessário
    if (requiredPermissions.length > 0 && user) {
      const hasPermission = checkPermissions(user.perfil, requiredPermissions);

      if (!hasPermission) {
        router.push("/dashboard");
        return;
      }
    }
  }, [isAuthenticated, loading, user, requiredPermissions, router]);

  // Mostra loading enquanto verifica autenticação
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground text-sm">Verificando autenticação...</p>
        </div>
      </div>
    );
  }

  // Não renderiza nada se não autenticado (evita flash de conteúdo)
  if (!isAuthenticated) {
    return null;
  }

  // Renderiza o conteúdo protegido
  return <>{children}</>;
}

/**
 * Verifica se o usuário tem as permissões necessárias
 */
function checkPermissions(userRole: string, requiredPermissions: string[]): boolean {
  // Hierarquia de permissões
  const roleHierarchy: Record<string, number> = {
    super_admin: 4,
    admin: 3,
    gerente: 2,
    operador: 1,
  };

  const userLevel = roleHierarchy[userRole] || 0;

  // Verifica se o usuário tem nível suficiente para alguma das permissões
  return requiredPermissions.some(permission => {
    const requiredLevel = roleHierarchy[permission] || 0;
    return userLevel >= requiredLevel;
  });
}

