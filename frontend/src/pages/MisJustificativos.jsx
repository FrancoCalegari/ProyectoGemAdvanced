import { useState, useEffect } from 'react';
import { Plus, FileHeart, Pencil, Trash2, History, Clock, CheckCircle2, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { licenciasService } from '../services/licencias.service';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { DatePicker } from '../components/ui/DatePicker';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../components/ui/Table';

// Tipos que puede presentar el personal no docente
const TIPOS = [
 { value: 'CERTIFICADO_SALUD', label: 'Certificado de salud' },
 { value: 'JUSTIFICATIVO_FALTA', label: 'Justificativo de falta' },
 { value: 'ACCIDENTE_LABORAL', label: 'Accidente laboral' },
 { value: 'OTRO', label: 'Otro' },
];

const ESTADO_BADGE = {
 PENDIENTE: 'warning',
 APROBADA: 'success',
 RECHAZADA: 'destructive',
};

const TURNO_LABEL = { MANANA: 'Mañana', TARDE: 'Tarde', NOCHE: 'Noche' };

const FORM_VACIO = {
 tipo: 'CERTIFICADO_SALUD',
 fechaDesde: '',
 fechaHasta: '',
 alcance: 'DIA', // DIA | HORAS | TURNO
 horaDesde: '',
 horaHasta: '',
 turno: 'MANANA',
 motivo: '',
};

const selectClass = 'w-full h-10 px-3 rounded-lg bg-background border border-border text-foreground text-sm focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/30 transition-all';

function fecha(v) {
 if (!v) return '—';
 return new Date(v).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export default function MisJustificativos() {
 const [licencias, setLicencias] = useState([]);
 const [cargando, setCargando] = useState(true);
 const [modal, setModal] = useState(false);
 const [editando, setEditando] = useState(null);
 const [form, setForm] = useState(FORM_VACIO);
 const [guardando, setGuardando] = useState(false);

 const cargar = async () => {
 try {
 setCargando(true);
 const data = await licenciasService.misLicencias();
 setLicencias(Array.isArray(data) ? data : []);
 } catch (error) {
 toast.error(error.response?.data?.message || 'No se pudieron cargar tus justificativos');
 } finally {
 setCargando(false);
 }
 };

 useEffect(() => { cargar(); }, []);

 const abrirNuevo = () => {
 setEditando(null);
 setForm(FORM_VACIO);
 setModal(true);
 };

 const abrirEditar = (l) => {
 setEditando(l);
 setForm({
 tipo: l.tipo,
 fechaDesde: String(l.fechaDesde).slice(0, 10),
 fechaHasta: String(l.fechaHasta).slice(0, 10),
 alcance: l.todoElDia ? 'DIA' : (l.turno ? 'TURNO' : 'HORAS'),
 horaDesde: l.horaDesde || '',
 horaHasta: l.horaHasta || '',
 turno: l.turno || 'MANANA',
 motivo: l.motivo || '',
 });
 setModal(true);
 };

 const construirPayload = () => ({
 tipo: form.tipo,
 fechaDesde: form.fechaDesde,
 fechaHasta: form.fechaHasta || form.fechaDesde,
 todoElDia: form.alcance === 'DIA',
 horaDesde: form.alcance === 'HORAS' ? form.horaDesde : null,
 horaHasta: form.alcance === 'HORAS' ? form.horaHasta : null,
 turno: form.alcance === 'TURNO' ? form.turno : null,
 motivo: form.motivo || null,
 });

 const guardar = async (e) => {
 e.preventDefault();
 if (!form.fechaDesde) return toast.error('Indicá la fecha desde');
 setGuardando(true);
 try {
 const payload = construirPayload();
 if (editando) {
 await licenciasService.actualizar(editando.id, payload);
 toast.success('Justificativo actualizado');
 } else {
 await licenciasService.crear(payload);
 toast.success('Justificativo presentado');
 }
 setModal(false);
 await cargar();
 } catch (error) {
 toast.error(error.response?.data?.message || 'No se pudo guardar');
 } finally {
 setGuardando(false);
 }
 };

 const eliminar = async (l) => {
 if (!window.confirm('¿Eliminar este justificativo? Esta acción no se puede deshacer.')) return;
 try {
 await licenciasService.eliminar(l.id);
 toast.success('Justificativo eliminado');
 await cargar();
 } catch (error) {
 toast.error(error.response?.data?.message || 'No se pudo eliminar');
 }
 };

 const pendientes = licencias.filter((l) => l.estado === 'PENDIENTE').length;
 const aprobadas = licencias.filter((l) => l.estado === 'APROBADA').length;
 const rechazadas = licencias.filter((l) => l.estado === 'RECHAZADA').length;

 return (
 <div className="space-y-6">
 <div className="flex flex-wrap items-start justify-between gap-3">
 <div>
 <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Mis certificados y justificativos</h1>
 <p className="text-sm text-muted-foreground font-medium mt-1">
 Presentá certificados de salud o justificativos por faltas. La gestión los aprueba o rechaza.
 </p>
 </div>
 <Button onClick={abrirNuevo}>
 <Plus className="w-4 h-4 mr-2" /> Presentar
 </Button>
 </div>

 <div className="grid gap-4 sm:grid-cols-3">
 <Card>
 <div className="p-4 flex items-center gap-3">
 <Clock className="w-5 h-5 text-amber-500" />
 <div>
 <p className="text-2xl font-bold text-foreground">{pendientes}</p>
 <p className="text-xs text-muted-foreground">Pendientes de resolución</p>
 </div>
 </div>
 </Card>
 <Card>
 <div className="p-4 flex items-center gap-3">
 <CheckCircle2 className="w-5 h-5 text-emerald-500" />
 <div>
 <p className="text-2xl font-bold text-foreground">{aprobadas}</p>
 <p className="text-xs text-muted-foreground">Aprobados</p>
 </div>
 </div>
 </Card>
 <Card>
 <div className="p-4 flex items-center gap-3">
 <XCircle className="w-5 h-5 text-red-500" />
 <div>
 <p className="text-2xl font-bold text-foreground">{rechazadas}</p>
 <p className="text-xs text-muted-foreground">Rechazados</p>
 </div>
 </div>
 </Card>
 </div>

 <Card>
 <div className="p-4 sm:p-5 border-b border-border flex items-center gap-2">
 <History className="w-5 h-5 text-primary" />
 <h2 className="text-base font-semibold text-foreground">Mi historial de presentaciones</h2>
 </div>

 {cargando ? (
 <div className="p-8 text-center text-sm text-muted-foreground">Cargando...</div>
 ) : licencias.length === 0 ? (
 <div className="p-8 text-center">
 <FileHeart className="w-8 h-8 mx-auto mb-3 text-muted-foreground/60" />
 <p className="text-sm text-muted-foreground">Todavía no presentaste ningún certificado ni justificativo.</p>
 </div>
 ) : (
 <Table>
 <TableHeader>
 <TableRow>
 <TableHead>Tipo</TableHead>
 <TableHead>Período</TableHead>
 <TableHead>Alcance</TableHead>
 <TableHead>Estado</TableHead>
 <TableHead>Respuesta</TableHead>
 <TableHead className="text-right">Acciones</TableHead>
 </TableRow>
 </TableHeader>
 <TableBody>
 {licencias.map((l) => (
 <TableRow key={l.id}>
 <TableCell className="font-medium text-foreground">
 {TIPOS.find((t) => t.value === l.tipo)?.label || l.tipo}
 </TableCell>
 <TableCell className="text-muted-foreground">
 {fecha(l.fechaDesde)} → {fecha(l.fechaHasta)}
 </TableCell>
 <TableCell className="text-muted-foreground">
 {l.todoElDia ? 'Todo el día' : l.turno ? `Turno ${TURNO_LABEL[l.turno] || l.turno}` : `${l.horaDesde} - ${l.horaHasta}`}
 </TableCell>
 <TableCell>
 <Badge variant={ESTADO_BADGE[l.estado] || 'muted'}>{l.estado}</Badge>
 </TableCell>
 <TableCell className="text-muted-foreground text-xs max-w-[220px]">
 {l.observaciones || '—'}
 </TableCell>
 <TableCell className="text-right">
 {l.estado === 'PENDIENTE' ? (
 <div className="inline-flex gap-1">
 <Button variant="ghost" size="icon" onClick={() => abrirEditar(l)} title="Editar">
 <Pencil className="w-4 h-4" />
 </Button>
 <Button variant="ghost" size="icon" onClick={() => eliminar(l)} title="Eliminar">
 <Trash2 className="w-4 h-4 text-destructive" />
 </Button>
 </div>
 ) : (
 <span className="text-xs text-muted-foreground">—</span>
 )}
 </TableCell>
 </TableRow>
 ))}
 </TableBody>
 </Table>
 )}
 </Card>

 <Modal
 open={modal}
 onClose={() => setModal(false)}
 title={editando ? 'Editar justificativo' : 'Presentar certificado o justificativo'}
 size="md"
 >
 <form onSubmit={guardar} className="space-y-4">
 <div>
 <label className="block text-sm font-medium text-foreground/90 mb-1.5">Tipo</label>
 <select className={selectClass} value={form.tipo} onChange={(e) => setForm({ ...form, tipo: e.target.value })}>
 {TIPOS.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
 </select>
 </div>

 <div className="grid grid-cols-2 gap-3">
 <DatePicker label="Desde" required value={form.fechaDesde} onChange={(v) => setForm({ ...form, fechaDesde: v, fechaHasta: form.fechaHasta || v })} />
 <DatePicker label="Hasta" required value={form.fechaHasta} onChange={(v) => setForm({ ...form, fechaHasta: v })} />
 </div>

 <div>
 <label className="block text-sm font-medium text-foreground/90 mb-1.5">Alcance</label>
 <select className={selectClass} value={form.alcance} onChange={(e) => setForm({ ...form, alcance: e.target.value })}>
 <option value="DIA">Todo el día</option>
 <option value="HORAS">Por horas</option>
 <option value="TURNO">Por turno</option>
 </select>
 </div>

 {form.alcance === 'HORAS' && (
 <div className="grid grid-cols-2 gap-3">
 <Input label="Hora desde" type="time" value={form.horaDesde} onChange={(e) => setForm({ ...form, horaDesde: e.target.value })} required />
 <Input label="Hora hasta" type="time" value={form.horaHasta} onChange={(e) => setForm({ ...form, horaHasta: e.target.value })} required />
 </div>
 )}

 {form.alcance === 'TURNO' && (
 <div>
 <label className="block text-sm font-medium text-foreground/90 mb-1.5">Turno</label>
 <select className={selectClass} value={form.turno} onChange={(e) => setForm({ ...form, turno: e.target.value })}>
 <option value="MANANA">Mañana</option>
 <option value="TARDE">Tarde</option>
 <option value="NOCHE">Noche</option>
 </select>
 </div>
 )}

 <div>
 <label className="block text-sm font-medium text-foreground/90 mb-1.5">Motivo / detalle</label>
 <textarea
 rows={3}
 value={form.motivo}
 onChange={(e) => setForm({ ...form, motivo: e.target.value })}
 placeholder="Contá brevemente el motivo y adjuntá el certificado en la secretaría si corresponde."
 className="w-full px-3 py-2 rounded-lg bg-background border border-border text-foreground text-sm focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/30 transition-all"
 />
 </div>

 <div className="flex justify-end gap-2 pt-4 border-t border-border">
 <Button type="button" variant="outline" onClick={() => setModal(false)}>Cancelar</Button>
 <Button type="submit" disabled={guardando}>
 {guardando ? 'Guardando...' : editando ? 'Guardar cambios' : 'Presentar'}
 </Button>
 </div>
 </form>
 </Modal>
 </div>
 );
}
