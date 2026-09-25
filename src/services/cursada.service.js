import prisma from '../config/db.js';
import { AppError, ERRORS } from '../utils/errors.js';

const TRANSICIONES_VALIDAS = {
  EN_CURSO: ['REGULAR', 'LIBRE', 'DESAPROBADA'],
  REGULAR: ['APROBADA', 'DESAPROBADA'],
  APROBADA: [],
  LIBRE: ['EN_CURSO'],
  DESAPROBADA: ['EN_CURSO'],
};

function validarTransicion(estadoActual, estadoNuevo) {
  if (!estadoActual) return true; // primera vez
  if (estadoActual === estadoNuevo) return true; // idempotente
  const permitidos = TRANSICIONES_VALIDAS[estadoActual] || [];
  return permitidos.includes(estadoNuevo);
}

export class CursadaService {
  static async registrar(alumnoId, data) {
    const { inscripcionId, materiaId, estado, notaCursada, notaFinal } = data;

    if (!materiaId || !estado) {
      throw new AppError('VALIDATION_ERROR', 'Faltan materiaId o estado.', 400);
    }

    if (!['EN_CURSO', 'REGULAR', 'APROBADA', 'LIBRE', 'DESAPROBADA'].includes(estado)) {
      throw new AppError('VALIDATION_ERROR', 'Estado inválido.', 400);
    }

    const alumno = await prisma.alumno.findUnique({ where: { id: alumnoId } });
    if (!alumno) {
      throw new AppError(...ERRORS.ALUMNO_NOT_FOUND);
    }

    const materia = await prisma.materia.findUnique({
      where: { id: materiaId },
      include: { anioCurricular: { include: { resolucion: true } } },
    });
    if (!materia) {
      throw new AppError(...ERRORS.MATERIA_NOT_FOUND);
    }

    // Determinar la inscripción a usar
    let inscripcion;
    if (inscripcionId) {
      inscripcion = await prisma.inscripcion.findUnique({ where: { id: inscripcionId } });
      if (!inscripcion || inscripcion.alumnoId !== alumnoId) {
        throw new AppError(...ERRORS.INSCRIPCION_NOT_FOUND);
      }
    } else {
      inscripcion = await prisma.inscripcion.findFirst({
        where: { alumnoId, resolucionId: materia.anioCurricular.resolucionId, estado: 'ACTIVA' },
      });
      if (!inscripcion) {
        throw new AppError(
          'SIN_INSCRIPCION',
          'El alumno no está inscripto en la resolución de esa materia.',
          409
        );
      }
    }

    // Validar que la materia pertenece a la resolución de la inscripción
    if (materia.anioCurricular.resolucionId !== inscripcion.resolucionId) {
      throw new AppError(
        'MATERIA_FUERA_DE_RESOLUCION',
        'La materia no pertenece a la resolución de la inscripción.',
        400
      );
    }

    // Validar que la resolución esté vigente
    if (materia.anioCurricular.resolucion.estado === 'CERRADA') {
      throw new AppError(...ERRORS.RESOLUCION_CERRADA);
    }

    // Buscar cursada existente
    const cursadaExistente = await prisma.cursadaMateria.findUnique({
      where: {
        inscripcionId_materiaId: {
          inscripcionId: inscripcion.id,
          materiaId,
        },
      },
    });

    // Validar transición
    if (cursadaExistente && !validarTransicion(cursadaExistente.estado, estado)) {
      throw new AppError(
        'TRANSICION_INVALIDA',
        `No se puede pasar de ${cursadaExistente.estado} a ${estado}.`,
        400
      );
    }

    // Validar correlativas
    if (estado === 'EN_CURSO' || estado === 'REGULAR') {
      await this.validarCorrelativas(inscripcion.id, materiaId, 'PARA_CURSAR');
    }
    if (estado === 'APROBADA') {
      await this.validarCorrelativas(inscripcion.id, materiaId, 'PARA_RENDIR_FINAL');
    }

    // Crear o actualizar
    if (cursadaExistente) {
      return await prisma.cursadaMateria.update({
        where: { id: cursadaExistente.id },
        data: {
          estado,
          ...(notaCursada !== undefined && { notaCursada }),
          ...(notaFinal !== undefined && { notaFinal }),
          fechaEstado: new Date(),
        },
        include: {
          materia: { select: { id: true, nombre: true, codigo: true } },
        },
      });
    }

    return await prisma.cursadaMateria.create({
      data: {
        inscripcionId: inscripcion.id,
        materiaId,
        estado,
        notaCursada: notaCursada !== undefined ? notaCursada : null,
        notaFinal: notaFinal !== undefined ? notaFinal : null,
        fechaEstado: new Date(),
      },
      include: {
        materia: { select: { id: true, nombre: true, codigo: true } },
      },
    });
  }

