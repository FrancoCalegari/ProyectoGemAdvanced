import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import swaggerUi from 'swagger-ui-express';
import cors from 'cors';
import prisma from './config/db.js';
import swaggerSpec from './config/swagger.js';

import { errorHandler, notFound } from './middlewares/index.js';

import tituloRoutes from './routes/titulo.routes.js';
import resolucionRoutes from './routes/resolucion.routes.js';
import curricularRoutes from './routes/curricular.routes.js';
import correlatividadRoutes from './routes/correlatividad.routes.js';
import alumnoRoutes from './routes/alumno.routes.js';
import inscripcionRoutes from './routes/inscripcion.routes.js';
import certificadoRoutes from './routes/certificado.routes.js';
import authRoutes from './routes/auth.routes.js';
import asistenciaRoutes from './routes/asistencia.routes.js';
import certificadoPresentadoRoutes from './routes/certificadoPresentado.routes.js';
import mesaExamenRoutes from './routes/mesaExamen.routes.js';
import profesorRoutes from './routes/profesor.routes.js';
import usuariosRoutes from './routes/usuarios.routes.js';
import estadisticaRoutes from './routes/estadistica.routes.js';
import dashboardRoutes from './routes/dashboard.routes.js';
import licenciaRoutes from './routes/licencia.routes.js';
import solicitudRoutes from './routes/solicitud.routes.js';
import claseSuspendidaRoutes from './routes/claseSuspendida.routes.js';

const app = express();
const PORT = process.env.PORT || 3000;

// ---------------------------------------------------------
// ENCODING FORZADO UTF-8
// ---------------------------------------------------------
app.use((req, res, next) => {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  next();
});

app.use(cors());
app.use(express.json({ limit: '10mb', charset: 'utf-8' }));
app.use(express.urlencoded({ extended: true, charset: 'utf-8' }));

// ---------------------------------------------------------
// SWAGGER
// ---------------------------------------------------------
app.use(
  '/api-docs',
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, { customSiteTitle: 'Plataforma Academica API' })
);

// ---------------------------------------------------------
// HEALTHCHECK
// ---------------------------------------------------------
app.get('/health', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: 'ok', database: 'connected' });
  } catch (error) {
    res.status(500).json({ status: 'error', database: error.message });
  }
});

// ---------------------------------------------------------
// RUTAS
// ---------------------------------------------------------
app.use('/api', correlatividadRoutes);
app.use('/api', asistenciaRoutes);
app.use('/api', certificadoPresentadoRoutes);
app.use('/api', mesaExamenRoutes);
app.use('/api/certificados', certificadoRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/titulos', tituloRoutes);
app.use('/api/resoluciones', resolucionRoutes);
app.use('/api/curricular', curricularRoutes);
app.use('/api/alumnos', alumnoRoutes);
app.use('/api/inscripciones', inscripcionRoutes);
app.use('/api/profesores', profesorRoutes);
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/estadisticas', estadisticaRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/licencias', licenciaRoutes);
app.use('/api/solicitudes', solicitudRoutes);
app.use('/api/clases-suspendidas', claseSuspendidaRoutes);

// ---------------------------------------------------------
// MANEJO DE ERRORES
// ---------------------------------------------------------
app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

export default app;