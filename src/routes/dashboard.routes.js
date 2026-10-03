/**
 * @openapi
 * /api/dashboard/resumen:
 *   get:
 *     summary: Resumen general (KPIs)
 *     tags: [Dashboard]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: KPIs del sistema }
 * /api/dashboard/actividad:
 *   get:
 *     summary: Actividad reciente
 *     tags: [Dashboard]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Ultimos registros }
 * /api/dashboard/alumnos-por-mes:
 *   get:
 *     summary: Alumnos por mes
 *     tags: [Dashboard]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Serie temporal }
 */
import { Router } from 'express';
import { DashboardController } from '../controllers/dashboard.controller.js';
import { requireAuth, requireRole } from '../middlewares/auth.js';

const router = Router();
router.use(requireAuth);
router.use(requireRole(['ADMIN', 'SECRETARIA']));

router.get('/resumen', DashboardController.resumen);
router.get('/actividad', DashboardController.actividad);
router.get('/alumnos-por-mes', DashboardController.alumnosPorMes);

export default router;