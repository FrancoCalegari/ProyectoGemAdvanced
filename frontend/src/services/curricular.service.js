import api from './api';

export const curricularService = {
 listarTodasLasMaterias: async () => {
 const response = await api.get('/curricular/materias');
 return response.data;
 },

 listarAulas: async () => {
 const response = await api.get('/curricular/aulas');
 return response.data;
 },

 listarMateriasDeAnio: async (anioId) => {
 const response = await api.get(`/curricular/anios/${anioId}/materias`);
 return response.data;
 },

 obtenerPlan: async (resolucionId) => {
 const response = await api.get(`/curricular/resoluciones/${resolucionId}/plan`);
 return response.data;
 },


 crearMateria: async (anioId, data) => {
 const response = await api.post(`/curricular/anios/${anioId}/materias`, data);
 return response.data;
 },

 actualizarMateria: async (id, data) => {
 const response = await api.put(`/curricular/materias/${id}`, data);
 return response.data;
 },

 obtenerMateriaPorId: async (id) => {
 const response = await api.get(`/curricular/materias/${id}`);
 return response.data;
 },
};