import { EmpleadoService } from '../services/empleado.service.js';
import { HorarioTrabajoService } from '../services/horarioTrabajo.service.js';

export class EmpleadoController {
  // ---------------- ABM (gestión) ----------------
  static async listar(req, res, next) {
    try {
      const empleados = await EmpleadoService.listar(req.query);
      return res.status(200).json(empleados);
    } catch (error) { next(error); }
  }

  static async obtenerPorId(req, res, next) {
    try {
      const empleado = await EmpleadoService.obtenerPorId(req.params.id);
      return res.status(200).json(empleado);
    } catch (error) { next(error); }
  }

  static async crear(req, res, next) {
    try {
      const empleado = await EmpleadoService.crear(req.body);
      return res.status(201).json(empleado);
    } catch (error) { next(error); }
  }

  static async actualizar(req, res, next) {
    try {
      const empleado = await EmpleadoService.actualizar(req.params.id, req.body);
      return res.status(200).json(empleado);
    } catch (error) { next(error); }
  }

  static async cambiarEstado(req, res, next) {
    try {
      const empleado = await EmpleadoService.cambiarEstado(req.params.id, req.body.estado);
      return res.status(200).json(empleado);
    } catch (error) { next(error); }
  }

  static async darDeBaja(req, res, next) {
    try {
      const empleado = await EmpleadoService.darDeBaja(req.params.id);
      return res.status(200).json(empleado);
    } catch (error) { next(error); }
  }

  static async reactivar(req, res, next) {
    try {
      const empleado = await EmpleadoService.reactivar(req.params.id);
      return res.status(200).json(empleado);
    } catch (error) { next(error); }
  }

  // ---------------- Horarios (gestión) ----------------
  static async listarHorarios(req, res, next) {
    try {
      const { id } = req.params;
      const vigentes = await HorarioTrabajoService.listarPorEmpleado(id, { soloVigentes: true });
      const historial = await HorarioTrabajoService.listarPorEmpleado(id, { soloHistorial: true });
      return res.status(200).json({ vigentes, historial });
    } catch (error) { next(error); }
  }

  static async crearHorario(req, res, next) {
    try {
      const horario = await HorarioTrabajoService.crear(req.params.id, req.body, req.user?.id);
      return res.status(201).json(horario);
    } catch (error) { next(error); }
  }

  static async listarModificaciones(req, res, next) {
    try {
      const modificaciones = await HorarioTrabajoService.listarModificaciones(req.params.id);
      return res.status(200).json(modificaciones);
    } catch (error) { next(error); }
  }

  // ---------------- Panel de autoservicio ----------------
  static async miFicha(req, res, next) {
    try {
      return res.status(200).json(await EmpleadoService.miFicha(req.user));
    } catch (error) { next(error); }
  }

  static async misHorarios(req, res, next) {
    try {
      return res.status(200).json(await EmpleadoService.misHorarios(req.user));
    } catch (error) { next(error); }
  }

  static async misModificaciones(req, res, next) {
    try {
      return res.status(200).json(await EmpleadoService.misModificaciones(req.user));
    } catch (error) { next(error); }
  }

  static async marcarModificacionesVistas(req, res, next) {
    try {
      const ids = Array.isArray(req.body?.ids) ? req.body.ids : null;
      return res.status(200).json(await EmpleadoService.marcarModificacionesVistas(req.user, ids));
    } catch (error) { next(error); }
  }

  static async miHistorial(req, res, next) {
    try {
      return res.status(200).json(await EmpleadoService.miHistorial(req.user));
    } catch (error) { next(error); }
  }
}
