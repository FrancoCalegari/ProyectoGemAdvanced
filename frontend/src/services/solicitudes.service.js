import api from './api';

export const solicitudesService = {
 listar: async (filtros = {}) => {
 const params = new URLSearchParams();
 if (filtros.estado) params.append('estado', filtros.estado);
 if (filtros.tipo) params.append('tipo', filtros.tipo);
 if (filtros.alumnoId) params.append('alumnoId', filtros.alumnoId);
 if (filtros.profesorId) params.append('profesorId', filtros.profesorId);
 const qs = params.toString();
 const response = await api.get(`/solicitudes${qs ? `?${qs}` : ''}`);
 return response.data;
 },

 obtenerPorId: async (id) => {
 const response = await api.get(`/solicitudes/${id}`);
 return response.data;
 },

 crear: async (data) => {
 const response = await api.post('/solicitudes', data);
 return response.data;
 },

 actualizar: async (id, data) => {
 const response = await api.put(`/solicitudes/${id}`, data);
 return response.data;
 },

 eliminar: async (id) => {
 const response = await api.delete(`/solicitudes/${id}`);
 return response.data;
 },

 aprobar: async (id, data = {}) => {
 const response = await api.patch(`/solicitudes/${id}/aprobar`, data);
 return response.data;
 },

 rechazar: async (id, data = {}) => {
 const response = await api.patch(`/solicitudes/${id}/rechazar`, data);
 return response.data;
 },

 misSolicitudes: async () => {
 const response = await api.get('/solicitudes/me');
 return response.data;
 },
};