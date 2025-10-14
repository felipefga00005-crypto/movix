'use client';

import { useEffect, useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';

export function BackendStatus() {
  const [status, setStatus] = useState<'checking' | 'online' | 'offline'>('checking');

  useEffect(() => {
    const checkBackend = async () => {
      try {
        const response = await fetch(`${API_URL.replace('/api/v1', '')}/health`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });
        
        if (response.ok) {
          setStatus('online');
        } else {
          setStatus('offline');
        }
      } catch (error) {
        setStatus('offline');
      }
    };

    checkBackend();
    const interval = setInterval(checkBackend, 10000); // Verifica a cada 10 segundos

    return () => clearInterval(interval);
  }, []);

  if (status === 'checking') {
    return (
      <Alert className="mb-4">
        <Loader2 className="h-4 w-4 animate-spin" />
        <AlertTitle>Verificando conexão...</AlertTitle>
        <AlertDescription>
          Conectando ao servidor backend...
        </AlertDescription>
      </Alert>
    );
  }

  if (status === 'offline') {
    return (
      <Alert variant="destructive" className="mb-4">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Backend Offline</AlertTitle>
        <AlertDescription className="space-y-2">
          <p>Não foi possível conectar ao servidor backend em <code className="bg-black/10 px-1 rounded">{API_URL}</code></p>
          <div className="mt-2 space-y-1 text-sm">
            <p className="font-semibold">Para iniciar o backend:</p>
            <ol className="list-decimal list-inside space-y-1 ml-2">
              <li>Abra um terminal</li>
              <li>Navegue até a pasta do backend: <code className="bg-black/10 px-1 rounded">cd backend</code></li>
              <li>Execute: <code className="bg-black/10 px-1 rounded">make run</code> ou <code className="bg-black/10 px-1 rounded">go run cmd/server/main.go</code></li>
            </ol>
          </div>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Alert className="mb-4 border-green-500 bg-green-50 dark:bg-green-950">
      <CheckCircle2 className="h-4 w-4 text-green-600" />
      <AlertTitle className="text-green-600">Backend Online</AlertTitle>
      <AlertDescription className="text-green-600">
        Conectado ao servidor em <code className="bg-green-100 dark:bg-green-900 px-1 rounded">{API_URL}</code>
      </AlertDescription>
    </Alert>
  );
}

