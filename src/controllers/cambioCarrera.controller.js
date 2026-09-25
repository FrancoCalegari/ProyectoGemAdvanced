import { CambioCarreraService } from '../services/cambioCarrera.service.js';

export class CambioCarreraController {
  static async cambiar(req, res, next) {
    try {
      const { id } = req.params;
      const resultado = await CambioCarreraService.cambiar(id, req.body);
      return res.status(201).json(resultado);
    } catch (error) {
      next(error);
    }
  }
}