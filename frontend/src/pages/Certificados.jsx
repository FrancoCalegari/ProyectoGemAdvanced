import { useState, useEffect } from 'react';
import { ChevronRight, Home, Plus, Search, Download, Ban, FileText, Award, Users, GraduationCap, Calendar, ArrowLeft, Info, User } from 'lucide-react';
import { toast } from 'sonner';
import { alumnosService } from '../services/alumnos.service';
import { certificadosService } from '../services/certificados.service';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { DatePicker } from '../components/ui/DatePicker';
import api from '../services/api';
import {
 Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
} from '../components/ui/Table';

const TIPOS = [
 { value: 'LABORAL', label: 'Certificado Laboral', requiere: 'none' },
 { value: 'PARA_COLECTIVO', label: 'Certificado para Colectivo', requiere: 'none' },
 { value: 'CONCURRENCIA', label: 'Certificado de Concurrencia', requiere: 'rango' },
 { value: 'PARA_RENDIR', label: 'Certificado para Rendir', requiere: 'none' },
 { value: 'PARCIAL_ANIO', label: 'Certificado Parcial de Año', requiere: 'año' },
 { value: 'TITULO_COMPLETO', label: 'Certificado de Título Completo', requiere: 'none' },
];

const TIPO_LABEL = Object.fromEntries(TIPOS.map((t) => [t.value, t.label]));

