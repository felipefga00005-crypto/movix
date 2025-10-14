"use client";

import { useAuth } from "@/hooks/auth";
import { getAuthToken, getCurrentUserFromStorage, setAuthToken, setCurrentUser } from "@/lib/auth";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

export function AuthDebug() {
  const { user, loading, isAuthenticated } = useAuth();
  const [localStorageData, setLocalStorageData] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const updateData = () => {
      setLocalStorageData({
        token: getAuthToken(),
        user: getCurrentUserFromStorage(),
      });
    };

    updateData();
    const interval = setInterval(updateData, 1000);

    return () => clearInterval(interval);
  }, []);

  const testLocalStorage = () => {
    console.log("=== TESTE DE LOCALSTORAGE ===");

    // Teste 1: Salvar token
    const testToken = "test-token-123";
    setAuthToken(testToken);
    console.log("1. Token salvo:", testToken);

    // Teste 2: Recuperar token
    const retrievedToken = getAuthToken();
    console.log("2. Token recuperado:", retrievedToken);
    console.log("3. Tokens são iguais?", testToken === retrievedToken);

    // Teste 3: Salvar usuário
    const testUser = { id: 999, nome: "Teste", email: "teste@teste.com" };
    setCurrentUser(testUser as any);
    console.log("4. Usuário salvo:", testUser);

    // Teste 4: Recuperar usuário
    const retrievedUser = getCurrentUserFromStorage();
    console.log("5. Usuário recuperado:", retrievedUser);

    // Teste 5: Verificar localStorage diretamente
    console.log("6. localStorage.getItem('auth_token'):", localStorage.getItem('auth_token'));
    console.log("7. localStorage.getItem('current_user'):", localStorage.getItem('current_user'));

    console.log("=== FIM DO TESTE ===");
  };

  if (process.env.NODE_ENV === "production" || !isVisible) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-md rounded-lg border bg-background p-4 shadow-lg">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-bold">🔍 Auth Debug</h3>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={() => setIsVisible(false)}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
      <div className="space-y-2 text-xs">
        <div>
          <strong>Context State:</strong>
          <pre className="mt-1 rounded bg-muted p-2 overflow-auto max-h-32">
            {JSON.stringify(
              {
                loading,
                isAuthenticated,
                hasUser: !!user,
                userName: user?.nome,
                userEmail: user?.email,
              },
              null,
              2
            )}
          </pre>
        </div>
        <div>
          <strong>LocalStorage:</strong>
          <pre className="mt-1 rounded bg-muted p-2 overflow-auto max-h-32">
            {JSON.stringify(
              {
                hasToken: !!localStorageData?.token,
                tokenLength: localStorageData?.token?.length || 0,
                tokenPreview: localStorageData?.token?.substring(0, 20) + "...",
                hasUser: !!localStorageData?.user,
                userName: localStorageData?.user?.nome,
                userEmail: localStorageData?.user?.email,
              },
              null,
              2
            )}
          </pre>
        </div>
        <Button
          onClick={testLocalStorage}
          size="sm"
          variant="outline"
          className="w-full"
        >
          Testar LocalStorage
        </Button>
      </div>
    </div>
  );
}

