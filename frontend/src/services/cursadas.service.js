import api from './api';

export const cursadasService = {
 registrar: async (alumnoId, data) => {
 const response = await api.post(`/alumnos/${alumnoId}/cursadas`, data);
 return response.data;
 },

 listarPorInscripcion: async (inscripcionId) => {
 const response = await api.get(`/inscripciones/${inscripcionId}/cursadas`);
 return response.data;
 },

 historiaAcademica: async (alumnoId) => {
 const response = await api.get(`/alumnos/${alumnoId}/historia-academica`);
 return response.data;
 },
};

export const asistenciaService = {
 registrar: async (cursadaId, data) => {
 const response = await api.post(`/cursadas/${cursadaId}/asistencia`, data);
 return response.data;
 },

 registrarMasivo: async (cursadaId, data) => {
 const response = await api.post(`/cursadas/${cursadaId}/asistencia/masivo`, data);
 return response.data;
 },

 listarPorCursada: async (cursadaId) => {
 const response = await api.get(`/cursadas/${cursadaId}/asistencia`);
 return response.data;
 },

 listarPorRango: async (cursadaId, desde, hasta) => {
 const params = new URLSearchParams();
 if (desde) params.append('desde', desde);
 if (hasta) params.append('hasta', hasta);
 const qs = params.toString();
 const response = await api.get(
 `/cursadas/${cursadaId}/asistencia/rango${qs ? `?${qs}` : ''}`
 );
 return response.data;
 },

 resumen: async (cursadaId) => {
 const response = await api.get(`/cursadas/${cursadaId}/asistencia/resumen`);
 return response.data;
 },

 eliminar: async (id) => {
 const response = await api.delete(`/asistencia/${id}`);
 return response.data;
 },
};