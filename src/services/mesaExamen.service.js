import prisma from '../config/db.js';
import { AppError, ERRORS } from '../utils/errors.js';

// Horas mínimas antes de la mesa para inscribirse/cancelar
const HORAS_MIN_INSCRIPCION = 72;
const HORAS_MIN_CANCELACION = 48;

// Calcula las horas de diferencia entre ahora y una fecha/hora de mesa
function horasHasta(fechaMesa, hora) {
  const [hh, mm] = (hora || '00:00').split(':').map(Number);
  const fecha = new Date(fechaMesa);
  fecha.setHours(hh || 0, mm || 0, 0, 0);
  const ahora = new Date();
  return (fecha.getTime() - ahora.getTime()) / (1000 * 60 * 60);
}

export class MesaExamenService {
  // ----------------------------------------------------------
  // SECRETARÍA / ADMIN: crear mesa
  // ----------------------------------------------------------
  static async crear(data, usuarioId) {
    const { tipoMesa, materiaId, fecha, hora, aula, cupoMaximo, observaciones } = data;
    const tipo = tipoMesa || 'EXAMEN_FINAL';

    if (!['EXAMEN_FINAL', 'INGRESO_NIVELATORIO'].includes(tipo)) {
      throw new AppError('VALIDATION_ERROR', 'tipoMesa inválido.', 400);
    }

    if (!fecha || !hora) {
      throw new AppError('VALIDATION_ERROR', 'Faltan fecha u hora.', 400);
    }

    // Reglas por tipo
    if (tipo === 'EXAMEN_FINAL' && !materiaId) {
      throw new AppError('VALIDATION_ERROR', 'Una mesa EXAMEN_FINAL requiere materiaId.', 400);
    }
    if (tipo === 'INGRESO_NIVELATORIO' && materiaId) {
      throw new AppError('VALIDATION_ERROR', 'Una mesa INGRESO_NIVELATORIO no lleva materiaId.', 400);
    }

    if (materiaId) {
      const materia = await prisma.materia.findUnique({ where: { id: materiaId } });
      if (!materia) throw new AppError(...ERRORS.MATERIA_NOT_FOUND);
    }

    const fechaNorm = new Date(fecha);
    fechaNorm.setHours(0, 0, 0, 0);

    if (fechaNorm < new Date()) {
      throw new AppError('FECHA_INVALIDA', 'La fecha de la mesa no puede ser en el pasado.', 400);
    }

    return await prisma.mesaExamen.create({
      data: {
        tipoMesa: tipo,
        materiaId: materiaId || null,
        fecha: fechaNorm,
        hora,
        aula: aula || null,
        cupoMaximo: cupoMaximo || null,
        observaciones: observaciones || null,
        creadoPorId: usuarioId || null,
        estado: 'PROGRAMADA',
      },
      include: {
        materia: {
          select: {
            id: true,
            nombre: true,
            codigo: true,
            anioCurricular: {
              select: {
                numeroAnio: true,
                resolucion: { select: { id: true, codigo: true } },
              },
            },
          },
        },
      },
    });
  }

  // ----------------------------------------------------------
  // Listar mesas (con filtros)
  // ----------------------------------------------------------
  static async listar(filtros = {}) {
    const where = {};
    if (filtros.materiaId) where.materiaId = filtros.materiaId;
    if (filtros.estado) where.estado = filtros.estado;
    if (filtros.tipoMesa) where.tipoMesa = filtros.tipoMesa;
    if (filtros.desde || filtros.hasta) {
      where.fecha = {};
      if (filtros.desde) where.fecha.gte = new Date(filtros.desde);
      if (filtros.hasta) where.fecha.lte = new Date(filtros.hasta);
    }

    return await prisma.mesaExamen.findMany({
      where,
      include: {
        materia: {
          select: {
            id: true,
            nombre: true,
            codigo: true,
            anioCurricular: {
              select: {
                numeroAnio: true,
                resolucion: { select: { id: true, codigo: true } },
              },
            },
          },
        },
        creadoPor: { select: { id: true, nombre: true, apellido: true } },
        _count: { select: { inscripciones: true } },
      },
      orderBy: [{ fecha: 'asc' }, { hora: 'asc' }],
    });
  }

