import api from './api';
function buildQS(filtros = {}) {
 const params = new URLSearchParams();
 if (filtros.desde) params.append('desde', filtros.desde);
 if (filtros.hasta) params.append('hasta', filtros.hasta);
 const qs = params.toString();
 return qs ? `?${qs}` : '';
}
export const estadisticasService = {
 resumen: (filtros) => api.get(`/estadisticas/resumen${buildQS(filtros)}`).then((r) => r.data),
 alumnos: (filtros) => api.get(`/estadisticas/alumnos${buildQS(filtros)}`).then((r) => r.data),
 cursadas: (filtros) => api.get(`/estadisticas/cursadas${buildQS(filtros)}`).then((r) => r.data),
 asistencias: (filtros) => api.get(`/estadisticas/asistencias${buildQS(filtros)}`).then((r) => r.data),
 clasesSuspendidas: (filtros) => api.get(`/estadisticas/clases-suspendidas${buildQS(filtros)}`).then((r) => r.data),
 mesas: (filtros) => api.get(`/estadisticas/mesas${buildQS(filtros)}`).then((r) => r.data),
 certificados: (filtros) => api.get(`/estadisticas/certificados${buildQS(filtros)}`).then((r) => r.data),
};