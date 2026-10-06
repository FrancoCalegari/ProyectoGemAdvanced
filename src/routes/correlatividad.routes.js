import { Router } from 'express';
import { CorrelatividadController } from '../controllers/correlatividad.controller.js';
import { requireAuth, requireRole } from '../middlewares/auth.js';

const router = Router();

// Montado en '/api': la autenticacion va ruta por ruta (ver nota en asistencia.routes.js)
const GESTION = ['ADMIN', 'SECRETARIA'];

router.get('/materias/:id/correlativas', requireAuth, CorrelatividadController.listarPorMateria);
router.post('/materias/:id/correlativas', requireAuth, requireRole(GESTION), CorrelatividadController.crear);
router.delete('/correlatividades/:id', requireAuth, requireRole(GESTION), CorrelatividadController.eliminar);

export default router;
