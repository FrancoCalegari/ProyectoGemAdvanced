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
  static async listarAgrupados(req, res, next) {
    try {
      const data = await AlumnoService.listarAgrupados();
      return res.status(200).json(data);
    } catch (error) {
      next(error);
    }
  }

  // ============================================================
  // HISTORIAL (todos los alumnos, cualquier estado)
  // ============================================================
  static async historial(req, res, next) {
    try {
      const alumnos = await AlumnoService.historial(req.query);
      return res.status(200).json(alumnos);
    } catch (error) {
      next(error);
    }
  }

  // ============================================================
  // CAMBIAR ESTADO
  // ============================================================
  static async cambiarEstado(req, res, next) {
    try {
      const { id } = req.params;
      const { estado } = req.body;
      const alumno = await AlumnoService.cambiarEstado(id, estado);
      return res.status(200).json(alumno);
    } catch (error) {
      next(error);
    }
  }

  // ============================================================
  // DAR DE BAJA
  // ============================================================
  static async darDeBaja(req, res, next) {
    try {
      const { id } = req.params;
      const alumno = await AlumnoService.darDeBaja(id);
      return res.status(200).json(alumno);
    } catch (error) {
      next(error);
    }
  }

  // ============================================================
  // REACTIVAR
  // ============================================================
  static async reactivar(req, res, next) {
    try {
      const { id } = req.params;
      const alumno = await AlumnoService.reactivar(id);
      return res.status(200).json(alumno);
    } catch (error) {
      next(error);
    }
  }
}