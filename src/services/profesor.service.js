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

function conEdad(profesor) {
  return {
    ...profesor,
    edad: calcularEdad(profesor.fechaNacimiento),
  };
}

export class ProfesorService {
  static async listar(filtros = {}) {
    const where = {};
    if (filtros.estado) where.estado = filtros.estado;
    if (filtros.busqueda) {
      where.OR = [
        { nombre:   { contains: filtros.busqueda, mode: 'insensitive' } },
        { apellido: { contains: filtros.busqueda, mode: 'insensitive' } },
        { dni:      { contains: filtros.busqueda } },
        { email:    { contains: filtros.busqueda, mode: 'insensitive' } },
      ];
    }

    const profesores = await prisma.profesor.findMany({
      where,
      include: {
        titulos: { select: { id: true, tipo: true, nombre: true, institucion: true } },
        _count: {
          select: { materias: true, licencias: true, notasCargadas: true, solicitudes: true },
        },
      },
      orderBy: [{ apellido: 'asc' }, { nombre: 'asc' }],
    });

    return profesores.map(conEdad);
  }

  static async obtenerPorId(id) {
    const profesor = await prisma.profesor.findUnique({
      where: { id },
      include: {
        titulos: true,
        materias: {
          include: {
            materia: {
              select: {
                id: true,
                nombre: true,
                codigo: true,
                anioCurricular: {
                  select: {
                    id: true,
                    numeroAnio: true,
                    nombre: true,
                    resolucion: {
                      select: { id: true, codigo: true, titulo: { select: { id: true, nombre: true } } },
                    },
                  },
                },
              },
            },
          },
          orderBy: [{ diaSemana: 'asc' }, { horaInicio: 'asc' }],
        },
        licencias: {
          orderBy: { fechaDesde: 'desc' },
          take: 20,
        },
        _count: {
          select: { materias: true, licencias: true, notasCargadas: true, solicitudes: true },
        },
      },
    });

    if (!profesor) {
      throw new AppError(...ERRORS.PROFESOR_NOT_FOUND);
    }

    return conEdad(profesor);
  }

  static async crear(data) {
    const { dni, email, titulos } = data;

    // Validar títulos obligatorios
    if (!Array.isArray(titulos) || titulos.length === 0) {
      throw new AppError(...ERRORS.PROFESOR_SIN_TITULO);
    }

    const existenteDni = await prisma.profesor.findUnique({ where: { dni } });
    if (existenteDni) {
      throw new AppError(...ERRORS.PROFESOR_DNI_DUP);
    }

    const existenteEmail = await prisma.profesor.findUnique({ where: { email } });
    if (existenteEmail) {
      throw new AppError(...ERRORS.PROFESOR_EMAIL_DUP);
    }

    const profesor = await prisma.profesor.create({
      data: {
        dni,
        nombre: data.nombre,
        apellido: data.apellido,
        email,
        telefono: data.telefono || null,
        fechaNacimiento: new Date(data.fechaNacimiento),
        genero: data.genero || null,
        domicilioCalle: data.domicilioCalle || null,
        domicilioNumero: data.domicilioNumero || null,
        domicilioCiudad: data.domicilioCiudad || null,
        domicilioProvincia: data.domicilioProvincia || null,
        domicilioCP: data.domicilioCP || null,
        tieneCUD: data.tieneCUD || false,
        estado: data.estado || 'ACTIVO',
        titulos: {
          create: titulos.map((t) => ({
            tipo: t.tipo,
            nombre: t.nombre,
            institucion: t.institucion,
            anioEgreso: Number(t.anioEgreso),
            numero: t.numero || null,
            archivoUrl: t.archivoUrl || null,
          })),
        },
      },
      include: { titulos: true },
    });

    return conEdad(profesor);
  }

  static async actualizar(id, data) {
    const profesor = await prisma.profesor.findUnique({ where: { id } });
    if (!profesor) {
      throw new AppError(...ERRORS.PROFESOR_NOT_FOUND);
    }

    if (data.dni && data.dni !== profesor.dni) {
      const existente = await prisma.profesor.findUnique({ where: { dni: data.dni } });
      if (existente) throw new AppError(...ERRORS.PROFESOR_DNI_DUP);
    }

    if (data.email && data.email !== profesor.email) {
      const existente = await prisma.profesor.findUnique({ where: { email: data.email } });
      if (existente) throw new AppError(...ERRORS.PROFESOR_EMAIL_DUP);
    }

    const actualizado = await prisma.profesor.update({
      where: { id },
      data: {
        ...(data.dni && { dni: data.dni }),
        ...(data.nombre && { nombre: data.nombre }),
        ...(data.apellido && { apellido: data.apellido }),
        ...(data.email && { email: data.email }),
        ...(data.telefono !== undefined && { telefono: data.telefono }),
        ...(data.fechaNacimiento && { fechaNacimiento: new Date(data.fechaNacimiento) }),
        ...(data.genero !== undefined && { genero: data.genero }),
        ...(data.domicilioCalle !== undefined && { domicilioCalle: data.domicilioCalle }),
        ...(data.domicilioNumero !== undefined && { domicilioNumero: data.domicilioNumero }),
        ...(data.domicilioCiudad !== undefined && { domicilioCiudad: data.domicilioCiudad }),
        ...(data.domicilioProvincia !== undefined && { domicilioProvincia: data.domicilioProvincia }),
        ...(data.domicilioCP !== undefined && { domicilioCP: data.domicilioCP }),
        ...(data.tieneCUD !== undefined && { tieneCUD: data.tieneCUD }),
        ...(data.estado && { estado: data.estado }),
      },
      include: { titulos: true },
    });

    return conEdad(actualizado);
  }

