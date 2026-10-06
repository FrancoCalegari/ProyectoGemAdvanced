import { Router } from 'express';
import { CursadaController } from '../controllers/cursada.controller.js';
import { requireAuth, requireRole } from '../middlewares/auth.js';

const router = Router();

router.use(requireAuth);

// Actualizar estado / notas de una cursada.
// Gestión académica y el profesor que dicta la materia.
router.put('/:id', requireRole(['ADMIN', 'SECRETARIA', 'PROFESOR']), CursadaController.actualizar);

export default router;
