import { useState, useEffect } from 'react';
import { BookOpen, Users, Calendar, Clock, MapPin, Save, ArrowLeft, GraduationCap, MessageSquare, CalendarDays, ChevronDown, ChevronRight, Sun, Sunset, Moon, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { profesoresService } from '../services/profesores.service';
import { solicitudesService } from '../services/solicitudes.service';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../components/ui/Table';
import { ESTADO_CURSADA_LABEL } from '../utils/labels';

const DIAS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

const ESTADOS_CURSADA = [
 { value: 'EN_CURSO', label: 'En curso', variant: 'warning' },
 { value: 'REGULAR', label: 'Regular', variant: 'info' },
 { value: 'APROBADA', label: 'Aprobada', variant: 'success' },
 { value: 'DESAPROBADA', label: 'Desaprobada', variant: 'destructive' },
 { value: 'LIBRE', label: 'Libre', variant: 'secondary' },
];

// Turno segun la hora
function turnoDeHora(horaInicio) {
 const h = parseInt(horaInicio?.split(':')[0] || '0');
 if (h < 12) return { label: 'Mañana', icon: Sun, color: 'text-amber-400' };
 if (h < 19) return { label: 'Tarde', icon: Sunset, color: 'text-orange-400' };
 return { label: 'Vespertino/Noche', icon: Moon, color: 'text-primary' };
}

export default function MisCursadas() {
 const { isProfesor } = useAuth();
 const [materias, setMaterias] = useState([]);
 const [cargando, setCargando] = useState(true);
 const [materiaActiva, setMateriaActiva] = useState(null);
 const [alumnos, setAlumnos] = useState([]);
 const [cargandoAlumnos, setCargandoAlumnos] = useState(false);
 const [modalNota, setModalNota] = useState(null);
 const [guardando, setGuardando] = useState(false);

 // Mesas del profesor
 const [mesas, setMesas] = useState([]);
 const [cargandoMesas, setCargandoMesas] = useState(false);
 const [modalMesas, setModalMesas] = useState(false);

 // Sugerencias
 const [modalSugerencia, setModalSugerencia] = useState(null);
 const [sugerenciaTexto, setSugerenciaTexto] = useState('');
 const [enviandoSugerencia, setEnviandoSugerencia] = useState(false);

 // Años expandidos
 const [aniosExpandidos, setAniosExpandidos] = useState({});

 useEffect(() => { cargar(); }, []);

 const cargar = async () => {
 try {
 setCargando(true);
 const data = await profesoresService.misMaterias();
 setMaterias(data);

 // Por defecto todos los años expandidos
 const porAnio = {};
 for (const m of data) {
 const año = m.materia.anioCurricular?.númeroAnio || 1;
 porAnio[anio] = true;
 }
 setAniosExpandidos(porAnio);
 } catch (error) {
 toast.error('Error al cargar tus materias');
 } finally {
 setCargando(false);
 }
 };

 const verAlumnos = async (mp) => {
 setMateriaActiva(mp);
 try {
 setCargandoAlumnos(true);
 const response = await api.get(`/curricular/materias/${mp.materia.id}/cursadas`);
 setAlumnos(response.data);
 } catch (error) {
 setAlumnos([]);
 toast.error('No se pudieron cargar los alumnos');
 } finally {
 setCargandoAlumnos(false);
 }
 };

 const verMesas = async () => {
 setModalMesas(true);
 try {
 setCargandoMesas(true);
 const r = await api.get('/mesas');
 // Filtrar mesas de las materias que dicta el profesor
 const misMateriaIds = materias.map((m) => m.materia.id);
 const misMesas = (r.data || []).filter((m) => misMateriaIds.includes(m.materiaId));
 setMesas(misMesas);
 } catch (error) {
 setMesas([]);
 } finally {
 setCargandoMesas(false);
 }
 };

 const abrirModalNota = (alumno) => {
 setModalNota({
 cursadaId: alumno.cursadaId,
 alumnoNombre: `${alumno.alumno.apellido}, ${alumno.alumno.nombre}`,
 alumnoDni: alumno.alumno.dni,
 estado: alumno.estado,
 notaCursada: alumno.notaCursada || '',
 notaFinal: alumno.notaFinal || '',
 });
 };

 const handleGuardarNota = async (e) => {
 e.preventDefault();
 if (!modalNota) return;
 setGuardando(true);
 try {
 await api.put(`/cursadas/${modalNota.cursadaId}`, {
 estado: modalNota.estado,
 notaCursada: modalNota.notaCursada !== '' ? parseFloat(modalNota.notaCursada) : null,
 notaFinal: modalNota.notaFinal !== '' ? parseFloat(modalNota.notaFinal) : null,
 });
 toast.success('Nota cargada');
 setModalNota(null);
 if (materiaActiva) verAlumnos(materiaActiva);
 } catch (error) {
 toast.error(error.response?.data?.message || 'Error al guardar');
 } finally {
 setGuardando(false);
 }
 };

 const enviarSugerencia = async (e) => {
 e.preventDefault();
 if (!sugerenciaTexto.trim()) return toast.error('Escribí tu sugerencia');
 setEnviandoSugerencia(true);
 try {
 await solicitudesService.crear({
 tipo: 'OTRO',
 comentario: `[Sugerencia sobre ${modalSugerencia.materia.nombre}] ${sugerenciaTexto}`,
 });
 toast.success('Sugerencia enviada a la administración');
 setModalSugerencia(null);
 setSugerenciaTexto('');
 } catch (error) {
 toast.error('Error al enviar');
 } finally {
 setEnviandoSugerencia(false);
 }
 };

 const toggleAnio = (anio) => {
 setAniosExpandidos({ ...aniosExpandidos, [anio]: !aniosExpandidos[anio] });
 };

 if (!isProfesor) {
 return (
 <div className="space-y-6">
 <h1 className="text-2xl sm:text-3xl font-bold">Mis Materias</h1>
 <Card><div className="p-12 text-center text-muted-foreground font-medium">Solo los profesores pueden acceder</div></Card>
 </div>
 );
 }

 // Agrupar por año
 const porAnio = {};
 for (const m of materias) {
 const año = m.materia.anioCurricular?.númeroAnio || 1;
 if (!porAnio[anio]) porAnio[anio] = [];
 porAnio[anio].push(m);
 }
 const aniosOrdenados = Object.keys(porAnio).map(Number).sort((a, b) => a - b);

 // ============================================================
 // VISTA 1: LISTA DE MATERIAS AGRUPADAS POR AÑO
 // ============================================================
 if (!materiaActiva) {
 return (
 <div className="space-y-6">
 <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
 <div>
 <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Mis Materias</h1>
 <p className="text-sm text-muted-foreground font-medium mt-1">
 Materias que tenés asignadas + alumnos + mesas de examen
 </p>
 </div>
 <Button variant="outline" onClick={verMesas}>
 <CalendarDays className="w-4 h-4 mr-2" /> Ver mis mesas
 </Button>
 </div>

 {cargando ? (
 <div className="p-8 text-center text-muted-foreground font-medium">Cargando...</div>
 ) : materias.length === 0 ? (
 <Card>
 <div className="p-12 text-center">
 <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
 <p className="text-muted-foreground">No tenés materias asignadas todavía.</p>
 </div>
 </Card>
 ) : (
 <div className="space-y-4">
 {aniosOrdenados.map((anio) => (
 <Card key={anio} className="overflow-hidden">
 <button
 onClick={() => toggleAnio(anio)}
 className="w-full p-4 sm:p-5 flex items-center justify-between hover:bg-accent transition-colors"
 >
 <div className="flex items-center gap-3">
 <div className="w-10 h-10 rounded-lg bg-primary border border-primary/30 flex items-center justify-center">
 <GraduationCap className="w-5 h-5 text-primary" />
 </div>
 <div className="text-left">
 <h2 className="font-semibold text-foreground">{anio}° Año</h2>
 <p className="text-xs text-muted-foreground font-medium">
 {porAnio[anio].length} {porAnio[anio].length === 1 ? 'materia' : 'materias'}
 </p>
 </div>
 </div>
 {aniosExpandidos[anio] ? (
 <ChevronDown className="w-5 h-5 text-muted-foreground" />
 ) : (
 <ChevronRight className="w-5 h-5 text-muted-foreground" />
 )}
 </button>

 {aniosExpandidos[anio] && (
 <div className="p-4 sm:p-5 pt-0 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
 {porAnio[anio].map((mp) => {
 const turno = turnoDeHora(mp.horaInicio);
 const TurnoIcon = turno.icon;
 return (
 <div
 key={mp.id}
 className="bg-background border border-border rounded-xl p-4 hover:border-primary/50 transition-all"
 >
 <div className="flex items-start justify-between mb-3">
 <Badge variant="outline">{mp.materia.código}</Badge>
 <button
 onClick={(e) => { e.stopPropagation(); setModalSugerencia(mp); }}
 title="Enviar sugerencia"
 className="text-muted-foreground hover:text-primary"
 >
 <MessageSquare className="w-4 h-4" />
 </button>
 </div>

 <h3 className="font-semibold text-foreground mb-1">{mp.materia.nombre}</h3>
 <p className="text-xs text-muted-foreground mb-3 truncate">
 {mp.materia.anioCurricular?.resolución?.título?.nombre}
 </p>

 <div className="space-y-1.5 text-xs text-muted-foreground mb-3">
 <div className="flex items-center gap-2">
 <Calendar className="w-3 h-3" />
 {DIAS[mp.diaSemana]}
 </div>
 <div className="flex items-center gap-2">
 <Clock className="w-3 h-3" />
 {mp.horaInicio} - {mp.horaFin}
 </div>
 <div className={`flex items-center gap-2 ${turno.color}`}>
 <TurnoIcon className="w-3 h-3" />
 {turno.label}
 </div>
 {mp.aula && (
 <div className="flex items-center gap-2">
 <MapPin className="w-3 h-3" />
 {mp.aula}
 </div>
 )}
 </div>

 <Button
 variant="outline"
 size="sm"
 className="w-full"
 onClick={() => verAlumnos(mp)}
 >
 <Users className="w-3 h-3 mr-2" /> Ver alumnos
 </Button>
 </div>
 );
 })}
 </div>
 )}
 </Card>
 ))}
 </div>
 )}

 {/* Modal de sugerencia */}
 <Modal
 open={!!modalSugerencia}
 onClose={() => { setModalSugerencia(null); setSugerenciaTexto(''); }}
 title={`Sugerencia sobre ${modalSugerencia?.materia?.nombre || ''}`}
 size="md"
 >
 <form onSubmit={enviarSugerencia} className="space-y-4">
 <div className="p-3 rounded-lg bg-primary/10 border border-primary/30 flex gap-3">
 <AlertCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
 <p className="text-xs text-foreground/90">
 Tu sugerencia será enviada a la administración. No modifica la materia, solo deja constancia de tu recomendación.
 </p>
 </div>
 <div>
 <label className="block text-sm font-medium text-foreground/90 mb-1.5">Tu sugerencia</label>
 <textarea
 value={sugerenciaTexto}
 onChange={(e) => setSugerenciaTexto(e.target.value)}
 rows={5}
 className="w-full px-3 py-2 rounded-lg bg-background border border-border text-foreground text-sm focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/30"
 placeholder="Ej: Sería bueno cambiar el horario de esta materia a la tarde por..."
 required
 />
 </div>
 <div className="flex justify-end gap-2 pt-4 border-t border-border">
 <Button type="button" variant="outline" onClick={() => { setModalSugerencia(null); setSugerenciaTexto(''); }}>Cancelar</Button>
 <Button type="submit" disabled={enviandoSugerencia}>
 {enviandoSugerencia ? 'Enviando...' : 'Enviar sugerencia'}
 </Button>
 </div>
 </form>
 </Modal>

 {/* Modal de mesas */}
 <Modal
 open={modalMesas}
 onClose={() => setModalMesas(false)}
 title="Mis mesas de examen"
 size="xl"
 >
 {cargandoMesas ? (
 <div className="p-8 text-center text-muted-foreground font-medium">Cargando mesas...</div>
 ) : mesas.length === 0 ? (
 <div className="p-8 text-center text-muted-foreground font-medium">
 <CalendarDays className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
 <p>No tenés mesas asignadas por el momento.</p>
 </div>
 ) : (
 <Table>
 <TableHeader>
 <TableRow>
 <TableHead>Materia</TableHead>
 <TableHead>Fecha</TableHead>
 <TableHead>Hora</TableHead>
 <TableHead>Aula</TableHead>
 <TableHead>Inscriptos</TableHead>
 <TableHead>Estado</TableHead>
 </TableRow>
 </TableHeader>
 <TableBody>
 {mesas.map((m) => (
 <TableRow key={m.id}>
 <TableCell className="font-medium">
 {m.materia?.nombre} <span className="text-muted-foreground text-xs">({m.materia?.código})</span>
 </TableCell>
 <TableCell>{new Date(m.fecha).toLocaleDateString('es-AR')}</TableCell>
 <TableCell>{m.hora}</TableCell>
 <TableCell>{m.aula || '—'}</TableCell>
 <TableCell>{m._count?.inscripciones || 0}</TableCell>
 <TableCell><Badge variant="outline">{m.estado}</Badge></TableCell>
 </TableRow>
 ))}
 </TableBody>
 </Table>
 )}
 </Modal>
 </div>
 );
 }

 // ============================================================
 // VISTA 2: ALUMNOS DE LA MATERIA
 // ============================================================
 const turno = turnoDeHora(materiaActiva.horaInicio);
 const TurnoIcon = turno.icon;

 return (
 <div className="space-y-6">
 <button
 onClick={() => { setMateriaActiva(null); setAlumnos([]); }}
 className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-card border border-transparent hover:border-border transition-all"
 >
 <ArrowLeft className="w-4 h-4" /> Volver a mis materias
 </button>

 <div className="flex items-center gap-3">
 <div className="w-12 h-12 rounded-lg bg-primary border border-primary/30 flex items-center justify-center">
 <BookOpen className="w-6 h-6 text-primary" />
 </div>
 <div>
 <h1 className="text-2xl font-bold text-foreground">{materiaActiva.materia.nombre}</h1>
 <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground mt-1">
 <span>{materiaActiva.materia.código}</span>
 <span>·</span>
 <span>{DIAS[materiaActiva.diaSemana]} {materiaActiva.horaInicio}-{materiaActiva.horaFin}</span>
 <span>·</span>
 <span className={`flex items-center gap-1 ${turno.color}`}>
 <TurnoIcon className="w-3 h-3" />
 {turno.label}
 </span>
 {materiaActiva.aula && (
 <>
 <span>·</span>
 <span>{materiaActiva.aula}</span>
 </>
 )}
 </div>
 </div>
 </div>

 <Card>
 <div className="p-4 border-b border-border flex items-center justify-between">
 <div className="flex items-center gap-2">
 <Users className="w-4 h-4 text-muted-foreground" />
 <h2 className="font-semibold text-foreground">Alumnos cursando ({alumnos.length})</h2>
 </div>
 <button
 onClick={() => setModalSugerencia(materiaActiva)}
 className="text-xs text-primary hover:text-primary flex items-center gap-1"
 >
 <MessageSquare className="w-3 h-3" /> Sugerir cambio
 </button>
 </div>

 {cargandoAlumnos ? (
 <div className="p-8 text-center text-muted-foreground font-medium">Cargando alumnos...</div>
 ) : alumnos.length === 0 ? (
 <div className="p-8 text-center text-muted-foreground font-medium">
 No hay alumnos cursando esta materia todavía.
 </div>
 ) : (
 <Table>
 <TableHeader>
 <TableRow>
 <TableHead>Alumno</TableHead>
 <TableHead>DNI</TableHead>
 <TableHead>Nota de Cursada</TableHead>
 <TableHead>Nota final</TableHead>
 <TableHead>Estado</TableHead>
 <TableHead className="text-right">Acciones</TableHead>
 </TableRow>
 </TableHeader>
 <TableBody>
 {alumnos.map((a) => {
 const estadoInfo = ESTADOS_CURSADA.find((e) => e.value === a.estado);
 return (
 <TableRow key={a.cursadaId}>
 <TableCell className="font-medium text-foreground">
 {a.alumno.apellido}, {a.alumno.nombre}
 </TableCell>
 <TableCell>{a.alumno.dni}</TableCell>
 <TableCell>{a.notaCursada || '—'}</TableCell>
 <TableCell>{a.notaFinal || '—'}</TableCell>
 <TableCell>
 <Badge variant={estadoInfo?.variant || 'outline'}>
 {estadoInfo?.label || ESTADO_CURSADA_LABEL[a.estado] || a.estado}
 </Badge>
 </TableCell>
 <TableCell className="text-right">
 <Button variant="ghost" size="sm" onClick={() => abrirModalNota(a)}>
 <GraduationCap className="w-4 h-4 mr-1" /> Cargar Nota
 </Button>
 </TableCell>
 </TableRow>
 );
 })}
 </TableBody>
 </Table>
 )}
 </Card>

 {/* Modal nota */}
 <Modal open={!!modalNota} onClose={() => setModalNota(null)} title={`Cargar nota: ${modalNota?.alumnoNombre || ''}`} size="md">
 {modalNota && (
 <form onSubmit={handleGuardarNota} className="space-y-4">
 <p className="text-sm text-muted-foreground">DNI {modalNota.alumnoDni}</p>
 <div>
 <label className="block text-sm font-medium text-foreground/90 mb-1.5">Estado de la Materia</label>
 <select
 value={modalNota.estado}
 onChange={(e) => setModalNota({ ...modalNota, estado: e.target.value })}
 className="w-full h-10 px-3 rounded-lg bg-background border border-border text-foreground text-sm focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/30"
 >
 {ESTADOS_CURSADA.map((e) => <option key={e.value} value={e.value}>{e.label}</option>)}
 </select>
 </div>
 <div className="grid grid-cols-2 gap-3">
 <div>
 <label className="block text-sm font-medium text-foreground/90 mb-1.5">Nota de Cursada</label>
 <input
 type="number" min="0" max="10" step="0.01"
 value={modalNota.notaCursada}
 onChange={(e) => setModalNota({ ...modalNota, notaCursada: e.target.value })}
 className="w-full h-10 px-3 rounded-lg bg-background border border-border text-foreground text-sm focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/30"
 />
 </div>
 <div>
 <label className="block text-sm font-medium text-foreground/90 mb-1.5">Nota final</label>
 <input
 type="number" min="0" max="10" step="0.01"
 value={modalNota.notaFinal}
 onChange={(e) => setModalNota({ ...modalNota, notaFinal: e.target.value })}
 className="w-full h-10 px-3 rounded-lg bg-background border border-border text-foreground text-sm focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/30"
 />
 </div>
 </div>
 <div className="flex justify-end gap-2 pt-4 border-t border-border">
 <Button type="button" variant="outline" onClick={() => setModalNota(null)}>Cancelar</Button>
 <Button type="submit" disabled={guardando}>
 <Save className="w-4 h-4 mr-2" /> {guardando ? 'Guardando...' : 'Guardar Nota'}
 </Button>
 </div>
 </form>
 )}
 </Modal>

 {/* Modal sugerencia */}
 <Modal
 open={!!modalSugerencia}
 onClose={() => { setModalSugerencia(null); setSugerenciaTexto(''); }}
 title={`Sugerencia sobre ${modalSugerencia?.materia?.nombre || ''}`}
 size="md"
 >
 <form onSubmit={enviarSugerencia} className="space-y-4">
 <div className="p-3 rounded-lg bg-primary/10 border border-primary/30 flex gap-3">
 <AlertCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
 <p className="text-xs text-foreground/90">
 Tu sugerencia será enviada a la administración. No modifica la materia.
 </p>
 </div>
 <textarea
 value={sugerenciaTexto}
 onChange={(e) => setSugerenciaTexto(e.target.value)}
 rows={5}
 className="w-full px-3 py-2 rounded-lg bg-background border border-border text-foreground text-sm focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/30"
 placeholder="Tu sugerencia..."
 required
 />
 <div className="flex justify-end gap-2 pt-4 border-t border-border">
 <Button type="button" variant="outline" onClick={() => { setModalSugerencia(null); setSugerenciaTexto(''); }}>Cancelar</Button>
 <Button type="submit" disabled={enviandoSugerencia}>
 {enviandoSugerencia ? 'Enviando...' : 'Enviar'}
 </Button>
 </div>
 </form>
 </Modal>
 </div>
 );
}