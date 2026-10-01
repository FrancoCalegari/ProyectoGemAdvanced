import prisma from '../config/db.js';
import { AppError, ERRORS } from '../utils/errors.js';
import { generarCertificadoPDF } from '../utils/pdf.js';
import { MesaExamenService } from './mesaExamen.service.js';

const TIPOS_VALIDOS = [
  'PARCIAL_ANIO', 'TITULO_COMPLETO', 'CONCURRENCIA',
  'PARA_COLECTIVO', 'LABORAL', 'PARA_RENDIR',
];

const TIPOS_REQUIEREN_ANIO = ['PARCIAL_ANIO'];
const TIPOS_REQUIEREN_RANGO = ['CONCURRENCIA'];
const ASISTENCIA_MINIMA_POR_TIPO = {
  CONCURRENCIA: 75,
  PARA_COLECTIVO: 70,
  LABORAL: 60,
};

export class CertificadoService {
  static async listarPorAlumno(alumnoId) {
    const alumno = await prisma.alumno.findUnique({ where: { id: alumnoId } });
    if (!alumno) throw new AppError(...ERRORS.ALUMNO_NOT_FOUND);

    return await prisma.certificado.findMany({
      where: { alumnoId },
      include: {
        titulo: { select: { id: true, nombre: true, nivel: true } },
        resolucion: { select: { id: true, codigo: true } },
        anioCurricular: { select: { id: true, numeroAnio: true, nombre: true } },
      },
      orderBy: { fechaEmision: 'desc' },
    });
  }

  static async obtenerPorId(id) {
    const cert = await prisma.certificado.findUnique({
      where: { id },
      include: {
        alumno: { select: { id: true, nombre: true, apellido: true, dni: true, email: true } },
        titulo: { select: { id: true, nombre: true, nivel: true } },
        resolucion: { select: { id: true, codigo: true, estado: true } },
        anioCurricular: { select: { id: true, numeroAnio: true, nombre: true } },
      },
    });

    if (!cert) throw new AppError(...ERRORS.CERTIFICADO_NOT_FOUND);
    return cert;
  }

  // Preview de concurrencia SIN materia
  static async previewConcurrencia(alumnoId, data) {
    const { fechaDesde, fechaHasta } = data;

    if (!fechaDesde || !fechaHasta) {
      throw new AppError('VALIDATION_ERROR', 'Faltan fechaDesde o fechaHasta.', 400);
    }

    const alumno = await prisma.alumno.findUnique({ where: { id: alumnoId } });
    if (!alumno) throw new AppError(...ERRORS.ALUMNO_NOT_FOUND);

    const desde = new Date(fechaDesde);
    desde.setHours(0, 0, 0, 0);
    const hasta = new Date(fechaHasta);
    hasta.setHours(0, 0, 0, 0);

    if (hasta < desde) {
      throw new AppError('VALIDATION_ERROR', 'La fecha de fin no puede ser anterior a la de inicio.', 400);
    }

    const cursadas = await prisma.cursadaMateria.findMany({
      where: { inscripcion: { alumnoId, estado: 'ACTIVA' } },
      include: {
        materia: true,
        asistencias: {
          where: { fecha: { gte: desde, lte: hasta } },
          orderBy: { fecha: 'asc' },
        },
      },
    });

    if (cursadas.length === 0) {
      throw new AppError('SIN_CURSADAS', 'El alumno no tiene cursadas activas.', 404);
    }

    const detalle = [];
    for (const c of cursadas) {
      for (const a of c.asistencias) {
        detalle.push({
          fecha: a.fecha,
          estado: a.estado,
          observaciones: a.observaciones,
          materiaId: c.materia.id,
          materiaNombre: c.materia.nombre,
          materiaCodigo: c.materia.codigo,
        });
      }
    }
    detalle.sort((a, b) => new Date(a.fecha) - new Date(b.fecha));

    const presentes = detalle.filter((d) => d.estado === 'PRESENTE').length;
    const justificados = detalle.filter((d) => d.estado === 'JUSTIFICADO').length;
    const ausentes = detalle.filter((d) => d.estado === 'AUSENTE').length;
    const total = detalle.length;
    const efectivas = presentes + justificados;
    const porcentaje = total > 0 ? Math.round((efectivas / total) * 100) : 0;

    return {
      rango: { desde, hasta },
      asistencias: { total, presentes, justificados, ausentes, efectivas, porcentaje, detalle },
    };
  }