  // ----------------------------------------------------------
  // Obtener mesa por ID
  // ----------------------------------------------------------
  static async obtenerPorId(id) {
    const mesa = await prisma.mesaExamen.findUnique({
      where: { id },
      include: {
        materia: {
          select: {
            id: true,
            nombre: true,
            codigo: true,
            anioCurricular: {
              select: {
                numeroAnio: true,
                resolucion: { select: { id: true, codigo: true } },
              },
            },
          },
        },
        creadoPor: { select: { id: true, nombre: true, apellido: true } },
        inscripciones: {
          include: {
            alumno: { select: { id: true, nombre: true, apellido: true, dni: true } },
          },
          orderBy: { fechaInscripcion: 'asc' },
        },
        _count: { select: { inscripciones: true } },
      },
    });

    if (!mesa) {
      throw new AppError('MESA_NOT_FOUND', 'Mesa de examen no encontrada.', 404);
    }

    return mesa;
  }

  // ----------------------------------------------------------
  // Alumno: listar mesas disponibles (futuras, no canceladas)
  // ----------------------------------------------------------
  static async listarDisponiblesParaAlumno(alumnoId) {
    const alumno = await prisma.alumno.findUnique({ where: { id: alumnoId } });
    if (!alumno) {
      throw new AppError(...ERRORS.ALUMNO_NOT_FOUND);
    }

    // Mesas futuras (no canceladas ni finalizadas)
    const mesas = await prisma.mesaExamen.findMany({
      where: {
        estado: { in: ['PROGRAMADA', 'EN_CURSO'] },
        fecha: { gte: new Date(new Date().setHours(0, 0, 0, 0)) },
      },
      include: {
        materia: {
          select: {
            id: true,
            nombre: true,
            codigo: true,
            anioCurricular: {
              select: {
                numeroAnio: true,
                resolucion: { select: { id: true, codigo: true } },
              },
            },
          },
        },
        _count: { select: { inscripciones: true } },
        inscripciones: {
          where: { alumnoId },
          select: {
            id: true,
            estado: true,
            fechaInscripcion: true,
          },
        },
      },
      orderBy: [{ fecha: 'asc' }, { hora: 'asc' }],
    });

    // Enriquecer cada mesa con:
    // - miInscripcion (si ya se inscribió)
    // - puedeInscribirse (con las 72hs)
    // - puedeCancelar (con las 48hs)
    // - cupoLleno
    return mesas.map((m) => {
      const horas = horasHasta(m.fecha, m.hora);
      const miInscripcion = m.inscripciones[0] || null;
      const cupoLleno = m.cupoMaximo != null && m._count.inscripciones >= m.cupoMaximo;

      return {
        id: m.id,
        materia: m.materia,
        fecha: m.fecha,
        hora: m.hora,
        aula: m.aula,
        cupoMaximo: m.cupoMaximo,
        inscriptos: m._count.inscripciones,
        cupoLleno,
        estado: m.estado,
        horasHasta: Math.floor(horas),
        miInscripcion,
        puedeInscribirse:
          !miInscripcion &&
          !cupoLleno &&
          horas >= HORAS_MIN_INSCRIPCION &&
          m.estado === 'PROGRAMADA',
        puedeCancelar:
          miInscripcion &&
          miInscripcion.estado === 'INSCRIPTO' &&
          horas >= HORAS_MIN_CANCELACION &&
          m.estado === 'PROGRAMADA',
      };
    });
  }

