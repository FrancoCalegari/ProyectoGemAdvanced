import api from './api';

export const certificadosPresentadosService = {
 // ----------------------------------------------------------
 // ALUMNO
 // ----------------------------------------------------------
 crear: async (alumnoId, data) => {
 const response = await api.post(`/alumnos/${alumnoId}/certificados-presentados`, data);
 return response.data;
 },

 listarPorAlumno: async (alumnoId) => {
 const response = await api.get(`/alumnos/${alumnoId}/certificados-presentados`);
 return response.data;
 },

 // ----------------------------------------------------------
 // ADMIN / SECRETARIA
 // ----------------------------------------------------------
 listar: async (filtros = {}) => {
 const params = new URLSearchParams();
 if (filtros.estado) params.append('estado', filtros.estado);
 if (filtros.tipo) params.append('tipo', filtros.tipo);
 const qs = params.toString();
 const response = await api.get(`/certificados-presentados${qs ? `?${qs}` : ''}`);
 return response.data;
 },

 obtenerPorId: async (id) => {
 const response = await api.get(`/certificados-presentados/${id}`);
 return response.data;
 },

 aprobar: async (id, data = {}) => {
 const response = await api.put(`/certificados-presentados/${id}/aprobar`, data);
 return response.data;
 },

 rechazar: async (id, data = {}) => {
 const response = await api.put(`/certificados-presentados/${id}/rechazar`, data);
 return response.data;
 },

 eliminar: async (id) => {
 const response = await api.delete(`/certificados-presentados/${id}`);
 return response.data;
 },
};