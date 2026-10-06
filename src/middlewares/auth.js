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
      profesorId: payload.profesorId,
      empleadoId: payload.empleadoId,
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

/**
 * Permite el acceso si el usuario tiene uno de los roles permitidos
 * O si es "dueño" del recurso (alumno viendo su propio id, profesor el suyo,
 * o un empleado no docente viendo su propia ficha).
 *
 * paramName: nombre del parámetro en la URL que contiene el id (default: 'id')
 */
export function requireSelfOrRole(rolesPermitidos, paramName = 'id') {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError('TOKEN_REQUERIDO', 'Falta el token de autenticación.', 401));
    }

    const idParam = req.params[paramName];
    const tieneRolPermitido = rolesPermitidos.includes(req.user.rol);

    const esMismoAlumno = req.user.rol === 'ALUMNO' && req.user.alumnoId === idParam;
    const esMismoProfesor = req.user.rol === 'PROFESOR' && req.user.profesorId === idParam;
    const esMismoEmpleado =
      ['BEDEL', 'CELADOR'].includes(req.user.rol) && req.user.empleadoId === idParam;

    if (tieneRolPermitido || esMismoAlumno || esMismoProfesor || esMismoEmpleado) {
      return next();
    }

    return next(new AppError('SIN_PERMISO', 'No tiene permisos para acceder a este recurso.', 403));
  };
}

// =========================================================
// CELADOR: rol de autoservicio con default-deny.
//
// El celador no ve NINGUNA función administrativa del establecimiento:
// sólo su panel personal (sus datos, sus horarios y modificaciones, y la
// presentación de certificados / justificativos).
//
// En lugar de confiar en que cada router se acuerde de excluirlo, se aplica
// una lista blanca global: todo lo que no esté acá devuelve 403.
// =========================================================
const RUTAS_AUTOSERVICIO = [
  ['GET', /^\/api\/auth\/me$/],
  ['PATCH', /^\/api\/auth\/me$/],
  ['PATCH', /^\/api\/auth\/me\/password$/],
  ['GET', /^\/api\/empleados\/me$/],
  ['GET', /^\/api\/empleados\/me\/horarios$/],
  ['GET', /^\/api\/empleados\/me\/modificaciones$/],
  ['PATCH', /^\/api\/empleados\/me\/modificaciones\/visto$/],
  ['GET', /^\/api\/empleados\/me\/historial$/],
  ['GET', /^\/api\/licencias\/me$/],
  ['POST', /^\/api\/licencias$/],
  ['GET', /^\/api\/licencias\/[0-9a-fA-F-]{36}$/],
  ['PUT', /^\/api\/licencias\/[0-9a-fA-F-]{36}$/],
  ['DELETE', /^\/api\/licencias\/[0-9a-fA-F-]{36}$/],
];

export function bloqueoCelador(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) return next();

  let payload;
  try {
    payload = jwt.verify(authHeader.substring(7), JWT_SECRET);
  } catch {
    return next(); // token inválido o vencido: lo resuelve requireAuth
  }

  if (payload.rol !== 'CELADOR') return next();

  const url = (req.originalUrl || '').split('?')[0];
  const permitido = RUTAS_AUTOSERVICIO.some(([metodo, re]) => metodo === req.method && re.test(url));
  if (permitido) return next();

  return next(
    new AppError(
      'SIN_PERMISO',
      'El rol Celador accede únicamente a su panel personal: sus datos, sus horarios y sus justificativos.',
      403
    )
  );
}
