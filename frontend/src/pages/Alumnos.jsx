import { useState, useEffect } from 'react';
import { ChevronRight, Home, Plus, Search, Eye, Edit, Trash2, Users, GraduationCap, Calendar, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { alumnosService } from '../services/alumnos.service';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { DatePicker } from '../components/ui/DatePicker';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { useAuth } from '../contexts/AuthContext';
import {
 Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
} from '../components/ui/Table';

export default function Alumnos() {
 const [agrupados, setAgrupados] = useState([]);
 const [cargando, setCargando] = useState(true);

 // Estado de navegacion
 const [tituloSel, setTituloSel] = useState(null);
 const [resolucionSel, setResolucionSel] = useState(null);
 const [anioSel, setAnioSel] = useState(null);

 // Modales
 const [modalCrear, setModalCrear] = useState(false);
 const [modalDetalle, setModalDetalle] = useState(null);
 const [modalEditar, setModalEditar] = useState(null);
 const [modalEliminar, setModalEliminar] = useState(null);

 // Busqueda global
 const [busqueda, setBusqueda] = useState('');
 const [resultadosBusqueda, setResultadosBusqueda] = useState(null);

 useEffect(() => {
 cargarAgrupados();
 }, []);

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

 // Busqueda global
 const buscarGlobal = async () => {
 if (!busqueda.trim()) {
 setResultadosBusqueda(null);
 return;
 }
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
 setTituloSel(null);
 setResolucionSel(null);
 setAnioSel(null);
 setBusqueda('');
 setResultadosBusqueda(null);
 };

 const confirmarEliminar = async () => {
 if (!modalEliminar) return;
 try {
 await alumnosService.eliminar(modalEliminar.id);
 toast.success('Alumno eliminado');
 setModalEliminar(null);
 cargarAgrupados();
 } catch (error) {
 toast.error(error.response?.data?.message || 'Error al eliminar');
 }
 };

 // Determinar el nivel actual
 const nivelActual = anioSel ? 3 : resolucionSel ? 2 : tituloSel ? 1 : 0;

 return (
 <div className="space-y-6">
 {/* Header */}
 <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
 <div>
 <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Alumnos</h1>
 <p className="text-sm sm:text-base text-muted-foreground font-medium mt-1">
 Navega por carrera, resolución y año para ver los alumnos
 </p>
 </div>
 <Button onClick={() => setModalCrear(true)} className="w-full sm:w-auto">
 <Plus className="w-4 h-4 mr-2" />
 Nuevo Alumno
 </Button>
 </div>

 {/* Breadcrumb */}
 {nivelActual > 0 && (
 <div className="flex items-center gap-2 flex-wrap text-sm">
 <button onClick={resetNavegacion} className="flex items-center gap-1 text-primary hover:underline">
 <Home className="w-4 h-4" />
 Carreras
 </button>
 {tituloSel && (
 <>
 <ChevronRight className="w-4 h-4 text-muted-foreground" />
 <button
 onClick={() => { setResolucionSel(null); setAnioSel(null); }}
 className={`${resolucionSel ? 'text-primary hover:underline' : 'text-foreground font-medium'}`}
 >
 {tituloSel.nombre}
 </button>
 </>
 )}
 {resolucionSel && (
 <>
 <ChevronRight className="w-4 h-4 text-muted-foreground" />
 <button
 onClick={() => setAnioSel(null)}
 className={`${anioSel ? 'text-primary hover:underline' : 'text-foreground font-medium'}`}
 >
 Res. {resolucionSel.codigo}
 </button>
 </>
 )}
 {anioSel && (
 <>
 <ChevronRight className="w-4 h-4 text-muted-foreground" />
 <span className="text-foreground font-medium">{anioSel.nombre}</span>
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
 <div className="border-t border-border">
 {resultadosBusqueda.length === 0 ? (
 <div className="p-6 text-center text-muted-foreground text-sm">
 No se encontraron resultados
 </div>
 ) : (
 <Table>
 <TableHeader>
 <TableRow>
 <TableHead>Apellido y Nombre</TableHead>
 <TableHead>DNI</TableHead>
 <TableHead>Email</TableHead>
 <TableHead className="text-right">Acciones</TableHead>
 </TableRow>
 </TableHeader>
 <TableBody>
 {resultadosBusqueda.map((a) => (
 <TableRow key={a.id}>
 <TableCell className="font-medium">{a.apellido}, {a.nombre}</TableCell>
 <TableCell className="text-sm">{a.dni}</TableCell>
 <TableCell className="text-sm text-muted-foreground">{a.email}</TableCell>
 <TableCell className="text-right">
 <div className="flex justify-end gap-1">
 <Button variant="ghost" size="icon" onClick={() => setModalDetalle(a.id)}>
 <Eye className="w-4 h-4" />
 </Button>
 <Button variant="ghost" size="icon" onClick={() => setModalEditar(a)}>
 <Edit className="w-4 h-4" />
 </Button>
 <Button variant="ghost" size="icon" onClick={() => setModalEliminar(a)}>
 <Trash2 className="w-4 h-4 text-destructive" />
 </Button>
 </div>
 </TableCell>
 </TableRow>
 ))}
 </TableBody>
 </Table>
 )}
 </div>
 )}
 </Card>

 {/* Contenido segun nivel */}
 {cargando ? (
 <div className="p-8 text-center text-muted-foreground font-medium">Cargando...</div>
 ) : (
 <>
 {/* Nivel 0: Lista de Carreras */}
 {nivelActual === 0 && (
 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
 {agrupados.map((t) => (
 <button
 key={t.tituloId}
 onClick={() => setTituloSel(t)}
 className="text-left"
 >
 <Card className="hover:border-primary hover:shadow-md transition-all h-full">
 <div className="p-5">
 <div className="flex items-start gap-3 mb-3">
 <div className="p-2 rounded-md bg-primary/10 shrink-0">
 <GraduationCap className="w-5 h-5 text-primary" />
 </div>
 <div className="min-w-0 flex-1">
 <h3 className="text-base font-semibold text-foreground line-clamp-2">
 {t.nombre}
 </h3>
 <p className="text-xs text-muted-foreground mt-1">
 Nivel: {t.nivel}
 </p>
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

 {/* Nivel 1: Resoluciones del título */}
 {nivelActual === 1 && tituloSel && (
 <div className="space-y-3">
 <Button variant="ghost" size="sm" onClick={resetNavegacion} className="mb-2">
 <ArrowLeft className="w-4 h-4 mr-2" />
 Volver a carreras
 </Button>
 <h2 className="text-lg font-semibold text-foreground">
 {tituloSel.nombre}
 </h2>
 <p className="text-sm text-muted-foreground mb-4">
 Seleccioná una Resolución para ver sus años
 </p>
 {tituloSel.resoluciones.map((r) => (
 <button
 key={r.resolucionId}
 onClick={() => setResolucionSel(r)}
 className="text-left w-full"
 >
 <Card className="hover:border-primary hover:shadow-md transition-all">
 <div className="p-5 flex items-center justify-between gap-3">
 <div className="min-w-0">
 <h3 className="text-base font-semibold text-foreground">
 Resolución {r.codigo}
 </h3>
 <p className="text-xs text-muted-foreground mt-1">
 {r.anios.length} ano{r.anios.length !== 1 ? 's' : ''} curriculares
 </p>
 </div>
 <div className="flex items-center gap-3 shrink-0">
 <div className="text-right">
 <p className="text-sm font-semibold text-foreground">{r.totalAlumnos}</p>
 <p className="text-xs text-muted-foreground font-medium">alumnos</p>
 </div>
 <ChevronRight className="w-4 h-4 text-muted-foreground" />
 </div>
 </div>
 </Card>
 </button>
 ))}
 </div>
 )}

 {/* Nivel 2: Años de la resolución */}
 {nivelActual === 2 && resolucionSel && (
 <div className="space-y-3">
 <Button variant="ghost" size="sm" onClick={() => setResolucionSel(null)} className="mb-2">
 <ArrowLeft className="w-4 h-4 mr-2" />
 Volver a resoluciones
 </Button>
 <h2 className="text-lg font-semibold text-foreground">
 Resolución {resolucionSel.codigo}
 </h2>
 <p className="text-sm text-muted-foreground mb-4">
 Selecciona un año para ver sus alumnos
 </p>
 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
 {resolucionSel.anios.map((a) => (
 <button
 key={a.anioId}
 onClick={() => setAnioSel(a)}
 className="text-left"
 >
 <Card className="hover:border-primary hover:shadow-md transition-all h-full">
 <div className="p-5">
 <div className="flex items-start gap-3 mb-3">
 <div className="p-2 rounded-md bg-primary/10 shrink-0">
 <Calendar className="w-5 h-5 text-primary" />
 </div>
 <div>
 <h3 className="text-base font-semibold text-foreground">
 {a.nombre}
 </h3>
 <p className="text-xs text-muted-foreground mt-1">
 {a.numeroAnio} ano
 </p>
 </div>
 </div>
 <div className="flex items-center justify-between pt-3 border-t border-border">
 <div className="flex items-center gap-2 text-sm text-muted-foreground">
 <Users className="w-4 h-4" />
 <span>{a.totalAlumnos} alumno{a.totalAlumnos !== 1 ? 's' : ''}</span>
 </div>
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
 <Button variant="ghost" size="sm" onClick={() => setAnioSel(null)} className="mb-2">
 <ArrowLeft className="w-4 h-4 mr-2" />
 Volver a anos
 </Button>
 <div className="flex items-center justify-between">
 <div>
 <h2 className="text-lg font-semibold text-foreground">{anioSel.nombre}</h2>
 <p className="text-sm text-muted-foreground">
 {anioSel.totalAlumnos} alumno{anioSel.totalAlumnos !== 1 ? 's' : ''} en este ano
 </p>
 </div>
 </div>

 {anioSel.alumnos.length === 0 ? (
 <Card>
 <div className="p-12 text-center text-muted-foreground font-medium">
 No hay alumnos en este ano
 </div>
 </Card>
 ) : (
 <Card>
 <Table>
 <TableHeader>
 <TableRow>
 <TableHead>Apellido y Nombre</TableHead>
 <TableHead>DNI</TableHead>
 <TableHead className="hidden md:table-cell">Email</TableHead>
 <TableHead className="hidden lg:table-cell">Edad</TableHead>
 <TableHead className="text-right">Acciones</TableHead>
 </TableRow>
 </TableHeader>
 <TableBody>
 {anioSel.alumnos.map((a) => (
 <TableRow key={a.id}>
 <TableCell className="font-medium">{a.apellido}, {a.nombre}</TableCell>
 <TableCell className="text-sm">{a.dni}</TableCell>
 <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
 {a.email}
 </TableCell>
 <TableCell className="hidden lg:table-cell text-sm">
 {a.edad} anos
 </TableCell>
 <TableCell className="text-right">
 <div className="flex justify-end gap-1">
 <Button variant="ghost" size="icon" onClick={() => setModalDetalle(a.id)} title="Ver">
 <Eye className="w-4 h-4" />
 </Button>
 <Button variant="ghost" size="icon" onClick={() => setModalEditar(a)} title="Editar">
 <Edit className="w-4 h-4" />
 </Button>
 <Button variant="ghost" size="icon" onClick={() => setModalEliminar(a)} title="Eliminar">
 <Trash2 className="w-4 h-4 text-destructive" />
 </Button>
 </div>
 </TableCell>
 </TableRow>
 ))}
 </TableBody>
 </Table>
 </Card>
 )}
 </div>
 )}
 </>
 )}

 {/* Modales (los mismos que ya tenias) */}
 <ModalCrearAlumno
 open={modalCrear}
 onClose={() => setModalCrear(false)}
 onCreado={() => {
 setModalCrear(false);
 cargarAgrupados();
 }}
 />

 <ModalDetalleAlumno
 alumnoId={modalDetalle}
 onClose={() => setModalDetalle(null)}
 />

 <ModalEditarAlumno
 alumno={modalEditar}
 onClose={() => setModalEditar(null)}
 onEditado={() => {
 setModalEditar(null);
 cargarAgrupados();
 }}
 />

 <Modal open={!!modalEliminar} onClose={() => setModalEliminar(null)} title="Eliminar Alumno" size="sm">
 <div className="space-y-4">
 <p className="text-sm text-foreground">
 ¿Estás seguro de eliminar a{' '}
 <strong>{modalEliminar?.apellido}, {modalEliminar?.nombre}</strong>?
 </p>
 <p className="text-xs text-muted-foreground font-medium">
 Esta accion no se puede deshacer. Si el alumno tiene inscripciones o certificados, la operacion sera rechazada.
 </p>
 <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 pt-4 border-t border-border">
 <Button variant="outline" onClick={() => setModalEliminar(null)} className="w-full sm:w-auto">
 Cancelar
 </Button>
 <Button variant="destructive" onClick={confirmarEliminar} className="w-full sm:w-auto">
 Eliminar
 </Button>
 </div>
 </div>
 </Modal>
 </div>
 );
}

// ---------------------------------------------------------
// Modal Crear
// ---------------------------------------------------------
function ModalCrearAlumno({ open, onClose, onCreado }) {
 const [form, setForm] = useState({
 dni: '', nombre: '', apellido: '', email: '', fechaNacimiento: '',
 domicilioCalle: '', domicilioNumero: '', domicilioCiudad: '',
 domicilioProvincia: '', domicilioCP: '',
 tienePartidaNacimiento: false, tieneAnaliticoSecundario: false,
 tieneAnaliticoIncompleto: false, tieneCertificado7mo: false, tieneCUD: false,
 });
 const [cargando, setCargando] = useState(false);

 useEffect(() => {
 if (open) {
 setForm({
 dni: '', nombre: '', apellido: '', email: '', fechaNacimiento: '',
 domicilioCalle: '', domicilioNumero: '', domicilioCiudad: '',
 domicilioProvincia: '', domicilioCP: '',
 tienePartidaNacimiento: false, tieneAnaliticoSecundario: false,
 tieneAnaliticoIncompleto: false, tieneCertificado7mo: false, tieneCUD: false,
 });
 }
 }, [open]);

 const handleSubmit = async (e) => {
 e.preventDefault();
 setCargando(true);
 try {
 await alumnosService.crear(form);
 toast.success('Alumno creado');
 onCreado();
 } catch (error) {
 toast.error(error.response?.data?.message || 'Error al crear alumno');
 } finally {
 setCargando(false);
 }
 };

 return (
 <Modal open={open} onClose={onClose} title="Nuevo Alumno" size="lg">
 <form onSubmit={handleSubmit} className="space-y-4">
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
 <Input label="Nombre" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} required />
 <Input label="Apellido" value={form.apellido} onChange={(e) => setForm({ ...form, apellido: e.target.value })} required />
 </div>
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
 <Input label="DNI" value={form.dni} onChange={(e) => setForm({ ...form, dni: e.target.value })} required />
 <div>
  <label className="text-sm font-semibold text-foreground mb-1 block">Fecha de nacimiento</label>
  <DatePicker value={form.fechaNacimiento} onChange={(v) => setForm({ ...form, fechaNacimiento: v })} />
</div>
 </div>
 <Input label="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />

 <div className="border-t border-border pt-4">
 <h3 className="text-sm font-semibold mb-3">Domicilio (opcional)</h3>
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
 <Input label="Calle" value={form.domicilioCalle} onChange={(v) => setForm({ ...form, domicilioCalle: v })} />
 <Input label="Número" value={form.domicilioNumero} onChange={(v) => setForm({ ...form, domicilioNumero: v })} />
 <Input label="Ciudad" value={form.domicilioCiudad} onChange={(v) => setForm({ ...form, domicilioCiudad: v })} />
 <Input label="Provincia" value={form.domicilioProvincia} onChange={(v) => setForm({ ...form, domicilioProvincia: v })} />
 <Input label="Código Postal" value={form.domicilioCP} onChange={(v) => setForm({ ...form, domicilioCP: v })} />
 </div>
 </div>

 <div className="border-t border-border pt-4">
 <h3 className="text-sm font-semibold mb-3">Documentación</h3>
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
 <CheckField label="Partida de nacimiento" checked={form.tienePartidaNacimiento} onChange={(v) => setForm({ ...form, tienePartidaNacimiento: v })} />
 <CheckField label="Analítico secundario completo" checked={form.tieneAnaliticoSecundario} onChange={(v) => setForm({ ...form, tieneAnaliticoSecundario: v })} />
 <CheckField label="Analítico secundario incompleto" checked={form.tieneAnaliticoIncompleto} onChange={(v) => setForm({ ...form, tieneAnaliticoIncompleto: v })} />
 <CheckField label="Certificado 7 grado" checked={form.tieneCertificado7mo} onChange={(v) => setForm({ ...form, tieneCertificado7mo: v })} />
 <CheckField label="CUD" checked={form.tieneCUD} onChange={(v) => setForm({ ...form, tieneCUD: v })} />
 </div>
 </div>

 <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 pt-4 border-t border-border">
 <Button type="button" variant="outline" onClick={onClose} className="w-full sm:w-auto">Cancelar</Button>
 <Button type="submit" disabled={cargando} className="w-full sm:w-auto">
 {cargando ? 'Creando...' : 'Crear Alumno'}
 </Button>
 </div>
 </form>
 </Modal>
 );
}

// ---------------------------------------------------------
// Modal Editar
// ---------------------------------------------------------
function ModalEditarAlumno({ alumno, onClose, onEditado }) {
 const [form, setForm] = useState(null);
 const [cargando, setCargando] = useState(false);

 useEffect(() => {
 if (alumno) {
 setForm({
 dni: alumno.dni || '', nombre: alumno.nombre || '', apellido: alumno.apellido || '',
 email: alumno.email || '',
 fechaNacimiento: alumno.fechaNacimiento ? new Date(alumno.fechaNacimiento).toISOString().split('T')[0] : '',
 domicilioCalle: alumno.domicilioCalle || '', domicilioNumero: alumno.domicilioNumero || '',
 domicilioCiudad: alumno.domicilioCiudad || '', domicilioProvincia: alumno.domicilioProvincia || '',
 domicilioCP: alumno.domicilioCP || '',
 tienePartidaNacimiento: alumno.tienePartidaNacimiento || false,
 tieneAnaliticoSecundario: alumno.tieneAnaliticoSecundario || false,
 tieneAnaliticoIncompleto: alumno.tieneAnaliticoIncompleto || false,
 tieneCertificado7mo: alumno.tieneCertificado7mo || false,
 tieneCUD: alumno.tieneCUD || false,
 });
 } else {
 setForm(null);
 }
 }, [alumno]);

 const handleSubmit = async (e) => {
 e.preventDefault();
 setCargando(true);
 try {
 await alumnosService.actualizar(alumno.id, form);
 toast.success('Alumno actualizado');
 onEditado();
 } catch (error) {
 toast.error(error.response?.data?.message || 'Error al actualizar');
 } finally {
 setCargando(false);
 }
 };

 if (!form) return null;

 return (
 <Modal open={!!alumno} onClose={onClose} title="Editar Alumno" size="lg">
 <form onSubmit={handleSubmit} className="space-y-4">
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
 <Input label="Nombre" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} required />
 <Input label="Apellido" value={form.apellido} onChange={(e) => setForm({ ...form, apellido: e.target.value })} required />
 </div>
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
 <Input label="DNI" value={form.dni} onChange={(e) => setForm({ ...form, dni: e.target.value })} required />
 <div>
  <label className="text-sm font-semibold text-foreground mb-1 block">Fecha de nacimiento</label>
  <DatePicker value={form.fechaNacimiento} onChange={(v) => setForm({ ...form, fechaNacimiento: v })} />
</div>
 </div>
 <Input label="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />

 <div className="border-t border-border pt-4">
 <h3 className="text-sm font-semibold mb-3">Domicilio</h3>
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
 <Input label="Calle" value={form.domicilioCalle} onChange={(v) => setForm({ ...form, domicilioCalle: v })} />
 <Input label="Número" value={form.domicilioNumero} onChange={(v) => setForm({ ...form, domicilioNumero: v })} />
 <Input label="Ciudad" value={form.domicilioCiudad} onChange={(v) => setForm({ ...form, domicilioCiudad: v })} />
 <Input label="Provincia" value={form.domicilioProvincia} onChange={(v) => setForm({ ...form, domicilioProvincia: v })} />
 <Input label="Código Postal" value={form.domicilioCP} onChange={(v) => setForm({ ...form, domicilioCP: v })} />
 </div>
 </div>

 <div className="border-t border-border pt-4">
 <h3 className="text-sm font-semibold mb-3">Documentación</h3>
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
 <CheckField label="Partida de nacimiento" checked={form.tienePartidaNacimiento} onChange={(v) => setForm({ ...form, tienePartidaNacimiento: v })} />
 <CheckField label="Analítico secundario completo" checked={form.tieneAnaliticoSecundario} onChange={(v) => setForm({ ...form, tieneAnaliticoSecundario: v })} />
 <CheckField label="Analítico secundario incompleto" checked={form.tieneAnaliticoIncompleto} onChange={(v) => setForm({ ...form, tieneAnaliticoIncompleto: v })} />
 <CheckField label="Certificado 7 grado" checked={form.tieneCertificado7mo} onChange={(v) => setForm({ ...form, tieneCertificado7mo: v })} />
 <CheckField label="CUD" checked={form.tieneCUD} onChange={(v) => setForm({ ...form, tieneCUD: v })} />
 </div>
 </div>

 <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 pt-4 border-t border-border">
 <Button type="button" variant="outline" onClick={onClose} className="w-full sm:w-auto">Cancelar</Button>
 <Button type="submit" disabled={cargando} className="w-full sm:w-auto">
 {cargando ? 'Guardando...' : 'Guardar cambios'}
 </Button>
 </div>
 </form>
 </Modal>
 );
}

// ---------------------------------------------------------
// Modal Detalle
// ---------------------------------------------------------
export function ModalDetalleAlumno({ alumnoId, onClose }) {
 const { isSecretaria } = useAuth();
 const [alumno, setAlumno] = useState(null);
 const [admision, setAdmision] = useState(null);
 const [historia, setHistoria] = useState(null);
 const [certificados, setCertificados] = useState([]);
 const [cargando, setCargando] = useState(false);
 const [solicitando, setSolicitando] = useState(false);

 useEffect(() => {
 if (alumnoId) {
 setCargando(true);
 Promise.all([
 alumnosService.obtenerPorId(alumnoId),
 alumnosService.obtenerAdmision(alumnoId).catch(() => null),
 alumnosService.historiaAcademica(alumnoId).catch(() => null),
 alumnosService.listarCertificados(alumnoId).catch(() => []),
 ])
 .then(([a, adm, hist, certs]) => {
 setAlumno(a); setAdmision(adm); setHistoria(hist); setCertificados(certs);
 })
 .catch(() => toast.error('Error al cargar detalle'))
 .finally(() => setCargando(false));
 } else {
 setAlumno(null); setAdmision(null); setHistoria(null); setCertificados([]);
 }
 }, [alumnoId]);

 const handleSolicitarAnalitico = async () => {
 if (!confirm(`\u00bfSolicitar el anal\u00edtico (t\u00edtulo completo) para ${alumno.apellido}, ${alumno.nombre}?`)) return;
 setSolicitando(true);
 try {
 await alumnosService.solicitarCertificado(alumnoId, { tipo: 'TITULO_COMPLETO' });
 toast.success('Anal\u00edtico solicitado exitosamente');
 const certs = await alumnosService.listarCertificados(alumnoId).catch(() => []);
 setCertificados(certs);
 } catch (error) {
 toast.error(error.response?.data?.message || 'Error al solicitar anal\u00edtico');
 } finally {
 setSolicitando(false);
 }
 };

 // Calcular promedio general de todas las materias aprobadas
 // Calcula materias aprobadas, pendientes, y datos de egreso
 const calcularResumen = () => {
 if (!historia?.inscripciones?.length) return null;
 const resumen = [];
 for (const h of historia.inscripciones) {
 let total = 0, aprobadas = 0, pendientes = 0, regulares = 0;
 for (const a of (h.anios || [])) {
 for (const m of (a.materias || [])) {
 total++;
 const est = m.estado;
 if (est === 'APROBADA') aprobadas++;
 else if (est === 'REGULAR' || est === 'EN_CURSO') regulares++;
 else pendientes++;
 }
 }
 resumen.push({ inscripcionId: h.inscripcionId, total, aprobadas, pendientes, regulares });
 }
 return resumen;
 };

 const calcularPromedio = () => {
 if (!historia?.inscripciones) return null;
 const notas = [];
 for (const h of historia.inscripciones) {
 for (const a of (h.anios || [])) {
 for (const m of (a.materias || [])) {
 const nota = m.notaFinal || m.notaCursada;
 if (m.estado === 'APROBADA' && nota) notas.push(Number(nota));
 }
 }
 }
 if (notas.length === 0) return null;
 return (notas.reduce((s, n) => s + n, 0) / notas.length).toFixed(2);
 };

 return (
 <Modal open={!!alumnoId} onClose={onClose} title="Detalle del Alumno" size="lg">
 {cargando ? (
 <p className="text-muted-foreground">Cargando...</p>
 ) : alumno ? (
 <div className="space-y-4">
 <div>
 <p className="text-sm text-muted-foreground">Nombre completo</p>
 <p className="font-medium">{alumno.apellido}, {alumno.nombre}</p>
 </div>
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
 <div>
 <p className="text-sm text-muted-foreground">DNI</p>
 <p>{alumno.dni}</p>
 </div>
 <div>
 <p className="text-sm text-muted-foreground">Edad</p>
 <p>{alumno.edad} anos</p>
 </div>
 <div className="sm:col-span-2">
 <p className="text-sm text-muted-foreground">Email</p>
 <p>{alumno.email}</p>
 </div>
 </div>

 {admision && (
 <div className="p-3 rounded-md bg-muted/50">
 <div className="flex items-center justify-between mb-2">
 <p className="text-sm font-semibold">Estado de Admisión</p>
 <Badge variant={admision.puedeInscribirse ? 'success' : 'danger'}>
 {admision.puedeInscribirse ? 'Habilitado' : 'No habilitado'}
 </Badge>
 </div>
 {admision.faltantes?.length > 0 && (
 <ul className="text-xs text-muted-foreground list-disc list-inside space-y-0.5">
 {admision.mensajes?.map((m, i) => <li key={i}>{m}</li>)}
 </ul>
 )}
 </div>
 )}

 {alumno.inscripciones?.length > 0 && (
 <div>
 <p className="text-sm text-muted-foreground mb-2">Inscripciones</p>
 <div className="space-y-2">
 {alumno.inscripciones.map((i) => (
 <div key={i.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-3 bg-muted/50 rounded-md">
 <div className="min-w-0">
 <p className="text-sm font-medium truncate">{i.titulo?.nombre}</p>
 <p className="text-xs text-muted-foreground font-medium">Resolución: {i.resolucion?.codigo}</p>
 </div>
 <Badge variant={i.estado === 'ACTIVA' ? 'success' : 'muted'}>{i.estado}</Badge>
 </div>
 ))}
 </div>
 </div>
 )}

 {/* HISTORIA ACADEMICA */}
 {historia?.inscripciones?.length > 0 && (
 <div className="space-y-3">
 <div className="flex items-center justify-between">
 <p className="text-sm font-semibold">Historia académica</p>
 {calcularPromedio() && (
 <Badge variant="secondary">Promedio: {calcularPromedio()}</Badge>
 )}
 </div>
 {historia.inscripciones.map((h) => {
 const resumen = calcularResumen()?.find((r) => (r.inscripcionId || r.id) === (h.inscripcionId || h.id));
 const fechaInsc = h.fechaInscripcion ? new Date(h.fechaInscripcion).toLocaleDateString('es-AR') : '—';
 const esEgresado = alumno.estadoAlumno === 'EGRESADO';
 const aniosDesdeInsc = h.fechaInscripcion
 ? Math.floor((Date.now() - new Date(h.fechaInscripcion).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
 : null;
 return (
 <div key={h.inscripcionId || h.id} className="rounded-lg border border-border overflow-hidden">
 <div className="p-3 bg-muted/30 space-y-2">
 <div className="flex items-start justify-between gap-2">
 <div className="min-w-0">
 <p className="text-sm font-semibold">{h.titulo?.nombre || h.tituloNombre}</p>
 <p className="text-xs text-muted-foreground font-medium">
 Resolución: {h.resolucion?.codigo} · Estado: {h.estado}
 </p>
 </div>
 {esEgresado && (
 <Badge variant="success" className="shrink-0">Egresado</Badge>
 )}
 </div>
 <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
 <div>
 <p className="text-muted-foreground">Inscripto</p>
 <p className="font-medium">{fechaInsc}</p>
 </div>
 {esEgresado ? (
 <div>
 <p className="text-muted-foreground">Egreso</p>
 <p className="font-medium text-green-600">
 {aniosDesdeInsc !== null ? `~${aniosDesdeInsc} años` : '—'}
 </p>
 </div>
 ) : (
 <div>
 <p className="text-muted-foreground">Cursando desde</p>
 <p className="font-medium">
 {aniosDesdeInsc !== null ? `${aniosDesdeInsc} años` : '—'}
 </p>
 </div>
 )}
 <div>
 <p className="text-muted-foreground">Aprobadas</p>
 <p className="font-medium text-green-600">
 {resumen ? `${resumen.aprobadas}/${resumen.total}` : '—'}
 </p>
 </div>
 <div>
 <p className="text-muted-foreground">Pendientes</p>
 <p className={`font-medium ${resumen?.pendientes > 0 ? 'text-red-600' : 'text-muted-foreground'}`}>
 {resumen ? resumen.pendientes : '—'}
 </p>
 </div>
 </div>
 </div>
 <div className="p-3 space-y-2">
 {(h.anios || []).map((anio) => (
 <div key={anio.id} className="text-sm">
 <p className="font-medium text-foreground mb-1">{anio.nombre}</p>
 <div className="space-y-1 ml-2">
 {(anio.materias || []).map((m) => (
 <div key={m.id} className="flex items-center justify-between text-xs">
 <span className="text-muted-foreground">
 {m.codigo} - {m.nombre}
 </span>
 <span className="flex items-center gap-2">
 <Badge variant={m.estado === 'APROBADA' ? 'success' : m.estado === 'REGULAR' ? 'secondary' : 'muted'} className="text-xs">
 {m.estado || 'NO_CURSADA'}
 </Badge>
 {m.notaFinal && (
 <span className="font-mono font-medium">{Number(m.notaFinal).toFixed(2)}</span>
 )}
 </span>
 </div>
 ))}
 </div>
 </div>
 ))}
 </div>
 </div>
 );
 })}
 </div>
 )}

 {/* CERTIFICADOS + BOTON ANALITICO */}
 {alumno.estadoAlumno === 'EGRESADO' && isSecretaria && (
 <div className="p-4 rounded-lg border border-primary/30 bg-primary/5">
 <div className="flex items-center justify-between mb-2">
 <div>
 <p className="text-sm font-semibold text-foreground">Analítico (Título completo)</p>
 <p className="text-xs text-muted-foreground font-medium">
 Solo la Secretaría puede emitir este documento.
 </p>
 </div>
 <Button
 size="sm"
 onClick={handleSolicitarAnalitico}
 disabled={solicitando}
 >
 {solicitando ? 'Solicitando...' : 'Solicitar Analítico'}
 </Button>
 </div>
 {certificados.filter((c) => c.tipo === 'TITULO_COMPLETO').length > 0 && (
 <div className="mt-2 pt-2 border-t border-primary/20">
 <p className="text-xs text-muted-foreground mb-1">Analíticos ya emitidos:</p>
 {certificados
 .filter((c) => c.tipo === 'TITULO_COMPLETO')
 .map((cert) => (
 <div key={cert.id} className="flex items-center justify-between text-xs py-1">
 <span className="text-muted-foreground">
 {new Date(cert.fechaEmision).toLocaleDateString('es-AR')}
 </span>
 <div className="flex items-center gap-2">
 <Badge variant={cert.estado === 'EMITIDO' ? 'success' : 'destructive'} className="text-xs">
 {cert.estado}
 </Badge>
 <a
 href={`${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}/certificados/${cert.id}/pdf`}
 target="_blank"
 rel="noopener noreferrer"
 className="text-primary hover:underline"
 >
 Ver PDF
 </a>
 </div>
 </div>
 ))}
 </div>
 )}
 </div>
 )}
 </div>
 ) : null}
 </Modal>
 );
}

// ---------------------------------------------------------
// CheckField helper
// ---------------------------------------------------------
function CheckField({ label, checked, onChange }) {
 return (
 <label className="flex items-center gap-2 cursor-pointer">
 <input
 type="checkbox"
 checked={checked}
 onChange={(e) => onChange(e.target.checked)}
 className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
 />
 <span className="text-sm text-foreground">{label}</span>
 </label>
 );
}