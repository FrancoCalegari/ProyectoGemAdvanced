import { useState, useEffect } from 'react';
import { Plus, Calendar, Clock, MapPin, Users, Eye, CheckCircle2, XCircle, Ban } from 'lucide-react';
import { toast } from 'sonner';
import { mesasService } from '../services/mesas.service';
import { titulosService } from '../services/titulos.service';
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

const ESTADO_MESA_BADGE = {
 PROGRAMADA: 'success',
 EN_CURSO: 'warning',
 FINALIZADA: 'muted',
 CANCELADA: 'danger',
};

const ESTADO_INSCRIPCION_BADGE = {
 INSCRIPTO: 'default',
 PRESENTE: 'success',
 AUSENTE: 'danger',
 CANCELADO: 'muted',
};

const AULAS_SUGERIDAS = [
 'Aula 1', 'Aula 2', 'Aula 3', 'Aula 4', 'Aula 5',
 'Laboratorio 1', 'Laboratorio 2',
 'Auditorio',
];

export default function MesasExamen() {
 const [mesas, setMesas] = useState([]);
 const [cargando, setCargando] = useState(true);
 const [filtroEstado, setFiltroEstado] = useState('');
 const [modalCrear, setModalCrear] = useState(false);
 const [mesaDetalle, setMesaDetalle] = useState(null);

 useEffect(() => {
 cargarMesas();
 }, [filtroEstado]);

 const cargarMesas = async () => {
 try {
 setCargando(true);
 const filtros = {};
 if (filtroEstado) filtros.estado = filtroEstado;
 const data = await mesasService.listar(filtros);
 setMesas(data);
 } catch (error) {
 toast.error('Error al cargar mesas');
 } finally {
 setCargando(false);
 }
 };

 return (
 <div className="space-y-6">
 <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
 <div>
 <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Mesas de Examen</h1>
 <p className="text-sm sm:text-base text-muted-foreground font-medium mt-1">
 Programa mesas y gestiona las inscripciones de los alumnos
 </p>
 </div>
 <Button onClick={() => setModalCrear(true)} className="w-full sm:w-auto">
 <Plus className="w-4 h-4 mr-2" />
 Nueva Mesa
 </Button>
 </div>

 <Card>
 <div className="p-4 border-b border-border">
 <div className="flex flex-col sm:flex-row gap-3">
 <select
 value={filtroEstado}
 onChange={(e) => setFiltroEstado(e.target.value)}
 className="h-10 px-3 rounded-md border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
 >
 <option value="">Todos los estados</option>
 <option value="PROGRAMADA">Programadas</option>
 <option value="EN_CURSO">En curso</option>
 <option value="FINALIZADA">Finalizadas</option>
 <option value="CANCELADA">Canceladas</option>
 </select>
 </div>
 </div>

 {cargando ? (
 <div className="p-8 text-center text-muted-foreground font-medium">Cargando...</div>
 ) : mesas.length === 0 ? (
 <div className="p-12 text-center">
 <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
 <h3 className="text-lg font-bold text-foreground mb-2">
 No hay mesas programadas
 </h3>
 <p className="text-muted-foreground text-sm">
 Programa una nueva mesa para que los alumnos se inscriban.
 </p>
 </div>
 ) : (
 <Table>
 <TableHeader>
 <TableRow>
 <TableHead>Materia</TableHead>
 <TableHead>Fecha</TableHead>
 <TableHead className="hidden sm:table-cell">Hora</TableHead>
 <TableHead className="hidden md:table-cell">Aula</TableHead>
 <TableHead>Inscriptos</TableHead>
 <TableHead>Estado</TableHead>
 <TableHead className="text-right">Acciones</TableHead>
 </TableRow>
 </TableHeader>
 <TableBody>
 {mesas.map((m) => (
 <TableRow key={m.id}>
 <TableCell className="font-medium">
 <div className="min-w-0">
 <p className="truncate">{m.materia?.nombre}</p>
 <p className="text-xs text-muted-foreground font-medium">
 {m.materia?.código}
 </p>
 </div>
 </TableCell>
 <TableCell className="text-sm whitespace-nowrap">
 {new Date(m.fecha).toLocaleDateString('es-AR')}
 </TableCell>
 <TableCell className="hidden sm:table-cell text-sm">
 {m.hora}
 </TableCell>
 <TableCell className="hidden md:table-cell text-sm">
 {m.aula || '—'}
 </TableCell>
 <TableCell>
 <Badge variant="muted">
 {m._count?.inscripciones || 0}
 {m.cupoMaximo ? ` / ${m.cupoMaximo}` : ''}
 </Badge>
 </TableCell>
 <TableCell>
 <Badge variant={ESTADO_MESA_BADGE[m.estado] || 'muted'}>
 {m.estado}
 </Badge>
 </TableCell>
 <TableCell className="text-right">
 <Button
 variant="ghost"
 size="icon"
 onClick={() => setMesaDetalle(m.id)}
 title="Ver detalle"
 >
 <Eye className="w-4 h-4" />
 </Button>
 </TableCell>
 </TableRow>
 ))}
 </TableBody>
 </Table>
 )}
 </Card>

 <ModalCrearMesa
 open={modalCrear}
 onClose={() => setModalCrear(false)}
 onCreada={() => {
 setModalCrear(false);
 cargarMesas();
 }}
 />

 <ModalDetalleMesa
 mesaId={mesaDetalle}
 onClose={() => setMesaDetalle(null)}
 onActualizada={cargarMesas}
 />
 </div>
 );
}

