import prisma from '../config/db.js';
import { AppError, ERRORS } from '../utils/errors.js';

const TURNOS_HORARIOS = {
  MANANA: { inicio: '07:00', fin: '13:00' },
  TARDE:  { inicio: '13:00', fin: '19:00' },
  NOCHE:  { inicio: '19:00', fin: '23:00' },
};

function normalizarFecha(f) {
  const d = new Date(f);
  if (isNaN(d.getTime())) return null;
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

function soloFechaStr(f) {
  return new Date(f).toISOString().split('T')[0];
}

function solapan(h1Ini, h1Fin, h2Ini, h2Fin) {
  if (!h1Ini || !h1Fin || !h2Ini || !h2Fin) return true;
  return !(h1Fin <= h2Ini || h2Fin <= h1Ini);
}

function diaSemanaDe(fecha) {
  return new Date(fecha).getUTCDay();
}

function rangoFechas(desde, hasta) {
  const fechas = [];
  let actual = new Date(desde);
  const fin = new Date(hasta);
  while (actual <= fin) {
    fechas.push(new Date(actual));
    actual.setUTCDate(actual.getUTCDate() + 1);
  }
  return fechas;
}

export class ClaseSuspendidaService {
  static async calcularClasesAfectadas(licencia) {
    const { profesorId, fechaDesde, fechaHasta, todoElDia, horaDesde, horaHasta, turno } = licencia;

    const asignaciones = await prisma.materiaProfesor.findMany({
      where: { profesorId },
      include: { materia: { select: { id: true, nombre: true, codigo: true } } },
    });

    if (asignaciones.length === 0) return [];

    let rangoIni = null, rangoFin = null;
    if (!todoElDia) {
      if (turno && TURNOS_HORARIOS[turno]) {
        rangoIni = TURNOS_HORARIOS[turno].inicio;
        rangoFin = TURNOS_HORARIOS[turno].fin;
      } else if (horaDesde && horaHasta) {
        rangoIni = horaDesde;
        rangoFin = horaHasta;
      }
    }

    const fechas = rangoFechas(fechaDesde, fechaHasta);
    const afectadas = [];

    for (const fecha of fechas) {
      const dia = diaSemanaDe(fecha);
      for (const asig of asignaciones) {
        if (asig.diaSemana !== dia) continue;
        if (!todoElDia && rangoIni && rangoFin) {
          if (!solapan(asig.horaInicio, asig.horaFin, rangoIni, rangoFin)) continue;
        }
        afectadas.push({
          materiaId: asig.materiaId,
          materia: asig.materia,
          profesorId,
          fecha: new Date(fecha),
          horaInicio: asig.horaInicio,
          horaFin: asig.horaFin,
        });
      }
    }

    return afectadas;
  }

  static async generarDesdeLicencia(licenciaId) {
    const licencia = await prisma.licencia.findUnique({ where: { id: licenciaId } });
    if (!licencia) throw new AppError(...ERRORS.LICENCIA_NOT_FOUND);
    if (licencia.estado !== 'APROBADA') throw new AppError(...ERRORS.LICENCIA_NO_APROBADA);

    const afectadas = await this.calcularClasesAfectadas(licencia);

    if (afectadas.length === 0) {
      return { licenciaId: licencia.id, totalAfectadas: 0, creadas: 0, salteadas: 0, detalle: [] };
    }

    const resultados = await prisma.$transaction(
      afectadas.map((a) =>
        prisma.claseSuspendida.upsert({
          where: {
            materiaId_profesorId_fecha_horaInicio: {
              materiaId: a.materiaId,
              profesorId: a.profesorId,
              fecha: a.fecha,
              horaInicio: a.horaInicio || null,
            },
          },
          update: {},
          create: {
            materiaId: a.materiaId,
            profesorId: a.profesorId,
            fecha: a.fecha,
            horaInicio: a.horaInicio || null,
            horaFin: a.horaFin || null,
            motivo: 'LICENCIA_PROFESOR',
            licenciaId: licencia.id,
          },
        })
      )
    );

    let creadas = 0, salteadas = 0;
    const ahora = Date.now();
    for (const r of resultados) {
      const t = new Date(r.createdAt).getTime();
      if (Math.abs(ahora - t) < 5000) creadas++; else salteadas++;
    }

    return {
      licenciaId: licencia.id,
      totalAfectadas: afectadas.length,
      creadas,
      salteadas,
      detalle: resultados.map((r) => ({
        id: r.id,
        materiaId: r.materiaId,
        fecha: soloFechaStr(r.fecha),
        horaInicio: r.horaInicio,
        horaFin: r.horaFin,
      })),
    };
  }

  static async listar(filtros = {}) {
    const where = {};
    if (filtros.profesorId) where.profesorId = filtros.profesorId;
    if (filtros.materiaId) where.materiaId = filtros.materiaId;
    if (filtros.motivo) where.motivo = filtros.motivo;
    if (filtros.licenciaId) where.licenciaId = filtros.licenciaId;
    if (filtros.desde || filtros.hasta) {
      where.fecha = {};
      if (filtros.desde) where.fecha.gte = normalizarFecha(filtros.desde);
      if (filtros.hasta) where.fecha.lte = normalizarFecha(filtros.hasta);
    }

    return await prisma.claseSuspendida.findMany({
      where,
      include: {
        materia: { select: { id: true, nombre: true, codigo: true } },
        profesor: { select: { id: true, nombre: true, apellido: true } },
        reasignaciones: {
          include: { profesorDestino: { select: { id: true, nombre: true, apellido: true } } },
        },
      },
      orderBy: [{ fecha: 'desc' }, { horaInicio: 'asc' }],
    });
  }

  static async obtenerPorId(id) {
    const clase = await prisma.claseSuspendida.findUnique({
      where: { id },
      include: {
        materia: { select: { id: true, nombre: true, codigo: true } },
        profesor: { select: { id: true, nombre: true, apellido: true } },
        licencia: { select: { id: true, tipo: true, fechaDesde: true, fechaHasta: true } },
        reasignaciones: {
          include: { profesorDestino: { select: { id: true, nombre: true, apellido: true } } },
        },
      },
    });
    if (!clase) throw new AppError(...ERRORS.CLASE_SUSPENDIDA_NOT_FOUND);
    return clase;
  }

  static async eliminar(id) {
    const clase = await prisma.claseSuspendida.findUnique({ where: { id } });
    if (!clase) throw new AppError(...ERRORS.CLASE_SUSPENDIDA_NOT_FOUND);
    return await prisma.claseSuspendida.delete({ where: { id } });
  }

  static async crearManual(data) {
    const { materiaId, profesorId, fecha, horaInicio, horaFin, motivo, observaciones } = data;
    if (!materiaId || !profesorId || !fecha || !motivo) {
      throw new AppError('VALIDATION_ERROR', 'Faltan materiaId, profesorId, fecha o motivo.', 400);
    }
    if (!['LICENCIA_PROFESOR', 'FERIADO', 'PARO', 'CLIMA', 'OTRO'].includes(motivo)) {
      throw new AppError('VALIDATION_ERROR', 'Motivo inválido.', 400);
    }

    const materia = await prisma.materia.findUnique({ where: { id: materiaId } });
    if (!materia) throw new AppError(...ERRORS.MATERIA_NOT_FOUND);

    const prof = await prisma.profesor.findUnique({ where: { id: profesorId } });
    if (!prof) throw new AppError(...ERRORS.PROFESOR_NOT_FOUND);

    return await prisma.claseSuspendida.create({
      data: {
        materiaId, profesorId,
        fecha: normalizarFecha(fecha),
        horaInicio: horaInicio || null,
        horaFin: horaFin || null,
        motivo,
        observaciones: observaciones || null,
      },
    });
  }

  static async reasignar(claseId, data, creadoPorId) {
    const { profesorDestinoId, observaciones } = data;
    if (!profesorDestinoId) throw new AppError('VALIDATION_ERROR', 'Falta profesorDestinoId.', 400);

    const clase = await prisma.claseSuspendida.findUnique({ where: { id: claseId } });
    if (!clase) throw new AppError(...ERRORS.CLASE_SUSPENDIDA_NOT_FOUND);

    const destino = await prisma.profesor.findUnique({ where: { id: profesorDestinoId } });
    if (!destino) throw new AppError(...ERRORS.PROFESOR_NOT_FOUND);

    if (destino.id === clase.profesorId) {
      throw new AppError('VALIDATION_ERROR', 'No se puede reasignar al mismo profesor.', 400);
    }

    const existente = await prisma.reasignacion.findUnique({
      where: {
        claseSuspendidaId_profesorDestinoId: {
          claseSuspendidaId: claseId,
          profesorDestinoId,
        },
      },
    });
    if (existente) throw new AppError(...ERRORS.REASIGNACION_DUP);

    return await prisma.reasignacion.create({
      data: {
        claseSuspendidaId: claseId,
        profesorOrigenId: clase.profesorId,
        profesorDestinoId,
        observaciones: observaciones || null,
        createdBy: creadoPorId || null,
      },
      include: {
        profesorOrigen: { select: { id: true, nombre: true, apellido: true } },
        profesorDestino: { select: { id: true, nombre: true, apellido: true } },
      },
    });
  }

  static async eliminarReasignacion(reasignacionId) {
    const r = await prisma.reasignacion.findUnique({ where: { id: reasignacionId } });
    if (!r) throw new AppError(...ERRORS.REASIGNACION_NOT_FOUND);
    return await prisma.reasignacion.delete({ where: { id: reasignacionId } });
  }

  static async resumenPorRango(desde, hasta) {
    const where = {};
    if (desde || hasta) {
      where.fecha = {};
      if (desde) where.fecha.gte = normalizarFecha(desde);
      if (hasta) where.fecha.lte = normalizarFecha(hasta);
    }

    const clases = await prisma.claseSuspendida.findMany({ where });
    const porMotivo = {};
    for (const c of clases) porMotivo[c.motivo] = (porMotivo[c.motivo] || 0) + 1;

    return { total: clases.length, porMotivo };
  }
}