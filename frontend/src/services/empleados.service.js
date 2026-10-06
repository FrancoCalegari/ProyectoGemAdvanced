import api from './api';

function qs(filtros = {}) {
 const params = new URLSearchParams();
 Object.entries(filtros).forEach(([k, v]) => {
 if (v !== undefined && v !== null && v !== '') params.append(k, v);
 });
 const s = params.toString();
 return s ? `?${s}` : '';
}

export const empleadosService = {
 // ---------------------------------------------------------
 // Panel personal del empleado no docente (celador / bedel)
 // ---------------------------------------------------------
 miFicha: async () => (await api.get('/empleados/me')).data,

 misHorarios: async () => (await api.get('/empleados/me/horarios')).data,

 misModificaciones: async () => (await api.get('/empleados/me/modificaciones')).data,

 marcarModificacionesVistas: async (ids = null) =>
 (await api.patch('/empleados/me/modificaciones/visto', { ids })).data,

 miHistorial: async () => (await api.get('/empleados/me/historial')).data,

 // ---------------------------------------------------------
 // ABM (gestión académica)
 // ---------------------------------------------------------
 listar: async (filtros) => (await api.get(`/empleados${qs(filtros)}`)).data,

 obtenerPorId: async (id) => (await api.get(`/empleados/${id}`)).data,

 crear: async (data) => (await api.post('/empleados', data)).data,

 actualizar: async (id, data) => (await api.put(`/empleados/${id}`, data)).data,

 cambiarEstado: async (id, estado) => (await api.patch(`/empleados/${id}/estado`, { estado })).data,

 darDeBaja: async (id) => (await api.patch(`/empleados/${id}/baja`, {})).data,

 reactivar: async (id) => (await api.patch(`/empleados/${id}/reactivar`, {})).data,

 // ---------------------------------------------------------
 // Horarios de trabajo y sus modificaciones
 // ---------------------------------------------------------
 listarHorarios: async (empleadoId) => (await api.get(`/empleados/${empleadoId}/horarios`)).data,

 crearHorario: async (empleadoId, data) => (await api.post(`/empleados/${empleadoId}/horarios`, data)).data,

 actualizarHorario: async (id, data) => (await api.put(`/horarios/${id}`, data)).data,

 eliminarHorario: async (id, motivo = null) =>
 (await api.delete(`/horarios/${id}`, { data: { motivo } })).data,

 listarModificaciones: async (empleadoId) =>
 (await api.get(`/empleados/${empleadoId}/modificaciones`)).data,
};

export const CARGOS = [
 { value: 'CELADOR', label: 'Celador' },
 { value: 'BEDEL', label: 'Bedel' },
 { value: 'OTRO', label: 'Otro (personal no docente)' },
];

export const DIAS_SEMANA = [
 { value: 1, label: 'Lunes' },
 { value: 2, label: 'Martes' },
 { value: 3, label: 'Miércoles' },
 { value: 4, label: 'Jueves' },
 { value: 5, label: 'Viernes' },
 { value: 6, label: 'Sábado' },
 { value: 7, label: 'Domingo' },
];

export function nombreDia(n) {
 return DIAS_SEMANA.find((d) => Number(d.value) === Number(n))?.label || `Día ${n}`;
}
