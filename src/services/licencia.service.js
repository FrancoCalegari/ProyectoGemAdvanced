import prisma from '../config/db.js';
import { AppError, ERRORS } from '../utils/errors.js';
import { ClaseSuspendidaService } from './claseSuspendida.service.js';

const TIPOS_VALIDOS = [
  'ENFERMEDAD',
  'RAZON_PARTICULAR',
  'ESTUDIOS_FEMENINOS',
  'DONACION_SANGRE',
  'ACCIDENTE_LABORAL',
  'OTRO',
];

const TURNOS_VALIDOS = ['MANANA', 'TARDE', 'NOCHE'];

function normalizarFecha(f) {
  const d = new Date(f);
  if (isNaN(d.getTime())) return null;
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

export class LicenciaService {
  // =====================================================
  // LISTAR (con filtros)
  // =====================================================
  static async listar(filtros = {}) {
    const where = {};
    if (filtros.estado) where.estado = filtros.estado;
    if (filtros.tipo) where.tipo = filtros.tipo;
    if (filtros.profesorId) where.profesorId = filtros.profesorId;

    if (filtros.desde || filtros.hasta) {
      where.fechaDesde = {};
      if (filtros.desde) where.fechaDesde.gte = normalizarFecha(filtros.desde);
      if (filtros.hasta) where.fechaHasta = { lte: normalizarFecha(filtros.hasta) };
    }

    return await prisma.licencia.findMany({
      where,
      include: {
        profesor: { select: { id: true, nombre: true, apellido: true, dni: true, email: true } },
      },
      orderBy: [{ fechaDesde: 'desc' }, { createdAt: 'desc' }],
    });
  }

  static async obtenerPorId(id) {
    const lic = await prisma.licencia.findUnique({
      where: { id },
      include: {
        profesor: { select: { id: true, nombre: true, apellido: true, dni: true, email: true } },
      },
    });
    if (!lic) throw new AppError(...ERRORS.LICENCIA_NOT_FOUND);
    return lic;
  }

  static async listarPorProfesor(profesorId) {
    const prof = await prisma.profesor.findUnique({ where: { id: profesorId } });
    if (!prof) throw new AppError(...ERRORS.PROFESOR_NOT_FOUND);

    return await prisma.licencia.findMany({
      where: { profesorId },
      orderBy: [{ fechaDesde: 'desc' }, { createdAt: 'desc' }],
    });
  }

  // =====================================================
  // CREAR
  // =====================================================
  static async crear(data) {
    const {
      profesorId, tipo, fechaDesde, fechaHasta,
      todoElDia, horaDesde, horaHasta, turno, motivo,
    } = data;

    if (!profesorId) throw new AppError('VALIDATION_ERROR', 'Falta profesorId.', 400);
    if (!tipo || !TIPOS_VALIDOS.includes(tipo)) {
      throw new AppError('VALIDATION_ERROR', `Tipo inválido. Debe ser uno de: ${TIPOS_VALIDOS.join(', ')}.`, 400);
    }

    const prof = await prisma.profesor.findUnique({ where: { id: profesorId } });
    if (!prof) throw new AppError(...ERRORS.PROFESOR_NOT_FOUND);

    if (tipo === 'ESTUDIOS_FEMENINOS' && prof.genero !== 'F') {
      throw new AppError(...ERRORS.LICENCIA_FEMENINO_SOLO);
    }

    const fd = normalizarFecha(fechaDesde);
    const fh = normalizarFecha(fechaHasta);
    if (!fd || !fh) throw new AppError('VALIDATION_ERROR', 'Fechas inválidas.', 400);
    if (fd > fh) throw new AppError(...ERRORS.LICENCIA_FECHAS_INVALIDAS);

    // Granularidad
    const esTodoElDia = todoElDia === true || todoElDia === undefined ? !!todoElDia || true : false;
    const usaHoras = !!horaDesde || !!horaHasta;
    const usaTurno = !!turno;

    if (!todoElDia && !usaHoras && !usaTurno) {
      throw new AppError(...ERRORS.LICENCIA_GRANULARIDAD);
    }
    if (usaHoras && (!horaDesde || !horaHasta)) {
      throw new AppError('VALIDATION_ERROR', 'Si indicás horas, hacelo con horaDesde y horaHasta.', 400);
    }
    if (usaHoras && horaDesde >= horaHasta) {
      throw new AppError(...ERRORS.LICENCIA_HORAS_INVALIDAS);
    }
    if (usaTurno && !TURNOS_VALIDOS.includes(turno)) {
      throw new AppError('VALIDATION_ERROR', 'Turno inválido.', 400);
    }

    const crear = {
      profesorId,
      tipo,
      fechaDesde: fd,
      fechaHasta: fh,
      todoElDia: todoElDia !== false,
      horaDesde: horaDesde || null,
      horaHasta: horaHasta || null,
      turno: turno || null,
      motivo: motivo || null,
      estado: 'PENDIENTE',
    };

    return await prisma.licencia.create({ data: crear });
  }

  // =====================================================
  // ACTUALIZAR (solo PENDIENTE)
  // =====================================================
  static async actualizar(id, data) {
    const lic = await prisma.licencia.findUnique({ where: { id } });
    if (!lic) throw new AppError(...ERRORS.LICENCIA_NOT_FOUND);
    if (lic.estado !== 'PENDIENTE') throw new AppError(...ERRORS.LICENCIA_SOLO_PENDIENTE);

    const update = {};

    if (data.tipo) {
      if (!TIPOS_VALIDOS.includes(data.tipo)) throw new AppError('VALIDATION_ERROR', 'Tipo inválido.', 400);
      if (data.tipo === 'ESTUDIOS_FEMENINOS') {
        const prof = await prisma.profesor.findUnique({ where: { id: lic.profesorId } });
        if (prof?.genero !== 'F') throw new AppError(...ERRORS.LICENCIA_FEMENINO_SOLO);
      }
      update.tipo = data.tipo;
    }

    if (data.fechaDesde || data.fechaHasta) {
      const fd = data.fechaDesde ? normalizarFecha(data.fechaDesde) : lic.fechaDesde;
      const fh = data.fechaHasta ? normalizarFecha(data.fechaHasta) : lic.fechaHasta;
      if (!fd || !fh) throw new AppError('VALIDATION_ERROR', 'Fechas inválidas.', 400);
      if (fd > fh) throw new AppError(...ERRORS.LICENCIA_FECHAS_INVALIDAS);
      update.fechaDesde = fd;
      update.fechaHasta = fh;
    }

    if (data.todoElDia !== undefined) update.todoElDia = !!data.todoElDia;
    if (data.horaDesde !== undefined) update.horaDesde = data.horaDesde || null;
    if (data.horaHasta !== undefined) update.horaHasta = data.horaHasta || null;
    if (data.turno !== undefined) update.turno = data.turno || null;
    if (data.motivo !== undefined) update.motivo = data.motivo || null;

    return await prisma.licencia.update({ where: { id }, data: update });
  }

  static async eliminar(id) {
    const lic = await prisma.licencia.findUnique({ where: { id } });
    if (!lic) throw new AppError(...ERRORS.LICENCIA_NOT_FOUND);
    if (lic.estado !== 'PENDIENTE') throw new AppError(...ERRORS.LICENCIA_SOLO_PENDIENTE);

    return await prisma.licencia.delete({ where: { id } });
  }

  // =====================================================
  // APROBAR / RECHAZAR
  // =====================================================
  static async aprobar(id, aprobadoPorId, observaciones = null) {
    const lic = await prisma.licencia.findUnique({ where: { id } });
    if (!lic) throw new AppError(...ERRORS.LICENCIA_NOT_FOUND);
    if (lic.estado !== 'PENDIENTE') throw new AppError(...ERRORS.LICENCIA_YA_RESUELTA);

    const actualizada = await prisma.licencia.update({
      where: { id },
      data: {
        estado: 'APROBADA',
        aprobadoPor: aprobadoPorId,
        observaciones: observaciones || null,
      },
    });

    // Generar automaticamente las clases suspendidas (idempotente)
    let resumenClases = null;
    try {
      resumenClases = await ClaseSuspendidaService.generarDesdeLicencia(actualizada.id);
    } catch (e) {
      resumenClases = { error: e.message };
    }

    return { ...actualizada, resumenClases };
  }

  static async rechazar(id, aprobadoPorId, observaciones = null) {
    const lic = await prisma.licencia.findUnique({ where: { id } });
    if (!lic) throw new AppError(...ERRORS.LICENCIA_NOT_FOUND);
    if (lic.estado !== 'PENDIENTE') throw new AppError(...ERRORS.LICENCIA_YA_RESUELTA);

    return await prisma.licencia.update({
      where: { id },
      data: {
        estado: 'RECHAZADA',
        aprobadoPor: aprobadoPorId,
        observaciones: observaciones || null,
      },
    });
  }
}