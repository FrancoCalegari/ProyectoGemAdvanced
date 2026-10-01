import prisma from '../config/db.js';
import { AppError, ERRORS } from '../utils/errors.js';

const EDAD_MINIMA_SIN_SECUNDARIO = 25;

function calcularEdad(fechaNacimiento) {
  const hoy = new Date();
  const nacimiento = new Date(fechaNacimiento);
  let edad = hoy.getFullYear() - nacimiento.getFullYear();
  const mes = hoy.getMonth() - nacimiento.getMonth();
  if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
    edad--;
  }
  return edad;
}

export class AdmisionService {
  static async evaluarAdmision(alumnoId) {
    const alumno = await prisma.alumno.findUnique({
      where: { id: alumnoId },
      include: {
        examenes: { orderBy: { fecha: 'desc' } },
      },
    });

    if (!alumno) throw new AppError(...ERRORS.ALUMNO_NOT_FOUND);

    const edad = calcularEdad(alumno.fechaNacimiento);
    const faltantes = [];
    const mensajes = [];

    if (!alumno.tienePartidaNacimiento) {
      faltantes.push('tienePartidaNacimiento');
      mensajes.push('Falta partida de nacimiento actualizada.');
    }

    if (alumno.tieneAnaliticoSecundario) {
      return {
        alumnoId: alumno.id, edad,
        documentacionCompleta: faltantes.length === 0,
        requiereExamen: false, examenAprobado: null,
        puedeInscribirse: faltantes.length === 0,
        faltantes, mensajes,
      };
    }

    if (edad < EDAD_MINIMA_SIN_SECUNDARIO) {
      faltantes.push('tieneAnaliticoSecundario');
      mensajes.push('Falta analítico del secundario completo.');
      return {
        alumnoId: alumno.id, edad,
        documentacionCompleta: false,
        requiereExamen: false, examenAprobado: null,
        puedeInscribirse: false,
        faltantes, mensajes,
      };
    }

    if (!alumno.tieneAnaliticoIncompleto) {
      faltantes.push('tieneAnaliticoIncompleto');
      mensajes.push('Falta analítico del secundario incompleto.');
    }
    if (!alumno.tieneCertificado7mo) {
      faltantes.push('tieneCertificado7mo');
      mensajes.push('Falta certificado de finalización de 7º grado.');
    }

    const examenAprobado = alumno.examenes.some((e) => e.resultado === 'APROBADO');
    if (!examenAprobado) {
      mensajes.push('Debe rendir y aprobar el examen nivelatorio.');
    }

    return {
      alumnoId: alumno.id, edad,
      documentacionCompleta: faltantes.length === 0,
      requiereExamen: true, examenAprobado,
      puedeInscribirse: faltantes.length === 0 && examenAprobado,
      faltantes, mensajes,
    };
  }

  static async listarExamenes(alumnoId) {
    const alumno = await prisma.alumno.findUnique({ where: { id: alumnoId } });
    if (!alumno) throw new AppError(...ERRORS.ALUMNO_NOT_FOUND);

    return await prisma.examenNivelatorio.findMany({
      where: { alumnoId },
      include: { mesaExamen: true },
      orderBy: { fecha: 'desc' },
    });
  }

