'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Field,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { authService } from '@/lib/services/auth.service';

export default function SetupPage() {
  const router = useRouter();
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [needsSetup, setNeedsSetup] = useState<boolean | null>(null);

  useEffect(() => {
    const checkSetup = async () => {
      try {
        const response = await authService.checkSetup();
        setNeedsSetup(response.needs_setup);

        if (!response.needs_setup) {
          toast.info('Sistema já configurado');
          router.push('/login');
        }
      } catch (error) {
        console.error('Error checking setup status:', error);
      }
    };

    checkSetup();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error('As senhas não coincidem');
      return;
    }

    if (password.length < 6) {
      toast.error('A senha deve ter pelo menos 6 caracteres');
      return;
    }

    setIsLoading(true);

    try {
      const response = await authService.setup({
        nome,
        email,
        password,
      });

      // Save authentication data
      authService.saveAuth(response.token, response.user);

      toast.success('Sistema configurado com sucesso!');
      router.push('/dashboard/super-admin');
    } catch (error: any) {
      toast.error(error.response?.data || 'Erro ao configurar sistema');
    } finally {
      setIsLoading(false);
    }
  };

  if (needsSetup === null) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4"></div>
            <p className="text-muted-foreground">Verificando sistema...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!needsSetup) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>🚀 Configuração Inicial</CardTitle>
        <CardDescription>
          Bem-vindo! Configure o primeiro Super Admin do sistema
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="nome">Nome completo</FieldLabel>
              <Input
                id="nome"
                type="text"
                placeholder="Seu nome completo"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                required
                disabled={isLoading}
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="password">Senha</FieldLabel>
              <Input
                id="password"
                type="password"
                placeholder="Mínimo 6 caracteres"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
                minLength={6}
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="confirmPassword">Confirmar senha</FieldLabel>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Digite a senha novamente"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={isLoading}
                minLength={6}
              />
            </Field>

            <Field>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Configurando...' : 'Configurar Sistema'}
              </Button>
            </Field>
          </FieldGroup>
        </form>

        <div className="mt-6 p-4 bg-muted rounded-lg">
          <p className="text-sm text-muted-foreground">
            <strong>ℹ️ Importante:</strong> Esta conta terá acesso total ao sistema.
            Guarde suas credenciais em local seguro.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

