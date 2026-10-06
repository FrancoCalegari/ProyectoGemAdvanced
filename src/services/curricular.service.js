import prisma from '../config/db.js';
import { AppError, ERRORS } from '../utils/errors.js';

export class CurricularService {
  static async crearAnioCurricular(resolucionId, data) {
    const { numeroAnio, nombre } = data;

    const resolucion = await prisma.resolucion.findUnique({
      where: { id: resolucionId },
    });

    if (!resolucion) {
      throw new AppError(...ERRORS.RESOLUCION_NOT_FOUND);
    }

    if (resolucion.estado === 'CERRADA') {
      throw new AppError(...ERRORS.RESOLUCION_CERRADA);
    }

    return await prisma.anioCurricular.create({
      data: {
        resolucionId,
        numeroAnio,
        nombre,
      },
    });
  }

  static async crearMateria(anioCurricularId, data) {
    const { nombre, codigo, cargaHoraria, tipoCursada, descripcion, contenidosMinimos, objetivos } = data;

    const anio = await prisma.anioCurricular.findUnique({
      where: { id: anioCurricularId },
      include: { resolucion: true },
    });

    if (!anio) {
      throw new AppError(...ERRORS.ANIO_NOT_FOUND);
    }

    if (anio.resolucion.estado === 'CERRADA') {
      throw new AppError(...ERRORS.RESOLUCION_CERRADA);
    }

    return await prisma.materia.create({
      data: {
        anioCurricularId,
        nombre,
        codigo,
        cargaHoraria,
          tipoCursada,
        descripcion: descripcion || null,
        contenidosMinimos: contenidosMinimos || null,
        objetivos: objetivos || null,
      },
    });
  }

  static async obtenerPlanPorResolucion(resolucionId) {
    const resolucion = await prisma.resolucion.findUnique({
      where: { id: resolucionId },
    });

    if (!resolucion) {
      throw new AppError(...ERRORS.RESOLUCION_NOT_FOUND);
    }

    return await prisma.anioCurricular.findMany({
      where: { resolucionId },
      include: {
        materias: {
          orderBy: { codigo: 'asc' },
        },
      },
      orderBy: { numeroAnio: 'asc' },
    });
  }

  static async listarMateriasDeAnio(anioId) {
    const anio = await prisma.anioCurricular.findUnique({
      where: { id: anioId },
    });

    if (!anio) {
      throw new AppError(...ERRORS.ANIO_NOT_FOUND);
    }

    return await prisma.materia.findMany({
      where: { anioCurricularId: anioId },
      orderBy: { codigo: 'asc' },
    });
  }

  static async obtenerMateriaPorId(id) {
    const materia = await prisma.materia.findUnique({
      where: { id },
      include: {
        anioCurricular: {
          include: {
            resolucion: {
              include: { titulo: true },
            },
          },
        },
        correlativasParaEsta: {
          include: {
            materiaRequerida: {
              select: { id: true, nombre: true, codigo: true },
            },
          },
        },
        esCorrelativaDe: {
          include: {
            materia: {
              select: { id: true, nombre: true, codigo: true },
            },
          },
        },
        profesores: {
          include: {
            profesor: {
              select: { id: true, nombre: true, apellido: true, email: true },
            },
          },
        },
      },
    });
    if (!materia) {
      throw new AppError('MATERIA_NOT_FOUND', 'Materia no encontrada.', 404);
    }
    return materia;
  }

