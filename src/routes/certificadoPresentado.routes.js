import { Router } from 'express';
import { CertificadoPresentadoController } from '../controllers/certificadoPresentado.controller.js';

const router = Router();

// Panel admin: listar todos
router.get('/certificados-presentados', CertificadoPresentadoController.listar);

// Obtener / aprobar / rechazar / eliminar por ID
router.get('/certificados-presentados/:id', CertificadoPresentadoController.obtenerPorId);
router.put('/certificados-presentados/:id/aprobar', CertificadoPresentadoController.aprobar);
router.put('/certificados-presentados/:id/rechazar', CertificadoPresentadoController.rechazar);
router.delete('/certificados-presentados/:id', CertificadoPresentadoController.eliminar);

// Rutas anidadas bajo alumno
router.post('/alumnos/:id/certificados-presentados', CertificadoPresentadoController.crear);
router.get('/alumnos/:id/certificados-presentados', CertificadoPresentadoController.listarPorAlumno);

export default router;