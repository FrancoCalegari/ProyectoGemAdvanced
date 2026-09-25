import prisma from '../config/db.js';
import { AppError, ERRORS } from '../utils/errors.js';
import { AdmisionService } from './admision.service.js';

const ESTADOS_TRANSFERIBLES = ['APROBADA'];

export class CambioCarreraService {
  static async cambiar(alumnoId, data) {
    const { tituloDestinoId, inscripcionOrigenId, darBajaOrigen } = data;

    if (!tituloDestinoId) {
      throw new AppError('VALIDATION_ERROR', 'Falta tituloDestinoId.', 400);
    }

    const alumno = await prisma.alumno.findUnique({
      where: { id: alumnoId },
      include: {
        inscripciones: {
          include: {
            titulo: true,
            resolucion: true,
          },
        },
      },
    });

    if (!alumno) {
      throw new AppError(...ERRORS.ALUMNO_NOT_FOUND);
    }

    const admision = await AdmisionService.evaluarAdmision(alumnoId);
    if (!admision.puedeInscribirse) {
      throw new AppError(
        'ADMISION_RECHAZADA',
        'El alumno no cumple los requisitos de admisión.',
        409,
        {
          faltantes: admision.faltantes,
          mensajes: admision.mensajes,
        }
      );
    }

    // Buscar inscripción de origen
    let inscripcionOrigen;
    if (inscripcionOrigenId) {
      inscripcionOrigen = alumno.inscripciones.find((i) => i.id === inscripcionOrigenId);
      if (!inscripcionOrigen) {
        throw new AppError(...ERRORS.INSCRIPCION_NOT_FOUND);
      }
    } else {
      inscripcionOrigen = alumno.inscripciones.find((i) => i.estado === 'ACTIVA');
      if (!inscripcionOrigen) {
        throw new AppError(
          'SIN_INSCRIPCION_ACTIVA',
          'El alumno no tiene inscripción activa de origen.',
          409
        );
      }
    }

    if (inscripcionOrigen.tituloId === tituloDestinoId) {
      throw new AppError(
        'MISMO_TITULO',
        'El título origen y destino son el mismo.',
        400
      );
    }

    const tituloDestino = await prisma.titulo.findUnique({
      where: { id: tituloDestinoId },
    });
    if (!tituloDestino) {
      throw new AppError(...ERRORS.TITULO_NOT_FOUND);
    }

    const resolucionVigenteDestino = await prisma.resolucion.findFirst({
      where: { tituloId: tituloDestinoId, estado: 'VIGENTE' },
    });
    if (!resolucionVigenteDestino) {
      throw new AppError(...ERRORS.SIN_RESOLUCION_VIGENTE);
    }

    // Verificar si ya existe inscripción al título destino con la misma resolución
    const existenteDestino = await prisma.inscripcion.findUnique({
      where: {
        alumnoId_tituloId_resolucionId: {
          alumnoId,
          tituloId: tituloDestinoId,
          resolucionId: resolucionVigenteDestino.id,
        },
      },
    });
    if (existenteDestino) {
      throw new AppError(...ERRORS.INSCRIPCION_DUP);
    }

    // Obtener cursadas aprobadas del alumno en el origen
    const cursadasOrigen = await prisma.cursadaMateria.findMany({
      where: {
        inscripcionId: inscripcionOrigen.id,
        estado: { in: ESTADOS_TRANSFERIBLES },
      },
      include: {
        materia: true,
      },
    });

    // Buscar equivalencias para cada cursada aprobada
    const equivalenciasAplicadas = [];

    for (const cursada of cursadasOrigen) {
      const equivalencias = await prisma.equivalencia.findMany({
        where: { materiaOrigenId: cursada.materiaId },
        include: {
          materiaDestino: {
            include: { anioCurricular: true },
          },
        },
      });

      for (const eq of equivalencias) {
        // Verificar que la materia destino pertenece a la resolución vigente del título destino
        const materiaDestinoCompleta = await prisma.materia.findUnique({
          where: { id: eq.materiaDestinoId },
          include: { anioCurricular: true },
        });

        if (
          materiaDestinoCompleta &&
          materiaDestinoCompleta.anioCurricular.resolucionId === resolucionVigenteDestino.id
        ) {
          equivalenciasAplicadas.push({
            materiaOrigenId: cursada.materiaId,
            materiaOrigenNombre: cursada.materia.nombre,
            materiaDestinoId: eq.materiaDestinoId,
            materiaDestinoNombre: eq.materiaDestino.nombre,
            estadoAplicado: cursada.estado,
            notaCursada: cursada.notaCursada,
            notaFinal: cursada.notaFinal,
          });
        }
      }
    }

    // Todo en una transacción
    const resultado = await prisma.$transaction(async (tx) => {
      // 1. Crear la nueva inscripción
      const inscripcionNueva = await tx.inscripcion.create({
        data: {
          alumnoId,
          tituloId: tituloDestinoId,
          resolucionId: resolucionVigenteDestino.id,
          fechaInscripcion: new Date(),
          estado: 'ACTIVA',
          esCambioCarrera: true,
          inscripcionOrigenId: inscripcionOrigen.id,
        },
        include: {
          titulo: { select: { id: true, nombre: true, nivel: true } },
          resolucion: { select: { id: true, codigo: true, estado: true } },
        },
      });

      // 2. Crear las cursadas por equivalencia
      for (const eq of equivalenciasAplicadas) {
        await tx.cursadaMateria.create({
          data: {
            inscripcionId: inscripcionNueva.id,
            materiaId: eq.materiaDestinoId,
            estado: 'APROBADA',
            notaCursada: eq.notaCursada,
            notaFinal: eq.notaFinal,
            fechaEstado: new Date(),
            esEquivalencia: true,
          },
        });
      }

      // 3. Dar de baja la inscripción origen si se pidió
      let inscripcionOrigenActualizada = null;
      if (darBajaOrigen !== false) {
        inscripcionOrigenActualizada = await tx.inscripcion.update({
          where: { id: inscripcionOrigen.id },
          data: { estado: 'BAJA' },
        });
      }

      return { inscripcionNueva, inscripcionOrigenActualizada };
    });

    // Contar materias totales del título destino y cuántas quedan pendientes
    const totalMaterias = await prisma.materia.count({
      where: {
        anioCurricular: { resolucionId: resolucionVigenteDestino.id },
      },
    });

    return {
      inscripcionNueva: resultado.inscripcionNueva,
      inscripcionOrigen: resultado.inscripcionOrigenActualizada,
      equivalenciasAplicadas,
      totalMaterias,
      materiasPendientes: totalMaterias - equivalenciasAplicadas.length,
    };
  }
}