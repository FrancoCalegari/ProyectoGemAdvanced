import { Router } from 'express';
import { HorarioTrabajoController } from '../controllers/horarioTrabajo.controller.js';
import { requireAuth, requireRole } from '../middlewares/auth.js';

const router = Router();

router.use(requireAuth);

const GESTION = ['ADMIN', 'SECRETARIA'];

// Editar / dar de baja un turno. Cada cambio queda registrado en el
// historial de modificaciones del empleado.
router.put('/:id', requireRole(GESTION), HorarioTrabajoController.actualizar);
router.delete('/:id', requireRole(GESTION), HorarioTrabajoController.eliminar);

export default router;
