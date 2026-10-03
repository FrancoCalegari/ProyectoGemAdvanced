import { UsuariosService } from '../services/usuarios.service.js';

export class UsuariosController {
  static async listar(req, res, next) {
    try {
      const usuarios = await UsuariosService.listar(req.query);
      return res.status(200).json(usuarios);
    } catch (error) { next(error); }
  }

  static async obtenerPorId(req, res, next) {
    try {
      const usuario = await UsuariosService.obtenerPorId(req.params.id);
      return res.status(200).json(usuario);
    } catch (error) { next(error); }
  }

  static async listarProfesoresSinUsuario(req, res, next) {
    try {
      const profesores = await UsuariosService.listarProfesoresSinUsuario();
      return res.status(200).json(profesores);
    } catch (error) { next(error); }
  }

  static async actualizar(req, res, next) {
    try {
      const usuario = await UsuariosService.actualizar(req.params.id, req.body);
      return res.status(200).json(usuario);
    } catch (error) { next(error); }
  }

  static async cambiarPassword(req, res, next) {
    try {
      const { newPassword } = req.body;
      const resultado = await UsuariosService.cambiarPassword(req.params.id, newPassword);
      return res.status(200).json(resultado);
    } catch (error) { next(error); }
  }

  static async bajaLogica(req, res, next) {
    try {
      const resultado = await UsuariosService.bajaLogica(req.params.id, req.user.id);
      return res.status(200).json(resultado);
    } catch (error) { next(error); }
  }

  static async reactivar(req, res, next) {
    try {
      const resultado = await UsuariosService.reactivar(req.params.id);
      return res.status(200).json(resultado);
    } catch (error) { next(error); }
  }
}