import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const authRoutes = Router();
const authController = new AuthController();

// Rotas públicas — não exigem token.
authRoutes.post('/login', asyncHandler(authController.login));
authRoutes.post('/registrar-primeiro', asyncHandler(authController.registerPrimeiro));

export { authRoutes };
