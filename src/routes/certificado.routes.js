import { Router } from 'express';
import { CertificadoController } from '../controllers/certificado.controller.js';
import { requireAuth, requireRole } from '../middlewares/auth.js';

const router = Router();

router.use(requireAuth);

const GESTION = ['ADMIN', 'SECRETARIA'];

// El alumno puede ver y descargar sus propias constancias
router.get('/:id/pdf', requireRole([...GESTION, 'ALUMNO']), CertificadoController.descargarPDF);
router.get('/:id', requireRole([...GESTION, 'ALUMNO']), CertificadoController.obtenerPorId);
router.put('/:id/anular', requireRole(GESTION), CertificadoController.anular);

export default router;
