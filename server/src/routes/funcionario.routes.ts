import { Router } from 'express';
import { FuncionarioController } from '../controllers/funcionarios.controller.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { authenticate } from '../middlewares/authenticate.js';

const funcionariosRoutes = Router();
const funcionariosController = new FuncionarioController();

// Protegendo rotas com autenticação (apenas usuários TI)
funcionariosRoutes.post('/', authenticate, asyncHandler(funcionariosController.create));
funcionariosRoutes.get('/', authenticate, asyncHandler(funcionariosController.list));
funcionariosRoutes.put('/:id', authenticate, asyncHandler(funcionariosController.update));
funcionariosRoutes.delete('/:id', authenticate, asyncHandler(funcionariosController.delete));

export { funcionariosRoutes };