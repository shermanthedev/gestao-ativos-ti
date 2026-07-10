import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { setorRoutes } from './routes/setor.routes.js';
import { errorHandler } from './middlewares/errorHandler.js';
import { funcionariosRoutes } from './routes/funcionario.routes.js';
import { ativosRoutes } from './routes/ativo.routes.js';
import { usuarioTIRoutes } from './routes/usuarioTI.routes.js';
import { authRoutes } from './routes/auth.routes.js';
import { auditRoutes } from './routes/audit.routes.js';
import { metaRoutes } from './routes/meta.routes.js';
import './types/express.d.js';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use('/setores', setorRoutes);
app.use('/funcionarios', funcionariosRoutes);
app.use('/ativos', ativosRoutes);
app.use('/usuarios-ti', usuarioTIRoutes);
app.use('/auditoria', auditRoutes);
app.use('/auth', authRoutes);
app.use('/', metaRoutes);

// Health check endpoint
app.get('/health', (_req, res) => res.json({ ok: true, uptime: process.uptime() }));

app.use(errorHandler);

const PORT = 3333;

app.listen(PORT, () => {
  console.log(`🚀 Servidor com arquitetura Controller rodando em http://localhost:${PORT}`);
});