  // Solicitar
  static async solicitar(alumnoId, data) {
    const { tipo, anioCurricularId, fechaDesde, fechaHasta } = data;

    if (!tipo || !TIPOS_VALIDOS.includes(tipo)) {
      throw new AppError(
        'VALIDATION_ERROR',
        `Tipo inválido. Debe ser uno de: ${TIPOS_VALIDOS.join(', ')}.`,
        400
      );
    }
    if (TIPOS_REQUIEREN_ANIO.includes(tipo) && !anioCurricularId) {
      throw new AppError('VALIDATION_ERROR', `Falta anioCurricularId para certificados de tipo ${tipo}.`, 400);
    }
    if (TIPOS_REQUIEREN_RANGO.includes(tipo) && (!fechaDesde || !fechaHasta)) {
      throw new AppError('VALIDATION_ERROR', `Faltan fechaDesde/fechaHasta para ${tipo}.`, 400);
    }

    const alumno = await prisma.alumno.findUnique({
      where: { id: alumnoId },
      include: {
        inscripciones: {
          where: { estado: 'ACTIVA' },
          include: {
            resolucion: { include: { aniosCurriculares: { include: { materias: true } } } },
            titulo: true,
          },
        },
      },
    });
    if (!alumno) throw new AppError(...ERRORS.ALUMNO_NOT_FOUND);

    const inscripcion = alumno.inscripciones[0];
    if (!inscripcion) {
      throw new AppError('SIN_INSCRIPCION_ACTIVA', 'El alumno no tiene inscripción activa.', 409);
    }

    let materiasRequeridas = [];
    let anioCurricular = null;

    if (tipo === 'PARA_RENDIR') {
      materiasRequeridas = inscripcion.resolucion.aniosCurriculares.flatMap((a) => a.materias);
    } else if (tipo === 'PARCIAL_ANIO') {
      anioCurricular = inscripcion.resolucion.aniosCurriculares.find((a) => a.id === anioCurricularId);
      if (!anioCurricular) throw new AppError(...ERRORS.ANIO_NOT_FOUND);
      materiasRequeridas = anioCurricular.materias;
    } else {
      // LABORAL, CONCURRENCIA, PARA_COLECTIVO, TITULO_COMPLETO
      materiasRequeridas = inscripcion.resolucion.aniosCurriculares.flatMap((a) => a.materias);
    }

    const cursadas = await prisma.cursadaMateria.findMany({
      where: {
        inscripcionId: inscripcion.id,
        materiaId: { in: materiasRequeridas.map((m) => m.id) },
      },
      include: { asistencias: true },
    });

    // Validaciones
    if (tipo === 'PARCIAL_ANIO' || tipo === 'TITULO_COMPLETO') {
      const faltantes = [];
      for (const materia of materiasRequeridas) {
        const cursada = cursadas.find((c) => c.materiaId === materia.id);
        if (!cursada || cursada.estado !== 'APROBADA') {
          faltantes.push({
            codigo: materia.codigo,
            nombre: materia.nombre,
            estado: cursada?.estado || 'NO_CURSADA',
          });
        }
      }
      if (faltantes.length > 0) {
        throw new AppError(
          'MATERIAS_PENDIENTES',
          `El alumno tiene ${faltantes.length} materia(s) pendiente(s).`,
          409,
          { faltantes }
        );
      }
    } else if (tipo === 'PARA_COLECTIVO') {
      const algunaRegular = cursadas.some((c) => ['REGULAR', 'APROBADA'].includes(c.estado));
      if (!algunaRegular) {
        throw new AppError(
          'REQUISITOS_NO_CUMPLIDOS',
          'El alumno no tiene materias regulares ni aprobadas.',
          409,
          { faltantes: [{ motivo: 'Sin materias regulares' }] }
        );
      }
    } else if (tipo === 'LABORAL') {
      const alguna = cursadas.some((c) => ['EN_CURSO', 'REGULAR', 'APROBADA'].includes(c.estado));
      if (!alguna) {
        throw new AppError(
          'REQUISITOS_NO_CUMPLIDOS',
          'El alumno no está cursando ninguna materia.',
          409,
          { faltantes: [{ motivo: 'SIN_CURSADAS_ACTIVAS' }] }
        );
      }
    } else if (tipo === 'CONCURRENCIA') {
      const desde = new Date(fechaDesde);
      const hasta = new Date(fechaHasta);
      const asistenciasRango = cursadas.flatMap((c) =>
        c.asistencias.filter((a) => a.fecha >= desde && a.fecha <= hasta)
      );
      if (asistenciasRango.length === 0) {
        throw new AppError(
          'REQUISITOS_NO_CUMPLIDOS',
          'No hay asistencias registradas en ese rango.',
          409,
          { faltantes: [{ motivo: 'SIN_ASISTENCIAS_EN_RANGO' }] }
        );
      }
      const efectivas = asistenciasRango.filter((a) => ['PRESENTE', 'JUSTIFICADO'].includes(a.estado)).length;
      const pct = Math.round((efectivas / asistenciasRango.length) * 100);
      if (pct < ASISTENCIA_MINIMA_POR_TIPO.CONCURRENCIA) {
        throw new AppError(
          'REQUISITOS_NO_CUMPLIDOS',
          `Asistencia insuficiente en el rango: ${pct}% (mínimo ${ASISTENCIA_MINIMA_POR_TIPO.CONCURRENCIA}%).`,
          409,
          {
            faltantes: [{
              motivo: 'ASISTENCIA_INSUFICIENTE',
              porcentaje: pct,
              minimoRequerido: ASISTENCIA_MINIMA_POR_TIPO.CONCURRENCIA,
            }],
          }
        );
      }
    }

    // Regla PARA_RENDIR
    if (tipo === 'PARA_RENDIR') {
      const dejoPasar = [];
      for (const materia of materiasRequeridas) {
        const cursada = cursadas.find((c) => c.materiaId === materia.id);
        if (!cursada || !['REGULAR', 'APROBADA'].includes(cursada.estado)) continue;
        const chequeo = await MesaExamenService.dejoPasarMesa(alumnoId, materia.id);
        if (chequeo.dejoPasar) {
          dejoPasar.push({
            materiaId: materia.id,
            codigo: materia.codigo,
            nombre: materia.nombre,
            cantidadAusencias: chequeo.cantidad,
            ultimaFecha: chequeo.ultimaFecha,
          });
        }
      }
      if (dejoPasar.length > 0) {
        throw new AppError(
          'DEJO_PASAR_MESA',
          `El alumno dejó pasar ${dejoPasar.length} mesa(s) sin avisar. No se puede emitir el certificado para rendir.`,
          409,
          { materias: dejoPasar }
        );
      }
    }

    return await prisma.certificado.create({
      data: {
        alumnoId,
        tituloId: inscripcion.tituloId,
        resolucionId: inscripcion.resolucionId,
        tipo,
        anioCurricularId: tipo === 'PARCIAL_ANIO' ? anioCurricularId : null,
        fechaEmision: new Date(),
        estado: 'EMITIDO',
      },
      include: {
        alumno: { select: { id: true, nombre: true, apellido: true, dni: true } },
        titulo: { select: { id: true, nombre: true, nivel: true } },
        resolucion: { select: { id: true, codigo: true } },
        anioCurricular: { select: { id: true, numeroAnio: true, nombre: true } },
      },
    });
  }

