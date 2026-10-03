import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, Save, BookOpen, FileText, User, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import { profesoresService } from '../services/profesores.service';
import { licenciasService } from '../services/licencias.service';
import { curricularService } from '../services/curricular.service';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../components/ui/Table';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { BackButton } from '../components/ui/BackButton';
import { useAuth } from '../contexts/AuthContext';

const DIAS = ['Domingo', 'Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado'];

const ESTADOS_LIC = {
 PENDIENTE: { text: 'Pendiente', variant: 'secondary' },
 APROBADA: { text: 'Aprobada', variant: 'default' },
 RECHAZADA: { text: 'Rechazada', variant: 'destructive' },
};

const TIPOS_LIC = {
 ENFERMEDAD: 'Enfermedad',
 RAZON_PARTICULAR: 'Razon particular',
 ESTUDIOS_FEMENINOS: 'Estudios femeninos',
 DONACION_SANGRE: 'Donacion de sangre',
 ACCIDENTE_LABORAL: 'Accidente laboral',
 OTRO: 'Otro',
};

export default function ProfesorDetalle() {
 const { id } = useParams();
 const navigate = useNavigate();
 const { isAdmin, isSecretaria } = useAuth();
 const [profesor, setProfesor] = useState(null);
 const [licencias, setLicencias] = useState([]);
 const [cargando, setCargando] = useState(true);
 const [tab, setTab] = useState('datos');
 const [editando, setEditando] = useState(false);
 const [form, setForm] = useState({});
 const [modalTítulo, setModalTítulo] = useState(false);
 const [modalMateria, setModalMateria] = useState(false);
 const [nuevoTítulo, setNuevoTítulo] = useState({ tipo: 'UNIVERSITARIO', nombre: '', institución: '', anioEgreso: new Date().getFullYear() });
 const [nuevaMateria, setNuevaMateria] = useState({ materiaId: '', diaSemana: 1, horaInicio: '08:00', horaFin: '10:00', aula: '' });
 const [materiasDisponibles, setMateriasDisponibles] = useState([]);
 const [aulasDisponibles, setAulasDisponibles] = useState([]);

 useEffect(() => {
 cargar();
 cargarMaterias();
 }, [id]);

 const cargar = async () => {
 try {
 setCargando(true);
 const data = await profesoresService.obtenerPorId(id);
 setProfesor(data);
 setForm(data);
 const lics = await licenciasService.listarPorProfesor(id);
 setLicencias(lics);
 } catch (error) {
 toast.error('Error al cargar el profesor');
 navigate('/profesores');
 } finally {
 setCargando(false);
 }
 };

 const cargarMaterias = async () => {
 try {
 const [mats, aulas] = await Promise.all([
 curricularService.listarTodasLasMaterias(),
 curricularService.listarAulas(),
 ]);
 setMateriasDisponibles(mats);
 setAulasDisponibles(aulas);
 } catch {
 toast.error('Error al cargar materias/aulas');
 }
 };

 const handleGuardar = async () => {
 try {
 await profesoresService.actualizar(id, {
 teléfono: form.teléfono,
 email: form.email,
 género: form.género,
 estado: form.estado,
 tieneCUD: form.tieneCUD,
 domicilioCalle: form.domicilioCalle,
 domicilioNúmero: form.domicilioNúmero,
 domicilioCiudad: form.domicilioCiudad,
 domicilioProvincia: form.domicilioProvincia,
 domicilioCP: form.domicilioCP,
 });
 toast.success('Datos actualizados');
 setEditando(false);
 cargar();
 } catch (error) {
 toast.error(error.response?.data?.message || 'Error al guardar');
 }
 };

 const handleAgregarTítulo = async (e) => {
 e.preventDefault();
 try {
 await profesoresService.agregarTítulo(id, nuevoTítulo);
 toast.success('Título agregado');
 setModalTítulo(false);
 setNuevoTítulo({ tipo: 'UNIVERSITARIO', nombre: '', institución: '', anioEgreso: new Date().getFullYear() });
 cargar();
 } catch (error) {
 toast.error(error.response?.data?.message || 'Error');
 }
 };

 const handleEliminarTítulo = async (títuloId) => {
 if (!confirm('Eliminar este título?')) return;
 try {
 await profesoresService.eliminarTítulo(id, títuloId);
 toast.success('Título eliminado');
 cargar();
 } catch (error) {
 toast.error(error.response?.data?.message || 'Error');
 }
 };

 const handleAsignarMateria = async (e) => {
 e.preventDefault();
 if (!nuevaMateria.materiaId) return toast.error('Selecciona una materia');
 try {
 await profesoresService.asignarMateria(id, nuevaMateria);
 toast.success('Materia asignada');
 setModalMateria(false);
 setNuevaMateria({ materiaId: '', diaSemana: 1, horaInicio: '08:00', horaFin: '10:00', aula: '' });
 cargar();
 } catch (error) {
 toast.error(error.response?.data?.message || 'Error');
 }
 };

 const handleDesasignarMateria = async (mpId) => {
 if (!confirm('Desasignar esta materia?')) return;
 try {
 await profesoresService.desasignarMateria(id, mpId);
 toast.success('Materia desasignada');
 cargar();
 } catch (error) {
 toast.error(error.response?.data?.message || 'Error');
 }
 };

 const handleAprobarLic = async (licId) => {
 try {
 const r = await licenciasService.aprobar(licId, { observaciones: 'Aprobada desde panel' });
 toast.success(`Licencia aprobada. Clases suspendidas: ${r.resumenClases?.creadas || 0}`);
 cargar();
 } catch (error) {
 toast.error(error.response?.data?.message || 'Error');
 }
 };

 const handleRechazarLic = async (licId) => {
 const motivo = prompt('Motivo del rechazo (opcional):');
 try {
 await licenciasService.rechazar(licId, { observaciones: motivo || null });
 toast.success('Licencia rechazada');
 cargar();
 } catch (error) {
 toast.error(error.response?.data?.message || 'Error');
 }
 };

 if (cargando) return <div className="p-8 text-center text-muted-foreground font-medium">Cargando...</div>;
 if (!profesor) return null;

 return (
 <div className="space-y-6">
 <div className="flex items-center gap-3">
 <BackButton label="Volver a Docentes" to="/profesores" />
 </div>

 <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
 <div>
 <h1 className="text-2xl sm:text-3xl font-bold">{profesor.apellido}, {profesor.nombre}</h1>
 <p className="text-muted-foreground mt-1">DNI {profesor.dni} {profesor.edad} años {profesor.email}</p>
 </div>
 <div className="flex gap-2">
 <Badge variant={profesor.estado === 'ACTIVO' ? 'default' : profesor.estado === 'SUPLENCIA' ? 'secondary' : 'destructive'}>
 {profesor.estado}
 </Badge>
 {profesor.tieneCUD && <Badge variant="secondary">CUD</Badge>}
 </div>
 </div>

 <div className="flex gap-2 border-b border-border">
 {[
 { id: 'datos', label: 'Datos', icon: User },
 { id: 'títulos', label: 'Títulos', icon: FileText },
 { id: 'materias', label: 'Materias', icon: BookOpen },
 { id: 'licencias', label: 'Licencias', icon: Calendar },
 ].map((t) => (
 <button
 key={t.id}
 onClick={() => setTab(t.id)}
 className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
 tab === t.id ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
 }`}
 >
 <t.icon className="w-4 h-4" /> {t.label}
 </button>
 ))}
 </div>

 {tab === 'datos' && (
 <Card className="p-6">
 <div className="flex justify-between mb-4">
 <h2 className="text-lg font-semibold">Datos personales</h2>
 {isAdmin && !editando && (
 <Button size="sm" variant="outline" onClick={() => setEditando(true)}>
 <Save className="w-4 h-4 mr-1" /> Editar
 </Button>
 )}
 {isAdmin && editando && (
 <div className="flex gap-2">
 <Button size="sm" variant="ghost" onClick={() => { setEditando(false); setForm(profesor); }}>Cancelar</Button>
 <Button size="sm" onClick={handleGuardar}><Save className="w-4 h-4 mr-1" /> Guardar</Button>
 </div>
 )}
 </div>
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
 <div><label className="text-sm text-muted-foreground">Teléfono</label>
 {editando ? <Input value={form.teléfono || ''} onChange={(e) => setForm({...form, teléfono: e.target.value})} /> : <p className="mt-1">{profesor.teléfono || '—'}</p>}
 </div>
 <div><label className="text-sm text-muted-foreground">Email</label>
 {editando ? <Input value={form.email || ''} onChange={(e) => setForm({...form, email: e.target.value})} /> : <p className="mt-1">{profesor.email}</p>}
 </div>
 <div><label className="text-sm text-muted-foreground">Género</label>
 {editando ? (
 <select value={form.género || 'INDISTINTO'} onChange={(e) => setForm({...form, género: e.target.value})} className="w-full h-10 px-3 rounded-md border border-border bg-background">
 <option value="M">Masculino</option>
 <option value="F">Femenino</option>
 <option value="INDISTINTO">Indistinto</option>
 </select>
 ) : <p className="mt-1">{profesor.género || '—'}</p>}
 </div>
 <div><label className="text-sm text-muted-foreground">Estado</label>
 {editando ? (
 <select value={form.estado || 'ACTIVO'} onChange={(e) => setForm({...form, estado: e.target.value})} className="w-full h-10 px-3 rounded-md border border-border bg-background">
 <option value="ACTIVO">Activo</option>
 <option value="SUPLENCIA">Suplencia</option>
 <option value="INACTIVO">Inactivo</option>
 </select>
 ) : <p className="mt-1">{profesor.estado}</p>}
 </div>
 <div><label className="text-sm text-muted-foreground">Domicilio</label>
 {editando ? (
 <div className="grid grid-cols-2 gap-2 mt-1">
 <Input placeholder="Calle" value={form.domicilioCalle || ''} onChange={(e) => setForm({...form, domicilioCalle: e.target.value})} />
 <Input placeholder="Número" value={form.domicilioNúmero || ''} onChange={(e) => setForm({...form, domicilioNúmero: e.target.value})} />
 <Input placeholder="Ciudad" value={form.domicilioCiudad || ''} onChange={(e) => setForm({...form, domicilioCiudad: e.target.value})} />
 <Input placeholder="Provincia" value={form.domicilioProvincia || ''} onChange={(e) => setForm({...form, domicilioProvincia: e.target.value})} />
 <Input placeholder="CP" value={form.domicilioCP || ''} onChange={(e) => setForm({...form, domicilioCP: e.target.value})} className="col-span-2" />
 </div>
 ) : (
 <p className="mt-1">{profesor.domicilioCalle ? `${profesor.domicilioCalle} ${profesor.domicilioNúmero || ''}, ${profesor.domicilioCiudad || ''}` : '—'}</p>
 )}
 </div>
 </div>
 </Card>
 )}

 {tab === 'títulos' && (
 <Card>
 <div className="p-4 border-b border-border flex justify-between items-center">
 <h2 className="text-lg font-semibold">Títulos ({profesor.títulos?.length || 0})</h2>
 {isAdmin && <Button size="sm" onClick={() => setModalTítulo(true)}><Plus className="w-4 h-4 mr-1" /> Agregar</Button>}
 </div>
 {!profesor.títulos || profesor.títulos.length === 0 ? (
 <p className="p-6 text-center text-muted-foreground">Sin títulos cargados</p>
 ) : (
 <Table>
 <TableHeader>
 <TableRow><TableHead>Tipo</TableHead><TableHead>Nombre</TableHead><TableHead>Institución</TableHead><TableHead>Año</TableHead><TableHead></TableHead></TableRow>
 </TableHeader>
 <TableBody>
 {profesor.títulos.map((t) => (
 <TableRow key={t.id}>
 <TableCell><Badge variant="secondary">{t.tipo}</Badge></TableCell>
 <TableCell>{t.nombre}</TableCell>
 <TableCell>{t.institución}</TableCell>
 <TableCell>{t.anioEgreso}</TableCell>
 <TableCell className="text-right">
 {isAdmin && <Button variant="ghost" size="sm" onClick={() => handleEliminarTítulo(t.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>}
 </TableCell>
 </TableRow>
 ))}
 </TableBody>
 </Table>
 )}
 </Card>
 )}

 {tab === 'materias' && (
 <Card>
 <div className="p-4 border-b border-border flex justify-between items-center">
 <h2 className="text-lg font-semibold">Materias asignadas ({profesor.materias?.length || 0})</h2>
 {isAdmin && <Button size="sm" onClick={() => setModalMateria(true)}><Plus className="w-4 h-4 mr-1" /> Asignar</Button>}
 </div>
 {!profesor.materias || profesor.materias.length === 0 ? (
 <p className="p-6 text-center text-muted-foreground">Sin materias asignadas</p>
 ) : (
 <Table>
 <TableHeader>
 <TableRow><TableHead>Materia</TableHead><TableHead>Dia</TableHead><TableHead>Horario</TableHead><TableHead>Aula</TableHead><TableHead></TableHead></TableRow>
 </TableHeader>
 <TableBody>
 {profesor.materias.map((mp) => (
 <TableRow key={mp.id}>
 <TableCell className="font-medium">{mp.materia?.nombre} <span className="text-muted-foreground text-xs">({mp.materia?.código})</span></TableCell>
 <TableCell>{DIAS[mp.diaSemana]}</TableCell>
 <TableCell>{mp.horaInicio} - {mp.horaFin}</TableCell>
 <TableCell>{mp.aula || '—'}</TableCell>
 <TableCell className="text-right">
 {isAdmin && <Button variant="ghost" size="sm" onClick={() => handleDesasignarMateria(mp.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>}
 </TableCell>
 </TableRow>
 ))}
 </TableBody>
 </Table>
 )}
 </Card>
 )}

 {tab === 'licencias' && (
 <Card>
 <div className="p-4 border-b border-border">
 <h2 className="text-lg font-semibold">Licencias ({licencias.length})</h2>
 </div>
 {licencias.length === 0 ? (
 <p className="p-6 text-center text-muted-foreground">Sin licencias registradas</p>
 ) : (
 <Table>
 <TableHeader>
 <TableRow><TableHead>Tipo</TableHead><TableHead>Desde</TableHead><TableHead>Hasta</TableHead><TableHead>Estado</TableHead><TableHead></TableHead></TableRow>
 </TableHeader>
 <TableBody>
 {licencias.map((l) => (
 <TableRow key={l.id}>
 <TableCell>{TIPOS_LIC[l.tipo] || l.tipo}</TableCell>
 <TableCell>{new Date(l.fechaDesde).toLocaleDateString('es-AR')}</TableCell>
 <TableCell>{new Date(l.fechaHasta).toLocaleDateString('es-AR')}</TableCell>
 <TableCell><Badge variant={ESTADOS_LIC[l.estado]?.variant}>{ESTADOS_LIC[l.estado]?.text}</Badge></TableCell>
 <TableCell className="text-right">
 {l.estado === 'PENDIENTE' && (isAdmin || isSecretaria) && (
 <div className="flex justify-end gap-1">
 <Button size="sm" variant="ghost" onClick={() => handleAprobarLic(l.id)}>Aprobar</Button>
 <Button size="sm" variant="ghost" onClick={() => handleRechazarLic(l.id)}>Rechazar</Button>
 </div>
 )}
 </TableCell>
 </TableRow>
 ))}
 </TableBody>
 </Table>
 )}
 </Card>
 )}

 <Modal open={modalTítulo} onClose={() => setModalTítulo(false)} title="Agregar Título">
 <form onSubmit={handleAgregarTítulo} className="space-y-4">
 <div>
 <label className="text-sm font-semibold">Tipo</label>
 <select value={nuevoTítulo.tipo} onChange={(e) => setNuevoTítulo({...nuevoTítulo, tipo: e.target.value})} className="w-full h-10 px-3 rounded-md border border-border bg-background">
 <option value="UNIVERSITARIO">Universitario</option>
 <option value="TERCIARIO">Terciario</option>
 </select>
 </div>
 <div><label className="text-sm font-semibold">Nombre</label><Input value={nuevoTítulo.nombre} onChange={(e) => setNuevoTítulo({...nuevoTítulo, nombre: e.target.value})} required /></div>
 <div><label className="text-sm font-semibold">Institución</label><Input value={nuevoTítulo.institución} onChange={(e) => setNuevoTítulo({...nuevoTítulo, institución: e.target.value})} required /></div>
 <div><label className="text-sm font-semibold">Año de egreso</label><Input type="number" value={nuevoTítulo.anioEgreso} onChange={(e) => setNuevoTítulo({...nuevoTítulo, anioEgreso: e.target.value})} required /></div>
 <div className="flex justify-end gap-2"><Button type="button" variant="outline" onClick={() => setModalTítulo(false)}>Cancelar</Button><Button type="submit">Agregar</Button></div>
 </form>
 </Modal>

 <Modal open={modalMateria} onClose={() => setModalMateria(false)} title="Asignar Materia">
 <form onSubmit={handleAsignarMateria} className="space-y-4">
 <div>
 <label className="text-sm font-semibold">Materia *</label>
 <select
 value={nuevaMateria.materiaId}
 onChange={(e) => setNuevaMateria({...nuevaMateria, materiaId: e.target.value})}
 className="w-full h-10 px-3 rounded-md border border-border bg-background text-sm"
 required
 >
 <option value="">Selecciona una materia...</option>
 {materiasDisponibles.map((m) => (
 <option key={m.id} value={m.id}>
 {m.código} — {m.nombre} ({m.anioCurricular?.númeroAnio} año {m.anioCurricular?.resolución?.título?.nombre})
 </option>
 ))}
 </select>
 <p className="text-xs text-muted-foreground mt-1">
 {materiasDisponibles.length} materias disponibles
 </p>
 </div>
 <div>
 <label className="text-sm font-semibold">Dia *</label>
 <select value={nuevaMateria.diaSemana} onChange={(e) => setNuevaMateria({...nuevaMateria, diaSemana: parseInt(e.target.value)})} className="w-full h-10 px-3 rounded-md border border-border bg-background">
 {DIAS.map((d, i) => <option key={i} value={i}>{d}</option>)}
 </select>
 </div>
 <div className="grid grid-cols-2 gap-3">
 <div><label className="text-sm font-semibold">Hora inicio *</label><Input type="time" value={nuevaMateria.horaInicio} onChange={(e) => setNuevaMateria({...nuevaMateria, horaInicio: e.target.value})} required /></div>
 <div><label className="text-sm font-semibold">Hora fin *</label><Input type="time" value={nuevaMateria.horaFin} onChange={(e) => setNuevaMateria({...nuevaMateria, horaFin: e.target.value})} required /></div>
 </div>
 <div>
 <label className="text-sm font-semibold">Aula (opcional)</label>
 <select
 value={nuevaMateria.aula}
 onChange={(e) => setNuevaMateria({...nuevaMateria, aula: e.target.value})}
 className="w-full h-10 px-3 rounded-md border border-border bg-background"
 >
 <option value="">Sin asignar</option>
 {aulasDisponibles.map((a) => (
 <option key={a} value={a}>{a}</option>
 ))}
 </select>
 </div>
 <div className="flex justify-end gap-2"><Button type="button" variant="outline" onClick={() => setModalMateria(false)}>Cancelar</Button><Button type="submit">Asignar</Button></div>
 </form>
 </Modal>
 </div>
 );
}