import prisma from '../config/db.js';
import { AppError, ERRORS } from '../utils/errors.js';

export class EquivalenciaService {
  static async listar(filtros = {}) {
    const where = {};
    if (filtros.materiaOrigenId) where.materiaOrigenId = filtros.materiaOrigenId;
    if (filtros.materiaDestinoId) where.materiaDestinoId = filtros.materiaDestinoId;

    return await prisma.equivalencia.findMany({
      where,
      include: {
        materiaOrigen: {
          select: {
            id: true,
            nombre: true,
            codigo: true,
            anioCurricular: {
              select: {
                numeroAnio: true,
                resolucion: { select: { id: true, codigo: true, tituloId: true } },
              },
            },
          },
        },
        materiaDestino: {
          select: {
            id: true,
            nombre: true,
            codigo: true,
            anioCurricular: {
              select: {
                numeroAnio: true,
                resolucion: { select: { id: true, codigo: true, tituloId: true } },
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  static async listarPorMateria(materiaId) {
    const materia = await prisma.materia.findUnique({ where: { id: materiaId } });
    if (!materia) {
      throw new AppError(...ERRORS.MATERIA_NOT_FOUND);
    }

    return await prisma.equivalencia.findMany({
      where: {
        OR: [
          { materiaOrigenId: materiaId },
          { materiaDestinoId: materiaId },
        ],
      },
      include: {
        materiaOrigen: {
          select: {
            id: true,
            nombre: true,
            codigo: true,
            anioCurricular: {
              select: {
                numeroAnio: true,
                resolucion: { select: { id: true, codigo: true, tituloId: true } },
              },
            },
          },
        },
        materiaDestino: {
          select: {
            id: true,
            nombre: true,
            codigo: true,
            anioCurricular: {
              select: {
                numeroAnio: true,
                resolucion: { select: { id: true, codigo: true, tituloId: true } },
              },
            },
          },
        },
      },
    });
  }

  static async crear(data) {
    const { materiaOrigenId, materiaDestinoId, observaciones } = data;

    if (!materiaOrigenId || !materiaDestinoId) {
      throw new AppError('VALIDATION_ERROR', 'Faltan materiaOrigenId o materiaDestinoId.', 400);
    }

    if (materiaOrigenId === materiaDestinoId) {
      throw new AppError('EQUIVALENCIA_MISMA_MATERIA', 'Una materia no puede ser equivalente a sí misma.', 400);
    }

    const origen = await prisma.materia.findUnique({ where: { id: materiaOrigenId } });
    if (!origen) {
      throw new AppError(...ERRORS.MATERIA_NOT_FOUND);
    }

    const destino = await prisma.materia.findUnique({ where: { id: materiaDestinoId } });
    if (!destino) {
      throw new AppError(...ERRORS.MATERIA_NOT_FOUND);
    }

    const existente = await prisma.equivalencia.findUnique({
      where: {
        materiaOrigenId_materiaDestinoId: {
          materiaOrigenId,
          materiaDestinoId,
        },
      },
    });
    if (existente) {
      throw new AppError('EQUIVALENCIA_DUPLICADA', 'Esa equivalencia ya existe.', 409);
    }

    return await prisma.equivalencia.create({
      data: {
        materiaOrigenId,
        materiaDestinoId,
        observaciones: observaciones || null,
      },
      include: {
        materiaOrigen: { select: { id: true, nombre: true, codigo: true } },
        materiaDestino: { select: { id: true, nombre: true, codigo: true } },
      },
    });
  }

  static async eliminar(id) {
    const equivalencia = await prisma.equivalencia.findUnique({ where: { id } });
    if (!equivalencia) {
      throw new AppError('EQUIVALENCIA_NOT_FOUND', 'Equivalencia no encontrada.', 404);
    }

    return await prisma.equivalencia.delete({ where: { id } });
  }
}