import { CursadaService } from '../services/cursada.service.js';

export class CursadaController {
  static async registrar(req, res, next) {
    try {
      const { id } = req.params;
      const cursada = await CursadaService.registrar(id, req.body);
      return res.status(200).json(cursada);
    } catch (error) {
      next(error);
    }
  }

  static async listarPorInscripcion(req, res, next) {
    try {
      const { id } = req.params;
      const cursadas = await CursadaService.listarPorInscripcion(id);
      return res.status(200).json(cursadas);
    } catch (error) {
      next(error);
    }
  }

  static async historiaAcademica(req, res, next) {
    try {
      const { id } = req.params;
      const historia = await CursadaService.historiaAcademica(id);
      return res.status(200).json(historia);
    } catch (error) {
      next(error);
    }
  }
}