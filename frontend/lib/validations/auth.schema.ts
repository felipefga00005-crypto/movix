/**
 * Auth Schemas - Validações Zod para formulários de autenticação
 */

import { z } from 'zod'

// ============================================
// LOGIN SCHEMA
// ============================================

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email é obrigatório')
    .email('Email inválido'),
  senha: z
    .string()
    .min(1, 'Senha é obrigatória')
    .min(6, 'Senha deve ter no mínimo 6 caracteres'),
})

export type LoginFormData = z.infer<typeof loginSchema>

// ============================================
// SETUP SCHEMA
// ============================================

export const setupSchema = z.object({
  nome: z
    .string()
    .min(1, 'Nome é obrigatório')
    .min(3, 'Nome deve ter no mínimo 3 caracteres')
    .max(200, 'Nome deve ter no máximo 200 caracteres'),
  email: z
    .string()
    .min(1, 'Email é obrigatório')
    .email('Email inválido')
    .max(200, 'Email deve ter no máximo 200 caracteres'),
  senha: z
    .string()
    .min(1, 'Senha é obrigatória')
    .min(6, 'Senha deve ter no mínimo 6 caracteres')
    .max(100, 'Senha deve ter no máximo 100 caracteres'),
  telefone: z
    .string()
    .optional()
    .refine(
      (val) => !val || val.length >= 10,
      'Telefone deve ter no mínimo 10 caracteres'
    ),
})

export type SetupFormData = z.infer<typeof setupSchema>

// ============================================
// REGISTER SCHEMA
// ============================================

export const registerSchema = z.object({
  nome: z
    .string()
    .min(1, 'Nome é obrigatório')
    .min(3, 'Nome deve ter no mínimo 3 caracteres')
    .max(200, 'Nome deve ter no máximo 200 caracteres'),
  email: z
    .string()
    .min(1, 'Email é obrigatório')
    .email('Email inválido')
    .max(200, 'Email deve ter no máximo 200 caracteres'),
  senha: z
    .string()
    .min(1, 'Senha é obrigatória')
    .min(6, 'Senha deve ter no mínimo 6 caracteres')
    .max(100, 'Senha deve ter no máximo 100 caracteres'),
  telefone: z
    .string()
    .optional(),
  cargo: z
    .string()
    .max(100, 'Cargo deve ter no máximo 100 caracteres')
    .optional(),
  departamento: z
    .string()
    .max(100, 'Departamento deve ter no máximo 100 caracteres')
    .optional(),
  perfil: z
    .enum(['admin', 'gerente', 'vendedor', 'operador'])
    .optional(),
})

export type RegisterFormData = z.infer<typeof registerSchema>

// ============================================
// CHANGE PASSWORD SCHEMA
// ============================================

export const changePasswordSchema = z
  .object({
    senhaAtual: z
      .string()
      .min(1, 'Senha atual é obrigatória'),
    senhaNova: z
      .string()
      .min(1, 'Nova senha é obrigatória')
      .min(6, 'Nova senha deve ter no mínimo 6 caracteres')
      .max(100, 'Nova senha deve ter no máximo 100 caracteres'),
    confirmarSenha: z
      .string()
      .min(1, 'Confirmação de senha é obrigatória'),
  })
  .refine((data) => data.senhaNova === data.confirmarSenha, {
    message: 'As senhas não coincidem',
    path: ['confirmarSenha'],
  })

export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>

// ============================================
// UPDATE USER SCHEMA
// ============================================

export const updateUserSchema = z.object({
  nome: z
    .string()
    .min(3, 'Nome deve ter no mínimo 3 caracteres')
    .max(200, 'Nome deve ter no máximo 200 caracteres')
    .optional(),
  email: z
    .string()
    .email('Email inválido')
    .max(200, 'Email deve ter no máximo 200 caracteres')
    .optional(),
  telefone: z
    .string()
    .optional(),
  cargo: z
    .string()
    .max(100, 'Cargo deve ter no máximo 100 caracteres')
    .optional(),
  departamento: z
    .string()
    .max(100, 'Departamento deve ter no máximo 100 caracteres')
    .optional(),
  perfil: z
    .enum(['super_admin', 'admin', 'gerente', 'vendedor', 'operador'])
    .optional(),
  status: z
    .enum(['Ativo', 'Inativo', 'Pendente'])
    .optional(),
  avatar: z
    .string()
    .url('URL do avatar inválida')
    .optional(),
})

export type UpdateUserFormData = z.infer<typeof updateUserSchema>

