import { Router } from 'express';
import { AtivoController } from '../controllers/ativos.controller.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { authenticate } from '../middlewares/authenticate.js';

const ativosRoutes = Router();
const ativosController = new AtivoController();

// Rotas públicas (sem autenticação)
ativosRoutes.get('/tipos', asyncHandler(ativosController.listTypes));

// Protegendo rotas com autenticação (apenas usuários TI)
ativosRoutes.post('/', authenticate, asyncHandler(ativosController.create));
ativosRoutes.get('/', authenticate, asyncHandler(ativosController.list));
ativosRoutes.put('/:id', authenticate, asyncHandler(ativosController.update));
ativosRoutes.delete('/:id', authenticate, asyncHandler(ativosController.delete));

// Alocações e resumo
ativosRoutes.post('/allocate', authenticate, asyncHandler(ativosController.allocate));
ativosRoutes.post('/deallocate', authenticate, asyncHandler(ativosController.deallocate));
ativosRoutes.get('/summary', authenticate, asyncHandler(ativosController.summary));
ativosRoutes.get('/allocated', authenticate, asyncHandler(ativosController.allocatedList));

export { ativosRoutes };
