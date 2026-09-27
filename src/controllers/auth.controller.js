import { AuthService } from '../services/auth.service.js';

export class AuthController {
  static async login(req, res, next) {
    try {
      const { email, password } = req.body;
      const resultado = await AuthService.login(email, password);
      return res.status(200).json(resultado);
    } catch (error) {
      next(error);
    }
  }

  static async registrar(req, res, next) {
    try {
      const usuario = await AuthService.registrar(req.body);
      return res.status(201).json(usuario);
    } catch (error) {
      next(error);
    }
  }

  static async me(req, res, next) {
    try {
      const usuario = await AuthService.obtenerPorId(req.user.id);
      return res.status(200).json(usuario);
    } catch (error) {
      next(error);
    }
  }
}