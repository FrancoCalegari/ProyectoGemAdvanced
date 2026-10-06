import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Users, ShieldCheck, HardHat, KeyRound, Plus, Eye, Pencil, AlertCircle, UserCog } from 'lucide-react';
import { toast } from 'sonner';
import { personalService, ROL_PERSONAL_LABEL, ROL_PERSONAL_BADGE } from '../services/personal.service';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../components/ui/Table';

const FILTROS = [
 { value: '', label: 'Todo el personal' },
 { value: 'ADMIN', label: 'Administradores' },
 { value: 'SECRETARIA', label: 'Secretarias' },
 { value: 'BEDEL', label: 'Bedeles' },
 { value: 'CELADOR', label: 'Celadores' },
];

export default function Personal() {
 const navigate = useNavigate();
 const { isAdmin } = useAuth();
 const [datos, setDatos] = useState(null);
 const [cargando, setCargando] = useState(true);
 const [busqueda, setBusqueda] = useState('');
 const [filtroRol, setFiltroRol] = useState('');

 const cargar = async () => {
 try {
 setCargando(true);
 const data = await personalService.listar({ busqueda });
 setDatos(data);
 } catch (error) {
 toast.error(error.response?.data?.message || 'No se pudo cargar el personal');
 } finally {
 setCargando(false);
 }
 };

 useEffect(() => {
  const t = setTimeout(cargar, 250);
  return () => clearTimeout(t);
 }, [busqueda]);

 if (cargando && !datos) {
 return <div className="flex items-center justify-center py-20 text-muted-foreground">Cargando personal...</div>;
 }

 if (!datos) {
 return (
 <Card>
 <div className="p-8 text-center text-muted-foreground">
 <AlertCircle className="w-8 h-8 mx-auto mb-3 opacity-60" />
 <p className="text-sm">No se pudo cargar el personal del establecimiento.</p>
 </div>
 </Card>
 );
 }

 const { personal, resumen } = datos;
 const visibles = filtroRol ? personal.filter((p) => p.rol === filtroRol) : personal;

 const tarjetas = [
 { label: 'Total', valor: resumen.total, icon: Users, color: 'text-primary' },
 { label: 'Administradores', valor: resumen.porRol.ADMIN || 0, icon: ShieldCheck, color: 'text-primary' },
 { label: 'Secretarias', valor: resumen.porRol.SECRETARIA || 0, icon: UserCog, color: 'text-secondary' },
 { label: 'Bedeles', valor: resumen.porRol.BEDEL || 0, icon: HardHat, color: 'text-amber-500' },
 { label: 'Celadores', valor: resumen.porRol.CELADOR || 0, icon: HardHat, color: 'text-emerald-500' },
 ];

 return (
 <div className="space-y-6">
 <div className="flex flex-wrap items-start justify-between gap-3">
 <div>
 <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Personal del establecimiento</h1>
 <p className="text-sm text-muted-foreground font-medium mt-1">
 Administradores, secretarias, bedeles y celadores, con su cuenta de acceso y su ficha.
 </p>
 </div>
 <div className="flex gap-2">
 <Button variant="outline" onClick={() => navigate('/empleados')}>
 <HardHat className="w-4 h-4 mr-2" /> Fichas no docentes
 </Button>
 {isAdmin && (
 <Button onClick={() => navigate('/usuarios')}>
 <Plus className="w-4 h-4 mr-2" /> Nueva cuenta
 </Button>
 )}
 </div>
 </div>

 <div className="grid gap-4 grid-cols-2 lg:grid-cols-5">
 {tarjetas.map((t) => {
 const Icon = t.icon;
 return (
 <Card key={t.label}>
 <div className="p-4">
 <div className="flex items-center gap-2 text-muted-foreground text-[11px] font-medium uppercase tracking-wide">
 <Icon className={`w-4 h-4 ${t.color}`} /> {t.label}
 </div>
 <p className="text-2xl font-bold text-foreground mt-2">{t.valor}</p>
 </div>
 </Card>
 );
 })}
 </div>

 {resumen.sinCuenta > 0 && (
 <div className="rounded-lg border border-amber-500/40 bg-amber-500/10 p-4 flex flex-wrap items-center justify-between gap-3">
 <div className="flex items-center gap-3">
 <KeyRound className="w-5 h-5 text-amber-500 shrink-0" />
 <div>
 <p className="text-sm font-semibold text-foreground">
 {resumen.sinCuenta === 1 ? 'Hay 1 no docente sin cuenta de acceso' : `Hay ${resumen.sinCuenta} no docentes sin cuenta de acceso`}
 </p>
 <p className="text-xs text-muted-foreground">Cargá el usuario desde la ficha del empleado o desde Cuentas de acceso.</p>
 </div>
 </div>
 <Button size="sm" variant="outline" onClick={() => navigate('/empleados')}>Ver fichas</Button>
 </div>
 )}

 <Card>
 <div className="p-4 sm:p-5 border-b border-border flex flex-wrap gap-3 items-center">
 <div className="relative flex-1 min-w-[220px]">
 <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
 <input
 value={busqueda}
 onChange={(e) => setBusqueda(e.target.value)}
 placeholder="Buscar por nombre, apellido, DNI, email, sector o rol"
 className="w-full h-10 pl-10 pr-3 rounded-lg bg-background border border-border text-foreground text-sm focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/30"
 />
 </div>
 <select
 value={filtroRol}
 onChange={(e) => setFiltroRol(e.target.value)}
 className="h-10 px-3 rounded-lg bg-background border border-border text-foreground text-sm focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/30"
 >
 {FILTROS.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
 </select>
 </div>

 {visibles.length === 0 ? (
 <div className="p-8 text-center text-sm text-muted-foreground">No hay personal que coincida con la búsqueda.</div>
 ) : (
 <Table>
 <TableHeader>
 <TableRow>
 <TableHead>Apellido y nombre</TableHead>
 <TableHead>Rol</TableHead>
 <TableHead>Cuenta de acceso</TableHead>
 <TableHead>Sector</TableHead>
 <TableHead>Estado</TableHead>
 <TableHead className="text-right">Acciones</TableHead>
 </TableRow>
 </TableHeader>
 <TableBody>
 {visibles.map((p) => (
 <TableRow key={`${p.tipo}-${p.id}`}>
 <TableCell className="font-medium text-foreground">
 {p.apellido}, {p.nombre}
 {p.dni && <span className="block text-xs text-muted-foreground">DNI {p.dni}</span>}
 </TableCell>
 <TableCell>
 <Badge variant={ROL_PERSONAL_BADGE[p.rol] || 'muted'}>{ROL_PERSONAL_LABEL[p.rol] || p.rol}</Badge>
 </TableCell>
 <TableCell className="text-xs">
 {p.tieneCuenta ? (
 <span className="text-muted-foreground">{p.emailAcceso}</span>
 ) : (
 <span className="text-amber-600 font-medium">Sin cuenta</span>
 )}
 </TableCell>
 <TableCell className="text-muted-foreground">{p.sector || '—'}</TableCell>
 <TableCell>
 <Badge variant={p.activo ? 'success' : 'muted'}>{p.activo ? 'Activo' : 'Inactivo'}</Badge>
 </TableCell>
 <TableCell className="text-right">
 <div className="inline-flex gap-1">
 {p.empleadoId && (
 <Button variant="ghost" size="icon" title="Ver ficha y horarios" onClick={() => navigate(`/empleados/${p.empleadoId}`)}>
 <Eye className="w-4 h-4" />
 </Button>
 )}
 {isAdmin && p.usuarioId && (
 <Button variant="ghost" size="icon" title="Cuentas de acceso" onClick={() => navigate('/usuarios')}>
 <Pencil className="w-4 h-4" />
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

 <p className="text-xs text-muted-foreground">
 Los <span className="font-medium">profesores</span> se gestionan en <button className="text-primary hover:underline" onClick={() => navigate('/profesores')}>Profesores</button> y
 los <span className="font-medium">alumnos</span> en <button className="text-primary hover:underline" onClick={() => navigate('/alumnos')}>Alumnos</button>.
 </p>
 </div>
 );
}
