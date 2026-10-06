import { Router } from 'express';
import { EquivalenciaController } from '../controllers/equivalencia.controller.js';
import { requireAuth, requireRole } from '../middlewares/auth.js';

const router = Router();

// Montado en '/api': la autenticacion va ruta por ruta (ver nota en asistencia.routes.js)
const GESTION = ['ADMIN', 'SECRETARIA'];

router.get('/equivalencias', requireAuth, EquivalenciaController.listar);
router.post('/equivalencias', requireAuth, requireRole(GESTION), EquivalenciaController.crear);
router.delete('/equivalencias/:id', requireAuth, requireRole(GESTION), EquivalenciaController.eliminar);
router.get('/materias/:id/equivalencias', requireAuth, EquivalenciaController.listarPorMateria);

export default router;
