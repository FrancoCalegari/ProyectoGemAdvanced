import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Pencil, Trash2, UserCog, HardHat, Eye, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';
import { empleadosService, CARGOS } from '../services/empleados.service';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { DatePicker } from '../components/ui/DatePicker';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../components/ui/Table';

const selectClass = 'w-full h-10 px-3 rounded-lg bg-background border border-border text-foreground text-sm focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/30 transition-all';

const FORM_VACIO = {
 dni: '',
 nombre: '',
 apellido: '',
 email: '',
 telefono: '',
 fechaNacimiento: '',
 genero: '',
 cargo: 'CELADOR',
 sector: '',
 fechaIngreso: '',
 observaciones: '',
};

const CARGO_LABEL = { CELADOR: 'Celador', BEDEL: 'Bedel', OTRO: 'Otro' };

export default function Empleados() {
 const navigate = useNavigate();
 const [empleados, setEmpleados] = useState([]);
 const [cargando, setCargando] = useState(true);
 const [busqueda, setBusqueda] = useState('');
 const [filtroCargo, setFiltroCargo] = useState('');
 const [filtroEstado, setFiltroEstado] = useState('');
 const [modal, setModal] = useState(false);
 const [editando, setEditando] = useState(null);
 const [form, setForm] = useState(FORM_VACIO);
 const [guardando, setGuardando] = useState(false);
 const [modalBaja, setModalBaja] = useState(null);

 const cargar = async () => {
 try {
 setCargando(true);
 const data = await empleadosService.listar({ busqueda, cargo: filtroCargo, estado: filtroEstado });
 setEmpleados(Array.isArray(data) ? data : []);
 } catch (error) {
 toast.error(error.response?.data?.message || 'No se pudo cargar el personal');
 } finally {
 setCargando(false);
 }
 };

 useEffect(() => { cargar(); }, [busqueda, filtroCargo, filtroEstado]);

 const abrirNuevo = () => {
 setEditando(null);
 setForm(FORM_VACIO);
 setModal(true);
 };

 const abrirEditar = (e) => {
 setEditando(e);
 setForm({
 dni: e.dni || '',
 nombre: e.nombre || '',
 apellido: e.apellido || '',
 email: e.email || '',
 telefono: e.telefono || '',
 fechaNacimiento: e.fechaNacimiento ? String(e.fechaNacimiento).slice(0, 10) : '',
 genero: e.genero || '',
 cargo: e.cargo || 'CELADOR',
 sector: e.sector || '',
 fechaIngreso: e.fechaIngreso ? String(e.fechaIngreso).slice(0, 10) : '',
 observaciones: e.observaciones || '',
 });
 setModal(true);
 };

 const guardar = async (e) => {
 e.preventDefault();
 setGuardando(true);
 try {
 if (editando) {
 await empleadosService.actualizar(editando.id, form);
 toast.success('Ficha actualizada');
 } else {
 await empleadosService.crear(form);
 toast.success('Personal no docente creado');
 }
 setModal(false);
 await cargar();
 } catch (error) {
 toast.error(error.response?.data?.message || 'No se pudo guardar');
 } finally {
 setGuardando(false);
 }
 };

 const confirmarBaja = async () => {
 try {
 await empleadosService.darDeBaja(modalBaja.id);
 toast.success('Empleado dado de baja');
 setModalBaja(null);
 await cargar();
 } catch (error) {
 toast.error(error.response?.data?.message || 'No se pudo dar de baja');
 }
 };

 const reactivar = async (e) => {
 try {
 await empleadosService.reactivar(e.id);
 toast.success('Empleado reactivado');
 await cargar();
 } catch (error) {
 toast.error(error.response?.data?.message || 'No se pudo reactivar');
 }
 };

 return (
 <div className="space-y-6">
 <div className="flex flex-wrap items-start justify-between gap-3">
 <div>
 <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Personal no docente</h1>
 <p className="text-sm text-muted-foreground font-medium mt-1">
 Bedeles, celadores y demás empleados: ficha, horarios de trabajo y justificativos.
 </p>
 </div>
 <Button onClick={abrirNuevo}>
 <Plus className="w-4 h-4 mr-2" /> Nuevo empleado
 </Button>
 </div>

 <Card>
 <div className="p-4 sm:p-5 border-b border-border flex flex-wrap gap-3 items-center">
 <div className="relative flex-1 min-w-[200px]">
 <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
 <input
 value={busqueda}
 onChange={(e) => setBusqueda(e.target.value)}
 placeholder="Buscar por nombre, apellido, DNI, email o sector"
 className="w-full h-10 pl-10 pr-3 rounded-lg bg-background border border-border text-foreground text-sm focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/30"
 />
 </div>
 <select className={`${selectClass} max-w-[180px]`} value={filtroCargo} onChange={(e) => setFiltroCargo(e.target.value)}>
 <option value="">Todos los cargos</option>
 {CARGOS.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
 </select>
 <select className={`${selectClass} max-w-[160px]`} value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)}>
 <option value="">Todos los estados</option>
 <option value="ACTIVO">En funciones</option>
 <option value="INACTIVO">Dados de baja</option>
 </select>
 </div>

 {cargando ? (
 <div className="p-8 text-center text-sm text-muted-foreground">Cargando...</div>
 ) : empleados.length === 0 ? (
 <div className="p-8 text-center">
 <HardHat className="w-8 h-8 mx-auto mb-3 text-muted-foreground/60" />
 <p className="text-sm text-muted-foreground">No hay personal no docente cargado todavía.</p>
 </div>
 ) : (
 <Table>
 <TableHeader>
 <TableRow>
 <TableHead>Apellido y nombre</TableHead>
 <TableHead>DNI</TableHead>
 <TableHead>Cargo</TableHead>
 <TableHead>Sector</TableHead>
 <TableHead>Acceso al sistema</TableHead>
 <TableHead>Estado</TableHead>
 <TableHead className="text-right">Acciones</TableHead>
 </TableRow>
 </TableHeader>
 <TableBody>
 {empleados.map((e) => (
 <TableRow key={e.id}>
 <TableCell className="font-medium text-foreground">{e.apellido}, {e.nombre}</TableCell>
 <TableCell className="text-muted-foreground">{e.dni}</TableCell>
 <TableCell>
 <Badge variant="outline">{CARGO_LABEL[e.cargo] || e.cargo}</Badge>
 </TableCell>
 <TableCell className="text-muted-foreground">{e.sector || '—'}</TableCell>
 <TableCell className="text-xs">
 {e.usuario ? (
 <span className="text-muted-foreground">{e.usuario.email} · {e.usuario.rol}{e.usuario.activo ? '' : ' (inactivo)'}</span>
 ) : (
 <span className="text-amber-600 font-medium">Sin cuenta</span>
 )}
 </TableCell>
 <TableCell>
 <Badge variant={e.estado === 'ACTIVO' ? 'success' : 'muted'}>
 {e.estado === 'ACTIVO' ? 'En funciones' : 'Baja'}
 </Badge>
 </TableCell>
 <TableCell className="text-right">
 <div className="inline-flex gap-1">
 <Button variant="ghost" size="icon" onClick={() => navigate(`/empleados/${e.id}`)} title="Ver detalle">
 <Eye className="w-4 h-4" />
 </Button>
 <Button variant="ghost" size="icon" onClick={() => abrirEditar(e)} title="Editar">
 <Pencil className="w-4 h-4" />
 </Button>
 {e.estado === 'ACTIVO' ? (
 <Button variant="ghost" size="icon" onClick={() => setModalBaja(e)} title="Dar de baja">
 <Trash2 className="w-4 h-4 text-destructive" />
 </Button>
 ) : (
 <Button variant="ghost" size="icon" onClick={() => reactivar(e)} title="Reactivar">
 <RotateCcw className="w-4 h-4" />
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

 {/* Alta / edición */}
 <Modal open={modal} onClose={() => setModal(false)} title={editando ? 'Editar empleado' : 'Nuevo empleado'} size="lg">
 <form onSubmit={guardar} className="space-y-4">
 <div className="grid sm:grid-cols-2 gap-3">
 <Input label="DNI" value={form.dni} onChange={(e) => setForm({ ...form, dni: e.target.value })} required />
 <Input label="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
 <Input label="Nombre" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} required />
 <Input label="Apellido" value={form.apellido} onChange={(e) => setForm({ ...form, apellido: e.target.value })} required />
 <Input label="Teléfono" value={form.telefono} onChange={(e) => setForm({ ...form, telefono: e.target.value })} />
 <div>
 <label className="block text-sm font-medium text-foreground/90 mb-1.5">Cargo</label>
 <select className={selectClass} value={form.cargo} onChange={(e) => setForm({ ...form, cargo: e.target.value })}>
 {CARGOS.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
 </select>
 </div>
 <Input label="Sector / puesto" value={form.sector} onChange={(e) => setForm({ ...form, sector: e.target.value })} placeholder="Portería, patio, laboratorio..." />
 <div>
 <label className="block text-sm font-medium text-foreground/90 mb-1.5">Género</label>
 <select className={selectClass} value={form.genero} onChange={(e) => setForm({ ...form, genero: e.target.value })}>
 <option value="">Sin especificar</option>
 <option value="F">Femenino</option>
 <option value="M">Masculino</option>
 <option value="X">Otro</option>
 </select>
 </div>
 <DatePicker label="Fecha de nacimiento" value={form.fechaNacimiento} onChange={(v) => setForm({ ...form, fechaNacimiento: v })} />
 <DatePicker label="Fecha de ingreso" value={form.fechaIngreso} onChange={(v) => setForm({ ...form, fechaIngreso: v })} />
 </div>
 <div>
 <label className="block text-sm font-medium text-foreground/90 mb-1.5">Observaciones</label>
 <textarea
 rows={3}
 value={form.observaciones}
 onChange={(e) => setForm({ ...form, observaciones: e.target.value })}
 className="w-full px-3 py-2 rounded-lg bg-background border border-border text-foreground text-sm focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/30"
 />
 </div>
 <div className="flex justify-end gap-2 pt-4 border-t border-border">
 <Button type="button" variant="outline" onClick={() => setModal(false)}>Cancelar</Button>
 <Button type="submit" disabled={guardando}>{guardando ? 'Guardando...' : editando ? 'Guardar cambios' : 'Crear empleado'}</Button>
 </div>
 </form>
 </Modal>

 {/* Baja */}
 <Modal open={!!modalBaja} onClose={() => setModalBaja(null)} title="Dar de baja" size="sm">
 <p className="text-sm text-muted-foreground">
 ¿Confirmás dar de baja a {modalBaja?.apellido}, {modalBaja?.nombre}? La ficha y su historial se conservan.
 </p>
 <div className="flex justify-end gap-2 pt-4 mt-4 border-t border-border">
 <Button variant="outline" onClick={() => setModalBaja(null)}>Cancelar</Button>
 <Button variant="destructive" onClick={confirmarBaja}>Dar de baja</Button>
 </div>
 </Modal>
 </div>
 );
}
