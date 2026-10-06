import api from './api';

export const titulosService = {
 listar: async () => {
 const response = await api.get('/titulos');
 return response.data;
 },

 obtenerPorId: async (id) => {
 const response = await api.get(`/titulos/${id}`);
 return response.data;
 },

 crear: async (data) => {
 const response = await api.post('/titulos', data);
 return response.data;
 },

 actualizar: async (id, data) => {
 const response = await api.put(`/titulos/${id}`, data);
 return response.data;
 },

 darDeBaja: async (id) => {
 const response = await api.delete(`/titulos/${id}`);
 return response.data;
 },

 listarResoluciones: async (tituloId) => {
 const response = await api.get(`/titulos/${tituloId}/resoluciones`);
 return response.data;
 },

 crearResolucion: async (tituloId, data) => {
 const response = await api.post(`/titulos/${tituloId}/resoluciones`, data);
 return response.data;
 },
};
