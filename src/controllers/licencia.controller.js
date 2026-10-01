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
      const lic = await LicenciaService.obtenerPorId(req.params.id);
      return res.status(200).json(lic);
    } catch (error) { next(error); }
  }

  static async listarPorProfesor(req, res, next) {
    try {
      const lic = await LicenciaService.listarPorProfesor(req.params.profesorId);
      return res.status(200).json(lic);
    } catch (error) { next(error); }
  }

  static async crear(req, res, next) {
    try {
      const data = { ...req.body };
      // Si es PROFESOR, forzar su propio profesorId
      if (req.user.rol === 'PROFESOR') {
        data.profesorId = req.user.profesorId;
      }
      const lic = await LicenciaService.crear(data);
      return res.status(201).json(lic);
    } catch (error) { next(error); }
  }

  static async actualizar(req, res, next) {
    try {
      const lic = await LicenciaService.actualizar(req.params.id, req.body);
      return res.status(200).json(lic);
    } catch (error) { next(error); }
  }

  static async eliminar(req, res, next) {
    try {
      await LicenciaService.eliminar(req.params.id);
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
      const profesorId = req.user?.profesorId;
      if (!profesorId) return res.status(403).json({ error: 'No sos profesor.' });
      const lic = await LicenciaService.listarPorProfesor(profesorId);
      return res.status(200).json(lic);
    } catch (error) { next(error); }
  }
}