  static async actualizarMateria(id, data) {
    const materia = await prisma.materia.findUnique({
      where: { id },
      include: { anioCurricular: { include: { resolucion: true } } },
    });

    if (!materia) {
      throw new AppError(...ERRORS.MATERIA_NOT_FOUND);
    }

    if (materia.anioCurricular.resolucion.estado === 'CERRADA') {
      throw new AppError(...ERRORS.RESOLUCION_CERRADA);
    }

    if (data.codigo && data.codigo !== materia.codigo) {
      const existente = await prisma.materia.findFirst({
        where: {
          anioCurricularId: materia.anioCurricularId,
          codigo: data.codigo,
        },
      });
      if (existente) {
        throw new AppError(...ERRORS.MATERIA_CODIGO_DUP);
      }
    }

    return await prisma.materia.update({
      where: { id },
      data: {
        ...(data.nombre && { nombre: data.nombre }),
        ...(data.codigo && { codigo: data.codigo }),
        ...(data.cargaHoraria && { cargaHoraria: data.cargaHoraria }),
        ...(data.tipoCursada && { tipoCursada: data.tipoCursada }),
        ...(data.descripcion !== undefined && { descripcion: data.descripcion || null }),
        ...(data.contenidosMinimos !== undefined && { contenidosMinimos: data.contenidosMinimos || null }),
        ...(data.objetivos !== undefined && { objetivos: data.objetivos || null }),
      },
    });
  }

  static async eliminarMateria(id) {
    const materia = await prisma.materia.findUnique({
      where: { id },
      include: {
        anioCurricular: { include: { resolucion: true } },
        _count: {
          select: {
            cursadas: true,
            correlativasParaEsta: true,
            esCorrelativaDe: true,
          },
        },
      },
    });

    if (!materia) {
      throw new AppError(...ERRORS.MATERIA_NOT_FOUND);
    }

    if (materia.anioCurricular.resolucion.estado === 'CERRADA') {
      throw new AppError(...ERRORS.RESOLUCION_CERRADA);
    }

    if (materia._count.cursadas > 0) {
      throw new AppError(
        'MATERIA_CON_CURSADAS',
        `No se puede eliminar: la materia tiene ${materia._count.cursadas} cursada(s) registrada(s).`,
        409
      );
    }

    if (materia._count.correlativasParaEsta > 0 || materia._count.esCorrelativaDe > 0) {
      throw new AppError(
        'MATERIA_CON_CORRELATIVAS',
        'No se puede eliminar: la materia tiene correlatividades asociadas.',
        409
      );
    }

    return await prisma.materia.delete({ where: { id } });
  }

  // ============================================================
  // Listar TODAS las materias con info completa (para selects)
  // ============================================================
  static async listarTodasLasMaterias() {
    return await prisma.materia.findMany({
      include: {
        anioCurricular: {
          select: {
            id: true,
            numeroAnio: true,
            nombre: true,
            resolucion: {
              select: {
                id: true,
                codigo: true,
                titulo: { select: { id: true, nombre: true, nivel: true } },
              },
            },
          },
        },
      },
      orderBy: [
        { anioCurricular: { resolucion: { titulo: { nombre: 'asc' } } } },
        { anioCurricular: { numeroAnio: 'asc' } },
        { nombre: 'asc' },
      ],
    });
  }
  // ============================================================
  // Listar alumnos cursando una materia (con su cursada)
  // ============================================================
  static async listarCursadasDeMateria(materiaId) {
    const materia = await prisma.materia.findUnique({ where: { id: materiaId } });
    if (!materia) {
      throw new AppError('MATERIA_NOT_FOUND', 'Materia no encontrada.', 404);
    }
    const cursadas = await prisma.cursadaMateria.findMany({
      where: { materiaId },
      include: {
        inscripcion: {
          include: {
            alumno: { select: { id: true, nombre: true, apellido: true, dni: true, email: true } },
          },
        },
      },
      orderBy: { inscripcion: { alumno: { apellido: 'asc' } } },
    });
    return cursadas.map((c) => ({
      cursadaId: c.id,
      estado: c.estado,
      notaCursada: c.notaCursada,
      notaFinal: c.notaFinal,
      esEquivalencia: c.esEquivalencia,
      fechaEstado: c.fechaEstado,
      alumno: c.inscripcion.alumno,
      inscripcionId: c.inscripcionId,
    }));
  }
}