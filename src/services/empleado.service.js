import prisma from '../config/db.js';
import { AppError, ERRORS } from '../utils/errors.js';
import { HorarioTrabajoService } from './horarioTrabajo.service.js';

const CARGOS_VALIDOS = ['BEDEL', 'CELADOR', 'OTRO'];
const ESTADOS_VALIDOS = ['ACTIVO', 'INACTIVO'];

const CAMPOS_FICHA = {
  id: true,
  dni: true,
  nombre: true,
  apellido: true,
  email: true,
  telefono: true,
  fechaNacimiento: true,
  genero: true,
  domicilioCalle: true,
  domicilioNumero: true,
  domicilioCiudad: true,
  domicilioProvincia: true,
  domicilioCP: true,
  cargo: true,
  sector: true,
  fechaIngreso: true,
  observaciones: true,
  estado: true,
  createdAt: true,
};

function requireEmpleadoId(user) {
  if (!user?.empleadoId) {
    throw new AppError(
      'SIN_FICHA_EMPLEADO',
      'Este usuario no tiene una ficha de empleado vinculada.',
      404
    );
  }
  return user.empleadoId;
}

export class EmpleadoService {
  // =========================================================
  // ABM (gestión académica)
  // =========================================================
  static async listar(filtros = {}) {
    const where = {};
    if (filtros.cargo) where.cargo = filtros.cargo;
    if (filtros.estado) where.estado = filtros.estado;
    if (filtros.busqueda) {
      where.OR = [
        { nombre: { contains: filtros.busqueda, mode: 'insensitive' } },
        { apellido: { contains: filtros.busqueda, mode: 'insensitive' } },
        { dni: { contains: filtros.busqueda } },
        { email: { contains: filtros.busqueda, mode: 'insensitive' } },
        { sector: { contains: filtros.busqueda, mode: 'insensitive' } },
      ];
    }

    return await prisma.empleado.findMany({
      where,
      select: {
        ...CAMPOS_FICHA,
        usuario: { select: { id: true, email: true, rol: true, activo: true } },
        _count: { select: { horarios: true, licencias: true } },
      },
      orderBy: [{ apellido: 'asc' }, { nombre: 'asc' }],
    });
  }

  static async obtenerPorId(id) {
    const empleado = await prisma.empleado.findUnique({
      where: { id },
      select: {
        ...CAMPOS_FICHA,
        usuario: { select: { id: true, email: true, rol: true, activo: true } },
        horarios: { orderBy: [{ activo: 'desc' }, { diaSemana: 'asc' }, { horaInicio: 'asc' }] },
        licencias: { orderBy: [{ fechaDesde: 'desc' }, { createdAt: 'desc' }] },
      },
    });

    if (!empleado) throw new AppError(...ERRORS.EMPLEADO_NOT_FOUND);
    return empleado;
  }

  static async crear(data) {
    const { dni, email, cargo } = data;

    if (!dni || !data.nombre || !data.apellido || !email) {
      throw new AppError('VALIDATION_ERROR', 'Faltan dni, nombre, apellido o email.', 400);
    }
    if (!cargo || !CARGOS_VALIDOS.includes(cargo)) {
      throw new AppError('VALIDATION_ERROR', `Cargo inválido. Debe ser uno de: ${CARGOS_VALIDOS.join(', ')}.`, 400);
    }
    if (await prisma.empleado.findUnique({ where: { dni } })) {
      throw new AppError(...ERRORS.EMPLEADO_DNI_DUP);
    }
    if (await prisma.empleado.findUnique({ where: { email } })) {
      throw new AppError(...ERRORS.EMPLEADO_EMAIL_DUP);
    }

    return await prisma.empleado.create({
      data: {
        dni,
        nombre: data.nombre,
        apellido: data.apellido,
        email,
        telefono: data.telefono || null,
        fechaNacimiento: data.fechaNacimiento ? new Date(data.fechaNacimiento) : null,
        genero: data.genero || null,
        domicilioCalle: data.domicilioCalle || null,
        domicilioNumero: data.domicilioNumero || null,
        domicilioCiudad: data.domicilioCiudad || null,
        domicilioProvincia: data.domicilioProvincia || null,
        domicilioCP: data.domicilioCP || null,
        cargo,
        sector: data.sector || null,
        fechaIngreso: data.fechaIngreso ? new Date(data.fechaIngreso) : null,
        observaciones: data.observaciones || null,
      },
      select: CAMPOS_FICHA,
    });
  }

