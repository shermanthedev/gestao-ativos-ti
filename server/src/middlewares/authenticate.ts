import type { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError.js';
import { verifyToken, TokenPayload } from '../utils/jwt.js';

export function authenticate(req: Request, _res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new AppError('Token de autenticação não fornecido.', 401);
  }

  const token = authHeader.slice('Bearer '.length).trim();
  if (!token) {
    throw new AppError('Token de autenticação não fornecido.', 401);
  }

  try {
    const payload: TokenPayload = verifyToken(token);
    req.user = { id: payload.sub, email: payload.email, nome: payload.nome };
    return next();
  } catch (err) {
    // Erros específicos de token são traduzidos em 401 com mensagem clara.
    // O errorHandler também os trata, mas fazer aqui mantém a mensagem
    // centralizada no middleware e evita depender só do fallback.
    if (err instanceof Error && err.name === 'TokenExpiredError') {
      throw new AppError('Token expirado.', 401);
    }
    throw new AppError('Token inválido.', 401);
  }
}
