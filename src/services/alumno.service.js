import prisma from '../config/db.js';
import { AppError, ERRORS } from '../utils/errors.js';

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

function conEdad(alumno) {
  return {
    ...alumno,
    edad: calcularEdad(alumno.fechaNacimiento),
  };
}

export class AlumnoService {
  static async listar(filtros = {}) {
    const where = {};
    if (filtros.estado) where.estado = filtros.estado;
    if (filtros.busqueda) {
      where.OR = [
        { nombre: { contains: filtros.busqueda, mode: 'insensitive' } },
        { apellido: { contains: filtros.busqueda, mode: 'insensitive' } },
        { dni: { contains: filtros.busqueda } },
        { email: { contains: filtros.busqueda, mode: 'insensitive' } },
      ];
    }

    const alumnos = await prisma.alumno.findMany({
      where,
      include: {
        _count: {
          select: { inscripciones: true, certificados: true },
        },
      },
      orderBy: [{ apellido: 'asc' }, { nombre: 'asc' }],
    });

    return alumnos.map(conEdad);
  }

  static async obtenerPorId(id) {
    const alumno = await prisma.alumno.findUnique({
      where: { id },
      include: {
        inscripciones: {
          include: {
            título: { select: { id: true, nombre: true, nivel: true } },
            resolucion: { select: { id: true, codigo: true, estado: true } },
          },
          orderBy: { fechaInscripcion: 'desc' },
        },
        examenes: {
          orderBy: { fecha: 'desc' },
        },
        _count: {
          select: { certificados: true },
        },
      },
    });

    if (!alumno) {
      throw new AppError(...ERRORS.ALUMNO_NOT_FOUND);
    }

    return conEdad(alumno);
  }

  static async crear(data) {
    const { dni, email } = data;

    const existenteDni = await prisma.alumno.findUnique({ where: { dni } });
    if (existenteDni) {
      throw new AppError(...ERRORS.ALUMNO_DNI_DUP);
    }

    const existenteEmail = await prisma.alumno.findUnique({ where: { email } });
    if (existenteEmail) {
      throw new AppError(...ERRORS.ALUMNO_EMAIL_DUP);
    }

    const alumno = await prisma.alumno.create({
      data: {
        dni,
        nombre: data.nombre,
        apellido: data.apellido,
        email,
        fechaNacimiento: new Date(data.fechaNacimiento),
        domicilioCalle: data.domicilioCalle || null,
        domicilioNumero: data.domicilioNumero || null,
        domicilioCiudad: data.domicilioCiudad || null,
        domicilioProvincia: data.domicilioProvincia || null,
        domicilioCP: data.domicilioCP || null,
        tienePartidaNacimiento: data.tienePartidaNacimiento || false,
        tieneAnaliticoSecundario: data.tieneAnaliticoSecundario || false,
        tieneAnaliticoIncompleto: data.tieneAnaliticoIncompleto || false,
        tieneCertificado7mo: data.tieneCertificado7mo || false,
        tieneCUD: data.tieneCUD || false,
      },
    });

    return conEdad(alumno);
  }

  static async actualizar(id, data) {
    const alumno = await prisma.alumno.findUnique({ where: { id } });
    if (!alumno) {
      throw new AppError(...ERRORS.ALUMNO_NOT_FOUND);
    }

    if (data.dni && data.dni !== alumno.dni) {
      const existente = await prisma.alumno.findUnique({ where: { dni: data.dni } });
      if (existente) {
        throw new AppError(...ERRORS.ALUMNO_DNI_DUP);
      }
    }

    if (data.email && data.email !== alumno.email) {
      const existente = await prisma.alumno.findUnique({ where: { email: data.email } });
      if (existente) {
        throw new AppError(...ERRORS.ALUMNO_EMAIL_DUP);
      }
    }

    const actualizado = await prisma.alumno.update({
      where: { id },
      data: {
        ...(data.dni && { dni: data.dni }),
        ...(data.nombre && { nombre: data.nombre }),
        ...(data.apellido && { apellido: data.apellido }),
        ...(data.email && { email: data.email }),
        ...(data.fechaNacimiento && { fechaNacimiento: new Date(data.fechaNacimiento) }),
        ...(data.domicilioCalle !== undefined && { domicilioCalle: data.domicilioCalle }),
        ...(data.domicilioNumero !== undefined && { domicilioNumero: data.domicilioNumero }),
        ...(data.domicilioCiudad !== undefined && { domicilioCiudad: data.domicilioCiudad }),
        ...(data.domicilioProvincia !== undefined && { domicilioProvincia: data.domicilioProvincia }),
        ...(data.domicilioCP !== undefined && { domicilioCP: data.domicilioCP }),
        ...(data.tienePartidaNacimiento !== undefined && { tienePartidaNacimiento: data.tienePartidaNacimiento }),
        ...(data.tieneAnaliticoSecundario !== undefined && { tieneAnaliticoSecundario: data.tieneAnaliticoSecundario }),
        ...(data.tieneAnaliticoIncompleto !== undefined && { tieneAnaliticoIncompleto: data.tieneAnaliticoIncompleto }),
        ...(data.tieneCertificado7mo !== undefined && { tieneCertificado7mo: data.tieneCertificado7mo }),
        ...(data.tieneCUD !== undefined && { tieneCUD: data.tieneCUD }),
      },
    });

    return conEdad(actualizado);
  }

