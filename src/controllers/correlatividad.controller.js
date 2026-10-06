import { CorrelatividadService } from '../services/correlatividad.service.js';

export class CorrelatividadController {
  static async listarPorMateria(req, res, next) {
    try {
      const { id } = req.params;
      const correlativas = await CorrelatividadService.listarPorMateria(id);
      return res.status(200).json(correlativas);
    } catch (error) {
      next(error);
    }
  }

  static async crear(req, res, next) {
    try {
      const { id } = req.params;
      const correlatividad = await CorrelatividadService.crear(id, req.body);
      return res.status(201).json(correlatividad);
    } catch (error) {
      next(error);
    }
  }

  static async eliminar(req, res, next) {
    try {
      const { id } = req.params;
      await CorrelatividadService.eliminar(id);
      return res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}