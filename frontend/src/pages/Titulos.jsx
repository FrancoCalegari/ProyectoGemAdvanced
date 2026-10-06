import { useState, useEffect } from 'react';
import { Plus, Search, Eye, Trash2, Pencil, Download } from 'lucide-react';
import { toast } from 'sonner';
import { titulosService } from '../services/titulos.service';
import api from '../services/api';
import { curricularService } from '../services/curricular.service';
import { generarPdfPlanEstudios } from '../utils/pdfPlanEstudios';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { DatePicker } from '../components/ui/DatePicker';
import { Card } from '../components/ui/Card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../components/ui/Table';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { NIVEL_LABEL, TIPO_CURSADA_LABEL, ESTADO_TITULO_LABEL } from '../utils/labels';
import { useAuth } from '../contexts/AuthContext';

export default function Titulos() {
 const [titulos, setTitulos] = useState([]);
 const [cargando, setCargando] = useState(true);
 const [busqueda, setBusqueda] = useState('');
 const [modalCrear, setModalCrear] = useState(false);
 const [modalDetalle, setModalDetalle] = useState(null);

 useEffect(() => {
 cargarTitulos();
 }, []);

 const cargarTitulos = async () => {
 try {
 setCargando(true);
 const data = await titulosService.listar();
 setTitulos(data);
 } catch (error) {
 toast.error('Error al cargar títulos');
 } finally {
 setCargando(false);
 }
 };

 const titulosFiltrados = titulos.filter((t) =>
 t.nombre.toLowerCase().includes(busqueda.toLowerCase())
 );

 const darDeBaja = async (id) => {
 if (!confirm('¿Estás seguro de dar de baja este título?')) return;
 try {
 await titulosService.darDeBaja(id);
 toast.success('Título dado de baja');
 cargarTitulos();
 } catch (error) {
 toast.error(error.response?.data?.message || 'Error al dar de baja');
 }
 };

 return (
 <div className="space-y-6">
 <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
 <div>
 <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Títulos</h1>
 <p className="text-sm sm:text-base text-muted-foreground font-medium mt-1">
 Gestiona las carreras de la institución
 </p>
 </div>
 <Button onClick={() => setModalCrear(true)} className="w-full sm:w-auto">
 <Plus className="w-4 h-4 mr-2" />
 Nuevo Título
 </Button>
 </div>

 <Card>
 <div className="p-4 border-b border-border">
 <div className="relative max-w-md">
 <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
 <Input
 placeholder="Buscar títulos..."
 value={busqueda}
 onChange={(e) => setBusqueda(e.target.value)}
 className="pl-10"
 />
 </div>
 </div>

 {cargando ? (
 <div className="p-8 text-center text-muted-foreground font-medium">Cargando...</div>
 ) : titulosFiltrados.length === 0 ? (
 <div className="p-8 text-center text-muted-foreground font-medium">
 {busqueda ? 'No se encontraron resultados' : 'No hay títulos cargados'}
 </div>
 ) : (
 <Table>
 <TableHeader>
 <TableRow>
 <TableHead>Nombre</TableHead>
 <TableHead>Nivel</TableHead>
 <TableHead>Duración</TableHead>
 <TableHead>Resoluciones</TableHead>
 <TableHead>Estado</TableHead>
 <TableHead className="text-right">Acciones</TableHead>
 </TableRow>
 </TableHeader>
 <TableBody>
 {titulosFiltrados.map((titulo) => (
 <TableRow key={titulo.id}>
 <TableCell className="font-medium">{titulo.nombre}</TableCell>
 <TableCell>{titulo.nivel}</TableCell>
 <TableCell>{titulo.duracionAnios} anos</TableCell>
 <TableCell>
 <Badge variant="muted">
 {titulo.resoluciones?.length || 0}
 </Badge>
 </TableCell>
 <TableCell>
 <Badge variant={titulo.estado === 'ACTIVO' ? 'success' : 'danger'}>
 {titulo.estado}
 </Badge>
 </TableCell>
 <TableCell className="text-right">
 <div className="flex justify-end gap-1">
 <Button
 variant="ghost"
 size="icon"
 onClick={() => setModalDetalle(titulo.id)}
 >
 <Eye className="w-4 h-4" />
 </Button>
 <Button
 variant="ghost"
 size="icon"
 onClick={() => darDeBaja(titulo.id)}
 >
 <Trash2 className="w-4 h-4 text-destructive" />
 </Button>
 </div>
 </TableCell>
 </TableRow>
 ))}
 </TableBody>
 </Table>
 )}
 </Card>

 <ModalCrearTitulo
 open={modalCrear}
 onClose={() => setModalCrear(false)}
 onCreado={() => {
 setModalCrear(false);
 cargarTitulos();
 }}
 />

 <ModalDetalleTitulo
 tituloId={modalDetalle}
 onClose={() => setModalDetalle(null)}
 />
 </div>
 );
}

