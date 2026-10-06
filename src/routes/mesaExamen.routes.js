import { Router } from 'express';
import { MesaExamenController } from '../controllers/mesaExamen.controller.js';
import { requireAuth, requireRole, requireSelfOrRole } from '../middlewares/auth.js';

const router = Router();

// Montado en '/api': la autenticacion va ruta por ruta (ver nota en asistencia.routes.js)
const GESTION = ['ADMIN', 'SECRETARIA'];
const CONSULTA = [...GESTION, 'BEDEL'];

// SECRETARÍA / ADMIN
router.post('/mesas', requireAuth, requireRole(GESTION), MesaExamenController.crear);
router.get('/mesas', requireAuth, MesaExamenController.listar);
router.get('/mesas/:id', requireAuth, MesaExamenController.obtenerPorId);
router.get('/mesas/:id/inscripciones', requireAuth, MesaExamenController.listarInscripciones);
router.put('/mesas/:id/estado', requireAuth, requireRole(GESTION), MesaExamenController.actualizarEstado);
router.put(
  '/mesas/:id/inscripciones/:alumnoId/asistencia',
  requireAuth,
  requireRole(GESTION),
  MesaExamenController.registrarAsistencia
);

// ALUMNO
router.get(
  '/alumnos/:id/mesas-disponibles',
  requireAuth,
  requireSelfOrRole(CONSULTA),
  MesaExamenController.listarDisponiblesParaAlumno
);
router.post('/mesas/:id/inscribir', requireAuth, requireRole([...GESTION, 'ALUMNO']), MesaExamenController.inscribir);
router.delete('/mesas/:id/inscribir', requireAuth, requireRole([...GESTION, 'ALUMNO']), MesaExamenController.cancelar);

export default router;
