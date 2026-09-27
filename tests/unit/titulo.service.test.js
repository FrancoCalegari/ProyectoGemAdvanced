import { TituloService } from '../../src/services/titulo.service.js';
import { prisma } from '../setup.js';

describe('TituloService', () => {
  const CODIGO_TEST = 'RES-TEST-9999';

  beforeAll(async () => {
    // Limpiar por si quedó algo
    await prisma.titulo.deleteMany({
      where: { nombre: { contains: 'TestTituloService' } },
    });
  });

  afterAll(async () => {
    await prisma.titulo.deleteMany({
      where: { nombre: { contains: 'TestTituloService' } },
    });
  });

  describe('crearTituloConResolucion', () => {
    it('debe crear un título con su resolución vigente', async () => {
      const titulo = await TituloService.crearTituloConResolucion({
        nombre: 'TestTituloService - Desarrollo Web',
        nivel: 'Terciario',
        duracionAnios: 3,
        resolucion: {
          numero: '999',
          anioCreacion: 2026,
          codigo: CODIGO_TEST,
          fechaInicioVigencia: '2026-03-01',
        },
      });

      expect(titulo).toHaveProperty('id');
      expect(titulo.nombre).toBe('TestTituloService - Desarrollo Web');
      expect(titulo.estado).toBe('ACTIVO');
      expect(titulo.resolucionVigente).toBeDefined();
      expect(titulo.resolucionVigente.estado).toBe('VIGENTE');
      expect(titulo.resolucionVigente.codigo).toBe(CODIGO_TEST);
    });

    it('debe rechazar nombre duplicado', async () => {
      await expect(
        TituloService.crearTituloConResolucion({
          nombre: 'TestTituloService - Desarrollo Web',
          nivel: 'Terciario',
          duracionAnios: 3,
          resolucion: {
            numero: '998',
            anioCreacion: 2026,
            codigo: 'RES-TEST-9998',
            fechaInicioVigencia: '2026-03-01',
          },
        })
      ).rejects.toThrow('Ya existe un título con ese nombre');
    });

    it('debe rechazar código de resolución duplicado', async () => {
      await expect(
        TituloService.crearTituloConResolucion({
          nombre: 'TestTituloService - Otro Título',
          nivel: 'Terciario',
          duracionAnios: 3,
          resolucion: {
            numero: '997',
            anioCreacion: 2026,
            codigo: CODIGO_TEST,
            fechaInicioVigencia: '2026-03-01',
          },
        })
      ).rejects.toThrow('El código de resolución ya existe');
    });
  });

  describe('obtenerTodos', () => {
    it('debe devolver un array', async () => {
      const titulos = await TituloService.obtenerTodos();
      expect(Array.isArray(titulos)).toBe(true);
    });
  });
});