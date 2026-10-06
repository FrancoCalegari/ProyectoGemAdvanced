import prisma from '../config/db.js';
import { AppError, ERRORS } from '../utils/errors.js';

const ESTADOS_VALIDOS = ['PRESENTE', 'AUSENTE', 'JUSTIFICADO'];

export class AsistenciaService {
  // ----------------------------------------------------------
  // Registrar o actualizar una asistencia (por cursada + fecha)
  // ----------------------------------------------------------
  static async registrar(cursadaId, data) {
    const { fecha, estado, observaciones } = data;

    if (!fecha) {
      throw new AppError('VALIDATION_ERROR', 'Falta la fecha.', 400);
    }

    if (!estado || !ESTADOS_VALIDOS.includes(estado)) {
      throw new AppError(
        'VALIDATION_ERROR',
        `Estado inválido. Debe ser uno de: ${ESTADOS_VALIDOS.join(', ')}.`,
        400
      );
    }

    const cursada = await prisma.cursadaMateria.findUnique({
      where: { id: cursadaId },
      include: { materia: true },
    });

    if (!cursada) {
      throw new AppError(...ERRORS.CURSADA_NOT_FOUND);
    }

    const fechaNorm = new Date(fecha);
    fechaNorm.setHours(0, 0, 0, 0);

    // Upsert: si ya existe asistencia para (cursada, fecha), la actualiza
    const asistencia = await prisma.asistencia.upsert({
      where: {
        cursadaId_fecha: {
          cursadaId,
          fecha: fechaNorm,
        },
      },
      update: {
        estado,
        observaciones: observaciones || null,
      },
      create: {
        cursadaId,
        fecha: fechaNorm,
        estado,
        observaciones: observaciones || null,
      },
    });

    return asistencia;
  }

  // ----------------------------------------------------------
  // Carga masiva de asistencias para una fecha
  // ----------------------------------------------------------
  static async registrarMasivo(cursadaId, data) {
    const { fecha, asistencias } = data;

    if (!fecha) {
      throw new AppError('VALIDATION_ERROR', 'Falta la fecha.', 400);
    }
    if (!Array.isArray(asistencias) || asistencias.length === 0) {
      throw new AppError('VALIDATION_ERROR', 'Falta el array de asistencias.', 400);
    }

    const cursada = await prisma.cursadaMateria.findUnique({ where: { id: cursadaId } });
    if (!cursada) {
      throw new AppError(...ERRORS.CURSADA_NOT_FOUND);
    }

    const fechaNorm = new Date(fecha);
    fechaNorm.setHours(0, 0, 0, 0);

    const resultados = await prisma.$transaction(
      asistencias.map((a) => {
        if (!ESTADOS_VALIDOS.includes(a.estado)) {
          throw new AppError(
            'VALIDATION_ERROR',
            `Estado inválido en item ${a.cursadaId}: ${a.estado}`,
            400
          );
        }
        return prisma.asistencia.upsert({
          where: {
            cursadaId_fecha: {
              cursadaId: a.cursadaId,
              fecha: fechaNorm,
            },
          },
          update: { estado: a.estado, observaciones: a.observaciones || null },
          create: {
            cursadaId: a.cursadaId,
            fecha: fechaNorm,
            estado: a.estado,
            observaciones: a.observaciones || null,
          },
        });
      })
    );

    return resultados;
  }

  // ----------------------------------------------------------
  // Listar asistencias de una cursada
  // ----------------------------------------------------------
  static async listarPorCursada(cursadaId) {
    const cursada = await prisma.cursadaMateria.findUnique({ where: { id: cursadaId } });
    if (!cursada) {
      throw new AppError(...ERRORS.CURSADA_NOT_FOUND);
    }

    return await prisma.asistencia.findMany({
      where: { cursadaId },
      orderBy: { fecha: 'asc' },
    });
  }

  // ----------------------------------------------------------
  // Listar asistencias por rango de fechas
  // ----------------------------------------------------------
  static async listarPorRango(cursadaId, desde, hasta) {
    const cursada = await prisma.cursadaMateria.findUnique({ where: { id: cursadaId } });
    if (!cursada) {
      throw new AppError(...ERRORS.CURSADA_NOT_FOUND);
    }

    const where = { cursadaId };
    if (desde || hasta) {
      where.fecha = {};
      if (desde) where.fecha.gte = new Date(desde);
      if (hasta) where.fecha.lte = new Date(hasta);
    }

    return await prisma.asistencia.findMany({
      where,
      orderBy: { fecha: 'asc' },
    });
  }

  // ----------------------------------------------------------
  // Resumen / estadísticas de asistencia de una cursada
  // ----------------------------------------------------------
  static async resumen(cursadaId) {
    const cursada = await prisma.cursadaMateria.findUnique({
      where: { id: cursadaId },
      include: {
        materia: { select: { id: true, nombre: true, codigo: true } },
      },
    });
    if (!cursada) {
      throw new AppError(...ERRORS.CURSADA_NOT_FOUND);
    }

    const asistencias = await prisma.asistencia.findMany({
      where: { cursadaId },
      orderBy: { fecha: 'asc' },
    });

    const total = asistencias.length;
    const presentes = asistencias.filter((a) => a.estado === 'PRESENTE').length;
    const ausentes = asistencias.filter((a) => a.estado === 'AUSENTE').length;
    const justificados = asistencias.filter((a) => a.estado === 'JUSTIFICADO').length;

    // Porcentaje: PRESENTE + JUSTIFICADO cuentan como asistencia efectiva
    const efectivas = presentes + justificados;
    const porcentajeAsistencia = total > 0 ? Math.round((efectivas / total) * 100) : 0;

    return {
      cursadaId,
      materia: cursada.materia,
      total,
      presentes,
      ausentes,
      justificados,
      efectivas,
      porcentajeAsistencia,
    };
  }

  // ----------------------------------------------------------
  // Eliminar una asistencia
  // ----------------------------------------------------------
  static async eliminar(id) {
    const asistencia = await prisma.asistencia.findUnique({ where: { id } });
    if (!asistencia) {
      throw new AppError('ASISTENCIA_NOT_FOUND', 'Asistencia no encontrada.', 404);
    }
    return await prisma.asistencia.delete({ where: { id } });
  }
}