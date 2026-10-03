import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../config/db.js';
import { AppError, ERRORS } from '../utils/errors.js';

const JWT_SECRET = process.env.JWT_SECRET || 'cambiar_este_valor';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '8h';

const ROLES_VALIDOS = ['ADMIN', 'SECRETARIA', 'ALUMNO', 'PROFESOR'];

export class AuthService {
  static async login(email, password) {
    if (!email || !password) {
      throw new AppError('VALIDATION_ERROR', 'Faltan email o contraseña.', 400);
    }

    const usuario = await prisma.usuario.findUnique({
      where: { email },
      include: {
        alumno: { select: { id: true, nombre: true, apellido: true, dni: true } },
        profesor: { select: { id: true, nombre: true, apellido: true, dni: true, estado: true } },
      },
    });

    if (!usuario) {
      throw new AppError('CREDENCIALES_INVALIDAS', 'Email o contraseña incorrectos.', 401);
    }

    if (!usuario.activo) {
      throw new AppError('USUARIO_INACTIVO', 'El usuario está desactivado.', 403);
    }

    const passwordValida = await bcrypt.compare(password, usuario.passwordHash);
    if (!passwordValida) {
      throw new AppError('CREDENCIALES_INVALIDAS', 'Email o contraseña incorrectos.', 401);
    }

    const payload = {
      sub: usuario.id,
      email: usuario.email,
      rol: usuario.rol,
      alumnoId: usuario.alumnoId || null,
      profesorId: usuario.profesorId || null,
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
        alumnoId: usuario.alumnoId || null,
        profesorId: usuario.profesorId || null,
        alumno: usuario.alumno,
        profesor: usuario.profesor,
      },
    };
  }

  static async registrar(data) {
    const { email, password, nombre, apellido, rol, alumnoId, profesorId } = data;

    if (!email || !password || !nombre || !apellido || !rol) {
      throw new AppError('VALIDATION_ERROR', 'Faltan campos obligatorios.', 400);
    }

    if (!ROLES_VALIDOS.includes(rol)) {
      throw new AppError('VALIDATION_ERROR', 'Rol inválido.', 400);
    }

    // -----------------------------------------------------------
    // Validación de vínculo alumno/profesor según rol
    // -----------------------------------------------------------
    if (rol === 'ALUMNO' && !alumnoId) {
      throw new AppError('VALIDATION_ERROR', 'Un usuario ALUMNO debe estar vinculado a un alumno.', 400);
    }

    if (rol === 'PROFESOR' && !profesorId) {
      throw new AppError('VALIDATION_ERROR', 'Un usuario PROFESOR debe estar vinculado a un profesor.', 400);
    }

    if (rol !== 'ALUMNO' && alumnoId) {
      throw new AppError('VALIDATION_ERROR', 'Solo los usuarios ALUMNO pueden tener alumnoId.', 400);
    }

    if (rol !== 'PROFESOR' && profesorId) {
      throw new AppError('VALIDATION_ERROR', 'Solo los usuarios PROFESOR pueden tener profesorId.', 400);
    }

    // -----------------------------------------------------------
    // Verificar email único
    // -----------------------------------------------------------
    const existente = await prisma.usuario.findUnique({ where: { email } });
    if (existente) {
      throw new AppError('EMAIL_DUP', 'Ya existe un usuario con ese email.', 409);
    }

    // -----------------------------------------------------------
    // Verificar vínculo alumno
    // -----------------------------------------------------------
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

    // -----------------------------------------------------------
    // Verificar vínculo profesor
    // -----------------------------------------------------------
    if (profesorId) {
      const profesor = await prisma.profesor.findUnique({ where: { id: profesorId } });
      if (!profesor) {
        throw new AppError(...ERRORS.PROFESOR_NOT_FOUND);
      }

      const profesorConUsuario = await prisma.usuario.findUnique({ where: { profesorId } });
      if (profesorConUsuario) {
        throw new AppError('PROFESOR_YA_TIENE_USUARIO', 'Ese profesor ya tiene un usuario vinculado.', 409);
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
        profesorId: profesorId || null,
      },
      include: {
        alumno: { select: { id: true, nombre: true, apellido: true, dni: true } },
        profesor: { select: { id: true, nombre: true, apellido: true, dni: true, estado: true } },
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
        profesor: { select: { id: true, nombre: true, apellido: true, dni: true, estado: true } },
      },
    });

    if (!usuario) {
      throw new AppError('USUARIO_NOT_FOUND', 'Usuario no encontrado.', 404);
    }

    const { passwordHash: _, ...usuarioSinPassword } = usuario;
    return usuarioSinPassword;
  }
  // ============================================================
  // ACTUALIZAR PERFIL PROPIO (cada usuario edita sus propios datos)
  // ============================================================
  static async actualizarPerfilPropio(userId, data) {
    const usuario = await prisma.usuario.findUnique({
      where: { id: userId },
      include: {
        alumno: true,
        profesor: true,
      },
    });
    if (!usuario) throw new AppError('USUARIO_NOT_FOUND', 'Usuario no encontrado.', 404);
    const resultado = await prisma.$transaction(async (tx) => {
      // 1) Datos basicos del usuario (nombre, apellido, email)
      const updateUsuario = {};
      if (data.nombre) updateUsuario.nombre = data.nombre;
      if (data.apellido) updateUsuario.apellido = data.apellido;
      if (data.email && data.email !== usuario.email) {
        const existente = await tx.usuario.findUnique({ where: { email: data.email } });
        if (existente) throw new AppError('EMAIL_DUP', 'Ese email ya esta en uso.', 409);
        updateUsuario.email = data.email;
      }
      if (Object.keys(updateUsuario).length > 0) {
        await tx.usuario.update({ where: { id: userId }, data: updateUsuario });
      }
      // 2) Datos especificos del rol
      if (usuario.alumnoId && usuario.alumno) {
        const updateAlumno = {};
        if (data.telefono !== undefined) updateAlumno.telefono = data.telefono;
        if (data.domicilioCalle !== undefined) updateAlumno.domicilioCalle = data.domicilioCalle;
        if (data.domicilioNumero !== undefined) updateAlumno.domicilioNumero = data.domicilioNumero;
        if (data.domicilioCiudad !== undefined) updateAlumno.domicilioCiudad = data.domicilioCiudad;
        if (data.domicilioProvincia !== undefined) updateAlumno.domicilioProvincia = data.domicilioProvincia;
        if (data.domicilioCP !== undefined) updateAlumno.domicilioCP = data.domicilioCP;
        if (Object.keys(updateAlumno).length > 0) {
          await tx.alumno.update({ where: { id: usuario.alumnoId }, data: updateAlumno });
        }
      }
      if (usuario.profesorId && usuario.profesor) {
        const updateProf = {};
        if (data.telefono !== undefined) updateProf.telefono = data.telefono;
        if (data.domicilioCalle !== undefined) updateProf.domicilioCalle = data.domicilioCalle;
        if (data.domicilioNumero !== undefined) updateProf.domicilioNumero = data.domicilioNumero;
        if (data.domicilioCiudad !== undefined) updateProf.domicilioCiudad = data.domicilioCiudad;
        if (data.domicilioProvincia !== undefined) updateProf.domicilioProvincia = data.domicilioProvincia;
        if (data.domicilioCP !== undefined) updateProf.domicilioCP = data.domicilioCP;
        if (data.genero !== undefined) updateProf.genero = data.genero;
        if (Object.keys(updateProf).length > 0) {
          await tx.profesor.update({ where: { id: usuario.profesorId }, data: updateProf });
        }
      }
      return await tx.usuario.findUnique({
        where: { id: userId },
        include: {
          alumno: { select: { id: true, nombre: true, apellido: true, dni: true, domicilioCalle: true, domicilioNumero: true, domicilioCiudad: true, domicilioProvincia: true, domicilioCP: true } },
          profesor: { select: { id: true, nombre: true, apellido: true, dni: true, telefono: true, genero: true, estado: true, domicilioCalle: true, domicilioNumero: true, domicilioCiudad: true, domicilioProvincia: true, domicilioCP: true } },
        },
      });
    });
    const { passwordHash, ...sinPassword } = resultado;
    return sinPassword;
  }
  // ============================================================
  // CAMBIAR PASSWORD PROPIO
  // ============================================================
  static async cambiarPasswordPropio(userId, passwordActual, passwordNueva) {
    if (!passwordActual || !passwordNueva) {
      throw new AppError('VALIDATION_ERROR', 'Faltan la contrasena actual o la nueva.', 400);
    }
    if (passwordNueva.length < 6) {
      throw new AppError('VALIDATION_ERROR', 'La contrasena debe tener al menos 6 caracteres.', 400);
    }
    const usuario = await prisma.usuario.findUnique({ where: { id: userId } });
    if (!usuario) throw new AppError('USUARIO_NOT_FOUND', 'Usuario no encontrado.', 404);
    const valida = await bcrypt.compare(passwordActual, usuario.passwordHash);
    if (!valida) throw new AppError('PASSWORD_INCORRECTA', 'La contrasena actual no es correcta.', 401);
    const passwordHash = await bcrypt.hash(passwordNueva, 10);
    await prisma.usuario.update({
      where: { id: userId },
      data: { passwordHash },
    });
    return { ok: true, message: 'Contrasena actualizada.' };
  }
}