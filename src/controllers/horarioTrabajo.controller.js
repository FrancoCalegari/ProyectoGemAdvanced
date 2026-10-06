import { HorarioTrabajoService } from '../services/horarioTrabajo.service.js';

export class HorarioTrabajoController {
  static async actualizar(req, res, next) {
    try {
      const horario = await HorarioTrabajoService.actualizar(req.params.id, req.body, req.user?.id);
      return res.status(200).json(horario);
    } catch (error) { next(error); }
  }

  static async eliminar(req, res, next) {
    try {
      await HorarioTrabajoService.eliminar(req.params.id, req.user?.id, req.body?.motivo || null);
      return res.status(204).send();
    } catch (error) { next(error); }
  }
}
