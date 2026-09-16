import { Router } from 'express';
import { TituloController } from '../controllers/titulo.controller.js';

const router = Router();

router.post('/', TituloController.crear);
router.get('/', TituloController.listar);
router.get('/:id', TituloController.obtenerPorId);
router.post('/:id/resoluciones', TituloController.crearResolucion);

export default router;