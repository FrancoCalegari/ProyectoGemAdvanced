import { useState, useEffect } from 'react';
import { Search, User, Calendar, CheckCircle2, XCircle, AlertCircle, TrendingUp, Plus, Trash2, AlertTriangle, ChevronRight, Home, ArrowLeft, GraduationCap, Users } from 'lucide-react';
import { toast } from 'sonner';
import { alumnosService } from '../services/alumnos.service';
import { cursadasService, asistenciaService } from '../services/cursadas.service';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { DatePicker } from '../components/ui/DatePicker';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';

const ESTADO_ASISTENCIA = [
 { value: 'PRESENTE', label: 'Presente', icon: CheckCircle2, color: 'text-green-600' },
 { value: 'AUSENTE', label: 'Ausente', icon: XCircle, color: 'text-red-600' },
 { value: 'JUSTIFICADO', label: 'Justificado', icon: AlertCircle, color: 'text-yellow-600' },
];

const ESTADO_BADGE = {
 PRESENTE: 'success', AUSENTE: 'danger', JUSTIFICADO: 'warning',
};

const DIAS_ALERTA_FALTAS = 5;

export default function Asistencia() {
 const [agrupados, setAgrupados] = useState([]);
 const [cargando, setCargando] = useState(true);
 const [títuloSel, setTítuloSel] = useState(null);
 const [resoluciónSel, setResoluciónSel] = useState(null);
 const [anioSel, setAnioSel] = useState(null);
 const [alumnoSel, setAlumnoSel] = useState(null);

 // Busqueda global
 const [busqueda, setBusqueda] = useState('');
 const [resultadosBusqueda, setResultadosBusqueda] = useState(null);

 useEffect(() => { cargarAgrupados(); }, []);

 const cargarAgrupados = async () => {
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
 <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Asistencia</h1>
 <p className="text-sm sm:text-base text-muted-foreground font-medium mt-1">
 Carga y consulta la asistencia de cada cursada
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

 {/* Contenido por nivel */}
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
 <p className="text-xs text-muted-foreground font-medium">DNI {a.dni}</p>
 </div>
 <ChevronRight className="w-4 h-4 text-muted-foreground" />
 </button>
 ))}
 </div>
 </Card>
 </div>
 )}

 {/* Nivel 4: Cursadas del alumno */}
 {nivelActual === 4 && alumnoSel && (
 <PanelAsistenciaAlumno
 alumno={alumnoSel}
 onVolver={() => setAlumnoSel(null)}
 />
 )}
 </>
 )}
 </div>
 );
}

function PanelAsistenciaAlumno({ alumno, onVolver }) {
 const [inscripciones, setInscripciones] = useState([]);
 const [cargando, setCargando] = useState(true);
 const [cursadaSel, setCursadaSel] = useState(null);

 useEffect(() => {
 if (alumno?.id) cargar();
 }, [alumno?.id]);

 const cargar = async () => {
 try {
 setCargando(true);
 const data = await alumnosService.listarInscripciones(alumno.id);
 setInscripciones(data);
 } catch (error) {
 toast.error('Error al cargar inscripciones');
 } finally {
 setCargando(false);
 }
 };

 if (cursadaSel) {
 return <PanelCursada cursada={cursadaSel} onVolver={() => setCursadaSel(null)} />;
 }

 return (
 <div className="space-y-4">
 <Button variant="ghost" size="sm" onClick={onVolver}><ArrowLeft className="w-4 h-4 mr-2" />Volver</Button>

 <div className="p-4 rounded-md bg-muted/50">
 <p className="text-sm font-semibold">{alumno.apellido}, {alumno.nombre}</p>
 <p className="text-xs text-muted-foreground font-medium">DNI {alumno.dni}</p>
 </div>

 {cargando ? (
 <Card><div className="p-8 text-center text-muted-foreground font-medium">Cargando...</div></Card>
 ) : inscripciones.length === 0 ? (
 <Card><div className="p-8 text-center text-muted-foreground font-medium">Sin Inscripciones</div></Card>
 ) : (
 inscripciones.map((insc) => (
 <CardInscripcion key={insc.id} inscripcion={insc} onCursadaClick={setCursadaSel} />
 ))
 )}
 </div>
 );
}

