import { Router } from 'express';
import { InscripcionController } from '../controllers/inscripcion.controller.js';
import { CursadaController } from '../controllers/cursada.controller.js';

const router = Router();

router.put('/:id', InscripcionController.actualizar);
router.get('/:id/cursadas', CursadaController.listarPorInscripcion);

export default router;