import api from './api';

export const cursadasService = {
 registrar: async (alumnoId, data) => {
 const response = await api.post(`/alumnos/${alumnoId}/cursadas`, data);
 return response.data;
 },

 actualizar: async (cursadaId, data) => {
 const response = await api.put(`/cursadas/${cursadaId}`, data);
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

// Las rutas del backend usan el plural "asistencias"
export const asistenciaService = {
 registrar: async (cursadaId, data) => {
 const response = await api.post(`/cursadas/${cursadaId}/asistencias`, data);
 return response.data;
 },

 registrarMasivo: async (cursadaId, data) => {
 const response = await api.post(`/cursadas/${cursadaId}/asistencias/masivo`, data);
 return response.data;
 },

 listarPorCursada: async (cursadaId) => {
 const response = await api.get(`/cursadas/${cursadaId}/asistencias`);
 return response.data;
 },

 listarPorRango: async (cursadaId, desde, hasta) => {
 const params = new URLSearchParams();
 if (desde) params.append('desde', desde);
 if (hasta) params.append('hasta', hasta);
 const qs = params.toString();
 const response = await api.get(
 `/cursadas/${cursadaId}/asistencias/rango${qs ? `?${qs}` : ''}`
 );
 return response.data;
 },

 resumen: async (cursadaId) => {
 const response = await api.get(`/cursadas/${cursadaId}/asistencias/resumen`);
 return response.data;
 },

 eliminar: async (id) => {
 const response = await api.delete(`/asistencias/${id}`);
 return response.data;
 },
};