  // ----------------------------------------------------------
  // Alumno: inscribirse a una mesa (mínimo 72hs antes)
  // ----------------------------------------------------------
  static async inscribir(mesaId, alumnoId) {
    const alumno = await prisma.alumno.findUnique({ where: { id: alumnoId } });
    if (!alumno) {
      throw new AppError(...ERRORS.ALUMNO_NOT_FOUND);
    }

    const mesa = await prisma.mesaExamen.findUnique({
      where: { id: mesaId },
      include: {
        _count: { select: { inscripciones: true } },
        materia: { include: { anioCurricular: true } },
      },
    });

    // ---- Validación nueva: mesa de la carrera del alumno ----
    if (mesa && mesa.tipoMesa === 'EXAMEN_FINAL') {
      if (!mesa.materia) {
        throw new AppError('MESA_INCONSISTENTE', 'La mesa no tiene materia asignada.', 500);
      }
      const resolucionId = mesa.materia.anioCurricular.resolucionId;
      const inscripcionActiva = await prisma.inscripcion.findFirst({
        where: { alumnoId, resolucionId, estado: 'ACTIVA' },
      });
      if (!inscripcionActiva) {
        throw new AppError(
          'MESA_FUERA_DE_CARRERA',
          'No estás inscripto en la carrera de esa materia.',
          403
        );
      }
    }
    // ---- Fin validación nueva ----

    if (!mesa) {
      throw new AppError('MESA_NOT_FOUND', 'Mesa de examen no encontrada.', 404);
    }

    if (mesa.estado !== 'PROGRAMADA') {
      throw new AppError(
        'MESA_NO_DISPONIBLE',
        `La mesa está en estado ${mesa.estado}.`,
        409
      );
    }

    const horas = horasHasta(mesa.fecha, mesa.hora);
    if (horas < HORAS_MIN_INSCRIPCION) {
      throw new AppError(
        'FUERA_DE_PLAZO_INSCRIPCION',
        `Solo podés inscribirte hasta ${HORAS_MIN_INSCRIPCION}hs antes de la mesa. Faltan ${Math.floor(horas)}hs.`,
        409,
        { horasRestantes: Math.floor(horas), minimoRequerido: HORAS_MIN_INSCRIPCION }
      );
    }

    // Cupo
    if (mesa.cupoMaximo != null && mesa._count.inscripciones >= mesa.cupoMaximo) {
      throw new AppError('MESA_SIN_CUPO', 'La mesa está completa.', 409);
    }

    // Ya inscripto?
    const existente = await prisma.inscripcionMesa.findUnique({
      where: { mesaId_alumnoId: { mesaId, alumnoId } },
    });

    if (existente) {
      if (existente.estado === 'CANCELADO') {
        // Permitir reinscripción si canceló y sigue en plazo
        return await prisma.inscripcionMesa.update({
          where: { id: existente.id },
          data: {
            estado: 'INSCRIPTO',
            fechaCancelacion: null,
            fechaInscripcion: new Date(),
          },
        });
      }
      throw new AppError('YA_INSCRIPTO', 'Ya estás inscripto en esta mesa.', 409);
    }

    return await prisma.inscripcionMesa.create({
      data: {
        mesaId,
        alumnoId,
        estado: 'INSCRIPTO',
      },
      include: {
        mesa: {
          include: {
            materia: { select: { id: true, nombre: true, codigo: true } },
          },
        },
      },
    });
  }

  // ----------------------------------------------------------
  // Alumno: cancelar inscripción (mínimo 48hs antes)
  // ----------------------------------------------------------
  static async cancelar(mesaId, alumnoId, data = {}) {
    const inscripcion = await prisma.inscripcionMesa.findUnique({
      where: { mesaId_alumnoId: { mesaId, alumnoId } },
      include: { mesa: true },
    });

    if (!inscripcion) {
      throw new AppError('INSCRIPCION_MESA_NOT_FOUND', 'No estás inscripto en esta mesa.', 404);
    }

    if (inscripcion.estado !== 'INSCRIPTO') {
      throw new AppError(
        'INSCRIPCION_NO_CANCELABLE',
        `La inscripción está en estado ${inscripcion.estado}.`,
        409
      );
    }

    const horas = horasHasta(inscripcion.mesa.fecha, inscripcion.mesa.hora);
    if (horas < HORAS_MIN_CANCELACION) {
      throw new AppError(
        'FUERA_DE_PLAZO_CANCELACION',
        `Solo podés cancelar hasta ${HORAS_MIN_CANCELACION}hs antes de la mesa. Faltan ${Math.floor(horas)}hs.`,
        409,
        { horasRestantes: Math.floor(horas), minimoRequerido: HORAS_MIN_CANCELACION }
      );
    }

    return await prisma.inscripcionMesa.update({
      where: { id: inscripcion.id },
      data: {
        estado: 'CANCELADO',
        fechaCancelacion: new Date(),
        observaciones: data.observaciones || null,
      },
    });
  }

