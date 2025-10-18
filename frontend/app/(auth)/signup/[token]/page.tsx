'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
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

interface InviteData {
  email: string;
  role: string;
  empresa_id?: string;
  expires_at: string;
}

export default function SignupPage() {
  const params = useParams();
  const router = useRouter();
  const token = params.token as string;

  const [inviteData, setInviteData] = useState<InviteData | null>(null);
  const [nome, setNome] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingInvite, setIsLoadingInvite] = useState(true);

  useEffect(() => {
    const fetchInvite = async () => {
      try {
        const data = await authService.getInvite(token);
        setInviteData(data);
      } catch (error: any) {
        toast.error('Convite inválido ou expirado');
        router.push('/login');
      } finally {
        setIsLoadingInvite(false);
      }
    };

    if (token) {
      fetchInvite();
    }
  }, [token, router]);

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
      await authService.acceptInvite({
        token,
        nome,
        password,
      });

      toast.success('Conta criada com sucesso!');
      router.push('/login');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erro ao criar conta');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoadingInvite) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4"></div>
            <p className="text-muted-foreground">Verificando convite...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!inviteData) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Criar sua conta</CardTitle>
        <CardDescription>
          Complete seu cadastro para acessar o sistema
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <Input
                id="email"
                type="email"
                value={inviteData.email}
                disabled
              />
            </Field>

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
                {isLoading ? 'Criando conta...' : 'Criar conta'}
              </Button>
            </Field>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}

