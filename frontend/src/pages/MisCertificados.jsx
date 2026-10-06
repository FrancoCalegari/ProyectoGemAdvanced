import { useState, useEffect } from 'react';
import { Award, Download, FileText, Plus, Info, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../contexts/AuthContext';
import { certificadosService } from '../services/certificados.service';
import { alumnosService } from '../services/alumnos.service';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { DatePicker } from '../components/ui/DatePicker';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import api from '../services/api';

const TIPOS = [
 { value: 'LABORAL', label: 'Certificado Laboral', requiere: 'none' },
 { value: 'PARA_COLECTIVO', label: 'Certificado para Colectivo', requiere: 'none' },
 { value: 'CONCURRENCIA', label: 'Certificado de Concurrencia', requiere: 'rango' },
 { value: 'PARA_RENDIR', label: 'Certificado para Rendir', requiere: 'none' },
 { value: 'PARCIAL_ANIO', label: 'Certificado Parcial de Año', requiere: 'año' },
 { value: 'TITULO_COMPLETO', label: 'Certificado de Título Completo', requiere: 'none' },
];

export default function MisCertificados() {
 const { usuario } = useAuth();
 const alumnoId = usuario?.alumnoId;

 const [certificados, setCertificados] = useState([]);
 const [inscripciones, setInscripciones] = useState([]);
 const [cargando, setCargando] = useState(true);
 const [modalSolicitar, setModalSolicitar] = useState(false);

 useEffect(() => {
 if (alumnoId) cargarTodo();
 else setCargando(false);
 }, [alumnoId]);

 const cargarTodo = async () => {
 try {
 setCargando(true);
 const [certs, inscr] = await Promise.all([
 certificadosService.listarPorAlumno(alumnoId),
 alumnosService.listarInscripciones(alumnoId),
 ]);
 setCertificados(certs);
 setInscripciones(inscr);
 } catch (error) {
 toast.error('Error al cargar datos');
 } finally {
 setCargando(false);
 }
 };

 const descargar = async (cert) => {
 try {
 toast.info('Generando PDF...');
 await certificadosService.descargarPDF(cert.id);
 toast.success('PDF descargado');
 } catch (error) {
 toast.error(error.response?.data?.message || 'Error al descargar PDF');
 }
 };

 if (!alumnoId) {
 return (
 <div className="space-y-6">
 <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Mis Certificados</h1>
 <Card>
 <div className="p-8 text-center text-muted-foreground font-medium">
 Tu usuario no esta vinculado a un alumno.
 </div>
 </Card>
 </div>
 );
 }

 const inscripcionActiva = inscripciones.find((i) => i.estado === 'ACTIVA') || inscripciones[0];

 return (
 <div className="space-y-6">
 <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
 <div>
 <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Mis Certificados</h1>
 <p className="text-sm sm:text-base text-muted-foreground font-medium mt-1">
 Consulta, solicita y descarga tus certificados academicos
 </p>
 </div>
 <Button onClick={() => setModalSolicitar(true)} className="w-full sm:w-auto" disabled={!inscripcionActiva}>
 <Plus className="w-4 h-4 mr-2" />
 Solicitar Certificado
 </Button>
 </div>

 {inscripcionActiva && (
 <Card>
 <div className="p-4 sm:p-6">
 <div className="flex items-start gap-3">
 <Info className="w-5 h-5 text-primary shrink-0 mt-0.5" />
 <div className="min-w-0 flex-1">
 <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
 Estas inscripto en
 </p>
 <p className="text-base sm:text-lg font-semibold text-foreground truncate">
 {inscripcionActiva.titulo?.nombre}
 </p>
 <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-muted-foreground">
 <span><strong>Resolución:</strong> {inscripcionActiva.resolucion?.codigo}</span>
 <span><strong>Nivel:</strong> {inscripcionActiva.titulo?.nivel}</span>
 <span><strong>Estado:</strong> {inscripcionActiva.estado}</span>
 </div>
 </div>
 </div>
 </div>
 </Card>
 )}

 <Card>
 {cargando ? (
 <div className="p-8 text-center text-muted-foreground font-medium">Cargando...</div>
 ) : certificados.length === 0 ? (
 <div className="p-12 text-center">
 <Award className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
 <h2 className="text-lg font-bold text-foreground mb-2">
 No tenes certificados emitidos
 </h2>
 <p className="text-muted-foreground text-sm max-w-md mx-auto mb-4">
 Solicita tu primer certificado y aparecera aca para descargar.
 </p>
 <Button onClick={() => setModalSolicitar(true)} disabled={!inscripcionActiva}>
 <Plus className="w-4 h-4 mr-2" />
 Solicitar Certificado
 </Button>
 </div>
 ) : (
 <div className="divide-y divide-border">
 {certificados.map((cert) => (
 <div
 key={cert.id}
 className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 hover:bg-muted/30 transition-colors"
 >
 <div className="flex items-start gap-3 min-w-0">
 <FileText className="w-5 h-5 text-primary shrink-0 mt-0.5" />
 <div className="min-w-0">
 <p className="font-medium text-foreground truncate">
 {TIPOS.find((t) => t.value === cert.tipo)?.label || cert.tipo}
 </p>
 <p className="text-xs text-muted-foreground truncate">
 {cert.titulo?.nombre}
 {cert.anioCurricular ? ` - ${cert.anioCurricular.nombre}` : ''}
 </p>
 <p className="text-xs text-muted-foreground mt-0.5">
 Emitido: {new Date(cert.fechaEmision).toLocaleDateString('es-AR')}
 </p>
 </div>
 </div>
 <div className="flex items-center gap-2 shrink-0">
 <Badge variant={cert.estado === 'EMITIDO' ? 'success' : 'danger'}>
 {cert.estado}
 </Badge>
 <Button
 variant="outline"
 size="sm"
 onClick={() => descargar(cert)}
 disabled={cert.estado !== 'EMITIDO'}
 >
 <Download className="w-4 h-4 mr-1" />
 PDF
 </Button>
 </div>
 </div>
 ))}
 </div>
 )}
 </Card>

 <ModalSolicitar
 open={modalSolicitar}
 onClose={() => setModalSolicitar(false)}
 alumnoId={alumnoId}
 inscripciones={inscripciones}
 onCreado={() => {
 setModalSolicitar(false);
 cargarTodo();
 }}
 />
 </div>
 );
}

function ModalSolicitar({ open, onClose, alumnoId, inscripciones, onCreado }) {
 const inscripcionActiva = inscripciones.find((i) => i.estado === 'ACTIVA') || inscripciones[0];

 const [tipo, setTipo] = useState('LABORAL');
 const [anioCurricularId, setAnioCurricularId] = useState('');
 const [fechaDesde, setFechaDesde] = useState('');
 const [fechaHasta, setFechaHasta] = useState('');
 const [preview, setPreview] = useState(null);
 const [cargando, setCargando] = useState(false);
 const [cargandoPreview, setCargandoPreview] = useState(false);
 const [errorDetalle, setErrorDetalle] = useState(null);

 const tipoInfo = TIPOS.find((t) => t.value === tipo);
 const aniosDisponibles = inscripcionActiva?.resolucion?.aniosCurriculares || [];

 useEffect(() => {
 if (open) {
 setTipo('LABORAL');
 setAnioCurricularId('');
 setFechaDesde('');
 setFechaHasta('');
 setPreview(null);
 setErrorDetalle(null);
 }
 }, [open]);

 useEffect(() => {
 if (tipo === 'CONCURRENCIA' && fechaDesde && fechaHasta) {
 cargarPreview();
 } else {
 setPreview(null);
 }
 }, [tipo, fechaDesde, fechaHasta]);

 const cargarPreview = async () => {
 setCargandoPreview(true);
 try {
 const { data } = await api.post(`/alumnos/${alumnoId}/certificados/preview-concurrencia`, {
 fechaDesde,
 fechaHasta,
 });
 setPreview(data);
 } catch (error) {
 setPreview(null);
 } finally {
 setCargandoPreview(false);
 }
 };

 const handleSubmit = async (e) => {
 e.preventDefault();
 setCargando(true);
 setErrorDetalle(null);

 try {
 const payload = { tipo };
 if (tipo === 'PARCIAL_ANIO') payload.anioCurricularId = anioCurricularId;
 if (tipo === 'CONCURRENCIA') {
 payload.fechaDesde = fechaDesde;
 payload.fechaHasta = fechaHasta;
 }

 await certificadosService.solicitar(alumnoId, payload);
 toast.success('Certificado solicitado exitosamente');
 onCreado();
 } catch (error) {
 const msg = error.response?.data?.message || 'Error al solicitar certificado';
 const details = error.response?.data?.details;
 toast.error(msg);
 if (details) setErrorDetalle(details);
 } finally {
 setCargando(false);
 }
 };

 const puedeEnviar = () => {
 if (tipo === 'PARCIAL_ANIO') return !!anioCurricularId;
 if (tipo === 'CONCURRENCIA') return !!fechaDesde && !!fechaHasta;
 return true;
 };

 return (
 <Modal open={open} onClose={onClose} title="Solicitar Certificado" size="md">
 <form onSubmit={handleSubmit} className="space-y-4">
 {inscripcionActiva && (
 <div className="p-3 rounded-md bg-muted/50">
 <p className="text-xs text-muted-foreground mb-1">Inscripción</p>
 <p className="text-sm font-semibold text-foreground">
 {inscripcionActiva.titulo?.nombre}
 </p>
 <p className="text-xs text-muted-foreground font-medium">
 Resolución {inscripcionActiva.resolucion?.codigo}
 </p>
 </div>
 )}

 <div>
 <label className="block text-sm font-medium mb-1 text-foreground">
 Tipo de certificado
 </label>
 <select
 value={tipo}
 onChange={(e) => setTipo(e.target.value)}
 className="w-full h-10 px-3 rounded-md border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
 >
 {TIPOS.map((t) => (
 <option key={t.value} value={t.value}>{t.label}</option>
 ))}
 </select>
 </div>

 {tipoInfo?.requiere === 'año' && (
 <div>
 <label className="block text-sm font-medium mb-1 text-foreground">
 Ano curricular
 </label>
 <select
 value={anioCurricularId}
 onChange={(e) => setAnioCurricularId(e.target.value)}
 className="w-full h-10 px-3 rounded-md border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
 required
 >
 <option value="">— Selecciona un año —</option>
 {aniosDisponibles.map((a) => (
 <option key={a.id} value={a.id}>{a.nombre} ({a.numeroAnio} ano)</option>
 ))}
 </select>
 </div>
 )}

 {tipoInfo?.requiere === 'rango' && (
 <div className="grid grid-cols-2 gap-3">
 <div>
  <label className="text-sm font-semibold text-foreground mb-1 block">Desde</label>
  <DatePicker value={fechaDesde} onChange={(v) => setFechaDesde(v)} />
</div>
 <div>
  <label className="text-sm font-semibold text-foreground mb-1 block">Hasta</label>
  <DatePicker value={fechaHasta} onChange={(v) => setFechaHasta(v)} />
</div>
 </div>
 )}

 {tipo === 'CONCURRENCIA' && cargandoPreview && (
 <p className="text-xs text-muted-foreground font-medium">Cargando preview...</p>
 )}
 {tipo === 'CONCURRENCIA' && preview && (
 <div className="p-3 rounded-md bg-primary/5 border border-primary/20">
 <p className="text-sm font-medium mb-2 flex items-center gap-2">
 <Calendar className="w-4 h-4" />
 Preview del rango
 </p>
 <div className="grid grid-cols-2 gap-2 text-xs">
 <div>Total: <strong>{preview.asistencias.total}</strong></div>
 <div>Presentes: <strong className="text-green-600">{preview.asistencias.presentes}</strong></div>
 <div>Justificados: <strong className="text-yellow-600">{preview.asistencias.justificados}</strong></div>
 <div>Ausentes: <strong className="text-red-600">{preview.asistencias.ausentes}</strong></div>
 <div className="col-span-2">
 Asistencia: <strong>{preview.asistencias.porcentaje}%</strong>
 {preview.asistencias.porcentaje < 75 && (
 <span className="text-destructive ml-2">(minimo 75%)</span>
 )}
 </div>
 </div>
 </div>
 )}

 {errorDetalle?.faltantes?.length > 0 && (
 <div className="p-3 rounded-md bg-destructive/10 border border-destructive/30">
 <p className="text-sm font-medium text-destructive mb-2">
 Requisitos no cumplidos:
 </p>
 <ul className="text-xs text-destructive space-y-1 max-h-40 overflow-y-auto">
 {errorDetalle.faltantes.map((f, i) => (
 <li key={i}>
 {f.codigo && <strong>{f.codigo}</strong>} {f.nombre && `— ${f.nombre}`}
 {f.motivo && ` (${f.motivo})`}
 {f.porcentaje !== undefined && ` — Asistencia: ${f.porcentaje}% (minimo ${f.minimoRequerido}%)`}
 </li>
 ))}
 </ul>
 </div>
 )}

 <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 pt-4 border-t border-border">
 <Button type="button" variant="outline" onClick={onClose} className="w-full sm:w-auto">
 Cancelar
 </Button>
 <Button type="submit" disabled={cargando || !puedeEnviar()} className="w-full sm:w-auto">
 {cargando ? 'Solicitando...' : 'Solicitar'}
 </Button>
 </div>
 </form>
 </Modal>
 );
}