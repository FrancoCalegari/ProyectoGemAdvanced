import { jest } from '@jest/globals';

jest.unstable_mockModule('../../src/config/db.js', () => ({
  default: {
    profesor: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

const { ProfesorService } = await import('../../src/services/profesor.service.js');
const { default: prisma } = await import('../../src/config/db.js');

describe('ProfesorService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('listar', () => {
    it('debe devolver un array', async () => {
      prisma.profesor.findMany.mockResolvedValue([]);
      const r = await ProfesorService.listar();
      expect(Array.isArray(r)).toBe(true);
    });
  });

  describe('obtenerPorId', () => {
    it('debe lanzar error si no existe', async () => {
      prisma.profesor.findUnique.mockResolvedValue(null);
      await expect(ProfesorService.obtenerPorId('fake')).rejects.toThrow();
    });
  });

  describe('crear', () => {
    it('debe rechazar si no hay titulos', async () => {
      await expect(
        ProfesorService.crear({ dni: '1', email: 'a@a.com', titulos: [] })
      ).rejects.toThrow();
    });

    it('debe rechazar DNI duplicado', async () => {
      prisma.profesor.findUnique.mockResolvedValueOnce({ id: 'x' });
      await expect(
        ProfesorService.crear({ dni: '1', email: 'a@a.com', titulos: [{ tipo: 'UNIVERSITARIO', nombre: 'x', institucion: 'y', anioEgreso: 2020 }] })
      ).rejects.toThrow();
    });
  });

  describe('eliminar', () => {
    it('debe proteger contra eliminacion', async () => {
      prisma.profesor.findUnique.mockResolvedValue({ id: 'x', nombre: 'Test', apellido: 'Test' });
      await expect(ProfesorService.eliminar('x')).rejects.toThrow();
    });
  });

  describe('darDeBaja', () => {
    it('debe lanzar error si no existe', async () => {
      prisma.profesor.findUnique.mockResolvedValue(null);
      await expect(ProfesorService.darDeBaja('x')).rejects.toThrow();
    });
  });

  describe('reactivar', () => {
    it('debe lanzar error si no existe', async () => {
      prisma.profesor.findUnique.mockResolvedValue(null);
      await expect(ProfesorService.reactivar('x')).rejects.toThrow();
    });
  });
});