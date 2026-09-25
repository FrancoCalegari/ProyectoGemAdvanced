import { AdmisionService } from '../services/admision.service.js';

export class AdmisionController {
  static async evaluar(req, res, next) {
    try {
      const { id } = req.params;
      const estado = await AdmisionService.evaluarAdmision(id);
      return res.status(200).json(estado);
    } catch (error) {
      next(error);
    }
  }

  static async listarExamenes(req, res, next) {
    try {
      const { id } = req.params;
      const examenes = await AdmisionService.listarExamenes(id);
      return res.status(200).json(examenes);
    } catch (error) {
      next(error);
    }
  }

  static async crearExamen(req, res, next) {
    try {
      const { id } = req.params;
      const examen = await AdmisionService.crearExamen(id, req.body);
      return res.status(201).json(examen);
    } catch (error) {
      next(error);
    }
  }

  static async actualizarExamen(req, res, next) {
    try {
      const { id, examenId } = req.params;
      const examen = await AdmisionService.actualizarExamen(id, examenId, req.body);
      return res.status(200).json(examen);
    } catch (error) {
      next(error);
    }
  }
}