import { Router } from 'express';
import { TituloController } from '../controllers/titulo.controller.js';
import { ResolucionController } from '../controllers/resolucion.controller.js';

const router = Router();

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
router.post('/', TituloController.crear);

router.get('/:id', TituloController.obtenerPorId);
router.put('/:id', TituloController.actualizar);
router.delete('/:id', TituloController.darDeBaja);
router.post('/:id/resoluciones', TituloController.crearResolucion);
router.get('/:tituloId/resoluciones', ResolucionController.listarPorTitulo);

export default router;
