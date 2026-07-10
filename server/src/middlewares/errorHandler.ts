import type { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { AppError } from '../utils/AppError.js';

export function errorHandler(err: unknown, req: Request, res: Response, next: NextFunction) {
    if (err instanceof AppError) {
        return res.status(err.statusCode).json({ erro: err.message });
    }

    // Rede de segurança para tokens JWT (o middleware authenticate também
    // traduz, mas isto cobre qualquer verifyToken() chamado fora dele).
    if (err instanceof jwt.TokenExpiredError) {
        return res.status(401).json({ erro: 'Token expirado.' });
    }
    if (err instanceof jwt.JsonWebTokenError) {
        return res.status(401).json({ erro: 'Token inválido.' });
    }

    if (err instanceof Prisma.PrismaClientKnownRequestError) {
        switch (err.code) {
            case 'P2002':
                return res.status(409).json({ erro: `Já existe um registro com esse valor: ${err.meta?.target}` });
            case 'P2025':
                return res.status(404).json({ erro: 'Registro não encontrado.' });
            case 'P2003':
                return res.status(400).json({ erro: 'Referência inválida (chave estrangeira).' });
            default:
                return res.status(400).json({ erro: `Erro no banco de dados (${err.code}).` });
        }
    }

    console.error(err);
    return res.status(500).json({ erro: 'Erro interno no servidor.' });
}