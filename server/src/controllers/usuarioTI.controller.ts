import type { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { Prisma } from '@prisma/client';
import { prisma } from '../config/database.js';
import { AppError, formatZodError } from '../utils/AppError.js';
import { signToken } from '../utils/jwt.js';
import {
  createUsuarioTISchema,
  updateUsuarioTISchema,
  listUsuarioTISchema,
} from '../schemas/usuarioTI.schema.js';

const SALT_ROUNDS = 10;

// Select canônico (sem senha) reaproveitado por AuthController
// para garantir que o hash nunca vaze no JSON de resposta.
export const usuarioTISelect = {
  id: true,
  nome: true,
  email: true,
  createdAt: true,
} satisfies Prisma.UsuarioTISelect;

export class UsuarioTIController {
  async create(req: Request, res: Response) {
    const resultado = createUsuarioTISchema.safeParse(req.body);
    if (!resultado.success) {
      throw new AppError(formatZodError(resultado.error), 400);
    }

    const { nome, email, senha } = resultado.data;
    const senhaHash = await bcrypt.hash(senha, SALT_ROUNDS);

    try {
      const novoUsuario = await prisma.usuarioTI.create({
        data: { nome, email, senha: senhaHash },
        select: usuarioTISelect,
      });

      return res.status(201).json(novoUsuario);
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
        throw new AppError('Já existe um usuário TI com esse email.', 409);
      }
      throw err;
    }
  }

  async list(req: Request, res: Response) {
    const resultado = listUsuarioTISchema.safeParse(req.query);
    if (!resultado.success) {
      throw new AppError(formatZodError(resultado.error), 400);
    }

    const { nome, email, page, limit } = resultado.data;
    const skip = (page - 1) * limit;

    const where: Prisma.UsuarioTIWhereInput = {
      ...(nome && { nome: { contains: nome, mode: 'insensitive' as const } }),
      ...(email && { email: { contains: email, mode: 'insensitive' as const } }),
    };

    const [usuarios, total] = await Promise.all([
      prisma.usuarioTI.findMany({
        where,
        orderBy: { nome: 'asc' },
        select: usuarioTISelect,
        take: limit,
        skip,
      }),
      prisma.usuarioTI.count({ where }),
    ]);

    return res.json({ data: usuarios, total, page, limit });
  }

  async update(req: Request, res: Response) {
    const id = String(req.params.id);

    const usuarioExistente = await prisma.usuarioTI.findUnique({ where: { id } });
    if (!usuarioExistente) {
      throw new AppError('Usuário TI não encontrado.', 404);
    }

    const resultado = updateUsuarioTISchema.safeParse(req.body);
    if (!resultado.success) {
      throw new AppError(formatZodError(resultado.error), 400);
    }

    const { nome, email, senha } = resultado.data;

    // Monta o payload apenas com os campos efetivamente enviados.
    // A senha, se trocada, é re-hashada antes de persistir.
    const dadosAtualizacao: Record<string, unknown> = {};
    if (nome) dadosAtualizacao.nome = nome;
    if (email) dadosAtualizacao.email = email;
    if (senha) dadosAtualizacao.senha = await bcrypt.hash(senha, SALT_ROUNDS);

    try {
      const usuarioAtualizado = await prisma.usuarioTI.update({
        where: { id },
        data: dadosAtualizacao,
        select: usuarioTISelect,
      });

      const token = signToken({
        sub: usuarioAtualizado.id,
        email: usuarioAtualizado.email,
        nome: usuarioAtualizado.nome,
      });

      return res.json({ usuario: usuarioAtualizado, token });
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
        throw new AppError('Já existe um usuário TI com esse email.', 409);
      }
      throw err;
    }
  }

  async delete(req: Request, res: Response) {
    const id = String(req.params.id);

    const usuarioExistente = await prisma.usuarioTI.findUnique({ where: { id } });
    if (!usuarioExistente) {
      throw new AppError('Usuário TI não encontrado.', 404);
    }

    await prisma.usuarioTI.delete({ where: { id } });

    return res.status(204).send();
  }
}
