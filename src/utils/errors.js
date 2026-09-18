// ============================================================
// ERRORES DE APLICACIÓN
// ============================================================

export class AppError extends Error {
  constructor(code, message, status = 400, details = null) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

// ============================================================
// CÓDIGOS DE ERROR PREDEFINIDOS
// ============================================================


export const ERRORS = {
  // --- Genéricos ---
  VALIDATION_ERROR:      ['VALIDATION_ERROR',      'Datos inválidos.',                      400],
  NOT_FOUND:             ['NOT_FOUND',             'Recurso no encontrado.',                404],
  INTERNAL_ERROR:        ['INTERNAL_ERROR',        'Error interno del servidor.',           500],

  // --- Títulos ---
  TITULO_NOT_FOUND:      ['TITULO_NOT_FOUND',      'Título no encontrado.',                 404],
  TITULO_NOMBRE_DUP:     ['TITULO_NOMBRE_DUP',     'Ya existe un título con ese nombre.',   409],
  TITULO_CON_INSCRIP:    ['TITULO_CON_INSCRIP',    'No se puede eliminar: tiene alumnos inscriptos.', 409],

  // --- Resoluciones ---
  RESOLUCION_NOT_FOUND:  ['RESOLUCION_NOT_FOUND',  'Resolución no encontrada.',             404],
  RESOLUCION_CODIGO_DUP: ['RESOLUCION_CODIGO_DUP', 'El código de resolución ya existe.',    409],
  RESOLUCION_CERRADA:    ['RESOLUCION_CERRADA',    'La resolución está cerrada y no se puede editar.', 409],

  // --- Años curriculares ---
  ANIO_NOT_FOUND:        ['ANIO_NOT_FOUND',        'Año curricular no encontrado.',         404],
  ANIO_NUMERO_DUP:       ['ANIO_NUMERO_DUP',       'Ya existe un año con ese número en la resolución.', 409],

  // --- Materias ---
  MATERIA_NOT_FOUND:     ['MATERIA_NOT_FOUND',     'Materia no encontrada.',                404],
  MATERIA_CODIGO_DUP:    ['MATERIA_CODIGO_DUP',    'El código de materia ya existe en este año.', 409],

  // --- Correlatividades ---
  CORRELATIVA_NOT_FOUND:    ['CORRELATIVA_NOT_FOUND',    'Correlatividad no encontrada.',      404],
  CORRELATIVA_DUPLICADA:    ['CORRELATIVA_DUPLICADA',    'Esa correlatividad ya existe.',      409],
  CORRELATIVA_MISMA_MATERIA:['CORRELATIVA_MISMA_MATERIA','Una materia no puede ser correlativa de sí misma.', 400],
  CORRELATIVA_CICLO:        ['CORRELATIVA_CICLO',        'La correlatividad genera un ciclo.', 400],
  CORRELATIVA_DISTINTA_RES: ['CORRELATIVA_DISTINTA_RES', 'Las materias deben pertenecer a la misma resolución.', 400],

  // --- Alumnos ---
  ALUMNO_NOT_FOUND:      ['ALUMNO_NOT_FOUND',      'Alumno no encontrado.',                 404],
  ALUMNO_DNI_DUP:        ['ALUMNO_DNI_DUP',        'Ya existe un alumno con ese DNI.',      409],
  ALUMNO_EMAIL_DUP:      ['ALUMNO_EMAIL_DUP',      'Ya existe un alumno con ese email.',    409],

  // --- Inscripciones ---
  INSCRIPCION_NOT_FOUND: ['INSCRIPCION_NOT_FOUND', 'Inscripción no encontrada.',            404],
  INSCRIPCION_DUP:       ['INSCRIPCION_DUP',       'El alumno ya está inscripto en ese título con esa resolución.', 409],
  SIN_RESOLUCION_VIGENTE:['SIN_RESOLUCION_VIGENTE','El título no tiene resolución vigente.',409],

  // --- Cursadas ---
  CURSADA_NOT_FOUND:     ['CURSADA_NOT_FOUND',     'Cursada no encontrada.',                404],
  CORRELATIVA_NO_CUMPLE: ['CORRELATIVA_NO_CUMPLE', 'No se cumplen las correlatividades.',   409],

  // --- Certificados ---
  CERTIFICADO_NOT_FOUND:     ['CERTIFICADO_NOT_FOUND',     'Certificado no encontrado.',        404],
  CERTIFICADO_NO_CORRESPONDE:['CERTIFICADO_NO_CORRESPONDE','El alumno no cumple los requisitos para este certificado.', 409],
};

// ============================================================
// HELPER: construir AppError desde un código
// ============================================================

export function appError(key, details = null, customMessage = null) {
  const [code, message, status] = ERRORS[key] || ERRORS.INTERNAL_ERROR;
  return new AppError(code, customMessage || message, status, details);
}