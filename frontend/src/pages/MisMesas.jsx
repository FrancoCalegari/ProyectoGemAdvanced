import { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, Users, CheckCircle2, XCircle, AlertCircle, Ban, BookOpen, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../contexts/AuthContext';
import { mesasService } from '../services/mesas.service';
import { alumnosService } from '../services/alumnos.service';
import { asistenciaService } from '../services/cursadas.service';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';

const ESTADO_INSCRIPCION_BADGE = {
 INSCRIPTO: 'success',
 PRESENTE: 'success',
 AUSENTE: 'danger',
 CANCELADO: 'muted',
};

export default function MisMesas() {
 const { usuario } = useAuth();
 const alumnoId = usuario?.alumnoId;

 const [mesas, setMesas] = useState([]);
 const [inscripciones, setInscripciones] = useState([]);
 const [materiasConStats, setMateriasConStats] = useState([]);
 const [cargando, setCargando] = useState(true);
 const [procesando, setProcesando] = useState(null);

 useEffect(() => {
 if (alumnoId) cargarTodo();
 else setCargando(false);
 }, [alumnoId]);

 const cargarTodo = async () => {
 try {
 setCargando(true);
 const [mesasData, inscrData] = await Promise.all([
 mesasService.listarDisponibles(alumnoId),
 alumnosService.listarInscripciones(alumnoId),
 ]);
 setMesas(mesasData);
 setInscripciones(inscrData);

 // Cargar stats de asistencia por materia
 if (inscrData.length > 0) {
 const insc = inscrData.find((i) => i.estado === 'ACTIVA') || inscrData[0];
 if (insc?.id) {
 // Traer materias del plan
 try {
 const { default: api } = await import('../services/api');
 const { data: plan } = await api.get(`/curricular/resoluciones/${insc.resolucion.id}/plan`);

 const statsPorMateria = [];
 for (const ano of plan) {
 for (const m of anio.materias || []) {
 // Buscar cursada
 const cursadasResp = await api.get(`/inscripciones/${insc.id}/cursadas`).catch(() => ({ data: [] }));
 const cursada = cursadasResp.data.find((c) => c.materia?.id === m.id);
 if (cursada) {
 let pct = null;
 try {
 const resumen = await asistenciaService.resumen(cursada.id);
 pct = resumen.porcentajeAsistencia;
 } catch (e) { /* ignore */ }
 statsPorMateria.push({
 materiaId: m.id,
 nombre: m.nombre,
 codigo: m.codigo,
 anioNombre: anio.nombre,
 estadoCursada: cursada.estado,
 porcentajeAsistencia: pct,
 });
 }
 }
 }
 setMateriasConStats(statsPorMateria);
 } catch (e) {
 // silencioso
 }
 }
 }
 } catch (error) {
 toast.error('Error al cargar datos');
 } finally {
 setCargando(false);
 }
 };

 const inscribirse = async (mesa) => {
 if (!confirm(`Inscribirte a la mesa de ${mesa.materia?.nombre}?`)) return;
 setProcesando(mesa.id);
 try {
 await mesasService.inscribir(mesa.id, { alumnoId });
 toast.success('Inscripción exitosa');
 cargarTodo();
 } catch (error) {
 toast.error(error.response?.data?.message || 'Error al inscribirse');
 } finally {
 setProcesando(null);
 }
 };

 const cancelar = async (mesa) => {
 if (!confirm(`Cancelar tu inscripcion a la mesa de ${mesa.materia?.nombre}?`)) return;
 setProcesando(mesa.id);
 try {
 await mesasService.cancelar(mesa.id, { alumnoId });
 toast.success('Inscripción cancelada');
 cargarTodo();
 } catch (error) {
 toast.error(error.response?.data?.message || 'Error al cancelar');
 } finally {
 setProcesando(null);
 }
 };

 if (!alumnoId) {
 return (
 <div className="space-y-6">
 <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Mis Mesas de Examen</h1>
 <Card><div className="p-8 text-center text-muted-foreground font-medium">
 Tu usuario no esta vinculado a un alumno.
 </div></Card>
 </div>
 );
 }

 return (
 <div className="space-y-6">
 <div>
 <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Mis Mesas de Examen</h1>
 <p className="text-sm sm:text-base text-muted-foreground font-medium mt-1">
 Inscribite a las mesas disponibles o cancela tu inscripcion
 </p>
 </div>

 <div className="p-4 rounded-md bg-muted/50 flex items-start gap-3">
 <AlertCircle className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
 <div className="text-xs text-muted-foreground space-y-1">
 <p><strong>Inscripción:</strong> podes inscribirte hasta 72hs antes de la mesa.</p>
 <p><strong>Cancelacion:</strong> podes cancelar hasta 48hs antes de la mesa.</p>
 <p><strong>Importante:</strong> si faltas sin avisar, no se te podra emitir el certificado para rendir.</p>
 </div>
 </div>

 {cargando ? (
 <Card><div className="p-8 text-center text-muted-foreground font-medium">Cargando...</div></Card>
 ) : (
 <>
 {/* Mesas disponibles */}
 <div>
 <h2 className="text-lg font-semibold mb-3">Mesas disponibles</h2>
 {mesas.length === 0 ? (
 <Card>
 <div className="p-12 text-center">
 <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
 <h2 className="text-lg font-semibold mb-2">No hay mesas disponibles</h2>
 <p className="text-muted-foreground text-sm">
 Cuando la secretaria programe mesas, vas a verlas aca.
 </p>
 </div>
 </Card>
 ) : (
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 {mesas.map((m) => {
 const puede = m.puedeInscribirse || m.puedeCancelar;
 return (
 <Card key={m.id} className={m.cupoLleno ? 'opacity-70' : ''}>
 <div className="p-4 border-b border-border">
 <div className="flex items-start justify-between gap-2">
 <div className="min-w-0 flex-1">
 <div className="flex items-center gap-2">
 <BookOpen className="w-4 h-4 text-primary shrink-0" />
 <h3 className="text-base font-semibold truncate">{m.materia?.nombre}</h3>
 </div>
 <p className="text-xs text-muted-foreground mt-1">
 {m.materia?.codigo} — {m.materia?.anioCurricular?.numeroAnio} ano
 </p>
 </div>
 {m.miInscripcion && (
 <Badge variant={ESTADO_INSCRIPCION_BADGE[m.miInscripcion.estado] || 'muted'}>
 {m.miInscripcion.estado}
 </Badge>
 )}
 </div>
 </div>

 <div className="p-4 space-y-3">
 <div className="grid grid-cols-2 gap-3 text-sm">
 <div className="flex items-center gap-2">
 <Calendar className="w-4 h-4 text-muted-foreground" />
 <span>{new Date(m.fecha).toLocaleDateString('es-AR')}</span>
 </div>
 <div className="flex items-center gap-2">
 <Clock className="w-4 h-4 text-muted-foreground" />
 <span>{m.hora}</span>
 </div>
 <div className="flex items-center gap-2">
 <MapPin className="w-4 h-4 text-muted-foreground" />
 <span>{m.aula || 'Aula sin asignar'}</span>
 </div>
 <div className="flex items-center gap-2">
 <Users className="w-4 h-4 text-muted-foreground" />
 <span>{m.inscriptos}{m.cupoMaximo ? ` / ${m.cupoMaximo}` : ''}</span>
 </div>
 </div>

 {m.horasHasta > 0 && (
 <p className="text-xs text-muted-foreground font-medium">
 Faltan {m.horasHasta}hs ({Math.floor(m.horasHasta / 24)} dias)
 </p>
 )}

 {m.cupoLleno && !m.miInscripcion && (
 <p className="text-xs text-destructive">
 <Ban className="w-3 h-3 inline mr-1" />Mesa sin cupo
 </p>
 )}

 {m.puedeInscribirse && (
 <Button onClick={() => inscribirse(m)} disabled={procesando === m.id} className="w-full">
 <CheckCircle2 className="w-4 h-4 mr-2" />
 {procesando === m.id ? 'Inscribiendo...' : 'Inscribirme'}
 </Button>
 )}

 {m.puedeCancelar && (
 <Button variant="outline" onClick={() => cancelar(m)} disabled={procesando === m.id} className="w-full">
 <XCircle className="w-4 h-4 mr-2 text-destructive" />
 {procesando === m.id ? 'Cancelando...' : 'Cancelar Inscripción'}
 </Button>
 )}

 {!m.puedeInscribirse && !m.puedeCancelar && !m.miInscripcion && (
 <p className="text-xs text-muted-foreground text-center">
 {m.horasHasta < 72 ? 'Inscripción cerrada (menos de 72hs)' : 'Mesa no disponible'}
 </p>
 )}
 </div>
 </Card>
 );
 })}
 </div>
 )}
 </div>

 {/* Resumen por materia */}
 {materiasConStats.length > 0 && (
 <div>
 <h2 className="text-lg font-semibold mb-3">Mi situacion por materia</h2>
 <Card>
 <div className="divide-y divide-border">
 {materiasConStats.map((m) => (
 <div key={m.materiaId} className="p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
 <div className="min-w-0 flex-1">
 <p className="text-sm font-medium truncate">{m.nombre}</p>
 <p className="text-xs text-muted-foreground font-medium">
 {m.anioNombre} — {m.codigo}
 </p>
 </div>
 <div className="flex items-center gap-3 shrink-0">
 {m.porcentajeAsistencia !== null && (
 <div className="flex items-center gap-1 text-xs">
 <TrendingUp className="w-3.5 h-3.5 text-muted-foreground" />
 <span className={m.porcentajeAsistencia >= 75 ? 'text-green-600 font-semibold' : 'text-yellow-600 font-semibold'}>
 {m.porcentajeAsistencia}%
 </span>
 </div>
 )}
 <Badge variant={m.estadoCursada === 'APROBADA' ? 'success' : m.estadoCursada === 'REGULAR' ? 'warning' : 'default'}>
 {m.estadoCursada}
 </Badge>
 </div>
 </div>
 ))}
 </div>
 </Card>
 </div>
 )}
 </>
 )}
 </div>
 );
}