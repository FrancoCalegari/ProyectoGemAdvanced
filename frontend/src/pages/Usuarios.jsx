import { useState, useEffect } from 'react';
import { Plus, Search, Pencil, Trash2, RotateCcw, Shield, UserCog, Key } from 'lucide-react';
import { toast } from 'sonner';
import { usuariosService } from '../services/usuarios.service';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../components/ui/Table';

const ROLES = [
 { value: 'ADMIN', label: 'Administrador' },
 { value: 'SECRETARIA', label: 'Secretaria' },
 { value: 'PROFESOR', label: 'Profesor' },
];

const ROL_BADGE = {
 ADMIN: 'destructive',
 SECRETARIA: 'secondary',
 PROFESOR: 'default',
 ALUMNO: 'default',
};

const MENSAJE_BAJA = 'No es posible eliminar los datos de un usuario. Los registros se conservan por normativa instituciónal.\n\nDeseas dar de baja al usuario? La baja conserva todo su historial academico y podras reactivarlo en cualquier momento.';

export default function Usuarios() {
 const { usuario, isAdmin } = useAuth();
 const [usuarios, setUsuarios] = useState([]);
 const [cargando, setCargando] = useState(true);
 const [busqueda, setBusqueda] = useState('');
 const [filtroRol, setFiltroRol] = useState('');
 const [filtroActivo, setFiltroActivo] = useState('');
 const [modalCrear, setModalCrear] = useState(false);
 const [modalEditar, setModalEditar] = useState(null);
 const [modalBaja, setModalBaja] = useState(null);
 const [modalPassword, setModalPassword] = useState(null);

 useEffect(() => { cargar(); }, [busqueda, filtroRol, filtroActivo]);

 const cargar = async () => {
 try {
 setCargando(true);
 const data = await usuariosService.listar({ busqueda, rol: filtroRol, activo: filtroActivo });
 setUsuarios(data);
 } catch (error) {
 toast.error('Error al cargar usuarios');
 } finally {
 setCargando(false);
 }
 };

 const handleBaja = async () => {
 if (!modalBaja) return;
 try {
 await usuariosService.darDeBaja(modalBaja.id);
 toast.success('Usuario dado de baja');
 setModalBaja(null);
 cargar();
 } catch (error) {
 toast.error(error.response?.data?.message || 'Error al dar de baja');
 }
 };

 const handleReactivar = async (id) => {
 if (!confirm('Reactivar este usuario?')) return;
 try {
 await usuariosService.reactivar(id);
 toast.success('Usuario reactivado');
 cargar();
 } catch (error) {
 toast.error(error.response?.data?.message || 'Error al reactivar');
 }
 };

 if (!isAdmin) {
 return (
 <div className="space-y-6">
 <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Usuarios</h1>
 <Card>
 <div className="p-12 text-center">
 <Shield className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
 <h2 className="text-lg font-bold text-foreground mb-2">Acceso restringido</h2>
 <p className="text-muted-foreground text-sm max-w-md mx-auto">
 Solo los administradores pueden gestionar usuarios del sistema.
 </p>
 </div>
 </Card>
 </div>
 );
 }

 return (
 <div className="space-y-6">
 <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
 <div>
 <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Usuarios</h1>
 <p className="text-sm sm:text-base text-muted-foreground font-medium mt-1">
 Administra los usuarios del sistema y sus roles
 </p>
 </div>
 <Button onClick={() => setModalCrear(true)} className="w-full sm:w-auto">
 <Plus className="w-4 h-4 mr-2" />
 Nuevo Usuario
 </Button>
 </div>

 <Card>
 <div className="p-4 border-b border-border flex flex-col sm:flex-row gap-3">
 <div className="relative flex-1">
 <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
 <Input
 placeholder="Buscar por nombre, apellido o email..."
 value={busqueda}
 onChange={(e) => setBusqueda(e.target.value)}
 className="pl-10"
 />
 </div>
 <select
 value={filtroRol}
 onChange={(e) => setFiltroRol(e.target.value)}
 className="h-10 px-3 rounded-md border border-border bg-background text-sm"
 >
 <option value="">Todos los roles</option>
 {ROLES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
 </select>
 <select
 value={filtroActivo}
 onChange={(e) => setFiltroActivo(e.target.value)}
 className="h-10 px-3 rounded-md border border-border bg-background text-sm"
 >
 <option value="">Todos</option>
 <option value="true">Solo activos</option>
 <option value="false">Solo dados de baja</option>
 </select>
 </div>

 {cargando ? (
 <div className="p-8 text-center text-muted-foreground font-medium">Cargando...</div>
 ) : usuarios.length === 0 ? (
 <div className="p-8 text-center text-muted-foreground font-medium">No hay usuarios</div>
 ) : (
 <Table>
 <TableHeader>
 <TableRow>
 <TableHead>Nombre</TableHead>
 <TableHead>Email</TableHead>
 <TableHead>Rol</TableHead>
 <TableHead>Vinculado a</TableHead>
 <TableHead>Estado</TableHead>
 <TableHead className="text-right">Acciones</TableHead>
 </TableRow>
 </TableHeader>
 <TableBody>
 {usuarios.map((u) => (
 <TableRow key={u.id}>
 <TableCell className="font-medium">{u.apellido}, {u.nombre}</TableCell>
 <TableCell className="text-sm">{u.email}</TableCell>
 <TableCell>
 <Badge variant={ROL_BADGE[u.rol] || 'default'}>
 {ROLES.find((r) => r.value === u.rol)?.label || u.rol}
 </Badge>
 </TableCell>
 <TableCell className="text-xs text-muted-foreground font-medium">
 {u.alumno && `Alumno: ${u.alumno.apellido}, ${u.alumno.nombre}`}
 {u.profesor && `Profesor: ${u.profesor.apellido}, ${u.profesor.nombre}`}
 {!u.alumno && !u.profesor && '—'}
 </TableCell>
 <TableCell>
 {u.activo ? (
 <Badge variant="default">Activo</Badge>
 ) : (
 <Badge variant="destructive">Dado de baja</Badge>
 )}
 </TableCell>
 <TableCell className="text-right">
 <div className="flex justify-end gap-1">
 <Button variant="ghost" size="sm" onClick={() => setModalEditar(u)} title="Editar">
 <Pencil className="w-4 h-4" />
 </Button>
 <Button variant="ghost" size="sm" onClick={() => setModalPassword(u)} title="Cambiar contrasena">
 <Key className="w-4 h-4" />
 </Button>
 {u.activo ? (
 <Button variant="ghost" size="sm" onClick={() => setModalBaja(u)} title="Dar de baja">
 <Trash2 className="w-4 h-4 text-destructive" />
 </Button>
 ) : (
 <Button variant="ghost" size="sm" onClick={() => handleReactivar(u.id)} title="Reactivar">
 <RotateCcw className="w-4 h-4 text-primary" />
 </Button>
 )}
 </div>
 </TableCell>
 </TableRow>
 ))}
 </TableBody>
 </Table>
 )}
 </Card>

 <ModalCrearUsuario
 open={modalCrear}
 onClose={() => setModalCrear(false)}
 onCreado={() => { setModalCrear(false); cargar(); }}
 />

 <ModalEditarUsuario
 usuario={modalEditar}
 onClose={() => setModalEditar(null)}
 onGuardado={() => { setModalEditar(null); cargar(); }}
 />

 <ModalPasswordUsuario
 usuario={modalPassword}
 onClose={() => setModalPassword(null)}
 />

 <Modal
 open={!!modalBaja}
 onClose={() => setModalBaja(null)}
 title="Dar de baja usuario"
 >
 <div className="space-y-4">
 <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-md">
 <p className="text-sm whitespace-pre-line text-foreground">
 {MENSAJE_BAJA}
 </p>
 </div>
 <p className="text-sm">
 <strong>Usuario:</strong> {modalBaja?.apellido}, {modalBaja?.nombre} ({modalBaja?.email})
 </p>
 <div className="flex justify-end gap-2 pt-2 border-t border-border">
 <Button variant="outline" onClick={() => setModalBaja(null)}>Cancelar</Button>
 <Button variant="destructive" onClick={handleBaja}>Dar de Baja</Button>
 </div>
 </div>
 </Modal>
 </div>
 );
}

// ============================================================
// MODAL CREAR
// ============================================================
function ModalCrearUsuario({ open, onClose, onCreado }) {
 const [form, setForm] = useState({
 email: '', password: '', nombre: '', apellido: '',
 rol: 'SECRETARIA', profesorId: '',
 });
 const [profesores, setProfesores] = useState([]);
 const [cargando, setCargando] = useState(false);
 const [cargandoProf, setCargandoProf] = useState(false);

 useEffect(() => {
 if (open) {
 setForm({ email: '', password: '', nombre: '', apellido: '', rol: 'SECRETARIA', profesorId: '' });
 }
 }, [open]);

 useEffect(() => {
 if (open && form.rol === 'PROFESOR') cargarProfesores();
 }, [open, form.rol]);

 const cargarProfesores = async () => {
 try {
 setCargandoProf(true);
 const data = await usuariosService.listarProfesoresSinUsuario();
 setProfesores(data);
 } catch {
 // silencioso
 } finally {
 setCargandoProf(false);
 }
 };

 const handleSubmit = async (e) => {
 e.preventDefault();
 setCargando(true);
 try {
 const payload = {
 email: form.email,
 password: form.password,
 nombre: form.nombre,
 apellido: form.apellido,
 rol: form.rol,
 };
 if (form.rol === 'PROFESOR') {
 if (!form.profesorId) {
 toast.error('Selecciona un profesor para vincular');
 setCargando(false);
 return;
 }
 payload.profesorId = form.profesorId;
 }

 await usuariosService.registrar(payload);
 toast.success('Usuario creado');
 onCreado();
 } catch (error) {
 toast.error(error.response?.data?.message || 'Error al crear usuario');
 } finally {
 setCargando(false);
 }
 };

 return (
 <Modal open={open} onClose={onClose} title="Nuevo Usuario" size="md">
 <form onSubmit={handleSubmit} className="space-y-4">
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
 <div>
 <label className="block text-sm font-medium mb-1">Nombre</label>
 <Input value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} required />
 </div>
 <div>
 <label className="block text-sm font-medium mb-1">Apellido</label>
 <Input value={form.apellido} onChange={(e) => setForm({ ...form, apellido: e.target.value })} required />
 </div>
 </div>

 <div>
 <label className="block text-sm font-medium mb-1">Email</label>
 <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
 </div>

 <div>
 <label className="block text-sm font-medium mb-1">Contrasena</label>
 <Input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Minimo 6 caracteres" required minLength={6} />
 </div>

 <div>
 <label className="block text-sm font-medium mb-1">Rol</label>
 <select
 value={form.rol}
 onChange={(e) => setForm({ ...form, rol: e.target.value, profesorId: '' })}
 className="w-full h-10 px-3 rounded-md border border-border bg-background text-foreground"
 >
 {ROLES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
 </select>
 </div>

 {form.rol === 'PROFESOR' && (
 <div>
 <label className="block text-sm font-medium mb-1">Profesor vinculado</label>
 {cargandoProf ? (
 <p className="text-xs text-muted-foreground font-medium">Cargando profesores...</p>
 ) : profesores.length === 0 ? (
 <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-md">
 <p className="text-xs text-foreground">
 No hay profesores sin usuario asignado. Crea primero un profesor en la seccion <strong>Profesores</strong>.
 </p>
 </div>
 ) : (
 <select
 value={form.profesorId}
 onChange={(e) => setForm({ ...form, profesorId: e.target.value })}
 className="w-full h-10 px-3 rounded-md border border-border bg-background text-foreground"
 required
 >
 <option value="">— Selecciona un profesor —</option>
 {profesores.map((p) => (
 <option key={p.id} value={p.id}>
 {p.apellido}, {p.nombre} — DNI {p.dni}
 </option>
 ))}
 </select>
 )}
 <p className="text-xs text-muted-foreground mt-1">
 Un profesor solo puede tener un usuario vinculado.
 </p>
 </div>
 )}

 <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 pt-4 border-t border-border">
 <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
 <Button type="submit" disabled={cargando}>
 {cargando ? 'Creando...' : 'Crear Usuario'}
 </Button>
 </div>
 </form>
 </Modal>
 );
}

// ============================================================
// MODAL EDITAR
// ============================================================
function ModalEditarUsuario({ usuario, onClose, onGuardado }) {
 const [form, setForm] = useState({ nombre: '', apellido: '', email: '', rol: 'SECRETARIA' });
 const [cargando, setCargando] = useState(false);

 useEffect(() => {
 if (usuario) {
 setForm({
 nombre: usuario.nombre || '',
 apellido: usuario.apellido || '',
 email: usuario.email || '',
 rol: usuario.rol || 'SECRETARIA',
 });
 }
 }, [usuario]);

 if (!usuario) return null;

 const handleSubmit = async (e) => {
 e.preventDefault();
 setCargando(true);
 try {
 await usuariosService.actualizar(usuario.id, form);
 toast.success('Usuario actualizado');
 onGuardado();
 } catch (error) {
 toast.error(error.response?.data?.message || 'Error al actualizar');
 } finally {
 setCargando(false);
 }
 };

 return (
 <Modal open={!!usuario} onClose={onClose} title={`Editar: ${usuario.apellido}, ${usuario.nombre}`} size="md">
 <form onSubmit={handleSubmit} className="space-y-4">
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
 <div>
 <label className="block text-sm font-medium mb-1">Nombre</label>
 <Input value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} required />
 </div>
 <div>
 <label className="block text-sm font-medium mb-1">Apellido</label>
 <Input value={form.apellido} onChange={(e) => setForm({ ...form, apellido: e.target.value })} required />
 </div>
 </div>
 <div>
 <label className="block text-sm font-medium mb-1">Email</label>
 <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
 </div>
 <div>
 <label className="block text-sm font-medium mb-1">Rol</label>
 <select
 value={form.rol}
 onChange={(e) => setForm({ ...form, rol: e.target.value })}
 className="w-full h-10 px-3 rounded-md border border-border bg-background"
 disabled={usuario.rol === 'ALUMNO' || usuario.rol === 'PROFESOR'}
 >
 {ROLES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
 </select>
 {(usuario.rol === 'ALUMNO' || usuario.rol === 'PROFESOR') && (
 <p className="text-xs text-muted-foreground mt-1">
 No se puede cambiar el rol de un usuario vinculado a un {usuario.rol.toLowerCase()}.
 </p>
 )}
 </div>
 <div className="flex justify-end gap-2 pt-4 border-t border-border">
 <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
 <Button type="submit" disabled={cargando}>
 {cargando ? 'Guardando...' : 'Guardar cambios'}
 </Button>
 </div>
 </form>
 </Modal>
 );
}

// ============================================================
// MODAL CAMBIAR PASSWORD
// ============================================================
function ModalPasswordUsuario({ usuario, onClose }) {
 const [newPassword, setNewPassword] = useState('');
 const [confirmar, setConfirmar] = useState('');
 const [cargando, setCargando] = useState(false);

 useEffect(() => {
 if (usuario) { setNewPassword(''); setConfirmar(''); }
 }, [usuario]);

 if (!usuario) return null;

 const handleSubmit = async (e) => {
 e.preventDefault();
 if (newPassword !== confirmar) {
 toast.error('Las contrasenas no coinciden');
 return;
 }
 if (newPassword.length < 6) {
 toast.error('Minimo 6 caracteres');
 return;
 }
 setCargando(true);
 try {
 await usuariosService.cambiarPassword(usuario.id, newPassword);
 toast.success('Contrasena actualizada');
 onClose();
 } catch (error) {
 toast.error(error.response?.data?.message || 'Error');
 } finally {
 setCargando(false);
 }
 };

 return (
 <Modal open={!!usuario} onClose={onClose} title={`Cambiar contrasena: ${usuario.apellido}, ${usuario.nombre}`} size="md">
 <form onSubmit={handleSubmit} className="space-y-4">
 <div>
 <label className="block text-sm font-medium mb-1">Nueva contrasena</label>
 <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required minLength={6} />
 </div>
 <div>
 <label className="block text-sm font-medium mb-1">Confirmar contrasena</label>
 <Input type="password" value={confirmar} onChange={(e) => setConfirmar(e.target.value)} required minLength={6} />
 </div>
 <div className="flex justify-end gap-2 pt-4 border-t border-border">
 <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
 <Button type="submit" disabled={cargando}>
 {cargando ? 'Guardando...' : 'Cambiar contrasena'}
 </Button>
 </div>
 </form>
 </Modal>
 );
}