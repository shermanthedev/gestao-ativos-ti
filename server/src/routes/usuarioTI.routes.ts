import { Router } from 'express';
import { UsuarioTIController } from '../controllers/usuarioTI.controller.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { authenticate } from '../middlewares/authenticate.js';

const usuarioTIRoutes = Router();
const usuarioTIController = new UsuarioTIController();

// Todas as rotas exigem usuário TI autenticado.
usuarioTIRoutes.post('/', authenticate, asyncHandler(usuarioTIController.create));
usuarioTIRoutes.get('/', authenticate, asyncHandler(usuarioTIController.list));
usuarioTIRoutes.put('/:id', authenticate, asyncHandler(usuarioTIController.update));
usuarioTIRoutes.delete('/:id', authenticate, asyncHandler(usuarioTIController.delete));

export { usuarioTIRoutes };
