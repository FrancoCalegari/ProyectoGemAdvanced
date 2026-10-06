import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
 Users, BookOpen, CalendarDays, Award, UserPlus, FileText,
 TrendingUp, AlertCircle, Clock, CheckCircle2, XCircle, ArrowRight,
} from 'lucide-react';
import { toast } from 'sonner';
import { dashboardService } from '../services/dashboard.service';
import { useAuth } from '../contexts/AuthContext';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';

const ESTADOS_LABEL = {
 ACTIVO: 'Activo',
 EGRESADO: 'Egresado',
 BAJA: 'Baja',
 INACTIVO: 'Inactivo',
 PROGRAMADA: 'Programada',
 EN_CURSO: 'En curso',
 FINALIZADA: 'Finalizada',
 CANCELADA: 'Cancelada',
 EMITIDO: 'Emitido',
 ANULADO: 'Anulado',
 EXAMEN_FINAL: 'Examen final',
 INGRESO_NIVELATORIO: 'Ingreso Nivelatorio',
 PARCIAL_ANIO: 'Parcial de anio',
 TITULO_COMPLETO: 'Título completo',
 CONCURRENCIA: 'Concurrencia',
 PARA_COLECTIVO: 'Para colectivo',
 LABORAL: 'Laboral',
 PARA_RENDIR: 'Para rendir',
};

const ESTADO_BADGE = {
 ACTIVO: 'default',
 EGRESADO: 'secondary',
 BAJA: 'destructive',
 INACTIVO: 'secondary',
 PROGRAMADA: 'secondary',
 FINALIZADA: 'default',
 CANCELADA: 'destructive',
 EMITIDO: 'default',
 ANULADO: 'destructive',
};

const label = (e) => ESTADOS_LABEL[e] || e;
const fmt = (n) => new Intl.NumberFormat('es-AR').format(n || 0);