  static async eliminar(id) {
    // Los profesores NUNCA se eliminan. Se hace baja logica.
    const profesor = await prisma.profesor.findUnique({ where: { id } });
    if (!profesor) throw new AppError(...ERRORS.PROFESOR_NOT_FOUND);

    throw new AppError(
      'PROFESOR_NO_SE_ELIMINA',
      'No es posible eliminar los datos de un profesor. Los registros academicos se conservan por normativa institucional.',
      409
    );
  }

  // ----------------------------------------------------------
  // TÍTULOS
  // ----------------------------------------------------------
  static async agregarTitulo(profesorId, data) {
    const profesor = await prisma.profesor.findUnique({ where: { id: profesorId } });
    if (!profesor) throw new AppError(...ERRORS.PROFESOR_NOT_FOUND);

    return await prisma.tituloProfesor.create({
      data: {
        profesorId,
        tipo: data.tipo,
        nombre: data.nombre,
        institucion: data.institucion,
        anioEgreso: Number(data.anioEgreso),
        numero: data.numero || null,
        archivoUrl: data.archivoUrl || null,
      },
    });
  }

  static async eliminarTitulo(profesorId, tituloId) {
    const titulo = await prisma.tituloProfesor.findUnique({ where: { id: tituloId } });
    if (!titulo || titulo.profesorId !== profesorId) {
      throw new AppError(...ERRORS.TITULO_PROFESOR_NOT_FOUND);
    }

    const total = await prisma.tituloProfesor.count({ where: { profesorId } });
    if (total <= 1) {
      throw new AppError(...ERRORS.PROFESOR_SIN_TITULO);
    }

    return await prisma.tituloProfesor.delete({ where: { id: tituloId } });
  }

  // ----------------------------------------------------------
  // MATERIAS ASIGNADAS
  // ----------------------------------------------------------
  static async asignarMateria(profesorId, data) {
    const profesor = await prisma.profesor.findUnique({ where: { id: profesorId } });
    if (!profesor) throw new AppError(...ERRORS.PROFESOR_NOT_FOUND);

    const materia = await prisma.materia.findUnique({ where: { id: data.materiaId } });
    if (!materia) throw new AppError(...ERRORS.MATERIA_NOT_FOUND);

    const dup = await prisma.materiaProfesor.findFirst({
      where: {
        profesorId,
        materiaId: data.materiaId,
        diaSemana: Number(data.diaSemana),
        horaInicio: data.horaInicio,
      },
    });
    if (dup) throw new AppError(...ERRORS.MATERIA_PROFESOR_DUP);

    return await prisma.materiaProfesor.create({
      data: {
        profesorId,
        materiaId: data.materiaId,
        diaSemana: Number(data.diaSemana),
        horaInicio: data.horaInicio,
        horaFin: data.horaFin,
        aula: data.aula || null,
      },
      include: { materia: { select: { id: true, nombre: true, codigo: true } } },
    });
  }

  static async desasignarMateria(profesorId, materiaProfesorId) {
    const mp = await prisma.materiaProfesor.findUnique({ where: { id: materiaProfesorId } });
    if (!mp || mp.profesorId !== profesorId) {
      throw new AppError(...ERRORS.MATERIA_PROFESOR_NOT_FOUND);
    }
    return await prisma.materiaProfesor.delete({ where: { id: materiaProfesorId } });
  }

  // ----------------------------------------------------------
  // MIS MATERIAS (para el panel del profesor logueado)
  // ----------------------------------------------------------
  static async misMaterias(profesorId) {
    return await prisma.materiaProfesor.findMany({
      where: { profesorId },
      include: {
        materia: {
          select: {
            id: true,
            nombre: true,
            codigo: true,
            anioCurricular: {
              select: {
                numeroAnio: true,
                resolucion: { select: { codigo: true, titulo: { select: { nombre: true } } } },
              },
            },
          },
        },
      },
      orderBy: [{ diaSemana: 'asc' }, { horaInicio: 'asc' }],
    });
  }
  static async darDeBaja(id) {
    const prof = await prisma.profesor.findUnique({ where: { id } });
    if (!prof) throw new AppError(...ERRORS.PROFESOR_NOT_FOUND);
    if (prof.estado === 'INACTIVO') {
      throw new AppError('PROFESOR_YA_BAJA', 'El profesor ya esta dado de baja.', 409);
    }
    return await prisma.profesor.update({
      where: { id },
      data: { estado: 'INACTIVO' },
    });
  }
  static async reactivar(id) {
    const prof = await prisma.profesor.findUnique({ where: { id } });
    if (!prof) throw new AppError(...ERRORS.PROFESOR_NOT_FOUND);
    if (prof.estado === 'ACTIVO') {
      throw new AppError('PROFESOR_YA_ACTIVO', 'El profesor ya esta activo.', 409);
    }
    return await prisma.profesor.update({
      where: { id },
      data: { estado: 'ACTIVO' },
    });
  }
  static async cambiarEstado(id, estado) {
    const ESTADOS = ['ACTIVO', 'SUPLENCIA', 'INACTIVO'];
    if (!ESTADOS.includes(estado)) {
      throw new AppError('VALIDATION_ERROR', 'Estado invalido.', 400);
    }
    const prof = await prisma.profesor.findUnique({ where: { id } });
    if (!prof) throw new AppError(...ERRORS.PROFESOR_NOT_FOUND);
    return await prisma.profesor.update({
      where: { id },
      data: { estado },
    });
  }
}