import { CursadaService } from '../../src/services/cursada.service.js';
import { prisma } from '../setup.js';

describe('CursadaService', () => {
  let alumnoId;

  beforeAll(async () => {
    const alumno = await prisma.alumno.findFirst({
      where: {
        inscripciones: { some: { estado: 'ACTIVA' } },
      },
    });

    if (!alumno) {
      throw new Error('No hay alumno con inscripcion activa en la base. Correr el seeder.');
    }

    alumnoId = alumno.id;
  });

  describe('historiaAcademica', () => {
    it('debe devolver la historia con inscripciones', async () => {
      const historia = await CursadaService.historiaAcademica(alumnoId);

      expect(historia).toHaveProperty('alumno');
      expect(historia).toHaveProperty('inscripciones');
      expect(Array.isArray(historia.inscripciones)).toBe(true);
      expect(historia.alumno.id).toBe(alumnoId);
    });

    it('debe rechazar si el alumno no existe', async () => {
      const idFalso = '00000000-0000-0000-0000-000000000000';
      await expect(
        CursadaService.historiaAcademica(idFalso)
      ).rejects.toThrow('Alumno no encontrado');
    });
  });

  describe('registrar', () => {
    it('debe rechazar si faltan materiaId o estado', async () => {
      await expect(
        CursadaService.registrar(alumnoId, {})
      ).rejects.toThrow('Faltan materiaId o estado');
    });

    it('debe rechazar si el estado es invalido', async () => {
      await expect(
        CursadaService.registrar(alumnoId, {
          materiaId: '00000000-0000-0000-0000-000000000000',
          estado: 'INVALIDO',
        })
      ).rejects.toThrow('Estado inv');
    });
  });

  describe('listarPorInscripcion', () => {
    it('debe rechazar si la inscripcion no existe', async () => {
      const idFalso = '00000000-0000-0000-0000-000000000000';
      await expect(
        CursadaService.listarPorInscripcion(idFalso)
      ).rejects.toThrow('Inscripci');
    });
  });
});
