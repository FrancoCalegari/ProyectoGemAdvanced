import { CurricularService } from '../services/curricular.service.js';

export class CurricularController {
  static async crearAnio(req, res) {
    try {
      const { resolucionId } = req.params;
      const anio = await CurricularService.crearAnioCurricular(resolucionId, req.body);
      return res.status(201).json(anio);
    } catch (error) {
      if (error.message === 'RESOLUCION_NOT_FOUND') {
        return res.status(404).json({ error: 'Resolución no encontrada.' });
      }
      if (error.code === 'P2002') {
        return res.status(409).json({ error: 'El número de año ya existe para esta resolución.' });
      }
      return res.status(400).json({ error: error.message });
    }
  }

  static async crearMateria(req, res) {
    try {
      const { anioId } = req.params;
      const materia = await CurricularService.crearMateria(anioId, req.body);
      return res.status(201).json(materia);
    } catch (error) {
      if (error.message === 'ANIO_NOT_FOUND') {
        return res.status(404).json({ error: 'Año curricular no encontrado.' });
      }
      if (error.code === 'P2002') {
        return res.status(409).json({ error: 'El código de materia ya existe en este año curricular.' });
      }
      return res.status(400).json({ error: error.message });
    }
  }

  static async obtenerPlan(req, res) {
    try {
      const { resolucionId } = req.params;
      const plan = await CurricularService.obtenerPlanPorResolucion(resolucionId);
      return res.status(200).json(plan);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }
}