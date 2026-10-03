/**
 * @openapi
 * /api/auth/me:
 *   patch:
 *     summary: Actualizar mi propio perfil
 *     tags: [Auth]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Perfil actualizado }
 * /api/auth/me/password:
 *   patch:
 *     summary: Cambiar mi contrasena
 *     tags: [Auth]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Contrasena actualizada }
 */
import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller.js';
import { requireAuth, requireRole } from '../middlewares/auth.js';

const router = Router();

/**
 * @openapi
 * /api/auth/login:
 *   post:
 *     summary: Login de usuario
 *     description: Autentica un usuario y devuelve un JWT
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: admin@plataforma.edu.ar
 *               password:
 *                 type: string
 *                 example: admin123
 *     responses:
 *       200:
 *         description: Login exitoso
 *       401:
 *         description: Credenciales invalidas
 */
router.post('/login', AuthController.login);

/**
 * @openapi
 * /api/auth/me:
 *   get:
 *     summary: Datos del usuario autenticado
 *     tags:
 *       - Auth
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Datos del usuario
 *       401:
 *         description: Token requerido o invalido
 */
router.get('/me', requireAuth, AuthController.me);
router.patch('/me', requireAuth, AuthController.actualizarPerfilPropio);
router.patch('/me/password', requireAuth, AuthController.cambiarPasswordPropio);

/**
 * @openapi
 * /api/auth/register:
 *   post:
 *     summary: Alta de usuario (solo admin)
 *     tags:
 *       - Auth
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - nombre
 *               - apellido
 *               - rol
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               nombre:
 *                 type: string
 *               apellido:
 *                 type: string
 *               rol:
 *                 type: string
 *                 enum: [ADMIN, SECRETARIA, ALUMNO]
 *               alumnoId:
 *                 type: string
 *                 format: uuid
 *     responses:
 *       201:
 *         description: Usuario creado
 *       403:
 *         description: Sin permisos
 */
router.post('/register', requireAuth, requireRole(['ADMIN']), AuthController.registrar);

export default router;
