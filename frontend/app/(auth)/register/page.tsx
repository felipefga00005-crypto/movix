import { GalleryVerticalEnd } from "lucide-react";
import { RegisterForm } from "@/components/auth";

export default function RegisterPage() {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      {/* Coluna Esquerda - Formulário */}
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <a href="/" className="flex items-center gap-2 font-medium">
            <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
              <GalleryVerticalEnd className="size-4" />
            </div>
            Movix
          </a>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <RegisterForm />
          </div>
        </div>
      </div>

      {/* Coluna Direita - Imagem/Texto */}
      <div className="bg-muted relative hidden lg:block">
        <div className="absolute inset-0 flex items-center justify-center p-10">
          <div className="max-w-md space-y-4 text-center">
            <h2 className="text-4xl font-bold tracking-tight">
              Junte-se ao Movix
            </h2>
            <p className="text-muted-foreground text-lg">
              Crie sua conta e comece a gerenciar seu negócio de forma
              profissional. Controle completo de clientes, produtos,
              fornecedores e muito mais.
            </p>
            <div className="mt-8 space-y-2 text-left">
              <div className="flex items-start gap-3">
                <div className="bg-primary/10 text-primary mt-1 flex size-6 items-center justify-center rounded-full">
                  ✓
                </div>
                <div>
                  <p className="font-medium">Gestão Completa</p>
                  <p className="text-muted-foreground text-sm">
                    Controle total do seu negócio em um só lugar
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="bg-primary/10 text-primary mt-1 flex size-6 items-center justify-center rounded-full">
                  ✓
                </div>
                <div>
                  <p className="font-medium">Interface Intuitiva</p>
                  <p className="text-muted-foreground text-sm">
                    Design moderno e fácil de usar
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="bg-primary/10 text-primary mt-1 flex size-6 items-center justify-center rounded-full">
                  ✓
                </div>
                <div>
                  <p className="font-medium">Segurança Garantida</p>
                  <p className="text-muted-foreground text-sm">
                    Seus dados protegidos com criptografia
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

