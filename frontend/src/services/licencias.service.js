import api from './api';

export const licenciasService = {
 listar: async (filtros = {}) => {
 const params = new URLSearchParams();
 if (filtros.estado) params.append('estado', filtros.estado);
 if (filtros.tipo) params.append('tipo', filtros.tipo);
 if (filtros.profesorId) params.append('profesorId', filtros.profesorId);
 if (filtros.desde) params.append('desde', filtros.desde);
 if (filtros.hasta) params.append('hasta', filtros.hasta);
 const qs = params.toString();
 const response = await api.get(`/licencias${qs ? `?${qs}` : ''}`);
 return response.data;
 },

 obtenerPorId: async (id) => {
 const response = await api.get(`/licencias/${id}`);
 return response.data;
 },

 crear: async (data) => {
 const response = await api.post('/licencias', data);
 return response.data;
 },

 actualizar: async (id, data) => {
 const response = await api.put(`/licencias/${id}`, data);
 return response.data;
 },

 eliminar: async (id) => {
 const response = await api.delete(`/licencias/${id}`);
 return response.data;
 },

 aprobar: async (id, data = {}) => {
 const response = await api.patch(`/licencias/${id}/aprobar`, data);
 return response.data;
 },

 rechazar: async (id, data = {}) => {
 const response = await api.patch(`/licencias/${id}/rechazar`, data);
 return response.data;
 },

 listarPorProfesor: async (profesorId) => {
 const response = await api.get(`/licencias/profesor/${profesorId}`);
 return response.data;
 },

 listarPorEmpleado: async (empleadoId) => {
 const response = await api.get(`/licencias/empleado/${empleadoId}`);
 return response.data;
 },

 misLicencias: async () => {
 const response = await api.get('/licencias/me');
 return response.data;
 },
};