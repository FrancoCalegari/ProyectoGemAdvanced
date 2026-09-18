import { TituloService } from '../services/titulo.service.js';

export class TituloController {
  static async crear(req, res) {
    try {
      const nuevoTitulo = await TituloService.crearTituloConResolucion(req.body);
      return res.status(201).json(nuevoTitulo);
    } catch (error) {
      if (error.code === 'P2002') {
        return res.status(409).json({ error: 'El código de resolución ya existe en el sistema.' });
      }
      return res.status(400).json({ error: error.message });
    }
  }

  static async listar(req, res) {
    try {
      const titulos = await TituloService.obtenerTodos();
      return res.status(200).json(titulos);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  static async obtenerPorId(req, res) {
    try {
      const { id } = req.params;
      const titulo = await TituloService.obtenerPorId(id);
      return res.status(200).json(titulo);
    } catch (error) {
      if (error.message === 'TITULO_NOT_FOUND') {
        return res.status(404).json({ error: 'Título no encontrado.' });
      }
      return res.status(500).json({ error: error.message });
    }
  }

  static async crearResolucion(req, res) {
    try {
      const { id } = req.params;
      const nuevaResolucion = await TituloService.agregarNuevaResolucion(id, req.body);
      return res.status(201).json(nuevaResolucion);
    } catch (error) {
      if (error.message === 'TITULO_NOT_FOUND') {
        return res.status(404).json({ error: 'Título no encontrado.' });
      }
      if (error.code === 'P2002') {
        return res.status(409).json({ error: 'El código de resolución ya existe.' });
      }
      return res.status(400).json({ error: error.message });
    }
  }
}