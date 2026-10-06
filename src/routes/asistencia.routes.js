import { Router } from 'express';
import { AsistenciaController } from '../controllers/asistencia.controller.js';
import { requireAuth, requireRole } from '../middlewares/auth.js';

const router = Router();

// OJO: este router se monta en el prefijo amplio '/api', asi que la autenticacion
// se aplica RUTA POR RUTA. Un router.use(requireAuth) aca tambien interceptaria
// /api/auth/login y romperia el inicio de sesion.
const ASISTENCIA = ['ADMIN', 'SECRETARIA', 'BEDEL'];

// Asistencias por cursada.
// La carga la hace gestion academica o personal no docente (bedeles, celadores);
// las consultas quedan abiertas a cualquier usuario autenticado
// (el alumno necesita el resumen de su propia cursada).
router.post('/cursadas/:cursadaId/asistencias', requireAuth, requireRole(ASISTENCIA), AsistenciaController.registrar);
router.post('/cursadas/:cursadaId/asistencias/masivo', requireAuth, requireRole(ASISTENCIA), AsistenciaController.registrarMasivo);
router.get('/cursadas/:cursadaId/asistencias', requireAuth, AsistenciaController.listarPorCursada);
router.get('/cursadas/:cursadaId/asistencias/rango', requireAuth, AsistenciaController.listarPorRango);
router.get('/cursadas/:cursadaId/asistencias/resumen', requireAuth, AsistenciaController.resumen);

// Asistencia individual
router.delete('/asistencias/:id', requireAuth, requireRole(ASISTENCIA), AsistenciaController.eliminar);

export default router;
