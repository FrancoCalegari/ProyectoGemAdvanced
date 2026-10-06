import prisma from '../config/db.js';
import { AppError, ERRORS } from '../utils/errors.js';

const TIPOS_VALIDOS = ['MEDICO', 'LABORAL', 'FAMILIAR', 'OTRO'];

export class CertificadoPresentadoService {
  // ----------------------------------------------------------
  // Alumno sube un certificado (queda PENDIENTE)
  // ----------------------------------------------------------
  static async crear(alumnoId, data) {
    const { tipo, motivo, fechaDesde, fechaHasta } = data;

    if (!tipo || !TIPOS_VALIDOS.includes(tipo)) {
      throw new AppError(
        'VALIDATION_ERROR',
        `Tipo inválido. Debe ser uno de: ${TIPOS_VALIDOS.join(', ')}.`,
        400
      );
    }
    if (!motivo || motivo.trim().length === 0) {
      throw new AppError('VALIDATION_ERROR', 'Falta el motivo.', 400);
    }
    if (!fechaDesde || !fechaHasta) {
      throw new AppError('VALIDATION_ERROR', 'Faltan fechaDesde o fechaHasta.', 400);
    }

    const desde = new Date(fechaDesde);
    const hasta = new Date(fechaHasta);
    desde.setHours(0, 0, 0, 0);
    hasta.setHours(0, 0, 0, 0);

    if (hasta < desde) {
      throw new AppError(
        'VALIDATION_ERROR',
        'La fecha de fin no puede ser anterior a la de inicio.',
        400
      );
    }

    const alumno = await prisma.alumno.findUnique({ where: { id: alumnoId } });
    if (!alumno) {
      throw new AppError(...ERRORS.ALUMNO_NOT_FOUND);
    }

    return await prisma.certificadoPresentado.create({
      data: {
        alumnoId,
        tipo,
        motivo: motivo.trim(),
        fechaDesde: desde,
        fechaHasta: hasta,
        estado: 'PENDIENTE',
      },
      include: {
        alumno: { select: { id: true, nombre: true, apellido: true, dni: true, email: true } },
      },
    });
  }

