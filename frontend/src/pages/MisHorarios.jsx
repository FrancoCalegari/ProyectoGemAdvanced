import { useState, useEffect } from 'react';
import { Clock, MapPin, BellRing, CalendarClock, History, UserCircle, CheckCheck, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { empleadosService, nombreDia } from '../services/empleados.service';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../components/ui/Table';

const ESTADO_BADGE = {
 PENDIENTE: 'warning',
 APROBADA: 'success',
 RECHAZADA: 'destructive',
};

const TIPO_LABEL = {
 CERTIFICADO_SALUD: 'Certificado de salud',
 JUSTIFICATIVO_FALTA: 'Justificativo de falta',
 ACCIDENTE_LABORAL: 'Accidente laboral',
 ENFERMEDAD: 'Enfermedad',
 RAZON_PARTICULAR: 'Razón particular',
 OTRO: 'Otro',
};

function fecha(v) {
 if (!v) return '—';
 return new Date(v).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function fechaHora(v) {
 if (!v) return '—';
 return new Date(v).toLocaleString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export default function MisHorarios() {
 const { usuario } = useAuth();
 const [datos, setDatos] = useState(null);
 const [cargando, setCargando] = useState(true);
 const [marcando, setMarcando] = useState(false);

 const cargar = async () => {
 try {
 setCargando(true);
 const data = await empleadosService.miHistorial();
 setDatos(data);
 } catch (error) {
 toast.error(error.response?.data?.message || 'No se pudo cargar tu panel');
 } finally {
 setCargando(false);
 }
 };

 useEffect(() => { cargar(); }, []);

 const marcarVistas = async () => {
 try {
 setMarcando(true);
 const r = await empleadosService.marcarModificacionesVistas();
 toast.success(r.marcadas > 0 ? `${r.marcadas} modificación(es) marcadas como vistas` : 'No había novedades pendientes');
 await cargar();
 } catch (error) {
 toast.error(error.response?.data?.message || 'No se pudo actualizar');
 } finally {
 setMarcando(false);
 }
 };

 if (cargando) {
 return <div className="flex items-center justify-center py-20 text-muted-foreground">Cargando tu panel...</div>;
 }

 if (!datos) {
 return (
 <Card>
 <div className="p-8 text-center text-muted-foreground">
 <AlertCircle className="w-8 h-8 mx-auto mb-3 opacity-60" />
 <p className="text-sm">No se pudo cargar tu información.</p>
 </div>
 </Card>
 );
 }

 const { empleado, horarios, modificaciones, justificativos, resumen } = datos;
 const vigentes = horarios.filter((h) => h.activo);
 const anteriores = horarios.filter((h) => !h.activo);
 const sinVer = resumen.modificacionesSinVer;

 return (
 <div className="space-y-6">
 <div className="flex flex-wrap items-start justify-between gap-3">
 <div>
 <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Mis horarios de trabajo</h1>
 <p className="text-sm text-muted-foreground font-medium mt-1">
 {empleado.nombre} {empleado.apellido} · {empleado.cargo === 'CELADOR' ? 'Celador' : empleado.cargo === 'BEDEL' ? 'Bedel' : 'Personal no docente'}
 {empleado.sector ? ` · ${empleado.sector}` : ''}
 </p>
 </div>
 <Badge variant={empleado.estado === 'ACTIVO' ? 'success' : 'muted'}>
 {empleado.estado === 'ACTIVO' ? 'En funciones' : 'Dado de baja'}
 </Badge>
 </div>

 {sinVer > 0 && (
 <div className="rounded-lg border border-amber-500/40 bg-amber-500/10 p-4 flex flex-wrap items-center justify-between gap-3">
 <div className="flex items-center gap-3">
 <BellRing className="w-5 h-5 text-amber-500 shrink-0" />
 <div>
 <p className="text-sm font-semibold text-foreground">
 {sinVer === 1 ? 'Tenés 1 modificación de horario sin ver' : `Tenés ${sinVer} modificaciones de horario sin ver`}
 </p>
 <p className="text-xs text-muted-foreground">Revisá los cambios más abajo y marcalos como vistos.</p>
 </div>
 </div>
 <Button size="sm" variant="outline" onClick={marcarVistas} disabled={marcando}>
 <CheckCheck className="w-4 h-4 mr-2" />
 {marcando ? 'Marcando...' : 'Marcar como vistas'}
 </Button>
 </div>
 )}

 <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
 <Card>
 <div className="p-4">
 <div className="flex items-center gap-2 text-muted-foreground text-xs font-medium uppercase tracking-wide">
 <Clock className="w-4 h-4" /> Turnos vigentes
 </div>
 <p className="text-2xl font-bold text-foreground mt-2">{vigentes.length}</p>
 <p className="text-xs text-muted-foreground mt-1">Semana actual</p>
 </div>
 </Card>
 <Card>
 <div className="p-4">
 <div className="flex items-center gap-2 text-muted-foreground text-xs font-medium uppercase tracking-wide">
 <BellRing className="w-4 h-4" /> Modificaciones
 </div>
 <p className="text-2xl font-bold text-foreground mt-2">{resumen.modificaciones}</p>
 <p className="text-xs text-muted-foreground mt-1">{sinVer} sin ver</p>
 </div>
 </Card>
 <Card>
 <div className="p-4">
 <div className="flex items-center gap-2 text-muted-foreground text-xs font-medium uppercase tracking-wide">
 <History className="w-4 h-4" /> Justificativos
 </div>
 <p className="text-2xl font-bold text-foreground mt-2">{resumen.justificativos}</p>
 <p className="text-xs text-muted-foreground mt-1">{resumen.pendientes} pendientes · {resumen.aprobados} aprobados</p>
 </div>
 </Card>
 <Card>
 <div className="p-4">
 <div className="flex items-center gap-2 text-muted-foreground text-xs font-medium uppercase tracking-wide">
 <UserCircle className="w-4 h-4" /> Legajo
 </div>
 <p className="text-2xl font-bold text-foreground mt-2">#{empleado.dni}</p>
 <p className="text-xs text-muted-foreground mt-1">Ingreso: {fecha(empleado.fechaIngreso)}</p>
 </div>
 </Card>
 </div>

 <Card>
 <div className="p-4 sm:p-5 border-b border-border flex items-center gap-2">
 <Clock className="w-5 h-5 text-primary" />
 <h2 className="text-base font-semibold text-foreground">Mis turnos vigentes</h2>
 </div>
 {vigentes.length === 0 ? (
 <div className="p-6 text-center text-sm text-muted-foreground">Todavía no tenés turnos asignados.</div>
 ) : (
 <Table>
 <TableHeader>
 <TableRow>
 <TableHead>Día</TableHead>
 <TableHead>Horario</TableHead>
 <TableHead>Sector</TableHead>
 <TableHead>Vigente desde</TableHead>
 </TableRow>
 </TableHeader>
 <TableBody>
 {vigentes.map((h) => (
 <TableRow key={h.id}>
 <TableCell className="font-medium text-foreground">{nombreDia(h.diaSemana)}</TableCell>
 <TableCell>{h.horaInicio} - {h.horaFin}</TableCell>
 <TableCell>
 <span className="inline-flex items-center gap-1.5 text-muted-foreground">
 <MapPin className="w-3.5 h-3.5" /> {h.sector || 'Sin sector'}
 </span>
 </TableCell>
 <TableCell className="text-muted-foreground">{fecha(h.vigenteDesde)}</TableCell>
 </TableRow>
 ))}
 </TableBody>
 </Table>
 )}
 </Card>

 <Card>
 <div className="p-4 sm:p-5 border-b border-border flex items-center gap-2">
 <AlertCircle className="w-5 h-5 text-primary" />
 <h2 className="text-base font-semibold text-foreground">Modificaciones de horario</h2>
 </div>
 {modificaciones.length === 0 ? (
 <div className="p-6 text-center text-sm text-muted-foreground">Sin modificaciones registradas.</div>
 ) : (
 <div className="divide-y divide-border">
 {modificaciones.map((m) => (
 <div key={m.id} className="p-4 sm:p-5 flex flex-wrap items-start justify-between gap-3">
 <div className="min-w-0">
 <div className="flex items-center gap-2 flex-wrap">
 <Badge variant={m.tipo === 'BAJA' ? 'destructive' : m.tipo === 'ALTA' ? 'success' : 'warning'}>
 {m.tipo === 'ALTA' ? 'Alta' : m.tipo === 'CAMBIO' ? 'Cambio' : 'Baja'}
 </Badge>
 {!m.visto && <Badge variant="info">Nueva</Badge>}
 <span className="text-xs text-muted-foreground">{fechaHora(m.createdAt)}</span>
 </div>
 <p className="text-sm text-foreground mt-1.5">{m.detalle}</p>
 {m.motivo && <p className="text-xs text-muted-foreground mt-1">Motivo: {m.motivo}</p>}
 {m.cambiadoPor && (
 <p className="text-xs text-muted-foreground mt-1">
 Registrado por {m.cambiadoPor.nombre} {m.cambiadoPor.apellido}
 </p>
 )}
 </div>
 </div>
 ))}
 </div>
 )}
 </Card>

 <Card>
 <div className="p-4 sm:p-5 border-b border-border flex items-center gap-2">
 <CalendarClock className="w-5 h-5 text-primary" />
 <h2 className="text-base font-semibold text-foreground">Historial de turnos</h2>
 </div>
 {anteriores.length === 0 ? (
 <div className="p-6 text-center text-sm text-muted-foreground">No tenés turnos anteriores.</div>
 ) : (
 <Table>
 <TableHeader>
 <TableRow>
 <TableHead>Día</TableHead>
 <TableHead>Horario</TableHead>
 <TableHead>Sector</TableHead>
 <TableHead>Desde</TableHead>
 <TableHead>Hasta</TableHead>
 </TableRow>
 </TableHeader>
 <TableBody>
 {anteriores.map((h) => (
 <TableRow key={h.id}>
 <TableCell className="font-medium text-foreground">{nombreDia(h.diaSemana)}</TableCell>
 <TableCell>{h.horaInicio} - {h.horaFin}</TableCell>
 <TableCell className="text-muted-foreground">{h.sector || '—'}</TableCell>
 <TableCell className="text-muted-foreground">{fecha(h.vigenteDesde)}</TableCell>
 <TableCell className="text-muted-foreground">{fecha(h.vigenteHasta)}</TableCell>
 </TableRow>
 ))}
 </TableBody>
 </Table>
 )}
 </Card>

 <Card>
 <div className="p-4 sm:p-5 border-b border-border flex items-center gap-2">
 <History className="w-5 h-5 text-primary" />
 <h2 className="text-base font-semibold text-foreground">Mis justificativos presentados</h2>
 </div>
 {justificativos.length === 0 ? (
 <div className="p-6 text-center text-sm text-muted-foreground">
 Todavía no presentaste certificados ni justificativos.
 </div>
 ) : (
 <Table>
 <TableHeader>
 <TableRow>
 <TableHead>Tipo</TableHead>
 <TableHead>Desde</TableHead>
 <TableHead>Hasta</TableHead>
 <TableHead>Estado</TableHead>
 </TableRow>
 </TableHeader>
 <TableBody>
 {justificativos.map((l) => (
 <TableRow key={l.id}>
 <TableCell className="font-medium text-foreground">{TIPO_LABEL[l.tipo] || l.tipo}</TableCell>
 <TableCell>{fecha(l.fechaDesde)}</TableCell>
 <TableCell>{fecha(l.fechaHasta)}</TableCell>
 <TableCell>
 <Badge variant={ESTADO_BADGE[l.estado] || 'muted'}>{l.estado}</Badge>
 </TableCell>
 </TableRow>
 ))}
 </TableBody>
 </Table>
 )}
 </Card>

 <p className="text-xs text-muted-foreground">
 Tus datos de contacto los podés editar desde <span className="font-medium">Mi Cuenta</span>.
 </p>
 </div>
 );
}
