import { ProfesorService } from '../services/profesor.service.js';

export class ProfesorController {
  // ===================== CRUD =====================

  static async listar(req, res, next) {
    try {
      const profesores = await ProfesorService.listar(req.query);
      return res.status(200).json(profesores);
    } catch (error) {
      next(error);
    }
  }

  static async obtenerPorId(req, res, next) {
    try {
      const { id } = req.params;
      const profesor = await ProfesorService.obtenerPorId(id);
      return res.status(200).json(profesor);
    } catch (error) {
      next(error);
    }
  }

  static async crear(req, res, next) {
    try {
      const profesor = await ProfesorService.crear(req.body);
      return res.status(201).json(profesor);
    } catch (error) {
      next(error);
    }
  }

  static async actualizar(req, res, next) {
    try {
      const { id } = req.params;
      const profesor = await ProfesorService.actualizar(id, req.body);
      return res.status(200).json(profesor);
    } catch (error) {
      next(error);
    }
  }

  static async eliminar(req, res, next) {
    try {
      const { id } = req.params;
      await ProfesorService.eliminar(id);
      return res.status(204).send();
    } catch (error) {
      next(error);
    }
  }

  // ===================== TÍTULOS =====================

  static async agregarTitulo(req, res, next) {
    try {
      const { id } = req.params;
      const titulo = await ProfesorService.agregarTitulo(id, req.body);
      return res.status(201).json(titulo);
    } catch (error) {
      next(error);
    }
  }

  static async eliminarTitulo(req, res, next) {
    try {
      const { id, tituloId } = req.params;
      await ProfesorService.eliminarTitulo(id, tituloId);
      return res.status(204).send();
    } catch (error) {
      next(error);
    }
  }

  // ===================== MATERIAS =====================

  static async asignarMateria(req, res, next) {
    try {
      const { id } = req.params;
      const asignacion = await ProfesorService.asignarMateria(id, req.body);
      return res.status(201).json(asignacion);
    } catch (error) {
      next(error);
    }
  }

  static async desasignarMateria(req, res, next) {
    try {
      const { id, mpId } = req.params;
      await ProfesorService.desasignarMateria(id, mpId);
      return res.status(204).send();
    } catch (error) {
      next(error);
    }
  }

  // ===================== PANEL PERSONAL =====================

  static async misMaterias(req, res, next) {
    try {
      const profesorId = req.user?.profesorId;
      if (!profesorId) {
        return res.status(403).json({ error: 'No sos profesor.' });
      }
      const materias = await ProfesorService.misMaterias(profesorId);
      return res.status(200).json(materias);
    } catch (error) {
      next(error);
    }
  }
}