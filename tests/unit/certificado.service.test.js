import { CertificadoService } from '../../src/services/certificado.service.js';
import { prisma } from '../setup.js';

describe('CertificadoService', () => {
  let alumnoId;
  let tituloId;
  let resolucionId;
  let anioCurricularId;

  beforeAll(async () => {
    // Buscar un alumno del seeder con inscripcion activa
    const alumno = await prisma.alumno.findFirst({
      where: {
        inscripciones: { some: { estado: 'ACTIVA' } },
      },
      include: {
        inscripciones: {
          where: { estado: 'ACTIVA' },
          include: {
            titulo: true,
            resolucion: {
              include: {
                aniosCurriculares: { orderBy: { numeroAnio: 'asc' } },
              },
            },
          },
        },
      },
    });

    if (!alumno) {
      throw new Error('No hay alumno con inscripcion activa en la base. Correr el seeder.');
    }

    alumnoId = alumno.id;
    const inscripcion = alumno.inscripciones[0];
    tituloId = inscripcion.tituloId;
    resolucionId = inscripcion.resolucionId;
    anioCurricularId = inscripcion.resolucion.aniosCurriculares[0].id;
  });

  describe('listarPorAlumno', () => {
    it('debe devolver un array', async () => {
      const certificados = await CertificadoService.listarPorAlumno(alumnoId);
      expect(Array.isArray(certificados)).toBe(true);
    });

    it('debe rechazar si el alumno no existe', async () => {
      const idFalso = '00000000-0000-0000-0000-000000000000';
      await expect(
        CertificadoService.listarPorAlumno(idFalso)
      ).rejects.toThrow('Alumno no encontrado');
    });
  });

  describe('solicitar', () => {
    it('debe rechazar si el tipo es invalido', async () => {
      await expect(
        CertificadoService.solicitar(alumnoId, { tipo: 'INVALIDO' })
      ).rejects.toThrow('El tipo debe ser PARCIAL_ANIO o TITULO_COMPLETO');
    });

    it('debe rechazar PARCIAL_ANIO sin anioCurricularId', async () => {
      await expect(
        CertificadoService.solicitar(alumnoId, { tipo: 'PARCIAL_ANIO' })
      ).rejects.toThrow('Falta anioCurricularId para certificados parciales');
    });
  });

  describe('obtenerPorId', () => {
    it('debe rechazar si el certificado no existe', async () => {
      const idFalso = '00000000-0000-0000-0000-000000000000';
      await expect(
        CertificadoService.obtenerPorId(idFalso)
      ).rejects.toThrow('Certificado no encontrado');
    });
  });
});
