import { AlumnoService } from '../services/alumno.service.js';

export class AlumnoController {
  static async listar(req, res, next) {
    try {
      const alumnos = await AlumnoService.listar(req.query);
      return res.status(200).json(alumnos);
    } catch (error) {
      next(error);
    }
  }

  static async obtenerPorId(req, res, next) {
    try {
      const { id } = req.params;
      const alumno = await AlumnoService.obtenerPorId(id);
      return res.status(200).json(alumno);
    } catch (error) {
      next(error);
    }
  }

  static async crear(req, res, next) {
    try {
      const alumno = await AlumnoService.crear(req.body);
      return res.status(201).json(alumno);
    } catch (error) {
      next(error);
    }
  }

  static async actualizar(req, res, next) {
    try {
      const { id } = req.params;
      const alumno = await AlumnoService.actualizar(id, req.body);
      return res.status(200).json(alumno);
    } catch (error) {
      next(error);
    }
  }

  static async eliminar(req, res, next) {
    try {
      const { id } = req.params;
      await AlumnoService.eliminar(id);
      return res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}