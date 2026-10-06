import prisma from '../config/db.js';
import { AppError, ERRORS } from '../utils/errors.js';

const DIAS = { 1: 'Lunes', 2: 'Martes', 3: 'Miércoles', 4: 'Jueves', 5: 'Viernes', 6: 'Sábado', 7: 'Domingo' };
const HORA_RE = /^([01]\d|2[0-3]):[0-5]\d$/;

function hoy() {
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

function fecha(f) {
  const d = new Date(f);
  if (isNaN(d.getTime())) return null;
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

function dia(n) {
  return DIAS[Number(n)] || `Día ${n}`;
}

// Foto del horario para guardar en el historial de modificaciones
function snapshot(h) {
  return {
    diaSemana: h.diaSemana,
    dia: dia(h.diaSemana),
    horaInicio: h.horaInicio,
    horaFin: h.horaFin,
    sector: h.sector || null,
    vigenteDesde: h.vigenteDesde ? new Date(h.vigenteDesde).toISOString().slice(0, 10) : null,
    vigenteHasta: h.vigenteHasta ? new Date(h.vigenteHasta).toISOString().slice(0, 10) : null,
    activo: h.activo,
  };
}

function etiqueta(h) {
  return `${dia(h.diaSemana)} ${h.horaInicio}-${h.horaFin}${h.sector ? ` (${h.sector})` : ''}`;
}

function validar(data, { parcial = false } = {}) {
  const out = {};

  if (data.diaSemana !== undefined) {
    const n = Number(data.diaSemana);
    if (!Number.isInteger(n) || n < 1 || n > 7) {
      throw new AppError('VALIDATION_ERROR', 'diaSemana debe ser un número del 1 (lunes) al 7 (domingo).', 400);
    }
    out.diaSemana = n;
  } else if (!parcial) {
    throw new AppError('VALIDATION_ERROR', 'Falta diaSemana.', 400);
  }

  if (data.horaInicio !== undefined) {
    if (!HORA_RE.test(String(data.horaInicio))) {
      throw new AppError('VALIDATION_ERROR', 'horaInicio debe tener formato HH:MM.', 400);
    }
    out.horaInicio = String(data.horaInicio);
  } else if (!parcial) {
    throw new AppError('VALIDATION_ERROR', 'Falta horaInicio.', 400);
  }

  if (data.horaFin !== undefined) {
    if (!HORA_RE.test(String(data.horaFin))) {
      throw new AppError('VALIDATION_ERROR', 'horaFin debe tener formato HH:MM.', 400);
    }
    out.horaFin = String(data.horaFin);
  } else if (!parcial) {
    throw new AppError('VALIDATION_ERROR', 'Falta horaFin.', 400);
  }

  if (data.sector !== undefined) out.sector = data.sector || null;
  if (data.vigenteDesde !== undefined) {
    const f = fecha(data.vigenteDesde);
    if (!f) throw new AppError('VALIDATION_ERROR', 'vigenteDesde inválida.', 400);
    out.vigenteDesde = f;
  }
  if (data.motivo !== undefined) out.motivo = data.motivo || null;

  return out;
}

export class HorarioTrabajoService {
  static async listarPorEmpleado(empleadoId, { soloVigentes = false, soloHistorial = false } = {}) {
    const where = { empleadoId };
    if (soloVigentes) where.activo = true;
    if (soloHistorial) {
      where.OR = [{ activo: false }, { vigenteHasta: { not: null } }];
    }

    return await prisma.horarioTrabajo.findMany({
      where,
      orderBy: [{ activo: 'desc' }, { diaSemana: 'asc' }, { horaInicio: 'asc' }],
    });
  }

  static async obtenerPorId(id) {
    const horario = await prisma.horarioTrabajo.findUnique({ where: { id } });
    if (!horario) throw new AppError(...ERRORS.HORARIO_NOT_FOUND);
    return horario;
  }

  static async crear(empleadoId, data, cambiadoPorId = null) {
    const empleado = await prisma.empleado.findUnique({ where: { id: empleadoId } });
    if (!empleado) throw new AppError(...ERRORS.EMPLEADO_NOT_FOUND);

    const limpio = validar(data);
    if (limpio.horaInicio >= limpio.horaFin) {
      throw new AppError('VALIDATION_ERROR', 'La hora de inicio debe ser anterior a la de fin.', 400);
    }

    const duplicado = await prisma.horarioTrabajo.findFirst({
      where: {
        empleadoId,
        diaSemana: limpio.diaSemana,
        horaInicio: limpio.horaInicio,
        activo: true,
      },
    });
    if (duplicado) throw new AppError(...ERRORS.HORARIO_DUP);

    const horario = await prisma.horarioTrabajo.create({
      data: {
        empleadoId,
        diaSemana: limpio.diaSemana,
        horaInicio: limpio.horaInicio,
        horaFin: limpio.horaFin,
        sector: limpio.sector ?? empleado.sector ?? null,
        vigenteDesde: limpio.vigenteDesde || hoy(),
        activo: true,
      },
    });

    await prisma.modificacionHorario.create({
      data: {
        horarioId: horario.id,
        empleadoId,
        tipo: 'ALTA',
        detalle: `Se asignó el turno ${etiqueta(horario)}`,
        valorAnterior: null,
        valorNuevo: snapshot(horario),
        motivo: data.motivo || null,
        cambiadoPorId,
      },
    });

    return horario;
  }

  static async actualizar(id, data, cambiadoPorId = null) {
    const actual = await HorarioTrabajoService.obtenerPorId(id);
    const limpio = validar(data, { parcial: true });

    const nuevo = {
      ...actual,
      ...(limpio.diaSemana !== undefined && { diaSemana: limpio.diaSemana }),
      ...(limpio.horaInicio !== undefined && { horaInicio: limpio.horaInicio }),
      ...(limpio.horaFin !== undefined && { horaFin: limpio.horaFin }),
      ...(limpio.sector !== undefined && { sector: limpio.sector }),
      ...(limpio.vigenteDesde !== undefined && { vigenteDesde: limpio.vigenteDesde }),
    };

    if (nuevo.horaInicio >= nuevo.horaFin) {
      throw new AppError('VALIDATION_ERROR', 'La hora de inicio debe ser anterior a la de fin.', 400);
    }
    if (
      nuevo.diaSemana !== actual.diaSemana ||
      nuevo.horaInicio !== actual.horaInicio
    ) {
      const duplicado = await prisma.horarioTrabajo.findFirst({
        where: {
          empleadoId: actual.empleadoId,
          diaSemana: nuevo.diaSemana,
          horaInicio: nuevo.horaInicio,
          activo: true,
          NOT: { id: actual.id },
        },
      });
      if (duplicado) throw new AppError(...ERRORS.HORARIO_DUP);
    }

    const cambios = [];
    if (nuevo.diaSemana !== actual.diaSemana) {
      cambios.push(`día: ${dia(actual.diaSemana)} → ${dia(nuevo.diaSemana)}`);
    }
    if (nuevo.horaInicio !== actual.horaInicio || nuevo.horaFin !== actual.horaFin) {
      cambios.push(`horario: ${actual.horaInicio}-${actual.horaFin} → ${nuevo.horaInicio}-${nuevo.horaFin}`);
    }
    if ((nuevo.sector || null) !== (actual.sector || null)) {
      cambios.push(`sector: ${actual.sector || 'sin asignar'} → ${nuevo.sector || 'sin asignar'}`);
    }

    const actualizado = await prisma.horarioTrabajo.update({
      where: { id },
      data: {
        ...(limpio.diaSemana !== undefined && { diaSemana: limpio.diaSemana }),
        ...(limpio.horaInicio !== undefined && { horaInicio: limpio.horaInicio }),
        ...(limpio.horaFin !== undefined && { horaFin: limpio.horaFin }),
        ...(limpio.sector !== undefined && { sector: limpio.sector }),
        ...(limpio.vigenteDesde !== undefined && { vigenteDesde: limpio.vigenteDesde }),
      },
    });

    if (cambios.length > 0) {
      await prisma.modificacionHorario.create({
        data: {
          horarioId: id,
          empleadoId: actual.empleadoId,
          tipo: 'CAMBIO',
          detalle: `Turno modificado (${etiqueta(actual)}): ${cambios.join('; ')}`,
          valorAnterior: snapshot(actual),
          valorNuevo: snapshot(actualizado),
          motivo: data.motivo || null,
          cambiadoPorId,
        },
      });
    }

    return actualizado;
  }

  // Baja lógica del turno: se cierra la vigencia y queda en el historial
  static async eliminar(id, cambiadoPorId = null, motivo = null) {
    const actual = await HorarioTrabajoService.obtenerPorId(id);

    const actualizado = await prisma.horarioTrabajo.update({
      where: { id },
      data: { activo: false, vigenteHasta: actual.vigenteHasta || hoy() },
    });

    await prisma.modificacionHorario.create({
      data: {
        horarioId: id,
        empleadoId: actual.empleadoId,
        tipo: 'BAJA',
        detalle: `Se dio de baja el turno ${etiqueta(actual)}`,
        valorAnterior: snapshot(actual),
        valorNuevo: snapshot(actualizado),
        motivo,
        cambiadoPorId,
      },
    });

    return actualizado;
  }

  // =========================================================
  // Historial de modificaciones (lo que ve el celador)
  // =========================================================
  static async listarModificaciones(empleadoId, { soloNoVistas = false, limite = null } = {}) {
    return await prisma.modificacionHorario.findMany({
      where: { empleadoId, ...(soloNoVistas && { visto: false }) },
      orderBy: { createdAt: 'desc' },
      ...(limite ? { take: limite } : {}),
      include: { cambiadoPor: { select: { nombre: true, apellido: true, rol: true } } },
    });
  }

  static async marcarVistas(empleadoId, ids = null) {
    const where = { empleadoId, visto: false };
    if (Array.isArray(ids) && ids.length > 0) where.id = { in: ids };

    const res = await prisma.modificacionHorario.updateMany({
      where,
      data: { visto: true, vistoAt: new Date() },
    });

    return { marcadas: res.count };
  }
}
