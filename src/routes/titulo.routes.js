import { Router } from 'express';
import { TituloController } from '../controllers/titulo.controller.js';
import { ResolucionController } from '../controllers/resolucion.controller.js';

const router = Router();

router.post('/', TituloController.crear);
router.get('/', TituloController.listar);
router.get('/:id', TituloController.obtenerPorId);
router.put('/:id', TituloController.actualizar);
router.delete('/:id', TituloController.darDeBaja);
router.post('/:id/resoluciones', TituloController.crearResolucion);
router.get('/:tituloId/resoluciones', ResolucionController.listarPorTitulo);

export default router;