export default function Certificados() {
 const [agrupados, setAgrupados] = useState([]);
 const [cargando, setCargando] = useState(true);

 // Navegacion
 const [títuloSel, setTítuloSel] = useState(null);
 const [resoluciónSel, setResoluciónSel] = useState(null);
 const [anioSel, setAnioSel] = useState(null);
 const [alumnoSel, setAlumnoSel] = useState(null);

 // Busqueda global
 const [busqueda, setBusqueda] = useState('');
 const [resultadosBusqueda, setResultadosBusqueda] = useState(null);

 useEffect(() => { cargar(); }, []);

 const cargar = async () => {
 try {
 setCargando(true);
 const data = await alumnosService.listarAgrupados();
 setAgrupados(data);
 } catch (error) {
 toast.error('Error al cargar alumnos');
 } finally {
 setCargando(false);
 }
 };

 const buscarGlobal = async () => {
 if (!busqueda.trim()) { setResultadosBusqueda(null); return; }
 try {
 const data = await alumnosService.listar({ busqueda });
 setResultadosBusqueda(data);
 } catch (error) {
 toast.error('Error en la busqueda');
 }
 };

 useEffect(() => {
 const t = setTimeout(() => {
 if (busqueda.trim()) buscarGlobal();
 else setResultadosBusqueda(null);
 }, 300);
 return () => clearTimeout(t);
 }, [busqueda]);

 const resetNavegacion = () => {
 setTítuloSel(null); setResoluciónSel(null); setAnioSel(null);
 setAlumnoSel(null); setBusqueda(''); setResultadosBusqueda(null);
 };

 const nivelActual = alumnoSel ? 4 : anioSel ? 3 : resoluciónSel ? 2 : títuloSel ? 1 : 0;

 return (
 <div className="space-y-6">
 <div>
 <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Certificados</h1>
 <p className="text-sm sm:text-base text-muted-foreground font-medium mt-1">
 Emiti, anula y descarga certificados en nombre de los alumnos
 </p>
 </div>

 {/* Breadcrumb */}
 {nivelActual > 0 && (
 <div className="flex items-center gap-2 flex-wrap text-sm">
 <button onClick={resetNavegacion} className="flex items-center gap-1 text-primary hover:underline">
 <Home className="w-4 h-4" />
 Carreras
 </button>
 {títuloSel && (
 <>
 <ChevronRight className="w-4 h-4 text-muted-foreground" />
 <button
 onClick={() => { setResoluciónSel(null); setAnioSel(null); setAlumnoSel(null); }}
 className={`${resoluciónSel ? 'text-primary hover:underline' : 'text-foreground font-medium'}`}
 >
 {títuloSel.nombre}
 </button>
 </>
 )}
 {resoluciónSel && (
 <>
 <ChevronRight className="w-4 h-4 text-muted-foreground" />
 <button
 onClick={() => { setAnioSel(null); setAlumnoSel(null); }}
 className={`${anioSel ? 'text-primary hover:underline' : 'text-foreground font-medium'}`}
 >
 Res. {resoluciónSel.código}
 </button>
 </>
 )}
 {anioSel && (
 <>
 <ChevronRight className="w-4 h-4 text-muted-foreground" />
 <button
 onClick={() => setAlumnoSel(null)}
 className={`${alumnoSel ? 'text-primary hover:underline' : 'text-foreground font-medium'}`}
 >
 {anioSel.nombre}
 </button>
 </>
 )}
 {alumnoSel && (
 <>
 <ChevronRight className="w-4 h-4 text-muted-foreground" />
 <span className="text-foreground font-medium">{alumnoSel.apellido}, {alumnoSel.nombre}</span>
 </>
 )}
 </div>
 )}

 {/* Buscador global */}
 <Card>
 <div className="p-4">
 <div className="relative max-w-md">
 <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
 <Input
 placeholder="Buscar por nombre, DNI o email..."
 value={busqueda}
 onChange={(e) => setBusqueda(e.target.value)}
 className="pl-10"
 />
 </div>
 </div>
 {resultadosBusqueda && (
 <div className="border-t border-border max-h-60 overflow-y-auto divide-y divide-border">
 {resultadosBusqueda.length === 0 ? (
 <div className="p-6 text-center text-muted-foreground text-sm">Sin resultados</div>
 ) : (
 resultadosBusqueda.map((a) => (
 <button
 key={a.id}
 onClick={() => { setAlumnoSel(a); setBusqueda(''); setResultadosBusqueda(null); }}
 className="w-full text-left p-3 hover:bg-muted/40"
 >
 <p className="text-sm font-semibold">{a.apellido}, {a.nombre}</p>
 <p className="text-xs text-muted-foreground font-medium">DNI {a.dni}</p>
 </button>
 ))
 )}
 </div>
 )}
 </Card>

 {cargando ? (
 <div className="p-8 text-center text-muted-foreground font-medium">Cargando...</div>
 ) : (
 <>
 {/* Nivel 0: Carreras */}
 {nivelActual === 0 && (
 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
 {agrupados.map((t) => (
 <button key={t.títuloId} onClick={() => setTítuloSel(t)} className="text-left">
 <Card className="hover:border-primary hover:shadow-md transition-all h-full">
 <div className="p-5">
 <div className="flex items-start gap-3 mb-3">
 <div className="p-2 rounded-md bg-primary/10 shrink-0">
 <GraduationCap className="w-5 h-5 text-primary" />
 </div>
 <div className="min-w-0 flex-1">
 <h3 className="text-base font-semibold text-foreground line-clamp-2">{t.nombre}</h3>
 <p className="text-xs text-muted-foreground mt-1">Nivel: {t.nivel}</p>
 </div>
 </div>
 <div className="flex items-center justify-between pt-3 border-t border-border">
 <div className="flex items-center gap-2 text-sm text-muted-foreground">
 <Users className="w-4 h-4" />
 <span>{t.totalAlumnos} alumno{t.totalAlumnos !== 1 ? 's' : ''}</span>
 </div>
 <ChevronRight className="w-4 h-4 text-muted-foreground" />
 </div>
 </div>
 </Card>
 </button>
 ))}
 </div>
 )}

 {/* Nivel 1: Resoluciónes */}
 {nivelActual === 1 && títuloSel && (
 <div className="space-y-3">
 <Button variant="ghost" size="sm" onClick={resetNavegacion}><ArrowLeft className="w-4 h-4 mr-2" />Volver</Button>
 <h2 className="text-lg font-semibold">{títuloSel.nombre}</h2>
 {títuloSel.resoluciónes.map((r) => (
 <button key={r.resoluciónId} onClick={() => setResoluciónSel(r)} className="text-left w-full">
 <Card className="hover:border-primary hover:shadow-md transition-all">
 <div className="p-5 flex items-center justify-between gap-3">
 <div>
 <h3 className="text-base font-semibold">Resolución {r.código}</h3>
 <p className="text-xs text-muted-foreground mt-1">{r.anios.length} anos</p>
 </div>
 <div className="flex items-center gap-3">
 <span className="text-sm font-semibold">{r.totalAlumnos}</span>
 <ChevronRight className="w-4 h-4 text-muted-foreground" />
 </div>
 </div>
 </Card>
 </button>
 ))}
 </div>
 )}

 {/* Nivel 2: Anos */}
 {nivelActual === 2 && resoluciónSel && (
 <div className="space-y-3">
 <Button variant="ghost" size="sm" onClick={() => setResoluciónSel(null)}><ArrowLeft className="w-4 h-4 mr-2" />Volver</Button>
 <h2 className="text-lg font-semibold">Resolución {resoluciónSel.código}</h2>
 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
 {resoluciónSel.anios.map((a) => (
 <button key={a.anioId} onClick={() => setAnioSel(a)} className="text-left">
 <Card className="hover:border-primary hover:shadow-md transition-all h-full">
 <div className="p-5">
 <div className="flex items-start gap-3 mb-3">
 <div className="p-2 rounded-md bg-primary/10 shrink-0">
 <Calendar className="w-5 h-5 text-primary" />
 </div>
 <div>
 <h3 className="text-base font-semibold">{a.nombre}</h3>
 <p className="text-xs text-muted-foreground mt-1">{a.númeroAnio} ano</p>
 </div>
 </div>
 <div className="flex items-center justify-between pt-3 border-t border-border">
 <span className="text-sm text-muted-foreground">{a.totalAlumnos} alumnos</span>
 <ChevronRight className="w-4 h-4 text-muted-foreground" />
 </div>
 </div>
 </Card>
 </button>
 ))}
 </div>
 </div>
 )}

 {/* Nivel 3: Alumnos del año */}
 {nivelActual === 3 && anioSel && (
 <div className="space-y-3">
 <Button variant="ghost" size="sm" onClick={() => setAnioSel(null)}><ArrowLeft className="w-4 h-4 mr-2" />Volver</Button>
 <h2 className="text-lg font-semibold">{anioSel.nombre} — {anioSel.totalAlumnos} alumnos</h2>
 <Card>
 <div className="divide-y divide-border">
 {anioSel.alumnos.map((a) => (
 <button
 key={a.id}
 onClick={() => setAlumnoSel(a)}
 className="w-full text-left p-4 hover:bg-muted/40 transition-colors flex items-center justify-between"
 >
 <div>
 <p className="text-sm font-semibold">{a.apellido}, {a.nombre}</p>
 <p className="text-xs text-muted-foreground font-medium">DNI {a.dni} — {a.email}</p>
 </div>
 <ChevronRight className="w-4 h-4 text-muted-foreground" />
 </button>
 ))}
 </div>
 </Card>
 </div>
 )}

 {/* Nivel 4: Panel del alumno */}
 {nivelActual === 4 && alumnoSel && (
 <PanelCertificadosAlumno
 alumno={alumnoSel}
 onVolver={() => setAlumnoSel(null)}
 onActualizar={cargar}
 />
 )}
 </>
 )}
 </div>
 );
}

