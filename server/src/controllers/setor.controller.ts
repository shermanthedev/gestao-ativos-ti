import type { Request, Response } from 'express';
import { Prisma } from '@prisma/client';
import { prisma } from '../config/database.js';
import { AppError } from '../utils/AppError.js';
import {
  createSetorSchema,
  updateSetorSchema,
  listSetorSchema,
} from '../schemas/setor.schema.js';

const setorSelect = {
  id: true,
  nome: true,
  createdAt: true,
  _count: {
    select: { funcionarios: true, ativos: true },
  },
} satisfies Prisma.SetorSelect;

export class SetorController {
  async create(req: Request, res: Response) {
    const resultado = createSetorSchema.safeParse(req.body);
    if (!resultado.success) {
      throw new AppError(resultado.error.message, 400);
    }

    const { nome } = resultado.data;

    try {
      const novoSetor = await prisma.setor.create({
        data: { nome },
        select: setorSelect,
      });

      return res.status(201).json(novoSetor);
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
        throw new AppError('Setor já existente.', 409);
      }

      throw err;
    }
  }

  async list(req: Request, res: Response) {
    const resultado = listSetorSchema.safeParse(req.query);
    if (!resultado.success) {
      throw new AppError(resultado.error.message, 400);
    }

    const { nome, page, limit } = resultado.data;
    const take = limit;
    const skip = (page - 1) * take;

    const where: Prisma.SetorWhereInput = {
      ...(nome && { nome: { contains: nome, mode: 'insensitive' as const } }),
    };

    const [setores, total] = await Promise.all([
      prisma.setor.findMany({
        where,
        orderBy: { nome: 'asc' },
        select: {
          ...setorSelect,
          _count: setorSelect._count,
        },
        take,
        skip,
      }),
      prisma.setor.count({ where }),
    ]);

    return res.json({ data: setores, total, page, limit });
  }

  async update(req: Request, res: Response) {
    const id = String(req.params.id);

    const setorExistente = await prisma.setor.findUnique({ where: { id } });
    if (!setorExistente) {
      throw new AppError('Setor não encontrado.', 404);
    }

    const resultado = updateSetorSchema.safeParse(req.body);
    if (!resultado.success) {
      throw new AppError(resultado.error.message, 400);
    }

    const { nome } = resultado.data;

    try {
      const setorAtualizado = await prisma.setor.update({
        where: { id },
        data: { ...(nome && { nome }) },
        select: setorSelect,
      });

      return res.json(setorAtualizado);
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
        throw new AppError('Setor já existente.', 409);
      }
      throw err;
    }
  }

  async delete(req: Request, res: Response) {
    const id = String(req.params.id);

    const setorExistente = await prisma.setor.findUnique({ where: { id } });
    if (!setorExistente) {
      throw new AppError('Setor não encontrado.', 404);
    }

    await prisma.setor.delete({ where: { id } });

    return res.status(204).send();
  }
}
