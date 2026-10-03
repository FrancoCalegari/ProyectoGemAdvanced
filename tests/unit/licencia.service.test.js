import { jest } from '@jest/globals';

jest.unstable_mockModule('../../src/config/db.js', () => ({
  default: {
    licencia: { findMany: jest.fn(), findUnique: jest.fn(), create: jest.fn(), update: jest.fn(), delete: jest.fn() },
    profesor: { findUnique: jest.fn() },
  },
}));

jest.unstable_mockModule('../../src/services/claseSuspendida.service.js', () => ({
  ClaseSuspendidaService: { generarDesdeLicencia: jest.fn().mockResolvedValue({ creadas: 0 }) },
}));

const { LicenciaService } = await import('../../src/services/licencia.service.js');
const { default: prisma } = await import('../../src/config/db.js');

describe('LicenciaService', () => {
  beforeEach(() => jest.clearAllMocks());

  describe('crear', () => {
    it('debe rechazar tipo invalido', async () => {
      await expect(LicenciaService.crear({ profesorId: 'p1', tipo: 'INVALIDO' })).rejects.toThrow();
    });

    it('debe rechazar sin profesorId', async () => {
      await expect(LicenciaService.crear({ tipo: 'ENFERMEDAD' })).rejects.toThrow();
    });
  });

  describe('listar', () => {
    it('debe devolver un array', async () => {
      prisma.licencia.findMany.mockResolvedValue([]);
      const r = await LicenciaService.listar();
      expect(Array.isArray(r)).toBe(true);
    });
  });

  describe('obtenerPorId', () => {
    it('debe lanzar error si no existe', async () => {
      prisma.licencia.findUnique.mockResolvedValue(null);
      await expect(LicenciaService.obtenerPorId('x')).rejects.toThrow();
    });
  });

  describe('aprobar', () => {
    it('debe lanzar error si ya esta resuelta', async () => {
      prisma.licencia.findUnique.mockResolvedValue({ id: 'x', estado: 'APROBADA' });
      await expect(LicenciaService.aprobar('x', 'admin')).rejects.toThrow();
    });
  });
});