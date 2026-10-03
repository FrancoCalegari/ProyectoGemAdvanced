import api from './api';

export const dashboardService = {
 resumen: () => api.get('/dashboard/resumen').then((r) => r.data),
 actividad: () => api.get('/dashboard/actividad').then((r) => r.data),
 alumnosPorMes: () => api.get('/dashboard/alumnos-por-mes').then((r) => r.data),
};