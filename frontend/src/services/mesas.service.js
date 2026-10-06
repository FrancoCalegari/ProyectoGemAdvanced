import api from './api';

export const mesasService = {
 // ----------------------------------------------------------
 // ADMIN / SECRETARIA
 // ----------------------------------------------------------
 crear: async (data) => {
 const response = await api.post('/mesas', data);
 return response.data;
 },

 listar: async (filtros = {}) => {
 const params = new URLSearchParams();
 if (filtros.materiaId) params.append('materiaId', filtros.materiaId);
 if (filtros.estado) params.append('estado', filtros.estado);
 if (filtros.desde) params.append('desde', filtros.desde);
 if (filtros.hasta) params.append('hasta', filtros.hasta);
 const qs = params.toString();
 const response = await api.get(`/mesas${qs ? `?${qs}` : ''}`);
 return response.data;
 },

 obtenerPorId: async (id) => {
 const response = await api.get(`/mesas/${id}`);
 return response.data;
 },

 listarInscripciones: async (mesaId) => {
 const response = await api.get(`/mesas/${mesaId}/inscripciones`);
 return response.data;
 },

 actualizarEstado: async (id, data) => {
 const response = await api.put(`/mesas/${id}/estado`, data);
 return response.data;
 },

 registrarAsistencia: async (mesaId, alumnoId, data) => {
 const response = await api.put(`/mesas/${mesaId}/inscripciones/${alumnoId}/asistencia`, data);
 return response.data;
 },

 // ----------------------------------------------------------
 // ALUMNO
 // ----------------------------------------------------------
 listarDisponibles: async (alumnoId) => {
 const response = await api.get(`/alumnos/${alumnoId}/mesas-disponibles`);
 return response.data;
 },

 inscribir: async (mesaId, data = {}) => {
 const response = await api.post(`/mesas/${mesaId}/inscribir`, data);
 return response.data;
 },

 cancelar: async (mesaId, data = {}) => {
 const response = await api.delete(`/mesas/${mesaId}/inscribir`, { data });
 return response.data;
 },
};