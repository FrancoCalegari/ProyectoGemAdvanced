import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Eye, Pencil, Trash2, RotateCcw, UserX, UserCheck, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { profesoresService } from '../services/profesores.service';
import { curricularService } from '../services/curricular.service';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { DatePicker } from '../components/ui/DatePicker';
import { Card } from '../components/ui/Card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../components/ui/Table';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { useAuth } from '../contexts/AuthContext';

const MENSAJE_BAJA_PROF = 'No es posible eliminar los datos de un profesor. Por normativa instituciónal, todos los registros academicos se conservan de forma permanente para garantizar la trazabilidad y el historial completo.\n\nDeseas dar de baja al profesor?\nLa baja conserva todo su historial y podras reactivarlo cuando lo necesites.';

const ESTADO_LABEL = {
 ACTIVO: { text: 'Activo', variant: 'default' },
 SUPLENCIA: { text: 'Suplencia', variant: 'secondary' },
 INACTIVO: { text: 'Inactivo', variant: 'destructive' },
};

const DIAS = ['Domingo', 'Lunes', 'Martes', 'Miiƒ’i‚rcoles', 'Jueves', 'Viernes', 'Siƒ’i‚!bado'];

export default function Profesores() {
 const { isAdmin, isSecretaria } = useAuth();
 const [profesores, setProfesores] = useState([]);
 const [cargando, setCargando] = useState(true);
 const [busqueda, setBusqueda] = useState('');
 const [filtroEstado, setFiltroEstado] = useState('');
 const [modalCrear, setModalCrear] = useState(false);
 const [modalBaja, setModalBaja] = useState(null);
 const [form, setForm] = useState({
 dni: '', nombre: '', apellido: '', email: '', telefono: '',
 fechaNacimiento: '', genero: 'INDISTINTO', estado: 'ACTIVO', tieneCUD: false,
 domicilioCalle: '', domicilioNumero: '', domicilioCiudad: '',
 domicilioProvincia: '', domicilioCP: '',
 titulos: [{ tipo: 'UNIVERSITARIO', nombre: '', institucion: '', anioEgreso: new Date().getFullYear() }],
 materias: [],
 });
 const [creando, setCreando] = useState(false);
 const [materiasDisponibles, setMateriasDisponibles] = useState([]);
 const [aulasDisponibles, setAulasDisponibles] = useState([]);

 useEffect(() => { cargar(); }, [busqueda, filtroEstado]);

 useEffect(() => {
 (async () => {
 try {
 const [mats, aulas] = await Promise.all([
 curricularService.listarTodasLasMaterias(),
 curricularService.listarAulas(),
 ]);
 setMateriasDisponibles(mats);
 setAulasDisponibles(aulas);
 } catch { /* silencioso */ }
 })();
 }, []);

 const cargar = async () => {
 try {
 setCargando(true);
 const data = await profesoresService.listar({ busqueda, estado: filtroEstado });
 setProfesores(data);
 } catch (error) {
 toast.error('Error al cargar profesores');
 } finally {
 setCargando(false);
 }
 };

 const agregarTituloForm = () => {
 setForm({ ...form, titulos: [...form.titulos, { tipo: 'UNIVERSITARIO', nombre: '', institucion: '', anioEgreso: new Date().getFullYear() }] });
 };

 const eliminarTituloForm = (idx) => {
 if (form.titulos.length <= 1) return toast.error('Debe haber al menos 1 tiƒ’i‚tulo');
 setForm({ ...form, titulos: form.titulos.filter((_, i) => i !== idx) });
 };

 const actualizarTituloForm = (idx, campo, valor) => {
 const nuevos = [...form.titulos];
 nuevos[idx] = { ...nuevos[idx], [campo]: valor };
 setForm({ ...form, titulos: nuevos });
 };

 const agregarMateriaForm = () => {
 setForm({ ...form, materias: [...(form.materias || []), { materiaId: '', diaSemana: 1, horaInicio: '08:00', horaFin: '10:00', aula: '' }] });
 };

 const eliminarMateriaForm = (idx) => {
 setForm({ ...form, materias: form.materias.filter((_, i) => i !== idx) });
 };

 const actualizarMateriaForm = (idx, campo, valor) => {
 const nuevas = [...form.materias];
 nuevas[idx] = { ...nuevas[idx], [campo]: valor };
 setForm({ ...form, materias: nuevas });
 };
 const handleCrear = async (e) => {
 e.preventDefault();
 if (!form.dni || !form.nombre || !form.apellido || !form.email || !form.fechaNacimiento) {
 return toast.error('Completiƒ’i‚! los campos obligatorios');
 }
 setCreando(true);
 try {
 // Separar materias del body de creacion
 const { materias, ...datosProfesor } = form;
 const nuevoProfesor = await profesoresService.crear(datosProfesor);

 // Si hay materias, asignarlas una por una
 if (materias && materias.length > 0) {
 for (const m of materias) {
 if (m.materiaId) {
 try {
 await profesoresService.asignarMateria(nuevoProfesor.id, m);
 } catch (err) {
 console.warn('No se pudo asignar materia', m.materiaId, err);
 }
 }
 }
 }

 toast.success(`Profesor creado${materias?.length ? ` con ${materias.filter(m => m.materiaId).length} materias` : ''}`);
 setModalCrear(false);
 resetForm();
 cargar();
 } catch (error) {
 toast.error(error.response?.data?.message || 'Error al crear');
 } finally {
 setCreando(false);
 }
 };

 const resetForm = () => {
 setForm({
 dni: '', nombre: '', apellido: '', email: '', telefono: '',
 fechaNacimiento: '', genero: 'INDISTINTO', estado: 'ACTIVO', tieneCUD: false,
 domicilioCalle: '', domicilioNumero: '', domicilioCiudad: '',
 domicilioProvincia: '', domicilioCP: '',
 titulos: [{ tipo: 'UNIVERSITARIO', nombre: '', institucion: '', anioEgreso: new Date().getFullYear() }],
 materias: [],
 });
 };

 const handleBaja = async () => {
 if (!modalBaja) return;
 try {
 await profesoresService.darDeBaja(modalBaja.id);
 toast.success('Profesor dado de baja');
 setModalBaja(null);
 cargar();
 } catch (error) {
 toast.error(error.response?.data?.message || 'Error al dar de baja');
 }
 };

 const handleReactivar = async (id) => {
 if (!confirm('i‚Reactivar este profesor?')) return;
 try {
 await profesoresService.reactivar(id);
 toast.success('Profesor reactivado');
 cargar();
 } catch (error) {
 toast.error(error.response?.data?.message || 'Error al reactivar');
 }
 };

 return (
 <div className="space-y-6">
 <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
 <div>
 <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Profesores</h1>
 <p className="text-sm sm:text-base text-muted-foreground font-medium mt-1">
 Gestiiƒ’i‚n de docentes, tiƒ’i‚tulos y materias asignadas
 </p>
 </div>
 {isAdmin && (
 <Button onClick={() => setModalCrear(true)} className="w-full sm:w-auto">
 <Plus className="w-4 h-4 mr-2" />
 Nuevo Profesor
 </Button>
 )}
 </div>

 <Card>
 <div className="p-4 border-b border-border flex flex-col sm:flex-row gap-3">
 <div className="relative flex-1">
 <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
 <Input
 placeholder="Buscar por nombre, DNI o email..."
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
 <option value="ACTIVO">Activo</option>
 <option value="SUPLENCIA">Suplencia</option>
 <option value="INACTIVO">Inactivo</option>
 </select>
 </div>

 {cargando ? (
 <div className="p-8 text-center text-muted-foreground font-medium">Cargando...</div>
 ) : profesores.length === 0 ? (
 <div className="p-8 text-center text-muted-foreground font-medium">No hay profesores cargados</div>
 ) : (
 <Table>
 <TableHeader>
 <TableRow>
 <TableHead>Nombre</TableHead>
 <TableHead>DNI</TableHead>
 <TableHead>Email</TableHead>
 <TableHead>Tiƒ’i‚tulos</TableHead>
 <TableHead>Estado</TableHead>
 <TableHead className="text-right">Acciones</TableHead>
 </TableRow>
 </TableHeader>
 <TableBody>
 {profesores.map((p) => (
 <TableRow key={p.id}>
 <TableCell className="font-medium">{p.apellido}, {p.nombre}</TableCell>
 <TableCell>{p.dni}</TableCell>
 <TableCell className="text-sm">{p.email}</TableCell>
 <TableCell>{p.titulos?.length || 0}</TableCell>
 <TableCell>
 <Badge variant={ESTADO_LABEL[p.estado]?.variant || 'default'}>
 {ESTADO_LABEL[p.estado]?.text || p.estado}
 </Badge>
 </TableCell>
 <TableCell className="text-right">
 <div className="flex justify-end gap-1">
 <Link to={`/profesores/${p.id}`}>
 <Button variant="ghost" size="sm"><Eye className="w-4 h-4" /></Button>
 </Link>
 {isAdmin && p.estado !== 'INACTIVO' && (
 <Button variant="ghost" size="sm" onClick={() => setModalBaja(p)} title="Dar de baja">
 <UserX className="w-4 h-4 text-destructive" />
 </Button>
 )}
 {isAdmin && p.estado === 'INACTIVO' && (
 <Button variant="ghost" size="sm" onClick={() => handleReactivar(p.id)} title="Reactivar">
 <RotateCcw className="w-4 h-4 text-primary" />
 </Button>
 )}
 </div>
 </TableCell>
 </TableRow>
 ))}
 </TableBody>
 </Table>
 )}
 </Card>

 <Modal open={modalCrear} onClose={() => setModalCrear(false)} title="Nuevo Profesor" size="lg">
 <form onSubmit={handleCrear} className="space-y-4">
 <div className="grid grid-cols-2 gap-4">
 <div>
 <label className="text-sm font-semibold">DNI *</label>
 <Input value={form.dni} onChange={(e) => setForm({...form, dni: e.target.value})} required />
 </div>
 <div>
 <label className="text-sm font-semibold">Fecha Nacimiento *</label>
 <DatePicker value={form.fechaNacimiento} onChange={(v) => setForm({...form, fechaNacimiento: v})} required />
 </div>
 <div>
 <label className="text-sm font-semibold">Nombre *</label>
 <Input value={form.nombre} onChange={(e) => setForm({...form, nombre: e.target.value})} required />
 </div>
 <div>
 <label className="text-sm font-semibold">Apellido *</label>
 <Input value={form.apellido} onChange={(e) => setForm({...form, apellido: e.target.value})} required />
 </div>
 <div className="col-span-2">
 <label className="text-sm font-semibold">Email *</label>
 <Input type="email" value={form.email} onChange={(e) => setForm({...form, email: e.target.value})} required />
 </div>
 <div>
 <label className="text-sm font-semibold">Teliƒ’i‚fono</label>
 <Input value={form.telefono} onChange={(v) => setForm({ ...form, telefono: v })} />
 </div>
 <div>
 <label className="text-sm font-semibold">Giƒ’i‚nero</label>
 <select value={form.genero} onChange={(e) => setForm({...form, genero: e.target.value})} className="w-full h-10 px-3 rounded-md border border-border bg-background">
 <option value="M">Masculino</option>
 <option value="F">Femenino</option>
 <option value="INDISTINTO">Indistinto</option>
 </select>
 </div>
 <div>
 <label className="text-sm font-semibold">Estado</label>
 <select value={form.estado} onChange={(e) => setForm({...form, estado: e.target.value})} className="w-full h-10 px-3 rounded-md border border-border bg-background">
 <option value="ACTIVO">Activo</option>
 <option value="SUPLENCIA">Suplencia</option>
 <option value="INACTIVO">Inactivo</option>
 </select>
 </div>
 <div className="flex items-center gap-2 pt-6">
 <input type="checkbox" id="cud" checked={form.tieneCUD} onChange={(e) => setForm({...form, tieneCUD: e.target.checked})} className="w-4 h-4" />
 <label htmlFor="cud" className="text-sm font-semibold">Tiene CUD</label>
 </div>
 </div>

 <div className="border-t border-border pt-4">
 <div className="flex items-center justify-between mb-3">
 <h3 className="font-semibold">Tiƒ’i‚tulos * (al menos 1)</h3>
 <Button type="button" variant="outline" size="sm" onClick={agregarTituloForm}>
 <Plus className="w-3 h-3 mr-1" /> Agregar
 </Button>
 </div>
 {form.titulos.map((t, idx) => (
 <div key={idx} className="border border-border rounded-md p-3 mb-2 space-y-2">
 <div className="grid grid-cols-3 gap-2">
 <select value={t.tipo} onChange={(e) => actualizarTituloForm(idx, 'tipo', e.target.value)} className="h-9 px-2 rounded-md border border-border bg-background text-sm">
 <option value="UNIVERSITARIO">Universitario</option>
 <option value="TERCIARIO">Terciario</option>
 </select>
 <Input placeholder="Nombre del tiƒ’i‚tulo" value={t.nombre} onChange={(e) => actualizarTituloForm(idx, 'nombre', e.target.value)} className="h-9 text-sm" required />
 <Input type="number" placeholder="Aiƒ’i‚o egreso" value={t.anioEgreso} onChange={(e) => actualizarTituloForm(idx, 'anioEgreso', e.target.value)} className="h-9 text-sm" required />
 </div>
 <div className="flex gap-2">
 <Input placeholder="Instituciiƒ’i‚n" value={t.institucion} onChange={(e) => actualizarTituloForm(idx, 'institución', e.target.value)} className="h-9 text-sm" required />
 {form.titulos.length > 1 && (
 <Button type="button" variant="ghost" size="sm" onClick={() => eliminarTituloForm(idx)}>
 <Trash2 className="w-4 h-4 text-destructive" />
 </Button>
 )}
 </div>
 </div>
 ))}
 </div>

 <div className="border-t border-border pt-4">
 <div className="flex items-center justify-between mb-3">
 <h3 className="font-semibold">Materias que dariƒ’i‚! (opcional)</h3>
 <Button type="button" variant="outline" size="sm" onClick={agregarMateriaForm}>
 <Plus className="w-3 h-3 mr-1" /> Agregar Materia
 </Button>
 </div>
 {(!form.materias || form.materias.length === 0) ? (
 <p className="text-sm text-muted-foreground text-center py-3">
 Sin materias asignadas. Podiƒ’i‚s agregarlas ahora o despuiƒ’i‚s desde la ficha del profesor.
 </p>
 ) : (
 form.materias.map((m, idx) => (
 <div key={idx} className="border border-border rounded-md p-3 mb-2 space-y-2">
 <div className="flex gap-2">
 <select
 value={m.materiaId}
 onChange={(e) => actualizarMateriaForm(idx, 'materiaId', e.target.value)}
 className="flex-1 h-9 px-2 rounded-md border border-border bg-background text-sm"
 >
 <option value="">Seleccioniƒ’i‚! una materia...</option>
 {materiasDisponibles.map((mat) => (
 <option key={mat.id} value={mat.id}>
 {mat.codigo} ai"ši‚“ {mat.nombre} ({mat.anioCurricular?.numeroAnio}iƒ"ši‚ iƒ"ši‚ {mat.anioCurricular?.resolucion?.titulo?.nombre})
 </option>
 ))}
 </select>
 <Button type="button" variant="ghost" size="sm" onClick={() => eliminarMateriaForm(idx)}>
 <Trash2 className="w-4 h-4 text-destructive" />
 </Button>
 </div>
 <div className="grid grid-cols-2 gap-2">
 <select
 value={m.diaSemana}
 onChange={(e) => actualizarMateriaForm(idx, 'diaSemana', parseInt(e.target.value))}
 className="h-9 px-2 rounded-md border border-border bg-background text-sm"
 >
 {DIAS.map((d, i) => <option key={i} value={i}>{d}</option>)}
 </select>
 <select
 value={m.aula}
 onChange={(e) => actualizarMateriaForm(idx, 'aula', e.target.value)}
 className="h-9 px-2 rounded-md border border-border bg-background text-sm"
 >
 <option value="">Sin aula</option>
 {aulasDisponibles.map((a) => <option key={a} value={a}>{a}</option>)}
 </select>
 </div>
 <div className="grid grid-cols-2 gap-2">
 <Input type="time" value={m.horaInicio} onChange={(e) => actualizarMateriaForm(idx, 'horaInicio', e.target.value)} className="h-9 text-sm" />
 <Input type="time" value={m.horaFin} onChange={(e) => actualizarMateriaForm(idx, 'horaFin', e.target.value)} className="h-9 text-sm" />
 </div>
 </div>
 ))
 )}
 </div>

 <div className="flex justify-end gap-2 pt-4 border-t border-border">
 <Button type="button" variant="outline" onClick={() => setModalCrear(false)}>Cancelar</Button>
 <Button type="submit" disabled={creando}>{creando ? 'Creando...' : 'Crear Profesor'}</Button>
 </div>
 </form>
 </Modal>

 <Modal open={!!modalBaja} onClose={() => setModalBaja(null)} title="Dar de baja profesor">
 <div className="space-y-4">
 <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-md">
 <div className="flex gap-3">
 <AlertCircle className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" />
 <p className="text-sm whitespace-pre-line text-foreground">{MENSAJE_BAJA_PROF}</p>
 </div>
 </div>
 <p className="text-sm">
 <strong>Profesor:</strong> {modalBaja?.apellido}, {modalBaja?.nombre} - DNI {modalBaja?.dni}
 </p>
 <div className="flex justify-end gap-2 pt-2 border-t border-border">
 <Button variant="outline" onClick={() => setModalBaja(null)}>Cancelar</Button>
 <Button variant="destructive" onClick={handleBaja}>Dar de Baja</Button>
 </div>
 </div>
 </Modal>
 </div>
 );
}