import { LicenciaService } from '../services/licencia.service.js';

export class LicenciaController {
  static async listar(req, res, next) {
    try {
      const licencias = await LicenciaService.listar(req.query);
      return res.status(200).json(licencias);
    } catch (error) { next(error); }
  }

  static async obtenerPorId(req, res, next) {
    try {
      const lic = await LicenciaService.obtenerPorId(req.params.id, req.user);
      return res.status(200).json(lic);
    } catch (error) { next(error); }
  }

  static async listarPorProfesor(req, res, next) {
    try {
      const lic = await LicenciaService.listarPorProfesor(req.params.profesorId);
      return res.status(200).json(lic);
    } catch (error) { next(error); }
  }

  static async listarPorEmpleado(req, res, next) {
    try {
      const lic = await LicenciaService.listarPorEmpleado(req.params.empleadoId);
      return res.status(200).json(lic);
    } catch (error) { next(error); }
  }

  static async crear(req, res, next) {
    try {
      // El service resuelve el destinatario según el rol del usuario logueado
      // (docente -> profesorId, bedel/celador -> empleadoId, gestión -> el que indique)
      const lic = await LicenciaService.crear(req.body, req.user);
      return res.status(201).json(lic);
    } catch (error) { next(error); }
  }

  static async actualizar(req, res, next) {
    try {
      const lic = await LicenciaService.actualizar(req.params.id, req.body, req.user);
      return res.status(200).json(lic);
    } catch (error) { next(error); }
  }

  static async eliminar(req, res, next) {
    try {
      await LicenciaService.eliminar(req.params.id, req.user);
      return res.status(204).send();
    } catch (error) { next(error); }
  }

  static async aprobar(req, res, next) {
    try {
      const lic = await LicenciaService.aprobar(req.params.id, req.user.id, req.body?.observaciones);
      return res.status(200).json(lic);
    } catch (error) { next(error); }
  }

  static async rechazar(req, res, next) {
    try {
      const lic = await LicenciaService.rechazar(req.params.id, req.user.id, req.body?.observaciones);
      return res.status(200).json(lic);
    } catch (error) { next(error); }
  }

  static async misLicencias(req, res, next) {
    try {
      const lic = await LicenciaService.misLicencias(req.user);
      return res.status(200).json(lic);
    } catch (error) { next(error); }
  }
}
