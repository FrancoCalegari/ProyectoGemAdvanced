import { Router } from 'express';
import { TituloController } from '../controllers/titulo.controller.js';
import { ResolucionController } from '../controllers/resolucion.controller.js';
import { requireAuth, requireRole } from '../middlewares/auth.js';

const router = Router();

// Todas las rutas requieren autenticación
router.use(requireAuth);

const GESTION = ['ADMIN', 'SECRETARIA'];

/**
 * @openapi
 * /api/titulos:
 *   get:
 *     summary: Listar todos los titulos
 *     tags:
 *       - Titulos
 *     responses:
 *       200:
 *         description: Lista de titulos con sus resoluciones
 */
router.get('/', TituloController.listar);

/**
 * @openapi
 * /api/titulos:
 *   post:
 *     summary: Crear un titulo con su primera resolucion
 *     tags:
 *       - Titulos
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nombre
 *               - nivel
 *               - duracionAnios
 *               - resolucion
 *             properties:
 *               nombre:
 *                 type: string
 *               nivel:
 *                 type: string
 *               duracionAnios:
 *                 type: integer
 *               resolucion:
 *                 type: object
 *                 properties:
 *                   numero:
 *                     type: string
 *                   anioCreacion:
 *                     type: integer
 *                   codigo:
 *                     type: string
 *                   fechaInicioVigencia:
 *                     type: string
 *                     format: date
 *     responses:
 *       201:
 *         description: Titulo creado
 *       409:
 *         description: Nombre o codigo duplicado
 */
router.post('/', requireRole(GESTION), TituloController.crear);

router.get('/:id', TituloController.obtenerPorId);
router.put('/:id', requireRole(GESTION), TituloController.actualizar);
router.delete('/:id', requireRole(GESTION), TituloController.darDeBaja);
router.post('/:id/resoluciones', requireRole(GESTION), TituloController.crearResolucion);
router.get('/:tituloId/resoluciones', ResolucionController.listarPorTitulo);

export default router;
