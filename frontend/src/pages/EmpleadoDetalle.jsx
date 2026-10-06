import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
 ArrowLeft, Plus, Pencil, Trash2, Clock, MapPin, BellRing, History,
 UserCog, KeyRound, CheckCircle2, XCircle, FileHeart, Save, HardHat
} from 'lucide-react';
import { toast } from 'sonner';
import api from '../services/api';
import { empleadosService, CARGOS, DIAS_SEMANA, nombreDia } from '../services/empleados.service';
import { licenciasService } from '../services/licencias.service';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { DatePicker } from '../components/ui/DatePicker';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../components/ui/Table';

const selectClass = 'w-full h-10 px-3 rounded-lg bg-background border border-border text-foreground text-sm focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/30 transition-all';

const CARGO_LABEL = { CELADOR: 'Celador', BEDEL: 'Bedel', OTRO: 'Otro' };
const TIPOS_JUSTIFICATIVO = [
 { value: 'CERTIFICADO_SALUD', label: 'Certificado de salud' },
 { value: 'JUSTIFICATIVO_FALTA', label: 'Justificativo de falta' },
 { value: 'ACCIDENTE_LABORAL', label: 'Accidente laboral' },
 { value: 'OTRO', label: 'Otro' },
];
const ESTADO_LICENCIA = { PENDIENTE: 'warning', APROBADA: 'success', RECHAZADA: 'destructive' };

const TURNO_VACIO = { diaSemana: 1, horaInicio: '08:00', horaFin: '14:00', sector: '', vigenteDesde: '', motivo: '' };
const JUST_VACIO = { tipo: 'CERTIFICADO_SALUD', fechaDesde: '', fechaHasta: '', todoElDia: true, motivo: '' };