function PanelCertificadosAlumno({ alumno, onVolver, onActualizar }) {
 const [certificados, setCertificados] = useState([]);
 const [inscripciones, setInscripciones] = useState([]);
 const [cargando, setCargando] = useState(true);
 const [modalEmitir, setModalEmitir] = useState(false);

 useEffect(() => {
 if (alumno?.id) cargarTodo();
 }, [alumno?.id]);

 const cargarTodo = async () => {
 try {
 setCargando(true);
 const [certs, inscr] = await Promise.all([
 certificadosService.listarPorAlumno(alumno.id),
 alumnosService.listarInscripciones(alumno.id),
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

 const anular = async (cert) => {
 if (!confirm(`Anular el certificado "${TIPO_LABEL[cert.tipo] || cert.tipo}"?`)) return;
 try {
 await certificadosService.anular(cert.id);
 toast.success('Certificado anulado');
 cargarTodo();
 } catch (error) {
 toast.error(error.response?.data?.message || 'Error al anular');
 }
 };

 const inscripcionActiva = inscripciones.find((i) => i.estado === 'ACTIVA') || inscripciones[0];

 return (
 <div className="space-y-4">
 <Button variant="ghost" size="sm" onClick={onVolver}><ArrowLeft className="w-4 h-4 mr-2" />Volver</Button>

 <Card>
 <div className="p-4 sm:p-6 border-b border-border">
 <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
 <div className="min-w-0">
 <h2 className="text-lg sm:text-xl font-semibold text-foreground truncate">
 {alumno.apellido}, {alumno.nombre}
 </h2>
 <p className="text-xs sm:text-sm text-muted-foreground">
 DNI {alumno.dni} — {alumno.email}
 </p>
 </div>
 <Button
 onClick={() => setModalEmitir(true)}
 className="w-full sm:w-auto shrink-0"
 disabled={!inscripcionActiva}
 >
 <Plus className="w-4 h-4 mr-2" />
 Emitir Certificado
 </Button>
 </div>

 {inscripcionActiva && (
 <div className="mt-3 p-3 rounded-md bg-muted/50 flex items-start gap-2">
 <Info className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
 <div className="text-xs text-muted-foreground font-medium">
 <strong>Inscripto en:</strong> {inscripcionActiva.título?.nombre}
 <span className="mx-1"></span>
 <strong>Resolución:</strong> {inscripcionActiva.resolución?.código}
 </div>
 </div>
 )}
 </div>

 {cargando ? (
 <div className="p-8 text-center text-muted-foreground font-medium">Cargando...</div>
 ) : certificados.length === 0 ? (
 <div className="p-12 text-center">
 <Award className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
 <h3 className="text-lg font-bold text-foreground mb-2">Sin certificados emitidos</h3>
 <p className="text-muted-foreground text-sm">
 Este alumno todavia no tiene certificados. Emiti el primero.
 </p>
 </div>
 ) : (
 <Table>
 <TableHeader>
 <TableRow>
 <TableHead>Tipo</TableHead>
 <TableHead>Título</TableHead>
 <TableHead>Fecha</TableHead>
 <TableHead>Estado</TableHead>
 <TableHead className="text-right">Acciones</TableHead>
 </TableRow>
 </TableHeader>
 <TableBody>
 {certificados.map((cert) => (
 <TableRow key={cert.id}>
 <TableCell>
 <div className="flex items-center gap-2">
 <FileText className="w-4 h-4 text-primary shrink-0" />
 <span className="text-sm font-semibold">{TIPO_LABEL[cert.tipo] || cert.tipo}</span>
 </div>
 </TableCell>
 <TableCell className="text-sm">
 <div className="min-w-0">
 <p className="truncate">{cert.título?.nombre}</p>
 {cert.anioCurricular && (
 <p className="text-xs text-muted-foreground font-medium">{cert.anioCurricular.nombre}</p>
 )}
 </div>
 </TableCell>
 <TableCell className="text-sm whitespace-nowrap">
 {new Date(cert.fechaEmision).toLocaleDateString('es-AR')}
 </TableCell>
 <TableCell>
 <Badge variant={cert.estado === 'EMITIDO' ? 'success' : 'danger'}>
 {cert.estado}
 </Badge>
 </TableCell>
 <TableCell className="text-right">
 <div className="flex justify-end gap-1">
 <Button variant="ghost" size="icon" onClick={() => descargar(cert)} disabled={cert.estado !== 'EMITIDO'} title="Descargar PDF">
 <Download className="w-4 h-4" />
 </Button>
 <Button variant="ghost" size="icon" onClick={() => anular(cert)} disabled={cert.estado === 'ANULADO'} title="Anular">
 <Ban className="w-4 h-4 text-destructive" />
 </Button>
 </div>
 </TableCell>
 </TableRow>
 ))}
 </TableBody>
 </Table>
 )}
 </Card>

 <ModalEmitir
 open={modalEmitir}
 onClose={() => setModalEmitir(false)}
 alumno={alumno}
 inscripciones={inscripciones}
 onEmitido={() => {
 setModalEmitir(false);
 cargarTodo();
 onActualizar?.();
 }}
 />
 </div>
 );
}

function ModalEmitir({ open, onClose, alumno, inscripciones, onEmitido }) {
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
 const aniosDisponibles = inscripcionActiva?.resolución?.aniosCurriculares || [];

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
 const { data } = await api.post(`/alumnos/${alumno.id}/certificados/preview-concurrencia`, {
 fechaDesde, fechaHasta,
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
 await certificadosService.solicitar(alumno.id, payload);
 toast.success('Certificado emitido');
 onEmitido();
 } catch (error) {
 const msg = error.response?.data?.message || 'Error al emitir certificado';
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
 <Modal open={open} onClose={onClose} title="Emitir Certificado" size="md">
 <form onSubmit={handleSubmit} className="space-y-4">
 <div className="p-3 rounded-md bg-muted/50">
 <p className="text-xs text-muted-foreground font-medium">Alumno</p>
 <p className="text-sm font-semibold">{alumno.apellido}, {alumno.nombre} — DNI {alumno.dni}</p>
 {inscripcionActiva && (
 <p className="text-xs text-muted-foreground mt-1">Inscripto en: {inscripcionActiva.título?.nombre}</p>
 )}
 </div>

 <div>
 <label className="block text-sm font-medium mb-1 text-foreground">Tipo de certificado</label>
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
 <label className="block text-sm font-medium mb-1 text-foreground">Año curricular</label>
 <select
 value={anioCurricularId}
 onChange={(e) => setAnioCurricularId(e.target.value)}
 className="w-full h-10 px-3 rounded-md border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
 required
 >
 <option value="">— Selecciona un año —</option>
 {aniosDisponibles.map((a) => (
 <option key={a.id} value={a.id}>{a.nombre} ({a.númeroAnio} ano)</option>
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

 {tipo === 'CONCURRENCIA' && preview && (
 <div className="p-3 rounded-md bg-primary/5 border border-primary/20">
 <p className="text-sm font-medium mb-2 flex items-center gap-2">
 <Calendar className="w-4 h-4" />Preview del rango
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
 <p className="text-sm font-medium text-destructive mb-2">Requisitos no cumplidos:</p>
 <ul className="text-xs text-destructive space-y-1 max-h-40 overflow-y-auto">
 {errorDetalle.faltantes.map((f, i) => (
 <li key={i}>
 {f.código && <strong>{f.código}</strong>} {f.nombre && `— ${f.nombre}`}
 {f.motivo && ` (${f.motivo})`}
 {f.porcentaje !== undefined && ` — Asistencia: ${f.porcentaje}% (minimo ${f.minimoRequerido}%)`}
 </li>
 ))}
 </ul>
 </div>
 )}

 <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 pt-4 border-t border-border">
 <Button type="button" variant="outline" onClick={onClose} className="w-full sm:w-auto">Cancelar</Button>
 <Button type="submit" disabled={cargando || !puedeEnviar()} className="w-full sm:w-auto">
 {cargando ? 'Emitiendo...' : 'Emitir'}
 </Button>
 </div>
 </form>
 </Modal>
 );
}