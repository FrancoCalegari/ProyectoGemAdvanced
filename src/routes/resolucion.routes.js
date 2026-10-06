import { Router } from 'express';
import { ResolucionController } from '../controllers/resolucion.controller.js';
import { requireAuth, requireRole } from '../middlewares/auth.js';

const router = Router();

router.use(requireAuth);

const GESTION = ['ADMIN', 'SECRETARIA'];

router.get('/:id', ResolucionController.obtenerPorId);
router.post('/:id/cerrar', requireRole(GESTION), ResolucionController.cerrar);

export default router;
