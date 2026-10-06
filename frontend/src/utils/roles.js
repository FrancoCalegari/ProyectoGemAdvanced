// ============================================================
// ROLES: pagina inicial de cada rol
// ============================================================
export const ROLES_GESTION = ['ADMIN', 'SECRETARIA'];
export const ROLES_NO_DOCENTES = ['BEDEL', 'CELADOR'];

export function esGestion(rol) {
 return ROLES_GESTION.includes(rol);
}

export function esNoDocente(rol) {
 return ROLES_NO_DOCENTES.includes(rol);
}

/**
 * A donde mandamos a cada rol apenas inicia sesion.
 * Evita que un alumno o un docente caigan en el dashboard administrativo.
 */
// El celador sOlo navega por su panel personal (ver LayoutProtegido en App.jsx)
export const RUTAS_CELADOR = ['/mi-perfil', '/mis-horarios', '/mis-justificativos'];

export function homePathFor(rol) {
 switch (rol) {
 case 'ALUMNO':
 return '/mi-historia';
 case 'PROFESOR':
 return '/mis-cursadas';
 case 'BEDEL':
 return '/alumnos';
 case 'CELADOR':
 return '/mis-horarios';
 default:
 return '/dashboard';
 }
}
