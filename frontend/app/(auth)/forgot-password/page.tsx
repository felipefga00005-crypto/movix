import { GalleryVerticalEnd } from "lucide-react";
import { ForgotPasswordForm } from "@/components/auth";
import Link from "next/link";

export default function ForgotPasswordPage() {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      {/* Coluna Esquerda - Formulário */}
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <Link href="/" className="flex items-center gap-2 font-medium">
            <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
              <GalleryVerticalEnd className="size-4" />
            </div>
            Movix
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <ForgotPasswordForm />
          </div>
        </div>
      </div>

      {/* Coluna Direita - Imagem/Texto */}
      <div className="bg-muted relative hidden lg:block">
        <div className="absolute inset-0 flex items-center justify-center p-10">
          <div className="max-w-md space-y-4 text-center">
            <h2 className="text-4xl font-bold tracking-tight">
              Recupere sua conta
            </h2>
            <p className="text-muted-foreground text-lg">
              Não se preocupe! Digite seu email e enviaremos instruções para
              redefinir sua senha.
            </p>
            <div className="mt-8 space-y-3 text-left">
              <div className="bg-primary/5 rounded-lg p-4">
                <p className="text-sm font-medium">📧 Passo 1</p>
                <p className="text-muted-foreground text-sm">
                  Digite seu email cadastrado
                </p>
              </div>
              <div className="bg-primary/5 rounded-lg p-4">
                <p className="text-sm font-medium">✉️ Passo 2</p>
                <p className="text-muted-foreground text-sm">
                  Receba o link de recuperação no seu email
                </p>
              </div>
              <div className="bg-primary/5 rounded-lg p-4">
                <p className="text-sm font-medium">🔒 Passo 3</p>
                <p className="text-muted-foreground text-sm">
                  Crie uma nova senha segura
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