function ModalCrearMesa({ open, onClose, onCreada }) {
 const [títulos, setTítulos] = useState([]);
 const [títuloId, setTítuloId] = useState('');
 const [resoluciónes, setResoluciónes] = useState([]);
 const [resoluciónId, setResoluciónId] = useState('');
 const [materias, setMaterias] = useState([]);
 const [materiaId, setMateriaId] = useState('');
 const [fecha, setFecha] = useState('');
 const [hora, setHora] = useState('18:00');
 const [aula, setAula] = useState('');
 const [cupoMaximo, setCupoMaximo] = useState('');
 const [observaciones, setObservaciones] = useState('');
 const [cargando, setCargando] = useState(false);

 useEffect(() => {
 if (open) {
 setTítuloId('');
 setResoluciónId('');
 setMateriaId('');
 setFecha('');
 setHora('18:00');
 setAula('');
 setCupoMaximo('');
 setObservaciones('');
 cargarTítulos();
 }
 }, [open]);

 // Cargar títulos al abrir
 const cargarTítulos = async () => {
 try {
 const data = await titulosService.listar();
 setTítulos(data);
 } catch (error) {
 toast.error('Error al cargar títulos');
 }
 };

 // Cuando cambia título → cargar resoluciónes
 useEffect(() => {
 if (!títuloId) {
 setResoluciónes([]);
 return;
 }
 const t = títulos.find((x) => x.id === títuloId);
 setResoluciónes(t?.resoluciónes || []);
 setResoluciónId('');
 }, [títuloId, títulos]);

 // Cuando cambia resolución → cargar plan
 useEffect(() => {
 if (!resoluciónId) {
 setMaterias([]);
 return;
 }
 (async () => {
 try {
 const { data } = await api.get(`/curricular/resoluciónes/${resoluciónId}/plan`);
 const todasMaterias = data.flatMap((a) =>
 (a.materias || []).map((m) => ({
 id: m.id,
 nombre: m.nombre,
 código: m.código,
 anioNombre: a.nombre,
 }))
 );
 setMaterias(todasMaterias);
 setMateriaId('');
 } catch (error) {
 toast.error('Error al cargar materias');
 setMaterias([]);
 }
 })();
 }, [resoluciónId]);

 const handleSubmit = async (e) => {
 e.preventDefault();
 setCargando(true);
 try {
 const payload = {
 materiaId,
 fecha,
 hora,
 aula: aula || null,
 cupoMaximo: cupoMaximo ? parseInt(cupoMaximo) : null,
 observaciones: observaciones || null,
 };
 await mesasService.crear(payload);
 toast.success('Mesa creada');
 onCreada();
 } catch (error) {
 toast.error(error.response?.data?.message || 'Error al crear mesa');
 } finally {
 setCargando(false);
 }
 };

 return (
 <Modal open={open} onClose={onClose} title="Nueva Mesa de Examen" size="md">
 <form onSubmit={handleSubmit} className="space-y-4">
 <div>
 <label className="block text-sm font-medium mb-1 text-foreground">
 Carrera / Título
 </label>
 <select
 value={títuloId}
 onChange={(e) => setTítuloId(e.target.value)}
 className="w-full h-10 px-3 rounded-md border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
 required
 >
 <option value="">— Selecciona una carrera —</option>
 {títulos.map((t) => (
 <option key={t.id} value={t.id}>
 {t.nombre}
 </option>
 ))}
 </select>
 </div>

 <div>
 <label className="block text-sm font-medium mb-1 text-foreground">
 Resolución
 </label>
 <select
 value={resoluciónId}
 onChange={(e) => setResoluciónId(e.target.value)}
 className="w-full h-10 px-3 rounded-md border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
 disabled={!títuloId}
 required
 >
 <option value="">— Seleccioná una Resolución —</option>
 {resoluciónes.map((r) => (
 <option key={r.id} value={r.id}>
 {r.código} {r.estado === 'VIGENTE' ? '(vigente)' : `(${r.estado})`}
 </option>
 ))}
 </select>
 </div>

 <div>
 <label className="block text-sm font-medium mb-1 text-foreground">
 Materia
 </label>
 <select
 value={materiaId}
 onChange={(e) => setMateriaId(e.target.value)}
 className="w-full h-10 px-3 rounded-md border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
 disabled={!resoluciónId}
 required
 >
 <option value="">— Selecciona una materia —</option>
 {materias.map((m) => (
 <option key={m.id} value={m.id}>
 {m.anioNombre} — {m.código} {m.nombre}
 </option>
 ))}
 </select>
 </div>

 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
 <div>
  <label className="text-sm font-semibold text-foreground mb-1 block">Fecha</label>
  <DatePicker value={fecha} onChange={(v) => setFecha(v)} />
</div>
 <Input
 label="Hora"
 type="time"
 value={hora}
 onChange={(e) => setHora(e.target.value)}
 required
 />
 </div>

 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
 <div>
 <label className="block text-sm font-medium mb-1 text-foreground">
 Aula (opcional)
 </label>
 <select
 value={aula}
 onChange={(e) => setAula(e.target.value)}
 className="w-full h-10 px-3 rounded-md border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
 >
 <option value="">— Sin asignar —</option>
 {AULAS_SUGERIDAS.map((a) => (
 <option key={a} value={a}>{a}</option>
 ))}
 </select>
 </div>
 <Input
 label="Cupo maximo (opcional)"
 type="number"
 min="1"
 value={cupoMaximo}
 onChange={(e) => setCupoMaximo(e.target.value)}
 placeholder="Ej: 30"
 />
 </div>

 <div>
 <label className="block text-sm font-medium mb-1 text-foreground">
 Observaciones (opcional)
 </label>
 <textarea
 value={observaciones}
 onChange={(e) => setObservaciones(e.target.value)}
 rows={2}
 className="w-full px-3 py-2 rounded-md border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
 />
 </div>

 <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 pt-4 border-t border-border">
 <Button type="button" variant="outline" onClick={onClose} className="w-full sm:w-auto">
 Cancelar
 </Button>
 <Button type="submit" disabled={cargando || !materiaId} className="w-full sm:w-auto">
 {cargando ? 'Creando...' : 'Crear Mesa'}
 </Button>
 </div>
 </form>
 </Modal>
 );
}

