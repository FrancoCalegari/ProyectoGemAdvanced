import jwt from 'jsonwebtoken';
import { AppError } from '../utils/errors.js';

const JWT_SECRET = process.env.JWT_SECRET || 'cambiar_este_valor';

export function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new AppError('TOKEN_REQUERIDO', 'Falta el token de autenticación.', 401));
  }

  const token = authHeader.substring(7);

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = {
      id: payload.sub,
      email: payload.email,
      rol: payload.rol,
      alumnoId: payload.alumnoId,
    };
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return next(new AppError('TOKEN_EXPIRADO', 'El token expiró. Vuelva a iniciar sesión.', 401));
    }
    return next(new AppError('TOKEN_INVALIDO', 'Token inválido.', 401));
  }
}

export function requireRole(rolesPermitidos) {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError('TOKEN_REQUERIDO', 'Falta el token de autenticación.', 401));
    }

    if (!rolesPermitidos.includes(req.user.rol)) {
      return next(new AppError('SIN_PERMISO', 'No tiene permisos para esta acción.', 403));
    }

    next();
  };
}

export function requireSelfOrRole(rolesPermitidos, paramName = 'id') {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError('TOKEN_REQUERIDO', 'Falta el token de autenticación.', 401));
    }

    const esAlumno = req.user.rol === 'ALUMNO';
    const esMismoAlumno = req.user.alumnoId === req.params[paramName];
    const tieneRolPermitido = rolesPermitidos.includes(req.user.rol);

    if (tieneRolPermitido || (esAlumno && esMismoAlumno)) {
      return next();
    }

    return next(new AppError('SIN_PERMISO', 'No tiene permisos para acceder a este recurso.', 403));
  };
}