  // ----------------------------------------------------------
  // Listar certificados presentados de un alumno
  // ----------------------------------------------------------
  static async listarPorAlumno(alumnoId) {
    const alumno = await prisma.alumno.findUnique({ where: { id: alumnoId } });
    if (!alumno) {
      throw new AppError(...ERRORS.ALUMNO_NOT_FOUND);
    }

    return await prisma.certificadoPresentado.findMany({
      where: { alumnoId },
      include: {
        aprobadoPor: { select: { id: true, nombre: true, apellido: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // ----------------------------------------------------------
  // Listar TODOS (para panel admin/secretaría)
  // ----------------------------------------------------------
  static async listar(filtros = {}) {
    const where = {};
    if (filtros.estado) where.estado = filtros.estado;
    if (filtros.tipo) where.tipo = filtros.tipo;

    return await prisma.certificadoPresentado.findMany({
      where,
      include: {
        alumno: { select: { id: true, nombre: true, apellido: true, dni: true, email: true } },
        aprobadoPor: { select: { id: true, nombre: true, apellido: true } },
      },
      orderBy: [
        { estado: 'asc' }, // PENDIENTE primero (P < A < R por orden alfabético, ojo)
        { createdAt: 'desc' },
      ],
    });
  }

  // ----------------------------------------------------------
  // Obtener por ID
  // ----------------------------------------------------------
  static async obtenerPorId(id) {
    const cert = await prisma.certificadoPresentado.findUnique({
      where: { id },
      include: {
        alumno: { select: { id: true, nombre: true, apellido: true, dni: true, email: true } },
        aprobadoPor: { select: { id: true, nombre: true, apellido: true } },
      },
    });

    if (!cert) {
      throw new AppError(
        'CERTIFICADO_PRESENTADO_NOT_FOUND',
        'Certificado presentado no encontrado.',
        404
      );
    }

    return cert;
  }

  // ----------------------------------------------------------
  // Aprobar (ADMIN o SECRETARIA)
  // Efecto: marca como JUSTIFICADO las asistencias existentes en el rango
  //         y crea las faltantes también como JUSTIFICADO
  // ----------------------------------------------------------
  static async aprobar(id, usuarioId, data = {}) {
    const cert = await prisma.certificadoPresentado.findUnique({
      where: { id },
      include: { alumno: true },
    });

    if (!cert) {
      throw new AppError(
        'CERTIFICADO_PRESENTADO_NOT_FOUND',
        'Certificado presentado no encontrado.',
        404
      );
    }

    if (cert.estado !== 'PENDIENTE') {
      throw new AppError(
        'CERTIFICADO_YA_RESUELTO',
        `El certificado ya fue ${cert.estado.toLowerCase()}.`,
        409
      );
    }

    // Buscar todas las cursadas activas del alumno (en inscripciones ACTIVA)
    const cursadas = await prisma.cursadaMateria.findMany({
      where: {
        inscripcion: {
          alumnoId: cert.alumnoId,
          estado: 'ACTIVA',
        },
      },
      include: { asistencias: true },
    });

    const resultado = await prisma.$transaction(async (tx) => {
      let asistenciasActualizadas = 0;
      let asistenciasCreadas = 0;

      for (const cursada of cursadas) {
        // Iterar día por día en el rango
        const desde = new Date(cert.fechaDesde);
        const hasta = new Date(cert.fechaHasta);
        const current = new Date(desde);

        while (current <= hasta) {
          const fecha = new Date(current);
          fecha.setHours(0, 0, 0, 0);

          const existente = cursada.asistencias.find(
            (a) => new Date(a.fecha).toISOString().slice(0, 10) === fecha.toISOString().slice(0, 10)
          );

          if (existente) {
            // Solo actualizamos si NO está ya JUSTIFICADO
            if (existente.estado !== 'JUSTIFICADO') {
              await tx.asistencia.update({
                where: { id: existente.id },
                data: {
                  estado: 'JUSTIFICADO',
                  observaciones: `Justificado por certificado ${cert.tipo} (${cert.id.slice(0, 8)})`,
                },
              });
              asistenciasActualizadas++;
            }
          } else {
            // Crear la asistencia como JUSTIFICADO
            await tx.asistencia.create({
              data: {
                cursadaId: cursada.id,
                fecha,
                estado: 'JUSTIFICADO',
                observaciones: `Justificado por certificado ${cert.tipo} (${cert.id.slice(0, 8)})`,
              },
            });
            asistenciasCreadas++;
          }

          current.setDate(current.getDate() + 1);
        }
      }

      // Actualizar el certificado presentado
      const certActualizado = await tx.certificadoPresentado.update({
        where: { id },
        data: {
          estado: 'APROBADO',
          aprobadoPorId: usuarioId,
          fechaResolucion: new Date(),
          observaciones: data.observaciones || cert.observaciones,
        },
        include: {
          alumno: { select: { id: true, nombre: true, apellido: true, dni: true } },
          aprobadoPor: { select: { id: true, nombre: true, apellido: true } },
        },
      });

      return { certActualizado, asistenciasActualizadas, asistenciasCreadas };
    });

    return resultado;
  }

  // ----------------------------------------------------------
  // Rechazar (ADMIN o SECRETARIA)
  // ----------------------------------------------------------
  static async rechazar(id, usuarioId, data = {}) {
    const cert = await prisma.certificadoPresentado.findUnique({ where: { id } });

    if (!cert) {
      throw new AppError(
        'CERTIFICADO_PRESENTADO_NOT_FOUND',
        'Certificado presentado no encontrado.',
        404
      );
    }

    if (cert.estado !== 'PENDIENTE') {
      throw new AppError(
        'CERTIFICADO_YA_RESUELTO',
        `El certificado ya fue ${cert.estado.toLowerCase()}.`,
        409
      );
    }

    return await prisma.certificadoPresentado.update({
      where: { id },
      data: {
        estado: 'RECHAZADO',
        aprobadoPorId: usuarioId,
        fechaResolucion: new Date(),
        observaciones: data.observaciones || 'Rechazado sin observaciones.',
      },
      include: {
        alumno: { select: { id: true, nombre: true, apellido: true, dni: true } },
        aprobadoPor: { select: { id: true, nombre: true, apellido: true } },
      },
    });
  }

  // ----------------------------------------------------------
  // Eliminar (solo si PENDIENTE)
  // ----------------------------------------------------------
  static async eliminar(id, user = null) {
    const cert = await prisma.certificadoPresentado.findUnique({ where: { id } });

    if (!cert) {
      throw new AppError(
        'CERTIFICADO_PRESENTADO_NOT_FOUND',
        'Certificado presentado no encontrado.',
        404
      );
    }

    // Un alumno sólo puede eliminar sus propias justificaciones
    if (user?.rol === 'ALUMNO' && cert.alumnoId !== user.alumnoId) {
      throw new AppError('SIN_PERMISO', 'No puede eliminar justificaciones de otro alumno.', 403);
    }

    if (cert.estado !== 'PENDIENTE') {
      throw new AppError(
        'CERTIFICADO_YA_RESUELTO',
        'Solo se pueden eliminar certificados pendientes.',
        409
      );
    }

    return await prisma.certificadoPresentado.delete({ where: { id } });
  }
}