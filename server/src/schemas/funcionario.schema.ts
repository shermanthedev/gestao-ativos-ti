import { z } from 'zod';

// Schema para criação (POST)
export const createFuncionarioSchema = z.object({
  nome: z
    .string({ error: 'O campo "nome" é obrigatório.' })
    .min(1, 'O campo "nome" não pode estar vazio.')
    .transform((val) => val.trim()),

  email: z
    .string({ error: 'O campo "email" é obrigatório.' })
    .email('O formato do email é inválido.')
    .transform((val) => val.trim().toLowerCase()),

  setorId: z
    .string({ error: 'O campo "setorId" é obrigatório.' })
    .uuid('O setorId deve ser um UUID válido (ou ajuste caso use outro ID).')
    .transform((val) => val.trim()),
});

// Schema para atualização (PUT/PATCH) - reaproveita o de cima deixando tudo opcional
export const updateFuncionarioSchema = createFuncionarioSchema.partial();

// Schema para listagem/filtros (Query Params)
export const listFuncionarioSchema = z.object({
  nome: z.string().optional(),
  email: z.string().optional(),
  setorId: z.string().optional(),
  page: z.string().optional().default('1').transform(Number),
  limit: z.string().optional().default('50').transform(Number),
});
