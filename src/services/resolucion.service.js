import prisma from '../config/db.js';
import { AppError, ERRORS } from '../utils/errors.js';

export class ResolucionService {
  static async listarPorTitulo(tituloId) {
    const titulo = await prisma.titulo.findUnique({ where: { id: tituloId } });
    if (!titulo) {
      throw new AppError(...ERRORS.TITULO_NOT_FOUND);
    }

    return await prisma.resolucion.findMany({
      where: { tituloId },
      orderBy: { fechaInicioVigencia: 'desc' },
      include: {
        _count: {
          select: {
            aniosCurriculares: true,
            inscripciones: true,
          },
        },
      },
    });
  }

  static async obtenerPorId(id) {
    const resolucion = await prisma.resolucion.findUnique({
      where: { id },
      include: {
        titulo: {
          select: { id: true, nombre: true, nivel: true },
        },
        aniosCurriculares: {
          orderBy: { numeroAnio: 'asc' },
          include: {
            materias: {
              orderBy: { codigo: 'asc' },
            },
          },
        },
        _count: {
          select: {
            inscripciones: true,
            certificados: true,
          },
        },
      },
    });

    if (!resolucion) {
      throw new AppError(...ERRORS.RESOLUCION_NOT_FOUND);
    }

    return resolucion;
  }

  static async cerrar(id) {
    const resolucion = await prisma.resolucion.findUnique({ where: { id } });
    if (!resolucion) {
      throw new AppError(...ERRORS.RESOLUCION_NOT_FOUND);
    }

    if (resolucion.estado === 'CERRADA') {
      throw new AppError(...ERRORS.RESOLUCION_CERRADA);
    }

    return await prisma.resolucion.update({
      where: { id },
      data: {
        estado: 'CERRADA',
        fechaFinVigencia: new Date(),
      },
    });
  }
}