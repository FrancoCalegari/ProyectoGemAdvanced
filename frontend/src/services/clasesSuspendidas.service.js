import api from './api';

export const clasesSuspendidasService = {
 listar: async (filtros = {}) => {
 const params = new URLSearchParams();
 if (filtros.profesorId) params.append('profesorId', filtros.profesorId);
 if (filtros.materiaId) params.append('materiaId', filtros.materiaId);
 if (filtros.motivo) params.append('motivo', filtros.motivo);
 if (filtros.licenciaId) params.append('licenciaId', filtros.licenciaId);
 if (filtros.desde) params.append('desde', filtros.desde);
 if (filtros.hasta) params.append('hasta', filtros.hasta);
 const qs = params.toString();
 const response = await api.get(`/clases-suspendidas${qs ? `?${qs}` : ''}`);
 return response.data;
 },

 obtenerPorId: async (id) => {
 const response = await api.get(`/clases-suspendidas/${id}`);
 return response.data;
 },

 crearManual: async (data) => {
 const response = await api.post('/clases-suspendidas', data);
 return response.data;
 },

 eliminar: async (id) => {
 const response = await api.delete(`/clases-suspendidas/${id}`);
 return response.data;
 },

 reasignar: async (id, data) => {
 const response = await api.post(`/clases-suspendidas/${id}/reasignar`, data);
 return response.data;
 },

 eliminarReasignacion: async (claseId, reasignacionId) => {
 const response = await api.delete(`/clases-suspendidas/${claseId}/reasignar/${reasignacionId}`);
 return response.data;
 },

 resumen: async (desde, hasta) => {
 const params = new URLSearchParams();
 if (desde) params.append('desde', desde);
 if (hasta) params.append('hasta', hasta);
 const qs = params.toString();
 const response = await api.get(`/clases-suspendidas/resumen${qs ? `?${qs}` : ''}`);
 return response.data;
 },
};