function ModalCrearTitulo({ open, onClose, onCreado }) {
 const [form, setForm] = useState({
 nombre: '',
 nivel: 'Terciario',
 duracionAnios: 3,
 descripcion: '',
 numero: '',
 anioCreacion: new Date().getFullYear(),
 codigo: '',
 fechaInicioVigencia: new Date().toISOString().split('T')[0],
 });
 const [cargando, setCargando] = useState(false);

 const handleSubmit = async (e) => {
 e.preventDefault();
 setCargando(true);

 try {
 await titulosService.crear({
 nombre: form.nombre,
 nivel: form.nivel,
 duracionAnios: parseInt(form.duracionAnios),
 descripcion: form.descripcion?.trim() || null,
 resolucion: {
 numero: form.numero,
 anioCreacion: parseInt(form.anioCreacion),
 codigo: form.codigo,
 fechaInicioVigencia: form.fechaInicioVigencia,
 },
 });
 toast.success('Título creado exitosamente');
 onCreado();
 } catch (error) {
 toast.error(error.response?.data?.message || 'Error al crear título');
 } finally {
 setCargando(false);
 }
 };

 return (
 <Modal open={open} onClose={onClose} title="Nuevo Título" size="lg">
 <form onSubmit={handleSubmit} className="space-y-4">
 <Input
 label="Nombre del título"
 value={form.nombre}
 onChange={(e) => setForm({ ...form, nombre: e.target.value })}
 required
 />
 <Input
 label="Nivel"
 value={form.nivel}
 onChange={(e) => setForm({ ...form, nivel: e.target.value })}
 required
 />
 <Input
 label="Duración (anos)"
 type="number"
 value={form.duracionAnios}
 onChange={(e) => setForm({ ...form, duracionAnios: e.target.value })}
 required
 />
 <div>
 <label className="text-sm font-medium text-foreground mb-1.5 block">
 Descripción de la carrera
 </label>
 <textarea
 value={form.descripcion}
 onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
 rows={4}
 placeholder="Ej: Formacion de 3 anos orientada a la gestion de organizaciones publicas y privadas. Los egresados podran desempenarse en areas de administracion, RRHH, comercializacion y finanzas."
 className="w-full px-3 py-2 rounded-md border border-border bg-background text-sm resize-y focus:outline-none focus:ring-2 focus:ring-primary/40"
 />
 <p className="text-xs text-muted-foreground mt-1">
 Se muestra al alumno en el detalle de la carrera. Podes dejarlo vacio y completarlo despues.
 </p>
 </div>

 <div className="border-t border-border pt-4">
 <h3 className="text-sm font-semibold mb-3">Resolución Inicial</h3>
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
 <Input
 label="Número"
 value={form.numero}
 onChange={(e) => setForm({ ...form, numero: e.target.value })}
 placeholder="045"
 required
 />
 <Input
 label="Ano creacion"
 type="number"
 value={form.anioCreacion}
 onChange={(e) => setForm({ ...form, anioCreacion: e.target.value })}
 required
 />
 </div>
 <Input
 label="Código"
 value={form.codigo}
 onChange={(e) => setForm({ ...form, codigo: e.target.value })}
 placeholder="RES-045/2026"
 className="mt-3"
 required
 />
 <div>
  <label className="text-sm font-semibold text-foreground mb-1 block">Fecha inicio vigencia</label>
  <DatePicker value={form.fechaInicioVigencia} onChange={(v) => setForm({ ...form, fechaInicioVigencia: v })} />
</div>
 </div>

 <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 pt-4 border-t border-border">
 <Button type="button" variant="outline" onClick={onClose} className="w-full sm:w-auto">
 Cancelar
 </Button>
 <Button type="submit" disabled={cargando} className="w-full sm:w-auto">
 {cargando ? 'Creando...' : 'Crear Título'}
 </Button>
 </div>
 </form>
 </Modal>
 );
}

