import api from './api';

export const usuariosService = {
 // Listar usuarios (con filtros: rol, activo, busqueda)
 listar: async (filtros = {}) => {
 const params = new URLSearchParams();
 if (filtros.rol) params.append('rol', filtros.rol);
 if (filtros.activo !== undefined) params.append('activo', filtros.activo);
 if (filtros.busqueda) params.append('busqueda', filtros.busqueda);
 const qs = params.toString();
 const response = await api.get(`/usuarios${qs ? `?${qs}` : ''}`);
 return response.data;
 },

 obtenerPorId: async (id) => {
 const response = await api.get(`/usuarios/${id}`);
 return response.data;
 },

 // Profesores que todavia no tienen usuario asignado (para el select)
 listarProfesoresSinUsuario: async () => {
 const response = await api.get('/usuarios/profesores-sin-usuario');
 return response.data;
 },

 // Registrar usuario nuevo (usa /auth/register)
 registrar: async (data) => {
 const response = await api.post('/auth/register', data);
 return response.data;
 },

 // Actualizar datos (email, nombre, apellido, rol, activo)
 actualizar: async (id, data) => {
 const response = await api.put(`/usuarios/${id}`, data);
 return response.data;
 },

 // Cambiar password (solo ADMIN)
 cambiarPassword: async (id, newPassword) => {
 const response = await api.put(`/usuarios/${id}/password`, { newPassword });
 return response.data;
 },

 // Baja logica (activo = false)
 darDeBaja: async (id) => {
 const response = await api.patch(`/usuarios/${id}/baja`);
 return response.data;
 },

 // Reactivar (activo = true)
 reactivar: async (id) => {
 const response = await api.patch(`/usuarios/${id}/reactivar`);
 return response.data;
 },

 // Datos del usuario autenticado
 me: async () => {
 const response = await api.get('/auth/me');
 return response.data;
 },
};