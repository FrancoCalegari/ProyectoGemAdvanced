import { EstadisticaService } from '../services/estadistica.service.js';
export class EstadisticaController {
  static async resumen(req, res, next) {
    try {
      const { desde, hasta } = req.query;
      const data = await EstadisticaService.resumen(desde, hasta);
      return res.status(200).json(data);
    } catch (error) { next(error); }
  }
  static async alumnos(req, res, next) {
    try {
      const { desde, hasta } = req.query;
      const data = await EstadisticaService.alumnos(desde, hasta);
      return res.status(200).json(data);
    } catch (error) { next(error); }
  }
  static async cursadas(req, res, next) {
    try {
      const { desde, hasta } = req.query;
      const data = await EstadisticaService.cursadas(desde, hasta);
      return res.status(200).json(data);
    } catch (error) { next(error); }
  }
  static async asistencias(req, res, next) {
    try {
      const { desde, hasta } = req.query;
      const data = await EstadisticaService.asistencias(desde, hasta);
      return res.status(200).json(data);
    } catch (error) { next(error); }
  }
  static async clasesSuspendidas(req, res, next) {
    try {
      const { desde, hasta } = req.query;
      const data = await EstadisticaService.clasesSuspendidas(desde, hasta);
      return res.status(200).json(data);
    } catch (error) { next(error); }
  }
  static async mesas(req, res, next) {
    try {
      const { desde, hasta } = req.query;
      const data = await EstadisticaService.mesas(desde, hasta);
      return res.status(200).json(data);
    } catch (error) { next(error); }
  }
  static async certificados(req, res, next) {
    try {
      const { desde, hasta } = req.query;
      const data = await EstadisticaService.certificados(desde, hasta);
      return res.status(200).json(data);
    } catch (error) { next(error); }
  }
}