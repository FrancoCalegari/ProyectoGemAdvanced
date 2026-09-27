import prisma from '../config/db.js';
import { AppError, ERRORS } from '../utils/errors.js';
import { generarCertificadoPDF } from '../utils/pdf.js';

export class CertificadoService {
  static async listarPorAlumno(alumnoId) {
    const alumno = await prisma.alumno.findUnique({ where: { id: alumnoId } });
    if (!alumno) {
      throw new AppError(...ERRORS.ALUMNO_NOT_FOUND);
    }

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
    const certificado = await prisma.certificado.findUnique({
      where: { id },
      include: {
        alumno: { select: { id: true, nombre: true, apellido: true, dni: true, email: true } },
        titulo: { select: { id: true, nombre: true, nivel: true } },
        resolucion: { select: { id: true, codigo: true, estado: true } },
        anioCurricular: { select: { id: true, numeroAnio: true, nombre: true } },
      },
    });

    if (!certificado) {
      throw new AppError(...ERRORS.CERTIFICADO_NOT_FOUND);
    }

    return certificado;
  }

  static async solicitar(alumnoId, data) {
    const { tipo, anioCurricularId } = data;

    if (!tipo || (tipo !== 'PARCIAL_ANIO' && tipo !== 'TITULO_COMPLETO')) {
      throw new AppError('VALIDATION_ERROR', 'El tipo debe ser PARCIAL_ANIO o TITULO_COMPLETO.', 400);
    }

    if (tipo === 'PARCIAL_ANIO' && !anioCurricularId) {
      throw new AppError('VALIDATION_ERROR', 'Falta anioCurricularId para certificados parciales.', 400);
    }

    const alumno = await prisma.alumno.findUnique({
      where: { id: alumnoId },
      include: {
        inscripciones: {
          where: { estado: 'ACTIVA' },
          include: {
            resolucion: {
              include: {
                aniosCurriculares: {
                  include: { materias: true },
                },
              },
            },
            titulo: true,
          },
        },
      },
    });

    if (!alumno) {
      throw new AppError(...ERRORS.ALUMNO_NOT_FOUND);
    }

    const inscripcion = alumno.inscripciones[0];
    if (!inscripcion) {
      throw new AppError('SIN_INSCRIPCION_ACTIVA', 'El alumno no tiene inscripción activa.', 409);
    }

    // Validar materias aprobadas
    let materiasRequeridas = [];
    let anioCurricular = null;

    if (tipo === 'PARCIAL_ANIO') {
      anioCurricular = inscripcion.resolucion.aniosCurriculares.find((a) => a.id === anioCurricularId);
      if (!anioCurricular) {
        throw new AppError(...ERRORS.ANIO_NOT_FOUND);
      }
      materiasRequeridas = anioCurricular.materias;
    } else {
      materiasRequeridas = inscripcion.resolucion.aniosCurriculares.flatMap((a) => a.materias);
    }

    const cursadas = await prisma.cursadaMateria.findMany({
      where: {
        inscripcionId: inscripcion.id,
        materiaId: { in: materiasRequeridas.map((m) => m.id) },
      },
    });

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

    // Crear el certificado
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
    const certificado = await prisma.certificado.findUnique({ where: { id } });
    if (!certificado) {
      throw new AppError(...ERRORS.CERTIFICADO_NOT_FOUND);
    }

    if (certificado.estado === 'ANULADO') {
      throw new AppError('CERTIFICADO_YA_ANULADO', 'El certificado ya está anulado.', 409);
    }

    return await prisma.certificado.update({
      where: { id },
      data: { estado: 'ANULADO' },
    });
  }

  static async generarPDF(id) {
    const certificado = await prisma.certificado.findUnique({
      where: { id },
      include: {
        alumno: true,
        titulo: true,
        resolucion: true,
        anioCurricular: true,
      },
    });

    if (!certificado) {
      throw new AppError(...ERRORS.CERTIFICADO_NOT_FOUND);
    }

    // Obtener las materias aprobadas
    const inscripcion = await prisma.inscripcion.findFirst({
      where: {
        alumnoId: certificado.alumnoId,
        resolucionId: certificado.resolucionId,
      },
    });

    if (!inscripcion) {
      throw new AppError(...ERRORS.INSCRIPCION_NOT_FOUND);
    }

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
    } else {
      materiasQuery = await prisma.cursadaMateria.findMany({
        where: {
          inscripcionId: inscripcion.id,
          estado: 'APROBADA',
          materia: {
            anioCurricular: { resolucionId: certificado.resolucionId },
          },
        },
        include: { materia: true },
        orderBy: { materia: { codigo: 'asc' } },
      });
    }

    const materias = materiasQuery.map((c) => ({
      codigo: c.materia.codigo,
      nombre: c.materia.nombre,
    }));

    return await generarCertificadoPDF({
      alumno: certificado.alumno,
      titulo: certificado.titulo,
      resolucion: certificado.resolucion,
      tipo: certificado.tipo,
      anio: certificado.anioCurricular,
      materias,
      fechaEmision: certificado.fechaEmision,
      estado: certificado.estado,
    });
  }
}