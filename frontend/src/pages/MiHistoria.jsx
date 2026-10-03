import { useState, useEffect } from 'react';
import {
 GraduationCap, BookOpen, Award, Calendar, TrendingUp,
 ChevronDown, ChevronRight, CheckCircle2, Clock, XCircle, AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { alumnosService } from '../services/alumnos.service';
import { useAuth } from '../contexts/AuthContext';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { ESTADO_CURSADA_LABEL } from '../utils/labels';

const ESTADOS_MATERIA = {
 APROBADA: { label: 'Aprobada', variant: 'success', icon: CheckCircle2, color: 'text-emerald-400' },
 REGULAR: { label: 'Regular', variant: 'info', icon: BookOpen, color: 'text-blue-400' },
 EN_CURSO: { label: 'En curso', variant: 'warning', icon: Clock, color: 'text-amber-400' },
 DESAPROBADA: { label: 'Desaprobada', variant: 'destructive', icon: XCircle, color: 'text-red-400' },
 LIBRE: { label: 'Libre', variant: 'secondary', icon: AlertCircle, color: 'text-primary' },
 NO_CURSADA: { label: 'No Iniciada', variant: 'outline', icon: AlertCircle, color: 'text-muted-foreground' },
};

export default function MiHistoria() {
 const { alumnoId, usuario } = useAuth();
 const [historia, setHistoria] = useState(null);
 const [cargando, setCargando] = useState(true);
 const [aniosExpandidos, setAniosExpandidos] = useState({});

 useEffect(() => { cargar(); }, []);

 const cargar = async () => {
 try {
 setCargando(true);
 // Usar alumnoId del usuario logueado
 const id = alumnoId || usuario?.alumnoId;
 if (!id) throw new Error('No hay alumno vinculado');
 const data = await alumnosService.historiaAcademica(id);
 setHistoria(data);

 // Expandir todos los años por defecto
 if (data.inscripciones && data.inscripciones[0]) {
 const porAnio = {};
 for (const año of data.inscripciones[0].anios || []) {
 porAnio[anio.númeroAnio] = true;
 }
 setAniosExpandidos(porAnio);
 }
 } catch (error) {
 console.error(error);
 toast.error('Error al cargar tu historia academica');
 } finally {
 setCargando(false);
 }
 };

 const toggleAnio = (anio) => {
 setAniosExpandidos({ ...aniosExpandidos, [anio]: !aniosExpandidos[anio] });
 };

 if (cargando) {
 return <div className="p-12 text-center text-muted-foreground font-medium">Cargando tu historia academica...</div>;
 }

 if (!historia || !historia.inscripciones || historia.inscripciones.length === 0) {
 return (
 <div className="space-y-6">
 <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Mi Historia Academica</h1>
 <Card>
 <div className="p-12 text-center">
 <GraduationCap className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
 <p className="text-muted-foreground">No estás inscripto en ninguna carrera.</p>
 </div>
 </Card>
 </div>
 );
 }

 return (
 <div className="space-y-6">
 <div>
 <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Mi Historia Academica</h1>
 <p className="text-sm text-muted-foreground font-medium mt-1">
 {historia.alumno.apellido}, {historia.alumno.nombre} - DNI {historia.alumno.dni}
 </p>
 </div>

 {historia.inscripciones.map((insc) => (
 <div key={insc.inscripcionId} className="space-y-4">
 {/* Card de la carrera */}
 <Card className="p-6">
 <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
 <div className="flex items-start gap-4">
 <div className="w-12 h-12 rounded-lg bg-primary border border-primary/30 flex items-center justify-center shrink-0">
 <GraduationCap className="w-6 h-6 text-primary" />
 </div>
 <div>
 <h2 className="text-lg font-bold text-foreground">{insc.título.nombre}</h2>
 <p className="text-sm text-muted-foreground font-medium mt-1">
 Resolución: {insc.resolución.código} - Nivel: {insc.título.nivel}
 </p>
 <p className="text-xs text-muted-foreground mt-1">
 Inscripto: {new Date(insc.fechaInscripcion).toLocaleDateString('es-AR')}
 </p>
 </div>
 </div>
 <Badge variant={insc.estado === 'ACTIVA' ? 'success' : 'secondary'}>
 {insc.estado === 'ACTIVA' ? 'Cursando' : insc.estado}
 </Badge>
 </div>

 {/* KPIs */}
 <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-border">
 <div>
 <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
 <TrendingUp className="w-3 h-3" /> Avance
 </div>
 <p className="text-2xl font-bold text-emerald-400">{insc.porcentajeAvance}%</p>
 </div>
 <div>
 <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
 <CheckCircle2 className="w-3 h-3" /> Aprobadas
 </div>
 <p className="text-2xl font-bold text-foreground">{insc.totalAprobadas}/{insc.totalMaterias}</p>
 </div>
 <div>
 <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
 <BookOpen className="w-3 h-3" /> Años
 </div>
 <p className="text-2xl font-bold text-foreground">{insc.anios.length}</p>
 </div>
 <div>
 <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
 <Calendar className="w-3 h-3" /> Estado
 </div>
 <Badge variant={insc.estado === 'ACTIVA' ? 'success' : 'secondary'}>{insc.estado}</Badge>
 </div>
 </div>
 </Card>

 {/* Años */}
 {insc.anios.map((anio) => {
 const expandido = aniosExpandidos[anio.númeroAnio];
 return (
 <Card key={anio.anioId} className="overflow-hidden">
 <button
 onClick={() => toggleAnio(anio.númeroAnio)}
 className="w-full p-5 flex items-center justify-between hover:bg-accent transition-colors"
 >
 <div className="flex items-center gap-3">
 <div className="w-10 h-10 rounded-lg bg-accent border border-border flex items-center justify-center">
 <span className="font-bold text-foreground text-sm">{anio.númeroAnio}</span>
 </div>
 <div className="text-left">
 <h3 className="font-semibold text-foreground">{anio.nombre}</h3>
 <p className="text-xs text-muted-foreground font-medium">
 {anio.aprobadas} aprob. - {anio.regulares} reg. - {anio.enCurso} en curso
 </p>
 </div>
 </div>
 {expandido ? (
 <ChevronDown className="w-5 h-5 text-muted-foreground" />
 ) : (
 <ChevronRight className="w-5 h-5 text-muted-foreground" />
 )}
 </button>

 {expandido && (
 <div className="border-t border-border">
 {anio.materias.map((m) => {
 const estadoInfo = ESTADOS_MATERIA[m.estado] || ESTADOS_MATERIA.NO_CURSADA;
 const EstadoIcon = estadoInfo.icon;
 return (
 <div
 key={m.materiaId}
 className="p-4 border-b border-border last:border-b-0 hover:bg-accent transition-colors"
 >
 <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
 <div className="flex-1 min-w-0">
 <div className="flex items-center gap-2">
 <h4 className="font-medium text-foreground truncate">{m.nombre}</h4>
 <span className="text-xs text-muted-foreground shrink-0">{m.código}</span>
 </div>
 <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-xs text-muted-foreground">
 {m.notaCursada !== null && m.notaCursada !== undefined && (
 <span>Nota de Cursada: <strong className="text-foreground/90">{m.notaCursada}</strong></span>
 )}
 {m.notaFinal !== null && m.notaFinal !== undefined && (
 <span>Nota final: <strong className="text-foreground/90">{m.notaFinal}</strong></span>
 )}
 {m.esEquivalencia && <span className="text-secondary">Equivalencia</span>}
 </div>
 </div>
 <div className={`flex items-center gap-2 shrink-0 ${estadoInfo.color}`}>
 <EstadoIcon className="w-4 h-4" />
 <Badge variant={estadoInfo.variant}>{estadoInfo.label}</Badge>
 </div>
 </div>
 </div>
 );
 })}
 </div>
 )}
 </Card>
 );
 })}
 </div>
 ))}
 </div>
 );
}