// Augmentation global: tipa req.user em todos os controllers/middlewares.
import 'express';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        nome: string;
      };
    }
  }
}

export {};
