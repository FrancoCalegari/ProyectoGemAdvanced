import prisma from '../config/db.js';

export class CurricularService {
  // 1. Crear un año curricular asociado a una resolución
  static async crearAnioCurricular(resolucionId, data) {
    const { numeroAnio, nombre } = data;

    const resolucion = await prisma.resolucion.findUnique({
      where: { id: resolucionId }
    });

    if (!resolucion) throw new Error('RESOLUCION_NOT_FOUND');

    return await prisma.anioCurricular.create({
      data: {
        resolucionId,
        numeroAnio,
        nombre
      }
    });
  }

  // 2. Crear una materia dentro de un año curricular
  static async crearMateria(anioCurricularId, data) {
    const { nombre, codigo, cargaHoraria, tipoCursada } = data;

    const anio = await prisma.anioCurricular.findUnique({
      where: { id: anioCurricularId }
    });

    if (!anio) throw new Error('ANIO_NOT_FOUND');

    return await prisma.materia.create({
      data: {
        anioCurricularId,
        nombre,
        codigo,
        cargaHoraria,
        tipoCursada
      }
    });
  }

  // 3. Obtener el plan de estudio completo de una resolución
  static async obtenerPlanPorResolucion(resolucionId) {
    return await prisma.anioCurricular.findMany({
      where: { resolucionId },
      include: {
        materias: {
          orderBy: { codigo: 'asc' }
        }
      },
      orderBy: { numeroAnio: 'asc' }
    });
  }
}