import { Router } from 'express';
import { EmpleadoController } from '../controllers/empleado.controller.js';
import { requireAuth, requireRole, requireSelfOrRole } from '../middlewares/auth.js';

const router = Router();

router.use(requireAuth);

const GESTION = ['ADMIN', 'SECRETARIA'];

// ---------------------------------------------------------
// Panel personal del empleado no docente (celador / bedel).
// /me SIEMPRE antes de /:id
// ---------------------------------------------------------
router.get('/me', EmpleadoController.miFicha);
router.get('/me/horarios', EmpleadoController.misHorarios);
router.get('/me/modificaciones', EmpleadoController.misModificaciones);
router.patch('/me/modificaciones/visto', EmpleadoController.marcarModificacionesVistas);
router.get('/me/historial', EmpleadoController.miHistorial);

// ---------------------------------------------------------
// ABM (gestión académica)
// ---------------------------------------------------------
router.get('/', requireRole(GESTION), EmpleadoController.listar);
router.post('/', requireRole(GESTION), EmpleadoController.crear);
router.get('/:id', requireSelfOrRole(GESTION), EmpleadoController.obtenerPorId);
router.put('/:id', requireRole(GESTION), EmpleadoController.actualizar);
router.patch('/:id/estado', requireRole(GESTION), EmpleadoController.cambiarEstado);
router.patch('/:id/baja', requireRole(GESTION), EmpleadoController.darDeBaja);
router.patch('/:id/reactivar', requireRole(GESTION), EmpleadoController.reactivar);

// ---------------------------------------------------------
// Horarios y modificaciones del empleado (gestión; el propio
// empleado usa /me/horarios y /me/modificaciones)
// ---------------------------------------------------------
router.get('/:id/horarios', requireSelfOrRole(GESTION), EmpleadoController.listarHorarios);
router.post('/:id/horarios', requireRole(GESTION), EmpleadoController.crearHorario);
router.get('/:id/modificaciones', requireSelfOrRole(GESTION), EmpleadoController.listarModificaciones);

export default router;
