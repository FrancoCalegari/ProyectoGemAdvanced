import { useState, useEffect } from 'react';
import { User, MapPin, Lock, Save, Shield, Mail, Phone } from 'lucide-react';
import { toast } from 'sonner';
import { authService } from '../services/auth.service';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
const ROL_LABEL = {
 ADMIN: 'Administrador',
 SECRETARIA: 'Secretaria',
 ALUMNO: 'Alumno',
 PROFESOR: 'Profesor',
};
const ROL_BADGE = {
 ADMIN: 'destructive',
 SECRETARIA: 'secondary',
 ALUMNO: 'default',
 PROFESOR: 'default',
};
export default function MiPerfil() {
 const { usuario: usuarioAuth } = useAuth();
 const [usuario, setUsuario] = useState(null);
 const [cargando, setCargando] = useState(true);
 const [tab, setTab] = useState('datos');
 const [guardando, setGuardando] = useState(false);
 // Form datos personales
 const [formDatos, setFormDatos] = useState({
 nombre: '', apellido: '', email: '',
 });
 // Form contacto + domicilio
 const [formContacto, setFormContacto] = useState({
 teléfono: '',
 domicilioCalle: '', domicilioNúmero: '',
 domicilioCiudad: '', domicilioProvincia: '', domicilioCP: '',
 });
 // Form password
 const [formPass, setFormPass] = useState({
 passwordActual: '', passwordNueva: '', confirmar: '',
 });
 useEffect(() => { cargar(); }, []);
 const cargar = async () => {
 try {
 setCargando(true);
 const data = await authService.me();
 setUsuario(data);
 setFormDatos({
 nombre: data.nombre || '',
 apellido: data.apellido || '',
 email: data.email || '',
 });
 const fuenteContacto = data.alumno || data.profesor || {};
 setFormContacto({
 teléfono: fuenteContacto.teléfono || '',
 domicilioCalle: fuenteContacto.domicilioCalle || '',
 domicilioNúmero: fuenteContacto.domicilioNúmero || '',
 domicilioCiudad: fuenteContacto.domicilioCiudad || '',
 domicilioProvincia: fuenteContacto.domicilioProvincia || '',
 domicilioCP: fuenteContacto.domicilioCP || '',
 });
 } catch (error) {
 toast.error('Error al cargar el perfil');
 } finally {
 setCargando(false);
 }
 };
 const handleGuardarDatos = async (e) => {
 e.preventDefault();
 setGuardando(true);
 try {
 await authService.actualizarPerfil(formDatos);
 toast.success('Datos actualizados');
 // Actualizamos el localStorage para que el sidebar refleje el cambio
 const usuarioGuardado = JSON.parse(localStorage.getItem('usuario') || '{}');
 localStorage.setItem('usuario', JSON.stringify({ ...usuarioGuardado, ...formDatos }));
 cargar();
 } catch (error) {
 toast.error(error.response?.data?.message || 'Error al guardar');
 } finally {
 setGuardando(false);
 }
 };
 const handleGuardarContacto = async (e) => {
 e.preventDefault();
 setGuardando(true);
 try {
 await authService.actualizarPerfil(formContacto);
 toast.success('Datos de contacto actualizados');
 cargar();
 } catch (error) {
 toast.error(error.response?.data?.message || 'Error al guardar');
 } finally {
 setGuardando(false);
 }
 };
 const handleCambiarPassword = async (e) => {
 e.preventDefault();
 if (formPass.passwordNueva !== formPass.confirmar) {
 toast.error('Las contrasenas no coinciden');
 return;
 }
 if (formPass.passwordNueva.length < 6) {
 toast.error('La contrasena debe tener al menos 6 caracteres');
 return;
 }
 setGuardando(true);
 try {
 await authService.cambiarPassword(formPass.passwordActual, formPass.passwordNueva);
 toast.success('Contrasena actualizada');
 setFormPass({ passwordActual: '', passwordNueva: '', confirmar: '' });
 } catch (error) {
 toast.error(error.response?.data?.message || 'Error al cambiar contrasena');
 } finally {
 setGuardando(false);
 }
 };
 if (cargando) return <div className="p-8 text-center text-muted-foreground font-medium">Cargando...</div>;
 if (!usuario) return null;
 const tieneContacto = usuario.alumno || usuario.profesor;
 return (
 <div className="space-y-6">
 <div>
 <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Mi Perfil</h1>
 <p className="text-sm sm:text-base text-muted-foreground font-medium mt-1">
 Gestiona tus datos personales, de contacto y seguridad
 </p>
 </div>
 {/* Header con tarjeta de identidad */}
 <Card className="p-6">
 <div className="flex items-center gap-4">
 <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
 <User className="w-8 h-8 text-primary" />
 </div>
 <div className="min-w-0 flex-1">
 <h2 className="text-xl font-bold">{usuario.apellido}, {usuario.nombre}</h2>
 <p className="text-sm text-muted-foreground truncate">{usuario.email}</p>
 <div className="mt-2 flex gap-2 flex-wrap">
 <Badge variant={ROL_BADGE[usuario.rol] || 'default'}>
 {ROL_LABEL[usuario.rol] || usuario.rol}
 </Badge>
 {usuario.alumno && (
 <Badge variant="outline">DNI {usuario.alumno.dni}</Badge>
 )}
 {usuario.profesor && (
 <>
 <Badge variant="outline">DNI {usuario.profesor.dni}</Badge>
 <Badge variant={usuario.profesor.estado === 'ACTIVO' ? 'default' : 'secondary'}>
 {usuario.profesor.estado}
 </Badge>
 </>
 )}
 </div>
 </div>
 </div>
 </Card>
 {/* Tabs */}
 <div className="flex gap-2 border-b border-border">
 {[
 { id: 'datos', label: 'Datos personales', icon: User },
 { id: 'contacto', label: 'Contacto', icon: MapPin, disabled: !tieneContacto },
 { id: 'password', label: 'Seguridad', icon: Lock },
 ].map((t) => {
 const Icon = t.icon;
 return (
 <button
 key={t.id}
 onClick={() => !t.disabled && setTab(t.id)}
 disabled={t.disabled}
 className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
 t.disabled ? 'opacity-40 cursor-not-allowed' :
 tab === t.id ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
 }`}
 >
 <Icon className="w-4 h-4" /> {t.label}
 </button>
 );
 })}
 </div>
 {/* TAB: Datos personales */}
 {tab === 'datos' && (
 <Card className="p-6">
 <form onSubmit={handleGuardarDatos} className="space-y-4 max-w-2xl">
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
 <div>
 <label className="block text-sm font-medium mb-1">Nombre</label>
 <Input value={formDatos.nombre} onChange={(e) => setFormDatos({ ...formDatos, nombre: e.target.value })} required />
 </div>
 <div>
 <label className="block text-sm font-medium mb-1">Apellido</label>
 <Input value={formDatos.apellido} onChange={(e) => setFormDatos({ ...formDatos, apellido: e.target.value })} required />
 </div>
 </div>
 <div>
 <label className="block text-sm font-medium mb-1">Email</label>
 <Input type="email" value={formDatos.email} onChange={(e) => setFormDatos({ ...formDatos, email: e.target.value })} required />
 </div>
 <div className="flex justify-end pt-2 border-t border-border">
 <Button type="submit" disabled={guardando}>
 <Save className="w-4 h-4 mr-2" /> {guardando ? 'Guardando...' : 'Guardar cambios'}
 </Button>
 </div>
 </form>
 </Card>
 )}
 {/* TAB: Contacto */}
 {tab === 'contacto' && tieneContacto && (
 <Card className="p-6">
 <form onSubmit={handleGuardarContacto} className="space-y-4 max-w-2xl">
 {usuario.profesor && (
 <div>
 <label className="block text-sm font-medium mb-1">Teléfono</label>
 <Input value={formContacto.teléfono} onChange={(e) => setFormContacto({ ...formContacto, teléfono: e.target.value })} placeholder="+54 9 ..." />
 </div>
 )}
 <div>
 <h3 className="font-semibold mb-3 flex items-center gap-2"><MapPin className="w-4 h-4" /> Domicilio</h3>
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
 <div>
 <label className="block text-sm font-medium mb-1">Calle</label>
 <Input value={formContacto.domicilioCalle} onChange={(e) => setFormContacto({ ...formContacto, domicilioCalle: e.target.value })} />
 </div>
 <div>
 <label className="block text-sm font-medium mb-1">Número</label>
 <Input value={formContacto.domicilioNúmero} onChange={(e) => setFormContacto({ ...formContacto, domicilioNúmero: e.target.value })} />
 </div>
 <div>
 <label className="block text-sm font-medium mb-1">Ciudad</label>
 <Input value={formContacto.domicilioCiudad} onChange={(e) => setFormContacto({ ...formContacto, domicilioCiudad: e.target.value })} />
 </div>
 <div>
 <label className="block text-sm font-medium mb-1">Provincia</label>
 <Input value={formContacto.domicilioProvincia} onChange={(e) => setFormContacto({ ...formContacto, domicilioProvincia: e.target.value })} />
 </div>
 <div>
 <label className="block text-sm font-medium mb-1">Código postal</label>
 <Input value={formContacto.domicilioCP} onChange={(e) => setFormContacto({ ...formContacto, domicilioCP: e.target.value })} />
 </div>
 </div>
 </div>
 <div className="flex justify-end pt-2 border-t border-border">
 <Button type="submit" disabled={guardando}>
 <Save className="w-4 h-4 mr-2" /> {guardando ? 'Guardando...' : 'Guardar cambios'}
 </Button>
 </div>
 </form>
 </Card>
 )}
 {/* TAB: Seguridad */}
 {tab === 'password' && (
 <Card className="p-6">
 <form onSubmit={handleCambiarPassword} className="space-y-4 max-w-md">
 <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-md mb-2">
 <Shield className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
 <p className="text-xs text-muted-foreground font-medium">
 Para cambiar tu contrasena necesitas ingresar la actual como medida de seguridad.
 </p>
 </div>
 <div>
 <label className="block text-sm font-medium mb-1">Contrasena actual</label>
 <Input type="password" value={formPass.passwordActual} onChange={(e) => setFormPass({ ...formPass, passwordActual: e.target.value })} required />
 </div>
 <div>
 <label className="block text-sm font-medium mb-1">Nueva contrasena</label>
 <Input type="password" value={formPass.passwordNueva} onChange={(e) => setFormPass({ ...formPass, passwordNueva: e.target.value })} required minLength={6} />
 </div>
 <div>
 <label className="block text-sm font-medium mb-1">Confirmar nueva contrasena</label>
 <Input type="password" value={formPass.confirmar} onChange={(e) => setFormPass({ ...formPass, confirmar: e.target.value })} required minLength={6} />
 </div>
 <div className="flex justify-end pt-2 border-t border-border">
 <Button type="submit" disabled={guardando}>
 <Lock className="w-4 h-4 mr-2" /> {guardando ? 'Cambiando...' : 'Cambiar contrasena'}
 </Button>
 </div>
 </form>
 </Card>
 )}
 </div>
 );
}