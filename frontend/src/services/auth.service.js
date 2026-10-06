import api from './api';
export const authService = {
 // Datos del usuario autenticado
 me: async () => {
 const response = await api.get('/auth/me');
 return response.data;
 },
 // Actualizar mi propio perfil
 actualizarPerfil: async (data) => {
 const response = await api.patch('/auth/me', data);
 return response.data;
 },
 // Cambiar mi propia contrasena
 cambiarPassword: async (passwordActual, passwordNueva) => {
 const response = await api.patch('/auth/me/password', { passwordActual, passwordNueva });
 return response.data;
 },
};