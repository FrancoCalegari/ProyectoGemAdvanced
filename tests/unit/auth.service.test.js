import { AuthService } from '../../src/services/auth.service.js';
import { prisma } from '../setup.js';
import bcrypt from 'bcrypt';

describe('AuthService', () => {
  beforeAll(async () => {
    await prisma.usuario.deleteMany({
      where: {
        email: { in: ['test.test@example.com', 'test.admin@example.com'] },
      },
    });

    const passwordHash = await bcrypt.hash('admin123', 10);
    await prisma.usuario.create({
      data: {
        email: 'test.admin@example.com',
        passwordHash,
        nombre: 'Test',
        apellido: 'Admin',
        rol: 'ADMIN',
      },
    });
  });

  afterAll(async () => {
    await prisma.usuario.deleteMany({
      where: {
        email: { in: ['test.test@example.com', 'test.admin@example.com'] },
      },
    });
  });

  describe('login', () => {
    it('debe hacer login con credenciales validas', async () => {
      const resultado = await AuthService.login('test.admin@example.com', 'admin123');

      expect(resultado).toHaveProperty('token');
      expect(resultado).toHaveProperty('usuario');
      expect(resultado.usuario.email).toBe('test.admin@example.com');
      expect(resultado.usuario.rol).toBe('ADMIN');
      expect(resultado.token).toBeTruthy();
    });

    it('debe rechazar credenciales invalidas', async () => {
      await expect(
        AuthService.login('test.admin@example.com', 'wrongpass')
      ).rejects.toThrow('Email o contraseña incorrectos');
    });

    it('debe rechazar email inexistente', async () => {
      await expect(
        AuthService.login('noexiste@example.com', 'admin123')
      ).rejects.toThrow('Email o contraseña incorrectos');
    });

    it('debe rechazar si faltan email o password', async () => {
      await expect(AuthService.login('', '')).rejects.toThrow('Faltan email o contraseña');
    });
  });

  describe('registrar', () => {
    it('debe registrar un usuario ADMIN sin alumnoId', async () => {
      const usuario = await AuthService.registrar({
        email: 'test.test@example.com',
        password: 'test123',
        nombre: 'Test',
        apellido: 'User',
        rol: 'ADMIN',
      });

      expect(usuario).toHaveProperty('id');
      expect(usuario.email).toBe('test.test@example.com');
      expect(usuario.rol).toBe('ADMIN');
      expect(usuario).not.toHaveProperty('passwordHash');
    });

    it('debe rechazar rol invalido', async () => {
      await expect(
        AuthService.registrar({
          email: 'otro@example.com',
          password: 'test123',
          nombre: 'Test',
          apellido: 'User',
          rol: 'INVALIDO',
        })
      ).rejects.toThrow('Rol inválido');
    });

    it('debe rechazar ALUMNO sin alumnoId', async () => {
      await expect(
        AuthService.registrar({
          email: 'alumno.test@example.com',
          password: 'test123',
          nombre: 'Test',
          apellido: 'Alumno',
          rol: 'ALUMNO',
        })
      ).rejects.toThrow('Un usuario ALUMNO debe estar vinculado a un alumno');
    });

    it('debe rechazar email duplicado', async () => {
      await expect(
        AuthService.registrar({
          email: 'test.test@example.com',
          password: 'test123',
          nombre: 'Test',
          apellido: 'User',
          rol: 'ADMIN',
        })
      ).rejects.toThrow('Ya existe un usuario con ese email');
    });
  });
});
