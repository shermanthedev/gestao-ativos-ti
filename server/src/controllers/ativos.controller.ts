import type { Request, Response } from 'express';
import { Prisma, TipoAtivo } from '@prisma/client';
import { prisma } from '../config/database.js';
import { AppError, formatZodError } from '../utils/AppError.js';
import { createAtivoSchema, updateAtivoSchema, listAtivoSchema, allocateAtivoSchema, deallocateAtivoSchema } from '../schemas/ativo.schema.js';
import { createAuditLog } from '../utils/auditLog.js';

const ativoSelect = {
  id: true,
  modelo: true,
  tipo: true,
  numeroSerie: true,
  ip: true,
  status: true,
  createdAt: true,
  funcionarioId: true,
  setorId: true,
  funcionario: {
    select: { id: true, nome: true }
  },
  setor: {
    select: { id: true, nome: true }
  }
} satisfies Prisma.AtivoSelect;

export class AtivoController {
  
  // 1. Criar Ativo (cria N registros quando é stackable e quantidade>1)
  async create(req: Request, res: Response) {
    const resultado = createAtivoSchema.safeParse(req.body);
    if (!resultado.success) {
      throw new AppError(formatZodError(resultado.error), 400);
    }

    let { modelo, tipo, numeroSerie, status, funcionarioId, setorId } = resultado.data;

    // Regra de negócio: Se informou funcionário, valida a existência e herda o setor dele
    if (funcionarioId) {
      const funcionario = await prisma.funcionario.findUnique({ where: { id: funcionarioId } });
      if (!funcionario) {
        throw new AppError('Funcionário informado não existe.', 404);
      }
      setorId = funcionario.setorId; // Vincula automaticamente ao setor do funcionário
      status = !status || status === 'EM_ESTOQUE' ? 'ALOCADO' : status; // Se estava em estoque, vira alocado
    } else if (setorId) {
      // Se não tem funcionário mas tem setor fixo (ex: Laboratório), valida o setor
      const setor = await prisma.setor.findUnique({ where: { id: setorId } });
      if (!setor) {
        throw new AppError('Setor informado não existe.', 404);
      }
    }

    try {
      const novoAtivo = await prisma.ativo.create({
        data: {
          modelo,
          tipo: tipo as TipoAtivo,
          numeroSerie: numeroSerie || null,
          status,
          funcionarioId,
          setorId
        },
        select: ativoSelect
      });

      await createAuditLog(req, 'CREATE', 'Ativo', `${req.user?.nome ?? 'desconhecido'} cadastrou o ativo ${novoAtivo.modelo}`)

      return res.status(201).json(novoAtivo);
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
        throw new AppError('Já existe um ativo cadastrado com este número de série.', 409);
      }
      throw err;
    }
  }

  // 2. Listar Ativos com filtros flexíveis
  async list(req: Request, res: Response) {
    const resultado = listAtivoSchema.safeParse(req.query);
    if (!resultado.success) {
      throw new AppError(formatZodError(resultado.error), 400);
    }

    const { modelo, tipo, status, funcionarioId, setorId, page, limit, search } = resultado.data;
    const searchValue = search?.trim();

    const where: Prisma.AtivoWhereInput = {
      ...(searchValue
        ? {
            OR: [
              { modelo: { contains: searchValue, mode: 'insensitive' as const } },
              { numeroSerie: { contains: searchValue, mode: 'insensitive' as const } },
              { ip: { contains: searchValue, mode: 'insensitive' as const } },
            ],
          }
        : {}),
      ...(modelo && { modelo: { contains: modelo, mode: 'insensitive' as const } }),
      ...(tipo && { tipo: tipo as unknown as TipoAtivo }),
      ...(status && { status }),
      ...(funcionarioId && { funcionarioId }),
      ...(setorId && { setorId })
    };

    const [ativos, total] = await Promise.all([
      prisma.ativo.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        select: ativoSelect,
        take: limit,
        skip: (page - 1) * limit
      }),
      prisma.ativo.count({ where })
    ]);

    return res.json({ data: ativos, total, page, limit });
  }

  // 3. Atualizar Ativo (Transferências ou Mudança de Status)
  async update(req: Request, res: Response) {
    const id = String(req.params.id);

    const ativoExistente = await prisma.ativo.findUnique({ where: { id } });
    if (!ativoExistente) {
      throw new AppError('Ativo não encontrado.', 404);
    }

    const resultado = updateAtivoSchema.safeParse(req.body);
    if (!resultado.success) {
      throw new AppError(formatZodError(resultado.error), 400);
    }

    // Remove chaves com `undefined` para que Prisma (exactOptionalPropertyTypes)
    // não reclame ao atualizar apenas os campos enviados.
    const dadosAtualizacao: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(resultado.data)) {
      if (value !== undefined) {
        dadosAtualizacao[key] = value;
      }
    }

    // Se o funcionarioId foi enviado no corpo do update
    if (typeof dadosAtualizacao.funcionarioId === 'string') {
      const funcionario = await prisma.funcionario.findUnique({ where: { id: dadosAtualizacao.funcionarioId } });
      if (!funcionario) {
        throw new AppError('Funcionário informado não existe.', 404);
      }
      dadosAtualizacao.setorId = funcionario.setorId;
      if (!dadosAtualizacao.status || dadosAtualizacao.status === 'EM_ESTOQUE') {
        dadosAtualizacao.status = 'ALOCADO';
      }
    } else if (dadosAtualizacao.funcionarioId === null) {
      // Se explicitamente removeu o funcionário (devolvido ao estoque)
      if (!dadosAtualizacao.status) {
        dadosAtualizacao.status = 'EM_ESTOQUE';
      }
    }

    try {
      const ativoAtualizado = await prisma.ativo.update({
        where: { id },
        data: dadosAtualizacao,
        select: ativoSelect
      });

      await createAuditLog(req, 'UPDATE', 'Ativo', `${req.user?.nome ?? 'desconhecido'} atualizou o ativo ${ativoAtualizado.modelo}`)

      return res.json(ativoAtualizado);
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
        throw new AppError('Número de série duplicado.', 409);
      }
      throw err;
    }
  }

  // 4. Deletar Ativo
  async delete(req: Request, res: Response) {
    const id = String(req.params.id);

    const ativoExistente = await prisma.ativo.findUnique({ where: { id } });
    if (!ativoExistente) {
      throw new AppError('Ativo não encontrado.', 404);
    }

    await prisma.ativo.delete({ where: { id } });
    await createAuditLog(req, 'DELETE', 'Ativo', `${req.user?.nome ?? 'desconhecido'} deletou o ativo ${ativoExistente.modelo}`)

    return res.status(204).send();
  }

  // 5. Alocar ativos (escolhe N unidades em estoque e marca como ALOCADO)
  async allocate(req: Request, res: Response) {
    const resultado = allocateAtivoSchema.safeParse(req.body);
    if (!resultado.success) {
      throw new AppError(formatZodError(resultado.error), 400);
    }

    const { modelo, tipo, quantidade, funcionarioId, setorId } = resultado.data;
    if (!funcionarioId && !setorId) {
      throw new AppError('É necessário informar funcionárioId ou setorId para alocar.', 400);
    }

    const where: Prisma.AtivoWhereInput = {
      status: 'EM_ESTOQUE',
      funcionarioId: null,
      ...(modelo && { modelo }),
      ...(tipo && { tipo: tipo as unknown as TipoAtivo })
    };

    const q = Number(quantidade ?? 1);
    const disponiveis = await prisma.ativo.findMany({ where, select: { id: true }, orderBy: { createdAt: 'asc' }, take: q });

    if (disponiveis.length < q) {
      throw new AppError('Não há unidades suficientes em estoque para alocar.', 400);
    }

    const updates = disponiveis.map(d => prisma.ativo.update({ where: { id: d.id }, data: { funcionarioId: funcionarioId ?? null, setorId: setorId ?? null, status: 'ALOCADO' } as any, select: ativoSelect }));

    const updated = await prisma.$transaction(updates);

    return res.json({ allocated: updated.length, items: updated });
  }

  // 6. Desalocar ativos (por ids ou por quantidade para um funcionário/setor)
  async deallocate(req: Request, res: Response) {
    const resultado = deallocateAtivoSchema.safeParse(req.body);
    if (!resultado.success) {
      throw new AppError(formatZodError(resultado.error), 400);
    }

    const { ids, quantidade, funcionarioId, setorId } = resultado.data;

    if (ids && ids.length > 0) {
      const updates = ids.map(id => prisma.ativo.update({ where: { id }, data: { funcionarioId: null, setorId: null, status: 'EM_ESTOQUE' }, select: ativoSelect }));
      const updated = await prisma.$transaction(updates);
      return res.json({ deallocated: updated.length, items: updated });
    }

    if (!quantidade || (!funcionarioId && !setorId)) {
      throw new AppError('Envie ids ou (quantidade + funcionarioId|setorId) para desalocar.', 400);
    }

    const where: Prisma.AtivoWhereInput = {
      status: 'ALOCADO',
      ...(funcionarioId ? { funcionarioId } : {}),
      ...(setorId ? { setorId } : {})
    };

    const q = Number(quantidade ?? 1);
    const alocados = await prisma.ativo.findMany({ where, select: { id: true }, orderBy: { createdAt: 'asc' }, take: q });

    if (alocados.length === 0) {
      throw new AppError('Nenhuma unidade encontrada para desalocar.', 400);
    }

    const updates = alocados.map(a => prisma.ativo.update({ where: { id: a.id }, data: { funcionarioId: null, setorId: null, status: 'EM_ESTOQUE' }, select: ativoSelect }));
    const updated = await prisma.$transaction(updates);

    return res.json({ deallocated: updated.length, items: updated });
  }

  // 7. Resumo: por modelo/tipo informando total / alocados / em estoque
  async summary(req: Request, res: Response) {
    const ativos = await prisma.ativo.findMany({ select: { modelo: true, tipo: true, status: true } });

    const map = new Map<string, { modelo: string; tipo: string; total: number; alocados: number; emEstoque: number }>();

    for (const a of ativos) {
      const key = `${a.modelo}__${a.tipo}`;
      if (!map.has(key)) map.set(key, { modelo: a.modelo, tipo: a.tipo, total: 0, alocados: 0, emEstoque: 0 });
      const entry = map.get(key)!;
      entry.total += 1;
      if (a.status === 'ALOCADO') entry.alocados += 1;
      else if (a.status === 'EM_ESTOQUE') entry.emEstoque += 1;
    }

    const result = Array.from(map.values());
    return res.json(result);
  }

  // 8. Listar ativos ALOCADOS (detalhado)
  async allocatedList(req: Request, res: Response) {
    const { modelo, tipo, funcionarioId, setorId, page = 1, limit = 50, search } = req.query as Record<string, string>;
    const searchValue = search?.trim();

    const where: Prisma.AtivoWhereInput = {
      status: 'ALOCADO',
      ...(searchValue
        ? {
            OR: [
              { modelo: { contains: searchValue, mode: 'insensitive' as const } },
              { numeroSerie: { contains: searchValue, mode: 'insensitive' as const } },
              { ip: { contains: searchValue, mode: 'insensitive' as const } },
            ],
          }
        : {}),
      ...(modelo ? { modelo: { contains: modelo, mode: 'insensitive' as const } } : {}),
      ...(tipo ? { tipo: tipo as unknown as TipoAtivo } : {}),
      ...(funcionarioId ? { funcionarioId } : {}),
      ...(setorId ? { setorId } : {})
    };

    const [items, total] = await Promise.all([
      prisma.ativo.findMany({ where, orderBy: { createdAt: 'desc' }, select: ativoSelect, take: Number(limit), skip: (Number(page) - 1) * Number(limit) }),
      prisma.ativo.count({ where })
    ]);

    return res.json({ data: items, total, page: Number(page), limit: Number(limit) });
  }

  // 9. Listar tipos de ativos disponíveis
  async listTypes(req: Request, res: Response) {
    // Definir tipos e se são individuais (true) ou coletivos (false)
    const tipos = [
      { id: 'NOTEBOOK', nome: 'Notebook', isIndividual: true },
      { id: 'IMPRESSORA', nome: 'Impressora', isIndividual: false },
      { id: 'RAMAL', nome: 'Ramal', isIndividual: true },
      { id: 'MONITOR', nome: 'Monitor', isIndividual: true },
      { id: 'PERIFÉRICO', nome: 'Periférico', isIndividual: true },
      { id: 'NOBREAK', nome: 'Nobreak', isIndividual: false },
      { id: 'SERVIDOR', nome: 'Servidor', isIndividual: false },
      { id: 'SWITCH', nome: 'Switch', isIndividual: false },
      { id: 'LEITOR', nome: 'Leitor', isIndividual: false },
      { id: 'COMPUTADOR', nome: 'Computador', isIndividual: true },
      { id: 'ACCESSPOINT', nome: 'Accesspoint', isIndividual: false },
      { id: 'ROTEADOR', nome: 'Roteador', isIndividual: false },
    ];

    return res.json(tipos); 
  }
}