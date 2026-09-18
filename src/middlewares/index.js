// ============================================================
// MIDDLEWARES GLOBALES
// ============================================================

import { ZodError } from 'zod';
import { AppError } from '../utils/errors.js';

// ------------------------------------------------------------
// NOT FOUND — Rutas inexistentes
// ------------------------------------------------------------

export function notFound(req, res, next) {
  res.status(404).json({
    error: 'NOT_FOUND',
    message: `Ruta no encontrada: ${req.method} ${req.originalUrl}`,
  });
}

// ------------------------------------------------------------
// VALIDATE — Valida req.body con Zod
// ------------------------------------------------------------

export function validate(schema) {
  return (req, res, next) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const detalles = error.errors.map((e) => ({
          campo: e.path.join('.'),
          mensaje: e.message,
        }));
        return res.status(400).json({
          error: 'VALIDATION_ERROR',
          message: 'Datos inválidos.',
          details: detalles,
        });
      }
      next(error);
    }
  };
}

// ------------------------------------------------------------
// ERROR HANDLER — Captura global de errores
// ------------------------------------------------------------

export function errorHandler(err, req, res, next) {
  if (err instanceof AppError) {
    return res.status(err.status).json({
      error: err.code,
      message: err.message,
      ...(err.details && { details: err.details }),
    });
  }

  if (err.code === 'P2002') {
    const campo = err.meta?.target?.join(', ') || 'campo';
    return res.status(409).json({
      error: 'DUPLICATE',
      message: `Ya existe un registro con ese valor único: ${campo}`,
    });
  }

  if (err.code === 'P2003') {
    return res.status(409).json({
      error: 'FOREIGN_KEY',
      message: 'Operación bloqueada por una referencia existente.',
    });
  }

  if (err.code === 'P2025') {
    return res.status(404).json({
      error: 'NOT_FOUND',
      message: 'El registro no existe.',
    });
  }

  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      error: 'INVALID_JSON',
      message: 'El body de la request no es JSON válido.',
    });
  }

  console.error('Error no manejado:', err);
  return res.status(500).json({
    error: 'INTERNAL_ERROR',
    message: 'Error interno del servidor.',
    ...(process.env.NODE_ENV === 'development' && { debug: err.message }),
  });
}