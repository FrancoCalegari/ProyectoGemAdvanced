import { AsistenciaService } from '../services/asistencia.service.js';

export class AsistenciaController {
  static async registrar(req, res, next) {
    try {
      const { cursadaId } = req.params;
      const asistencia = await AsistenciaService.registrar(cursadaId, req.body);
      return res.status(200).json(asistencia);
    } catch (error) {
      next(error);
    }
  }

  static async registrarMasivo(req, res, next) {
    try {
      const { cursadaId } = req.params;
      const resultados = await AsistenciaService.registrarMasivo(cursadaId, req.body);
      return res.status(200).json(resultados);
    } catch (error) {
      next(error);
    }
  }

  static async listarPorCursada(req, res, next) {
    try {
      const { cursadaId } = req.params;
      const asistencias = await AsistenciaService.listarPorCursada(cursadaId);
      return res.status(200).json(asistencias);
    } catch (error) {
      next(error);
    }
  }

  static async listarPorRango(req, res, next) {
    try {
      const { cursadaId } = req.params;
      const { desde, hasta } = req.query;
      const asistencias = await AsistenciaService.listarPorRango(cursadaId, desde, hasta);
      return res.status(200).json(asistencias);
    } catch (error) {
      next(error);
    }
  }

  static async resumen(req, res, next) {
    try {
      const { cursadaId } = req.params;
      const resumen = await AsistenciaService.resumen(cursadaId);
      return res.status(200).json(resumen);
    } catch (error) {
      next(error);
    }
  }

  static async eliminar(req, res, next) {
    try {
      const { id } = req.params;
      await AsistenciaService.eliminar(id);
      return res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}