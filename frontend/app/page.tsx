'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/lib/services/auth.service';

export default function Home() {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkSetup = async () => {
      try {
        const response = await authService.checkSetup();
        if (response.needs_setup) {
          router.push('/setup');
        } else {
          router.push('/login');
        }
      } catch (error) {
        // If API is not available, go to login
        router.push('/login');
      } finally {
        setIsChecking(false);
      }
    };

    checkSetup();
  }, [router]);

  if (isChecking) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  return null;
}