function CardInscripcion({ inscripcion, onCursadaClick }) {
 const [cursadas, setCursadas] = useState([]);
 const [cargando, setCargando] = useState(true);

 useEffect(() => {
 if (inscripcion?.id) cargarCursadas();
 }, [inscripcion?.id]);

 const cargarCursadas = async () => {
 try {
 setCargando(true);
 const data = await cursadasService.listarPorInscripcion(inscripcion.id);
 setCursadas(data);
 } catch (error) {
 toast.error('Error al cargar materias');
 } finally {
 setCargando(false);
 }
 };

 return (
 <Card>
 <div className="p-4 border-b border-border">
 <h3 className="text-base font-semibold truncate">{inscripcion.título?.nombre}</h3>
 <p className="text-xs text-muted-foreground font-medium">Resolución: {inscripcion.resolución?.código}</p>
 </div>
 {cargando ? (
 <div className="p-6 text-center text-muted-foreground text-sm">Cargando...</div>
 ) : cursadas.length === 0 ? (
 <div className="p-6 text-center text-muted-foreground text-sm">Sin cursadas registradas</div>
 ) : (
 <div className="divide-y divide-border">
 {cursadas.map((c) => (
 <button
 key={c.id}
 onClick={() => onCursadaClick(c)}
 className="w-full text-left p-3 hover:bg-muted/40 transition-colors flex items-center justify-between"
 >
 <div className="min-w-0">
 <p className="text-sm font-medium truncate">{c.materia?.nombre}</p>
 <p className="text-xs text-muted-foreground font-medium">{c.materia?.código}</p>
 </div>
 <Badge variant={c.estado === 'APROBADA' ? 'success' : 'default'}>{c.estado}</Badge>
 </button>
 ))}
 </div>
 )}
 </Card>
 );
}

