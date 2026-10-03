// ============================================================
// ETIQUETAS ENTENDIBLES DEL SISTEMA
// Reemplaza los codigos tecnicos por texto claro
// ============================================================
export const ROL_LABEL = {
 ADMIN: 'Administrador',
 SECRETARIA: 'Secretaria',
 ALUMNO: 'Alumno',
 PROFESOR: 'Docente',
};

export const ESTADO_ALUMNO_LABEL = {
 ACTIVO: 'Cursando',
 EGRESADO: 'Graduado',
 BAJA: 'Dado de Baja',
 INACTIVO: 'Sin Actividad',
};

export const ESTADO_PROFESOR_LABEL = {
 ACTIVO: 'En Funciones',
 SUPLENCIA: 'Suplente',
 INACTIVO: 'Dado de Baja',
};

export const ESTADO_USUARIO_LABEL = {
 true: 'Habilitado',
 false: 'Deshabilitado',
};

export const ESTADO_CURSADA_LABEL = {
 APROBADA: 'Aprobada',
 REGULAR: 'Regular',
 EN_CURSO: 'Cursando',
 DESAPROBADA: 'Desaprobada',
 LIBRE: 'Libre',
 NO_CURSADA: 'No Iniciada',
};

export const ESTADO_MESA_LABEL = {
 PROGRAMADA: 'Programada',
 EN_CURSO: 'En Curso',
 FINALIZADA: 'Finalizada',
 CANCELADA: 'Cancelada',
};

export const TIPO_MESA_LABEL = {
 EXAMEN_FINAL: 'Examen Final',
 INGRESO_NIVELATORIO: 'Examen de Ingreso',
};

export const ESTADO_LICENCIA_LABEL = {
 PENDIENTE: 'Pendiente Aprobacion',
 APROBADA: 'Aprobada',
 RECHAZADA: 'Rechazada',
};

export const TIPO_LICENCIA_LABEL = {
 ENFERMEDAD: 'Enfermedad',
 RAZON_PARTICULAR: 'Razon Particular',
 ESTUDIOS_FEMENINOS: 'Estudios Femeninos',
 DONACION_SANGRE: 'Donacion de Sangre',
 ACCIDENTE_LABORAL: 'Accidente Laboral',
 OTRO: 'Otro Motivo',
};

export const ESTADO_SOLICITUD_LABEL = {
 PENDIENTE: 'Pendiente',
 APROBADA: 'Aprobada',
 RECHAZADA: 'Rechazada',
};

export const TIPO_SOLICITUD_LABEL = {
 CAMBIO_HORARIO: 'Cambio de Horario',
 AUSENCIA_PROGRAMADA: 'Ausencia Programada',
 CAMBIO_MATERIA: 'Cambio de Materia',
 OTRO: 'Otro Pedido',
};

export const ESTADO_ASISTENCIA_LABEL = {
 PRESENTE: 'Presente',
 AUSENTE: 'Ausente',
 JUSTIFICADO: 'Falta Justificada',
};

export const ESTADO_CERTIFICADO_LABEL = {
 EMITIDO: 'Vigente',
 ANULADO: 'Anulado',
};

export const TIPO_CERTIFICADO_LABEL = {
 PARCIAL_ANIO: 'Constancia Parcial de Año',
 TITULO_COMPLETO: 'Título Completo',
 CONCURRENCIA: 'Constancia de Asistencia',
 PARA_COLECTIVO: 'Constancia para Colectivo',
 LABORAL: 'Constancia Laboral',
 PARA_RENDIR: 'Constancia para Rendir',
};

export const ESTADO_CERTIFICADO_PRESENTADO_LABEL = {
 PENDIENTE: 'Pendiente Revision',
 APROBADO: 'Aprobado',
 RECHAZADO: 'Rechazado',
};

export const TIPO_CERTIFICADO_PRESENTADO_LABEL = {
 MEDICO: 'Certificado Médico',
 LABORAL: 'Certificado Laboral',
 FAMILIAR: 'Certificado Familiar',
 OTRO: 'Otro Tipo',
};

export const MOTIVO_SUSPENSION_LABEL = {
 LICENCIA_PROFESOR: 'Licencia Docente',
 FERIADO: 'Feriado',
 PARO: 'Paro',
 CLIMA: 'Clima Adverso',
 OTRO: 'Otro Motivo',
};

export const TURNO_LABEL = {
 MANANA: 'Mañana (07-13hs)',
 TARDE: 'Tarde (13-19hs)',
 NOCHE: 'Noche (19-23hs)',
};
// ============================================================
// NIVELES Y TIPOS DE CURSADA (plan de estudios)
// ============================================================
export const NIVEL_LABEL = {
 Terciario: 'Terciario',
 Universitario: 'Universitario',
 Secundario: 'Secundario',
};

export const TIPO_CURSADA_LABEL = {
 ANUAL: 'Anual',
 CUATRIMESTRAL_1: '1er Cuatrimestre',
 CUATRIMESTRAL_2: '2do Cuatrimestre',
};

export const ESTADO_TITULO_LABEL = {
 ACTIVO: 'Vigente',
 DE_BAJA: 'Dado de Baja',
};