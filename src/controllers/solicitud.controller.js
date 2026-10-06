import { SolicitudService } from '../services/solicitud.service.js';

export class SolicitudController {
  static async listar(req, res, next) {
    try {
      const solicitudes = await SolicitudService.listar(req.query);
      return res.status(200).json(solicitudes);
    } catch (error) { next(error); }
  }

  static async obtenerPorId(req, res, next) {
    try {
      const sol = await SolicitudService.obtenerPorId(req.params.id);
      return res.status(200).json(sol);
    } catch (error) { next(error); }
  }

  static async listarPorAlumno(req, res, next) {
    try {
      const sol = await SolicitudService.listarPorAlumno(req.params.alumnoId);
      return res.status(200).json(sol);
    } catch (error) { next(error); }
  }

  static async listarPorProfesor(req, res, next) {
    try {
      const sol = await SolicitudService.listarPorProfesor(req.params.profesorId);
      return res.status(200).json(sol);
    } catch (error) { next(error); }
  }

  static async crear(req, res, next) {
    try {
      const data = { ...req.body };

      // Forzar identidad según rol del usuario logueado
      if (req.user.rol === 'PROFESOR') {
        data.profesorId = req.user.profesorId;
        delete data.alumnoId;
      } else if (req.user.rol === 'ALUMNO') {
        data.alumnoId = req.user.alumnoId;
        delete data.profesorId;
      }
      // ADMIN puede crear para cualquiera (pasa los ids que vengan en el body)

      const sol = await SolicitudService.crear(data);
      return res.status(201).json(sol);
    } catch (error) { next(error); }
  }

  static async actualizar(req, res, next) {
    try {
      const sol = await SolicitudService.actualizar(req.params.id, req.body);
      return res.status(200).json(sol);
    } catch (error) { next(error); }
  }

  static async eliminar(req, res, next) {
    try {
      await SolicitudService.eliminar(req.params.id);
      return res.status(204).send();
    } catch (error) { next(error); }
  }

  static async aprobar(req, res, next) {
    try {
      const sol = await SolicitudService.aprobar(req.params.id, req.user.id, req.body?.respuesta);
      return res.status(200).json(sol);
    } catch (error) { next(error); }
  }

  static async rechazar(req, res, next) {
    try {
      const sol = await SolicitudService.rechazar(req.params.id, req.user.id, req.body?.respuesta);
      return res.status(200).json(sol);
    } catch (error) { next(error); }
  }

  static async misSolicitudes(req, res, next) {
    try {
      const sol = await SolicitudService.misSolicitudes(req.user);
      return res.status(200).json(sol);
    } catch (error) { next(error); }
  }
}