  static async crearExamen(alumnoId, data) {
    const alumno = await prisma.alumno.findUnique({ where: { id: alumnoId } });
    if (!alumno) throw new AppError(...ERRORS.ALUMNO_NOT_FOUND);

    const { fecha, hora, lugar, articulo, resultado, nota, observaciones, nuevaFecha, nuevaHora, nuevoLugar } = data;

    if (!fecha) throw new AppError('VALIDATION_ERROR', 'Falta la fecha del examen.', 400);

    const resultadoNorm = resultado || 'PENDIENTE';
    if (!['PENDIENTE', 'APROBADO', 'DESAPROBADO'].includes(resultadoNorm)) {
      throw new AppError('VALIDATION_ERROR', 'Resultado inválido.', 400);
    }

    // Validaciones condicionales
    if (resultadoNorm === 'APROBADO') {
      if (nota === undefined || nota === null) {
        throw new AppError('VALIDATION_ERROR', 'Para APROBADO se requiere nota.', 400);
      }
      if (!hora) throw new AppError('VALIDATION_ERROR', 'Para APROBADO se requiere hora.', 400);
      if (!lugar) throw new AppError('VALIDATION_ERROR', 'Para APROBADO se requiere lugar.', 400);
    }

    const fechaNorm = new Date(fecha);
    fechaNorm.setUTCHours(0, 0, 0, 0);

    // Transacción: crear examen + efectos colaterales
    return await prisma.$transaction(async (tx) => {
      const examen = await tx.examenNivelatorio.create({
        data: {
          alumnoId,
          fecha: fechaNorm,
          hora: hora || null,
          lugar: lugar || null,
          articulo: articulo || null,
          resultado: resultadoNorm,
          nota: nota !== undefined && nota !== null ? nota : null,
          observaciones: observaciones || null,
        },
      });

      let mesaCreada = null;
      let nuevoExamen = null;

      // Si APROBADO → crear mesa de ingreso
      if (resultadoNorm === 'APROBADO') {
        const observacionesMesa = articulo
          ? `Ingreso ${articulo} — ${alumno.apellido}, ${alumno.nombre}`
          : `Ingreso nivelatorio — ${alumno.apellido}, ${alumno.nombre}`;

        mesaCreada = await tx.mesaExamen.create({
          data: {
            tipoMesa: 'INGRESO_NIVELATORIO',
            materiaId: null,
            examenNivelatorioId: examen.id,
            fecha: fechaNorm,
            hora: hora,
            aula: lugar,
            observaciones: observacionesMesa,
            estado: 'FINALIZADA',
          },
        });

        // Inscribir al alumno automáticamente como PRESENTE
        await tx.inscripcionMesa.create({
          data: {
            mesaId: mesaCreada.id,
            alumnoId,
            estado: 'PRESENTE',
            nota: nota,
          },
        });
      }

      // Si DESAPROBADO y hay nuevaFecha → crear nuevo examen PENDIENTE
      if (resultadoNorm === 'DESAPROBADO' && nuevaFecha) {
        const nuevaFechaNorm = new Date(nuevaFecha);
        nuevaFechaNorm.setUTCHours(0, 0, 0, 0);

        nuevoExamen = await tx.examenNivelatorio.create({
          data: {
            alumnoId,
            fecha: nuevaFechaNorm,
            hora: nuevaHora || null,
            lugar: nuevoLugar || null,
            articulo: articulo || null,
            resultado: 'PENDIENTE',
            observaciones: 'Reprogramado automáticamente tras desaprobar.',
          },
        });
      }

      return { examen, mesaCreada, nuevoExamen };
    });
  }

  static async actualizarExamen(alumnoId, examenId, data) {
    const examen = await prisma.examenNivelatorio.findUnique({ where: { id: examenId } });
    if (!examen || examen.alumnoId !== alumnoId) {
      throw new AppError('EXAMEN_NOT_FOUND', 'Examen nivelatorio no encontrado.', 404);
    }

    if (data.resultado && !['PENDIENTE', 'APROBADO', 'DESAPROBADO'].includes(data.resultado)) {
      throw new AppError('VALIDATION_ERROR', 'Resultado inválido.', 400);
    }

    return await prisma.examenNivelatorio.update({
      where: { id: examenId },
      data: {
        ...(data.fecha && { fecha: new Date(data.fecha) }),
        ...(data.hora !== undefined && { hora: data.hora || null }),
        ...(data.lugar !== undefined && { lugar: data.lugar || null }),
        ...(data.articulo !== undefined && { articulo: data.articulo || null }),
        ...(data.resultado && { resultado: data.resultado }),
        ...(data.nota !== undefined && { nota: data.nota }),
        ...(data.observaciones !== undefined && { observaciones: data.observaciones || null }),
      },
    });
  }
}