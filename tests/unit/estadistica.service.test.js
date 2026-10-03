import { jest } from '@jest/globals';

jest.unstable_mockModule('../../src/config/db.js', () => ({
  default: {
    alumno: { findMany: jest.fn().mockResolvedValue([]) },
    cursadaMateria: { findMany: jest.fn().mockResolvedValue([]) },
    asistencia: { findMany: jest.fn().mockResolvedValue([]) },
    claseSuspendida: { findMany: jest.fn().mockResolvedValue([]) },
    mesaExamen: { findMany: jest.fn().mockResolvedValue([]) },
    inscripcionMesa: { findMany: jest.fn().mockResolvedValue([]) },
    certificado: { findMany: jest.fn().mockResolvedValue([]) },
    certificadoPresentado: { findMany: jest.fn().mockResolvedValue([]) },
  },
}));

const { EstadisticaService } = await import('../../src/services/estadistica.service.js');

describe('EstadisticaService', () => {
  describe('alumnos', () => {
    it('debe devolver estructura correcta', async () => {
      const r = await EstadisticaService.alumnos();
      expect(r).toHaveProperty('total');
      expect(r).toHaveProperty('porEstado');
      expect(r).toHaveProperty('porTitulo');
      expect(r).toHaveProperty('porcentajes');
    });
  });

  describe('cursadas', () => {
    it('debe devolver estructura correcta', async () => {
      const r = await EstadisticaService.cursadas();
      expect(r).toHaveProperty('total');
      expect(r).toHaveProperty('porcentajeAprobacion');
      expect(r).toHaveProperty('promedioNotas');
    });
  });

  describe('asistencias', () => {
    it('debe devolver estructura correcta', async () => {
      const r = await EstadisticaService.asistencias();
      expect(r).toHaveProperty('total');
      expect(r).toHaveProperty('porcentajeAsistencia');
      expect(r).toHaveProperty('porcentajeInasistencia');
    });
  });

  describe('resumen', () => {
    it('debe devolver todas las metricas', async () => {
      const r = await EstadisticaService.resumen();
      expect(r).toHaveProperty('alumnos');
      expect(r).toHaveProperty('cursadas');
      expect(r).toHaveProperty('asistencias');
      expect(r).toHaveProperty('mesas');
      expect(r).toHaveProperty('certificados');
    });
  });
});