  static async validarCorrelativas(inscripcionId, materiaId, tipoCorrelativa) {
    const correlativas = await prisma.correlatividad.findMany({
      where: { materiaId, tipo: tipoCorrelativa },
      include: {
        materiaRequerida: { select: { id: true, nombre: true, codigo: true } },
      },
    });

    if (correlativas.length === 0) return;

    const materiasRequeridasIds = correlativas.map((c) => c.materiaRequeridaId);
    const cursadasRequeridas = await prisma.cursadaMateria.findMany({
      where: {
        inscripcionId,
        materiaId: { in: materiasRequeridasIds },
      },
    });

    const estadosAceptables = tipoCorrelativa === 'PARA_CURSAR'
      ? ['REGULAR', 'APROBADA']
      : ['APROBADA'];

    const faltantes = [];
    for (const corr of correlativas) {
      const cursada = cursadasRequeridas.find((c) => c.materiaId === corr.materiaRequeridaId);
      if (!cursada || !estadosAceptables.includes(cursada.estado)) {
        faltantes.push({
          materiaId: corr.materiaRequeridaId,
          materiaNombre: corr.materiaRequerida.nombre,
          materiaCodigo: corr.materiaRequerida.codigo,
          estadoActual: cursada?.estado || 'NO_CURSADA',
          estadoRequerido: tipoCorrelativa === 'PARA_CURSAR' ? 'REGULAR' : 'APROBADA',
        });
      }
    }

    if (faltantes.length > 0) {
      throw new AppError(
        'CORRELATIVA_NO_CUMPLE',
        'No se cumplen las correlatividades requeridas.',
        409,
        { faltantes, tipo: tipoCorrelativa }
      );
    }
  }

  static async listarPorInscripcion(inscripcionId) {
    const inscripcion = await prisma.inscripcion.findUnique({ where: { id: inscripcionId } });
    if (!inscripcion) {
      throw new AppError(...ERRORS.INSCRIPCION_NOT_FOUND);
    }

    return await prisma.cursadaMateria.findMany({
      where: { inscripcionId },
      include: {
        materia: {
          select: {
            id: true, nombre: true, codigo: true,
            anioCurricular: { select: { numeroAnio: true } },
          },
        },
      },
      orderBy: { fechaEstado: 'desc' },
    });
  }

  static async historiaAcademica(alumnoId) {
    const alumno = await prisma.alumno.findUnique({
      where: { id: alumnoId },
      include: {
        inscripciones: {
          include: {
            titulo: true,
            resolucion: {
              include: {
                aniosCurriculares: {
                  include: {
                    materias: {
                      include: {
                        cursadas: {
                          where: { inscripcion: { alumnoId } },
                        },
                      },
                    },
                  },
                },
              },
            },
            cursadas: {
              include: {
                materia: { select: { id: true, nombre: true, codigo: true } },
              },
            },
          },
          orderBy: { fechaInscripcion: 'desc' },
        },
      },
    });

    if (!alumno) {
      throw new AppError(...ERRORS.ALUMNO_NOT_FOUND);
    }

    const historial = alumno.inscripciones.map((inscripcion) => {
      const anios = inscripcion.resolucion.aniosCurriculares
        .sort((a, b) => a.numeroAnio - b.numeroAnio)
        .map((anio) => {
          const materias = anio.materias.map((materia) => {
            const cursada = materia.cursadas[0];
            return {
              materiaId: materia.id,
              codigo: materia.codigo,
              nombre: materia.nombre,
              estado: cursada?.estado || 'NO_CURSADA',
              notaCursada: cursada?.notaCursada || null,
              notaFinal: cursada?.notaFinal || null,
              esEquivalencia: cursada?.esEquivalencia || false,
            };
          });

          const aprobadas = materias.filter((m) => m.estado === 'APROBADA').length;
          const regulares = materias.filter((m) => m.estado === 'REGULAR').length;
          const enCurso = materias.filter((m) => m.estado === 'EN_CURSO').length;

          return {
            anioId: anio.id,
            numeroAnio: anio.numeroAnio,
            nombre: anio.nombre,
            totalMaterias: materias.length,
            aprobadas,
            regulares,
            enCurso,
            materias,
          };
        });

      const totalMaterias = anios.reduce((acc, a) => acc + a.totalMaterias, 0);
      const totalAprobadas = anios.reduce((acc, a) => acc + a.aprobadas, 0);
      const porcentajeAvance = totalMaterias > 0
        ? Math.round((totalAprobadas / totalMaterias) * 100)
        : 0;

      return {
        inscripcionId: inscripcion.id,
        titulo: {
          id: inscripcion.titulo.id,
          nombre: inscripcion.titulo.nombre,
          nivel: inscripcion.titulo.nivel,
        },
        resolucion: {
          id: inscripcion.resolucion.id,
          codigo: inscripcion.resolucion.codigo,
          estado: inscripcion.resolucion.estado,
        },
        estado: inscripcion.estado,
        fechaInscripcion: inscripcion.fechaInscripcion,
        esCambioCarrera: inscripcion.esCambioCarrera,
        totalMaterias,
        totalAprobadas,
        porcentajeAvance,
        anios,
      };
    });

    return {
      alumno: {
        id: alumno.id,
        nombre: alumno.nombre,
        apellido: alumno.apellido,
        dni: alumno.dni,
        email: alumno.email,
      },
      inscripciones: historial,
    };
  }
}