import prisma from '../config/db.js';
import { AppError, ERRORS } from '../utils/errors.js';

const TIPOS_VALIDOS = [
  'CAMBIO_HORARIO',
  'AUSENCIA_PROGRAMADA',
  'CAMBIO_MATERIA',
  'OTRO',
];

export class SolicitudService {
  // =====================================================
  // LISTAR (con filtros)
  // =====================================================
  static async listar(filtros = {}) {
    const where = {};
    if (filtros.estado) where.estado = filtros.estado;
    if (filtros.tipo) where.tipo = filtros.tipo;
    if (filtros.alumnoId) where.alumnoId = filtros.alumnoId;
    if (filtros.profesorId) where.profesorId = filtros.profesorId;

    return await prisma.solicitud.findMany({
      where,
      include: {
        alumno:   { select: { id: true, nombre: true, apellido: true, dni: true, email: true } },
        profesor: { select: { id: true, nombre: true, apellido: true, dni: true, email: true } },
      },
      orderBy: [{ createdAt: 'desc' }],
    });
  }

  static async obtenerPorId(id) {
    const sol = await prisma.solicitud.findUnique({
      where: { id },
      include: {
        alumno:   { select: { id: true, nombre: true, apellido: true, dni: true, email: true } },
        profesor: { select: { id: true, nombre: true, apellido: true, dni: true, email: true } },
      },
    });
    if (!sol) throw new AppError(...ERRORS.SOLICITUD_NOT_FOUND);
    return sol;
  }

  static async listarPorAlumno(alumnoId) {
    const alu = await prisma.alumno.findUnique({ where: { id: alumnoId } });
    if (!alu) throw new AppError(...ERRORS.ALUMNO_NOT_FOUND);

    return await prisma.solicitud.findMany({
      where: { alumnoId },
      orderBy: [{ createdAt: 'desc' }],
    });
  }

  static async listarPorProfesor(profesorId) {
    const prof = await prisma.profesor.findUnique({ where: { id: profesorId } });
    if (!prof) throw new AppError(...ERRORS.PROFESOR_NOT_FOUND);

    return await prisma.solicitud.findMany({
      where: { profesorId },
      orderBy: [{ createdAt: 'desc' }],
    });
  }

  // =====================================================
  // CREAR
  // =====================================================
  static async crear(data) {
    const { tipo, alumnoId, profesorId, comentario } = data;

    if (!tipo || !TIPOS_VALIDOS.includes(tipo)) {
      throw new AppError('VALIDATION_ERROR', `Tipo inválido. Debe ser uno de: ${TIPOS_VALIDOS.join(', ')}.`, 400);
    }

    if (!comentario || !comentario.trim()) {
      throw new AppError('VALIDATION_ERROR', 'El comentario es obligatorio.', 400);
    }

    // Debe pertenecer a un alumno O a un profesor (exactamente uno)
    const tieneAlumno = !!alumnoId;
    const tieneProfesor = !!profesorId;

    if (tieneAlumno && tieneProfesor) {
      throw new AppError('VALIDATION_ERROR', 'La solicitud no puede ser de alumno y profesor a la vez.', 400);
    }
    if (!tieneAlumno && !tieneProfesor) {
      throw new AppError(...ERRORS.SOLICITUD_SIN_DUENIO);
    }

    if (tieneAlumno) {
      const alu = await prisma.alumno.findUnique({ where: { id: alumnoId } });
      if (!alu) throw new AppError(...ERRORS.ALUMNO_NOT_FOUND);
    }
    if (tieneProfesor) {
      const prof = await prisma.profesor.findUnique({ where: { id: profesorId } });
      if (!prof) throw new AppError(...ERRORS.PROFESOR_NOT_FOUND);
    }

    return await prisma.solicitud.create({
      data: {
        tipo,
        alumnoId: alumnoId || null,
        profesorId: profesorId || null,
        comentario: comentario.trim(),
        estado: 'PENDIENTE',
      },
      include: {
        alumno:   { select: { id: true, nombre: true, apellido: true, dni: true } },
        profesor: { select: { id: true, nombre: true, apellido: true, dni: true } },
      },
    });
  }

  // =====================================================
  // ACTUALIZAR (solo PENDIENTE)
  // =====================================================
  static async actualizar(id, data) {
    const sol = await prisma.solicitud.findUnique({ where: { id } });
    if (!sol) throw new AppError(...ERRORS.SOLICITUD_NOT_FOUND);
    if (sol.estado !== 'PENDIENTE') throw new AppError(...ERRORS.SOLICITUD_SOLO_PENDIENTE);

    const update = {};

    if (data.tipo) {
      if (!TIPOS_VALIDOS.includes(data.tipo)) throw new AppError('VALIDATION_ERROR', 'Tipo inválido.', 400);
      update.tipo = data.tipo;
    }

    if (data.comentario !== undefined) {
      if (!data.comentario || !data.comentario.trim()) {
        throw new AppError('VALIDATION_ERROR', 'El comentario no puede estar vacío.', 400);
      }
      update.comentario = data.comentario.trim();
    }

    return await prisma.solicitud.update({ where: { id }, data: update });
  }

  static async eliminar(id) {
    const sol = await prisma.solicitud.findUnique({ where: { id } });
    if (!sol) throw new AppError(...ERRORS.SOLICITUD_NOT_FOUND);
    if (sol.estado !== 'PENDIENTE') throw new AppError(...ERRORS.SOLICITUD_SOLO_PENDIENTE);

    return await prisma.solicitud.delete({ where: { id } });
  }

  // =====================================================
  // APROBAR / RECHAZAR
  // =====================================================
  static async aprobar(id, resueltoPorId, respuesta = null) {
    const sol = await prisma.solicitud.findUnique({ where: { id } });
    if (!sol) throw new AppError(...ERRORS.SOLICITUD_NOT_FOUND);
    if (sol.estado !== 'PENDIENTE') throw new AppError(...ERRORS.SOLICITUD_YA_RESUELTA);

    return await prisma.solicitud.update({
      where: { id },
      data: {
        estado: 'APROBADA',
        resueltoPor: resueltoPorId,
        respuesta: respuesta || null,
        resueltoAt: new Date(),
      },
    });
  }

  static async rechazar(id, resueltoPorId, respuesta = null) {
    const sol = await prisma.solicitud.findUnique({ where: { id } });
    if (!sol) throw new AppError(...ERRORS.SOLICITUD_NOT_FOUND);
    if (sol.estado !== 'PENDIENTE') throw new AppError(...ERRORS.SOLICITUD_YA_RESUELTA);

    return await prisma.solicitud.update({
      where: { id },
      data: {
        estado: 'RECHAZADA',
        resueltoPor: resueltoPorId,
        respuesta: respuesta || null,
        resueltoAt: new Date(),
      },
    });
  }

  // =====================================================
  // MIS SOLICITUDES (según rol del usuario logueado)
  // =====================================================
  static async misSolicitudes(user) {
    if (user.rol === 'ALUMNO' && user.alumnoId) {
      return await this.listarPorAlumno(user.alumnoId);
    }
    if (user.rol === 'PROFESOR' && user.profesorId) {
      return await this.listarPorProfesor(user.profesorId);
    }
    // ADMIN / SECRETARIA: no aplica (devuelve vacío)
    return [];
  }
}