  static async eliminar(id) {
    // Los alumnos NUNCA se eliminan. Se hace baja logica.
    const alumno = await prisma.alumno.findUnique({ where: { id } });
    if (!alumno) throw new AppError(...ERRORS.ALUMNO_NOT_FOUND);

    throw new AppError(
      'ALUMNO_NO_SE_ELIMINA',
      'No es posible eliminar los datos de un alumno. Los registros academicos se conservan por normativa institucional.',
      409
    );
  }
  // ----------------------------------------------------------
  // Listar agrupados por Título → Resolución → Año → Alumnos
  // ----------------------------------------------------------
  static async listarAgrupados() {
    // Traer títulos con sus resoluciones y años
    const títulos = await prisma.título.findMany({
      where: { estado: 'ACTIVO' },
      include: {
        resoluciones: {
          where: { estado: 'VIGENTE' },
          include: {
            añosCurriculares: {
              orderBy: { numeroAnio: 'asc' },
              select: { id: true, numeroAnio: true, nombre: true },
            },
          },
        },
      },
      orderBy: { nombre: 'asc' },
    });

    // Traer todas las inscripciones activas con info del alumno
    const inscripciones = await prisma.inscripcion.findMany({
      where: { estado: 'ACTIVA' },
      include: {
        alumno: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            dni: true,
            email: true,
            fechaNacimiento: true,
          },
        },
        resolucion: { select: { id: true, codigo: true } },
      },
      orderBy: [{ alumno: { apellido: 'asc' } }, { alumno: { nombre: 'asc' } }],
    });

    // Traer todas las cursadas para saber en quÃ© aÃ±o esta cada alumno
    const inscripcionIds = inscripciones.map((i) => i.id);
    const cursadas = await prisma.cursadaMateria.findMany({
      where: { inscripcionId: { in: inscripcionIds } },
      include: {
        materia: {
          select: {
            añoCurricularId: true,
            añoCurricular: { select: { numeroAnio: true } },
          },
        },
      },
    });

    // Determinar el año de cada alumno (el mayor año con cursadas EN_CURSO o REGULAR)
    const añoPorInscripcion = {};
    for (const c of cursadas) {
      const inscId = c.inscripcionId;
      const numeroAnio = c.materia.añoCurricular.numeroAnio;
      const estado = c.estado;
      if (!añoPorInscripcion[inscId]) {
        añoPorInscripcion[inscId] = { maxEnCurso: 0, maxAprobado: 0 };
      }
      if (['EN_CURSO', 'REGULAR'].includes(estado)) {
        añoPorInscripcion[inscId].maxEnCurso = Math.max(
          añoPorInscripcion[inscId].maxEnCurso,
          numeroAnio
        );
      }
      if (estado === 'APROBADA') {
        añoPorInscripcion[inscId].maxAprobado = Math.max(
          añoPorInscripcion[inscId].maxAprobado,
          numeroAnio
        );
      }
    }

    // Armar la estructura: Título → Resolución → Año → Alumnos
    const resultado = títulos.map((t) => {
      const resoluciones = t.resoluciones.map((r) => {
        // Alumnos inscriptos en esta resolución
        const aluDeRes = inscripciones.filter((i) => i.resolucionId === r.id);

        // Asignar cada alumno a un año curricular
        const años = r.añosCurriculares.map((a) => {
          const alumnosDelAnio = aluDeRes
            .filter((i) => {
              const info = añoPorInscripcion[i.id];
              if (!info) return a.numeroAnio === 1; // sin cursadas Ã¢â€ â€™ aÃ±o 1
              // El alumno pertenece al año donde tiene cursadas en curso
              const añoActual = info.maxEnCurso || info.maxAprobado || 1;
              return añoActual === a.numeroAnio;
            })
            .map((i) => ({
              id: i.alumno.id,
              nombre: i.alumno.nombre,
              apellido: i.alumno.apellido,
              dni: i.alumno.dni,
              email: i.alumno.email,
              edad: calcularEdad(i.alumno.fechaNacimiento),
              inscripcionId: i.id,
            }));

          return {
            añoId: a.id,
            numeroAnio: a.numeroAnio,
            nombre: a.nombre,
            totalAlumnos: alumnosDelAnio.length,
            alumnos: alumnosDelAnio,
          };
        });

        return {
          resolucionId: r.id,
          codigo: r.codigo,
          totalAlumnos: aluDeRes.length,
          años,
        };
      });

      return {
        títuloId: t.id,
        nombre: t.nombre,
        nivel: t.nivel,
        totalAlumnos: resoluciones.reduce((acc, r) => acc + r.totalAlumnos, 0),
        resoluciones,
      };
    });

    return resultado;
  }

  // ============================================================
  // HISTORIAL COMPLETO (todos los estados, nunca se borra)
  // ============================================================
  static async historial(filtros = {}) {
    const where = {};
    if (filtros.estadoAlumno) where.estadoAlumno = filtros.estadoAlumno;
    if (filtros.busqueda) {
      where.OR = [
        { nombre: { contains: filtros.busqueda, mode: 'insensitive' } },
        { apellido: { contains: filtros.busqueda, mode: 'insensitive' } },
        { dni: { contains: filtros.busqueda } },
        { email: { contains: filtros.busqueda, mode: 'insensitive' } },
      ];
    }

    const alumnos = await prisma.alumno.findMany({
      where,
      include: {
        _count: {
          select: { inscripciones: true, certificados: true, examenes: true, solicitudes: true },
        },
      },
      orderBy: [{ estadoAlumno: 'asc' }, { apellido: 'asc' }, { nombre: 'asc' }],
    });

    return alumnos.map(conEdad);
  }

  // ============================================================
  // CAMBIAR ESTADO (ACTIVO / EGRESADO / BAJA / INACTIVO)
  // ============================================================
  static async cambiarEstado(id, estado) {
    const ESTADOS_VALIDOS = ['ACTIVO', 'EGRESADO', 'BAJA', 'INACTIVO'];
    if (!ESTADOS_VALIDOS.includes(estado)) {
      throw new AppError('VALIDATION_ERROR', `Estado invalido. Debe ser uno de: ${ESTADOS_VALIDOS.join(', ')}.`, 400);
    }

    const alumno = await prisma.alumno.findUnique({ where: { id } });
    if (!alumno) throw new AppError(...ERRORS.ALUMNO_NOT_FOUND);

    return await prisma.alumno.update({
      where: { id },
      data: { estadoAlumno: estado },
    });
  }

  // ============================================================
  // BAJA LOGICA
  // ============================================================
  static async darDeBaja(id) {
    const alumno = await prisma.alumno.findUnique({ where: { id } });
    if (!alumno) throw new AppError(...ERRORS.ALUMNO_NOT_FOUND);

    if (alumno.estadoAlumno === 'BAJA') {
      throw new AppError('ALUMNO_YA_BAJA', 'El alumno ya esta dado de baja.', 409);
    }

    return await prisma.alumno.update({
      where: { id },
      data: { estadoAlumno: 'BAJA' },
    });
  }

  // ============================================================
  // REACTIVAR
  // ============================================================
  static async reactivar(id) {
    const alumno = await prisma.alumno.findUnique({ where: { id } });
    if (!alumno) throw new AppError(...ERRORS.ALUMNO_NOT_FOUND);

    if (alumno.estadoAlumno === 'ACTIVO') {
      throw new AppError('ALUMNO_YA_ACTIVO', 'El alumno ya esta activo.', 409);
    }

    return await prisma.alumno.update({
      where: { id },
      data: { estadoAlumno: 'ACTIVO' },
    });
  }
}