import prisma from '../config/db.js';
import { AppError, ERRORS } from '../utils/errors.js';

export class CorrelatividadService {
  static async listarPorMateria(materiaId) {
    const materia = await prisma.materia.findUnique({ where: { id: materiaId } });
    if (!materia) {
      throw new AppError(...ERRORS.MATERIA_NOT_FOUND);
    }

    return await prisma.correlatividad.findMany({
      where: { materiaId },
      include: {
        materiaRequerida: {
          select: {
            id: true,
            nombre: true,
            codigo: true,
            anioCurricular: {
              select: { numeroAnio: true, nombre: true },
            },
          },
        },
      },
      orderBy: { tipo: 'asc' },
    });
  }

  static async crear(materiaId, data) {
    const { materiaRequeridaId, tipo } = data;

    if (!materiaRequeridaId || !tipo) {
      throw new AppError('VALIDATION_ERROR', 'Faltan materiaRequeridaId o tipo.', 400);
    }

    if (tipo !== 'PARA_CURSAR' && tipo !== 'PARA_RENDIR_FINAL') {
      throw new AppError('VALIDATION_ERROR', 'El tipo debe ser PARA_CURSAR o PARA_RENDIR_FINAL.', 400);
    }

    if (materiaId === materiaRequeridaId) {
      throw new AppError(...ERRORS.CORRELATIVA_MISMA_MATERIA);
    }

    const materia = await prisma.materia.findUnique({
      where: { id: materiaId },
      include: { anioCurricular: true },
    });
    if (!materia) {
      throw new AppError(...ERRORS.MATERIA_NOT_FOUND);
    }

    const materiaRequerida = await prisma.materia.findUnique({
      where: { id: materiaRequeridaId },
      include: { anioCurricular: true },
    });
    if (!materiaRequerida) {
      throw new AppError(...ERRORS.MATERIA_NOT_FOUND);
    }

    if (materia.anioCurricular.resolucionId !== materiaRequerida.anioCurricular.resolucionId) {
      throw new AppError(...ERRORS.CORRELATIVA_DISTINTA_RES);
    }

    const existente = await prisma.correlatividad.findUnique({
      where: {
        materiaId_materiaRequeridaId_tipo: {
          materiaId,
          materiaRequeridaId,
          tipo,
        },
      },
    });
    if (existente) {
      throw new AppError(...ERRORS.CORRELATIVA_DUPLICADA);
    }

    const hayCiclo = await this.detectaCiclo(materiaRequeridaId, materiaId);
    if (hayCiclo) {
      throw new AppError(...ERRORS.CORRELATIVA_CICLO);
    }

    return await prisma.correlatividad.create({
      data: {
        materiaId,
        materiaRequeridaId,
        tipo,
      },
      include: {
        materiaRequerida: {
          select: { id: true, nombre: true, codigo: true },
        },
      },
    });
  }

  static async eliminar(id) {
    const correlatividad = await prisma.correlatividad.findUnique({ where: { id } });
    if (!correlatividad) {
      throw new AppError(...ERRORS.CORRELATIVA_NOT_FOUND);
    }

    return await prisma.correlatividad.delete({ where: { id } });
  }

  static async detectaCiclo(materiaOrigenId, materiaDestinoId) {
    const visitados = new Set();
    const cola = [materiaOrigenId];

    while (cola.length > 0) {
      const actual = cola.shift();

      if (actual === materiaDestinoId) {
        return true;
      }

      if (visitados.has(actual)) {
        continue;
      }
      visitados.add(actual);

      const correlativas = await prisma.correlatividad.findMany({
        where: { materiaId: actual },
        select: { materiaRequeridaId: true },
      });

      for (const c of correlativas) {
        if (!visitados.has(c.materiaRequeridaId)) {
          cola.push(c.materiaRequeridaId);
        }
      }
    }

    return false;
  }
}