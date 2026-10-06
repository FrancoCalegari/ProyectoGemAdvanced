import { Router } from 'express';
import { LicenciaController } from '../controllers/licencia.controller.js';
import { requireAuth, requireRole, requireSelfOrRole } from '../middlewares/auth.js';

const router = Router();
router.use(requireAuth);

// PANEL PERSONAL: /me PRIMERO para que no lo capture /:id
// Docentes (licencias) y personal no docente (certificados de salud / justificativos)
router.get('/me', requireRole(['PROFESOR', 'BEDEL', 'CELADOR']), LicenciaController.misLicencias);

// CRUD
// La gestión lista y resuelve; docentes y no docentes presentan y ven lo propio.
router.get('/', requireRole(['ADMIN', 'SECRETARIA']), LicenciaController.listar);
router.post('/', requireRole(['ADMIN', 'SECRETARIA', 'PROFESOR', 'BEDEL', 'CELADOR']), LicenciaController.crear);
router.get('/:id', requireRole(['ADMIN', 'SECRETARIA', 'PROFESOR', 'BEDEL', 'CELADOR']), LicenciaController.obtenerPorId);
router.put('/:id', requireRole(['ADMIN', 'SECRETARIA', 'PROFESOR', 'BEDEL', 'CELADOR']), LicenciaController.actualizar);
router.delete('/:id', requireRole(['ADMIN', 'SECRETARIA', 'PROFESOR', 'BEDEL', 'CELADOR']), LicenciaController.eliminar);

// Por persona
router.get('/profesor/:profesorId',
  requireSelfOrRole(['ADMIN', 'SECRETARIA'], 'profesorId'),
  LicenciaController.listarPorProfesor
);
router.get('/empleado/:empleadoId',
  requireSelfOrRole(['ADMIN', 'SECRETARIA'], 'empleadoId'),
  LicenciaController.listarPorEmpleado
);

// Aprobación / rechazo (solo gestión)
router.patch('/:id/aprobar', requireRole(['ADMIN', 'SECRETARIA']), LicenciaController.aprobar);
router.patch('/:id/rechazar', requireRole(['ADMIN', 'SECRETARIA']), LicenciaController.rechazar);

export default router;
