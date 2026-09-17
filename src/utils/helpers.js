// ============================================================
// HELPERS — Funciones utilitarias
// ============================================================

// ------------------------------------------------------------
// FECHAS
// ------------------------------------------------------------

export function soloFecha(fecha) {
  const d = new Date(fecha);
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

export function esFechaValida(fecha) {
  const d = new Date(fecha);
  return !isNaN(d.getTime());
}

// ------------------------------------------------------------
// RESOLUCIONES
// ------------------------------------------------------------

export function generarCodigoResolucion(numero, anioCreacion) {
  const numeroPad = String(numero).padStart(3, '0');
  return `RES-${numeroPad}/${anioCreacion}`;
}

// ------------------------------------------------------------
// RESPUESTAS HTTP
// ------------------------------------------------------------

export function ok(res, data, status = 200) {
  return res.status(status).json(data);
}

export function created(res, data) {
  return res.status(201).json(data);
}

export function noContent(res) {
  return res.status(204).send();
}