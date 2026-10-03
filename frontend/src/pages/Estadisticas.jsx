import { useState, useEffect, useRef } from 'react';
import {
 BarChart, Bar, PieChart, Pie, Cell,
 XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
 RadialBarChart, RadialBar
} from 'recharts';
import {
 Users, BookOpen, CalendarCheck, CalendarDays, Award, FileText,
 TrendingUp, TrendingDown, X, FileCheck, Download, FileDown
} from 'lucide-react';
import { toast } from 'sonner';
import { estadisticasService } from '../services/estadisticas.service';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { DatePicker } from '../components/ui/DatePicker';
import { Card } from '../components/ui/Card';
import { exportarCSV, exportarPDF, formatearPeriodo } from '../utils/exportar';
const COLORES = [
 '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
 '#ec4899', '#14b8a6', '#f97316', '#06b6d4', '#84cc16',
 '#a855f7', '#f43f5e', '#6366f1', '#eab308', '#22c55e',
 '#0ea5e9', '#d946ef', '#64748b', '#e11d48', '#0d9488',
];
const TABS = [
 { id: 'resumen', label: 'Resumen General', icon: TrendingUp, desc: 'Indicadores clave del sistema' },
 { id: 'alumnos', label: 'Alumnos', icon: Users, desc: 'Estado, distribucion y evolucion de la matrícula estudiantil' },
 { id: 'cursadas', label: 'Materias', icon: BookOpen, desc: 'Rendimiento academico por materia y estado' },
 { id: 'asistencias', label: 'Asistencias', icon: CalendarCheck, desc: 'Asistencias, inasistencias y justificaciones registradas' },
 { id: 'mesas', label: 'Mesas de Examen', icon: CalendarDays, desc: 'Mesas Finales, Ingresos Nivelatorios y presentismo' },
 { id: 'certificados', label: 'Certificados', icon: Award, desc: 'Certificados emitidos y presentados por tipo y estado' },
];
const ESTADOS_ALUMNO = {
 ACTIVO: '#10b981',
 EGRESADO: '#3b82f6',
 BAJA: '#ef4444',
 INACTIVO: '#9ca3af',
};
const ESTADOS_CURSADA = {
 APROBADA: '#10b981',
 REGULAR: '#3b82f6',
 EN_CURSO: '#f59e0b',
 DESAPROBADA: '#ef4444',
 LIBRE: '#8b5cf6',
};
const ESTADOS_LABEL = {
 ACTIVO: 'Activo',
 EGRESADO: 'Egresado',
 BAJA: 'Baja',
 INACTIVO: 'Inactivo',
 APROBADA: 'Aprobada',
 REGULAR: 'Regular',
 EN_CURSO: 'En curso',
 DESAPROBADA: 'Desaprobada',
 LIBRE: 'Libre',
 PRESENTE: 'Presente',
 AUSENTE: 'Ausente',
 JUSTIFICADO: 'Justificado',
 PENDIENTE: 'Pendiente',
 RECHAZADA: 'Rechazada',
 PROGRAMADA: 'Programada',
 EN_CURSO_MESA: 'En curso',
 FINALIZADA: 'Finalizada',
 CANCELADA: 'Cancelada',
 INSCRIPTO: 'Inscripto',
 CANCELADO: 'Cancelado',
 EXAMEN_FINAL: 'Examen final',
 INGRESO_NIVELATORIO: 'Ingreso Nivelatorio',
 PARCIAL_ANIO: 'Parcial de anio',
 TITULO_COMPLETO: 'Título completo',
 CONCURRENCIA: 'Concurrencia',
 PARA_COLECTIVO: 'Para colectivo',
 LABORAL: 'Laboral',
 PARA_RENDIR: 'Para rendir',
 EMITIDO: 'Emitido',
 ANULADO: 'Anulado',
 APROBADO: 'Aprobado',
 RECHAZADO: 'Rechazado',
};
function labelEstado(estado) {
 return ESTADOS_LABEL[estado] || estado;
}
function fmtNum(n) {
 if (n === null || n === undefined) return '0';
 return new Intl.NumberFormat('es-AR').format(n);
}
function fmtPct(n) {
 if (n === null || n === undefined) return '0%';
 return `${n}%`;
}
// ============================================================
// COMPONENTES DE PRESENTACION
// ============================================================
function KpiCard({ icon: Icon, label, value, sub }) {
 return (
 <Card className="p-5 h-full flex flex-col">
 <div className="flex items-start justify-between gap-3 flex-1">
 <div className="min-w-0 flex-1 flex flex-col">
 <p className="text-xs text-muted-foreground uppercase tracking-wider font-bold">
 {label}
 </p>
 <p className="text-3xl font-bold text-foreground mt-2 tabular-nums">{value}</p>
 {sub && <p className="text-xs text-muted-foreground mt-auto pt-2 truncate font-medium">{sub}</p>}
 </div>
 <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
 <Icon className="w-5 h-5 text-primary" />
 </div>
 </div>
 </Card>
 );
}
function SeccionHeader({ numero, titulo, descripcion, extra }) {
 return (
 <div className="flex items-start justify-between gap-4 mb-4">
 <div className="min-w-0 flex-1">
 <div className="flex items-center gap-2 mb-1">
 <span className="text-xs font-mono text-muted-foreground">§ {numero}</span>
 <h2 className="text-base font-semibold text-foreground">{titulo}</h2>
 </div>
 {descripcion && (
 <p className="text-xs text-muted-foreground italic">{descripcion}</p>
 )}
 </div>
 {extra}
 </div>
 );
}
function ChartCard({ id, title, description, nota, children, height = 300 }) {
 return (
 <Card className="p-5 flex flex-col" id={id}>
 <h3 className="text-sm font-semibold text-foreground">{title}</h3>
 {description && (
 <p className="text-xs text-muted-foreground italic mt-0.5 mb-3">{description}</p>
 )}
 <div style={{ width: '100%', minHeight: height, height }}>
 <ResponsiveContainer>{children}</ResponsiveContainer>
 </div>
 {nota && (
 <p className="text-xs text-muted-foreground mt-3 pt-3 border-t border-border">
 <span className="font-medium">Nota:</span> {nota}
 </p>
 )}
 </Card>
 );
}
function EmptyChart({ message = 'Sin datos para el período seleccionado' }) {
 return (
 <div className="h-full min-h-[200px] flex flex-col items-center justify-center text-sm text-muted-foreground font-medium p-4 text-center">
      <span className="text-3xl mb-2 opacity-30">—</span>
      {message}
    </div>
 );
}
// ============================================================
// COMPONENTE PRINCIPAL
// ============================================================
export default function Estadisticas() {
 const { isAdmin, isSecretaria } = useAuth();
 const [tab, setTab] = useState('resumen');
 const [desde, setDesde] = useState('');
 const [hasta, setHasta] = useState('');
 const [cargando, setCargando] = useState(true);
 const [exportando, setExportando] = useState(false);
 const [data, setData] = useState({
 resumen: null, alumnos: null, cursadas: null, asistencias: null,
 clasesSuspendidas: null, mesas: null, certificados: null,
 });
 const filtros = { desde: desde || undefined, hasta: hasta || undefined };
 const periodoTexto = formatearPeriodo(desde, hasta);
 useEffect(() => { cargar(); }, [desde, hasta]);
 const cargar = async () => {
 try {
 setCargando(true);
 const [resumen, alumnos, cursadas, asistencias, clasesSuspendidas, mesas, certificados] =
 await Promise.all([
 estadisticasService.resumen(filtros),
 estadisticasService.alumnos(filtros),
 estadisticasService.cursadas(filtros),
 estadisticasService.asistencias(filtros),
 estadisticasService.clasesSuspendidas(filtros),
 estadisticasService.mesas(filtros),
 estadisticasService.certificados(filtros),
 ]);
 setData({ resumen, alumnos, cursadas, asistencias, clasesSuspendidas, mesas, certificados });
 } catch (error) {
 toast.error('Error al cargar estadisticas');
 } finally {
 setCargando(false);
 }
 };
 const limpiarFiltros = () => { setDesde(''); setHasta(''); };
 // ============================================================
 // EXPORTAR CSV (por tab)
 // ============================================================
 const exportarCSVTab = () => {
 if (!data || !data[tab]) return;
 let filas = [];
 const d = data[tab];
 if (tab === 'resumen') {
 filas = [
 { metrica: 'Alumnos total', valor: d.alumnos?.total ?? 0 },
 { metrica: 'Alumnos activos %', valor: d.alumnos?.activos ?? 0 },
 { metrica: 'Materias Totales', valor: d.cursadas?.total ?? 0 },
 { metrica: 'Aprobación %', valor: d.cursadas?.aprobación ?? 0 },
 { metrica: 'Promedio notas', valor: d.cursadas?.promedio ?? 0 },
 { metrica: 'Asistencias total', valor: d.asistencias?.total ?? 0 },
 { metrica: 'Asistencia %', valor: d.asistencias?.porcentajeAsistencia ?? 0 },
 { metrica: 'Clases canceladas', valor: d.clasesSuspendidas?.total ?? 0 },
 { metrica: 'Mesas total', valor: d.mesas?.total ?? 0 },
 { metrica: 'Certificados', valor: d.certificados?.total ?? 0 },
 ];
 } else if (tab === 'alumnos') {
 filas = [
 { metrica: 'Total alumnos', valor: d.total },
 { metrica: '% Activos', valor: d.porcentajes.activos },
 { metrica: '% Egresados', valor: d.porcentajes.egresados },
 { metrica: '% Bajas', valor: d.porcentajes.bajas },
 { metrica: '% Inactivos', valor: d.porcentajes.inactivos },
 ...d.porEstado.map((e) => ({ metrica: `Alumnos ${labelEstado(e.estado)}`, valor: e.cantidad })),
 ...d.porTitulo.map((t) => ({ metrica: `Título: ${t.título}`, valor: t.cantidad })),
 ];
 } else if (tab === 'cursadas') {
 filas = [
 { metrica: 'Total Materias', valor: d.total },
 { metrica: '% Aprobación', valor: d.porcentajeAprobación },
 { metrica: '% Desaprobación', valor: d.porcentajeDesaprobación },
 { metrica: 'Promedio notas', valor: d.promedioNotas },
 ...d.porEstado.map((e) => ({ metrica: `Cursadas ${labelEstado(e.estado)}`, valor: e.cantidad })),
 ...d.porMateria.map((m) => ({ metrica: `Materia: ${m.materia}`, valor: m.total })),
 ];
 } else if (tab === 'asistencias') {
 filas = [
 { metrica: 'Total asistencias', valor: d.total },
 { metrica: 'Presentes', valor: d.presentes },
 { metrica: 'Ausentes', valor: d.ausentes },
 { metrica: 'Justificados', valor: d.justificados },
 { metrica: '% Asistencia', valor: d.porcentajeAsistencia },
 { metrica: '% Inasistencia', valor: d.porcentajeInasistencia },
 ];
 } else if (tab === 'mesas') {
 filas = [
 { metrica: 'Total mesas', valor: d.total },
 { metrica: 'Total inscripciones', valor: d.inscripciones.total },
 { metrica: '% Presentismo', valor: d.inscripciones.porcentajePresentismo },
 { metrica: 'Presentes', valor: d.inscripciones.presentes },
 { metrica: 'Ausentes', valor: d.inscripciones.ausentes },
 ...d.porTipo.map((t) => ({ metrica: `Mesas ${labelEstado(t.tipo)}`, valor: t.cantidad })),
 ];
 } else if (tab === 'certificados') {
 filas = [
 { metrica: 'Total certificados', valor: d.total },
 { metrica: 'Total presentados', valor: d.presentados.total },
 ...d.porTipo.map((t) => ({ metrica: `Certificados ${labelEstado(t.tipo)}`, valor: t.cantidad })),
 ...d.porEstado.map((e) => ({ metrica: `Certificados ${labelEstado(e.estado)}`, valor: e.cantidad })),
 ];
 }
 const nombre = `estadisticas_${tab}`;
 exportarCSV(nombre, filas);
 toast.success('CSV exportado');
 };
 // ============================================================
 // EXPORTAR PDF (por tab)
 // ============================================================
 const exportarPDFTab = async () => {
 if (!data[tab]) return;
 setExportando(true);
 try {
 const d = data[tab];
 const tabInfo = TABS.find((t) => t.id === tab);
 let secciones = [];
 if (tab === 'resumen') {
 secciones = [
 {
 título: '1. Indicadores clave (KPI)',
 descripción: 'Métricas principales del sistema en el periodo analizado',
 tipo: 'kpis',
 datos: {
 'Alumnos totales': fmtNum(d.alumnos?.total),
 '% Activos': fmtPct(d.alumnos?.activos),
 'Materias Totales': fmtNum(d.cursadas?.total),
 '% Aprobación': fmtPct(d.cursadas?.aprobación),
 'Promedio notas': d.cursadas?.promedio ?? 0,
 'Asistencias': fmtNum(d.asistencias?.total),
 '% Asistencia': fmtPct(d.asistencias?.porcentajeAsistencia),
 'Clases canceladas': fmtNum(d.clasesSuspendidas?.total),
 'Mesas': fmtNum(d.mesas?.total),
 'Certificados': fmtNum(d.certificados?.total),
 },
 },
 ];
 } else if (tab === 'alumnos') {
 secciones = [
 {
 título: '1. Distribucion por estado',
 descripción: 'Cantidad de alumnos en cada estado academico',
 tipo: 'tabla',
 datos: d.porEstado.map((e) => ({ Estado: labelEstado(e.estado), Cantidad: e.cantidad })),
 },
 {
 título: '2. Distribucion por título',
 descripción: 'Alumnos activamente inscriptos en cada carrera',
 tipo: 'tabla',
 datos: d.porTitulo.map((t) => ({ Título: t.título, Cantidad: t.cantidad })),
 },
 ];
 } else if (tab === 'cursadas') {
 secciones = [
 {
 título: '1. Resumen general',
 descripción: 'Métricas agregadas de todas las cursadas',
 tipo: 'kpis',
 datos: {
 'Total Materias': fmtNum(d.total),
 '% Aprobación': fmtPct(d.porcentajeAprobación),
 '% Desaprobación': fmtPct(d.porcentajeDesaprobación),
 'Promedio notas': d.promedioNotas,
 },
 },
 {
 título: '2. Cursadas por estado',
 tipo: 'tabla',
 datos: d.porEstado.map((e) => ({ Estado: labelEstado(e.estado), Cantidad: e.cantidad })),
 },
 {
 título: '3. Top 10 materias con mas cursadas',
 tipo: 'tabla',
 datos: d.porMateria.slice(0, 10).map((m) => ({
 Materia: m.materia,
 Total: m.total,
 Aprobadas: m.aprobadas,
 '% Aprob.': m.porcentaje,
 })),
 },
 ];
 } else if (tab === 'asistencias') {
 secciones = [
 {
 título: '1. Resumen general',
 tipo: 'kpis',
 datos: {
 'Total asistencias': fmtNum(d.total),
 'Presentes': fmtNum(d.presentes),
 'Ausentes': fmtNum(d.ausentes),
 'Justificados': fmtNum(d.justificados),
 '% Asistencia': fmtPct(d.porcentajeAsistencia),
 '% Inasistencia': fmtPct(d.porcentajeInasistencia),
 },
 },
 ];
 } else if (tab === 'mesas') {
 secciones = [
 {
 título: '1. Resumen general',
 tipo: 'kpis',
 datos: {
 'Total mesas': fmtNum(d.total),
 'Inscripciones': fmtNum(d.inscripciones.total),
 'Presentismo %': fmtPct(d.inscripciones.porcentajePresentismo),
 'Presentes': fmtNum(d.inscripciones.presentes),
 'Ausentes': fmtNum(d.inscripciones.ausentes),
 },
 },
 {
 título: '2. Mesas por tipo',
 tipo: 'tabla',
 datos: d.porTipo.map((t) => ({ Tipo: labelEstado(t.tipo), Cantidad: t.cantidad })),
 },
 ];
 } else if (tab === 'certificados') {
 secciones = [
 {
 título: '1. Resumen general',
 tipo: 'kpis',
 datos: {
 'Certificados emitidos': fmtNum(d.total),
 'Presentados': fmtNum(d.presentados.total),
 },
 },
 {
 título: '2. Certificados por tipo',
 tipo: 'tabla',
 datos: d.porTipo.map((t) => ({ Tipo: labelEstado(t.tipo), Cantidad: t.cantidad })),
 },
 ];
 }
 await exportarPDF({
 título: `${tabInfo?.label}`,
 subtítulo: 'Reporte estadístico institucional',
 periodo: periodoTexto,
 secciones,
 nombre: `estadisticas_${tab}`,
 });
 toast.success('PDF exportado');
 } catch (error) {
 console.error(error);
 toast.error('Error al generar PDF');
 } finally {
 setExportando(false);
 }
 };
 if (!isAdmin && !isSecretaria) {
 return (
 <div className="space-y-6">
 <h1 className="text-2xl sm:text-3xl font-bold">Estadísticas</h1>
 <Card><div className="p-12 text-center text-muted-foreground font-medium">Acceso restringido</div></Card>
 </div>
 );
 }
 return (
 <div className="space-y-6">
 {/* ============ ENCABEZADO CIENTIFICO ============ */}
 <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
 <div>
 <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
 Reporte Estadístico Institucional
 </h1>
 <p className="text-sm text-muted-foreground font-medium mt-1">
 Análisis de datos académicos con filtros de rango temporal
 </p>
 <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3 text-xs text-muted-foreground">
 <span>
 <span className="font-medium text-foreground">Periodo:</span> {periodoTexto}
 </span>
 <span>
 <span className="font-medium text-foreground">Generado:</span> {new Date().toLocaleString('es-AR')}
 </span>
 </div>
 </div>
 </div>
 {/* ============ FILTROS ============ */}
 <Card className="p-4 h-full flex flex-col">
 <div className="flex flex-col sm:flex-row gap-3 items-end">
 <div className="flex-1">
 <label className="block text-xs font-medium text-muted-foreground mb-1">Fecha desde</label>
 <DatePicker value={desde} onChange={(v) => setDesde(v)} />
 </div>
 <div className="flex-1">
 <label className="block text-xs font-medium text-muted-foreground mb-1">Fecha hasta</label>
 <DatePicker value={hasta} onChange={(v) => setHasta(v)} />
 </div>
 <Button variant="outline" onClick={limpiarFiltros} className="w-full sm:w-auto">
 <X className="w-4 h-4 mr-2" /> Limpiar filtros
 </Button>
 </div>
 </Card>
 {/* ============ TABS + BOTONES EXPORT ============ */}
 <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 border-b border-border">
 <div className="flex gap-2 overflow-x-auto">
 {TABS.map((t) => {
 const Icon = t.icon;
 return (
 <button
 key={t.id}
 onClick={() => setTab(t.id)}
 className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
              tab === tab.id
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
            }`}
 >
 <Icon className="w-4 h-4" /> {t.label}
 </button>
 );
 })}
 </div>
 <div className="flex gap-2 pb-2 lg:pb-0">
 <Button
 variant="outline"
 size="sm"
 onClick={exportarCSVTab}
 disabled={cargando || !data[tab]}
 >
 <FileText className="w-4 h-4 mr-1.5" /> CSV
 </Button>
 <Button
 variant="outline"
 size="sm"
 onClick={exportarPDFTab}
 disabled={cargando || !data[tab] || exportando}
 >
 <FileDown className="w-4 h-4 mr-1.5" /> {exportando ? 'Generando...' : 'PDF'}
 </Button>
 </div>
 </div>
 {cargando ? (
 <div className="p-12 text-center text-muted-foreground font-medium">Cargando estadisticas...</div>
 ) : (
 <>
 {/* ==================== RESUMEN ==================== */}
 {tab === 'resumen' && data.resumen && (
 <div className="space-y-6">
 <SeccionHeader
 número="1"
 título="Indicadores clave del sistema"
 descripción="Métricas principales agregadas en el periodo analizado"
 />
 <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
 <KpiCard icon={Users} label="Alumnos totales" value={fmtNum(data.resumen.alumnos.total)} sub={`${fmtPct(data.resumen.alumnos.activos)} activos`} />
 <KpiCard icon={BookOpen} label="Cursadas totales" value={fmtNum(data.resumen.cursadas.total)} sub={`Aprobación: ${fmtPct(data.resumen.cursadas.aprobación)}`} />
 <KpiCard icon={Award} label="Promedio notas" value={data.resumen.cursadas.promedio} sub="Escala 0-10" />
 <KpiCard icon={CalendarCheck} label="Asistencias" value={fmtNum(data.resumen.asistencias.total)} sub={`${fmtPct(data.resumen.asistencias.porcentajeAsistencia)} de asistencia`} />
 <KpiCard icon={CalendarDays} label="Clases canceladas" value={fmtNum(data.resumen.clasesSuspendidas.total)} />
 <KpiCard icon={Award} label="Certificados" value={fmtNum(data.resumen.certificados.total)} />
 </div>
 <SeccionHeader
 número="2"
 título="Distribucion comparativa"
 descripción="Visualizacion cruzada de las métricas principales"
 />
 <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-stretch">
 <ChartCard
 id="chart-aprobación"
 title="Tasa de aprobación general"
 description="Porcentaje de cursadas aprobadas sobre el total analizado"
 nota={`El ${data.resumen.cursadas.aprobación}% de las cursadas del periodo fueron aprobadas`}
 >
 {data.resumen.cursadas.total > 0 ? (
 <RadialBarChart
 innerRadius="60%"
 outerRadius="100%"
 data={[{ name: 'Aprobación', value: data.resumen.cursadas.aprobación, fill: '#10b981' }]}
 startAngle={90}
 endAngle={-270}
 >
 <RadialBar background dataKey="value" cornerRadius={10} />
 <Tooltip formatter={(v) => `${v}%`} />
 </RadialBarChart>
 ) : <EmptyChart />}
 </ChartCard>
 <ChartCard
 id="chart-alumnos-estado"
 title="Composicion de alumnos por estado"
 description="Proporcion de alumnos en cada estado academico"
 nota={`n = ${data.alumnos?.total || 0} alumnos en el periodo`}
 >
 {data.alumnos?.porEstado?.length > 0 ? (
 <PieChart>
 <Pie
 data={data.alumnos.porEstado.map((e) => ({ ...e, name: labelEstado(e.estado) }))}
 dataKey="cantidad"
 nameKey="name"
 cx="50%"
 cy="50%"
 outerRadius={90}
 label={(e) => `${e.name}: ${e.cantidad}`}
 >
 {data.alumnos.porEstado.map((e, i) => (
 <Cell key={i} fill={ESTADOS_ALUMNO[e.estado] || COLORES[i % COLORES.length]} />
 ))}
 </Pie>
 <Tooltip />
 <Legend verticalAlign="bottom" height={36} />
 </PieChart>
 ) : <EmptyChart />}
 </ChartCard>
 </div>
 </div>
 )}
 {/* ==================== ALUMNOS ==================== */}
 {tab === 'alumnos' && data.alumnos && (
 <div className="space-y-6">
 <SeccionHeader
 número="1"
 título="Indicadores de alumnos"
 descripción="Totales y proporciones por estado academico"
 />
 <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 items-stretch">
 <KpiCard icon={Users} label="Total" value={fmtNum(data.alumnos.total)} />
 <KpiCard icon={TrendingUp} label="Activos" value={fmtPct(data.alumnos.porcentajes.activos)} />
 <KpiCard icon={Award} label="Egresados" value={fmtPct(data.alumnos.porcentajes.egresados)} />
 <KpiCard icon={TrendingDown} label="Bajas" value={fmtPct(data.alumnos.porcentajes.bajas)} />
 </div>
 <SeccionHeader
 número="2"
 título="Distribucion por estado"
 descripción="Conteo absoluto de alumnos agrupados por su estado actual"
 />
 <ChartCard
 id="chart-alumnos-por-estado"
 title="Alumnos por estado"
 description="Cantidad de alumnos en cada estado: activos, egresados, bajas e inactivos"
 nota={`n = ${data.alumnos.total} alumnos totales`}
 >
 {data.alumnos.porEstado.length > 0 ? (
 <BarChart data={data.alumnos.porEstado.map((e) => ({ ...e, name: labelEstado(e.estado) }))}>
 <CartesianGrid strokeDasharray="3 3" />
 <XAxis dataKey="name" tick={{ fontSize: 11 }} />
 <YAxis />
 <Tooltip />
 <Bar dataKey="cantidad" radius={[4, 4, 0, 0]}>
 {data.alumnos.porEstado.map((e, i) => (
 <Cell key={i} fill={ESTADOS_ALUMNO[e.estado] || COLORES[i % COLORES.length]} />
 ))}
 </Bar>
 </BarChart>
 ) : <EmptyChart />}
 </ChartCard>
 <SeccionHeader
 número="3"
 título="Distribucion por título"
 descripción="Alumnos activamente inscriptos en cada carrera"
 />
 <ChartCard
 id="chart-alumnos-por-título"
 title="Alumnos por título"
 description="Cantidad de alumnos con inscripcion activa en cada carrera de la institución"
 nota={`Se consideran solo inscripciones en estado ACTIVA`}
 height={Math.max(300, data.alumnos.porTitulo.length * 40)}
 >
 {data.alumnos.porTitulo.length > 0 ? (
 <BarChart data={data.alumnos.porTitulo} layout="vertical" margin={{ left: 160 }}>
 <CartesianGrid strokeDasharray="3 3" />
 <XAxis type="number" />
 <YAxis type="category" dataKey="título" tick={{ fontSize: 10 }} width={150} />
 <Tooltip />
 <Bar dataKey="cantidad" radius={[0, 4, 4, 0]}>
 {data.alumnos.porTitulo.map((e, i) => (
 <Cell key={i} fill={COLORES[i % COLORES.length]} />
 ))}
 </Bar>
 </BarChart>
 ) : <EmptyChart />}
 </ChartCard>
 </div>
 )}
 {/* ==================== CURSADAS ==================== */}
 {tab === 'cursadas' && data.cursadas && (
 <div className="space-y-6">
 <SeccionHeader
 número="1"
 título="Indicadores de cursadas"
 descripción="Totales y tasas de aprobación del periodo"
 />
 <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 items-stretch">
 <KpiCard icon={BookOpen} label="Total" value={fmtNum(data.cursadas.total)} />
 <KpiCard icon={TrendingUp} label="Aprobación" value={fmtPct(data.cursadas.porcentajeAprobación)} />
 <KpiCard icon={TrendingDown} label="Desaprob." value={fmtPct(data.cursadas.porcentajeDesaprobación)} />
 <KpiCard icon={Award} label="Promedio" value={data.cursadas.promedioNotas} sub="Escala 0-10" />
 </div>
 <SeccionHeader
 número="2"
 título="Composicion por estado"
 descripción="Proporcion de cursadas en cada estado academico"
 />
 <ChartCard
 id="chart-cursadas-estado"
 title="Cursadas por estado"
 description="Aprobadas, regulares, en curso, libres y desaprobadas"
 nota={`Total: ${data.cursadas.total} cursadas registradas en el periodo`}
 >
 {data.cursadas.porEstado.length > 0 ? (
 <PieChart>
 <Pie
 data={data.cursadas.porEstado.map((e) => ({ ...e, name: labelEstado(e.estado) }))}
 dataKey="cantidad"
 nameKey="name"
 cx="50%"
 cy="50%"
 outerRadius={90}
 label={(e) => `${e.name}: ${e.cantidad}`}
 >
 {data.cursadas.porEstado.map((e, i) => (
 <Cell key={i} fill={ESTADOS_CURSADA[e.estado] || COLORES[i % COLORES.length]} />
 ))}
 </Pie>
 <Tooltip />
 <Legend verticalAlign="bottom" height={36} />
 </PieChart>
 ) : <EmptyChart />}
 </ChartCard>
 <SeccionHeader
 número="3"
 título="Ranking de materias por volumen"
 descripción="Las materias con mayor y menor cantidad de cursadas registradas en el periodo. Este indicador muestra donde se concentra la actividad academica."
 />
 <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-stretch">
 <ChartCard
 id="chart-top-materias"
 title="Top 10 materias MAS cursadas"
 description="Materias con mayor cantidad de cursadas registradas"
 nota={`Representa el 100% de las materias activas en el periodo`}
 height={Math.max(300, data.cursadas.porMateria.slice(0, 10).length * 35)}
 >
 {data.cursadas.porMateria.length > 0 ? (
 <BarChart data={data.cursadas.porMateria.slice(0, 10)} layout="vertical" margin={{ left: 160 }}>
 <CartesianGrid strokeDasharray="3 3" />
 <XAxis type="number" />
 <YAxis type="category" dataKey="materia" tick={{ fontSize: 10 }} width={150} />
 <Tooltip />
 <Bar dataKey="total" radius={[0, 4, 4, 0]}>
 {data.cursadas.porMateria.slice(0, 10).map((e, i) => (
 <Cell key={i} fill={COLORES[i % COLORES.length]} />
 ))}
 </Bar>
 </BarChart>
 ) : <EmptyChart />}
 </ChartCard>
 <ChartCard
 id="chart-bottom-materias"
 title="Top 10 materias MENOS cursadas"
 description="Materias con menor cantidad de cursadas registradas"
 nota={`Materias con baja demanda o con baja inscripcion en el periodo`}
 height={Math.max(300, data.cursadas.porMateria.slice(-10).length * 35)}
 >
 {data.cursadas.porMateria.length > 0 ? (
 <BarChart
 data={[...data.cursadas.porMateria].sort((a, b) => a.total - b.total).slice(0, 10)}
 layout="vertical"
 margin={{ left: 160 }}
 >
 <CartesianGrid strokeDasharray="3 3" />
 <XAxis type="number" />
 <YAxis type="category" dataKey="materia" tick={{ fontSize: 10 }} width={150} />
 <Tooltip />
 <Bar dataKey="total" radius={[0, 4, 4, 0]}>
 {[...data.cursadas.porMateria].sort((a, b) => a.total - b.total).slice(0, 10).map((e, i) => (
 <Cell key={i} fill={COLORES[i % COLORES.length]} />
 ))}
 </Bar>
 </BarChart>
 ) : <EmptyChart />}
 </ChartCard>
 </div>
 <SeccionHeader
 número="4"
 título="Indicadores de rendimiento academico"
 descripción="Materias con mayor cantidad de aprobaciónes y desaprobaciónes. Estos indicadores son clave para detectar asignaturas que requieren refuerzo pedagogico."
 />
 <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-stretch">
 <ChartCard
 id="chart-top-aprobadas"
 title="Top 10 materias MAS aprobadas"
 description="Materias con mayor cantidad absoluta de cursadas aprobadas"
 nota={`Indicador positivo: materias con buen rendimiento academico`}
 height={Math.max(300, data.cursadas.porMateria.slice(0, 10).length * 35)}
 >
 {data.cursadas.porMateria.length > 0 ? (
 <BarChart
 data={[...data.cursadas.porMateria].sort((a, b) => b.aprobadas - a.aprobadas).slice(0, 10)}
 layout="vertical"
 margin={{ left: 160 }}
 >
 <CartesianGrid strokeDasharray="3 3" />
 <XAxis type="number" />
 <YAxis type="category" dataKey="materia" tick={{ fontSize: 10 }} width={150} />
 <Tooltip />
 <Bar dataKey="aprobadas" radius={[0, 4, 4, 0]} fill="#10b981" />
 </BarChart>
 ) : <EmptyChart />}
 </ChartCard>
 <ChartCard
 id="chart-top-desaprobadas"
 title="Top 10 materias MAS desaprobadas"
 description="Materias con mayor cantidad de cursadas desaprobadas"
 nota={`ALERTA: estas materias requieren analisis pedagogico y refuerzo`}
 height={Math.max(300, data.cursadas.porMateria.slice(0, 10).length * 35)}
 >
 {data.cursadas.porMateria.length > 0 ? (
 <BarChart
 data={[...data.cursadas.porMateria].sort((a, b) => b.desaprobadas - a.desaprobadas).slice(0, 10)}
 layout="vertical"
 margin={{ left: 160 }}
 >
 <CartesianGrid strokeDasharray="3 3" />
 <XAxis type="number" />
 <YAxis type="category" dataKey="materia" tick={{ fontSize: 10 }} width={150} />
 <Tooltip />
 <Bar dataKey="desaprobadas" radius={[0, 4, 4, 0]} fill="#ef4444" />
 </BarChart>
 ) : <EmptyChart />}
 </ChartCard>
 </div>
 <SeccionHeader
 número="5"
 título="Alertas pedagogicas: materias con mayor tasa de desaprobación"
 descripción="Ranking de materias ordenadas por porcentaje de desaprobación sobre el total de cursadas. Este indicador permite identificar asignaturas que requieren intervencion pedagogica inmediata."
 />
 <ChartCard
 id="chart-tasa-desaprobación"
 title="Top 10 materias con MAYOR tasa de desaprobación"
 description="Porcentaje de desaprobación: (desaprobadas / total cursadas) x 100"
 nota={`ALERTA INSTITUCIONAL: Las materias con mayor porcentaje de desaprobación son candidatas prioritarias para revision pedagogica, refuerzo tutorial o rediseno curricular.`}
 height={Math.max(300, data.cursadas.porMateria.slice(0, 10).length * 40)}
 >
 {data.cursadas.porMateria.length > 0 ? (
 <BarChart
 data={[...data.cursadas.porMateria]
 .filter((m) => m.total > 0)
 .map((m) => ({ ...m, tasa: m.total > 0 ? Math.round((m.desaprobadas / m.total) * 100) : 0 }))
 .sort((a, b) => b.tasa - a.tasa)
 .slice(0, 10)}
 layout="vertical"
 margin={{ left: 160 }}
 >
 <CartesianGrid strokeDasharray="3 3" />
 <XAxis type="number" domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
 <YAxis type="category" dataKey="materia" tick={{ fontSize: 10 }} width={150} />
 <Tooltip formatter={(v) => `${v}%`} />
 <Bar dataKey="tasa" radius={[0, 4, 4, 0]}>
 {[...data.cursadas.porMateria]
 .filter((m) => m.total > 0)
 .map((m) => ({ ...m, tasa: m.total > 0 ? Math.round((m.desaprobadas / m.total) * 100) : 0 }))
 .sort((a, b) => b.tasa - a.tasa)
 .slice(0, 10)
 .map((e, i) => (
 <Cell key={i} fill={e.tasa > 50 ? '#dc2626' : e.tasa > 25 ? '#f59e0b' : '#10b981'} />
 ))}
 </Bar>
 </BarChart>
 ) : <EmptyChart />}
 </ChartCard>
 <Card className="p-5 bg-blue-500/5 border-blue-500/30">
 <h3 className="text-sm font-semibold text-foreground mb-3">Guia de interpretacion de indicadores</h3>
 <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-muted-foreground">
 <div className="space-y-1">
 <p className="font-medium text-green-600">Barra verde (tasa &lt; 25%)</p>
 <p>Rendimiento saludable. La materia tiene una tasa baja de desaprobación.</p>
 </div>
 <div className="space-y-1">
 <p className="font-medium text-yellow-600">Barra amarilla (tasa 25-50%)</p>
 <p>Requiere atencion. Aumentar el seguimiento pedagogico y las tutorias.</p>
 </div>
 <div className="space-y-1">
 <p className="font-medium text-red-600">Barra roja (tasa &gt; 50%)</p>
 <p>ALERTA CRITICA. Intervencion pedagogica urgente. Evaluar causas: contenido, metodologia, evaluacion o prerrequisitos.</p>
 </div>
 </div>
 </Card>
 </div>
 )}
 {/* ==================== ASISTENCIAS ==================== */}
 {tab === 'asistencias' && data.asistencias && (
 <div className="space-y-6">
 <SeccionHeader
 número="1"
 título="Indicadores clave de asistencia"
 descripción="Resumen ejecutivo de asistencias, inasistencias y justificaciones del periodo analizado"
 />
 <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
 <KpiCard icon={CalendarCheck} label="Total registros" value={fmtNum(data.asistencias.total)} sub="Clases registradas" />
 <KpiCard icon={TrendingUp} label="Asistencias" value={fmtNum(data.asistencias.presentes)} sub={fmtPct(data.asistencias.total > 0 ? Math.round((data.asistencias.presentes / data.asistencias.total) * 100) : 0) + " del total"} />
 <KpiCard icon={TrendingDown} label="Inasistencias" value={fmtNum(data.asistencias.ausentes)} sub={fmtPct(data.asistencias.total > 0 ? Math.round((data.asistencias.ausentes / data.asistencias.total) * 100) : 0) + " del total"} />
 <KpiCard icon={FileCheck} label="Justificadas" value={fmtNum(data.asistencias.justificados)} sub={fmtPct(data.asistencias.total > 0 ? Math.round((data.asistencias.justificados / data.asistencias.total) * 100) : 0) + " del total"} />
 <KpiCard icon={Award} label="Asist. efectiva" value={fmtPct(data.asistencias.porcentajeAsistencia)} sub="Presentes + justificadas" />
 </div>
 <SeccionHeader
 número="2"
 título="Tasa de asistencia institucional"
 descripción="La tasa de asistencia efectiva considera tanto las asistencias presentes como las ausencias justificadas (con certificado aprobado). Es el indicador oficial de regularidad."
 />
 <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
 <Card className="p-5">
 <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Tasa de asistencia efectiva</p>
 <p className="text-4xl font-bold text-green-600 mt-2 tabular-nums">{fmtPct(data.asistencias.porcentajeAsistencia)}</p>
 <p className="text-xs text-muted-foreground mt-2">
 Presentes ({data.asistencias.presentes}) + Justificadas ({data.asistencias.justificados}) sobre {data.asistencias.total} registros
 </p>
 </Card>
 <Card className="p-5">
 <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Tasa de inasistencia</p>
 <p className="text-4xl font-bold text-red-600 mt-2 tabular-nums">{fmtPct(data.asistencias.porcentajeInasistencia)}</p>
 <p className="text-xs text-muted-foreground mt-2">
 Ausencias sin justificar ({data.asistencias.ausentes}) sobre {data.asistencias.total} registros
 </p>
 </Card>
 <Card className="p-5">
 <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Tasa de justificacion</p>
 <p className="text-4xl font-bold text-yellow-600 mt-2 tabular-nums">
 {fmtPct(data.asistencias.total > 0 ? Math.round((data.asistencias.justificados / data.asistencias.total) * 100) : 0)}
 </p>
 <p className="text-xs text-muted-foreground mt-2">
 Ausencias justificadas ({data.asistencias.justificados}) sobre {data.asistencias.total} registros
 </p>
 </Card>
 </div>
 <SeccionHeader
 número="3"
 título="Distribucion detallada de registros"
 descripción="Análisis de composicion: cada registro de clase cae en una de estas tres categorias"
 />
 <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-stretch">
 <ChartCard
 id="chart-asistencias-estado"
 title="Composicion porcentual de asistencias"
 description="Cada porcion representa la proporcion de clases en ese estado sobre el total de registros del periodo"
 nota={`n = ${data.asistencias.total} registros analizados. La suma de las tres categorias es el 100% del total.`}
 >
 {data.asistencias.porEstado.length > 0 ? (
 <PieChart>
 <Pie
 data={data.asistencias.porEstado.map((e) => ({ ...e, name: labelEstado(e.estado) }))}
 dataKey="cantidad"
 nameKey="name"
 cx="50%"
 cy="50%"
 outerRadius={90}
 label={(e) => `${e.name}: ${e.cantidad}`}
 >
 {data.asistencias.porEstado.map((e, i) => (
 <Cell key={i} fill={COLORES[i % COLORES.length]} />
 ))}
 </Pie>
 <Tooltip />
 <Legend verticalAlign="bottom" height={36} />
 </PieChart>
 ) : <EmptyChart />}
 </ChartCard>
 <ChartCard
 id="chart-asistencias-comparativa"
 title="Comparativa absoluta por categoria"
 description="Cantidad exacta de registros en cada estado: presente, ausente y justificado"
 nota={`Presentes: ${fmtNum(data.asistencias.presentes)} | Ausentes: ${fmtNum(data.asistencias.ausentes)} | Justificadas: ${fmtNum(data.asistencias.justificados)}`}
 >
 <BarChart data={[
 { name: 'Presentes', cantidad: data.asistencias.presentes },
 { name: 'Ausentes', cantidad: data.asistencias.ausentes },
 { name: 'Justificados', cantidad: data.asistencias.justificados },
 ]}>
 <CartesianGrid strokeDasharray="3 3" />
 <XAxis dataKey="name" tick={{ fontSize: 11 }} />
 <YAxis />
 <Tooltip />
 <Bar dataKey="cantidad" radius={[4, 4, 0, 0]}>
 <Cell fill="#10b981" />
 <Cell fill="#ef4444" />
 <Cell fill="#f59e0b" />
 </Bar>
 </BarChart>
 </ChartCard>
 </div>
 </div>
 )}
 {/* ==================== MESAS ==================== */}
 {tab === 'mesas' && data.mesas && (
 <div className="space-y-6">
 <SeccionHeader
 número="1"
 título="Indicadores de mesas de examen"
 descripción="Totales de mesas y presentismo en el periodo"
 />
 <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 items-stretch">
 <KpiCard icon={CalendarDays} label="Total mesas" value={fmtNum(data.mesas.total)} />
 <KpiCard icon={Users} label="Inscripciones" value={fmtNum(data.mesas.inscripciones.total)} />
 <KpiCard icon={CalendarCheck} label="Presentismo" value={fmtPct(data.mesas.inscripciones.porcentajePresentismo)} />
 <KpiCard icon={TrendingDown} label="Ausentes" value={fmtNum(data.mesas.inscripciones.ausentes)} />
 </div>
 <SeccionHeader
 número="2"
 título="Distribucion y composicion"
 descripción="Mesas por tipo y estado de inscripciones"
 />
 <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-stretch">
 <ChartCard
 id="chart-mesas-tipo"
 title="Mesas por tipo"
 description="Examen final vs ingreso nivelatorio"
 nota={`Total: ${data.mesas.total} mesas programadas`}
 >
 {data.mesas.porTipo.length > 0 ? (
 <PieChart>
 <Pie
 data={data.mesas.porTipo.map((e) => ({ ...e, name: labelEstado(e.tipo) }))}
 dataKey="cantidad"
 nameKey="name"
 cx="50%"
 cy="50%"
 outerRadius={90}
 label={(e) => `${e.name}: ${e.cantidad}`}
 >
 {data.mesas.porTipo.map((e, i) => (
 <Cell key={i} fill={COLORES[i % COLORES.length]} />
 ))}
 </Pie>
 <Tooltip />
 <Legend verticalAlign="bottom" height={36} />
 </PieChart>
 ) : <EmptyChart />}
 </ChartCard>
 <ChartCard
 id="chart-inscripciones-estado"
 title="Inscripciones a mesas por estado"
 description="Estado actual de cada inscripcion a mesas de examen"
 nota={`n = ${data.mesas.inscripciones.total} inscripciones`}
 >
 {data.mesas.inscripciones.porEstado.length > 0 ? (
 <BarChart data={data.mesas.inscripciones.porEstado.map((e) => ({ ...e, name: labelEstado(e.estado) }))}>
 <CartesianGrid strokeDasharray="3 3" />
 <XAxis dataKey="name" tick={{ fontSize: 11 }} />
 <YAxis />
 <Tooltip />
 <Bar dataKey="cantidad" radius={[4, 4, 0, 0]}>
 {data.mesas.inscripciones.porEstado.map((e, i) => (
 <Cell key={i} fill={COLORES[i % COLORES.length]} />
 ))}
 </Bar>
 </BarChart>
 ) : <EmptyChart />}
 </ChartCard>
 </div>
 </div>
 )}
 {/* ==================== CERTIFICADOS ==================== */}
 {tab === 'certificados' && data.certificados && (
 <div className="space-y-6">
 <SeccionHeader
 número="1"
 título="Indicadores de certificados"
 descripción="Totales de certificados emitidos y presentados"
 />
 <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 items-stretch">
 <KpiCard icon={Award} label="Emitidos" value={fmtNum(data.certificados.total)} />
 <KpiCard icon={FileCheck} label="Presentados" value={fmtNum(data.certificados.presentados.total)} />
 <KpiCard icon={FileText} label="Tipos distintos" value={data.certificados.porTipo.length} />
 <KpiCard icon={FileCheck} label="Estados" value={data.certificados.porEstado.length} />
 </div>
 <SeccionHeader
 número="2"
 título="Distribucion de certificados"
 descripción="Certificados por tipo de emision y estado de presentacion"
 />
 <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-stretch">
 <ChartCard
 id="chart-certificados-tipo"
 title="Certificados emitidos por tipo"
 description="Clasificacion de certificados segun su proposito"
 nota={`Total: ${data.certificados.total} certificados emitidos`}
 >
 {data.certificados.porTipo.length > 0 ? (
 <BarChart data={data.certificados.porTipo.map((t) => ({ ...t, name: labelEstado(t.tipo) }))}>
 <CartesianGrid strokeDasharray="3 3" />
 <XAxis dataKey="name" tick={{ fontSize: 10 }} />
 <YAxis />
 <Tooltip />
 <Bar dataKey="cantidad" radius={[4, 4, 0, 0]}>
 {data.certificados.porTipo.map((e, i) => (
 <Cell key={i} fill={COLORES[i % COLORES.length]} />
 ))}
 </Bar>
 </BarChart>
 ) : <EmptyChart />}
 </ChartCard>
 <ChartCard
 id="chart-certificados-presentados"
 title="Certificados presentados por estado"
 description="Estado de resolución de certificados presentados"
 nota={`Total presentados: ${data.certificados.presentados.total}`}
 >
 {data.certificados.presentados.porEstado.length > 0 ? (
 <PieChart>
 <Pie
 data={data.certificados.presentados.porEstado.map((e) => ({ ...e, name: labelEstado(e.estado) }))}
 dataKey="cantidad"
 nameKey="name"
 cx="50%"
 cy="50%"
 outerRadius={90}
 label={(e) => `${e.name}: ${e.cantidad}`}
 >
 {data.certificados.presentados.porEstado.map((e, i) => (
 <Cell key={i} fill={COLORES[i % COLORES.length]} />
 ))}
 </Pie>
 <Tooltip />
 <Legend verticalAlign="bottom" height={36} />
 </PieChart>
 ) : <EmptyChart />}
 </ChartCard>
 </div>
 </div>
 )}
 </>
 )}
 </div>
 );
}