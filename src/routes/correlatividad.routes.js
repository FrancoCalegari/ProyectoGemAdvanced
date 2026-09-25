import { Router } from 'express';
import { CorrelatividadController } from '../controllers/correlatividad.controller.js';

const router = Router();

router.get('/materias/:id/correlativas', CorrelatividadController.listarPorMateria);
router.post('/materias/:id/correlativas', CorrelatividadController.crear);
router.delete('/correlatividades/:id', CorrelatividadController.eliminar);

export default router;