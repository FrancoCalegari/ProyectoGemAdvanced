import { Router } from 'express';
import { InscripcionController } from '../controllers/inscripcion.controller.js';
import { CursadaController } from '../controllers/cursada.controller.js';
import { requireAuth, requireRole } from '../middlewares/auth.js';

const router = Router();

router.use(requireAuth);

const GESTION = ['ADMIN', 'SECRETARIA'];

router.put('/:id', requireRole(GESTION), InscripcionController.actualizar);
router.get('/:id/cursadas', CursadaController.listarPorInscripcion);

export default router;
