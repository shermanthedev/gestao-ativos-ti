import { z } from 'zod';

const statusEnum = z.enum(['EM_ESTOQUE', 'ALOCADO', 'MANUTENCAO']);

// Atualizar o enum de tipos sempre que o schema Prisma for alterado
const tipoEnumValues = [
  'NOTEBOOK',
  'IMPRESSORA',
  'RAMAL',
  'CABO',
  'MONITOR',
  'PERIFÉRICO',
  'NOBREAK',
  'SERVIDOR',
  'SWITCH',
  'LEITOR',
  'COMPUTADOR',
  'ACCESSPOINT',
  'ROTEADOR',
] as const;

export const createAtivoSchema = z.object({
  modelo: z.string({ error: 'O modelo do ativo é obrigatório.' }).min(1).transform(val => val.trim()),
  tipo: z.enum(tipoEnumValues as unknown as [string, ...string[]], { error: 'O tipo do ativo é obrigatório.' }),
  numeroSerie: z.string().min(1).transform(val => val.trim()).optional().nullable(),
  ip: z.string().nullable().optional().transform(val => val?.trim() ?? null),
  status: statusEnum.default('EM_ESTOQUE'),

  // Um ativo pode começar no estoque (sem funcionário ou setor) ou já ser criado alocado
  funcionarioId: z.string().nullable().default(null),
  setorId: z.string().nullable().default(null),
});

// No update, todos os campos são opcionais, mas as chaves ausentes não devem
// ser enviadas ao Prisma como `undefined` (incompatível com exactOptionalPropertyTypes).
export const updateAtivoSchema = z.object({
  modelo: z.string().min(1).transform(val => val.trim()).optional(),
  tipo: z.enum(tipoEnumValues as unknown as [string, ...string[]]).optional(),
  numeroSerie: z.string().min(1).transform(val => val.trim()).optional().nullable(),
  ip: z.string().nullable().optional().transform(val => val?.trim() ?? null),
  status: statusEnum.optional(),
  funcionarioId: z.string().nullable().optional(),
  setorId: z.string().nullable().optional(),
});

// Schema para listagem/filtros (Query Params)
export const listAtivoSchema = z.object({
  modelo: z.string().optional(),
  search: z.string().optional(),
  tipo: z.enum(tipoEnumValues as unknown as [string, ...string[]]).optional(),
  status: statusEnum.optional(),
  funcionarioId: z.string().optional(),
  setorId: z.string().optional(),
  page: z.string().optional().default('1').transform(Number),
  limit: z.string().optional().default('50').transform(Number),
});

// Schema para alocar ativos (body)
export const allocateAtivoSchema = z.object({
  modelo: z.string().optional(),
  tipo: z.enum(tipoEnumValues as unknown as [string, ...string[]]).optional(),
  quantidade: z.number().int().min(1).optional(),
  funcionarioId: z.string().nullable().optional(),
  setorId: z.string().nullable().optional(),
});

// Schema para desalocar ativos (pode enviar ids ou quantidade + funcionarioId)
export const deallocateAtivoSchema = z.object({
  ids: z.array(z.string()).optional(),
  quantidade: z.number().int().min(1).optional(),
  funcionarioId: z.string().nullable().optional(),
  setorId: z.string().nullable().optional(),
});