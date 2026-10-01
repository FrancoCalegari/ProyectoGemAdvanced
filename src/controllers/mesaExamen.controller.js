import { MesaExamenService } from '../services/mesaExamen.service.js';

export class MesaExamenController {
  // POST /api/mesas
  static async crear(req, res, next) {
    try {
      const usuarioId = req.user?.id;
      const mesa = await MesaExamenService.crear(req.body, usuarioId);
      return res.status(201).json(mesa);
    } catch (error) {
      next(error);
    }
  }

  // GET /api/mesas
  static async listar(req, res, next) {
    try {
      const mesas = await MesaExamenService.listar(req.query);
      return res.status(200).json(mesas);
    } catch (error) {
      next(error);
    }
  }

  // GET /api/mesas/:id
  static async obtenerPorId(req, res, next) {
    try {
      const { id } = req.params;
      const mesa = await MesaExamenService.obtenerPorId(id);
      return res.status(200).json(mesa);
    } catch (error) {
      next(error);
    }
  }

  // GET /api/alumnos/:id/mesas-disponibles
  static async listarDisponiblesParaAlumno(req, res, next) {
    try {
      const { id } = req.params;
      const mesas = await MesaExamenService.listarDisponiblesParaAlumno(id);
      return res.status(200).json(mesas);
    } catch (error) {
      next(error);
    }
  }

  // POST /api/mesas/:id/inscribir
  static async inscribir(req, res, next) {
    try {
      const { id } = req.params;
      const alumnoId = req.body.alumnoId || req.user?.alumnoId;
      if (!alumnoId) {
        return res.status(400).json({
          error: 'VALIDATION_ERROR',
          message: 'Falta alumnoId.',
        });
      }
      const inscripcion = await MesaExamenService.inscribir(id, alumnoId);
      return res.status(201).json(inscripcion);
    } catch (error) {
      next(error);
    }
  }

  // DELETE /api/mesas/:id/inscribir
  static async cancelar(req, res, next) {
    try {
      const { id } = req.params;
      const alumnoId = req.body.alumnoId || req.user?.alumnoId;
      if (!alumnoId) {
        return res.status(400).json({
          error: 'VALIDATION_ERROR',
          message: 'Falta alumnoId.',
        });
      }
      const inscripcion = await MesaExamenService.cancelar(id, alumnoId, req.body);
      return res.status(200).json(inscripcion);
    } catch (error) {
      next(error);
    }
  }

  // PUT /api/mesas/:id/inscripciones/:alumnoId/asistencia
  static async registrarAsistencia(req, res, next) {
    try {
      const { id, alumnoId } = req.params;
      const inscripcion = await MesaExamenService.registrarAsistencia(id, alumnoId, req.body);
      return res.status(200).json(inscripcion);
    } catch (error) {
      next(error);
    }
  }

  // GET /api/mesas/:id/inscripciones
  static async listarInscripciones(req, res, next) {
    try {
      const { id } = req.params;
      const inscripciones = await MesaExamenService.listarInscripciones(id);
      return res.status(200).json(inscripciones);
    } catch (error) {
      next(error);
    }
  }

  // PUT /api/mesas/:id/estado
  static async actualizarEstado(req, res, next) {
    try {
      const { id } = req.params;
      const mesa = await MesaExamenService.actualizarEstado(id, req.body);
      return res.status(200).json(mesa);
    } catch (error) {
      next(error);
    }
  }
}