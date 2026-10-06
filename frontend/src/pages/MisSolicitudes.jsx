import { useState, useEffect } from 'react';
import { Plus, Search, Pencil, Trash2, FileText, Clock, CheckCircle2, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { solicitudesService } from '../services/solicitudes.service';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../components/ui/Table';
const TIPOS = [
 { value: 'CAMBIO_HORARIO', label: 'Cambio de horario' },
 { value: 'AUSENCIA_PROGRAMADA', label: 'Ausencia programada' },
 { value: 'CAMBIO_MATERIA', label: 'Cambio de materia' },
 { value: 'OTRO', label: 'Otro' },
];
const ESTADOS = [
 { value: 'PENDIENTE', label: 'Pendiente', variant: 'secondary', icon: Clock },
 { value: 'APROBADA', label: 'Aprobada', variant: 'default', icon: CheckCircle2 },
 { value: 'RECHAZADA', label: 'Rechazada', variant: 'destructive', icon: XCircle },
];
export default function MisSolicitudes() {
 const { usuario, isAlumno, isProfesor } = useAuth();
 const [solicitudes, setSolicitudes] = useState([]);
 const [cargando, setCargando] = useState(true);
 const [busqueda, setBusqueda] = useState('');
 const [filtroEstado, setFiltroEstado] = useState('');
 const [modalCrear, setModalCrear] = useState(false);
 const [modalEditar, setModalEditar] = useState(null);
 const [modalEliminar, setModalEliminar] = useState(null);
 const [form, setForm] = useState({ tipo: 'CAMBIO_HORARIO', comentario: '' });
 const [guardando, setGuardando] = useState(false);
 useEffect(() => { cargar(); }, []);
 const cargar = async () => {
 try {
 setCargando(true);
 const data = await solicitudesService.misSolicitudes();
 setSolicitudes(data);
 } catch (error) {
 toast.error('Error al cargar solicitudes');
 } finally {
 setCargando(false);
 }
 };
 const handleCrear = async (e) => {
 e.preventDefault();
 if (!form.comentario.trim()) {
 toast.error('Escribi un comentario');
 return;
 }
 setGuardando(true);
 try {
 await solicitudesService.crear(form);
 toast.success('Solicitud enviada');
 setModalCrear(false);
 setForm({ tipo: 'CAMBIO_HORARIO', comentario: '' });
 cargar();
 } catch (error) {
 toast.error(error.response?.data?.message || 'Error al crear');
 } finally {
 setGuardando(false);
 }
 };
 const handleEditar = async (e) => {
 e.preventDefault();
 if (!modalEditar) return;
 setGuardando(true);
 try {
 await solicitudesService.actualizar(modalEditar.id, {
 tipo: modalEditar.tipo,
 comentario: modalEditar.comentario,
 });
 toast.success('Solicitud actualizada');
 setModalEditar(null);
 cargar();
 } catch (error) {
 toast.error(error.response?.data?.message || 'Error al editar');
 } finally {
 setGuardando(false);
 }
 };
 const handleEliminar = async () => {
 if (!modalEliminar) return;
 try {
 await solicitudesService.eliminar(modalEliminar.id);
 toast.success('Solicitud eliminada');
 setModalEliminar(null);
 cargar();
 } catch (error) {
 toast.error(error.response?.data?.message || 'Error al eliminar');
 }
 };
 const filtradas = solicitudes.filter((s) => {
 if (filtroEstado && s.estado !== filtroEstado) return false;
 if (!busqueda) return true;
 const q = busqueda.toLowerCase();
 return (
 s.comentario?.toLowerCase().includes(q) ||
 TIPOS.find((t) => t.value === s.tipo)?.label.toLowerCase().includes(q)
 );
 });
 if (!isAlumno && !isProfesor) {
 return (
 <div className="space-y-6">
 <h1 className="text-2xl sm:text-3xl font-bold">Mis Solicitudes</h1>
 <Card>
 <div className="p-12 text-center">
 <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
 <p className="text-muted-foreground">Solo alumnos y profesores pueden tener solicitudes.</p>
 </div>
 </Card>
 </div>
 );
 }
 return (
 <div className="space-y-6">
 <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
 <div>
 <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Mis Solicitudes</h1>
 <p className="text-sm sm:text-base text-muted-foreground font-medium mt-1">
 Pedidos a la institución que secretaria resolvera
 </p>
 </div>
 <Button onClick={() => setModalCrear(true)} className="w-full sm:w-auto">
 <Plus className="w-4 h-4 mr-2" />
 Nueva Solicitud
 </Button>
 </div>
 <Card>
 <div className="p-4 border-b border-border flex flex-col sm:flex-row gap-3">
 <div className="relative flex-1">
 <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
 <Input
 placeholder="Buscar por comentario o tipo..."
 value={busqueda}
 onChange={(e) => setBusqueda(e.target.value)}
 className="pl-10"
 />
 </div>
 <select
 value={filtroEstado}
 onChange={(e) => setFiltroEstado(e.target.value)}
 className="h-10 px-3 rounded-md border border-border bg-background text-sm"
 >
 <option value="">Todos los estados</option>
 {ESTADOS.map((e) => <option key={e.value} value={e.value}>{e.label}</option>)}
 </select>
 </div>
 {cargando ? (
 <div className="p-8 text-center text-muted-foreground font-medium">Cargando...</div>
 ) : filtradas.length === 0 ? (
 <div className="p-8 text-center text-muted-foreground font-medium">
 {solicitudes.length === 0
 ? 'No tenes solicitudes. Hace click en "Nueva Solicitud" para crear una.'
 : 'No se encontraron resultados con esos filtros'}
 </div>
 ) : (
 <Table>
 <TableHeader>
 <TableRow>
 <TableHead>Tipo</TableHead>
 <TableHead>Comentario</TableHead>
 <TableHead>Estado</TableHead>
 <TableHead>Fecha</TableHead>
 <TableHead>Respuesta</TableHead>
 <TableHead className="text-right">Acciones</TableHead>
 </TableRow>
 </TableHeader>
 <TableBody>
 {filtradas.map((s) => {
 const estadoInfo = ESTADOS.find((e) => e.value === s.estado);
 const Icon = estadoInfo?.icon || Clock;
 return (
 <TableRow key={s.id}>
 <TableCell className="font-medium">
 {TIPOS.find((t) => t.value === s.tipo)?.label || s.tipo}
 </TableCell>
 <TableCell className="max-w-md">
 <p className="text-sm truncate">{s.comentario}</p>
 </TableCell>
 <TableCell>
 <Badge variant={estadoInfo?.variant}>
 <Icon className="w-3 h-3 mr-1" />
 {estadoInfo?.label || s.estado}
 </Badge>
 </TableCell>
 <TableCell className="text-sm text-muted-foreground">
 {new Date(s.createdAt).toLocaleDateString('es-AR')}
 </TableCell>
 <TableCell className="max-w-xs">
 {s.respuesta ? (
 <p className="text-sm text-muted-foreground truncate" title={s.respuesta}>
 {s.respuesta}
 </p>
 ) : (
 <span className="text-xs text-muted-foreground font-medium">-</span>
 )}
 </TableCell>
 <TableCell className="text-right">
 {s.estado === 'PENDIENTE' && (
 <div className="flex justify-end gap-1">
 <Button
 variant="ghost"
 size="sm"
 onClick={() => setModalEditar({ ...s })}
 title="Editar"
 >
 <Pencil className="w-4 h-4" />
 </Button>
 <Button
 variant="ghost"
 size="sm"
 onClick={() => setModalEliminar(s)}
 title="Eliminar"
 >
 <Trash2 className="w-4 h-4 text-destructive" />
 </Button>
 </div>
 )}
 </TableCell>
 </TableRow>
 );
 })}
 </TableBody>
 </Table>
 )}
 </Card>
 {/* Modal Crear */}
 <Modal open={modalCrear} onClose={() => setModalCrear(false)} title="Nueva Solicitud" size="md">
 <form onSubmit={handleCrear} className="space-y-4">
 <div>
 <label className="block text-sm font-medium mb-1">Tipo</label>
 <select
 value={form.tipo}
 onChange={(e) => setForm({ ...form, tipo: e.target.value })}
 className="w-full h-10 px-3 rounded-md border border-border bg-background"
 >
 {TIPOS.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
 </select>
 </div>
 <div>
 <label className="block text-sm font-medium mb-1">Comentario / Observacion</label>
 <textarea
 value={form.comentario}
 onChange={(e) => setForm({ ...form, comentario: e.target.value })}
 className="w-full min-h-[120px] px-3 py-2 rounded-md border border-border bg-background text-sm"
 placeholder="Describi tu pedido con el mayor detalle posible..."
 required
 />
 <p className="text-xs text-muted-foreground mt-1">
 Secretaria revisara tu solicitud y te respondera a la brevedad.
 </p>
 </div>
 <div className="flex justify-end gap-2 pt-4 border-t border-border">
 <Button type="button" variant="outline" onClick={() => setModalCrear(false)}>Cancelar</Button>
 <Button type="submit" disabled={guardando}>
 {guardando ? 'Enviando...' : 'Enviar Solicitud'}
 </Button>
 </div>
 </form>
 </Modal>
 {/* Modal Editar */}
 <Modal
 open={!!modalEditar}
 onClose={() => setModalEditar(null)}
 title="Editar Solicitud"
 size="md"
 >
 {modalEditar && (
 <form onSubmit={handleEditar} className="space-y-4">
 <div>
 <label className="block text-sm font-medium mb-1">Tipo</label>
 <select
 value={modalEditar.tipo}
 onChange={(e) => setModalEditar({ ...modalEditar, tipo: e.target.value })}
 className="w-full h-10 px-3 rounded-md border border-border bg-background"
 >
 {TIPOS.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
 </select>
 </div>
 <div>
 <label className="block text-sm font-medium mb-1">Comentario</label>
 <textarea
 value={modalEditar.comentario}
 onChange={(e) => setModalEditar({ ...modalEditar, comentario: e.target.value })}
 className="w-full min-h-[120px] px-3 py-2 rounded-md border border-border bg-background text-sm"
 required
 />
 </div>
 <div className="flex justify-end gap-2 pt-4 border-t border-border">
 <Button type="button" variant="outline" onClick={() => setModalEditar(null)}>Cancelar</Button>
 <Button type="submit" disabled={guardando}>
 {guardando ? 'Guardando...' : 'Guardar cambios'}
 </Button>
 </div>
 </form>
 )}
 </Modal>
 {/* Modal Eliminar */}
 <Modal
 open={!!modalEliminar}
 onClose={() => setModalEliminar(null)}
 title="Eliminar Solicitud"
 >
 <div className="space-y-4">
 <p className="text-sm">
 ¿Estás seguro que queres eliminar esta solicitud? Esta accion no se puede deshacer.
 </p>
 <p className="text-sm text-muted-foreground italic">
 "{modalEliminar?.comentario}"
 </p>
 <div className="flex justify-end gap-2 pt-2 border-t border-border">
 <Button variant="outline" onClick={() => setModalEliminar(null)}>Cancelar</Button>
 <Button variant="destructive" onClick={handleEliminar}>Eliminar</Button>
 </div>
 </div>
 </Modal>
 </div>
 );
}