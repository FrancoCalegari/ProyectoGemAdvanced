/**
 * @openapi
 * /api/profesores/{id}/baja:
 *   patch:
 *     summary: Dar de baja un profesor (baja logica)
 *     tags: [Profesores]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Profesor INACTIVO }
 * /api/profesores/{id}/reactivar:
 *   patch:
 *     summary: Reactivar un profesor
 *     tags: [Profesores]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Profesor ACTIVO }
 * /api/profesores/{id}/estado:
 *   patch:
 *     summary: Cambiar estado (ACTIVO/SUPLENCIA/INACTIVO)
 *     tags: [Profesores]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Estado actualizado }
 */
import { Router } from 'express';
import { ProfesorController } from '../controllers/profesor.controller.js';
import { requireAuth, requireRole, requireSelfOrRole } from '../middlewares/auth.js';

const router = Router();

// Todas las rutas requieren autenticación
router.use(requireAuth);

// ===================== PANEL PERSONAL (profesor logueado) =====================
// IMPORTANTE: debe ir ANTES de '/:id' para que no lo capture
router.get(
  '/me/materias',
  requireRole(['PROFESOR']),
  ProfesorController.misMaterias
);

// ===================== CRUD =====================
router.get(
  '/',
  requireRole(['ADMIN', 'SECRETARIA']),
  ProfesorController.listar
);

router.post(
  '/',
  requireRole(['ADMIN']),
  ProfesorController.crear
);

router.get(
  '/:id',
  requireSelfOrRole(['ADMIN', 'SECRETARIA'], 'id'),
  ProfesorController.obtenerPorId
);

router.put(
  '/:id',
  requireSelfOrRole(['ADMIN'], 'id'),
  ProfesorController.actualizar
);

router.delete(
  '/:id',
  requireRole(['ADMIN']),
  ProfesorController.eliminar
);

// Baja logica y estados
router.patch('/:id/baja', requireRole(['ADMIN']), ProfesorController.darDeBaja);
router.patch('/:id/reactivar', requireRole(['ADMIN']), ProfesorController.reactivar);
router.patch('/:id/estado', requireRole(['ADMIN']), ProfesorController.cambiarEstado);

// ===================== TÍTULOS =====================
router.post(
  '/:id/titulos',
  requireSelfOrRole(['ADMIN'], 'id'),
  ProfesorController.agregarTitulo
);

router.delete(
  '/:id/titulos/:tituloId',
  requireSelfOrRole(['ADMIN'], 'id'),
  ProfesorController.eliminarTitulo
);

// ===================== MATERIAS ASIGNADAS =====================
router.post(
  '/:id/materias',
  requireRole(['ADMIN']),
  ProfesorController.asignarMateria
);

router.delete(
  '/:id/materias/:mpId',
  requireRole(['ADMIN']),
  ProfesorController.desasignarMateria
);

export default router;