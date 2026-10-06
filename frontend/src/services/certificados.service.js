import api, { descargarPDF } from './api';

export const certificadosService = {
 // Listar certificados de un alumno
 listarPorAlumno: async (alumnoId) => {
 const response = await api.get(`/alumnos/${alumnoId}/certificados`);
 return response.data;
 },

 // Obtener un certificado por ID
 obtenerPorId: async (id) => {
 const response = await api.get(`/certificados/${id}`);
 return response.data;
 },

 // Solicitar un nuevo certificado
 // tipo: PARCIAL_ANIO | TITULO_COMPLETO | CONCURRENCIA | PARA_COLECTIVO | LABORAL
 solicitar: async (alumnoId, data) => {
 const response = await api.post(`/alumnos/${alumnoId}/certificados`, data);
 return response.data;
 },

 // Anular un certificado
 anular: async (id) => {
 const response = await api.put(`/certificados/${id}/anular`);
 return response.data;
 },

 // Descargar PDF del certificado
 descargarPDF: async (id, nombreArchivo) => {
 return descargarPDF(
 `/certificados/${id}/pdf`,
 nombreArchivo || `certificado-${id.slice(0, 8)}.pdf`
 );
 },
};