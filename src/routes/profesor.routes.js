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