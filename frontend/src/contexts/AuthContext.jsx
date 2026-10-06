import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
 const [usuario, setUsuario] = useState(null);
 const [token, setToken] = useState(null);
 const [loading, setLoading] = useState(true);

 useEffect(() => {
 const tokenGuardado = localStorage.getItem('token');
 const usuarioGuardado = localStorage.getItem('usuario');

 if (tokenGuardado && usuarioGuardado) {
 setToken(tokenGuardado);
 setUsuario(JSON.parse(usuarioGuardado));
 }
 setLoading(false);
 }, []);

 const login = async (email, password) => {
 const response = await api.post('/auth/login', { email, password });
 const { token: nuevoToken, usuario: nuevoUsuario } = response.data;

 localStorage.setItem('token', nuevoToken);
 localStorage.setItem('usuario', JSON.stringify(nuevoUsuario));

 setToken(nuevoToken);
 setUsuario(nuevoUsuario);

 return nuevoUsuario;
 };

 const logout = () => {
 localStorage.removeItem('token');
 localStorage.removeItem('usuario');
 setToken(null);
 setUsuario(null);
 // Redirigir al login (obligatorio para que no quede en blanco)
 window.location.href = '/login';
 };

 const value = {
 usuario,
 token,
 loading,
 login,
 logout,
 isAuthenticated: !!token,
 isAdmin: usuario?.rol === 'ADMIN',
 isSecretaria: usuario?.rol === 'SECRETARIA',
 isAlumno: usuario?.rol === 'ALUMNO',
 isProfesor: usuario?.rol === 'PROFESOR',
 isBedel: usuario?.rol === 'BEDEL',
 isCelador: usuario?.rol === 'CELADOR',
 // Personal no docente (bedeles, celadores): consulta y tareas operativas
 isNoDocente: usuario?.rol === 'BEDEL' || usuario?.rol === 'CELADOR',
 // Gestión académica (puede crear / modificar)
 isGestion: usuario?.rol === 'ADMIN' || usuario?.rol === 'SECRETARIA',
 profesorId: usuario?.profesorId || null,
 alumnoId: usuario?.alumnoId || null,
 empleadoId: usuario?.empleadoId || null,
 };

 return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
 const context = useContext(AuthContext);
 if (!context) {
 throw new Error('useAuth debe usarse dentro de AuthProvider');
 }
 return context;
}