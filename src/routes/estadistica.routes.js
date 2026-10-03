/**
 * @openapi
 * /api/estadisticas/resumen:
 *   get:
 *     summary: Resumen general de estadisticas
 *     tags: [Estadisticas]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Resumen de metricas }
 * /api/estadisticas/alumnos:
 *   get:
 *     summary: Estadisticas de alumnos
 *     tags: [Estadisticas]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Alumnos por estado y titulo }
 * /api/estadisticas/cursadas:
 *   get:
 *     summary: Estadisticas de cursadas
 *     tags: [Estadisticas]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Cursadas por estado y materia }
 * /api/estadisticas/asistencias:
 *   get:
 *     summary: Estadisticas de asistencias
 *     tags: [Estadisticas]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Asistencias y porcentajes }
 * /api/estadisticas/clases-suspendidas:
 *   get:
 *     summary: Estadisticas de clases suspendidas
 *     tags: [Estadisticas]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Clases por motivo }
 * /api/estadisticas/mesas:
 *   get:
 *     summary: Estadisticas de mesas
 *     tags: [Estadisticas]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Mesas por tipo y estado }
 * /api/estadisticas/certificados:
 *   get:
 *     summary: Estadisticas de certificados
 *     tags: [Estadisticas]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Certificados por tipo }
 */
import { Router } from 'express';
import { EstadisticaController } from '../controllers/estadistica.controller.js';
import { requireAuth, requireRole } from '../middlewares/auth.js';
const router = Router();
router.use(requireAuth);
router.use(requireRole(['ADMIN', 'SECRETARIA']));
router.get('/resumen', EstadisticaController.resumen);
router.get('/alumnos', EstadisticaController.alumnos);
router.get('/cursadas', EstadisticaController.cursadas);
router.get('/asistencias', EstadisticaController.asistencias);
router.get('/clases-suspendidas', EstadisticaController.clasesSuspendidas);
router.get('/mesas', EstadisticaController.mesas);
router.get('/certificados', EstadisticaController.certificados);
export default router;