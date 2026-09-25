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
        examenes: {
          orderBy: { fecha: 'desc' },
        },
      },
    });

    if (!alumno) {
      throw new AppError(...ERRORS.ALUMNO_NOT_FOUND);
    }

    const edad = calcularEdad(alumno.fechaNacimiento);
    const faltantes = [];
    const mensajes = [];

    // Partida de nacimiento: SIEMPRE obligatoria
    if (!alumno.tienePartidaNacimiento) {
      faltantes.push('tienePartidaNacimiento');
      mensajes.push('Falta partida de nacimiento actualizada.');
    }

    // Analítico del secundario completo
    if (alumno.tieneAnaliticoSecundario) {
      // Caso: tiene secundario completo → no requiere examen
      return {
        alumnoId: alumno.id,
        edad,
        documentacionCompleta: faltantes.length === 0,
        requiereExamen: false,
        examenAprobado: null,
        puedeInscribirse: faltantes.length === 0,
        faltantes,
        mensajes,
      };
    }

    // Si es menor de 25 → no tiene secundario completo pero tampoco es "mayor sin secundario"
    if (edad < EDAD_MINIMA_SIN_SECUNDARIO) {
      faltantes.push('tieneAnaliticoSecundario');
      mensajes.push('Falta analítico del secundario completo.');
      return {
        alumnoId: alumno.id,
        edad,
        documentacionCompleta: false,
        requiereExamen: false,
        examenAprobado: null,
        puedeInscribirse: false,
        faltantes,
        mensajes,
      };
    }

    // Caso: mayor de 25 SIN secundario completo → requiere examen nivelatorio
    // Necesita: analítico incompleto + certificado de 7º grado + examen aprobado

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
      alumnoId: alumno.id,
      edad,
      documentacionCompleta: faltantes.length === 0,
      requiereExamen: true,
      examenAprobado,
      puedeInscribirse: faltantes.length === 0 && examenAprobado,
      faltantes,
      mensajes,
    };
  }

  static async listarExamenes(alumnoId) {
    const alumno = await prisma.alumno.findUnique({ where: { id: alumnoId } });
    if (!alumno) {
      throw new AppError(...ERRORS.ALUMNO_NOT_FOUND);
    }

    return await prisma.examenNivelatorio.findMany({
      where: { alumnoId },
      orderBy: { fecha: 'desc' },
    });
  }

  static async crearExamen(alumnoId, data) {
    const alumno = await prisma.alumno.findUnique({ where: { id: alumnoId } });
    if (!alumno) {
      throw new AppError(...ERRORS.ALUMNO_NOT_FOUND);
    }

    return await prisma.examenNivelatorio.create({
      data: {
        alumnoId,
        fecha: new Date(data.fecha),
        resultado: data.resultado || 'PENDIENTE',
        nota: data.nota !== undefined && data.nota !== null ? data.nota : null,
        observaciones: data.observaciones || null,
      },
    });
  }

  static async actualizarExamen(alumnoId, examenId, data) {
    const examen = await prisma.examenNivelatorio.findUnique({
      where: { id: examenId },
    });

    if (!examen || examen.alumnoId !== alumnoId) {
      throw new AppError('EXAMEN_NOT_FOUND', 'Examen nivelatorio no encontrado.', 404);
    }

    return await prisma.examenNivelatorio.update({
      where: { id: examenId },
      data: {
        ...(data.fecha && { fecha: new Date(data.fecha) }),
        ...(data.resultado && { resultado: data.resultado }),
        ...(data.nota !== undefined && { nota: data.nota }),
        ...(data.observaciones !== undefined && { observaciones: data.observaciones }),
      },
    });
  }
}