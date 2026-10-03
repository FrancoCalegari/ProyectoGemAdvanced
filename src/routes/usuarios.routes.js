/**
 * @openapi
 * /api/usuarios:
 *   get:
 *     summary: Listar todos los usuarios (solo ADMIN)
 *     tags: [Usuarios]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Lista de usuarios }
 * /api/usuarios/{id}:
 *   get:
 *     summary: Obtener usuario por ID
 *     tags: [Usuarios]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Usuario encontrado }
 * /api/usuarios/profesores-sin-usuario:
 *   get:
 *     summary: Profesores sin usuario asignado
 *     tags: [Usuarios]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Lista de profesores }
 * /api/usuarios/{id}/baja:
 *   patch:
 *     summary: Dar de baja un usuario (baja logica)
 *     tags: [Usuarios]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Usuario dado de baja }
 * /api/usuarios/{id}/reactivar:
 *   patch:
 *     summary: Reactivar un usuario
 *     tags: [Usuarios]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Usuario reactivado }
 */
import { Router } from 'express';
import { UsuariosController } from '../controllers/usuarios.controller.js';
import { requireAuth, requireRole } from '../middlewares/auth.js';

const router = Router();
router.use(requireAuth);
router.use(requireRole(['ADMIN']));  // Solo ADMIN puede gestionar usuarios

// Rutas especificas primero
router.get('/profesores-sin-usuario', UsuariosController.listarProfesoresSinUsuario);

// CRUD
router.get('/', UsuariosController.listar);
router.get('/:id', UsuariosController.obtenerPorId);
router.put('/:id', UsuariosController.actualizar);
router.put('/:id/password', UsuariosController.cambiarPassword);
router.patch('/:id/baja', UsuariosController.bajaLogica);
router.patch('/:id/reactivar', UsuariosController.reactivar);

export default router;