import prisma from '../config/db.js';
import { AppError, ERRORS } from '../utils/errors.js';
import { ClaseSuspendidaService } from './claseSuspendida.service.js';

const TIPOS_VALIDOS = [
  'ENFERMEDAD',
  'RAZON_PARTICULAR',
  'ESTUDIOS_FEMENINOS',
  'DONACION_SANGRE',
  'ACCIDENTE_LABORAL',
  'CERTIFICADO_SALUD',
  'JUSTIFICATIVO_FALTA',
  'OTRO',
];

// Tipos que puede presentar el personal no docente (bedeles, celadores, etc.)
const TIPOS_NO_DOCENTE = ['CERTIFICADO_SALUD', 'JUSTIFICATIVO_FALTA', 'ACCIDENTE_LABORAL', 'OTRO'];

const TURNOS_VALIDOS = ['MANANA', 'TARDE', 'NOCHE'];

const INCLUDE_PERSONA = {
  profesor: { select: { id: true, nombre: true, apellido: true, dni: true, email: true } },
  empleado: { select: { id: true, nombre: true, apellido: true, dni: true, email: true, cargo: true, sector: true } },
};

function normalizarFecha(f) {
  const d = new Date(f);
  if (isNaN(d.getTime())) return null;
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

function esGestion(user) {
  return user?.rol === 'ADMIN' || user?.rol === 'SECRETARIA';
}

function esDuenio(lic, user) {
  if (!user || esGestion(user)) return true;
  if (user.rol === 'PROFESOR') return !!lic.profesorId && lic.profesorId === user.profesorId;
  if (user.rol === 'BEDEL' || user.rol === 'CELADOR') {
    return !!lic.empleadoId && lic.empleadoId === user.empleadoId;
  }
  return false;
}

function exigirDuenio(lic, user) {
  if (!esDuenio(lic, user)) {
    throw new AppError('SIN_PERMISO', 'No puede operar sobre justificativos de otra persona.', 403);
  }
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
    if (filtros.empleadoId) where.empleadoId = filtros.empleadoId;
    if (filtros.soloNoDocentes) where.empleadoId = { not: null };
    if (filtros.soloDocentes) where.profesorId = { not: null };

    if (filtros.desde || filtros.hasta) {
      where.fechaDesde = {};
      if (filtros.desde) where.fechaDesde.gte = normalizarFecha(filtros.desde);
      if (filtros.hasta) where.fechaHasta = { lte: normalizarFecha(filtros.hasta) };
    }

    return await prisma.licencia.findMany({
      where,
      include: INCLUDE_PERSONA,
      orderBy: [{ fechaDesde: 'desc' }, { createdAt: 'desc' }],
    });
  }

  static async obtenerPorId(id, user = null) {
    const lic = await prisma.licencia.findUnique({ where: { id }, include: INCLUDE_PERSONA });
    if (!lic) throw new AppError(...ERRORS.LICENCIA_NOT_FOUND);
    exigirDuenio(lic, user);
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

  static async listarPorEmpleado(empleadoId) {
    const emp = await prisma.empleado.findUnique({ where: { id: empleadoId } });
    if (!emp) throw new AppError(...ERRORS.EMPLEADO_NOT_FOUND);

    return await prisma.licencia.findMany({
      where: { empleadoId },
      orderBy: [{ fechaDesde: 'desc' }, { createdAt: 'desc' }],
    });
  }

  // Panel personal: docentes y no docentes ven sus propias presentaciones
  static async misLicencias(user) {
    if (user?.rol === 'PROFESOR') return await LicenciaService.listarPorProfesor(user.profesorId);
    if (user?.rol === 'BEDEL' || user?.rol === 'CELADOR') {
      if (!user.empleadoId) {
        throw new AppError('SIN_FICHA_EMPLEADO', 'Este usuario no tiene una ficha de empleado vinculada.', 404);
      }
      return await LicenciaService.listarPorEmpleado(user.empleadoId);
    }
    return await LicenciaService.listar({});
  }

  // =====================================================
  // CREAR (docentes y no docentes)
  // =====================================================
  static async crear(data, user = null) {
    const { tipo, fechaDesde, fechaHasta, todoElDia, horaDesde, horaHasta, turno, motivo } = data;

    // ---------------------------------------------------
    // ¿A nombre de quién se presenta?
    // ---------------------------------------------------
    let profesorId = data.profesorId || null;
    let empleadoId = data.empleadoId || null;

    if (user?.rol === 'PROFESOR') {
      profesorId = user.profesorId;
      empleadoId = null;
    } else if (user?.rol === 'BEDEL' || user?.rol === 'CELADOR') {
      if (!user.empleadoId) {
        throw new AppError('SIN_FICHA_EMPLEADO', 'Este usuario no tiene una ficha de empleado vinculada.', 404);
      }
      empleadoId = user.empleadoId;
      profesorId = null;
    }

    if (!profesorId && !empleadoId) {
      throw new AppError('VALIDATION_ERROR', 'Indicá el docente (profesorId) o el empleado (empleadoId).', 400);
    }
    if (profesorId && empleadoId) {
      throw new AppError('VALIDATION_ERROR', 'El justificativo es de un docente O de un empleado, no de los dos.', 400);
    }

    if (!tipo || !TIPOS_VALIDOS.includes(tipo)) {
      throw new AppError('VALIDATION_ERROR', `Tipo inválido. Debe ser uno de: ${TIPOS_VALIDOS.join(', ')}.`, 400);
    }

    // Validar la persona y las reglas propias de cada tipo
    let genero = null;
    if (profesorId) {
      const prof = await prisma.profesor.findUnique({ where: { id: profesorId } });
      if (!prof) throw new AppError(...ERRORS.PROFESOR_NOT_FOUND);
      genero = prof.genero;
    } else {
      const emp = await prisma.empleado.findUnique({ where: { id: empleadoId } });
      if (!emp) throw new AppError(...ERRORS.EMPLEADO_NOT_FOUND);
      if (emp.estado !== 'ACTIVO') {
        throw new AppError('EMPLEADO_INACTIVO', 'El empleado está dado de baja.', 409);
      }
      genero = emp.genero;
      if (!TIPOS_NO_DOCENTE.includes(tipo)) {
        throw new AppError(
          'VALIDATION_ERROR',
          `El personal no docente puede presentar: ${TIPOS_NO_DOCENTE.join(', ')}.`,
          400
        );
      }
    }

    if (tipo === 'ESTUDIOS_FEMENINOS' && genero !== 'F') {
      throw new AppError(...ERRORS.LICENCIA_FEMENINO_SOLO);
    }

    const fd = normalizarFecha(fechaDesde);
    const fh = normalizarFecha(fechaHasta);
    if (!fd || !fh) throw new AppError('VALIDATION_ERROR', 'Fechas inválidas.', 400);
    if (fd > fh) throw new AppError(...ERRORS.LICENCIA_FECHAS_INVALIDAS);

    // Granularidad
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

    return await prisma.licencia.create({
      data: {
        profesorId,
        empleadoId,
        tipo,
        fechaDesde: fd,
        fechaHasta: fh,
        todoElDia: todoElDia !== false,
        horaDesde: horaDesde || null,
        horaHasta: horaHasta || null,
        turno: turno || null,
        motivo: motivo || null,
        estado: 'PENDIENTE',
      },
      include: INCLUDE_PERSONA,
    });
  }

  // =====================================================
  // ACTUALIZAR (solo PENDIENTE y solo el dueño o gestión)
  // =====================================================
  static async actualizar(id, data, user = null) {
    const lic = await prisma.licencia.findUnique({ where: { id } });
    if (!lic) throw new AppError(...ERRORS.LICENCIA_NOT_FOUND);
    exigirDuenio(lic, user);
    if (lic.estado !== 'PENDIENTE') throw new AppError(...ERRORS.LICENCIA_SOLO_PENDIENTE);

    const update = {};

    if (data.tipo) {
      if (!TIPOS_VALIDOS.includes(data.tipo)) throw new AppError('VALIDATION_ERROR', 'Tipo inválido.', 400);
      if (lic.empleadoId && !TIPOS_NO_DOCENTE.includes(data.tipo)) {
        throw new AppError('VALIDATION_ERROR', `El personal no docente puede presentar: ${TIPOS_NO_DOCENTE.join(', ')}.`, 400);
      }
      if (data.tipo === 'ESTUDIOS_FEMENINOS') {
        const prof = lic.profesorId
          ? await prisma.profesor.findUnique({ where: { id: lic.profesorId } })
          : null;
        const emp = lic.empleadoId
          ? await prisma.empleado.findUnique({ where: { id: lic.empleadoId } })
          : null;
        if ((prof?.genero ?? emp?.genero) !== 'F') throw new AppError(...ERRORS.LICENCIA_FEMENINO_SOLO);
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

    return await prisma.licencia.update({ where: { id }, data: update, include: INCLUDE_PERSONA });
  }

  static async eliminar(id, user = null) {
    const lic = await prisma.licencia.findUnique({ where: { id } });
    if (!lic) throw new AppError(...ERRORS.LICENCIA_NOT_FOUND);
    exigirDuenio(lic, user);
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

    // Sólo las licencias de docentes suspenden clases
    let resumenClases = null;
    if (actualizada.profesorId) {
      try {
        resumenClases = await ClaseSuspendidaService.generarDesdeLicencia(actualizada.id);
      } catch (e) {
        resumenClases = { error: e.message };
      }
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
