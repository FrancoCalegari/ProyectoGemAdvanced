import { Router } from 'express';
import { MesaExamenController } from '../controllers/mesaExamen.controller.js';

const router = Router();

// SECRETARÍA / ADMIN
router.post('/mesas', MesaExamenController.crear);
router.get('/mesas', MesaExamenController.listar);
router.get('/mesas/:id', MesaExamenController.obtenerPorId);
router.get('/mesas/:id/inscripciones', MesaExamenController.listarInscripciones);
router.put('/mesas/:id/estado', MesaExamenController.actualizarEstado);
router.put('/mesas/:id/inscripciones/:alumnoId/asistencia', MesaExamenController.registrarAsistencia);

// ALUMNO
router.get('/alumnos/:id/mesas-disponibles', MesaExamenController.listarDisponiblesParaAlumno);
router.post('/mesas/:id/inscribir', MesaExamenController.inscribir);
router.delete('/mesas/:id/inscribir', MesaExamenController.cancelar);

export default router;