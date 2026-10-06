import { Router } from 'express';
import { CurricularController } from '../controllers/curricular.controller.js';
import { requireAuth, requireRole } from '../middlewares/auth.js';

const router = Router();

router.use(requireAuth);

const GESTION = ['ADMIN', 'SECRETARIA'];

// Años curriculares
router.post('/resoluciones/:resolucionId/anios', requireRole(GESTION), CurricularController.crearAnio);
router.get('/resoluciones/:resolucionId/plan', CurricularController.obtenerPlan);

// Materias y aulas (consulta para todos los roles autenticados)
router.get('/materias', CurricularController.listarTodasLasMaterias);
router.get('/aulas', CurricularController.listarAulas);
router.post('/anios/:anioId/materias', requireRole(GESTION), CurricularController.crearMateria);
router.get('/anios/:id/materias', CurricularController.listarMateriasDeAnio);

router.get('/materias/:id', CurricularController.obtenerMateriaPorId);
router.get('/materias/:id/cursadas', CurricularController.listarCursadasDeMateria);
router.put('/materias/:id', requireRole(GESTION), CurricularController.actualizarMateria);
router.delete('/materias/:id', requireRole(GESTION), CurricularController.eliminarMateria);

export default router;
