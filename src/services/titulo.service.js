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

  static async actualizar(id, data) {
    const titulo = await prisma.titulo.findUnique({ where: { id } });
    if (!titulo) {
      throw new AppError(...ERRORS.TITULO_NOT_FOUND);
    }

    if (data.nombre && data.nombre !== titulo.nombre) {
      const existente = await prisma.titulo.findUnique({
        where: { nombre: data.nombre },
      });
      if (existente) {
        throw new AppError(...ERRORS.TITULO_NOMBRE_DUP);
      }
    }

    return await prisma.titulo.update({
      where: { id },
      data: {
        ...(data.nombre && { nombre: data.nombre }),
        ...(data.nivel && { nivel: data.nivel }),
        ...(data.duracionAnios && { duracionAnios: data.duracionAnios }),
        ...(data.estado && { estado: data.estado }),
      },
    });
  }

  static async darDeBaja(id) {
    const titulo = await prisma.titulo.findUnique({
      where: { id },
      include: { inscripciones: true },
    });

    if (!titulo) {
      throw new AppError(...ERRORS.TITULO_NOT_FOUND);
    }

    if (titulo.inscripciones.length > 0) {
      throw new AppError(...ERRORS.TITULO_CON_INSCRIP);
    }

    return await prisma.titulo.update({
      where: { id },
      data: { estado: 'DE_BAJA' },
    });
  }
}