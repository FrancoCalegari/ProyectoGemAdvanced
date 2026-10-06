import { CertificadoPresentadoService } from '../services/certificadoPresentado.service.js';

export class CertificadoPresentadoController {
  // POST /api/alumnos/:id/certificados-presentados
  static async crear(req, res, next) {
    try {
      const { id } = req.params;
      const cert = await CertificadoPresentadoService.crear(id, req.body);
      return res.status(201).json(cert);
    } catch (error) {
      next(error);
    }
  }

  // GET /api/alumnos/:id/certificados-presentados
  static async listarPorAlumno(req, res, next) {
    try {
      const { id } = req.params;
      const certs = await CertificadoPresentadoService.listarPorAlumno(id);
      return res.status(200).json(certs);
    } catch (error) {
      next(error);
    }
  }

  // GET /api/certificados-presentados
  static async listar(req, res, next) {
    try {
      const certs = await CertificadoPresentadoService.listar(req.query);
      return res.status(200).json(certs);
    } catch (error) {
      next(error);
    }
  }

  // GET /api/certificados-presentados/:id
  static async obtenerPorId(req, res, next) {
    try {
      const { id } = req.params;
      const cert = await CertificadoPresentadoService.obtenerPorId(id);
      return res.status(200).json(cert);
    } catch (error) {
      next(error);
    }
  }

  // PUT /api/certificados-presentados/:id/aprobar
  static async aprobar(req, res, next) {
    try {
      const { id } = req.params;
      const usuarioId = req.user?.id;
      const resultado = await CertificadoPresentadoService.aprobar(id, usuarioId, req.body);
      return res.status(200).json(resultado);
    } catch (error) {
      next(error);
    }
  }

  // PUT /api/certificados-presentados/:id/rechazar
  static async rechazar(req, res, next) {
    try {
      const { id } = req.params;
      const usuarioId = req.user?.id;
      const resultado = await CertificadoPresentadoService.rechazar(id, usuarioId, req.body);
      return res.status(200).json(resultado);
    } catch (error) {
      next(error);
    }
  }

  // DELETE /api/certificados-presentados/:id
  static async eliminar(req, res, next) {
    try {
      const { id } = req.params;
      await CertificadoPresentadoService.eliminar(id, req.user);
      return res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}