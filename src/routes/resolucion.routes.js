import { Router } from 'express';
import { ResolucionController } from '../controllers/resolucion.controller.js';

const router = Router();

router.get('/:id', ResolucionController.obtenerPorId);
router.post('/:id/cerrar', ResolucionController.cerrar);

export default router;