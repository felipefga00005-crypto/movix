'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
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

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await authService.requestPasswordReset({ email });

      setIsSuccess(true);
      toast.success('Instruções enviadas para seu email');

      // In development, show the token
      if (response.token) {
        console.log('Reset token:', response.token);
        toast.info(`Token de reset (dev): ${response.token}`);
      }
    } catch (error: any) {
      toast.error('Erro ao solicitar recuperação de senha');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Email enviado!</CardTitle>
          <CardDescription>
            Verifique sua caixa de entrada
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Se o email {email} estiver cadastrado, você receberá um link para redefinir sua senha.
            </p>
            <p className="text-sm text-muted-foreground">
              O link é válido por 1 hora.
            </p>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => router.push('/login')}
            >
              Voltar para login
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recuperar senha</CardTitle>
        <CardDescription>
          Digite seu email para receber instruções
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
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </Field>

            <Field>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Enviando...' : 'Enviar instruções'}
              </Button>
            </Field>

            <Field>
              <Link href="/login">
                <Button variant="ghost" className="w-full">
                  Voltar para login
                </Button>
              </Link>
            </Field>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}

