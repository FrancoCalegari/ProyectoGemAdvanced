import { EquivalenciaService } from '../services/equivalencia.service.js';

export class EquivalenciaController {
  static async listar(req, res, next) {
    try {
      const equivalencias = await EquivalenciaService.listar(req.query);
      return res.status(200).json(equivalencias);
    } catch (error) {
      next(error);
    }
  }

  static async listarPorMateria(req, res, next) {
    try {
      const { id } = req.params;
      const equivalencias = await EquivalenciaService.listarPorMateria(id);
      return res.status(200).json(equivalencias);
    } catch (error) {
      next(error);
    }
  }

  static async crear(req, res, next) {
    try {
      const equivalencia = await EquivalenciaService.crear(req.body);
      return res.status(201).json(equivalencia);
    } catch (error) {
      next(error);
    }
  }

  static async eliminar(req, res, next) {
    try {
      const { id } = req.params;
      await EquivalenciaService.eliminar(id);
      return res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}