function ModalDetalleTitulo({ tituloId, onClose }) {
 const [titulo, setTitulo] = useState(null);
 const [cargando, setCargando] = useState(false);
 const [aniosAbiertos, setAniosAbiertos] = useState({});
 const [editandoDesc, setEditandoDesc] = useState(false);
 const [descTemp, setDescTemp] = useState('');
 const [guardandoDesc, setGuardandoDesc] = useState(false);
 const { isAdmin } = useAuth();
 const [materiaDetalleId, setMateriaDetalleId] = useState(null);
 const [modalFormMateria, setModalFormMateria] = useState(null);
 const [refreshKey, setRefreshKey] = useState(0);

 useEffect(() => {
 if (tituloId) {
 setCargando(true);
 setAniosAbiertos({});
 titulosService.obtenerPorId(tituloId)
 .then(setTitulo)
 .catch(() => toast.error('Error al cargar detalle'))
 .finally(() => setCargando(false));
 } else {
 setTitulo(null);
 }
 }, [tituloId, refreshKey]);

 const toggleAnio = (anioId) => {
 setAniosAbiertos((prev) => ({ ...prev, [anioId]: !prev[anioId] }));
 };

 // Obtener la resolución vigente (o la primera) para mostrar el plan de estudios
 const resolucionVigente = titulo?.resoluciones?.find((r) => r.estado === 'VIGENTE')
 || titulo?.resoluciones?.[0];

 const totalMaterias = resolucionVigente?.aniosCurriculares?.reduce(
 (acc, a) => acc + (a.materias?.length || 0), 0
 ) || 0;

 const totalHoras = resolucionVigente?.aniosCurriculares?.reduce(
 (acc, a) => acc + (a.materias?.reduce((s, m) => s + (m.cargaHoraria || 0), 0) || 0), 0
 ) || 0;

 const handleGuardarDesc = async () => {
 setGuardandoDesc(true);
 try {
 await titulosService.actualizar(titulo.id, { descripcion: descTemp.trim() || null });
 toast.success('Descripción actualizada');
 setTitulo({ ...titulo, descripcion: descTemp.trim() || null });
 setEditandoDesc(false);
 } catch (error) {
 toast.error(error.response?.data?.message || 'Error al guardar');
 } finally {
 setGuardandoDesc(false);
 }
 };

 return (
 <Modal open={!!tituloId} onClose={onClose} title="Detalle del Título" size="xl">
 {cargando ? (
 <p className="text-muted-foreground">Cargando...</p>
 ) : titulo ? (
 <div className="space-y-6">
 {/* HEADER */}
 <div className="space-y-2">
 <h3 className="text-xl sm:text-2xl font-bold text-foreground">{titulo.nombre}</h3>
 <div className="flex flex-wrap items-center gap-2">
 <Badge variant="secondary">{NIVEL_LABEL[titulo.nivel] || titulo.nivel}</Badge>
 <Badge variant="muted">{titulo.duracionAnios} anos</Badge>
 <Badge variant={titulo.estado === 'ACTIVO' ? 'success' : 'danger'}>
 {ESTADO_TITULO_LABEL[titulo.estado] || titulo.estado}
 </Badge>
 {resolucionVigente && (
 <Badge variant="outline" className="text-xs">
 {totalMaterias} materias - {totalHoras} hs
 </Badge>
 )}
 <Button
 size="sm"
 variant="outline"
 onClick={() => generarPdfPlanEstudios(titulo)}
 className="ml-auto"
 >
 <Download className="w-3.5 h-3.5 mr-1.5" />
 PDF completo
 </Button>
 </div>
 </div>

 {/* DESCRIPCION / INTRODUCCION */}
 <div className="rounded-lg border border-border bg-muted/30 p-4">
 <div className="flex items-center justify-between mb-2">
 <h4 className="text-sm font-semibold text-foreground">Sobre la carrera</h4>
 {isAdmin && !editandoDesc && (
 <Button
 size="sm"
 variant="ghost"
 onClick={() => {
 setDescTemp(titulo.descripcion || '');
 setEditandoDesc(true);
 }}
 >
 Editar descripción
 </Button>
 )}
 </div>
 {editandoDesc ? (
 <div className="space-y-2">
 <textarea
 value={descTemp}
 onChange={(e) => setDescTemp(e.target.value)}
 rows={5}
 className="w-full px-3 py-2 rounded-md border border-border bg-background text-sm resize-y focus:outline-none focus:ring-2 focus:ring-primary/40"
 placeholder="Escribi una introduccion a la carrera..."
 />
 <div className="flex justify-end gap-2">
 <Button
 size="sm"
 variant="ghost"
 onClick={() => setEditandoDesc(false)}
 disabled={guardandoDesc}
 >
 Cancelar
 </Button>
 <Button size="sm" onClick={handleGuardarDesc} disabled={guardandoDesc}>
 {guardandoDesc ? 'Guardando...' : 'Guardar'}
 </Button>
 </div>
 </div>
 ) : titulo.descripcion ? (
 <p className="text-sm text-muted-foreground whitespace-pre-line leading-relaxed">
 {titulo.descripcion}
 </p>
 ) : (
 <p className="text-sm text-muted-foreground italic">
 Sin descripción cargada.{isAdmin ? ' Usá "Editar descripción" para agregarla.' : ''}
 </p>
 )}
 </div>

 {/* PLAN DE ESTUDIOS */}
 {resolucionVigente?.aniosCurriculares?.length > 0 ? (
 <div className="space-y-3">
 <div className="flex items-center justify-between">
 <h4 className="text-sm font-semibold text-foreground">Plan de estudios</h4>
 <span className="text-xs text-muted-foreground font-medium">
 Resolución {resolucionVigente.codigo}
 </span>
 </div>
 <div className="space-y-2">
 {resolucionVigente.aniosCurriculares
 .sort((a, b) => a.numeroAnio - b.numeroAnio)
 .map((anio) => {
 const abierto = aniosAbiertos[anio.id];
 const cantMaterias = anio.materias?.length || 0;
 const horasAnio = anio.materias?.reduce((s, m) => s + (m.cargaHoraria || 0), 0) || 0;
 return (
 <div key={anio.id} className="rounded-lg border border-border overflow-hidden">
 <div className="flex items-center">
 <button
 type="button"
 onClick={() => toggleAnio(anio.id)}
 className="flex-1 flex items-center justify-between gap-3 p-3 hover:bg-accent transition-colors text-left"
 >
 <div className="flex items-center gap-3 min-w-0">
 <span className={`text-primary transition-transform ${abierto ? 'rotate-90' : ''}`}>
 &#9654;
 </span>
 <span className="font-medium text-sm">
 {anio.nombre || `${anio.numeroAnio}o Anio`}
 </span>
 <span className="text-xs text-muted-foreground font-medium">
 {cantMaterias} materias - {horasAnio} hs
 </span>
 </div>
 </button>
 <button
 type="button"
 onClick={() => generarPdfPlanEstudios(titulo, anio)}
 className="mr-1 p-1.5 rounded-md hover:bg-primary/10 text-primary transition-colors"
 title="Descargar PDF de este anio"
 >
 <Download className="w-4 h-4" />
 </button>
 {isAdmin && (
 <button
 type="button"
 onClick={() => setModalFormMateria({ anioId: anio.id, materia: null })}
 className="mr-2 p-1.5 rounded-md hover:bg-primary/10 text-primary transition-colors"
 title="Agregar materia a este anio"
 >
 <Plus className="w-4 h-4" />
 </button>
 )}
 </div>
 {abierto && (
 <div className="border-t border-border">
 {cantMaterias === 0 ? (
 <p className="p-3 text-sm text-muted-foreground italic">
 Sin materias cargadas
 </p>
 ) : (
 <div className="divide-y divide-border">
 {anio.materias
 .sort((a, b) => a.codigo.localeCompare(b.codigo))
 .map((m) => (
 <button
 key={m.id}
 type="button"
 onClick={() => setMateriaDetalleId(m.id)}
 className="w-full flex flex-col sm:flex-row sm:items-center gap-2 p-3 hover:bg-accent/30 transition-colors text-left"
 >
 <div className="flex items-center gap-3 flex-1 min-w-0">
 <span className="text-xs font-mono text-muted-foreground bg-muted px-2 py-0.5 rounded shrink-0">
 {m.codigo}
 </span>
 <span className="text-sm font-medium text-foreground truncate">
 {m.nombre}
 </span>
 </div>
 <div className="flex items-center gap-3 text-xs text-muted-foreground shrink-0">
 <span>{m.cargaHoraria} hs</span>
 <Badge variant="muted" className="text-xs">
 {TIPO_CURSADA_LABEL[m.tipoCursada] || m.tipoCursada}
 </Badge>
 </div>
 {isAdmin && (
 <span
 role="button"
 tabIndex={0}
 onClick={(e) => { e.stopPropagation(); setModalFormMateria({ anioId: anio.id, materia: m }); }}
 onKeyDown={(e) => { if (e.key === 'Enter') { e.stopPropagation(); setModalFormMateria({ anioId: anio.id, materia: m }); } }}
 className="p-1.5 rounded-md hover:bg-primary/10 text-primary transition-colors cursor-pointer shrink-0"
 title="Editar materia"
 >
 <Pencil className="w-3.5 h-3.5" />
 </span>
 )}
 </button>
 ))}
 </div>
 )}
 </div>
 )}
 </div>
 );
 })}
 </div>
 </div>
 ) : (
 <div className="rounded-lg border border-dashed border-border p-4 text-center">
 <p className="text-sm text-muted-foreground">
 Esta carrera todavia no tiene un plan de estudios cargado.
 </p>
 </div>
 )}

 {/* RESOLUCIONES */}
 {titulo.resoluciones?.length > 0 && (
 <div className="space-y-2">
 <h4 className="text-sm font-semibold text-foreground">Resoluciones</h4>
 <div className="space-y-2">
 {titulo.resoluciones.map((r) => (
 <div
 key={r.id}
 className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-3 bg-muted/50 rounded-md"
 >
 <div>
 <p className="font-medium text-sm">{r.codigo}</p>
 <p className="text-xs text-muted-foreground font-medium">
 Inicio: {new Date(r.fechaInicioVigencia).toLocaleDateString('es-AR')}
 {r.fechaFinVigencia && ` - Fin: ${new Date(r.fechaFinVigencia).toLocaleDateString('es-AR')}`}
 </p>
 </div>
 <Badge variant={r.estado === 'VIGENTE' ? 'success' : 'muted'}>
 {r.estado === 'VIGENTE' ? 'Vigente' : 'Cerrada'}
 </Badge>
 </div>
 ))}
 </div>
 </div>
 )}
 </div>
 ) : null}
 <ModalMateriaDetalle
 materiaId={materiaDetalleId}
 onClose={() => setMateriaDetalleId(null)}
 />
 <ModalFormMateria
 config={modalFormMateria}
 onClose={() => setModalFormMateria(null)}
 onGuardado={() => {
 setModalFormMateria(null);
 setRefreshKey((k) => k + 1);
 }}
 />
 </Modal>
 );
}
function ModalMateriaDetalle({ materiaId, onClose }) {
 const [materia, setMateria] = useState(null);
 const [cargando, setCargando] = useState(false);

 useEffect(() => {
 if (materiaId) {
 setCargando(true);
 api.get(`/curricular/materias/${materiaId}`)
 .then((res) => setMateria(res.data))
 .catch(() => toast.error('Error al cargar la materia'))
 .finally(() => setCargando(false));
 } else {
 setMateria(null);
 }
 }, [materiaId]);

 const anio = materia?.anioCurricular;

 return (
 <Modal open={!!materiaId} onClose={onClose} title="Detalle de la Materia" size="lg">
 {cargando ? (
 <p className="text-muted-foreground">Cargando...</p>
 ) : materia ? (
 <div className="space-y-5">
 <div className="space-y-2">
 <div className="flex items-start gap-3">
 <span className="text-xs font-mono text-muted-foreground bg-muted px-2 py-1 rounded shrink-0">
 {materia.codigo}
 </span>
 <h3 className="text-lg sm:text-xl font-bold text-foreground">{materia.nombre}</h3>
 </div>
 <div className="flex flex-wrap items-center gap-2">
 <Badge variant="muted">{materia.cargaHoraria} hs</Badge>
 <Badge variant="secondary">{TIPO_CURSADA_LABEL[materia.tipoCursada] || materia.tipoCursada}</Badge>
 {anio && <Badge variant="outline">{anio.nombre || `${anio.numeroAnio}o Anio`}</Badge>}
 </div>
 </div>

 {materia.descripcion && (
 <div className="rounded-lg border border-border bg-muted/30 p-4">
 <h4 className="text-sm font-semibold text-foreground mb-2">Qué se aprende</h4>
 <p className="text-sm text-muted-foreground whitespace-pre-line leading-relaxed">{materia.descripcion}</p>
 </div>
 )}

 {materia.objetivos && (
 <div className="rounded-lg border border-border bg-muted/30 p-4">
 <h4 className="text-sm font-semibold text-foreground mb-2">Objetivos</h4>
 <p className="text-sm text-muted-foreground whitespace-pre-line leading-relaxed">{materia.objetivos}</p>
 </div>
 )}

 {materia.contenidosMinimos && (
 <div className="rounded-lg border border-border bg-muted/30 p-4">
 <h4 className="text-sm font-semibold text-foreground mb-2">Contenidos mínimos</h4>
 <p className="text-sm text-muted-foreground whitespace-pre-line leading-relaxed">{materia.contenidosMinimos}</p>
 </div>
 )}

 {!materia.descripcion && !materia.objetivos && !materia.contenidosMinimos && (
 <div className="rounded-lg border border-dashed border-border p-4 text-center">
 <p className="text-sm text-muted-foreground italic">
 Esta materia todavia no tiene descripción, objetivos ni contenidos cargados.
 </p>
 </div>
 )}

 {materia.correlativasParaEsta?.length > 0 && (
 <div className="space-y-2">
 <h4 className="text-sm font-semibold text-foreground">Para cursar esta materia necesitas:</h4>
 <div className="space-y-1">
 {materia.correlativasParaEsta.map((c) => (
 <div key={c.id} className="flex items-center gap-2 text-sm p-2 rounded-md bg-muted/30">
 <span className="text-xs font-mono text-muted-foreground bg-muted px-2 py-0.5 rounded">
 {c.materiaRequerida.codigo}
 </span>
 <span>{c.materiaRequerida.nombre}</span>
 <Badge variant="muted" className="ml-auto text-xs">
 {c.tipo === 'PARA_CURSAR' ? 'Para cursar' : 'Para rendir final'}
 </Badge>
 </div>
 ))}
 </div>
 </div>
 )}

 {materia.profesores?.length > 0 && (
 <div className="space-y-2">
 <h4 className="text-sm font-semibold text-foreground">Docentes asignados</h4>
 <div className="space-y-1">
 {materia.profesores.map((mp) => (
 <div key={mp.id} className="flex items-center justify-between text-sm p-2 rounded-md bg-muted/30">
 <span>{mp.profesor.apellido}, {mp.profesor.nombre}</span>
 <span className="text-xs text-muted-foreground font-medium">
 {DIAS_SEMANA[mp.diaSemana]} {mp.horaInicio}-{mp.horaFin}
 </span>
 </div>
 ))}
 </div>
 </div>
 )}
 </div>
 ) : null}
 </Modal>
 );
}

