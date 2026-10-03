import api from './api';

export const profesoresService = {
 listar: async (filtros = {}) => {
 const params = new URLSearchParams();
 if (filtros.busqueda) params.append('busqueda', filtros.busqueda);
 if (filtros.estado) params.append('estado', filtros.estado);
 const qs = params.toString();
 const response = await api.get(`/profesores${qs ? `?${qs}` : ''}`);
 return response.data;
 },

 obtenerPorId: async (id) => {
 const response = await api.get(`/profesores/${id}`);
 return response.data;
 },

 crear: async (data) => {
 const response = await api.post('/profesores', data);
 return response.data;
 },

 actualizar: async (id, data) => {
 const response = await api.put(`/profesores/${id}`, data);
 return response.data;
 },

 eliminar: async (id) => {
 const response = await api.delete(`/profesores/${id}`);
 return response.data;
 },

 agregarTitulo: async (id, data) => {
 const response = await api.post(`/profesores/${id}/titulos`, data);
 return response.data;
 },

 eliminarTitulo: async (id, tituloId) => {
 const response = await api.delete(`/profesores/${id}/titulos/${tituloId}`);
 return response.data;
 },

 asignarMateria: async (id, data) => {
 const response = await api.post(`/profesores/${id}/materias`, data);
 return response.data;
 },

 desasignarMateria: async (id, mpId) => {
 const response = await api.delete(`/profesores/${id}/materias/${mpId}`);
 return response.data;
 },

 misMaterias: async () => {
 const response = await api.get('/profesores/me/materias');
 return response.data;
 },
 darDeBaja: async (id) => {
 const response = await api.patch(`/profesores/${id}/baja`);
 return response.data;
 },
 reactivar: async (id) => {
 const response = await api.patch(`/profesores/${id}/reactivar`);
 return response.data;
 },
 cambiarEstado: async (id, estado) => {
 const response = await api.patch(`/profesores/${id}/estado`, { estado });
 return response.data;
 }
};