function KpiCard({ icon: Icon, label, value, sub, alerta, to }) {
 const CardWrapper = to ? Link : 'div';
 const props = to ? { to } : {};
 return (
 <CardWrapper {...props} className="h-full block">
 <Card className={`p-5 h-full flex flex-col transition-all ${alerta ? 'border-red-500/40 bg-red-500/5' : to ? 'hover:border-primary/50 hover:shadow-md cursor-pointer' : ''}`}>
 <div className="flex items-start justify-between gap-3 flex-1">
 <div className="min-w-0 flex-1 flex flex-col">
 <p className="text-xs text-muted-foreground uppercase tracking-wider font-bold">{label}</p>
 <p className="text-3xl font-bold text-foreground mt-2 tabular-nums">{value}</p>
 {sub && <p className="text-xs text-muted-foreground mt-auto pt-1 font-medium">{sub}</p>}
 </div>
 <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${alerta ? 'bg-red-500/10' : 'bg-primary/10'}`}>
 <Icon className={`w-5 h-5 ${alerta ? 'text-red-600' : 'text-primary'}`} />
 </div>
 </div>
 </Card>
 </CardWrapper>
 );
}

function SeccionTitulo({ children, to, linkLabel = 'Ver todos' }) {
 return (
 <div className="flex items-center justify-between mb-4">
 <h2 className="text-base font-bold text-foreground pb-2 border-b-2 border-primary/30 inline-block">{children}</h2>
 {to && (
 <Link to={to} className="text-xs text-primary hover:underline flex items-center gap-1 font-semibold">
 {linkLabel} <ArrowRight className="w-3 h-3" />
 </Link>
 )}
 </div>
 );
}

export default function Dashboard() {
 const { usuario, isAdmin, isSecretaria } = useAuth();
 const navigate = useNavigate();
 const [cargando, setCargando] = useState(true);
 const [resumen, setResumen] = useState(null);
 const [actividad, setActividad] = useState(null);

 useEffect(() => {
 if (!isAdmin && !isSecretaria) {
 setCargando(false);
 return;
 }
 cargar();
 }, []);

 const cargar = async () => {
 try {
 setCargando(true);
 const [r, a] = await Promise.all([
 dashboardService.resumen(),
 dashboardService.actividad(),
 ]);
 setResumen(r);
 setActividad(a);
 } catch (error) {
 console.error(error);
 toast.error('Error al cargar el dashboard');
 } finally {
 setCargando(false);
 }
 };

 // Si es alumno o profesor, redirigir
 if (!isAdmin && !isSecretaria) {
 return (
 <div className="space-y-6">
 <div>
 <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
 Hola, {usuario?.nombre}
 </h1>
 <p className="text-sm text-muted-foreground font-medium mt-1">
 {new Date().toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
 </p>
 </div>
 <Card>
 <div className="p-8 text-center">
 <p className="text-muted-foreground">
 Usá el menu lateral para navegar por tus secciones
 </p>
 </div>
 </Card>
 </div>
 );
 }

 if (cargando) {
 return <div className="p-12 text-center text-muted-foreground font-medium">Cargando dashboard...</div>;
 }

 return (
 <div className="space-y-6">
 {/* ============ ENCABEZADO ============ */}
 <div>
 <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
 Hola, {usuario?.nombre}
 </h1>
 <p className="text-sm text-muted-foreground mt-1 capitalize">
 {new Date().toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
 </p>
 </div>

 {/* ============ ALERTAS ============ */}
 {(resumen?.alertas?.licenciasPendientes > 0 || resumen?.alertas?.solicitudesPendientes > 0) && (
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
 {resumen.alertas.licenciasPendientes > 0 && (
 <Card className="p-4 border-yellow-500/40 bg-yellow-500/5">
 <div className="flex items-center gap-3">
 <AlertCircle className="w-5 h-5 text-yellow-600 shrink-0" />
 <div className="flex-1">
 <p className="text-sm font-semibold">
 {resumen.alertas.licenciasPendientes} {resumen.alertas.licenciasPendientes === 1 ? 'licencia pendiente' : 'licencias pendientes'}
 </p>
 <p className="text-xs text-muted-foreground font-medium">Requieren tu aprobación</p>
 </div>
 <Link to="/profesores">
 <Button size="sm" variant="outline">Ver</Button>
 </Link>
 </div>
 </Card>
 )}
 {resumen.alertas.solicitudesPendientes > 0 && (
 <Card className="p-4 border-blue-500/40 bg-blue-500/5">
 <div className="flex items-center gap-3">
 <AlertCircle className="w-5 h-5 text-blue-600 shrink-0" />
 <div className="flex-1">
 <p className="text-sm font-semibold">
 {resumen.alertas.solicitudesPendientes} {resumen.alertas.solicitudesPendientes === 1 ? 'solicitud pendiente' : 'solicitudes pendientes'}
 </p>
 <p className="text-xs text-muted-foreground font-medium">Esperando Resolución</p>
 </div>
 <Link to="/usuarios">
 <Button size="sm" variant="outline">Ver</Button>
 </Link>
 </div>
 </Card>
 )}
 </div>
 )}

 {/* ============ KPIs ============ */}
 <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 items-stretch">
 <KpiCard
 icon={Users}
 label="Alumnos totales"
 value={fmt(resumen?.alumnos?.total)}
 sub={`${resumen?.alumnos?.activos || 0} activos`}
 to="/alumnos"
 />
 <KpiCard
 icon={BookOpen}
 label="Materias en Curso"
 value={fmt(resumen?.cursadas?.enCurso)}
 to="/cursadas"
 />
 <KpiCard
 icon={CalendarDays}
 label="Mesas proximas"
 value={fmt(resumen?.mesas?.proximas)}
 sub="Próximos 7 dias"
 to="/mesas-examen"
 />
 <KpiCard
 icon={Award}
 label="Certificados mes"
 value={fmt(resumen?.certificados?.mes)}
 sub="Últimos 30 dias"
 to="/certificados"
 />
 </div>

 {/* ============ ACCESOS RAPIDOS ============ */}
 <div>
 <SeccionTitulo>Accesos rapidos</SeccionTitulo>
 <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
 <Link to="/alumnos">
 <Card className="p-4 hover:border-primary/50 hover:shadow-md transition-all cursor-pointer">
 <div className="flex items-center gap-3">
 <UserPlus className="w-5 h-5 text-primary" />
 <div>
 <p className="text-sm font-semibold">Nuevo Alumno</p>
 <p className="text-xs text-muted-foreground font-medium">Dar de alta</p>
 </div>
 </div>
 </Card>
 </Link>
 <Link to="/mesas-examen">
 <Card className="p-4 hover:border-primary/50 hover:shadow-md transition-all cursor-pointer">
 <div className="flex items-center gap-3">
 <CalendarDays className="w-5 h-5 text-primary" />
 <div>
 <p className="text-sm font-semibold">Nueva Mesa</p>
 <p className="text-xs text-muted-foreground font-medium">Programar examen</p>
 </div>
 </div>
 </Card>
 </Link>
 <Link to="/certificados">
 <Card className="p-4 hover:border-primary/50 hover:shadow-md transition-all cursor-pointer">
 <div className="flex items-center gap-3">
 <Award className="w-5 h-5 text-primary" />
 <div>
 <p className="text-sm font-semibold">Certificados</p>
 <p className="text-xs text-muted-foreground font-medium">Emitir o consultar</p>
 </div>
 </div>
 </Card>
 </Link>
 <Link to="/estadisticas">
 <Card className="p-4 hover:border-primary/50 hover:shadow-md transition-all cursor-pointer">
 <div className="flex items-center gap-3">
 <TrendingUp className="w-5 h-5 text-primary" />
 <div>
 <p className="text-sm font-semibold">Estadísticas</p>
 <p className="text-xs text-muted-foreground font-medium">Ver reportes</p>
 </div>
 </div>
 </Card>
 </Link>
 </div>
 </div>

 {/* ============ ACTIVIDAD RECIENTE ============ */}
 <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
 {/* Últimos alumnos */}
 <Card className="p-5">
 <SeccionTitulo to="/alumnos">Últimos alumnos</SeccionTitulo>
 {!actividad?.ultimosAlumnos?.length ? (
 <p className="text-sm text-muted-foreground text-center py-6">Sin actividad</p>
 ) : (
 <div className="space-y-2">
 {actividad.ultimosAlumnos.map((a) => (
 <Link key={a.id} to={`/alumnos/${a.id}`}>
 <div className="flex items-center gap-3 p-2 rounded-md hover:bg-accent transition-colors">
 <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary shrink-0">
 {a.nombre?.[0]}{a.apellido?.[0]}
 </div>
 <div className="min-w-0 flex-1">
 <p className="text-sm font-medium truncate">{a.apellido}, {a.nombre}</p>
 <p className="text-xs text-muted-foreground font-medium">DNI {a.dni}</p>
 </div>
 <Badge variant={ESTADO_BADGE[a.estadoAlumno] || 'secondary'}>
 {label(a.estadoAlumno)}
 </Badge>
 </div>
 </Link>
 ))}
 </div>
 )}
 </Card>

 {/* Ultimas mesas */}
 <Card className="p-5">
 <SeccionTitulo to="/mesas-examen">Ultimas mesas</SeccionTitulo>
 {!actividad?.ultimasMesas?.length ? (
 <p className="text-sm text-muted-foreground text-center py-6">Sin actividad</p>
 ) : (
 <div className="space-y-2">
 {actividad.ultimasMesas.map((m) => (
 <div key={m.id} className="flex items-center gap-3 p-2 rounded-md">
 <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
 <CalendarDays className="w-4 h-4 text-primary" />
 </div>
 <div className="min-w-0 flex-1">
 <p className="text-sm font-medium truncate">
 {m.materia?.nombre || label(m.tipoMesa)}
 </p>
 <p className="text-xs text-muted-foreground font-medium">
 {new Date(m.fecha).toLocaleDateString('es-AR')} {m.hora}
 </p>
 </div>
 <Badge variant={ESTADO_BADGE[m.estado] || 'secondary'}>
 {label(m.estado)}
 </Badge>
 </div>
 ))}
 </div>
 )}
 </Card>
 </div>

 {/* Últimos certificados */}
 <Card className="p-5">
 <SeccionTitulo to="/certificados">Últimos certificados emitidos</SeccionTitulo>
 {!actividad?.ultimosCertificados?.length ? (
 <p className="text-sm text-muted-foreground text-center py-6">Sin actividad</p>
 ) : (
 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
 {actividad.ultimosCertificados.map((c) => (
 <div key={c.id} className="flex items-center gap-3 p-3 rounded-md border border-border">
 <Award className="w-5 h-5 text-primary shrink-0" />
 <div className="min-w-0 flex-1">
 <p className="text-sm font-medium truncate">
 {c.alumno?.apellido}, {c.alumno?.nombre}
 </p>
 <p className="text-xs text-muted-foreground font-medium">
 {label(c.tipo)} - {new Date(c.fechaEmision).toLocaleDateString('es-AR')}
 </p>
 </div>
 </div>
 ))}
 </div>
 )}
 </Card>
 </div>
 );
}