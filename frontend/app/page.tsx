import { redirect } from 'next/navigation';
import { checkSetupStatus } from '@/lib/auth';

export default async function Home() {
  try {
    const status = await checkSetupStatus();

    if (status.setupRequired) {
      redirect('/setup');
    } else {
      redirect('/login');
    }
  } catch (error) {
    // Se houver erro ao verificar o status, redireciona para login
    redirect('/login');
  }
}
