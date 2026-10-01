import { Router } from 'express';
import { LicenciaController } from '../controllers/licencia.controller.js';
import { requireAuth, requireRole, requireSelfOrRole } from '../middlewares/auth.js';

const router = Router();
router.use(requireAuth);

// PANEL PERSONAL: /me PRIMERO para que no lo capture /:id
router.get('/me', requireRole(['PROFESOR']), LicenciaController.misLicencias);

// CRUD
router.get('/', requireRole(['ADMIN', 'SECRETARIA']), LicenciaController.listar);
router.post('/', requireRole(['ADMIN', 'PROFESOR']), LicenciaController.crear);
router.get('/:id', requireRole(['ADMIN', 'SECRETARIA', 'PROFESOR']), LicenciaController.obtenerPorId);
router.put('/:id', requireRole(['ADMIN', 'PROFESOR']), LicenciaController.actualizar);
router.delete('/:id', requireRole(['ADMIN', 'PROFESOR']), LicenciaController.eliminar);

// Por profesor
router.get('/profesor/:profesorId',
  requireSelfOrRole(['ADMIN', 'SECRETARIA'], 'profesorId'),
  LicenciaController.listarPorProfesor
);

// Aprobación / rechazo
router.patch('/:id/aprobar', requireRole(['ADMIN', 'SECRETARIA']), LicenciaController.aprobar);
router.patch('/:id/rechazar', requireRole(['ADMIN', 'SECRETARIA']), LicenciaController.rechazar);

export default router;