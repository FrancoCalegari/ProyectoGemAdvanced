import { PersonalService } from '../services/personal.service.js';

export class PersonalController {
  // GET /api/personal  → todo el personal: administradores, secretarias y no docentes
  static async listar(req, res, next) {
    try {
      const data = await PersonalService.listar(req.query);
      return res.status(200).json(data);
    } catch (error) { next(error); }
  }

  // GET /api/personal/usuario/:usuarioId  → ficha del personal segun su cuenta
  static async obtenerPorUsuario(req, res, next) {
    try {
      const persona = await PersonalService.obtenerPorUsuario(req.params.usuarioId);
      if (!persona) return res.status(404).json({ error: 'PERSONAL_NOT_FOUND', message: 'No se encontró ese usuario.' });
      return res.status(200).json(persona);
    } catch (error) { next(error); }
  }
}
