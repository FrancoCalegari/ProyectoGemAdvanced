import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
 Search, Eye, Trash2, RotateCcw, UserCheck, UserX, GraduationCap, Clock,
 ArrowLeft, ChevronLeft, ChevronRight, Users
} from 'lucide-react';
import { toast } from 'sonner';
import { alumnosService } from '../services/alumnos.service';
import { ModalDetalleAlumno } from './Alumnos';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { useAuth } from '../contexts/AuthContext';
const ESTADOS = [
 { value: 'ACTIVO', label: 'Activos', singular: 'Activo', icon: UserCheck, color: 'text-green-600', bg: 'bg-green-500/10' },
 { value: 'EGRESADO', label: 'Egresados', singular: 'Egresado', icon: GraduationCap, color: 'text-blue-600', bg: 'bg-blue-500/10' },
 { value: 'BAJA', label: 'Bajas', singular: 'Baja', icon: UserX, color: 'text-red-600', bg: 'bg-red-500/10' },
 { value: 'INACTIVO', label: 'Inactivos', singular: 'Inactivo', icon: Clock, color: 'text-gray-600', bg: 'bg-gray-500/10' },
];
const ESTADO_BADGE = {
 ACTIVO: { label: 'Activo', variant: 'default' },
 EGRESADO: { label: 'Egresado', variant: 'secondary' },
 BAJA: { label: 'Baja', variant: 'destructive' },
 INACTIVO: { label: 'Inactivo', variant: 'secondary' },
};
const MENSAJE_BAJA = 'No es posible eliminar los datos de un alumno. Por normativa instituciónal, todos los registros academicos se conservan de forma permanente para garantizar la trazabilidad y el historial completo.\n\nDeseas dar de baja al alumno?\nLa baja conserva todo su historial y podes reactivarlo cuando lo necesites.';
const POR_PAGINA = 10;
export default function HistorialAlumnos() {
 const { isAdmin, isSecretaria } = useAuth();
 const [alumnos, setAlumnos] = useState([]);
 const [cargando, setCargando] = useState(true);
 const [estadoActivo, setEstadoActivo] = useState(null);
 const [busqueda, setBusqueda] = useState('');
 const [pagina, setPagina] = useState(1);
 const [modalBaja, setModalBaja] = useState(null);
 const [modalDetalle, setModalDetalle] = useState(null);
 const [modalEstado, setModalEstado] = useState(null);
 useEffect(() => { cargar(); }, []);
 const cargar = async () => {
 try {
 setCargando(true);
 const data = await alumnosService.historial();
 setAlumnos(data);
 } catch (error) {
 toast.error('Error al cargar historial');
 } finally {
 setCargando(false);
 }
 };
 const handleBaja = async () => {
 if (!modalBaja) return;
 try {
 await alumnosService.darDeBaja(modalBaja.id);
 toast.success('Alumno dado de baja');
 setModalBaja(null);
 cargar();
 } catch (error) {
 toast.error(error.response?.data?.message || 'Error al dar de baja');
 }
 };
 const handleReactivar = async (id) => {
 if (!confirm('Reactivar este alumno?')) return;
 try {
 await alumnosService.reactivar(id);
 toast.success('Alumno reactivado');
 cargar();
 } catch (error) {
 toast.error(error.response?.data?.message || 'Error al reactivar');
 }
 };
 const handleCambiarEstado = async (id, estado) => {
 try {
 await alumnosService.cambiarEstado(id, estado);
 toast.success(`Estado cambiado a ${ESTADO_BADGE[estado]?.label || estado}`);
 setModalEstado(null);
 cargar();
 } catch (error) {
 toast.error(error.response?.data?.message || 'Error al cambiar estado');
 }
 };
 const contarPorEstado = (estado) => alumnos.filter((a) => a.estadoAlumno === estado).length;
 // Alumnos filtrados por estado + busqueda
 const alumnosFiltrados = estadoActivo
 ? alumnos.filter((a) => {
 if (a.estadoAlumno !== estadoActivo) return false;
 if (!busqueda) return true;
 const q = busqueda.toLowerCase();
 return (
 a.nombre?.toLowerCase().includes(q) ||
 a.apellido?.toLowerCase().includes(q) ||
 a.dni?.includes(q) ||
 a.email?.toLowerCase().includes(q)
 );
 })
 : [];
 const totalPaginas = Math.max(1, Math.ceil(alumnosFiltrados.length / POR_PAGINA));
 const paginaActual = Math.min(pagina, totalPaginas);
 const alumnosPagina = alumnosFiltrados.slice((paginaActual - 1) * POR_PAGINA, paginaActual * POR_PAGINA);
 if (!isAdmin && !isSecretaria) {
 return (
 <div className="space-y-6">
 <h1 className="text-2xl sm:text-3xl font-bold">Historial de Alumnos</h1>
 <Card><div className="p-12 text-center text-muted-foreground font-medium">Acceso restringido</div></Card>
 </div>
 );
 }
 // ============================================================
 // VISTA 1: TARJETAS
 // ============================================================
 if (!estadoActivo) {
 return (
 <div className="space-y-6">
 <div>
 <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Historial de Alumnos</h1>
 <p className="text-sm sm:text-base text-muted-foreground font-medium mt-1">
 Registro completo de todos los alumnos. Los datos nunca se eliminan, solo cambian de estado.
 </p>
 </div>
 {cargando ? (
 <div className="p-8 text-center text-muted-foreground font-medium">Cargando...</div>
 ) : (
 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
 {ESTADOS.map((e) => {
 const Icon = e.icon;
 const count = contarPorEstado(e.value);
 return (
 <button
 key={e.value}
 onClick={() => { setEstadoActivo(e.value); setPagina(1); setBusqueda(''); }}
 className="text-left"
 >
 <Card className="p-6 hover:border-primary/50 hover:shadow-md transition-all cursor-pointer">
 <div className="flex items-start justify-between">
 <div className={`w-12 h-12 rounded-lg ${e.bg} flex items-center justify-center`}>
 <Icon className={`w-6 h-6 ${e.color}`} />
 </div>
 <ChevronRight className="w-5 h-5 text-muted-foreground" />
 </div>
 <div className="mt-4">
 <p className="text-3xl font-bold text-foreground">{count}</p>
 <p className="text-sm text-muted-foreground font-medium mt-1">{e.label}</p>
 </div>
 </Card>
 </button>
 );
 })}
 </div>
 )}
 </div>
 );
 }
 // ============================================================
 // VISTA 2: LISTA EXPANDIDA
 // ============================================================
 const estadoInfo = ESTADOS.find((e) => e.value === estadoActivo);
 const Icon = estadoInfo?.icon || Users;
 return (
 <div className="space-y-6">
 <div className="flex items-center gap-3">
 <button
 onClick={() => { setEstadoActivo(null); setBusqueda(''); setPagina(1); }}
 className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-card border border-transparent hover:border-border transition-all"
 >
 <ArrowLeft className="w-4 h-4" /> Volver a estados
 </button>
 </div>
 <div className="flex items-center gap-3">
 <div className={`w-12 h-12 rounded-lg ${estadoInfo?.bg} flex items-center justify-center`}>
 <Icon className={`w-6 h-6 ${estadoInfo?.color}`} />
 </div>
 <div>
 <h1 className="text-2xl font-bold">{estadoInfo?.label}</h1>
 <p className="text-sm text-muted-foreground">
 {alumnosFiltrados.length} alumno{alumnosFiltrados.length !== 1 ? 's' : ''} en este estado
 </p>
 </div>
 </div>
 <Card>
 <div className="p-4 border-b border-border">
 <div className="relative max-w-md">
 <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
 <Input
 placeholder="Buscar por nombre, apellido, DNI o email..."
 value={busqueda}
 onChange={(e) => { setBusqueda(e.target.value); setPagina(1); }}
 className="pl-10"
 />
 </div>
 </div>
 {alumnosFiltrados.length === 0 ? (
 <div className="p-8 text-center text-muted-foreground font-medium">
 {busqueda ? 'No se encontraron resultados' : `No hay alumnos en estado ${estadoInfo?.label.toLowerCase()}`}
 </div>
 ) : (
 <>
 <table className="w-full">
 <thead className="bg-muted/50">
 <tr>
 <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-4 py-3">Nombre</th>
 <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-4 py-3">DNI</th>
 <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-4 py-3">Email</th>
 <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-4 py-3">Inscrip.</th>
 <th className="text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider px-4 py-3">Acciones</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-border">
 {alumnosPagina.map((a) => (
 <tr key={a.id} className="hover:bg-muted/30 transition-colors">
 <td className="px-4 py-3 font-medium">{a.apellido}, {a.nombre}</td>
 <td className="px-4 py-3 text-sm">{a.dni}</td>
 <td className="px-4 py-3 text-sm text-muted-foreground">{a.email}</td>
 <td className="px-4 py-3 text-sm">{a._count?.inscripciones || 0}</td>
 <td className="px-4 py-3 text-right">
 <div className="flex justify-end gap-1">
 <Button variant="ghost" size="sm" title="Ver detalle" onClick={() => setModalDetalle(a.id)}>
 <Eye className="w-4 h-4" />
 </Button>
 {isAdmin && a.estadoAlumno !== 'BAJA' && (
 <Button variant="ghost" size="sm" onClick={() => setModalBaja(a)} title="Dar de baja">
 <Trash2 className="w-4 h-4 text-destructive" />
 </Button>
 )}
 {isAdmin && a.estadoAlumno === 'BAJA' && (
 <Button variant="ghost" size="sm" onClick={() => handleReactivar(a.id)} title="Reactivar">
 <RotateCcw className="w-4 h-4 text-primary" />
 </Button>
 )}
 {isAdmin && (
 <Button variant="ghost" size="sm" onClick={() => setModalEstado(a)} title="Cambiar estado">
 <UserCheck className="w-4 h-4" />
 </Button>
 )}
 </div>
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 {/* Paginacion */}
 {totalPaginas > 1 && (
 <div className="p-4 border-t border-border flex items-center justify-between">
 <p className="text-sm text-muted-foreground">
 Pagina {paginaActual} de {totalPaginas} ({alumnosFiltrados.length} alumnos)
 </p>
 <div className="flex gap-1">
 <Button variant="outline" size="sm" onClick={() => setPagina(paginaActual - 1)} disabled={paginaActual === 1}>
 <ChevronLeft className="w-4 h-4" />
 </Button>
 {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((n) => (
 <Button
 key={n}
 variant={n === paginaActual ? 'default' : 'outline'}
 size="sm"
 onClick={() => setPagina(n)}
 className="min-w-[36px]"
 >
 {n}
 </Button>
 ))}
 <Button variant="outline" size="sm" onClick={() => setPagina(paginaActual + 1)} disabled={paginaActual === totalPaginas}>
 <ChevronRight className="w-4 h-4" />
 </Button>
 </div>
 </div>
 )}
 </>
 )}
 </Card>
 <Modal open={!!modalBaja} onClose={() => setModalBaja(null)} title="Dar de baja alumno">
 <div className="space-y-4">
 <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-md">
 <p className="text-sm whitespace-pre-line text-foreground">{MENSAJE_BAJA}</p>
 </div>
 <p className="text-sm">
 <strong>Alumno:</strong> {modalBaja?.apellido}, {modalBaja?.nombre} - DNI {modalBaja?.dni}
 </p>
 <div className="flex justify-end gap-2 pt-2 border-t border-border">
 <Button variant="outline" onClick={() => setModalBaja(null)}>Cancelar</Button>
 <Button variant="destructive" onClick={handleBaja}>Dar de Baja</Button>
 </div>
 </div>
 </Modal>
 <ModalDetalleAlumno
 alumnoId={modalDetalle}
 onClose={() => setModalDetalle(null)}
 />

 <Modal open={!!modalEstado} onClose={() => setModalEstado(null)} title="Cambiar estado">
 <div className="space-y-4">
 <p className="text-sm">
 Alumno: <strong>{modalEstado?.apellido}, {modalEstado?.nombre}</strong>
 </p>
 <div className="grid grid-cols-2 gap-2">
 {ESTADOS.map((e) => {
 const Ico = e.icon;
 const activo = modalEstado?.estadoAlumno === e.value;
 return (
 <Button
 key={e.value}
 variant={activo ? 'default' : 'outline'}
 onClick={() => handleCambiarEstado(modalEstado.id, e.value)}
 disabled={activo}
 >
 <Ico className="w-4 h-4 mr-2" /> {e.singular}
 </Button>
 );
 })}
 </div>
 <div className="flex justify-end pt-2 border-t border-border">
 <Button variant="outline" onClick={() => setModalEstado(null)}>Cerrar</Button>
 </div>
 </div>
 </Modal>
 </div>
 );
}