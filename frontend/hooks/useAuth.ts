'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  User, 
  getAuthToken, 
  getCurrentUser, 
  logout as authLogout,
  getCurrentUserFromStorage,
  setCurrentUser as saveCurrentUser
} from '@/lib/auth';

export function useAuth() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = getAuthToken();
      
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        // Primeiro tenta pegar do localStorage
        const cachedUser = getCurrentUserFromStorage();
        if (cachedUser) {
          setUser(cachedUser);
        }

        // Depois busca do servidor para garantir que está atualizado
        const currentUser = await getCurrentUser(token);
        setUser(currentUser);
        saveCurrentUser(currentUser);
      } catch (error) {
        // Token inválido ou erro de rede - faz logout silencioso
        authLogout();
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const logout = () => {
    authLogout();
    setUser(null);
    router.push('/login');
  };

  return {
    user,
    loading,
    isAuthenticated: !!user,
    logout,
  };
}

