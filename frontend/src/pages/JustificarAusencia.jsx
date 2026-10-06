import { useState, useEffect } from 'react';
import { Plus, FileText, Calendar, CheckCircle2, XCircle, Clock, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../contexts/AuthContext';
import { certificadosPresentadosService } from '../services/certificadosPresentados.service';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { DatePicker } from '../components/ui/DatePicker';

const TIPOS = [
 { value: 'MEDICO', label: 'Certificado medico' },
 { value: 'LABORAL', label: 'Certificado laboral' },
 { value: 'FAMILIAR', label: 'Motivo familiar' },
 { value: 'OTRO', label: 'Otro' },
];

const ESTADO_BADGE = {
 PENDIENTE: { variant: 'warning', icon: Clock, label: 'Pendiente' },
 APROBADO: { variant: 'success', icon: CheckCircle2, label: 'Aprobado' },
 RECHAZADO: { variant: 'danger', icon: XCircle, label: 'Rechazado' },
};

export default function JustificarAusencia() {
 const { usuario } = useAuth();
 const alumnoId = usuario?.alumnoId;

 const [certificados, setCertificados] = useState([]);
 const [cargando, setCargando] = useState(true);
 const [modalNuevo, setModalNuevo] = useState(false);

 useEffect(() => {
 if (alumnoId) cargarCertificados();
 else setCargando(false);
 }, [alumnoId]);

 const cargarCertificados = async () => {
 try {
 setCargando(true);
 const data = await certificadosPresentadosService.listarPorAlumno(alumnoId);
 setCertificados(data);
 } catch (error) {
 toast.error('Error al cargar certificados');
 } finally {
 setCargando(false);
 }
 };

 const eliminar = async (id) => {
 if (!confirm('Eliminar este certificado? Solo se pueden eliminar los pendientes.')) return;
 try {
 await certificadosPresentadosService.eliminar(id);
 toast.success('Certificado eliminado');
 cargarCertificados();
 } catch (error) {
 toast.error(error.response?.data?.message || 'Error al eliminar');
 }
 };

 if (!alumnoId) {
 return (
 <div className="space-y-6">
 <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Justificar Ausencia</h1>
 <Card>
 <div className="p-8 text-center text-muted-foreground font-medium">
 Tu usuario no esta vinculado a un alumno.
 </div>
 </Card>
 </div>
 );
 }

 return (
 <div className="space-y-6">
 <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
 <div>
 <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Justificar Ausencia</h1>
 <p className="text-sm sm:text-base text-muted-foreground font-medium mt-1">
 Presenta certificados para justificar tus faltas
 </p>
 </div>
 <Button onClick={() => setModalNuevo(true)} className="w-full sm:w-auto">
 <Plus className="w-4 h-4 mr-2" />
 Nuevo Certificado
 </Button>
 </div>

 <div className="p-4 rounded-md bg-muted/50 flex items-start gap-3">
 <AlertCircle className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
 <div className="text-xs text-muted-foreground space-y-1">
 <p>Carga tu certificado indicando el rango de fechas que cubre.</p>
 <p>Secretaria lo revisara y aprobara (o rechazara) segun corresponda.</p>
 <p>Si se aprueba, las faltas de esas fechas se marcaran como <strong>justificadas</strong>.</p>
 </div>
 </div>

 <Card>
 {cargando ? (
 <div className="p-8 text-center text-muted-foreground font-medium">Cargando...</div>
 ) : certificados.length === 0 ? (
 <div className="p-12 text-center">
 <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
 <h2 className="text-lg font-bold text-foreground mb-2">
 No tenes certificados presentados
 </h2>
 <p className="text-muted-foreground text-sm mb-4">
 Carga tu primer certificado para justificar una ausencia.
 </p>
 <Button onClick={() => setModalNuevo(true)}>
 <Plus className="w-4 h-4 mr-2" />
 Cargar Certificado
 </Button>
 </div>
 ) : (
 <div className="divide-y divide-border">
 {certificados.map((cert) => {
 const info = ESTADO_BADGE[cert.estado] || ESTADO_BADGE.PENDIENTE;
 const Icon = info.icon;
 return (
 <div
 key={cert.id}
 className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 p-4 hover:bg-muted/30 transition-colors"
 >
 <div className="flex items-start gap-3 min-w-0 flex-1">
 <Icon className={`w-5 h-5 shrink-0 mt-0.5 ${
 cert.estado === 'PENDIENTE' ? 'text-yellow-600' :
 cert.estado === 'APROBADO' ? 'text-green-600' : 'text-red-600'
 }`} />
 <div className="min-w-0">
 <p className="text-sm font-semibold text-foreground">
 {TIPOS.find((t) => t.value === cert.tipo)?.label || cert.tipo}
 </p>
 <p className="text-xs text-muted-foreground mt-0.5 truncate">
 {cert.motivo}
 </p>
 <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
 <Calendar className="w-3 h-3" />
 <span>
 {new Date(cert.fechaDesde).toLocaleDateString('es-AR')} → {new Date(cert.fechaHasta).toLocaleDateString('es-AR')}
 </span>
 </div>
 {cert.observaciones && (
 <p className="text-xs text-muted-foreground mt-1">
 <strong>Observaciones:</strong> {cert.observaciones}
 </p>
 )}
 </div>
 </div>
 <div className="flex items-center gap-2 shrink-0">
 <Badge variant={info.variant}>{info.label}</Badge>
 {cert.estado === 'PENDIENTE' && (
 <Button
 variant="ghost"
 size="icon"
 onClick={() => eliminar(cert.id)}
 title="Eliminar"
 >
 <XCircle className="w-4 h-4 text-destructive" />
 </Button>
 )}
 </div>
 </div>
 );
 })}
 </div>
 )}
 </Card>

 <ModalNuevoCertificado
 open={modalNuevo}
 onClose={() => setModalNuevo(false)}
 alumnoId={alumnoId}
 onCreado={() => {
 setModalNuevo(false);
 cargarCertificados();
 }}
 />
 </div>
 );
}

function ModalNuevoCertificado({ open, onClose, alumnoId, onCreado }) {
 const [form, setForm] = useState({
 tipo: 'MEDICO',
 motivo: '',
 fechaDesde: '',
 fechaHasta: '',
 });
 const [cargando, setCargando] = useState(false);

 useEffect(() => {
 if (open) {
 const hoy = new Date().toISOString().split('T')[0];
 setForm({
 tipo: 'MEDICO',
 motivo: '',
 fechaDesde: hoy,
 fechaHasta: hoy,
 });
 }
 }, [open]);

 const handleSubmit = async (e) => {
 e.preventDefault();
 setCargando(true);
 try {
 await certificadosPresentadosService.crear(alumnoId, form);
 toast.success('Certificado presentado');
 onCreado();
 } catch (error) {
 toast.error(error.response?.data?.message || 'Error al presentar certificado');
 } finally {
 setCargando(false);
 }
 };

 return (
 <Modal open={open} onClose={onClose} title="Presentar Certificado" size="md">
 <form onSubmit={handleSubmit} className="space-y-4">
 <div>
 <label className="block text-sm font-medium mb-1 text-foreground">
 Tipo de certificado
 </label>
 <select
 value={form.tipo}
 onChange={(e) => setForm({ ...form, tipo: e.target.value })}
 className="w-full h-10 px-3 rounded-md border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
 >
 {TIPOS.map((t) => (
 <option key={t.value} value={t.value}>
 {t.label}
 </option>
 ))}
 </select>
 </div>

 <div>
 <label className="block text-sm font-medium mb-1 text-foreground">
 Motivo
 </label>
 <textarea
 value={form.motivo}
 onChange={(e) => setForm({ ...form, motivo: e.target.value })}
 rows={3}
 className="w-full px-3 py-2 rounded-md border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
 placeholder="Describi el motivo del certificado..."
 required
 />
 </div>

 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
 <div>
  <label className="text-sm font-semibold text-foreground mb-1 block">Fecha desde</label>
  <DatePicker value={form.fechaDesde} onChange={(v) => setForm({ ...form, fechaDesde: v })} />
</div>
 <div>
  <label className="text-sm font-semibold text-foreground mb-1 block">Fecha hasta</label>
  <DatePicker value={form.fechaHasta} onChange={(v) => setForm({ ...form, fechaHasta: v })} />
</div>
 </div>

 <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 pt-4 border-t border-border">
 <Button type="button" variant="outline" onClick={onClose} className="w-full sm:w-auto">
 Cancelar
 </Button>
 <Button type="submit" disabled={cargando} className="w-full sm:w-auto">
 {cargando ? 'Presentando...' : 'Presentar'}
 </Button>
 </div>
 </form>
 </Modal>
 );
}