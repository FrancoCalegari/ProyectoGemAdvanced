import { useState, useEffect } from 'react';
import { ChevronRight, Home, Plus, Search, BookOpen, TrendingUp, CheckCircle2, AlertCircle, Calendar, AlertTriangle, GraduationCap, Users, ArrowLeft, User } from 'lucide-react';
import { toast } from 'sonner';
import { alumnosService } from '../services/alumnos.service';
import { cursadasService, asistenciaService } from '../services/cursadas.service';
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

const ESTADOS_CURSADA = [
 { value: 'EN_CURSO', label: 'En curso' },
 { value: 'REGULAR', label: 'Regular' },
 { value: 'APROBADA', label: 'Aprobada' },
 { value: 'LIBRE', label: 'Libre' },
 { value: 'DESAPROBADA', label: 'Desaprobada' },
];

const ESTADO_BADGE = {
 APROBADA: 'success', REGULAR: 'warning', EN_CURSO: 'default',
 LIBRE: 'muted', DESAPROBADA: 'danger', NO_CURSADA: 'muted',
};

const DIAS_ALERTA_FALTAS = 5;

export default function Cursadas() {
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
 <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Materias en Curso</h1>
 <p className="text-sm sm:text-base text-muted-foreground font-medium mt-1">
 Registra cursadas y consulta el estado academico de cada alumno
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
 <PanelCursadasAlumno
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

function PanelCursadasAlumno({ alumno, onVolver, onActualizar }) {
 const [inscripciones, setInscripciones] = useState([]);
 const [stats, setStats] = useState(null);
 const [alertas, setAlertas] = useState([]);
 const [cargando, setCargando] = useState(true);
 const [modalRegistrar, setModalRegistrar] = useState(false);

 useEffect(() => {
 if (alumno?.id) cargarTodo();
 }, [alumno?.id]);

 const cargarTodo = async () => {
 try {
 setCargando(true);
 const [inscr, hist] = await Promise.all([
 alumnosService.listarInscripciones(alumno.id),
 alumnosService.historiaAcademica(alumno.id).catch(() => null),
 ]);
 setInscripciones(inscr);

 if (hist && hist.inscripciones?.[0]) {
 const insc = hist.inscripciones[0];
 setStats({
 porcentajeAvance: insc.porcentajeAvance,
 totalMaterias: insc.totalMaterias,
 totalAprobadas: insc.totalAprobadas,
 });

 // Alertas de faltas consecutivas
 const alertasDetectadas = [];
 for (const año of insc.anios || []) {
 for (const mat of anio.materias || []) {
 if (['EN_CURSO', 'REGULAR'].includes(mat.estado)) {
 try {
 const cursadasResp = await cursadasService.listarPorInscripcion(insc.inscripcionId);
 const cursada = cursadasResp.find((c) => c.materia?.id === mat.materiaId);
 if (cursada) {
 const asistencias = await asistenciaService.listarPorCursada(cursada.id);
 let consecutivos = 0, maxCons = 0;
 for (const a of asistencias) {
 if (a.estado === 'AUSENTE') { consecutivos++; maxCons = Math.max(maxCons, consecutivos); }
 else consecutivos = 0;
 }
 if (maxCons >= DIAS_ALERTA_FALTAS) {
 alertasDetectadas.push({
 materiaNombre: mat.nombre, materiaCódigo: mat.código, diasConsecutivos: maxCons,
 });
 }
 }
 } catch (e) { /* ignore */ }
 }
 }
 }
 setAlertas(alertasDetectadas);
 }
 } catch (error) {
 toast.error('Error al cargar materias');
 } finally {
 setCargando(false);
 }
 };

 if (cargando) {
 return <Card><div className="p-8 text-center text-muted-foreground font-medium">Cargando...</div></Card>;
 }

 if (inscripciones.length === 0) {
 return (
 <div className="space-y-4">
 <Button variant="ghost" size="sm" onClick={onVolver}><ArrowLeft className="w-4 h-4 mr-2" />Volver</Button>
 <Card>
 <div className="p-12 text-center">
 <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
 <h3 className="text-lg font-semibold mb-2">El alumno no está inscripto</h3>
 <p className="text-muted-foreground text-sm">Inscribi al alumno en un título para poder registrar materias.</p>
 </div>
 </Card>
 </div>
 );
 }

 return (
 <div className="space-y-4">
 <Button variant="ghost" size="sm" onClick={onVolver}><ArrowLeft className="w-4 h-4 mr-2" />Volver</Button>

 <div className="p-4 rounded-md bg-muted/50">
 <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
 <div className="min-w-0">
 <p className="text-sm font-semibold text-foreground">{alumno.apellido}, {alumno.nombre}</p>
 <p className="text-xs text-muted-foreground font-medium">DNI {alumno.dni}</p>
 </div>
 <Button onClick={() => setModalRegistrar(true)} className="w-full sm:w-auto shrink-0">
 <Plus className="w-4 h-4 mr-2" />Registrar cursada
 </Button>
 </div>

 {stats && (
 <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
 <StatBox icon={TrendingUp} label="Avance" value={`${stats.porcentajeAvance}%`} color="text-primary" />
 <StatBox icon={CheckCircle2} label="Aprobadas" value={`${stats.totalAprobadas}/${stats.totalMaterias}`} color="text-green-600" />
 <StatBox icon={BookOpen} label="Inscripciones" value={inscripciones.length} color="text-foreground" />
 <StatBox icon={AlertCircle} label="Alertas" value={alertas.length} color={alertas.length > 0 ? 'text-destructive' : 'text-muted-foreground'} />
 </div>
 )}
 </div>

 {alertas.length > 0 && (
 <Card>
 <div className="p-4 bg-destructive/5 border-b border-destructive/20">
 <div className="flex items-start gap-3">
 <AlertTriangle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
 <div className="min-w-0 flex-1">
 <p className="text-sm font-semibold text-destructive">
 {alertas.length} materia{alertas.length !== 1 ? 's' : ''} con faltas consecutivas
 </p>
 <ul className="mt-2 space-y-1 text-xs text-destructive/90">
 {alertas.map((a, i) => (
 <li key={i}><strong>{a.materiaCódigo}</strong> — {a.materiaNombre}: {a.diasConsecutivos} dias seguidos sin asistir</li>
 ))}
 </ul>
 </div>
 </div>
 </div>
 </Card>
 )}

 {inscripciones.map((insc) => (
 <PanelInscripcion key={insc.id} inscripcion={insc} />
 ))}

 <ModalRegistrarCursada
 open={modalRegistrar}
 onClose={() => setModalRegistrar(false)}
 alumnoId={alumno.id}
 inscripciones={inscripciones}
 onRegistrado={() => { setModalRegistrar(false); cargarTodo(); }}
 />
 </div>
 );
}

function PanelInscripcion({ inscripcion }) {
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

 const aprobadas = cursadas.filter((c) => c.estado === 'APROBADA').length;
 const regulares = cursadas.filter((c) => c.estado === 'REGULAR').length;

 return (
 <Card>
 <div className="p-4 border-b border-border">
 <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
 <div className="min-w-0">
 <h3 className="text-base font-semibold truncate">{inscripcion.título?.nombre}</h3>
 <p className="text-xs text-muted-foreground font-medium">Resolución: {inscripcion.resolución?.código}</p>
 </div>
 <div className="flex items-center gap-3 text-xs">
 <span className="text-muted-foreground"><strong className="text-green-600">{aprobadas}</strong> aprobadas</span>
 <span className="text-muted-foreground"><strong className="text-yellow-600">{regulares}</strong> regulares</span>
 </div>
 </div>
 </div>

 {cargando ? (
 <div className="p-6 text-center text-muted-foreground text-sm">Cargando...</div>
 ) : cursadas.length === 0 ? (
 <div className="p-6 text-center text-muted-foreground text-sm">
 No hay cursadas registradas en esta inscripcion.
 </div>
 ) : (
 <Table>
 <TableHeader>
 <TableRow>
 <TableHead>Materia</TableHead>
 <TableHead className="hidden sm:table-cell">Código</TableHead>
 <TableHead>Estado</TableHead>
 <TableHead className="hidden md:table-cell">Nota</TableHead>
 <TableHead className="hidden lg:table-cell">Fecha</TableHead>
 </TableRow>
 </TableHeader>
 <TableBody>
 {cursadas.map((c) => (
 <TableRow key={c.id}>
 <TableCell className="text-sm">{c.materia?.nombre}</TableCell>
 <TableCell className="hidden sm:table-cell text-xs text-muted-foreground">{c.materia?.código}</TableCell>
 <TableCell>
 <Badge variant={ESTADO_BADGE[c.estado] || 'muted'}>
 {ESTADOS_CURSADA.find((e) => e.value === c.estado)?.label || c.estado}
 </Badge>
 </TableCell>
 <TableCell className="hidden md:table-cell text-sm">{c.notaFinal ?? c.notaCursada ?? '—'}</TableCell>
 <TableCell className="hidden lg:table-cell text-xs text-muted-foreground">
 {new Date(c.fechaEstado).toLocaleDateString('es-AR')}
 </TableCell>
 </TableRow>
 ))}
 </TableBody>
 </Table>
 )}
 </Card>
 );
}

function StatBox({ icon: Icon, label, value, color }) {
 return (
 <div className="p-3 rounded-md border border-border bg-card">
 <div className="flex items-center gap-2 mb-1">
 <Icon className={`w-4 h-4 ${color || 'text-foreground'}`} />
 <p className="text-xs text-muted-foreground font-medium">{label}</p>
 </div>
 <p className="text-lg sm:text-xl font-bold text-foreground truncate">{value}</p>
 </div>
 );
}

function ModalRegistrarCursada({ open, onClose, alumnoId, inscripciones, onRegistrado }) {
 const [inscripcionId, setInscripcionId] = useState('');
 const [materiaId, setMateriaId] = useState('');
 const [estado, setEstado] = useState('EN_CURSO');
 const [notaCursada, setNotaCursada] = useState('');
 const [notaFinal, setNotaFinal] = useState('');
 const [cargando, setCargando] = useState(false);
 const [materias, setMaterias] = useState([]);

 useEffect(() => {
 if (open && inscripciones.length > 0) setInscripcionId(inscripciones[0].id);
 }, [open, inscripciones]);

 useEffect(() => {
 if (inscripcionId) {
 const insc = inscripciones.find((i) => i.id === inscripcionId);
 if (insc?.resolución?.id) {
 (async () => {
 try {
 const { data } = await api.get(`/curricular/resoluciónes/${insc.resolución.id}/plan`);
 const todas = data.flatMap((a) =>
 (a.materias || []).map((m) => ({
 id: m.id, nombre: m.nombre, código: m.código, anioNombre: a.nombre,
 }))
 );
 setMaterias(todas);
 } catch (e) { setMaterias([]); }
 })();
 }
 }
 }, [inscripcionId, inscripciones]);

 const handleSubmit = async (e) => {
 e.preventDefault();
 setCargando(true);
 try {
 const payload = { inscripcionId, materiaId, estado };
 if (notaCursada !== '') payload.notaCursada = parseFloat(notaCursada);
 if (notaFinal !== '') payload.notaFinal = parseFloat(notaFinal);
 await cursadasService.registrar(alumnoId, payload);
 toast.success('Cursada registrada');
 onRegistrado();
 } catch (error) {
 toast.error(error.response?.data?.message || 'Error al registrar cursada');
 } finally {
 setCargando(false);
 }
 };

 return (
 <Modal open={open} onClose={onClose} title="Registrar Cursada" size="md">
 <form onSubmit={handleSubmit} className="space-y-4">
 <div>
 <label className="block text-sm font-medium mb-1 text-foreground">Inscripción</label>
 <select
 value={inscripcionId}
 onChange={(e) => setInscripcionId(e.target.value)}
 className="w-full h-10 px-3 rounded-md border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
 required
 >
 {inscripciones.map((i) => (
 <option key={i.id} value={i.id}>{i.título?.nombre} ({i.resolución?.código})</option>
 ))}
 </select>
 </div>

 <div>
 <label className="block text-sm font-medium mb-1 text-foreground">Materia</label>
 <select
 value={materiaId}
 onChange={(e) => setMateriaId(e.target.value)}
 className="w-full h-10 px-3 rounded-md border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
 required
 >
 <option value="">— Selecciona una materia —</option>
 {materias.map((m) => (
 <option key={m.id} value={m.id}>{m.anioNombre} — {m.código} {m.nombre}</option>
 ))}
 </select>
 </div>

 <div>
 <label className="block text-sm font-medium mb-1 text-foreground">Estado</label>
 <select
 value={estado}
 onChange={(e) => setEstado(e.target.value)}
 className="w-full h-10 px-3 rounded-md border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
 >
 {ESTADOS_CURSADA.map((e) => (
 <option key={e.value} value={e.value}>{e.label}</option>
 ))}
 </select>
 </div>

 <div className="grid grid-cols-2 gap-3">
 <Input label="Nota cursada (opcional)" type="number" step="0.01" min="0" max="10" value={notaCursada} onChange={(e) => setNotaCursada(e.target.value)} />
 <Input label="Nota final (opcional)" type="number" step="0.01" min="0" max="10" value={notaFinal} onChange={(e) => setNotaFinal(e.target.value)} />
 </div>

 <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 pt-4 border-t border-border">
 <Button type="button" variant="outline" onClick={onClose} className="w-full sm:w-auto">Cancelar</Button>
 <Button type="submit" disabled={cargando || !materiaId} className="w-full sm:w-auto">
 {cargando ? 'Registrando...' : 'Registrar'}
 </Button>
 </div>
 </form>
 </Modal>
 );
}