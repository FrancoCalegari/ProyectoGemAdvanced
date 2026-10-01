import { Router } from 'express';
import { AsistenciaController } from '../controllers/asistencia.controller.js';

const router = Router();

// Asistencias por cursada
router.post('/cursadas/:cursadaId/asistencias', AsistenciaController.registrar);
router.post('/cursadas/:cursadaId/asistencias/masivo', AsistenciaController.registrarMasivo);
router.get('/cursadas/:cursadaId/asistencias', AsistenciaController.listarPorCursada);
router.get('/cursadas/:cursadaId/asistencias/rango', AsistenciaController.listarPorRango);
router.get('/cursadas/:cursadaId/asistencias/resumen', AsistenciaController.resumen);

// Asistencia individual
router.delete('/asistencias/:id', AsistenciaController.eliminar);

export default router;