function fecha(v) {
 if (!v) return '—';
 return new Date(v).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function fechaHora(v) {
 if (!v) return '—';
 return new Date(v).toLocaleString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export default function EmpleadoDetalle() {
 const { id } = useParams();
 const navigate = useNavigate();

 const [empleado, setEmpleado] = useState(null);
 const [horarios, setHorarios] = useState({ vigentes: [], historial: [] });
 const [modificaciones, setModificaciones] = useState([]);
 const [licencias, setLicencias] = useState([]);
 const [cargando, setCargando] = useState(true);

 const [modalDatos, setModalDatos] = useState(false);
 const [formDatos, setFormDatos] = useState({});
 const [guardandoDatos, setGuardandoDatos] = useState(false);

 const [modalTurno, setModalTurno] = useState(false);
 const [turnoEditando, setTurnoEditando] = useState(null);
 const [formTurno, setFormTurno] = useState(TURNO_VACIO);
 const [guardandoTurno, setGuardandoTurno] = useState(false);
 const [modalBajaTurno, setModalBajaTurno] = useState(null);
 const [motivoBaja, setMotivoBaja] = useState('');

 const [modalCuenta, setModalCuenta] = useState(false);
 const [formCuenta, setFormCuenta] = useState({ email: '', password: '', rol: 'CELADOR' });
 const [guardandoCuenta, setGuardandoCuenta] = useState(false);

 const [modalJust, setModalJust] = useState(false);
 const [formJust, setFormJust] = useState(JUST_VACIO);
 const [resolviendo, setResolviendo] = useState(null);

 const cargar = async () => {
 try {
 setCargando(true);
 const [emp, hor, mods, lics] = await Promise.all([
 empleadosService.obtenerPorId(id),
 empleadosService.listarHorarios(id),
 empleadosService.listarModificaciones(id),
 licenciasService.listarPorEmpleado(id),
 ]);
 setEmpleado(emp);
 setHorarios(hor || { vigentes: [], historial: [] });
 setModificaciones(Array.isArray(mods) ? mods : []);
 setLicencias(Array.isArray(lics) ? lics : []);
 } catch (error) {
 toast.error(error.response?.data?.message || 'No se pudo cargar la ficha');
 } finally {
 setCargando(false);
 }
 };

 useEffect(() => { cargar(); }, [id]);

 // ------------------------- datos -------------------------
 const abrirDatos = () => {
 setFormDatos({
 dni: empleado.dni || '', nombre: empleado.nombre || '', apellido: empleado.apellido || '',
 email: empleado.email || '', telefono: empleado.telefono || '',
 fechaNacimiento: empleado.fechaNacimiento ? String(empleado.fechaNacimiento).slice(0, 10) : '',
 genero: empleado.genero || '', cargo: empleado.cargo, sector: empleado.sector || '',
 fechaIngreso: empleado.fechaIngreso ? String(empleado.fechaIngreso).slice(0, 10) : '',
 observaciones: empleado.observaciones || '',
 });
 setModalDatos(true);
 };

 const guardarDatos = async (e) => {
 e.preventDefault();
 setGuardandoDatos(true);
 try {
 await empleadosService.actualizar(id, formDatos);
 toast.success('Ficha actualizada');
 setModalDatos(false);
 await cargar();
 } catch (error) {
 toast.error(error.response?.data?.message || 'No se pudo guardar');
 } finally {
 setGuardandoDatos(false);
 }
 };

 // ------------------------- turnos -------------------------
 const abrirNuevoTurno = () => {
 setTurnoEditando(null);
 setFormTurno(TURNO_VACIO);
 setModalTurno(true);
 };

 const abrirEditarTurno = (h) => {
 setTurnoEditando(h);
 setFormTurno({
 diaSemana: h.diaSemana,
 horaInicio: h.horaInicio,
 horaFin: h.horaFin,
 sector: h.sector || '',
 vigenteDesde: String(h.vigenteDesde).slice(0, 10),
 motivo: '',
 });
 setModalTurno(true);
 };

 const guardarTurno = async (e) => {
 e.preventDefault();
 setGuardandoTurno(true);
 try {
 const payload = {
 diaSemana: Number(formTurno.diaSemana),
 horaInicio: formTurno.horaInicio,
 horaFin: formTurno.horaFin,
 sector: formTurno.sector || null,
 ...(formTurno.vigenteDesde ? { vigenteDesde: formTurno.vigenteDesde } : {}),
 motivo: formTurno.motivo || null,
 };
 if (turnoEditando) {
 await empleadosService.actualizarHorario(turnoEditando.id, payload);
 toast.success('Turno modificado: queda registrado en el historial');
 } else {
 await empleadosService.crearHorario(id, payload);
 toast.success('Turno asignado');
 }
 setModalTurno(false);
 await cargar();
 } catch (error) {
 toast.error(error.response?.data?.message || 'No se pudo guardar el turno');
 } finally {
 setGuardandoTurno(false);
 }
 };

 const confirmarBajaTurno = async () => {
 try {
 await empleadosService.eliminarHorario(modalBajaTurno.id, motivoBaja || null);
 toast.success('Turno dado de baja');
 setModalBajaTurno(null);
 setMotivoBaja('');
 await cargar();
 } catch (error) {
 toast.error(error.response?.data?.message || 'No se pudo dar de baja el turno');
 }
 };

 // ------------------------- cuenta de acceso -------------------------
 const abrirCuenta = () => {
 setFormCuenta({
 email: empleado.email || '',
 password: '',
 rol: empleado.cargo === 'BEDEL' ? 'BEDEL' : 'CELADOR',
 });
 setModalCuenta(true);
 };

 const crearCuenta = async (e) => {
 e.preventDefault();
 setGuardandoCuenta(true);
 try {
 await api.post('/auth/register', {
 email: formCuenta.email,
 password: formCuenta.password,
 nombre: empleado.nombre,
 apellido: empleado.apellido,
 rol: formCuenta.rol,
 empleadoId: empleado.id,
 });
 toast.success('Cuenta de acceso creada');
 setModalCuenta(false);
 await cargar();
 } catch (error) {
 toast.error(error.response?.data?.message || 'No se pudo crear la cuenta');
 } finally {
 setGuardandoCuenta(false);
 }
 };

 // ------------------------- justificativos -------------------------
 const cargarJustificativo = async (e) => {
 e.preventDefault();
 try {
 await licenciasService.crear({
 empleadoId: id,
 tipo: formJust.tipo,
 fechaDesde: formJust.fechaDesde,
 fechaHasta: formJust.fechaHasta || formJust.fechaDesde,
 todoElDia: formJust.todoElDia,
 motivo: formJust.motivo || null,
 });
 toast.success('Justificativo cargado');
 setModalJust(false);
 setFormJust(JUST_VACIO);
 await cargar();
 } catch (error) {
 toast.error(error.response?.data?.message || 'No se pudo cargar el justificativo');
 }
 };

 const resolver = async (lic, accion) => {
 setResolviendo(lic.id);
 try {
 const fn = accion === 'aprobar' ? licenciasService.aprobar : licenciasService.rechazar;
 await fn(lic.id, { observaciones: null });
 toast.success(accion === 'aprobar' ? 'Justificativo aprobado' : 'Justificativo rechazado');
 await cargar();
 } catch (error) {
 toast.error(error.response?.data?.message || 'No se pudo resolver');
 } finally {
 setResolviendo(null);
 }
 };

 if (cargando) {
 return <div className="flex items-center justify-center py-20 text-muted-foreground">Cargando ficha...</div>;
 }

 if (!empleado) {
 return (
 <Card>
 <div className="p-8 text-center text-muted-foreground">
 <HardHat className="w-8 h-8 mx-auto mb-3 opacity-60" />
 <p className="text-sm">No se encontró el empleado.</p>
 <Button variant="outline" className="mt-4" onClick={() => navigate('/empleados')}>Volver</Button>
 </div>
 </Card>
 );
 }

 return (
 <div className="space-y-6">
 <div className="flex flex-wrap items-start justify-between gap-3">
 <div className="flex items-start gap-3">
 <Button variant="ghost" size="icon" onClick={() => navigate('/empleados')} title="Volver">
 <ArrowLeft className="w-5 h-5" />
 </Button>
 <div>
 <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
 {empleado.apellido}, {empleado.nombre}
 </h1>
 <p className="text-sm text-muted-foreground font-medium mt-1">
 {CARGO_LABEL[empleado.cargo] || empleado.cargo}
 {empleado.sector ? ` · ${empleado.sector}` : ''} · DNI {empleado.dni}
 </p>
 </div>
 </div>
 <div className="flex items-center gap-2">
 <Badge variant={empleado.estado === 'ACTIVO' ? 'success' : 'muted'}>
 {empleado.estado === 'ACTIVO' ? 'En funciones' : 'Dado de baja'}
 </Badge>
 <Button variant="outline" size="sm" onClick={abrirDatos}>
 <Pencil className="w-4 h-4 mr-2" /> Editar ficha
 </Button>
 </div>
 </div>

 {/* Datos */}
 <Card>
 <div className="p-4 sm:p-5 border-b border-border flex items-center gap-2">
 <UserCog className="w-5 h-5 text-primary" />
 <h2 className="text-base font-semibold text-foreground">Datos del empleado</h2>
 </div>
 <div className="p-4 sm:p-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 text-sm">
 <div><p className="text-xs text-muted-foreground">Email</p><p className="text-foreground font-medium">{empleado.email}</p></div>
 <div><p className="text-xs text-muted-foreground">Teléfono</p><p className="text-foreground font-medium">{empleado.telefono || '—'}</p></div>
 <div><p className="text-xs text-muted-foreground">Fecha de nacimiento</p><p className="text-foreground font-medium">{fecha(empleado.fechaNacimiento)}</p></div>
 <div><p className="text-xs text-muted-foreground">Género</p><p className="text-foreground font-medium">{empleado.genero || '—'}</p></div>
 <div><p className="text-xs text-muted-foreground">Cargo</p><p className="text-foreground font-medium">{CARGO_LABEL[empleado.cargo] || empleado.cargo}</p></div>
 <div><p className="text-xs text-muted-foreground">Sector / puesto</p><p className="text-foreground font-medium">{empleado.sector || '—'}</p></div>
 <div><p className="text-xs text-muted-foreground">Fecha de ingreso</p><p className="text-foreground font-medium">{fecha(empleado.fechaIngreso)}</p></div>
 <div className="sm:col-span-2 lg:col-span-3">
 <p className="text-xs text-muted-foreground">Observaciones</p>
 <p className="text-foreground">{empleado.observaciones || '—'}</p>
 </div>
 </div>
 </Card>

 {/* Acceso al sistema */}
 <Card>
 <div className="p-4 sm:p-5 border-b border-border flex items-center justify-between gap-2">
 <div className="flex items-center gap-2">
 <KeyRound className="w-5 h-5 text-primary" />
 <h2 className="text-base font-semibold text-foreground">Acceso al sistema</h2>
 </div>
 {!empleado.usuario && (
 <Button size="sm" onClick={abrirCuenta}>
 <Plus className="w-4 h-4 mr-2" /> Crear cuenta
 </Button>
 )}
 </div>
 <div className="p-4 sm:p-5 text-sm">
 {empleado.usuario ? (
 <div className="flex flex-wrap gap-6">
 <div><p className="text-xs text-muted-foreground">Email de acceso</p><p className="text-foreground font-medium">{empleado.usuario.email}</p></div>
 <div><p className="text-xs text-muted-foreground">Rol</p><p className="text-foreground font-medium">{empleado.usuario.rol}</p></div>
 <div><p className="text-xs text-muted-foreground">Estado</p>
 <Badge variant={empleado.usuario.activo ? 'success' : 'muted'}>{empleado.usuario.activo ? 'Habilitado' : 'Deshabilitado'}</Badge>
 </div>
 </div>
 ) : (
 <p className="text-muted-foreground">
 Este empleado todavía no tiene cuenta para ingresar al sistema. Creá una para que pueda ver
 sus horarios y presentar certificados o justificativos.
 </p>
 )}
 </div>
 </Card>

 {/* Horarios */}
 <Card>
 <div className="p-4 sm:p-5 border-b border-border flex items-center justify-between gap-2">
 <div className="flex items-center gap-2">
 <Clock className="w-5 h-5 text-primary" />
 <h2 className="text-base font-semibold text-foreground">Horarios de trabajo</h2>
 </div>
 <Button size="sm" onClick={abrirNuevoTurno}>
 <Plus className="w-4 h-4 mr-2" /> Agregar turno
 </Button>
 </div>

 {horarios.vigentes.length === 0 ? (
 <div className="p-6 text-center text-sm text-muted-foreground">Sin turnos vigentes.</div>
 ) : (
 <Table>
 <TableHeader>
 <TableRow>
 <TableHead>Día</TableHead>
 <TableHead>Horario</TableHead>
 <TableHead>Sector</TableHead>
 <TableHead>Vigente desde</TableHead>
 <TableHead className="text-right">Acciones</TableHead>
 </TableRow>
 </TableHeader>
 <TableBody>
 {horarios.vigentes.map((h) => (
 <TableRow key={h.id}>
 <TableCell className="font-medium text-foreground">{nombreDia(h.diaSemana)}</TableCell>
 <TableCell>{h.horaInicio} - {h.horaFin}</TableCell>
 <TableCell className="text-muted-foreground">
 <span className="inline-flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> {h.sector || '—'}</span>
 </TableCell>
 <TableCell className="text-muted-foreground">{fecha(h.vigenteDesde)}</TableCell>
 <TableCell className="text-right">
 <div className="inline-flex gap-1">
 <Button variant="ghost" size="icon" onClick={() => abrirEditarTurno(h)} title="Modificar turno">
 <Pencil className="w-4 h-4" />
 </Button>
 <Button variant="ghost" size="icon" onClick={() => setModalBajaTurno(h)} title="Dar de baja">
 <Trash2 className="w-4 h-4 text-destructive" />
 </Button>
 </div>
 </TableCell>
 </TableRow>
 ))}
 </TableBody>
 </Table>
 )}

 {horarios.historial.length > 0 && (
 <div className="border-t border-border">
 <p className="px-4 sm:px-5 pt-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Turnos anteriores</p>
 <Table>
 <TableHeader>
 <TableRow>
 <TableHead>Día</TableHead>
 <TableHead>Horario</TableHead>
 <TableHead>Sector</TableHead>
 <TableHead>Desde</TableHead>
 <TableHead>Hasta</TableHead>
 </TableRow>
 </TableHeader>
 <TableBody>
 {horarios.historial.map((h) => (
 <TableRow key={h.id}>
 <TableCell className="text-foreground">{nombreDia(h.diaSemana)}</TableCell>
 <TableCell>{h.horaInicio} - {h.horaFin}</TableCell>
 <TableCell className="text-muted-foreground">{h.sector || '—'}</TableCell>
 <TableCell className="text-muted-foreground">{fecha(h.vigenteDesde)}</TableCell>
 <TableCell className="text-muted-foreground">{fecha(h.vigenteHasta)}</TableCell>
 </TableRow>
 ))}
 </TableBody>
 </Table>
 </div>
 )}
 </Card>

 {/* Modificaciones */}
 <Card>
 <div className="p-4 sm:p-5 border-b border-border flex items-center gap-2">
 <BellRing className="w-5 h-5 text-primary" />
 <h2 className="text-base font-semibold text-foreground">Historial de modificaciones de horario</h2>
 </div>
 {modificaciones.length === 0 ? (
 <div className="p-6 text-center text-sm text-muted-foreground">Sin modificaciones registradas.</div>
 ) : (
 <div className="divide-y divide-border">
 {modificaciones.map((m) => (
 <div key={m.id} className="p-4 sm:p-5">
 <div className="flex items-center gap-2 flex-wrap">
 <Badge variant={m.tipo === 'BAJA' ? 'destructive' : m.tipo === 'ALTA' ? 'success' : 'warning'}>
 {m.tipo === 'ALTA' ? 'Alta' : m.tipo === 'CAMBIO' ? 'Cambio' : 'Baja'}
 </Badge>
 <span className="text-xs text-muted-foreground">{fechaHora(m.createdAt)}</span>
 <span className="text-xs text-muted-foreground">
 · {m.cambiadoPor ? `${m.cambiadoPor.nombre} ${m.cambiadoPor.apellido}` : 'sistema'}
 </span>
 {m.visto ? <Badge variant="muted">Visto por el empleado</Badge> : <Badge variant="info">Sin ver</Badge>}
 </div>
 <p className="text-sm text-foreground mt-1.5">{m.detalle}</p>
 {m.motivo && <p className="text-xs text-muted-foreground mt-1">Motivo: {m.motivo}</p>}
 </div>
 ))}
 </div>
 )}
 </Card>

 {/* Justificativos */}
 <Card>
 <div className="p-4 sm:p-5 border-b border-border flex items-center justify-between gap-2">
 <div className="flex items-center gap-2">
 <FileHeart className="w-5 h-5 text-primary" />
 <h2 className="text-base font-semibold text-foreground">Certificados y justificativos</h2>
 </div>
 <Button size="sm" variant="outline" onClick={() => { setFormJust(JUST_VACIO); setModalJust(true); }}>
 <Plus className="w-4 h-4 mr-2" /> Cargar
 </Button>
 </div>
 {licencias.length === 0 ? (
 <div className="p-6 text-center text-sm text-muted-foreground">Sin presentaciones.</div>
 ) : (
 <Table>
 <TableHeader>
 <TableRow>
 <TableHead>Tipo</TableHead>
 <TableHead>Período</TableHead>
 <TableHead>Estado</TableHead>
 <TableHead>Motivo</TableHead>
 <TableHead className="text-right">Acciones</TableHead>
 </TableRow>
 </TableHeader>
 <TableBody>
 {licencias.map((l) => (
 <TableRow key={l.id}>
 <TableCell className="font-medium text-foreground">
 {TIPOS_JUSTIFICATIVO.find((t) => t.value === l.tipo)?.label || l.tipo}
 </TableCell>
 <TableCell className="text-muted-foreground">{fecha(l.fechaDesde)} → {fecha(l.fechaHasta)}</TableCell>
 <TableCell><Badge variant={ESTADO_LICENCIA[l.estado] || 'muted'}>{l.estado}</Badge></TableCell>
 <TableCell className="text-muted-foreground text-xs max-w-[240px]">{l.motivo || '—'}</TableCell>
 <TableCell className="text-right">
 {l.estado === 'PENDIENTE' ? (
 <div className="inline-flex gap-1">
 <Button variant="ghost" size="icon" disabled={resolviendo === l.id} onClick={() => resolver(l, 'aprobar')} title="Aprobar">
 <CheckCircle2 className="w-4 h-4 text-emerald-600" />
 </Button>
 <Button variant="ghost" size="icon" disabled={resolviendo === l.id} onClick={() => resolver(l, 'rechazar')} title="Rechazar">
 <XCircle className="w-4 h-4 text-destructive" />
 </Button>
 </div>
 ) : (
 <span className="text-xs text-muted-foreground">{l.observaciones || '—'}</span>
 )}
 </TableCell>
 </TableRow>
 ))}
 </TableBody>
 </Table>
 )}
 </Card>

 {/* Modal datos */}
 <Modal open={modalDatos} onClose={() => setModalDatos(false)} title="Editar ficha" size="lg">
 <form onSubmit={guardarDatos} className="space-y-4">
 <div className="grid sm:grid-cols-2 gap-3">
 <Input label="DNI" value={formDatos.dni || ''} onChange={(e) => setFormDatos({ ...formDatos, dni: e.target.value })} required />
 <Input label="Email" type="email" value={formDatos.email || ''} onChange={(e) => setFormDatos({ ...formDatos, email: e.target.value })} required />
 <Input label="Nombre" value={formDatos.nombre || ''} onChange={(e) => setFormDatos({ ...formDatos, nombre: e.target.value })} required />
 <Input label="Apellido" value={formDatos.apellido || ''} onChange={(e) => setFormDatos({ ...formDatos, apellido: e.target.value })} required />
 <Input label="Teléfono" value={formDatos.telefono || ''} onChange={(e) => setFormDatos({ ...formDatos, telefono: e.target.value })} />
 <div>
 <label className="block text-sm font-medium text-foreground/90 mb-1.5">Cargo</label>
 <select className={selectClass} value={formDatos.cargo} onChange={(e) => setFormDatos({ ...formDatos, cargo: e.target.value })}>
 {CARGOS.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
 </select>
 </div>
 <Input label="Sector / puesto" value={formDatos.sector || ''} onChange={(e) => setFormDatos({ ...formDatos, sector: e.target.value })} />
 <div>
 <label className="block text-sm font-medium text-foreground/90 mb-1.5">Género</label>
 <select className={selectClass} value={formDatos.genero || ''} onChange={(e) => setFormDatos({ ...formDatos, genero: e.target.value })}>
 <option value="">Sin especificar</option>
 <option value="F">Femenino</option>
 <option value="M">Masculino</option>
 <option value="X">Otro</option>
 </select>
 </div>
 <DatePicker label="Fecha de nacimiento" value={formDatos.fechaNacimiento || ''} onChange={(v) => setFormDatos({ ...formDatos, fechaNacimiento: v })} />
 <DatePicker label="Fecha de ingreso" value={formDatos.fechaIngreso || ''} onChange={(v) => setFormDatos({ ...formDatos, fechaIngreso: v })} />
 </div>
 <div>
 <label className="block text-sm font-medium text-foreground/90 mb-1.5">Observaciones</label>
 <textarea rows={3} value={formDatos.observaciones || ''} onChange={(e) => setFormDatos({ ...formDatos, observaciones: e.target.value })}
 className="w-full px-3 py-2 rounded-lg bg-background border border-border text-foreground text-sm focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/30" />
 </div>
 <div className="flex justify-end gap-2 pt-4 border-t border-border">
 <Button type="button" variant="outline" onClick={() => setModalDatos(false)}>Cancelar</Button>
 <Button type="submit" disabled={guardandoDatos}><Save className="w-4 h-4 mr-2" />{guardandoDatos ? 'Guardando...' : 'Guardar'}</Button>
 </div>
 </form>
 </Modal>

 {/* Modal turno */}
 <Modal open={modalTurno} onClose={() => setModalTurno(false)} title={turnoEditando ? 'Modificar turno' : 'Agregar turno'} size="md">
 <form onSubmit={guardarTurno} className="space-y-4">
 <div className="grid grid-cols-3 gap-3">
 <div>
 <label className="block text-sm font-medium text-foreground/90 mb-1.5">Día</label>
 <select className={selectClass} value={formTurno.diaSemana} onChange={(e) => setFormTurno({ ...formTurno, diaSemana: e.target.value })}>
 {DIAS_SEMANA.map((d) => <option key={d.value} value={d.value}>{d.label}</option>)}
 </select>
 </div>
 <Input label="Desde" type="time" value={formTurno.horaInicio} onChange={(e) => setFormTurno({ ...formTurno, horaInicio: e.target.value })} required />
 <Input label="Hasta" type="time" value={formTurno.horaFin} onChange={(e) => setFormTurno({ ...formTurno, horaFin: e.target.value })} required />
 </div>
 <div className="grid sm:grid-cols-2 gap-3">
 <Input label="Sector / puesto" value={formTurno.sector} onChange={(e) => setFormTurno({ ...formTurno, sector: e.target.value })} placeholder="Portería, patio..." />
 <DatePicker label="Vigente desde" value={formTurno.vigenteDesde} onChange={(v) => setFormTurno({ ...formTurno, vigenteDesde: v })} />
 </div>
 <div>
 <label className="block text-sm font-medium text-foreground/90 mb-1.5">Motivo del cambio (queda en el historial)</label>
 <Input value={formTurno.motivo} onChange={(e) => setFormTurno({ ...formTurno, motivo: e.target.value })} placeholder="Ej: reorganización de turnos" />
 </div>
 <div className="flex justify-end gap-2 pt-4 border-t border-border">
 <Button type="button" variant="outline" onClick={() => setModalTurno(false)}>Cancelar</Button>
 <Button type="submit" disabled={guardandoTurno}>{guardandoTurno ? 'Guardando...' : turnoEditando ? 'Guardar cambio' : 'Asignar turno'}</Button>
 </div>
 </form>
 </Modal>

 {/* Modal baja de turno */}
 <Modal open={!!modalBajaTurno} onClose={() => setModalBajaTurno(null)} title="Dar de baja el turno" size="sm">
 <p className="text-sm text-muted-foreground">
 Se cierra la vigencia del turno {modalBajaTurno ? `${nombreDia(modalBajaTurno.diaSemana)} ${modalBajaTurno.horaInicio}-${modalBajaTurno.horaFin}` : ''}.
 El empleado va a ver la novedad en su panel.
 </p>
 <div className="mt-4">
 <Input label="Motivo (opcional)" value={motivoBaja} onChange={(e) => setMotivoBaja(e.target.value)} />
 </div>
 <div className="flex justify-end gap-2 pt-4 mt-4 border-t border-border">
 <Button variant="outline" onClick={() => setModalBajaTurno(null)}>Cancelar</Button>
 <Button variant="destructive" onClick={confirmarBajaTurno}>Dar de baja</Button>
 </div>
 </Modal>

 {/* Modal cuenta */}
 <Modal open={modalCuenta} onClose={() => setModalCuenta(false)} title="Crear cuenta de acceso" size="md">
 <form onSubmit={crearCuenta} className="space-y-4">
 <Input label="Email" type="email" value={formCuenta.email} onChange={(e) => setFormCuenta({ ...formCuenta, email: e.target.value })} required />
 <Input label="Contraseña" type="password" value={formCuenta.password} onChange={(e) => setFormCuenta({ ...formCuenta, password: e.target.value })} required />
 <div>
 <label className="block text-sm font-medium text-foreground/90 mb-1.5">Rol</label>
 <select className={selectClass} value={formCuenta.rol} onChange={(e) => setFormCuenta({ ...formCuenta, rol: e.target.value })}>
 <option value="CELADOR">Celador (autoservicio)</option>
 <option value="BEDEL">Bedel</option>
 </select>
 <p className="text-xs text-muted-foreground mt-1.5">
 El celador sólo accede a su panel personal: sus datos, sus horarios y sus justificativos.
 </p>
 </div>
 <div className="flex justify-end gap-2 pt-4 border-t border-border">
 <Button type="button" variant="outline" onClick={() => setModalCuenta(false)}>Cancelar</Button>
 <Button type="submit" disabled={guardandoCuenta}>{guardandoCuenta ? 'Creando...' : 'Crear cuenta'}</Button>
 </div>
 </form>
 </Modal>

 {/* Modal justificativo (carga por gestión) */}
 <Modal open={modalJust} onClose={() => setModalJust(false)} title="Cargar certificado o justificativo" size="md">
 <form onSubmit={cargarJustificativo} className="space-y-4">
 <div>
 <label className="block text-sm font-medium text-foreground/90 mb-1.5">Tipo</label>
 <select className={selectClass} value={formJust.tipo} onChange={(e) => setFormJust({ ...formJust, tipo: e.target.value })}>
 {TIPOS_JUSTIFICATIVO.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
 </select>
 </div>
 <div className="grid grid-cols-2 gap-3">
 <DatePicker label="Desde" required value={formJust.fechaDesde} onChange={(v) => setFormJust({ ...formJust, fechaDesde: v, fechaHasta: formJust.fechaHasta || v })} />
 <DatePicker label="Hasta" required value={formJust.fechaHasta} onChange={(v) => setFormJust({ ...formJust, fechaHasta: v })} />
 </div>
 <label className="flex items-center gap-2 text-sm text-foreground">
 <input type="checkbox" checked={formJust.todoElDia} onChange={(e) => setFormJust({ ...formJust, todoElDia: e.target.checked })} />
 Todo el día
 </label>
 <div>
 <label className="block text-sm font-medium text-foreground/90 mb-1.5">Motivo</label>
 <textarea rows={3} value={formJust.motivo} onChange={(e) => setFormJust({ ...formJust, motivo: e.target.value })}
 className="w-full px-3 py-2 rounded-lg bg-background border border-border text-foreground text-sm focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/30" />
 </div>
 <div className="flex justify-end gap-2 pt-4 border-t border-border">
 <Button type="button" variant="outline" onClick={() => setModalJust(false)}>Cancelar</Button>
 <Button type="submit">Cargar</Button>
 </div>
 </form>
 </Modal>
 </div>
 );
}