  // ----------------------------------------------------------
  // SECRETARÍA: marcar asistencia (PRESENTE / AUSENTE + nota)
  // ----------------------------------------------------------
  static async registrarAsistencia(mesaId, alumnoId, data) {
    const { estado, nota, observaciones } = data;

    if (!['PRESENTE', 'AUSENTE'].includes(estado)) {
      throw new AppError('VALIDATION_ERROR', 'estado debe ser PRESENTE o AUSENTE.', 400);
    }

    const inscripcion = await prisma.inscripcionMesa.findUnique({
      where: { mesaId_alumnoId: { mesaId, alumnoId } },
    });

    if (!inscripcion) {
      throw new AppError('INSCRIPCION_MESA_NOT_FOUND', 'El alumno no está inscripto.', 404);
    }

    if (inscripcion.estado === 'CANCELADO') {
      throw new AppError('INSCRIPCION_CANCELADA', 'La inscripción fue cancelada.', 409);
    }

    return await prisma.inscripcionMesa.update({
      where: { id: inscripcion.id },
      data: {
        estado,
        nota: nota !== undefined ? nota : inscripcion.nota,
        observaciones: observaciones !== undefined ? observaciones : inscripcion.observaciones,
      },
    });
  }

  // ----------------------------------------------------------
  // SECRETARÍA: listar inscripciones de una mesa
  // ----------------------------------------------------------
  static async listarInscripciones(mesaId) {
    const mesa = await prisma.mesaExamen.findUnique({ where: { id: mesaId } });
    if (!mesa) {
      throw new AppError('MESA_NOT_FOUND', 'Mesa de examen no encontrada.', 404);
    }

    return await prisma.inscripcionMesa.findMany({
      where: { mesaId },
      include: {
        alumno: { select: { id: true, nombre: true, apellido: true, dni: true, email: true } },
      },
      orderBy: [{ estado: 'asc' }, { alumno: { apellido: 'asc' } }],
    });
  }

  // ----------------------------------------------------------
  // SECRETARÍA: cambiar estado de mesa
  // ----------------------------------------------------------
  static async actualizarEstado(id, data) {
    const { estado, observaciones } = data;

    if (!['PROGRAMADA', 'EN_CURSO', 'FINALIZADA', 'CANCELADA'].includes(estado)) {
      throw new AppError('VALIDATION_ERROR', 'Estado inválido.', 400);
    }

    const mesa = await prisma.mesaExamen.findUnique({ where: { id } });
    if (!mesa) {
      throw new AppError('MESA_NOT_FOUND', 'Mesa de examen no encontrada.', 404);
    }

    return await prisma.mesaExamen.update({
      where: { id },
      data: {
        estado,
        ...(observaciones !== undefined && { observaciones }),
      },
    });
  }

  // ----------------------------------------------------------
  // Regla de negocio: ¿el alumno dejó pasar alguna mesa de esta materia?
  // (AUSENTE sin cancelar a tiempo)
  // ----------------------------------------------------------
  static async dejoPasarMesa(alumnoId, materiaId) {
    const ausencias = await prisma.inscripcionMesa.findMany({
      where: {
        alumnoId,
        estado: 'AUSENTE',
        mesa: { materiaId },
      },
      orderBy: { mesa: { fecha: 'desc' } },
    });

    return {
      dejoPasar: ausencias.length > 0,
      cantidad: ausencias.length,
      ultimaFecha: ausencias[0]?.mesa?.fecha || null,
    };
  }
}