function ModalDetalleMesa({ mesaId, onClose, onActualizada }) {
 const [mesa, setMesa] = useState(null);
 const [inscripciones, setInscripciones] = useState([]);
 const [cargando, setCargando] = useState(false);

 useEffect(() => {
 if (mesaId) {
 setCargando(true);
 Promise.all([
 mesasService.obtenerPorId(mesaId),
 mesasService.listarInscripciones(mesaId),
 ])
 .then(([m, i]) => {
 setMesa(m);
 setInscripciones(i);
 })
 .catch(() => toast.error('Error al cargar mesa'))
 .finally(() => setCargando(false));
 } else {
 setMesa(null);
 setInscripciones([]);
 }
 }, [mesaId]);

 const cambiarEstadoMesa = async (nuevoEstado) => {
 try {
 await mesasService.actualizarEstado(mesa.id, { estado: nuevoEstado });
 toast.success(`Mesa marcada como ${nuevoEstado}`);
 const m = await mesasService.obtenerPorId(mesa.id);
 setMesa(m);
 onActualizada?.();
 } catch (error) {
 toast.error(error.response?.data?.message || 'Error');
 }
 };

 const marcarAsistencia = async (alumnoId, estado) => {
 try {
 await mesasService.registrarAsistencia(mesa.id, alumnoId, { estado });
 toast.success(`Alumno marcado como ${estado}`);
 const i = await mesasService.listarInscripciones(mesa.id);
 setInscripciones(i);
 } catch (error) {
 toast.error(error.response?.data?.message || 'Error');
 }
 };

 return (
 <Modal
 open={!!mesaId}
 onClose={onClose}
 title={mesa ? `Mesa: ${mesa.materia?.nombre}` : 'Cargando...'}
 size="xl"
 >
 {cargando ? (
 <p className="text-muted-foreground">Cargando...</p>
 ) : mesa ? (
 <div className="space-y-4">
 <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
 <InfoBox icon={Calendar} label="Fecha" value={new Date(mesa.fecha).toLocaleDateString('es-AR')} />
 <InfoBox icon={Clock} label="Hora" value={mesa.hora} />
 <InfoBox icon={MapPin} label="Aula" value={mesa.aula || '—'} />
 <InfoBox icon={Users} label="Inscriptos" value={`${inscripciones.length}${mesa.cupoMaximo ? ` / ${mesa.cupoMaximo}` : ''}`} />
 </div>

 <div className="flex flex-wrap gap-2">
 <Badge variant={ESTADO_MESA_BADGE[mesa.estado] || 'muted'}>
 {mesa.estado}
 </Badge>
 {mesa.estado === 'PROGRAMADA' && (
 <>
 <Button size="sm" variant="outline" onClick={() => cambiarEstadoMesa('EN_CURSO')}>
 Poner en curso
 </Button>
 <Button size="sm" variant="outline" onClick={() => cambiarEstadoMesa('CANCELADA')}>
 <Ban className="w-4 h-4 mr-1" />
 Cancelar mesa
 </Button>
 </>
 )}
 {mesa.estado === 'EN_CURSO' && (
 <Button size="sm" variant="outline" onClick={() => cambiarEstadoMesa('FINALIZADA')}>
 Finalizar mesa
 </Button>
 )}
 </div>

 <div className="border-t border-border pt-4">
 <h3 className="text-sm font-semibold mb-3">Inscriptos</h3>
 {inscripciones.length === 0 ? (
 <p className="text-sm text-muted-foreground text-center py-6">
 No hay alumnos inscriptos en esta mesa.
 </p>
 ) : (
 <div className="space-y-2">
 {inscripciones.map((i) => (
 <div
 key={i.id}
 className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 rounded-md border border-border"
 >
 <div className="min-w-0">
 <p className="text-sm font-semibold text-foreground">
 {i.alumno?.apellido}, {i.alumno?.nombre}
 </p>
 <p className="text-xs text-muted-foreground font-medium">
 DNI {i.alumno?.dni}
 </p>
 </div>
 <div className="flex items-center gap-2 flex-wrap">
 <Badge variant={ESTADO_INSCRIPCION_BADGE[i.estado] || 'muted'}>
 {i.estado}
 </Badge>
 {i.estado === 'INSCRIPTO' && mesa.estado !== 'CANCELADA' && (
 <>
 <Button
 size="sm"
 variant="outline"
 onClick={() => marcarAsistencia(i.alumnoId, 'PRESENTE')}
 >
 <CheckCircle2 className="w-4 h-4 mr-1 text-green-600" />
 Presente
 </Button>
 <Button
 size="sm"
 variant="outline"
 onClick={() => marcarAsistencia(i.alumnoId, 'AUSENTE')}
 >
 <XCircle className="w-4 h-4 mr-1 text-red-600" />
 Ausente
 </Button>
 </>
 )}
 </div>
 </div>
 ))}
 </div>
 )}
 </div>
 </div>
 ) : null}
 </Modal>
 );
}

function InfoBox({ icon: Icon, label, value }) {
 return (
 <div className="p-3 rounded-md bg-muted/50">
 <div className="flex items-center gap-1.5 mb-1">
 <Icon className="w-3.5 h-3.5 text-muted-foreground" />
 <p className="text-xs text-muted-foreground font-medium">{label}</p>
 </div>
 <p className="text-sm font-semibold text-foreground truncate">{value}</p>
 </div>
 );
}