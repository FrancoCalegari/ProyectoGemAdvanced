import axios from 'axios';

const api = axios.create({
 baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
 headers: {
 'Content-Type': 'application/json; charset=utf-8',
 'Accept': 'application/json; charset=utf-8',
 },
});

// Interceptor de request: agrega el token JWT si existe
api.interceptors.request.use(
 (config) => {
 const token = localStorage.getItem('token');
 if (token) {
 config.headers.Authorization = `Bearer ${token}`;
 }
 return config;
 },
 (error) => Promise.reject(error)
);

// Interceptor de response: maneja errores comunes
api.interceptors.response.use(
 (response) => response,
 (error) => {
 if (error.response?.status === 401) {
 localStorage.removeItem('token');
 localStorage.removeItem('usuario');
 if (window.location.pathname !== '/login') {
 window.location.href = '/login';
 }
 }
 return Promise.reject(error);
 }
);

// Helper: descargar PDF como blob
export async function descargarPDF(url, nombreArchivo = 'documento.pdf') {
 const response = await api.get(url, { responseType: 'blob' });
 const blob = new Blob([response.data], { type: 'application/pdf' });
 const urlBlob = window.URL.createObjectURL(blob);
 const a = document.createElement('a');
 a.href = urlBlob;
 a.download = nombreArchivo;
 document.body.appendChild(a);
 a.click();
 document.body.removeChild(a);
 window.URL.revokeObjectURL(urlBlob);
}

export default api;