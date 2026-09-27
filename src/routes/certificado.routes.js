import { Router } from 'express';
import { CertificadoController } from '../controllers/certificado.controller.js';

const router = Router();

router.get('/:id/pdf', CertificadoController.descargarPDF);
router.get('/:id', CertificadoController.obtenerPorId);
router.put('/:id/anular', CertificadoController.anular);

export default router;