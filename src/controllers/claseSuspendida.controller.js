import { ClaseSuspendidaService } from '../services/claseSuspendida.service.js';

export class ClaseSuspendidaController {
  static async listar(req, res, next) {
    try {
      const clases = await ClaseSuspendidaService.listar(req.query);
      return res.status(200).json(clases);
    } catch (error) { next(error); }
  }

  static async obtenerPorId(req, res, next) {
    try {
      const clase = await ClaseSuspendidaService.obtenerPorId(req.params.id);
      return res.status(200).json(clase);
    } catch (error) { next(error); }
  }

  static async crearManual(req, res, next) {
    try {
      const clase = await ClaseSuspendidaService.crearManual(req.body);
      return res.status(201).json(clase);
    } catch (error) { next(error); }
  }

  static async eliminar(req, res, next) {
    try {
      await ClaseSuspendidaService.eliminar(req.params.id);
      return res.status(204).send();
    } catch (error) { next(error); }
  }

  static async reasignar(req, res, next) {
    try {
      const r = await ClaseSuspendidaService.reasignar(req.params.id, req.body, req.user.id);
      return res.status(201).json(r);
    } catch (error) { next(error); }
  }

  static async eliminarReasignacion(req, res, next) {
    try {
      await ClaseSuspendidaService.eliminarReasignacion(req.params.reasignacionId);
      return res.status(204).send();
    } catch (error) { next(error); }
  }

  static async resumen(req, res, next) {
    try {
      const { desde, hasta } = req.query;
      const r = await ClaseSuspendidaService.resumenPorRango(desde, hasta);
      return res.status(200).json(r);
    } catch (error) { next(error); }
  }
}