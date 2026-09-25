import { CurricularService } from '../services/curricular.service.js';

export class CurricularController {
  static async crearAnio(req, res, next) {
    try {
      const { resolucionId } = req.params;
      const anio = await CurricularService.crearAnioCurricular(resolucionId, req.body);
      return res.status(201).json(anio);
    } catch (error) {
      next(error);
    }
  }

  static async crearMateria(req, res, next) {
    try {
      const { anioId } = req.params;
      const materia = await CurricularService.crearMateria(anioId, req.body);
      return res.status(201).json(materia);
    } catch (error) {
      next(error);
    }
  }

  static async obtenerPlan(req, res, next) {
    try {
      const { resolucionId } = req.params;
      const plan = await CurricularService.obtenerPlanPorResolucion(resolucionId);
      return res.status(200).json(plan);
    } catch (error) {
      next(error);
    }
  }

  static async listarMateriasDeAnio(req, res, next) {
    try {
      const { id } = req.params;
      const materias = await CurricularService.listarMateriasDeAnio(id);
      return res.status(200).json(materias);
    } catch (error) {
      next(error);
    }
  }

  static async actualizarMateria(req, res, next) {
    try {
      const { id } = req.params;
      const materia = await CurricularService.actualizarMateria(id, req.body);
      return res.status(200).json(materia);
    } catch (error) {
      next(error);
    }
  }

  static async eliminarMateria(req, res, next) {
    try {
      const { id } = req.params;
      await CurricularService.eliminarMateria(id);
      return res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}