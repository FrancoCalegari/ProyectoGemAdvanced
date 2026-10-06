import { Router } from 'express';
import { AlumnoController } from '../controllers/alumno.controller.js';
import { AdmisionController } from '../controllers/admision.controller.js';
import { InscripcionController } from '../controllers/inscripcion.controller.js';
import { CambioCarreraController } from '../controllers/cambioCarrera.controller.js';
import { CursadaController } from '../controllers/cursada.controller.js';
import { CertificadoController } from '../controllers/certificado.controller.js';
import { requireAuth, requireRole, requireSelfOrRole } from '../middlewares/auth.js';

const router = Router();

// Todas las rutas requieren autenticación
router.use(requireAuth);

// Gestión académica (puede crear / modificar)
const GESTION = ['ADMIN', 'SECRETARIA'];
// Consulta de legajos: gestión + personal no docente (bedeles, celadores)
const CONSULTA = [...GESTION, 'BEDEL'];

// ---------------------------------------------------------
// Listados
// ---------------------------------------------------------
router.get('/historial', requireRole(CONSULTA), AlumnoController.historial);
router.get('/agrupados', requireRole(CONSULTA), AlumnoController.listarAgrupados);
router.get('/', requireRole(CONSULTA), AlumnoController.listar);
router.post('/', requireRole(GESTION), AlumnoController.crear);

// ---------------------------------------------------------
// Legajo de un alumno (gestión / no docentes, o el propio alumno)
// ---------------------------------------------------------
router.get('/:id', requireSelfOrRole(CONSULTA), AlumnoController.obtenerPorId);
router.put('/:id', requireRole(GESTION), AlumnoController.actualizar);
router.delete('/:id', requireRole(GESTION), AlumnoController.eliminar);
router.patch('/:id/estado', requireRole(GESTION), AlumnoController.cambiarEstado);
router.patch('/:id/baja', requireRole(GESTION), AlumnoController.darDeBaja);
router.patch('/:id/reactivar', requireRole(GESTION), AlumnoController.reactivar);

// Admisión y exámenes nivelatorios
router.get('/:id/admision', requireSelfOrRole(CONSULTA), AdmisionController.evaluar);
router.get('/:id/examenes', requireSelfOrRole(CONSULTA), AdmisionController.listarExamenes);
router.post('/:id/examenes', requireRole(GESTION), AdmisionController.crearExamen);
router.put('/:id/examenes/:examenId', requireRole(GESTION), AdmisionController.actualizarExamen);

// Inscripciones
router.get('/:id/inscripciones', requireSelfOrRole(CONSULTA), InscripcionController.listarPorAlumno);
router.post('/:id/inscripciones', requireRole(GESTION), InscripcionController.crear);

// Cambio de carrera
router.post('/:id/cambio-carrera', requireRole(GESTION), CambioCarreraController.cambiar);

// Cursadas e historia académica
router.post('/:id/cursadas', requireRole(GESTION), CursadaController.registrar);
router.get('/:id/historia-academica', requireSelfOrRole(CONSULTA), CursadaController.historiaAcademica);

// Certificados del alumno (el alumno puede pedir y ver los propios)
router.post(
  '/:id/certificados/preview-concurrencia',
  requireSelfOrRole(CONSULTA),
  CertificadoController.previewConcurrencia
);
router.get('/:id/certificados', requireSelfOrRole(CONSULTA), CertificadoController.listarPorAlumno);
router.post('/:id/certificados', requireSelfOrRole(CONSULTA), CertificadoController.solicitar);

export default router;
