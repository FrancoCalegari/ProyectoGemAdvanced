import { Router } from 'express';
import { CurricularController } from '../controllers/curricular.controller.js';

const router = Router();

// Años curriculares
router.post('/resoluciones/:resolucionId/anios', CurricularController.crearAnio);
router.get('/resoluciones/:resolucionId/plan', CurricularController.obtenerPlan);

// Materias
router.post('/anios/:anioId/materias', CurricularController.crearMateria);

export default router;