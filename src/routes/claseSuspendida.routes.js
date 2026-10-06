import { Router } from 'express';
import { ClaseSuspendidaController } from '../controllers/claseSuspendida.controller.js';
import { requireAuth, requireRole } from '../middlewares/auth.js';

const router = Router();
router.use(requireAuth);

router.get('/resumen', requireRole(['ADMIN', 'SECRETARIA']), ClaseSuspendidaController.resumen);

router.get('/', requireRole(['ADMIN', 'SECRETARIA']), ClaseSuspendidaController.listar);
router.post('/', requireRole(['ADMIN', 'SECRETARIA']), ClaseSuspendidaController.crearManual);

router.get('/:id', requireRole(['ADMIN', 'SECRETARIA']), ClaseSuspendidaController.obtenerPorId);
router.delete('/:id', requireRole(['ADMIN']), ClaseSuspendidaController.eliminar);

router.post('/:id/reasignar', requireRole(['ADMIN', 'SECRETARIA']), ClaseSuspendidaController.reasignar);
router.delete('/:id/reasignar/:reasignacionId', requireRole(['ADMIN']), ClaseSuspendidaController.eliminarReasignacion);

export default router;