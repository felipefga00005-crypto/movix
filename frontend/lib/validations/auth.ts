import { z } from "zod";

/**
 * Schema de validação para login
 */
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email é obrigatório")
    .email("Email inválido"),
  senha: z
    .string()
    .min(1, "Senha é obrigatória")
    .min(6, "Senha deve ter no mínimo 6 caracteres"),
  rememberMe: z.boolean().default(false),
});

export type LoginFormData = z.infer<typeof loginSchema>;

/**
 * Schema de validação para registro
 */
export const registerSchema = z
  .object({
    nome: z
      .string()
      .min(1, "Nome é obrigatório")
      .min(3, "Nome deve ter no mínimo 3 caracteres")
      .max(100, "Nome deve ter no máximo 100 caracteres"),
    email: z
      .string()
      .min(1, "Email é obrigatório")
      .email("Email inválido"),
    senha: z
      .string()
      .min(1, "Senha é obrigatória")
      .min(6, "Senha deve ter no mínimo 6 caracteres")
      .max(100, "Senha deve ter no máximo 100 caracteres")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "Senha deve conter pelo menos uma letra maiúscula, uma minúscula e um número"
      ),
    confirmarSenha: z
      .string()
      .min(1, "Confirmação de senha é obrigatória"),
    aceitarTermos: z
      .boolean()
      .refine((val) => val === true, {
        message: "Você deve aceitar os termos de serviço",
      }),
  })
  .refine((data) => data.senha === data.confirmarSenha, {
    message: "As senhas não coincidem",
    path: ["confirmarSenha"],
  });

export type RegisterFormData = z.infer<typeof registerSchema>;

/**
 * Schema de validação para setup inicial (super admin)
 */
export const setupSchema = z
  .object({
    nome: z
      .string()
      .min(1, "Nome é obrigatório")
      .min(3, "Nome deve ter no mínimo 3 caracteres")
      .max(100, "Nome deve ter no máximo 100 caracteres"),
    email: z
      .string()
      .min(1, "Email é obrigatório")
      .email("Email inválido"),
    senha: z
      .string()
      .min(1, "Senha é obrigatória")
      .min(6, "Senha deve ter no mínimo 6 caracteres")
      .max(100, "Senha deve ter no máximo 100 caracteres")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "Senha deve conter pelo menos uma letra maiúscula, uma minúscula e um número"
      ),
    confirmarSenha: z
      .string()
      .min(1, "Confirmação de senha é obrigatória"),
  })
  .refine((data) => data.senha === data.confirmarSenha, {
    message: "As senhas não coincidem",
    path: ["confirmarSenha"],
  });

export type SetupFormData = z.infer<typeof setupSchema>;

/**
 * Schema de validação para esqueci a senha
 */
export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, "Email é obrigatório")
    .email("Email inválido"),
});

export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

/**
 * Schema de validação para reset de senha
 */
export const resetPasswordSchema = z
  .object({
    senha: z
      .string()
      .min(1, "Senha é obrigatória")
      .min(6, "Senha deve ter no mínimo 6 caracteres")
      .max(100, "Senha deve ter no máximo 100 caracteres")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "Senha deve conter pelo menos uma letra maiúscula, uma minúscula e um número"
      ),
    confirmarSenha: z
      .string()
      .min(1, "Confirmação de senha é obrigatória"),
  })
  .refine((data) => data.senha === data.confirmarSenha, {
    message: "As senhas não coincidem",
    path: ["confirmarSenha"],
  });

export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

/**
 * Schema de validação para alteração de senha (perfil)
 */
export const changePasswordSchema = z
  .object({
    senhaAtual: z
      .string()
      .min(1, "Senha atual é obrigatória"),
    novaSenha: z
      .string()
      .min(1, "Nova senha é obrigatória")
      .min(6, "Senha deve ter no mínimo 6 caracteres")
      .max(100, "Senha deve ter no máximo 100 caracteres")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "Senha deve conter pelo menos uma letra maiúscula, uma minúscula e um número"
      ),
    confirmarNovaSenha: z
      .string()
      .min(1, "Confirmação de senha é obrigatória"),
  })
  .refine((data) => data.novaSenha === data.confirmarNovaSenha, {
    message: "As senhas não coincidem",
    path: ["confirmarNovaSenha"],
  })
  .refine((data) => data.senhaAtual !== data.novaSenha, {
    message: "A nova senha deve ser diferente da senha atual",
    path: ["novaSenha"],
  });

export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;

/**
 * Utilitário para validar força da senha
 */
export const getPasswordStrength = (password: string): {
  score: number;
  label: string;
  color: string;
} => {
  let score = 0;

  if (!password) {
    return { score: 0, label: "Muito fraca", color: "bg-red-500" };
  }

  // Comprimento
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;

  // Complexidade
  if (/[a-z]/.test(password)) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^a-zA-Z\d]/.test(password)) score++;

  if (score <= 2) {
    return { score, label: "Fraca", color: "bg-red-500" };
  } else if (score <= 4) {
    return { score, label: "Média", color: "bg-yellow-500" };
  } else {
    return { score, label: "Forte", color: "bg-green-500" };
  }
};

