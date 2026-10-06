import { TituloService } from '../services/titulo.service.js';

export class TituloController {
  static async crear(req, res, next) {
    try {
      const nuevoTitulo = await TituloService.crearTituloConResolucion(req.body);
      return res.status(201).json(nuevoTitulo);
    } catch (error) {
      next(error);
    }
  }

  static async listar(req, res, next) {
    try {
      const titulos = await TituloService.obtenerTodos();
      return res.status(200).json(titulos);
    } catch (error) {
      next(error);
    }
  }

  static async obtenerPorId(req, res, next) {
    try {
      const { id } = req.params;
      const titulo = await TituloService.obtenerPorId(id);
      return res.status(200).json(titulo);
    } catch (error) {
      next(error);
    }
  }

  static async crearResolucion(req, res, next) {
    try {
      const { id } = req.params;
      const nuevaResolucion = await TituloService.agregarNuevaResolucion(id, req.body);
      return res.status(201).json(nuevaResolucion);
    } catch (error) {
      next(error);
    }
  }

  static async actualizar(req, res, next) {
    try {
      const { id } = req.params;
      const titulo = await TituloService.actualizar(id, req.body);
      return res.status(200).json(titulo);
    } catch (error) {
      next(error);
    }
  }

  static async darDeBaja(req, res, next) {
    try {
      const { id } = req.params;
      const titulo = await TituloService.darDeBaja(id);
      return res.status(200).json(titulo);
    } catch (error) {
      next(error);
    }
  }
}