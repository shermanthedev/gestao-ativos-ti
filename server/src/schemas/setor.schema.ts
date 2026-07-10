import { z } from 'zod';

export const createSetorSchema = z.object({
  nome: z
    .string({ error: 'O campo "nome" é obrigatório.' })
    .min(1, 'O campo "nome" não pode estar vazio.')
    .transform((val) => val.trim()),
});

export const updateSetorSchema = createSetorSchema.partial();

export const listSetorSchema = z.object({
  nome: z.string().optional(),
  page: z.string().optional().default('1').transform(Number),
  limit: z.string().optional().default('50').transform(Number),
});
