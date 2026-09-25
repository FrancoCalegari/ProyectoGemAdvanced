import { InscripcionService } from '../services/inscripcion.service.js';

export class InscripcionController {
  static async listarPorAlumno(req, res, next) {
    try {
      const { id } = req.params;
      const inscripciones = await InscripcionService.listarPorAlumno(id);
      return res.status(200).json(inscripciones);
    } catch (error) {
      next(error);
    }
  }

  static async crear(req, res, next) {
    try {
      const { id } = req.params;
      const inscripcion = await InscripcionService.crear(id, req.body);
      return res.status(201).json(inscripcion);
    } catch (error) {
      next(error);
    }
  }

  static async actualizar(req, res, next) {
    try {
      const { id } = req.params;
      const inscripcion = await InscripcionService.actualizar(id, req.body);
      return res.status(200).json(inscripcion);
    } catch (error) {
      next(error);
    }
  }
}