function PanelCursada({ cursada, onVolver }) {
 const [asistencias, setAsistencias] = useState([]);
 const [resumen, setResumen] = useState(null);
 const [cargando, setCargando] = useState(true);
 const [modalNueva, setModalNueva] = useState(false);

 useEffect(() => {
 if (cursada?.id) cargarDatos();
 }, [cursada?.id]);

 const cargarDatos = async () => {
 try {
 setCargando(true);
 const [a, r] = await Promise.all([
 asistenciaService.listarPorCursada(cursada.id),
 asistenciaService.resumen(cursada.id),
 ]);
 setAsistencias(a);
 setResumen(r);
 } catch (error) {
 toast.error('Error al cargar asistencias');
 } finally {
 setCargando(false);
 }
 };

 const eliminar = async (id) => {
 if (!confirm('Eliminar esta asistencia?')) return;
 try {
 await asistenciaService.eliminar(id);
 toast.success('Asistencia eliminada');
 cargarDatos();
 } catch (error) {
 toast.error('Error al eliminar');
 }
 };

 // Detectar 5+ AUSENTE consecutivos
 let consecutivos = 0, maxConsecutivos = 0;
 for (const a of asistencias) {
 if (a.estado === 'AUSENTE') { consecutivos++; maxConsecutivos = Math.max(maxConsecutivos, consecutivos); }
 else consecutivos = 0;
 }
 const hayAlerta = maxConsecutivos >= DIAS_ALERTA_FALTAS;

 return (
 <div className="space-y-4">
 <Button variant="ghost" size="sm" onClick={onVolver}><ArrowLeft className="w-4 h-4 mr-2" />Volver</Button>

 <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
 <div className="min-w-0">
 <h2 className="text-lg sm:text-xl font-semibold truncate">{cursada.materia?.nombre}</h2>
 <p className="text-xs text-muted-foreground font-medium">{cursada.materia?.código}</p>
 </div>
 <Button onClick={() => setModalNueva(true)} className="w-full sm:w-auto shrink-0">
 <Plus className="w-4 h-4 mr-2" />Nueva asistencia
 </Button>
 </div>

 {resumen && (
 <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
 <StatBox icon={TrendingUp} label="Asistencia" value={`${resumen.porcentajeAsistencia}%`} color="text-primary" />
 <StatBox icon={CheckCircle2} label="Presentes" value={resumen.presentes} color="text-green-600" />
 <StatBox icon={XCircle} label="Ausentes" value={resumen.ausentes} color="text-red-600" />
 <StatBox icon={AlertCircle} label="Justificados" value={resumen.justificados} color="text-yellow-600" />
 </div>
 )}

 {hayAlerta && (
 <div className="p-4 rounded-md bg-destructive/10 border border-destructive/30 flex items-start gap-3">
 <AlertTriangle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
 <div>
 <p className="text-sm font-semibold text-destructive">Alerta de inasistencia</p>
 <p className="text-xs text-destructive/90 mt-1">
 El alumno acumulo {maxConsecutivos} dias consecutivos sin asistir sin justificar.
 Se recomienda contactar al alumno o revisar su situacion.
 </p>
 </div>
 </div>
 )}

 <Card>
 {cargando ? (
 <div className="p-8 text-center text-muted-foreground font-medium">Cargando...</div>
 ) : asistencias.length === 0 ? (
 <div className="p-12 text-center">
 <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
 <h3 className="text-lg font-semibold mb-2">Sin asistencias registradas</h3>
 <p className="text-muted-foreground text-sm">Empeza cargando la primera asistencia.</p>
 </div>
 ) : (
 <div className="divide-y divide-border">
 {asistencias.map((a) => {
 const info = ESTADO_ASISTENCIA.find((e) => e.value === a.estado);
 const Icon = info?.icon || Calendar;
 return (
 <div key={a.id} className="flex items-center justify-between gap-3 p-3 hover:bg-muted/30 transition-colors">
 <div className="flex items-center gap-3 min-w-0">
 <Icon className={`w-5 h-5 shrink-0 ${info?.color || ''}`} />
 <div className="min-w-0">
 <p className="text-sm font-semibold">
 {new Date(a.fecha).toLocaleDateString('es-AR', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' })}
 </p>
 {a.observaciones && (
 <p className="text-xs text-muted-foreground truncate">{a.observaciones}</p>
 )}
 </div>
 </div>
 <div className="flex items-center gap-2 shrink-0">
 <Badge variant={ESTADO_BADGE[a.estado] || 'muted'}>{info?.label || a.estado}</Badge>
 <Button variant="ghost" size="icon" onClick={() => eliminar(a.id)} title="Eliminar">
 <Trash2 className="w-4 h-4 text-destructive" />
 </Button>
 </div>
 </div>
 );
 })}
 </div>
 )}
 </Card>

 <ModalNuevaAsistencia
 open={modalNueva}
 onClose={() => setModalNueva(false)}
 cursadaId={cursada.id}
 onCreada={() => { setModalNueva(false); cargarDatos(); }}
 />
 </div>
 );
}

function StatBox({ icon: Icon, label, value, color }) {
 return (
 <div className="p-3 rounded-md border border-border bg-card">
 <div className="flex items-center gap-2 mb-1">
 <Icon className={`w-4 h-4 ${color || 'text-foreground'}`} />
 <p className="text-xs text-muted-foreground font-medium">{label}</p>
 </div>
 <p className="text-lg sm:text-xl font-bold text-foreground">{value}</p>
 </div>
 );
}

function ModalNuevaAsistencia({ open, onClose, cursadaId, onCreada }) {
 const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);
 const [estado, setEstado] = useState('PRESENTE');
 const [observaciones, setObservaciones] = useState('');
 const [cargando, setCargando] = useState(false);

 useEffect(() => {
 if (open) {
 setFecha(new Date().toISOString().split('T')[0]);
 setEstado('PRESENTE');
 setObservaciones('');
 }
 }, [open]);

 const handleSubmit = async (e) => {
 e.preventDefault();
 setCargando(true);
 try {
 await asistenciaService.registrar(cursadaId, { fecha, estado, observaciones: observaciones || null });
 toast.success('Asistencia registrada');
 onCreada();
 } catch (error) {
 toast.error(error.response?.data?.message || 'Error al registrar asistencia');
 } finally {
 setCargando(false);
 }
 };

 return (
 <Modal open={open} onClose={onClose} title="Nueva Asistencia" size="md">
 <form onSubmit={handleSubmit} className="space-y-4">
 <div>
  <label className="text-sm font-semibold text-foreground mb-1 block">Fecha</label>
  <DatePicker value={fecha} onChange={(v) => setFecha(v)} />
</div>
 <div>
 <label className="block text-sm font-medium mb-1 text-foreground">Estado</label>
 <div className="grid grid-cols-3 gap-2">
 {ESTADO_ASISTENCIA.map((e) => {
 const Icon = e.icon;
 const activo = estado === e.value;
 return (
 <button
 key={e.value}
 type="button"
 onClick={() => setEstado(e.value)}
 className={`flex flex-col items-center gap-1 p-3 rounded-md border transition-colors ${
 activo ? 'border-primary bg-primary/10 text-primary' : 'border-border hover:bg-muted/40'
 }`}
 >
 <Icon className={`w-5 h-5 ${activo ? '' : e.color}`} />
 <span className="text-xs font-medium">{e.label}</span>
 </button>
 );
 })}
 </div>
 </div>
 <div>
 <label className="block text-sm font-medium mb-1 text-foreground">Observaciones (opcional)</label>
 <textarea
 value={observaciones}
 onChange={(e) => setObservaciones(e.target.value)}
 rows={3}
 className="w-full px-3 py-2 rounded-md border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
 placeholder="Ej: certificado medico presentado"
 />
 </div>
 <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 pt-4 border-t border-border">
 <Button type="button" variant="outline" onClick={onClose} className="w-full sm:w-auto">Cancelar</Button>
 <Button type="submit" disabled={cargando} className="w-full sm:w-auto">
 {cargando ? 'Guardando...' : 'Guardar'}
 </Button>
 </div>
 </form>
 </Modal>
 );
}