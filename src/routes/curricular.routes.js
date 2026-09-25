import { Router } from 'express';
import { CurricularController } from '../controllers/curricular.controller.js';

const router = Router();

router.post('/resoluciones/:resolucionId/anios', CurricularController.crearAnio);
router.get('/resoluciones/:resolucionId/plan', CurricularController.obtenerPlan);

router.post('/anios/:anioId/materias', CurricularController.crearMateria);
router.get('/anios/:id/materias', CurricularController.listarMateriasDeAnio);

router.put('/materias/:id', CurricularController.actualizarMateria);
router.delete('/materias/:id', CurricularController.eliminarMateria);

export default router;