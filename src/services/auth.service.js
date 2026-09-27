import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../config/db.js';
import { AppError, ERRORS } from '../utils/errors.js';

const JWT_SECRET = process.env.JWT_SECRET || 'cambiar_este_valor';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '8h';

export class AuthService {
  static async login(email, password) {
    if (!email || !password) {
      throw new AppError('VALIDATION_ERROR', 'Faltan email o password.', 400);
    }

    const usuario = await prisma.usuario.findUnique({
      where: { email },
      include: {
        alumno: { select: { id: true, nombre: true, apellido: true, dni: true } },
      },
    });

    if (!usuario) {
      throw new AppError('CREDENCIALES_INVALIDAS', 'Email o contrasena incorrectos.', 401);
    }

    if (!usuario.activo) {
      throw new AppError('USUARIO_INACTIVO', 'El usuario esta desactivado.', 403);
    }

    const passwordValida = await bcrypt.compare(password, usuario.passwordHash);
    if (!passwordValida) {
      throw new AppError('CREDENCIALES_INVALIDAS', 'Email o contrasena incorrectos.', 401);
    }

    const payload = {
      sub: usuario.id,
      email: usuario.email,
      rol: usuario.rol,
      alumnoId: usuario.alumnoId,
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

    return {
      token,
      usuario: {
        id: usuario.id,
        email: usuario.email,
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        rol: usuario.rol,
        alumnoId: usuario.alumnoId,
        alumno: usuario.alumno,
      },
    };
  }

  static async registrar(data) {
    const { email, password, nombre, apellido, rol, alumnoId } = data;

    if (!email || !password || !nombre || !apellido || !rol) {
      throw new AppError('VALIDATION_ERROR', 'Faltan campos obligatorios.', 400);
    }

    if (!['ADMIN', 'SECRETARIA', 'ALUMNO'].includes(rol)) {
      throw new AppError('VALIDATION_ERROR', 'Rol invalido.', 400);
    }

    if (rol === 'ALUMNO' && !alumnoId) {
      throw new AppError('VALIDATION_ERROR', 'Un usuario ALUMNO debe estar vinculado a un alumno.', 400);
    }

    if (rol !== 'ALUMNO' && alumnoId) {
      throw new AppError('VALIDATION_ERROR', 'Solo los usuarios ALUMNO pueden tener alumnoId.', 400);
    }

    const existente = await prisma.usuario.findUnique({ where: { email } });
    if (existente) {
      throw new AppError('EMAIL_DUP', 'Ya existe un usuario con ese email.', 409);
    }

    if (alumnoId) {
      const alumno = await prisma.alumno.findUnique({ where: { id: alumnoId } });
      if (!alumno) {
        throw new AppError(...ERRORS.ALUMNO_NOT_FOUND);
      }

      const alumnoConUsuario = await prisma.usuario.findUnique({ where: { alumnoId } });
      if (alumnoConUsuario) {
        throw new AppError('ALUMNO_YA_TIENE_USUARIO', 'Ese alumno ya tiene un usuario vinculado.', 409);
      }
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const usuario = await prisma.usuario.create({
      data: {
        email,
        passwordHash,
        nombre,
        apellido,
        rol,
        alumnoId: alumnoId || null,
      },
      include: {
        alumno: { select: { id: true, nombre: true, apellido: true, dni: true } },
      },
    });

    const { passwordHash: _, ...usuarioSinPassword } = usuario;
    return usuarioSinPassword;
  }

  static async obtenerPorId(id) {
    const usuario = await prisma.usuario.findUnique({
      where: { id },
      include: {
        alumno: { select: { id: true, nombre: true, apellido: true, dni: true } },
      },
    });

    if (!usuario) {
      throw new AppError('USUARIO_NOT_FOUND', 'Usuario no encontrado.', 404);
    }

    const { passwordHash: _, ...usuarioSinPassword } = usuario;
    return usuarioSinPassword;
  }
}
