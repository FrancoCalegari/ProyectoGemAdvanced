import prisma from '../config/db.js';
import { AppError, ERRORS } from '../utils/errors.js';
import { AdmisionService } from './admision.service.js';

export class InscripcionService {
  static async listarPorAlumno(alumnoId) {
    const alumno = await prisma.alumno.findUnique({ where: { id: alumnoId } });
    if (!alumno) {
      throw new AppError(...ERRORS.ALUMNO_NOT_FOUND);
    }

    return await prisma.inscripcion.findMany({
      where: { alumnoId },
      include: {
        titulo: { select: { id: true, nombre: true, nivel: true } },
        resolucion: { select: { id: true, codigo: true, estado: true } },
        _count: {
          select: { cursadas: true },
        },
      },
      orderBy: { fechaInscripcion: 'desc' },
    });
  }

  static async crear(alumnoId, data) {
    const { tituloId } = data;

    if (!tituloId) {
      throw new AppError('VALIDATION_ERROR', 'Falta tituloId.', 400);
    }

    const alumno = await prisma.alumno.findUnique({ where: { id: alumnoId } });
    if (!alumno) {
      throw new AppError(...ERRORS.ALUMNO_NOT_FOUND);
    }

    const titulo = await prisma.titulo.findUnique({ where: { id: tituloId } });
    if (!titulo) {
      throw new AppError(...ERRORS.TITULO_NOT_FOUND);
    }

    const admision = await AdmisionService.evaluarAdmision(alumnoId);
    if (!admision.puedeInscribirse) {
      throw new AppError(
        'ADMISION_RECHAZADA',
        'El alumno no cumple los requisitos de admisión.',
        409,
        {
          faltantes: admision.faltantes,
          mensajes: admision.mensajes,
        }
      );
    }

    const resolucionVigente = await prisma.resolucion.findFirst({
      where: { tituloId, estado: 'VIGENTE' },
    });

    if (!resolucionVigente) {
      throw new AppError(...ERRORS.SIN_RESOLUCION_VIGENTE);
    }

    const existente = await prisma.inscripcion.findUnique({
      where: {
        alumnoId_tituloId_resolucionId: {
          alumnoId,
          tituloId,
          resolucionId: resolucionVigente.id,
        },
      },
    });

    if (existente) {
      throw new AppError(...ERRORS.INSCRIPCION_DUP);
    }

    return await prisma.inscripcion.create({
      data: {
        alumnoId,
        tituloId,
        resolucionId: resolucionVigente.id,
        fechaInscripcion: new Date(),
        estado: 'ACTIVA',
      },
      include: {
        titulo: { select: { id: true, nombre: true, nivel: true } },
        resolucion: { select: { id: true, codigo: true, estado: true } },
      },
    });
  }

  static async actualizar(id, data) {
    const inscripcion = await prisma.inscripcion.findUnique({ where: { id } });
    if (!inscripcion) {
      throw new AppError(...ERRORS.INSCRIPCION_NOT_FOUND);
    }

    if (data.estado && !['ACTIVA', 'EGRESADO', 'BAJA'].includes(data.estado)) {
      throw new AppError('VALIDATION_ERROR', 'Estado inválido.', 400);
    }

    return await prisma.inscripcion.update({
      where: { id },
      data: {
        ...(data.estado && { estado: data.estado }),
      },
      include: {
        titulo: { select: { id: true, nombre: true } },
        resolucion: { select: { id: true, codigo: true } },
      },
    });
  }
}