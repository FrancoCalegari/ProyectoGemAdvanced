import { Router } from 'express';
import { AlumnoController } from '../controllers/alumno.controller.js';
import { AdmisionController } from '../controllers/admision.controller.js';
import { InscripcionController } from '../controllers/inscripcion.controller.js';
import { CambioCarreraController } from '../controllers/cambioCarrera.controller.js';
import { CursadaController } from '../controllers/cursada.controller.js';

const router = Router();

router.get('/', AlumnoController.listar);
router.post('/', AlumnoController.crear);
router.get('/:id', AlumnoController.obtenerPorId);
router.put('/:id', AlumnoController.actualizar);
router.delete('/:id', AlumnoController.eliminar);

router.get('/:id/admision', AdmisionController.evaluar);

router.get('/:id/examenes', AdmisionController.listarExamenes);
router.post('/:id/examenes', AdmisionController.crearExamen);
router.put('/:id/examenes/:examenId', AdmisionController.actualizarExamen);

router.get('/:id/inscripciones', InscripcionController.listarPorAlumno);
router.post('/:id/inscripciones', InscripcionController.crear);

router.post('/:id/cambio-carrera', CambioCarreraController.cambiar);

router.post('/:id/cursadas', CursadaController.registrar);
router.get('/:id/historia-academica', CursadaController.historiaAcademica);

export default router;