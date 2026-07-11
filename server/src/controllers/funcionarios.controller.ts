import type { Request, Response } from 'express';
import { Prisma } from '@prisma/client';
import { prisma } from '../config/database.js';
import { AppError, formatZodError } from '../utils/AppError.js';
import {
  createFuncionarioSchema,
  updateFuncionarioSchema,
  listFuncionarioSchema,
} from '../schemas/funcionario.schema.js';
import { createAuditLog } from '../utils/auditLog.js';

const funcionarioSelect = {
  id: true,
  nome: true,
  email: true,
  setorId: true,
  createdAt: true,
  setor: {
    select: { id: true, nome: true },
  },
} satisfies Prisma.FuncionarioSelect;

export class FuncionarioController {
  async create(req: Request, res: Response) {
    // 1. Validação automática com Zod
    const resultado = createFuncionarioSchema.safeParse(req.body);
    if (!resultado.success) {
      throw new AppError(formatZodError(resultado.error), 400);
    }

    const { nome, email, setorId } = resultado.data;

    // 2. Validação de negócio: o setor precisa existir
    const setor = await prisma.setor.findUnique({ where: { id: setorId } });
    if (!setor) {
      throw new AppError('Setor informado não existe.', 404);
    }

    try {
      const novoFuncionario = await prisma.funcionario.create({
        data: { nome, email, setorId },
        select: funcionarioSelect,
      });

      await createAuditLog(req, 'CREATE', 'Funcionario', `${req.user?.nome ?? 'desconhecido'} cadastrou o funcionário ${novoFuncionario.nome}`)

      return res.status(201).json(novoFuncionario);
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
        throw new AppError('Já existe um funcionário com esse email.', 409);
      }
      throw err;
    }
  }

  async list(req: Request, res: Response) {
    const resultado = listFuncionarioSchema.safeParse(req.query);
    if (!resultado.success) {
      throw new AppError(formatZodError(resultado.error), 400);
    }

    const { nome, email, setorId, page, limit, search } = resultado.data;
    const searchValue = search?.trim();
    const skip = (page - 1) * limit;

    const where: Prisma.FuncionarioWhereInput = {
      ...(searchValue
        ? {
            OR: [
              { nome: { contains: searchValue, mode: 'insensitive' as const } },
              { email: { contains: searchValue, mode: 'insensitive' as const } },
            ],
          }
        : {}),
      ...(nome && { nome: { contains: nome, mode: 'insensitive' as const } }),
      ...(email && { email: { contains: email, mode: 'insensitive' as const } }),
      ...(setorId && { setorId }),
    };

    const [funcionarios, total] = await Promise.all([
      prisma.funcionario.findMany({
        where,
        orderBy: { nome: 'asc' },
        select: funcionarioSelect,
        take: limit,
        skip,
      }),
      prisma.funcionario.count({ where }),
    ]);

    return res.json({ data: funcionarios, total, page, limit });
  }

  async update(req: Request, res: Response) {
    const id = String(req.params.id);

    const funcionarioExistente = await prisma.funcionario.findUnique({ where: { id } });
    if (!funcionarioExistente) {
      throw new AppError('Funcionário não encontrado.', 404);
    }

    const resultado = updateFuncionarioSchema.safeParse(req.body);
    if (!resultado.success) {
      throw new AppError(formatZodError(resultado.error), 400);
    }

    const { nome, email, setorId } = resultado.data;

    if (setorId) {
      const setor = await prisma.setor.findUnique({ where: { id: setorId } });
      if (!setor) {
        throw new AppError('Setor informado não existe.', 404);
      }
    }

    try {
      const funcionarioAtualizado = await prisma.funcionario.update({
        where: { id },
        data: {
          ...(nome && { nome }),
          ...(email && { email }),
          ...(setorId && { setorId }),
        },
        select: funcionarioSelect,
      });

      await createAuditLog(
        req,
        'UPDATE',
        'Funcionario',
        `${req.user?.nome ?? 'desconhecido'} atualizou o funcionário ${funcionarioAtualizado.nome}`
      );

      return res.json(funcionarioAtualizado);
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
        throw new AppError('Já existe um funcionário com esse email.', 409);
      }
      throw err;
    }
  }

  async delete(req: Request, res: Response) {
    const id = String(req.params.id);

    const funcionarioExistente = await prisma.funcionario.findUnique({ where: { id } });
    if (!funcionarioExistente) {
      throw new AppError('Funcionário não encontrado.', 404);
    }

    await prisma.funcionario.delete({ where: { id } });
    await createAuditLog(req, 'DELETE', 'Funcionario', `${req.user?.nome ?? 'desconhecido'} deletou o funcionário ${funcionarioExistente.nome}`)

    return res.status(204).send();
  }
}
