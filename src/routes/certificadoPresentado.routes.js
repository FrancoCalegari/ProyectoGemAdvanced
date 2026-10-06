import { Router } from 'express';
import { CertificadoPresentadoController } from '../controllers/certificadoPresentado.controller.js';
import { requireAuth, requireRole, requireSelfOrRole } from '../middlewares/auth.js';

const router = Router();

// Montado en '/api': la autenticacion va ruta por ruta (ver nota en asistencia.routes.js)
const GESTION = ['ADMIN', 'SECRETARIA'];
const CONSULTA = [...GESTION, 'BEDEL'];

// Panel: listar todos (gestion y personal no docente)
router.get('/certificados-presentados', requireAuth, requireRole(CONSULTA), CertificadoPresentadoController.listar);

// Obtener / aprobar / rechazar / eliminar por ID
router.get('/certificados-presentados/:id', requireAuth, requireRole(CONSULTA), CertificadoPresentadoController.obtenerPorId);
router.put('/certificados-presentados/:id/aprobar', requireAuth, requireRole(GESTION), CertificadoPresentadoController.aprobar);
router.put('/certificados-presentados/:id/rechazar', requireAuth, requireRole(GESTION), CertificadoPresentadoController.rechazar);
router.delete(
  '/certificados-presentados/:id',
  requireAuth,
  requireRole([...CONSULTA, 'ALUMNO']),
  CertificadoPresentadoController.eliminar
);

// Rutas anidadas bajo alumno: el alumno justifica sus propias faltas,
// bedeles/celadores y gestion pueden cargar justificaciones de cualquier alumno
router.post(
  '/alumnos/:id/certificados-presentados',
  requireAuth,
  requireSelfOrRole(CONSULTA),
  CertificadoPresentadoController.crear
);
router.get(
  '/alumnos/:id/certificados-presentados',
  requireAuth,
  requireSelfOrRole(CONSULTA),
  CertificadoPresentadoController.listarPorAlumno
);

export default router;
