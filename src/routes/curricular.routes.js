import { Router } from 'express';
import { CurricularController } from '../controllers/curricular.controller.js';

const router = Router();

router.post('/resoluciones/:resolucionId/anios', CurricularController.crearAnio);
router.get('/resoluciones/:resolucionId/plan', CurricularController.obtenerPlan);

router.get('/materias', CurricularController.listarTodasLasMaterias);
router.get('/aulas', CurricularController.listarAulas);
router.post('/anios/:anioId/materias', CurricularController.crearMateria);
router.get('/anios/:id/materias', CurricularController.listarMateriasDeAnio);

router.get('/materias/:id', CurricularController.obtenerMateriaPorId);
router.get('/materias/:id/cursadas', CurricularController.listarCursadasDeMateria);
router.put('/materias/:id', CurricularController.actualizarMateria);
router.delete('/materias/:id', CurricularController.eliminarMateria);

export default router;