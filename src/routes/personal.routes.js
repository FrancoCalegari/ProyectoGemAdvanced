import { Router } from 'express';
import { PersonalController } from '../controllers/personal.controller.js';
import { requireAuth, requireRole } from '../middlewares/auth.js';

const router = Router();

router.use(requireAuth);

// Vista unificada del personal del establecimiento.
// El celador queda afuera por la lista blanca de bloqueoCelador.
router.get('/', requireRole(['ADMIN', 'SECRETARIA']), PersonalController.listar);
router.get('/usuario/:usuarioId', requireRole(['ADMIN', 'SECRETARIA']), PersonalController.obtenerPorUsuario);

export default router;
