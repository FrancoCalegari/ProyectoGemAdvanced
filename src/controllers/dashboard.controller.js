import { DashboardService } from '../services/dashboard.service.js';

export class DashboardController {
  static async resumen(req, res, next) {
    try {
      const data = await DashboardService.resumen();
      return res.status(200).json(data);
    } catch (error) { next(error); }
  }

  static async actividad(req, res, next) {
    try {
      const data = await DashboardService.actividad();
      return res.status(200).json(data);
    } catch (error) { next(error); }
  }

  static async alumnosPorMes(req, res, next) {
    try {
      const data = await DashboardService.alumnosPorMes();
      return res.status(200).json(data);
    } catch (error) { next(error); }
  }
}