  static async actualizar(id, data) {
    const empleado = await prisma.empleado.findUnique({ where: { id } });
    if (!empleado) throw new AppError(...ERRORS.EMPLEADO_NOT_FOUND);

    if (data.dni && data.dni !== empleado.dni) {
      if (await prisma.empleado.findUnique({ where: { dni: data.dni } })) {
        throw new AppError(...ERRORS.EMPLEADO_DNI_DUP);
      }
    }
    if (data.email && data.email !== empleado.email) {
      if (await prisma.empleado.findUnique({ where: { email: data.email } })) {
        throw new AppError(...ERRORS.EMPLEADO_EMAIL_DUP);
      }
    }
    if (data.cargo && !CARGOS_VALIDOS.includes(data.cargo)) {
      throw new AppError('VALIDATION_ERROR', 'Cargo inválido.', 400);
    }
    if (data.estado && !ESTADOS_VALIDOS.includes(data.estado)) {
      throw new AppError('VALIDATION_ERROR', 'Estado inválido.', 400);
    }

    return await prisma.empleado.update({
      where: { id },
      data: {
        ...(data.dni && { dni: data.dni }),
        ...(data.nombre && { nombre: data.nombre }),
        ...(data.apellido && { apellido: data.apellido }),
        ...(data.email && { email: data.email }),
        ...(data.telefono !== undefined && { telefono: data.telefono || null }),
        ...(data.fechaNacimiento !== undefined && {
          fechaNacimiento: data.fechaNacimiento ? new Date(data.fechaNacimiento) : null,
        }),
        ...(data.genero !== undefined && { genero: data.genero || null }),
        ...(data.domicilioCalle !== undefined && { domicilioCalle: data.domicilioCalle || null }),
        ...(data.domicilioNumero !== undefined && { domicilioNumero: data.domicilioNumero || null }),
        ...(data.domicilioCiudad !== undefined && { domicilioCiudad: data.domicilioCiudad || null }),
        ...(data.domicilioProvincia !== undefined && { domicilioProvincia: data.domicilioProvincia || null }),
        ...(data.domicilioCP !== undefined && { domicilioCP: data.domicilioCP || null }),
        ...(data.cargo && { cargo: data.cargo }),
        ...(data.sector !== undefined && { sector: data.sector || null }),
        ...(data.fechaIngreso !== undefined && {
          fechaIngreso: data.fechaIngreso ? new Date(data.fechaIngreso) : null,
        }),
        ...(data.observaciones !== undefined && { observaciones: data.observaciones || null }),
        ...(data.estado && { estado: data.estado }),
      },
      select: CAMPOS_FICHA,
    });
  }

  static async cambiarEstado(id, estado) {
    if (!ESTADOS_VALIDOS.includes(estado)) {
      throw new AppError('VALIDATION_ERROR', 'Estado inválido.', 400);
    }
    const empleado = await prisma.empleado.findUnique({ where: { id } });
    if (!empleado) throw new AppError(...ERRORS.EMPLEADO_NOT_FOUND);

    return await prisma.empleado.update({ where: { id }, data: { estado }, select: CAMPOS_FICHA });
  }

  static async darDeBaja(id) {
    return await EmpleadoService.cambiarEstado(id, 'INACTIVO');
  }

  static async reactivar(id) {
    return await EmpleadoService.cambiarEstado(id, 'ACTIVO');
  }

  // =========================================================
  // Panel de autoservicio (celador / bedel)
  // =========================================================
  static async miFicha(user) {
    const empleadoId = requireEmpleadoId(user);
    return await EmpleadoService.obtenerPorId(empleadoId);
  }

  static async misHorarios(user) {
    const empleadoId = requireEmpleadoId(user);
    const [vigentes, historial] = await Promise.all([
      HorarioTrabajoService.listarPorEmpleado(empleadoId, { soloVigentes: true }),
      HorarioTrabajoService.listarPorEmpleado(empleadoId, { soloHistorial: true }),
    ]);
    return { vigentes, historial };
  }

  static async misModificaciones(user) {
    const empleadoId = requireEmpleadoId(user);
    const modificaciones = await HorarioTrabajoService.listarModificaciones(empleadoId);
    return {
      sinVer: modificaciones.filter((m) => !m.visto).length,
      modificaciones,
    };
  }

  static async marcarModificacionesVistas(user, ids = null) {
    const empleadoId = requireEmpleadoId(user);
    return await HorarioTrabajoService.marcarVistas(empleadoId, ids);
  }

  // "Mi historial": justificativos presentados + turnos/sectores + modificaciones
  static async miHistorial(user) {
    const empleadoId = requireEmpleadoId(user);

    const empleado = await prisma.empleado.findUnique({
      where: { id: empleadoId },
      select: CAMPOS_FICHA,
    });
    if (!empleado) throw new AppError(...ERRORS.EMPLEADO_NOT_FOUND);

    const [licencias, horarios, modificaciones] = await Promise.all([
      prisma.licencia.findMany({
        where: { empleadoId },
        orderBy: [{ fechaDesde: 'desc' }, { createdAt: 'desc' }],
      }),
      prisma.horarioTrabajo.findMany({
        where: { empleadoId },
        orderBy: [{ vigenteDesde: 'desc' }, { diaSemana: 'asc' }, { horaInicio: 'asc' }],
      }),
      prisma.modificacionHorario.findMany({
        where: { empleadoId },
        orderBy: { createdAt: 'desc' },
        include: { cambiadoPor: { select: { nombre: true, apellido: true } } },
      }),
    ]);

    return {
      empleado,
      justificativos: licencias,
      horarios,
      modificaciones,
      resumen: {
        justificativos: licencias.length,
        pendientes: licencias.filter((l) => l.estado === 'PENDIENTE').length,
        aprobados: licencias.filter((l) => l.estado === 'APROBADA').length,
        turnosVigentes: horarios.filter((h) => h.activo).length,
        modificaciones: modificaciones.length,
        modificacionesSinVer: modificaciones.filter((m) => !m.visto).length,
      },
    };
  }
}
