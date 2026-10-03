import api from './api';

export const alumnosService = {
 listar: async (filtros = {}) => {
 const params = new URLSearchParams();
 if (filtros.busqueda) params.append('busqueda', filtros.busqueda);
 if (filtros.estado) params.append('estado', filtros.estado);
 const qs = params.toString();
 const response = await api.get(`/alumnos${qs ? `?${qs}` : ''}`);
 return response.data;
 },

 listarAgrupados: async () => {
 const response = await api.get('/alumnos/agrupados');
 return response.data;
 },

 obtenerPorId: async (id) => {
 const response = await api.get(`/alumnos/${id}`);
 return response.data;
 },

 crear: async (data) => {
 const response = await api.post('/alumnos', data);
 return response.data;
 },

 actualizar: async (id, data) => {
 const response = await api.put(`/alumnos/${id}`, data);
 return response.data;
 },

 eliminar: async (id) => {
 const response = await api.delete(`/alumnos/${id}`);
 return response.data;
 },

 obtenerAdmision: async (id) => {
 const response = await api.get(`/alumnos/${id}/admision`);
 return response.data;
 },

 listarExamenes: async (id) => {
 const response = await api.get(`/alumnos/${id}/examenes`);
 return response.data;
 },

 crearExamen: async (id, data) => {
 const response = await api.post(`/alumnos/${id}/examenes`, data);
 return response.data;
 },

 actualizarExamen: async (id, examenId, data) => {
 const response = await api.put(`/alumnos/${id}/examenes/${examenId}`, data);
 return response.data;
 },

 listarInscripciones: async (id) => {
 const response = await api.get(`/alumnos/${id}/inscripciones`);
 return response.data;
 },

 crearInscripcion: async (id, data) => {
 const response = await api.post(`/alumnos/${id}/inscripciones`, data);
 return response.data;
 },

 historiaAcademica: async (id) => {
 const response = await api.get(`/alumnos/${id}/historia-academica`);
 return response.data;
 },
 // ============================================================
 // HISTORIAL (todos los alumnos, cualquier estado)
 // ============================================================
 historial: async (filtros = {}) => {
 const params = new URLSearchParams();
 if (filtros.estadoAlumno) params.append('estadoAlumno', filtros.estadoAlumno);
 if (filtros.busqueda) params.append('busqueda', filtros.busqueda);
 const qs = params.toString();
 const response = await api.get(`/alumnos/historial${qs ? `?${qs}` : ''}`);
 return response.data;
 },
 // ============================================================
 // BAJA LOGICA
 // ============================================================
 darDeBaja: async (id) => {
 const response = await api.patch(`/alumnos/${id}/baja`);
 return response.data;
 },
 // ============================================================
 // REACTIVAR
 // ============================================================
 reactivar: async (id) => {
 const response = await api.patch(`/alumnos/${id}/reactivar`);
 return response.data;
 },
 // ============================================================
 // CAMBIAR ESTADO (ACTIVO/EGRESADO/BAJA/INACTIVO)
 // ============================================================
 cambiarEstado: async (id, estado) => {
 const response = await api.patch(`/alumnos/${id}/estado`, { estado });
 return response.data;
 },


 // ============================================================
 // CERTIFICADOS
 // ============================================================
 listarCertificados: async (alumnoId) => {
 const response = await api.get(`/alumnos/${alumnoId}/certificados`);
 return response.data;
 },

 solicitarCertificado: async (alumnoId, data) => {
 const response = await api.post(`/alumnos/${alumnoId}/certificados`, data);
 return response.data;
 },};