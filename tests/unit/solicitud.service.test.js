import { jest } from '@jest/globals';

jest.unstable_mockModule('../../src/config/db.js', () => ({
  default: {
    solicitud: { findMany: jest.fn(), findUnique: jest.fn(), create: jest.fn(), update: jest.fn(), delete: jest.fn() },
    alumno: { findUnique: jest.fn() },
    profesor: { findUnique: jest.fn() },
  },
}));

const { SolicitudService } = await import('../../src/services/solicitud.service.js');
const { default: prisma } = await import('../../src/config/db.js');

describe('SolicitudService', () => {
  beforeEach(() => jest.clearAllMocks());

  describe('crear', () => {
    it('debe rechazar tipo invalido', async () => {
      await expect(SolicitudService.crear({ tipo: 'INVALIDO', comentario: 'x' })).rejects.toThrow();
    });

    it('debe rechazar sin comentario', async () => {
      await expect(SolicitudService.crear({ tipo: 'OTRO' })).rejects.toThrow();
    });

    it('debe rechazar sin alumno ni profesor', async () => {
      await expect(SolicitudService.crear({ tipo: 'OTRO', comentario: 'x' })).rejects.toThrow();
    });

    it('debe rechazar si tiene ambos', async () => {
      await expect(SolicitudService.crear({ tipo: 'OTRO', comentario: 'x', alumnoId: 'a', profesorId: 'p' })).rejects.toThrow();
    });
  });

  describe('listar', () => {
    it('debe devolver un array', async () => {
      prisma.solicitud.findMany.mockResolvedValue([]);
      const r = await SolicitudService.listar();
      expect(Array.isArray(r)).toBe(true);
    });
  });

  describe('obtenerPorId', () => {
    it('debe lanzar error si no existe', async () => {
      prisma.solicitud.findUnique.mockResolvedValue(null);
      await expect(SolicitudService.obtenerPorId('x')).rejects.toThrow();
    });
  });
});