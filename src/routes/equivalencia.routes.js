import { Router } from 'express';
import { EquivalenciaController } from '../controllers/equivalencia.controller.js';

const router = Router();

router.get('/equivalencias', EquivalenciaController.listar);
router.post('/equivalencias', EquivalenciaController.crear);
router.delete('/equivalencias/:id', EquivalenciaController.eliminar);
router.get('/materias/:id/equivalencias', EquivalenciaController.listarPorMateria);

export default router;