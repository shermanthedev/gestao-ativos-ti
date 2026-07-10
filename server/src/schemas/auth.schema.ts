import { z } from 'zod';

export const loginSchema = z.object({
  email: z
    .string({ error: 'O campo "email" é obrigatório.' })
    .email('O formato do email é inválido.')
    .transform((val) => val.trim().toLowerCase()),

  senha: z
    .string({ error: 'A senha é obrigatória.' })
    .min(1, 'A senha não pode estar vazia.'),
});

export const registerPrimeiroSchema = z.object({
  nome: z
    .string({ error: 'O campo "nome" é obrigatório.' })
    .min(1, 'O campo "nome" não pode estar vazio.')
    .transform((val) => val.trim()),

  email: z
    .string({ error: 'O campo "email" é obrigatório.' })
    .email('O formato do email é inválido.')
    .transform((val) => val.trim().toLowerCase()),

  senha: z
    .string({ error: 'A senha é obrigatória.' })
    .min(6, 'A senha deve ter no mínimo 6 caracteres.'),
});
