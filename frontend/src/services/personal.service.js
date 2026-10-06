import api from './api';

export const personalService = {
 // Vista unificada: administradores, secretarias, bedeles y celadores
 listar: async (filtros = {}) => {
 const params = new URLSearchParams();
 if (filtros.busqueda) params.append('busqueda', filtros.busqueda);
 const qs = params.toString();
 const response = await api.get(`/personal${qs ? `?${qs}` : ''}`);
 return response.data;
 },

 obtenerPorUsuario: async (usuarioId) => {
 const response = await api.get(`/personal/usuario/${usuarioId}`);
 return response.data;
 },
};

export const ROL_PERSONAL_LABEL = {
 ADMIN: 'Administrador',
 SECRETARIA: 'Secretaria',
 BEDEL: 'Bedel',
 CELADOR: 'Celador',
 OTRO: 'No docente',
};

export const ROL_PERSONAL_BADGE = {
 ADMIN: 'destructive',
 SECRETARIA: 'secondary',
 BEDEL: 'outline',
 CELADOR: 'outline',
 OTRO: 'muted',
};
