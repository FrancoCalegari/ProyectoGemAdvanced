import { jest } from '@jest/globals';

jest.unstable_mockModule('../../src/config/db.js', () => ({
  default: {
    usuario: { findMany: jest.fn(), findUnique: jest.fn(), update: jest.fn() },
    profesor: { findMany: jest.fn() },
  },
}));

jest.unstable_mockModule('bcrypt', () => ({
  default: { hash: jest.fn().mockResolvedValue('hash'), compare: jest.fn() },
}));

const { UsuariosService } = await import('../../src/services/usuarios.service.js');
const { default: prisma } = await import('../../src/config/db.js');

describe('UsuariosService', () => {
  beforeEach(() => jest.clearAllMocks());

  describe('listar', () => {
    it('debe devolver un array', async () => {
      prisma.usuario.findMany.mockResolvedValue([]);
      const r = await UsuariosService.listar();
      expect(Array.isArray(r)).toBe(true);
    });
  });

  describe('obtenerPorId', () => {
    it('debe lanzar error si no existe', async () => {
      prisma.usuario.findUnique.mockResolvedValue(null);
      await expect(UsuariosService.obtenerPorId('x')).rejects.toThrow();
    });
  });

  describe('listarProfesoresSinUsuario', () => {
    it('debe devolver un array', async () => {
      prisma.profesor.findMany.mockResolvedValue([]);
      const r = await UsuariosService.listarProfesoresSinUsuario();
      expect(Array.isArray(r)).toBe(true);
    });
  });

  describe('bajaLogica', () => {
    it('no permite auto-baja', async () => {
      await expect(UsuariosService.bajaLogica('x', 'x')).rejects.toThrow();
    });

    it('debe lanzar error si no existe', async () => {
      prisma.usuario.findUnique.mockResolvedValue(null);
      await expect(UsuariosService.bajaLogica('x', 'otro')).rejects.toThrow();
    });
  });

  describe('reactivar', () => {
    it('debe lanzar error si no existe', async () => {
      prisma.usuario.findUnique.mockResolvedValue(null);
      await expect(UsuariosService.reactivar('x')).rejects.toThrow();
    });
  });
});