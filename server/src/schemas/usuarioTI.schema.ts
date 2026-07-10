import { z } from 'zod';

// Schema para criação (POST)
export const createUsuarioTISchema = z.object({
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

// Schema para atualização (PUT/PATCH) - reaproveita o de cima, deixa tudo opcional,
// mas permite trocar a senha de forma isolada.
export const updateUsuarioTISchema = createUsuarioTISchema.partial();

// Schema para listagem/filtros (Query Params)
export const listUsuarioTISchema = z.object({
  nome: z.string().optional(),
  email: z.string().optional(),
  page: z.string().optional().default('1').transform(Number),
  limit: z.string().optional().default('50').transform(Number),
});
