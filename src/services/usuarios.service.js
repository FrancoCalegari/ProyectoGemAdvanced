import bcrypt from 'bcrypt';
import prisma from '../config/db.js';
import { AppError, ERRORS } from '../utils/errors.js';

const ROLES_VALIDOS = ['ADMIN', 'SECRETARIA', 'ALUMNO', 'PROFESOR', 'BEDEL', 'CELADOR'];

export class UsuariosService {
  // ============================================================
  // LISTAR (con filtros)
  // ============================================================
  static async listar(filtros = {}) {
    const where = {};

    if (filtros.rol) where.rol = filtros.rol;
    if (filtros.activo !== undefined) {
      where.activo = filtros.activo === 'true' || filtros.activo === true;
    }
    if (filtros.busqueda) {
      where.OR = [
        { nombre:   { contains: filtros.busqueda, mode: 'insensitive' } },
        { apellido: { contains: filtros.busqueda, mode: 'insensitive' } },
        { email:    { contains: filtros.busqueda, mode: 'insensitive' } },
      ];
    }

    const usuarios = await prisma.usuario.findMany({
      where,
      select: {
        id: true,
        email: true,
        nombre: true,
        apellido: true,
        rol: true,
        activo: true,
        alumnoId: true,
        profesorId: true,
        createdAt: true,
        alumno: {
          select: { id: true, nombre: true, apellido: true, dni: true },
        },
        profesor: {
          select: { id: true, nombre: true, apellido: true, dni: true, estado: true },
        },
      },
      orderBy: [{ activo: 'desc' }, { apellido: 'asc' }, { nombre: 'asc' }],
    });

    return usuarios;
  }

  // ============================================================
  // OBTENER POR ID
  // ============================================================
  static async obtenerPorId(id) {
    const usuario = await prisma.usuario.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        nombre: true,
        apellido: true,
        rol: true,
        activo: true,
        alumnoId: true,
        profesorId: true,
        createdAt: true,
        alumno: { select: { id: true, nombre: true, apellido: true, dni: true } },
        profesor: { select: { id: true, nombre: true, apellido: true, dni: true, estado: true } },
      },
    });

    if (!usuario) {
      throw new AppError('USUARIO_NOT_FOUND', 'Usuario no encontrado.', 404);
    }

    return usuario;
  }

  // ============================================================
  // PROFESORES SIN USUARIO (para el select)
  // ============================================================
  static async listarProfesoresSinUsuario() {
    return await prisma.profesor.findMany({
      where: { usuario: null },
      select: { id: true, nombre: true, apellido: true, dni: true, email: true, estado: true },
      orderBy: [{ apellido: 'asc' }, { nombre: 'asc' }],
    });
  }

  // ============================================================
  // ACTUALIZAR (solo datos permitidos, no password)
  // ============================================================
  static async actualizar(id, data) {
    const usuario = await prisma.usuario.findUnique({ where: { id } });
    if (!usuario) throw new AppError('USUARIO_NOT_FOUND', 'Usuario no encontrado.', 404);

    // Email duplicado
    if (data.email && data.email !== usuario.email) {
      const existente = await prisma.usuario.findUnique({ where: { email: data.email } });
      if (existente) throw new AppError('EMAIL_DUP', 'Ya existe un usuario con ese email.', 409);
    }

    // Rol válido
    if (data.rol && !ROLES_VALIDOS.includes(data.rol)) {
      throw new AppError('VALIDATION_ERROR', 'Rol inválido.', 400);
    }

    const actualizado = await prisma.usuario.update({
      where: { id },
      data: {
        ...(data.email && { email: data.email }),
        ...(data.nombre && { nombre: data.nombre }),
        ...(data.apellido && { apellido: data.apellido }),
        ...(data.rol && { rol: data.rol }),
        ...(data.activo !== undefined && { activo: !!data.activo }),
      },
      select: {
        id: true,
        email: true,
        nombre: true,
        apellido: true,
        rol: true,
        activo: true,
        alumnoId: true,
        profesorId: true,
        createdAt: true,
      },
    });

    return actualizado;
  }

  // ============================================================
  // CAMBIAR PASSWORD (por ADMIN)
  // ============================================================
  static async cambiarPassword(id, newPassword) {
    if (!newPassword || newPassword.length < 6) {
      throw new AppError('VALIDATION_ERROR', 'La contraseña debe tener al menos 6 caracteres.', 400);
    }

    const usuario = await prisma.usuario.findUnique({ where: { id } });
    if (!usuario) throw new AppError('USUARIO_NOT_FOUND', 'Usuario no encontrado.', 404);

    const passwordHash = await bcrypt.hash(newPassword, 10);
    return await prisma.usuario.update({
      where: { id },
      data: { passwordHash },
      select: { id: true, email: true },
    });
  }

  // ============================================================
  // BAJA LÓGICA (activo = false)
  // ============================================================
  static async bajaLogica(id, solicitanteId) {
    if (id === solicitanteId) {
      throw new AppError('NO_AUTO_BAJA', 'No podés darte de baja a vos mismo.', 400);
    }

    const usuario = await prisma.usuario.findUnique({ where: { id } });
    if (!usuario) throw new AppError('USUARIO_NOT_FOUND', 'Usuario no encontrado.', 404);

    if (!usuario.activo) {
      throw new AppError('USUARIO_YA_INACTIVO', 'El usuario ya está dado de baja.', 409);
    }

    return await prisma.usuario.update({
      where: { id },
      data: { activo: false },
      select: { id: true, email: true, activo: true },
    });
  }

  // ============================================================
  // REACTIVAR (activo = true)
  // ============================================================
  static async reactivar(id) {
    const usuario = await prisma.usuario.findUnique({ where: { id } });
    if (!usuario) throw new AppError('USUARIO_NOT_FOUND', 'Usuario no encontrado.', 404);

    if (usuario.activo) {
      throw new AppError('USUARIO_YA_ACTIVO', 'El usuario ya está activo.', 409);
    }

    return await prisma.usuario.update({
      where: { id },
      data: { activo: true },
      select: { id: true, email: true, activo: true },
    });
  }
}