const DIAS_SEMANA = ['Domingo', 'Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado'];

function ModalFormMateria({ config, onClose, onGuardado }) {
 const abierto = !!config;
 const editando = !!config?.materia;
 const [form, setForm] = useState({
 nombre: '', codigo: '', cargaHoraria: 96, tipoCursada: 'ANUAL',
 descripcion: '', contenidosMinimos: '', objetivos: '',
 });
 const [guardando, setGuardando] = useState(false);

 useEffect(() => {
 if (config?.materia) {
 const m = config.materia;
 setForm({
 nombre: m.nombre || '',
 codigo: m.codigo || '',
 cargaHoraria: m.cargaHoraria || 96,
 tipoCursada: m.tipoCursada || 'ANUAL',
 descripcion: m.descripcion || '',
 contenidosMinimos: m.contenidosMinimos || '',
 objetivos: m.objetivos || '',
 });
 } else if (config) {
 setForm({ nombre: '', codigo: '', cargaHoraria: 96, tipoCursada: 'ANUAL', descripcion: '', contenidosMinimos: '', objetivos: '' });
 }
 }, [config]);

 const handleSubmit = async (e) => {
 e.preventDefault();
 setGuardando(true);
 try {
 const payload = {
 nombre: form.nombre.trim(),
 codigo: form.codigo.trim(),
 cargaHoraria: parseInt(form.cargaHoraria, 10),
 tipoCursada: form.tipoCursada,
 descripcion: form.descripcion.trim() || null,
 contenidosMinimos: form.contenidosMinimos.trim() || null,
 objetivos: form.objetivos.trim() || null,
 };
 if (editando) {
 await curricularService.actualizarMateria(config.materia.id, payload);
 toast.success('Materia actualizada');
 } else {
 await curricularService.crearMateria(config.anioId, payload);
 toast.success('Materia creada');
 }
 onGuardado();
 } catch (error) {
 toast.error(error.response?.data?.message || 'Error al guardar la materia');
 } finally {
 setGuardando(false);
 }
 };

 return (
 <Modal open={abierto} onClose={onClose} title={editando ? 'Editar Materia' : 'Nueva Materia'} size="xl">
 <form onSubmit={handleSubmit} className="space-y-4">
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
 <div className="sm:col-span-2">
 <label className="text-sm font-semibold">Nombre *</label>
 <Input value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} required />
 </div>
 <div>
 <label className="text-sm font-semibold">Código *</label>
 <Input value={form.codigo} onChange={(e) => setForm({ ...form, codigo: e.target.value })} required placeholder="TSA101" />
 </div>
 <div>
 <label className="text-sm font-semibold">Carga horaria (hs) *</label>
 <Input type="number" value={form.cargaHoraria} onChange={(e) => setForm({ ...form, cargaHoraria: e.target.value })} required />
 </div>
 <div className="sm:col-span-2">
 <label className="text-sm font-semibold">Tipo de Cursada *</label>
 <select
 value={form.tipoCursada}
 onChange={(e) => setForm({ ...form, tipoCursada: e.target.value })}
 className="w-full h-10 px-3 rounded-md border border-border bg-background"
 >
 <option value="ANUAL">Anual</option>
 <option value="CUATRIMESTRAL_1">1er Cuatrimestre</option>
 <option value="CUATRIMESTRAL_2">2do Cuatrimestre</option>
 </select>
 </div>
 </div>

 <div className="border-t border-border pt-4 space-y-3">
 <h3 className="text-sm font-semibold">Informacion pedagogica</h3>
 <div>
 <label className="text-sm font-semibold">Que se aprende (descripción)</label>
 <textarea
 value={form.descripcion}
 onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
 rows={3}
 className="w-full px-3 py-2 rounded-md border border-border bg-background text-sm resize-y"
 placeholder="Breve descripción de los aprendizajes esperados..."
 />
 </div>
 <div>
 <label className="text-sm font-semibold">Objetivos</label>
 <textarea
 value={form.objetivos}
 onChange={(e) => setForm({ ...form, objetivos: e.target.value })}
 rows={3}
 className="w-full px-3 py-2 rounded-md border border-border bg-background text-sm resize-y"
 placeholder="Objetivos pedagogicos de la materia..."
 />
 </div>
 <div>
 <label className="text-sm font-semibold">Contenidos mínimos</label>
 <textarea
 value={form.contenidosMinimos}
 onChange={(e) => setForm({ ...form, contenidosMinimos: e.target.value })}
 rows={4}
 className="w-full px-3 py-2 rounded-md border border-border bg-background text-sm resize-y"
 placeholder="Temario / unidades / ejes tematicos..."
 />
 </div>
 </div>

 <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 pt-4 border-t border-border">
 <Button type="button" variant="outline" onClick={onClose} disabled={guardando}>Cancelar</Button>
 <Button type="submit" disabled={guardando}>
 {guardando ? 'Guardando...' : (editando ? 'Guardar cambios' : 'Crear materia')}
 </Button>
 </div>
 </form>
 </Modal>
 );
}
