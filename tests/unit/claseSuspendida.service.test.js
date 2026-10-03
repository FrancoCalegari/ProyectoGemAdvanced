import { jest } from '@jest/globals';

jest.unstable_mockModule('../../src/config/db.js', () => ({
  default: {
    claseSuspendida: { findMany: jest.fn(), findUnique: jest.fn(), create: jest.fn(), delete: jest.fn(), upsert: jest.fn() },
    reasignacion: { findUnique: jest.fn(), create: jest.fn(), delete: jest.fn() },
    materiaProfesor: { findMany: jest.fn() },
    licencia: { findUnique: jest.fn() },
    materia: { findUnique: jest.fn() },
    profesor: { findUnique: jest.fn() },
    $transaction: jest.fn((ops) => Promise.all(ops)),
  },
}));

const { ClaseSuspendidaService } = await import('../../src/services/claseSuspendida.service.js');

describe('ClaseSuspendidaService', () => {
  describe('calcularClasesAfectadas', () => {
    it('debe devolver array vacio si no hay asignaciones', async () => {
      const { default: prisma } = await import('../../src/config/db.js');
      prisma.materiaProfesor.findMany.mockResolvedValue([]);
      const r = await ClaseSuspendidaService.calcularClasesAfectadas({
        profesorId: 'p1',
        fechaDesde: new Date('2026-11-10'),
        fechaHasta: new Date('2026-11-12'),
        todoElDia: true,
      });
      expect(Array.isArray(r)).toBe(true);
      expect(r.length).toBe(0);
    });
  });
});