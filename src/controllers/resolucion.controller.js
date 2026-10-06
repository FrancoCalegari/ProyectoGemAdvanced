import { ResolucionService } from '../services/resolucion.service.js';

export class ResolucionController {
  static async listarPorTitulo(req, res, next) {
    try {
      const { tituloId } = req.params;
      const resoluciones = await ResolucionService.listarPorTitulo(tituloId);
      return res.status(200).json(resoluciones);
    } catch (error) {
      next(error);
    }
  }

  static async obtenerPorId(req, res, next) {
    try {
      const { id } = req.params;
      const resolucion = await ResolucionService.obtenerPorId(id);
      return res.status(200).json(resolucion);
    } catch (error) {
      next(error);
    }
  }

  static async cerrar(req, res, next) {
    try {
      const { id } = req.params;
      const resolucion = await ResolucionService.cerrar(id);
      return res.status(200).json(resolucion);
    } catch (error) {
      next(error);
    }
  }
}