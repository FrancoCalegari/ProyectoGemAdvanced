import { useState, useEffect } from 'react';
import { Plus, Search, Pencil, Trash2, Calendar, Clock, CheckCircle2, XCircle, Heart, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { licenciasService } from '../services/licencias.service';
import { authService } from '../services/auth.service';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { DatePicker } from '../components/ui/DatePicker';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../components/ui/Table';
const TIPOS_BASE = [
 { value: 'ENFERMEDAD', label: 'Enfermedad' },
 { value: 'RAZON_PARTICULAR', label: 'Razon particular' },
 { value: 'DONACION_SANGRE', label: 'Donacion de sangre' },
 { value: 'ACCIDENTE_LABORAL', label: 'Accidente laboral' },
 { value: 'OTRO', label: 'Otro' },
];
const TIPO_FEMENINO = { value: 'ESTUDIOS_FEMENINOS', label: 'Estudios femeninos' };
const ESTADOS = [
 { value: 'PENDIENTE', label: 'Pendiente', variant: 'secondary', icon: Clock },
 { value: 'APROBADA', label: 'Aprobada', variant: 'default', icon: CheckCircle2 },
 { value: 'RECHAZADA', label: 'Rechazada', variant: 'destructive', icon: XCircle },
];
const TURNOS = [
 { value: 'MANANA', label: 'Manana (07-13)' },
 { value: 'TARDE', label: 'Tarde (13-19)' },
 { value: 'NOCHE', label: 'Noche (19-23)' },
];
const GRANULARIDAD = [
 { value: 'DIA_COMPLETO', label: 'Dia completo' },
 { value: 'RANGO_HORARIO', label: 'Rango horario' },
 { value: 'TURNO', label: 'Turno' },
];
export default function MisLicencias() {
 const { isProfesor } = useAuth();
 const [licencias, setLicencias] = useState([]);
 const [perfilProfesor, setPerfilProfesor] = useState(null);
 const [cargando, setCargando] = useState(true);
 const [busqueda, setBusqueda] = useState('');
 const [filtroEstado, setFiltroEstado] = useState('');
 const [filtroTipo, setFiltroTipo] = useState('');
 const [modalCrear, setModalCrear] = useState(false);
 const [modalEditar, setModalEditar] = useState(null);
 const [modalEliminar, setModalEliminar] = useState(null);
 const [guardando, setGuardando] = useState(false);
 const [form, setForm] = useState({
 tipo: 'ENFERMEDAD',
 fechaDesde: '',
 fechaHasta: '',
 granularidad: 'DIA_COMPLETO',
 horaDesde: '',
 horaHasta: '',
 turno: 'MANANA',
 motivo: '',
 });
 useEffect(() => { cargar(); }, []);
 const cargar = async () => {
 try {
 setCargando(true);
 const [data, perfil] = await Promise.all([
 licenciasService.misLicencias(),
 authService.me(),
 ]);
 setLicencias(data);
 setPerfilProfesor(perfil.profesor || null);
 } catch (error) {
 toast.error('Error al cargar licencias');
 } finally {
 setCargando(false);
 }
 };
 // Tipos disponibles segun género
 const tiposDisponibles = [
 ...TIPOS_BASE,
 ...(perfilProfesor?.género === 'F' ? [TIPO_FEMENINO] : []),
 ];
 const resetForm = () => {
 setForm({
 tipo: 'ENFERMEDAD',
 fechaDesde: '',
 fechaHasta: '',
 granularidad: 'DIA_COMPLETO',
 horaDesde: '',
 horaHasta: '',
 turno: 'MANANA',
 motivo: '',
 });
 };
 const construirPayload = (f) => {
 const payload = {
 tipo: f.tipo,
 fechaDesde: f.fechaDesde,
 fechaHasta: f.fechaHasta || f.fechaDesde,
 motivo: f.motivo || null,
 };
 if (f.granularidad === 'DIA_COMPLETO') {
 payload.todoElDia = true;
 } else if (f.granularidad === 'RANGO_HORARIO') {
 payload.todoElDia = false;
 payload.horaDesde = f.horaDesde;
 payload.horaHasta = f.horaHasta;
 } else if (f.granularidad === 'TURNO') {
 payload.todoElDia = false;
 payload.turno = f.turno;
 }
 return payload;
 };
 const handleCrear = async (e) => {
 e.preventDefault();
 if (!form.fechaDesde) {
 toast.error('Selecciona al menos la fecha de inicio');
 return;
 }
 if (form.granularidad === 'RANGO_HORARIO' && (!form.horaDesde || !form.horaHasta)) {
 toast.error('Completa hora desde y hora hasta');
 return;
 }
 setGuardando(true);
 try {
 await licenciasService.crear(construirPayload(form));
 toast.success('Licencia solicitada');
 setModalCrear(false);
 resetForm();
 cargar();
 } catch (error) {
 toast.error(error.response?.data?.message || 'Error al crear');
 } finally {
 setGuardando(false);
 }
 };
 const handleEditar = async (e) => {
 e.preventDefault();
 if (!modalEditar) return;
 setGuardando(true);
 try {
 await licenciasService.actualizar(modalEditar.id, construirPayload(modalEditar));
 toast.success('Licencia actualizada');
 setModalEditar(null);
 cargar();
 } catch (error) {
 toast.error(error.response?.data?.message || 'Error al editar');
 } finally {
 setGuardando(false);
 }
 };
 const handleEliminar = async () => {
 if (!modalEliminar) return;
 try {
 await licenciasService.eliminar(modalEliminar.id);
 toast.success('Licencia eliminada');
 setModalEliminar(null);
 cargar();
 } catch (error) {
 toast.error(error.response?.data?.message || 'Error al eliminar');
 }
 };
 const filtradas = licencias.filter((l) => {
 if (filtroEstado && l.estado !== filtroEstado) return false;
 if (filtroTipo && l.tipo !== filtroTipo) return false;
 if (!busqueda) return true;
 const q = busqueda.toLowerCase();
 const tipoLabel = tiposDisponibles.find((t) => t.value === l.tipo)?.label || '';
 return tipoLabel.toLowerCase().includes(q) || (l.motivo || '').toLowerCase().includes(q);
 });
 if (!isProfesor) {
 return (
 <div className="space-y-6">
 <h1 className="text-2xl sm:text-3xl font-bold">Mis Licencias</h1>
 <Card>
 <div className="p-12 text-center">
 <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
 <p className="text-muted-foreground">Solo los profesores pueden tener licencias.</p>
 </div>
 </Card>
 </div>
 );
 }
 const FormLicencia = ({ value, onChange }) => (
 <>
 <div>
 <label className="block text-sm font-medium mb-1">Tipo de licencia</label>
 <select
 value={value.tipo}
 onChange={(e) => onChange({ ...value, tipo: e.target.value })}
 className="w-full h-10 px-3 rounded-md border border-border bg-background"
 >
 {tiposDisponibles.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
 </select>
 {perfilProfesor?.género !== 'F' && (
 <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
 <AlertCircle className="w-3 h-3" /> "Estudios femeninos" solo disponible para docentes de género F.
 </p>
 )}
 </div>
 <div className="grid grid-cols-2 gap-3">
 <div>
 <label className="block text-sm font-medium mb-1">Fecha desde *</label>
 <DatePicker value={value.fechaDesde} onChange={(v) => onChange({...value, fechaDesde: v})} required />
 </div>
 <div>
 <label className="block text-sm font-medium mb-1">Fecha hasta</label>
 <DatePicker value={value.fechaHasta} onChange={(v) => onChange({ ...value, fechaHasta: v })} />
 <p className="text-xs text-muted-foreground mt-1">Si no la completas, se usa la fecha desde.</p>
 </div>
 </div>
 <div>
 <label className="block text-sm font-medium mb-1">Granularidad</label>
 <div className="grid grid-cols-3 gap-2">
 {GRANULARIDAD.map((g) => (
 <button
 key={g.value}
 type="button"
 onClick={() => onChange({ ...value, granularidad: g.value })}
 className={`px-3 py-2 text-sm rounded-md border transition-colors ${
 value.granularidad === g.value
 ? 'border-primary bg-primary/10 text-primary font-medium'
 : 'border-border hover:bg-accent'
 }`}
 >
 {g.label}
 </button>
 ))}
 </div>
 </div>
 {value.granularidad === 'RANGO_HORARIO' && (
 <div className="grid grid-cols-2 gap-3">
 <div>
 <label className="block text-sm font-medium mb-1">Hora desde</label>
 <Input type="time" value={value.horaDesde} onChange={(e) => onChange({ ...value, horaDesde: e.target.value })} required />
 </div>
 <div>
 <label className="block text-sm font-medium mb-1">Hora hasta</label>
 <Input type="time" value={value.horaHasta} onChange={(e) => onChange({ ...value, horaHasta: e.target.value })} required />
 </div>
 </div>
 )}
 {value.granularidad === 'TURNO' && (
 <div>
 <label className="block text-sm font-medium mb-1">Turno</label>
 <select
 value={value.turno}
 onChange={(e) => onChange({ ...value, turno: e.target.value })}
 className="w-full h-10 px-3 rounded-md border border-border bg-background"
 >
 {TURNOS.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
 </select>
 </div>
 )}
 <div>
 <label className="block text-sm font-medium mb-1">Motivo (opcional)</label>
 <textarea
 value={value.motivo || ''}
 onChange={(e) => onChange({ ...value, motivo: e.target.value })}
 className="w-full min-h-[80px] px-3 py-2 rounded-md border border-border bg-background text-sm"
 placeholder="Detalle adicional que quieras agregar..."
 />
 </div>
 </>
 );
 return (
 <div className="space-y-6">
 <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
 <div>
 <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Mis Licencias</h1>
 <p className="text-sm sm:text-base text-muted-foreground font-medium mt-1">
 Solicita licencias por enfermedad, razones particulares y mas
 </p>
 </div>
 <Button onClick={() => { resetForm(); setModalCrear(true); }} className="w-full sm:w-auto">
 <Plus className="w-4 h-4 mr-2" />
 Solicitar Licencia
 </Button>
 </div>
 <Card>
 <div className="p-4 border-b border-border flex flex-col sm:flex-row gap-3">
 <div className="relative flex-1">
 <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
 <Input
 placeholder="Buscar por tipo o motivo..."
 value={busqueda}
 onChange={(e) => setBusqueda(e.target.value)}
 className="pl-10"
 />
 </div>
 <select
 value={filtroEstado}
 onChange={(e) => setFiltroEstado(e.target.value)}
 className="h-10 px-3 rounded-md border border-border bg-background text-sm"
 >
 <option value="">Todos los estados</option>
 {ESTADOS.map((e) => <option key={e.value} value={e.value}>{e.label}</option>)}
 </select>
 <select
 value={filtroTipo}
 onChange={(e) => setFiltroTipo(e.target.value)}
 className="h-10 px-3 rounded-md border border-border bg-background text-sm"
 >
 <option value="">Todos los tipos</option>
 {tiposDisponibles.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
 </select>
 </div>
 {cargando ? (
 <div className="p-8 text-center text-muted-foreground font-medium">Cargando...</div>
 ) : filtradas.length === 0 ? (
 <div className="p-8 text-center text-muted-foreground font-medium">
 {licencias.length === 0
 ? 'No tenes licencias registradas. Hace click en "Solicitar Licencia" para crear una.'
 : 'No se encontraron resultados con esos filtros'}
 </div>
 ) : (
 <Table>
 <TableHeader>
 <TableRow>
 <TableHead>Tipo</TableHead>
 <TableHead>Desde</TableHead>
 <TableHead>Hasta</TableHead>
 <TableHead>Detalle horario</TableHead>
 <TableHead>Estado</TableHead>
 <TableHead className="text-right">Acciones</TableHead>
 </TableRow>
 </TableHeader>
 <TableBody>
 {filtradas.map((l) => {
 const estadoInfo = ESTADOS.find((e) => e.value === l.estado);
 const Icon = estadoInfo?.icon || Clock;
 const tipoLabel = tiposDisponibles.find((t) => t.value === l.tipo)?.label || l.tipo;
 return (
 <TableRow key={l.id}>
 <TableCell className="font-medium">{tipoLabel}</TableCell>
 <TableCell>{new Date(l.fechaDesde).toLocaleDateString('es-AR')}</TableCell>
 <TableCell>{new Date(l.fechaHasta).toLocaleDateString('es-AR')}</TableCell>
 <TableCell className="text-sm text-muted-foreground">
 {l.todoElDia ? 'Dia completo' :
 l.turno ? `Turno ${l.turno}` :
 l.horaDesde && l.horaHasta ? `${l.horaDesde} - ${l.horaHasta}` : '-'}
 </TableCell>
 <TableCell>
 <Badge variant={estadoInfo?.variant}>
 <Icon className="w-3 h-3 mr-1" />
 {estadoInfo?.label || l.estado}
 </Badge>
 </TableCell>
 <TableCell className="text-right">
 {l.estado === 'PENDIENTE' && (
 <div className="flex justify-end gap-1">
 <Button
 variant="ghost"
 size="sm"
 onClick={() => setModalEditar({
 id: l.id,
 tipo: l.tipo,
 fechaDesde: l.fechaDesde?.split('T')[0] || '',
 fechaHasta: l.fechaHasta?.split('T')[0] || '',
 granularidad: l.todoElDia ? 'DIA_COMPLETO' : (l.turno ? 'TURNO' : 'RANGO_HORARIO'),
 horaDesde: l.horaDesde || '',
 horaHasta: l.horaHasta || '',
 turno: l.turno || 'MANANA',
 motivo: l.motivo || '',
 })}
 title="Editar"
 >
 <Pencil className="w-4 h-4" />
 </Button>
 <Button
 variant="ghost"
 size="sm"
 onClick={() => setModalEliminar(l)}
 title="Eliminar"
 >
 <Trash2 className="w-4 h-4 text-destructive" />
 </Button>
 </div>
 )}
 </TableCell>
 </TableRow>
 );
 })}
 </TableBody>
 </Table>
 )}
 </Card>
 {/* Modal Crear */}
 <Modal open={modalCrear} onClose={() => setModalCrear(false)} title="Solicitar Licencia" size="lg">
 <form onSubmit={handleCrear} className="space-y-4">
 <FormLicencia value={form} onChange={setForm} />
 <div className="flex justify-end gap-2 pt-4 border-t border-border">
 <Button type="button" variant="outline" onClick={() => setModalCrear(false)}>Cancelar</Button>
 <Button type="submit" disabled={guardando}>
 {guardando ? 'Enviando...' : 'Solicitar Licencia'}
 </Button>
 </div>
 </form>
 </Modal>
 {/* Modal Editar */}
 <Modal open={!!modalEditar} onClose={() => setModalEditar(null)} title="Editar Licencia" size="lg">
 {modalEditar && (
 <form onSubmit={handleEditar} className="space-y-4">
 <FormLicencia value={modalEditar} onChange={setModalEditar} />
 <div className="flex justify-end gap-2 pt-4 border-t border-border">
 <Button type="button" variant="outline" onClick={() => setModalEditar(null)}>Cancelar</Button>
 <Button type="submit" disabled={guardando}>
 {guardando ? 'Guardando...' : 'Guardar cambios'}
 </Button>
 </div>
 </form>
 )}
 </Modal>
 {/* Modal Eliminar */}
 <Modal open={!!modalEliminar} onClose={() => setModalEliminar(null)} title="Eliminar Licencia">
 <div className="space-y-4">
 <p className="text-sm">¿Estás seguro que queres eliminar esta licencia?</p>
 <div className="flex justify-end gap-2 pt-2 border-t border-border">
 <Button variant="outline" onClick={() => setModalEliminar(null)}>Cancelar</Button>
 <Button variant="destructive" onClick={handleEliminar}>Eliminar</Button>
 </div>
 </div>
 </Modal>
 </div>
 );
}