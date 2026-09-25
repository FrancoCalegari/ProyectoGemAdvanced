import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import prisma from './config/db.js';

import { errorHandler, notFound } from './middlewares/index.js';

import tituloRoutes from './routes/titulo.routes.js';
import resolucionRoutes from './routes/resolucion.routes.js';
import curricularRoutes from './routes/curricular.routes.js';
import correlatividadRoutes from './routes/correlatividad.routes.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get('/health', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: 'ok', database: 'connected' });
  } catch (error) {
    res.status(500).json({ status: 'error', database: error.message });
  }
});

app.use('/api', correlatividadRoutes);
app.use('/api/titulos', tituloRoutes);
app.use('/api/resoluciones', resolucionRoutes);
app.use('/api/curricular', curricularRoutes);

app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

export default app;