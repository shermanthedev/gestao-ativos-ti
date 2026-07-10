import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

if (!process.env.JWT_SECRET) {
  throw new Error('A variável de ambiente JWT_SECRET não está definida.');
}

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN;

export interface TokenPayload {
  sub: string;
  email: string;
  nome: string;
}

export function signToken(payload: TokenPayload): string {
  // `expiresIn` aceita número (segundos) ou string no formato ms/forma
  // humana (ex.: "8h", "7d"). Validamos a env e tipamos o slot manualmente
  // para contornar a divergência entre os tipos da lib e a
  // `exactOptionalPropertyTypes: true` do tsconfig.
  const options: jwt.SignOptions = {};
  if (JWT_EXPIRES_IN) {
    options.expiresIn = JWT_EXPIRES_IN as any;
  }
  return jwt.sign(payload, JWT_SECRET, options);
}

export function verifyToken(token: string): TokenPayload {
  return jwt.verify(token, JWT_SECRET) as TokenPayload;
}
