import prisma from '../config/db.js';

export class TituloService {
  // 1. Crear Título con su primera Resolución en una sola transacción
  static async crearTituloConResolucion(data) {
    const { nombre, nivel, duracionAnios, resolucion } = data;

    return await prisma.$transaction(async (tx) => {
      // Crear el título
      const nuevoTitulo = await tx.titulo.create({
        data: {
          nombre,
          nivel,
          duracionAnios,
          estado: 'ACTIVO'
        }
      });

      // Crear la resolución inicial VIGENTE
      const nuevaResolucion = await tx.resolucion.create({
        data: {
          tituloId: nuevoTitulo.id,
          numero: resolucion.numero,
          anioCreacion: resolucion.anioCreacion,
          codigo: resolucion.codigo,
          fechaInicioVigencia: new Date(resolucion.fechaInicioVigencia),
          estado: 'VIGENTE',
          observaciones: resolucion.observaciones || null
        }
      });

      return {
        ...nuevoTitulo,
        resolucionVigente: nuevaResolucion
      };
    });
  }

  // 2. Listar todos los títulos con sus resoluciones
  static async obtenerTodos() {
    return await prisma.titulo.findMany({
      include: {
        resoluciones: {
          orderBy: { fechaInicioVigencia: 'desc' }
        }
      },
      orderBy: { nombre: 'asc' }
    });
  }

  // 3. Obtener un título por ID
  static async obtenerPorId(id) {
    const titulo = await prisma.titulo.findUnique({
      where: { id },
      include: {
        resoluciones: {
          include: {
            aniosCurriculares: {
              include: { materias: true }
            }
          }
        }
      }
    });

    if (!titulo) {
      throw new Error('TITULO_NOT_FOUND');
    }

    return titulo;
  }

  // 4. Crear una nueva resolución para un título (cierra la vigente anterior)
  static async agregarNuevaResolucion(tituloId, data) {
    return await prisma.$transaction(async (tx) => {
      // Verificar existencia del título
      const titulo = await tx.titulo.findUnique({ where: { id: tituloId } });
      if (!titulo) throw new Error('TITULO_NOT_FOUND');

      const fechaInicio = new Date(data.fechaInicioVigencia);

      // Buscar si existe una resolución actualmente VIGENTE
      const resolucionVigente = await tx.resolucion.findFirst({
        where: {
          tituloId,
          estado: 'VIGENTE'
        }
      });

      // Si hay una vigente, la cerramos
      if (resolucionVigente) {
        await tx.resolucion.update({
          where: { id: resolucionVigente.id },
          data: {
            estado: 'CERRADA',
            fechaFinVigencia: fechaInicio
          }
        });
      }

      // Crear la nueva resolución VIGENTE
      const nuevaResolucion = await tx.resolucion.create({
        data: {
          tituloId,
          numero: data.numero,
          anioCreacion: data.anioCreacion,
          codigo: data.codigo,
          fechaInicioVigencia: fechaInicio,
          estado: 'VIGENTE',
          observaciones: data.observaciones || null
        }
      });

      return nuevaResolucion;
    });
  }
}