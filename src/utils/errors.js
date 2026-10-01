export class AppError extends Error {
  constructor(code, message, status = 400, details = null) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

export const ERRORS = {
  VALIDATION_ERROR:       ['VALIDATION_ERROR',       'Datos inválidos.',                                    400],
  NOT_FOUND:              ['NOT_FOUND',              'Recurso no encontrado.',                              404],
  INTERNAL_ERROR:         ['INTERNAL_ERROR',         'Error interno del servidor.',                         500],
  FOREIGN_KEY_ERROR:      ['FOREIGN_KEY_ERROR',      'Operación bloqueada por una referencia existente.',   409],

  TITULO_NOT_FOUND:       ['TITULO_NOT_FOUND',       'Título no encontrado.',                               404],
  TITULO_NOMBRE_DUP:      ['TITULO_NOMBRE_DUP',      'Ya existe un título con ese nombre.',                 409],
  TITULO_CON_INSCRIP:     ['TITULO_CON_INSCRIP',     'No se puede eliminar: tiene alumnos inscriptos.',     409],

  RESOLUCION_NOT_FOUND:   ['RESOLUCION_NOT_FOUND',   'Resolución no encontrada.',                           404],
  RESOLUCION_CODIGO_DUP:  ['RESOLUCION_CODIGO_DUP',  'El código de resolución ya existe.',                  409],
  RESOLUCION_CERRADA:     ['RESOLUCION_CERRADA',     'La resolución está cerrada y no se puede editar.',    409],

  ANIO_NOT_FOUND:         ['ANIO_NOT_FOUND',         'Año curricular no encontrado.',                       404],
  ANIO_NUMERO_DUP:        ['ANIO_NUMERO_DUP',        'Ya existe un año con ese número en la resolución.',   409],

  MATERIA_NOT_FOUND:      ['MATERIA_NOT_FOUND',      'Materia no encontrada.',                              404],
  MATERIA_CODIGO_DUP:     ['MATERIA_CODIGO_DUP',     'El código de materia ya existe en este año.',         409],
  MATERIA_CON_CURSADAS:   ['MATERIA_CON_CURSADAS',   'No se puede eliminar: tiene cursadas registradas.',   409],

  CORRELATIVA_NOT_FOUND:      ['CORRELATIVA_NOT_FOUND',      'Correlatividad no encontrada.',                        404],
  CORRELATIVA_DUPLICADA:      ['CORRELATIVA_DUPLICADA',      'Esa correlatividad ya existe.',                        409],
  CORRELATIVA_MISMA_MATERIA:  ['CORRELATIVA_MISMA_MATERIA',  'Una materia no puede ser correlativa de sí misma.',    400],
  CORRELATIVA_CICLO:          ['CORRELATIVA_CICLO',          'La correlatividad genera un ciclo.',                   400],
  CORRELATIVA_DISTINTA_RES:   ['CORRELATIVA_DISTINTA_RES',   'Las materias deben pertenecer a la misma resolución.', 400],

  ALUMNO_NOT_FOUND:       ['ALUMNO_NOT_FOUND',       'Alumno no encontrado.',                               404],
  ALUMNO_DNI_DUP:         ['ALUMNO_DNI_DUP',         'Ya existe un alumno con ese DNI.',                    409],
  ALUMNO_EMAIL_DUP:       ['ALUMNO_EMAIL_DUP',       'Ya existe un alumno con ese email.',                  409],

  INSCRIPCION_NOT_FOUND:  ['INSCRIPCION_NOT_FOUND',  'Inscripción no encontrada.',                          404],
  INSCRIPCION_DUP:        ['INSCRIPCION_DUP',        'El alumno ya está inscripto en ese título con esa resolución.', 409],
  SIN_RESOLUCION_VIGENTE: ['SIN_RESOLUCION_VIGENTE', 'El título no tiene resolución vigente.',              409],

  CURSADA_NOT_FOUND:      ['CURSADA_NOT_FOUND',      'Cursada no encontrada.',                              404],
  CORRELATIVA_NO_CUMPLE:  ['CORRELATIVA_NO_CUMPLE',  'No se cumplen las correlatividades.',                 409],

  PROFESOR_NOT_FOUND:         ['PROFESOR_NOT_FOUND',         'Profesor no encontrado.',                                     404],
  PROFESOR_DNI_DUP:           ['PROFESOR_DNI_DUP',           'Ya existe un profesor con ese DNI.',                          409],
  PROFESOR_EMAIL_DUP:         ['PROFESOR_EMAIL_DUP',         'Ya existe un profesor con ese email.',                        409],
  PROFESOR_CON_DEPENDENCIAS:  ['PROFESOR_CON_DEPENDENCIAS',  'No se puede eliminar: tiene licencias, solicitudes o notas cargadas.', 409],
  PROFESOR_SIN_TITULO:        ['PROFESOR_SIN_TITULO',        'El profesor debe tener al menos un título cargado.',          400],
  TITULO_PROFESOR_NOT_FOUND:  ['TITULO_PROFESOR_NOT_FOUND',  'Título de profesor no encontrado.',                           404],
  MATERIA_PROFESOR_NOT_FOUND: ['MATERIA_PROFESOR_NOT_FOUND', 'Asignación de materia no encontrada.',                        404],
  MATERIA_PROFESOR_DUP:       ['MATERIA_PROFESOR_DUP',       'El profesor ya tiene esa materia asignada en ese día y hora.', 409],
  LICENCIA_NOT_FOUND:         ['LICENCIA_NOT_FOUND',         'Licencia no encontrada.',                                      404],
  LICENCIA_SOLO_PENDIENTE:    ['LICENCIA_SOLO_PENDIENTE',    'Solo se pueden editar/eliminar licencias en estado PENDIENTE.', 409],
  LICENCIA_YA_RESUELTA:       ['LICENCIA_YA_RESUELTA',       'Esta licencia ya fue aprobada o rechazada.',                   409],
  LICENCIA_FECHAS_INVALIDAS:  ['LICENCIA_FECHAS_INVALIDAS',  'La fecha desde debe ser anterior o igual a la fecha hasta.',   400],
  LICENCIA_HORAS_INVALIDAS:   ['LICENCIA_HORAS_INVALIDAS',   'La hora desde debe ser anterior a la hora hasta.',             400],
  LICENCIA_FEMENINO_SOLO:     ['LICENCIA_FEMENINO_SOLO',     'El tipo ESTUDIOS_FEMENINOS solo aplica a docentes de género F.', 400],
  LICENCIA_GRANULARIDAD:      ['LICENCIA_GRANULARIDAD',      'Indicá todoElDia=true, o bien horaDesde+horaHasta, o turno.',   400],
  SOLICITUD_NOT_FOUND:        ['SOLICITUD_NOT_FOUND',        'Solicitud no encontrada.',                                     404],
  SOLICITUD_SOLO_PENDIENTE:   ['SOLICITUD_SOLO_PENDIENTE',   'Solo se pueden editar/eliminar solicitudes en estado PENDIENTE.', 409],
  SOLICITUD_YA_RESUELTA:      ['SOLICITUD_YA_RESUELTA',      'Esta solicitud ya fue aprobada o rechazada.',                  409],
  SOLICITUD_SIN_DUENIO:       ['SOLICITUD_SIN_DUENIO',       'La solicitud debe pertenecer a un alumno o a un profesor.',    400],
  CERTIFICADO_NOT_FOUND:      ['CERTIFICADO_NOT_FOUND',      'Certificado no encontrado.',                                   404],
  CERTIFICADO_NO_CORRESPONDE: ['CERTIFICADO_NO_CORRESPONDE', 'El alumno no cumple los requisitos para este certificado.',    409],
};

export function appError(key, details = null, customMessage = null) {
  const [code, message, status] = ERRORS[key] || ERRORS.INTERNAL_ERROR;
  return new AppError(code, customMessage || message, status, details);
}