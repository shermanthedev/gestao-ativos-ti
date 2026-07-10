import { Router } from 'express';
import { SetorController } from '../controllers/setor.controller.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { authenticate } from '../middlewares/authenticate.js';

const setorRoutes = Router();
const setorController = new SetorController();

// Protegendo rotas com autenticação (apenas usuários TI)
setorRoutes.post('/', authenticate, asyncHandler(setorController.create));
setorRoutes.get('/', authenticate, asyncHandler(setorController.list));
setorRoutes.put('/:id', authenticate, asyncHandler(setorController.update));
setorRoutes.delete('/:id', authenticate, asyncHandler(setorController.delete));

export { setorRoutes };