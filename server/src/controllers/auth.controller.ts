import type { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { Prisma } from '@prisma/client';
import { prisma } from '../config/database.js';
import { AppError } from '../utils/AppError.js';
import { signToken } from '../utils/jwt.js';
import { loginSchema, registerPrimeiroSchema } from '../schemas/auth.schema.js';
import { usuarioTISelect } from './usuarioTI.controller.js';

const SALT_ROUNDS = 10;

export class AuthController {
  async login(req: Request, res: Response) {
    const resultado = loginSchema.safeParse(req.body);
    if (!resultado.success) {
      throw new AppError(resultado.error.message, 400);
    }

    const { email, senha } = resultado.data;

    // Único momento em que lemos a coluna `senha` (hash) é para comparar.
    const usuario = await prisma.usuarioTI.findUnique({
      where: { email },
      select: { id: true, senha: true },
    });

    if (!usuario) {
      throw new AppError('Credenciais inválidas.', 401);
    }

    const senhaOk = await bcrypt.compare(senha, usuario.senha);
    if (!senhaOk) {
      throw new AppError('Credenciais inválidas.', 401);
    }

    // Resposta usa o select canônico (sem senha) — nunca devolver `usuario` cru.
    const usuarioSemSenha = await prisma.usuarioTI.findUnique({
      where: { id: usuario.id },
      select: usuarioTISelect,
    });

    const token = signToken({
      sub: usuarioSemSenha!.id,
      email: usuarioSemSenha!.email,
      nome: usuarioSemSenha!.nome,
    });

    return res.json({ token, usuario: usuarioSemSenha });
  }

  async registerPrimeiro(req: Request, res: Response) {
    const total = await prisma.usuarioTI.count();
    if (total > 0) {
      throw new AppError('Já existe um usuário TI cadastrado. Use /auth/login.', 403);
    }

    const resultado = registerPrimeiroSchema.safeParse(req.body);
    if (!resultado.success) {
      throw new AppError(resultado.error.message, 400);
    }

    const { nome, email, senha } = resultado.data;
    const senhaHash = await bcrypt.hash(senha, SALT_ROUNDS);

    try {
      const novoUsuario = await prisma.usuarioTI.create({
        data: { nome, email, senha: senhaHash },
        select: usuarioTISelect,
      });

      const token = signToken({ sub: novoUsuario.id, email: novoUsuario.email, nome: novoUsuario.nome });

      return res.status(201).json({ token, usuario: novoUsuario });
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
        throw new AppError('Já existe um usuário TI com esse email.', 409);
      }
      throw err;
    }
  }
}
