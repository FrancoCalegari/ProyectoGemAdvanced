import { useState, useEffect } from 'react';
import { ChevronRight, Home, Search, FileText, CheckCircle2, XCircle, Clock, Calendar, User, ArrowLeft, GraduationCap, Users, Info } from 'lucide-react';
import { toast } from 'sonner';
import { alumnosService } from '../services/alumnos.service';
import { certificadosPresentadosService } from '../services/certificadosPresentados.service';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';

const TIPOS = {
 MEDICO: 'Médico',
 LABORAL: 'Laboral',
 FAMILIAR: 'Familiar',
 OTRO: 'Otro',
};

const ESTADO_BADGE = {
 PENDIENTE: { variant: 'warning', icon: Clock, label: 'Pendiente' },
 APROBADO: { variant: 'success', icon: CheckCircle2, label: 'Aprobado' },
 RECHAZADO: { variant: 'danger', icon: XCircle, label: 'Rechazado' },
};

export default function CertificadosPresentados() {
 const [agrupados, setAgrupados] = useState([]);
 const [cargando, setCargando] = useState(true);

 // Navegacion
 const [títuloSel, setTítuloSel] = useState(null);
 const [resoluciónSel, setResoluciónSel] = useState(null);
 const [anioSel, setAnioSel] = useState(null);
 const [alumnoSel, setAlumnoSel] = useState(null);

 // Busqueda global
 const [busqueda, setBusqueda] = useState('');
 const [resultadosBusqueda, setResultadosBusqueda] = useState(null);

 useEffect(() => { cargar(); }, []);

 const cargar = async () => {
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

 const buscarGlobal = async () => {
 if (!busqueda.trim()) { setResultadosBusqueda(null); return; }
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
 setTítuloSel(null); setResoluciónSel(null); setAnioSel(null);
 setAlumnoSel(null); setBusqueda(''); setResultadosBusqueda(null);
 };

 const nivelActual = alumnoSel ? 4 : anioSel ? 3 : resoluciónSel ? 2 : títuloSel ? 1 : 0;

 return (
 <div className="space-y-6">
 <div>
 <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Certificados Presentados</h1>
 <p className="text-sm sm:text-base text-muted-foreground font-medium mt-1">
 Aproba o rechaza los certificados que presentan los alumnos
 </p>
 </div>

 {/* Breadcrumb */}
 {nivelActual > 0 && (
 <div className="flex items-center gap-2 flex-wrap text-sm">
 <button onClick={resetNavegacion} className="flex items-center gap-1 text-primary hover:underline">
 <Home className="w-4 h-4" />Carreras
 </button>
 {títuloSel && (
 <>
 <ChevronRight className="w-4 h-4 text-muted-foreground" />
 <button
 onClick={() => { setResoluciónSel(null); setAnioSel(null); setAlumnoSel(null); }}
 className={`${resoluciónSel ? 'text-primary hover:underline' : 'text-foreground font-medium'}`}
 >
 {títuloSel.nombre}
 </button>
 </>
 )}
 {resoluciónSel && (
 <>
 <ChevronRight className="w-4 h-4 text-muted-foreground" />
 <button
 onClick={() => { setAnioSel(null); setAlumnoSel(null); }}
 className={`${anioSel ? 'text-primary hover:underline' : 'text-foreground font-medium'}`}
 >
 Res. {resoluciónSel.código}
 </button>
 </>
 )}
 {anioSel && (
 <>
 <ChevronRight className="w-4 h-4 text-muted-foreground" />
 <button
 onClick={() => setAlumnoSel(null)}
 className={`${alumnoSel ? 'text-primary hover:underline' : 'text-foreground font-medium'}`}
 >
 {anioSel.nombre}
 </button>
 </>
 )}
 {alumnoSel && (
 <>
 <ChevronRight className="w-4 h-4 text-muted-foreground" />
 <span className="text-foreground font-medium">{alumnoSel.apellido}, {alumnoSel.nombre}</span>
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
 <div className="border-t border-border max-h-60 overflow-y-auto divide-y divide-border">
 {resultadosBusqueda.length === 0 ? (
 <div className="p-6 text-center text-muted-foreground text-sm">Sin resultados</div>
 ) : (
 resultadosBusqueda.map((a) => (
 <button
 key={a.id}
 onClick={() => { setAlumnoSel(a); setBusqueda(''); setResultadosBusqueda(null); }}
 className="w-full text-left p-3 hover:bg-muted/40"
 >
 <p className="text-sm font-semibold">{a.apellido}, {a.nombre}</p>
 <p className="text-xs text-muted-foreground font-medium">DNI {a.dni}</p>
 </button>
 ))
 )}
 </div>
 )}
 </Card>

 {cargando ? (
 <div className="p-8 text-center text-muted-foreground font-medium">Cargando...</div>
 ) : (
 <>
 {/* Nivel 0 */}
 {nivelActual === 0 && (
 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
 {agrupados.map((t) => (
 <button key={t.títuloId} onClick={() => setTítuloSel(t)} className="text-left">
 <Card className="hover:border-primary hover:shadow-md transition-all h-full">
 <div className="p-5">
 <div className="flex items-start gap-3 mb-3">
 <div className="p-2 rounded-md bg-primary/10 shrink-0">
 <GraduationCap className="w-5 h-5 text-primary" />
 </div>
 <div className="min-w-0 flex-1">
 <h3 className="text-base font-semibold text-foreground line-clamp-2">{t.nombre}</h3>
 <p className="text-xs text-muted-foreground mt-1">Nivel: {t.nivel}</p>
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

 {/* Nivel 1 */}
 {nivelActual === 1 && títuloSel && (
 <div className="space-y-3">
 <Button variant="ghost" size="sm" onClick={resetNavegacion}><ArrowLeft className="w-4 h-4 mr-2" />Volver</Button>
 <h2 className="text-lg font-semibold">{títuloSel.nombre}</h2>
 {títuloSel.resoluciónes.map((r) => (
 <button key={r.resoluciónId} onClick={() => setResoluciónSel(r)} className="text-left w-full">
 <Card className="hover:border-primary hover:shadow-md transition-all">
 <div className="p-5 flex items-center justify-between gap-3">
 <div>
 <h3 className="text-base font-semibold">Resolución {r.código}</h3>
 <p className="text-xs text-muted-foreground mt-1">{r.anios.length} anos</p>
 </div>
 <div className="flex items-center gap-3">
 <span className="text-sm font-semibold">{r.totalAlumnos}</span>
 <ChevronRight className="w-4 h-4 text-muted-foreground" />
 </div>
 </div>
 </Card>
 </button>
 ))}
 </div>
 )}

 {/* Nivel 2 */}
 {nivelActual === 2 && resoluciónSel && (
 <div className="space-y-3">
 <Button variant="ghost" size="sm" onClick={() => setResoluciónSel(null)}><ArrowLeft className="w-4 h-4 mr-2" />Volver</Button>
 <h2 className="text-lg font-semibold">Resolución {resoluciónSel.código}</h2>
 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
 {resoluciónSel.anios.map((a) => (
 <button key={a.anioId} onClick={() => setAnioSel(a)} className="text-left">
 <Card className="hover:border-primary hover:shadow-md transition-all h-full">
 <div className="p-5">
 <div className="flex items-start gap-3 mb-3">
 <div className="p-2 rounded-md bg-primary/10 shrink-0">
 <Calendar className="w-5 h-5 text-primary" />
 </div>
 <div>
 <h3 className="text-base font-semibold">{a.nombre}</h3>
 <p className="text-xs text-muted-foreground mt-1">{a.númeroAnio} ano</p>
 </div>
 </div>
 <div className="flex items-center justify-between pt-3 border-t border-border">
 <span className="text-sm text-muted-foreground">{a.totalAlumnos} alumnos</span>
 <ChevronRight className="w-4 h-4 text-muted-foreground" />
 </div>
 </div>
 </Card>
 </button>
 ))}
 </div>
 </div>
 )}

 {/* Nivel 3 */}
 {nivelActual === 3 && anioSel && (
 <div className="space-y-3">
 <Button variant="ghost" size="sm" onClick={() => setAnioSel(null)}><ArrowLeft className="w-4 h-4 mr-2" />Volver</Button>
 <h2 className="text-lg font-semibold">{anioSel.nombre} — {anioSel.totalAlumnos} alumnos</h2>
 <Card>
 <div className="divide-y divide-border">
 {anioSel.alumnos.map((a) => (
 <button
 key={a.id}
 onClick={() => setAlumnoSel(a)}
 className="w-full text-left p-4 hover:bg-muted/40 transition-colors flex items-center justify-between"
 >
 <div>
 <p className="text-sm font-semibold">{a.apellido}, {a.nombre}</p>
 <p className="text-xs text-muted-foreground font-medium">DNI {a.dni} — {a.email}</p>
 </div>
 <ChevronRight className="w-4 h-4 text-muted-foreground" />
 </button>
 ))}
 </div>
 </Card>
 </div>
 )}

 {/* Nivel 4: panel del alumno */}
 {nivelActual === 4 && alumnoSel && (
 <PanelCertificadosPresentadosAlumno
 alumno={alumnoSel}
 onVolver={() => setAlumnoSel(null)}
 />
 )}
 </>
 )}
 </div>
 );
}

function PanelCertificadosPresentadosAlumno({ alumno, onVolver }) {
 const [certificados, setCertificados] = useState([]);
 const [cargando, setCargando] = useState(true);
 const [modalAprobar, setModalAprobar] = useState(null);
 const [modalRechazar, setModalRechazar] = useState(null);

 useEffect(() => {
 if (alumno?.id) cargar();
 }, [alumno?.id]);

 const cargar = async () => {
 try {
 setCargando(true);
 const data = await certificadosPresentadosService.listarPorAlumno(alumno.id);
 setCertificados(data);
 } catch (error) {
 toast.error('Error al cargar certificados');
 } finally {
 setCargando(false);
 }
 };

 const handleAprobar = async (observaciones) => {
 try {
 const resultado = await certificadosPresentadosService.aprobar(modalAprobar.id, { observaciones });
 const { asistenciasActualizadas = 0, asistenciasCreadas = 0 } = resultado || {};
 toast.success(
 `Certificado aprobado. ${asistenciasActualizadas} asistencias actualizadas, ${asistenciasCreadas} creadas.`
 );
 setModalAprobar(null);
 cargar();
 } catch (error) {
 toast.error(error.response?.data?.message || 'Error al aprobar');
 }
 };

 const handleRechazar = async (observaciones) => {
 try {
 await certificadosPresentadosService.rechazar(modalRechazar.id, { observaciones });
 toast.success('Certificado rechazado');
 setModalRechazar(null);
 cargar();
 } catch (error) {
 toast.error(error.response?.data?.message || 'Error al rechazar');
 }
 };

 const pendientes = certificados.filter((c) => c.estado === 'PENDIENTE').length;

 return (
 <div className="space-y-4">
 <Button variant="ghost" size="sm" onClick={onVolver}><ArrowLeft className="w-4 h-4 mr-2" />Volver</Button>

 <Card>
 <div className="p-4 sm:p-6 border-b border-border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
 <div className="min-w-0">
 <h2 className="text-lg sm:text-xl font-semibold text-foreground truncate">
 {alumno.apellido}, {alumno.nombre}
 </h2>
 <p className="text-xs sm:text-sm text-muted-foreground">DNI {alumno.dni} — {alumno.email}</p>
 </div>
 {pendientes > 0 && (
 <Badge variant="warning" className="shrink-0">
 {pendientes} pendiente{pendientes !== 1 ? 's' : ''}
 </Badge>
 )}
 </div>

 {cargando ? (
 <div className="p-8 text-center text-muted-foreground font-medium">Cargando...</div>
 ) : certificados.length === 0 ? (
 <div className="p-12 text-center">
 <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
 <h3 className="text-lg font-bold text-foreground mb-2">Sin certificados presentados</h3>
 <p className="text-muted-foreground text-sm">
 Este alumno todavia no presento certificados para justificar ausencias.
 </p>
 </div>
 ) : (
 <div className="divide-y divide-border">
 {certificados.map((cert) => {
 const info = ESTADO_BADGE[cert.estado] || ESTADO_BADGE.PENDIENTE;
 const Icon = info.icon;
 return (
 <div
 key={cert.id}
 className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 p-4 hover:bg-muted/30 transition-colors"
 >
 <div className="flex items-start gap-3 min-w-0 flex-1">
 <Icon className={`w-5 h-5 shrink-0 mt-0.5 ${
 cert.estado === 'PENDIENTE' ? 'text-yellow-600' :
 cert.estado === 'APROBADO' ? 'text-green-600' : 'text-red-600'
 }`} />
 <div className="min-w-0">
 <p className="text-sm font-semibold text-foreground">
 {TIPOS[cert.tipo] || cert.tipo}
 </p>
 <p className="text-xs text-muted-foreground mt-0.5">{cert.motivo}</p>
 <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
 <Calendar className="w-3 h-3" />
 <span>
 {new Date(cert.fechaDesde).toLocaleDateString('es-AR')} → {new Date(cert.fechaHasta).toLocaleDateString('es-AR')}
 </span>
 </div>
 </div>
 </div>
 <div className="flex items-center gap-2 shrink-0">
 <Badge variant={info.variant}>{info.label}</Badge>
 {cert.estado === 'PENDIENTE' && (
 <>
 <Button size="sm" variant="outline" onClick={() => setModalAprobar(cert)}>
 <CheckCircle2 className="w-4 h-4 mr-1 text-green-600" />
 Aprobar
 </Button>
 <Button size="sm" variant="outline" onClick={() => setModalRechazar(cert)}>
 <XCircle className="w-4 h-4 mr-1 text-destructive" />
 Rechazar
 </Button>
 </>
 )}
 </div>
 </div>
 );
 })}
 </div>
 )}
 </Card>

 {modalAprobar && (
 <ModalAccion
 open={!!modalAprobar}
 onClose={() => setModalAprobar(null)}
 título="Aprobar Certificado"
 descripción={`Al aprobar el certificado de ${alumno.apellido}, ${alumno.nombre}, las faltas en el rango ${new Date(modalAprobar.fechaDesde).toLocaleDateString('es-AR')} → ${new Date(modalAprobar.fechaHasta).toLocaleDateString('es-AR')} se marcaran como JUSTIFICADO.`}
 colorBoton="default"
 textoBoton="Aprobar y justificar"
 onConfirmar={handleAprobar}
 />
 )}

 {modalRechazar && (
 <ModalAccion
 open={!!modalRechazar}
 onClose={() => setModalRechazar(null)}
 título="Rechazar Certificado"
 descripción={`Se rechazara el certificado de ${alumno.apellido}, ${alumno.nombre}. Las asistencias no seran modificadas.`}
 colorBoton="destructive"
 textoBoton="Rechazar"
 onConfirmar={handleRechazar}
 />
 )}
 </div>
 );
}

function ModalAccion({ open, onClose, título, descripción, colorBoton, textoBoton, onConfirmar }) {
 const [observaciones, setObservaciones] = useState('');
 const [cargando, setCargando] = useState(false);

 useEffect(() => { if (open) setObservaciones(''); }, [open]);

 const handle = async () => {
 setCargando(true);
 try { await onConfirmar(observaciones || null); }
 finally { setCargando(false); }
 };

 return (
 <Modal open={open} onClose={onClose} title={título} size="md">
 <div className="space-y-4">
 <p className="text-sm text-foreground">{descripción}</p>
 <div>
 <label className="block text-sm font-medium mb-1 text-foreground">Observaciones (opcional)</label>
 <textarea
 value={observaciones}
 onChange={(e) => setObservaciones(e.target.value)}
 rows={3}
 className="w-full px-3 py-2 rounded-md border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
 placeholder="Agrega una nota interna si queres..."
 />
 </div>
 <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 pt-4 border-t border-border">
 <Button variant="outline" onClick={onClose} className="w-full sm:w-auto">Cancelar</Button>
 <Button variant={colorBoton} onClick={handle} disabled={cargando} className="w-full sm:w-auto">
 {cargando ? 'Procesando...' : textoBoton}
 </Button>
 </div>
 </div>
 </Modal>
 );
}