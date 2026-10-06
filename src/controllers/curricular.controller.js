import { CurricularService } from '../services/curricular.service.js';

export class CurricularController {
  static async crearAnio(req, res, next) {
    try {
      const { resolucionId } = req.params;
      const anio = await CurricularService.crearAnioCurricular(resolucionId, req.body);
      return res.status(201).json(anio);
    } catch (error) {
      next(error);
    }
  }

  static async crearMateria(req, res, next) {
    try {
      const { anioId } = req.params;
      const materia = await CurricularService.crearMateria(anioId, req.body);
      return res.status(201).json(materia);
    } catch (error) {
      next(error);
    }
  }

  static async obtenerPlan(req, res, next) {
    try {
      const { resolucionId } = req.params;
      const plan = await CurricularService.obtenerPlanPorResolucion(resolucionId);
      return res.status(200).json(plan);
    } catch (error) {
      next(error);
    }
  }

  static async listarMateriasDeAnio(req, res, next) {
    try {
      const { id } = req.params;
      const materias = await CurricularService.listarMateriasDeAnio(id);
      return res.status(200).json(materias);
    } catch (error) {
      next(error);
    }
  }

  static async obtenerMateriaPorId(req, res, next) {
    try {
      const { id } = req.params;
      const materia = await CurricularService.obtenerMateriaPorId(id);
      return res.status(200).json(materia);
    } catch (error) {
      next(error);
    }
  }

  static async actualizarMateria(req, res, next) {
    try {
      const { id } = req.params;
      const materia = await CurricularService.actualizarMateria(id, req.body);
      return res.status(200).json(materia);
    } catch (error) {
      next(error);
    }
  }

  static async eliminarMateria(req, res, next) {
    try {
      const { id } = req.params;
      await CurricularService.eliminarMateria(id);
      return res.status(204).send();
    } catch (error) {
      next(error);
    }
  }

  // ============================================================
  // Listar TODAS las materias (para selects)
  // ============================================================
  static async listarTodasLasMaterias(req, res, next) {
    try {
      const materias = await CurricularService.listarTodasLasMaterias();
      return res.status(200).json(materias);
    } catch (error) { next(error); }
  }

  // ============================================================
  // Listar aulas disponibles (hardcoded por ahora)
  // ============================================================
  static async listarAulas(req, res, next) {
    try {
      const aulas = [
        'Aula 1', 'Aula 2', 'Aula 3', 'Aula 4', 'Aula 5', 'Aula 6',
        'Aula 7', 'Aula 8', 'Aula 9', 'Aula 10',
        'Aula Magna',
        'Laboratorio 1', 'Laboratorio 2', 'Laboratorio 3',
        'Biblioteca', 'SUM', 'Gimnasio',
        'Taller 1', 'Taller 2',
      ];
      return res.status(200).json(aulas);
    } catch (error) { next(error); }
  }
  static async listarCursadasDeMateria(req, res, next) {
    try {
      const { id } = req.params;
      const cursadas = await CurricularService.listarCursadasDeMateria(id);
      return res.status(200).json(cursadas);
    } catch (error) { next(error); }
  }
}