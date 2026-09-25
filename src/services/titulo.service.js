// ============================================================
// SERVICIO DE TÍTULOS
// ============================================================

import prisma from '../config/db.js';
import { AppError, ERRORS } from '../utils/errors.js';

export class TituloService {
  static async crearTituloConResolucion(data) {
    const { nombre, nivel, duracionAnios, resolucion } = data;

    const existente = await prisma.titulo.findUnique({ where: { nombre } });
    if (existente) {
      throw new AppError(...ERRORS.TITULO_NOMBRE_DUP);
    }

    const codigoExiste = await prisma.resolucion.findUnique({
      where: { codigo: resolucion.codigo },
    });
    if (codigoExiste) {
      throw new AppError(...ERRORS.RESOLUCION_CODIGO_DUP);
    }

    return await prisma.$transaction(async (tx) => {
      const nuevoTitulo = await tx.titulo.create({
        data: {
          nombre,
          nivel,
          duracionAnios,
          estado: 'ACTIVO',
        },
      });

      const nuevaResolucion = await tx.resolucion.create({
        data: {
          tituloId: nuevoTitulo.id,
          numero: resolucion.numero,
          anioCreacion: resolucion.anioCreacion,
          codigo: resolucion.codigo,
          fechaInicioVigencia: new Date(resolucion.fechaInicioVigencia),
          estado: 'VIGENTE',
          observaciones: resolucion.observaciones || null,
        },
      });

      return {
        ...nuevoTitulo,
        resolucionVigente: nuevaResolucion,
      };
    });
  }

  static async obtenerTodos() {
    return await prisma.titulo.findMany({
      include: {
        resoluciones: {
          orderBy: { fechaInicioVigencia: 'desc' },
        },
      },
      orderBy: { nombre: 'asc' },
    });
  }

  static async obtenerPorId(id) {
    const titulo = await prisma.titulo.findUnique({
      where: { id },
      include: {
        resoluciones: {
          include: {
            aniosCurriculares: {
              include: { materias: true },
            },
          },
        },
      },
    });

    if (!titulo) {
      throw new AppError(...ERRORS.TITULO_NOT_FOUND);
    }

    return titulo;
  }

  static async agregarNuevaResolucion(tituloId, data) {
    return await prisma.$transaction(async (tx) => {
      const titulo = await tx.titulo.findUnique({ where: { id: tituloId } });
      if (!titulo) {
        throw new AppError(...ERRORS.TITULO_NOT_FOUND);
      }

      const codigoExiste = await tx.resolucion.findUnique({
        where: { codigo: data.codigo },
      });
      if (codigoExiste) {
        throw new AppError(...ERRORS.RESOLUCION_CODIGO_DUP);
      }

      const fechaInicio = new Date(data.fechaInicioVigencia);

      const resolucionVigente = await tx.resolucion.findFirst({
        where: {
          tituloId,
          estado: 'VIGENTE',
        },
      });

      if (resolucionVigente) {
        await tx.resolucion.update({
          where: { id: resolucionVigente.id },
          data: {
            estado: 'CERRADA',
            fechaFinVigencia: fechaInicio,
          },
        });
      }

      const nuevaResolucion = await tx.resolucion.create({
        data: {
          tituloId,
          numero: data.numero,
          anioCreacion: data.anioCreacion,
          codigo: data.codigo,
          fechaInicioVigencia: fechaInicio,
          estado: 'VIGENTE',
          observaciones: data.observaciones || null,
        },
      });

      return nuevaResolucion;
    });
  }
}