  static async anular(id) {
    const cert = await prisma.certificado.findUnique({ where: { id } });
    if (!cert) throw new AppError(...ERRORS.CERTIFICADO_NOT_FOUND);
    if (cert.estado === 'ANULADO') {
      throw new AppError('CERTIFICADO_YA_ANULADO', 'El certificado ya está anulado.', 409);
    }
    return await prisma.certificado.update({ where: { id }, data: { estado: 'ANULADO' } });
  }

  static async generarPDF(id) {
    const certificado = await prisma.certificado.findUnique({
      where: { id },
      include: { alumno: true, titulo: true, resolucion: true, anioCurricular: true },
    });
    if (!certificado) throw new AppError(...ERRORS.CERTIFICADO_NOT_FOUND);

    const inscripcion = await prisma.inscripcion.findFirst({
      where: { alumnoId: certificado.alumnoId, resolucionId: certificado.resolucionId },
      include: {
        resolucion: { include: { aniosCurriculares: { include: { materias: true } } } },
      },
    });
    if (!inscripcion) throw new AppError(...ERRORS.INSCRIPCION_NOT_FOUND);

    const baseDatos = {
      alumno: certificado.alumno,
      titulo: certificado.titulo,
      resolucion: certificado.resolucion,
      tipo: certificado.tipo,
      fechaEmision: certificado.fechaEmision,
      estado: certificado.estado,
    };

    // LABORAL — fecha de hoy, sin materia
    if (certificado.tipo === 'LABORAL') {
      const cursadas = await prisma.cursadaMateria.findMany({
        where: {
          inscripcionId: inscripcion.id,
          estado: { in: ['EN_CURSO', 'REGULAR', 'APROBADA'] },
        },
        take: 1,
      });
      if (cursadas.length === 0) {
        throw new AppError('SIN_CURSADAS', 'No hay cursadas activas para el certificado laboral.', 409);
      }
      return await generarCertificadoPDF({ ...baseDatos, fechaAsistencia: new Date() });
    }

    // PARA_COLECTIVO
    if (certificado.tipo === 'PARA_COLECTIVO') {
      const totalMaterias = inscripcion.resolucion.aniosCurriculares.flatMap((a) => a.materias).length;
      const aprobadas = await prisma.cursadaMateria.count({
        where: { inscripcionId: inscripcion.id, estado: 'APROBADA' },
      });
      return await generarCertificadoPDF({
        ...baseDatos,
        anioActual: null,
        materiasAprobadas: aprobadas,
        totalMaterias,
      });
    }

    // CONCURRENCIA — todas las cursadas del alumno
    if (certificado.tipo === 'CONCURRENCIA') {
      const cursadas = await prisma.cursadaMateria.findMany({
        where: { inscripcionId: inscripcion.id },
        include: {
          materia: true,
          asistencias: { orderBy: { fecha: 'asc' } },
        },
      });

      const detalle = [];
      for (const c of cursadas) {
        for (const a of c.asistencias) {
          detalle.push({
            fecha: a.fecha,
            estado: a.estado,
            observaciones: a.observaciones,
            materiaId: c.materia.id,
            materiaNombre: c.materia.nombre,
            materiaCodigo: c.materia.codigo,
          });
        }
      }
      detalle.sort((a, b) => new Date(a.fecha) - new Date(b.fecha));

      if (detalle.length === 0) {
        throw new AppError('SIN_ASISTENCIAS', 'No hay asistencias registradas.', 409);
      }

      const presentes = detalle.filter((d) => d.estado === 'PRESENTE').length;
      const justificados = detalle.filter((d) => d.estado === 'JUSTIFICADO').length;
      const ausentes = detalle.filter((d) => d.estado === 'AUSENTE').length;
      const total = detalle.length;
      const efectivas = presentes + justificados;
      const porcentaje = total > 0 ? Math.round((efectivas / total) * 100) : 0;

      return await generarCertificadoPDF({
        ...baseDatos,
        rango: { desde: detalle[0].fecha, hasta: detalle[detalle.length - 1].fecha },
        asistencias: { total, presentes, justificados, ausentes, efectivas, porcentaje, detalle },
      });
    }

    // Fallback (PARCIAL_ANIO, TITULO_COMPLETO, PARA_RENDIR)
    let materiasQuery;
    if (certificado.tipo === 'PARCIAL_ANIO') {
      materiasQuery = await prisma.cursadaMateria.findMany({
        where: {
          inscripcionId: inscripcion.id,
          estado: 'APROBADA',
          materia: { anioCurricularId: certificado.anioCurricularId },
        },
        include: { materia: true },
        orderBy: { materia: { codigo: 'asc' } },
      });
    } else if (certificado.tipo === 'TITULO_COMPLETO') {
      materiasQuery = await prisma.cursadaMateria.findMany({
        where: {
          inscripcionId: inscripcion.id,
          estado: 'APROBADA',
          materia: { anioCurricular: { resolucionId: certificado.resolucionId } },
        },
        include: { materia: true },
        orderBy: { materia: { codigo: 'asc' } },
      });
    } else {
      materiasQuery = await prisma.cursadaMateria.findMany({
        where: {
          inscripcionId: inscripcion.id,
          estado: { in: ['APROBADA', 'REGULAR'] },
          materia: { anioCurricular: { resolucionId: certificado.resolucionId } },
        },
        include: { materia: true },
        orderBy: { materia: { codigo: 'asc' } },
      });
    }

    const materias = materiasQuery.map((c) => ({
      codigo: c.materia.codigo,
      nombre: c.materia.nombre,
      estado: c.estado,
    }));

    return await generarCertificadoPDF({
      ...baseDatos,
      anio: certificado.anioCurricular,
      materias,
    });
  }
}