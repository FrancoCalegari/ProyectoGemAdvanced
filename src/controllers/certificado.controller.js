import { CertificadoService } from '../services/certificado.service.js';

export class CertificadoController {
  static async listarPorAlumno(req, res, next) {
    try {
      const { id } = req.params;
      const certificados = await CertificadoService.listarPorAlumno(id);
      return res.status(200).json(certificados);
    } catch (error) {
      next(error);
    }
  }

  static async obtenerPorId(req, res, next) {
    try {
      const { id } = req.params;
      const certificado = await CertificadoService.obtenerPorId(id);
      return res.status(200).json(certificado);
    } catch (error) {
      next(error);
    }
  }

  static async solicitar(req, res, next) {
    try {
      const { id } = req.params;
      const certificado = await CertificadoService.solicitar(id, req.body);
      return res.status(201).json(certificado);
    } catch (error) {
      next(error);
    }
  }

  static async anular(req, res, next) {
    try {
      const { id } = req.params;
      const certificado = await CertificadoService.anular(id);
      return res.status(200).json(certificado);
    } catch (error) {
      next(error);
    }
  }

  static async descargarPDF(req, res, next) {
    try {
      const { id } = req.params;
      const pdfBuffer = await CertificadoService.generarPDF(id);

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="certificado-${id.slice(0, 8)}.pdf"`
      );
      res.setHeader('Content-Length', pdfBuffer.length);

      return res.end(pdfBuffer);
    } catch (error) {
      next(error);
    }
  }
}