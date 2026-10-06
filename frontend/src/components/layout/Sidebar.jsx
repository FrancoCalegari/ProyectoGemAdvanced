import { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { X, LogOut, ChevronDown } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { empleadosService } from '../../services/empleados.service';
import {
 LayoutDashboard, GraduationCap, Users, BookOpen, CalendarCheck, CalendarDays,
 Settings, Award, FileCheck, FileWarning, UserCog, Archive,
 UserCircle, MessageSquare, Heart, BarChart3, Clock, FileHeart, HardHat
} from 'lucide-react';

// =========================================================
// Menú de gestión, agrupado para que no sea una lista larguísima.
// Un grupo con `to` navega al hacer clic en su nombre y se
// despliega con la flecha; un grupo sin `to` sólo despliega.
// =========================================================
const menuGestion = [
 { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', roles: ['ADMIN', 'SECRETARIA'] },
 { to: '/estadisticas', icon: BarChart3, label: 'Métricas y Reportes', roles: ['ADMIN'] },
 {
 id: 'academico',
 label: 'Académico',
 icon: GraduationCap,
 children: [
 { to: '/titulos', icon: GraduationCap, label: 'Carreras y planes', roles: ['ADMIN', 'SECRETARIA', 'BEDEL'] },
 { to: '/cursadas', icon: BookOpen, label: 'Materias en curso', roles: ['ADMIN', 'SECRETARIA'] },
 { to: '/asistencia', icon: CalendarCheck, label: 'Registro de asistencia', roles: ['ADMIN', 'SECRETARIA', 'BEDEL'] },
 { to: '/mesas-examen', icon: CalendarDays, label: 'Exámenes finales', roles: ['ADMIN', 'SECRETARIA', 'BEDEL'] },
 ],
 },
 {
 id: 'alumnos',
 to: '/alumnos',
 icon: Users,
 label: 'Alumnos',
 roles: ['ADMIN', 'SECRETARIA', 'BEDEL'],
 children: [
 { to: '/historial-alumnos', icon: Archive, label: 'Historial y bajas', roles: ['ADMIN', 'SECRETARIA'] },
 { to: '/certificados-presentados', icon: FileCheck, label: 'Documentación presentada', roles: ['ADMIN', 'SECRETARIA', 'BEDEL'] },
 { to: '/certificados', icon: Award, label: 'Constancias emitidas', roles: ['ADMIN', 'SECRETARIA'] },
 ],
 },
 {
 to: '/profesores',
 icon: UserCog,
 label: 'Profesores',
 roles: ['ADMIN', 'SECRETARIA'],
 },
 {
 id: 'personal',
 to: '/personal',
 icon: HardHat,
 label: 'Personal',
 roles: ['ADMIN', 'SECRETARIA'],
 children: [
 { to: '/usuarios', icon: Settings, label: 'Cuentas de acceso', roles: ['ADMIN'] },
 { to: '/empleados', icon: HardHat, label: 'No docentes y horarios', roles: ['ADMIN', 'SECRETARIA'] },
 ],
 },
];

const menuPersonal = [
 { to: '/mi-perfil', icon: UserCircle, label: 'Mi Cuenta', roles: ['ADMIN', 'SECRETARIA', 'ALUMNO', 'PROFESOR', 'BEDEL', 'CELADOR'] },
 { to: '/mis-horarios', icon: Clock, label: 'Mis Horarios', roles: ['CELADOR'] },
 { to: '/mis-justificativos', icon: FileHeart, label: 'Mis Justificativos', roles: ['CELADOR'] },
 { to: '/mis-solicitudes', icon: MessageSquare, label: 'Mis Pedidos', roles: ['ALUMNO', 'PROFESOR'] },
 { to: '/mis-licencias', icon: Heart, label: 'Mis Licencias', roles: ['PROFESOR'] },
 { to: '/mis-cursadas', icon: BookOpen, label: 'Mis Materias', roles: ['PROFESOR'] },
];

const menuAlumno = [
 { to: '/mi-historia', icon: BookOpen, label: 'Mi Historial', roles: ['ALUMNO'] },
 { to: '/mis-certificados', icon: Award, label: 'Mis constancias', roles: ['ALUMNO'] },
 { to: '/mis-mesas', icon: CalendarDays, label: 'Mis Examenes', roles: ['ALUMNO'] },
 { to: '/justificar-ausencia', icon: FileWarning, label: 'Justificar Faltas', roles: ['ALUMNO'] },
];

const ROL_LABEL = {
 ADMIN: 'Administrador',
 SECRETARIA: 'Secretaria',
 ALUMNO: 'Alumno',
 PROFESOR: 'Profesor',
 BEDEL: 'Bedel (no docente)',
 CELADOR: 'Celador (no docente)',
};

export function Sidebar({ onClose }) {
 const { usuario, logout } = useAuth();
 const rol = usuario?.rol;
 const { pathname } = useLocation();
 const [novedades, setNovedades] = useState(0);
 const [abiertos, setAbiertos] = useState(['academico']);

 // El celador ve un aviso cuando gestión le modificó un horario
 useEffect(() => {
 if (rol !== 'CELADOR') return;
 empleadosService.misModificaciones()
 .then((d) => setNovedades(d?.sinVer || 0))
 .catch(() => {});
 }, [rol]);

 // Abre automáticamente el grupo donde está parado el usuario
 useEffect(() => {
 setAbiertos((prev) => {
 const nuevo = new Set(prev);
 for (const g of menuGestion) {
 if (!g.children) continue;
 if (g.to === pathname || g.children.some((c) => c.to === pathname)) nuevo.add(g.id);
 }
 return [...nuevo];
 });
 }, [pathname]);

 // Filtra por rol: los grupos se muestran si tienen al menos un hijo visible
 const visibles = menuGestion
 .map((item) => {
 if (!item.children) return item.roles?.includes(rol) ? item : null;
 const children = item.children.filter((c) => c.roles.includes(rol));
 const puedeNavegar = item.to && item.roles?.includes(rol);
 if (children.length === 0 && !puedeNavegar) return null;
 return { ...item, children };
 })
 .filter(Boolean);

 const itemsPersonal = menuPersonal.filter((i) => i.roles.includes(rol));
 const itemsAlumno = menuAlumno.filter((i) => i.roles.includes(rol));

 const claseLink = ({ isActive }) =>
 `group relative flex items-center gap-2.5 pl-3.5 pr-2.5 py-2 rounded-lg text-[13px] transition-all duration-150 ${
 isActive
 ? 'bg-card text-foreground font-semibold shadow-[0_1px_2px_rgba(15,23,42,0.06),0_1px_4px_rgba(15,23,42,0.04)]'
 : 'text-muted-foreground hover:bg-card/60 hover:text-foreground font-medium'
 }`;

 const claseSubLink = ({ isActive }) =>
 `group relative flex items-center gap-2.5 pl-8 pr-2.5 py-1.5 rounded-lg text-[12.5px] transition-all duration-150 ${
 isActive
 ? 'text-foreground font-semibold bg-card/70'
 : 'text-muted-foreground hover:bg-card/60 hover:text-foreground font-medium'
 }`;

 const badge = (to) =>
 to === '/mis-horarios' && novedades > 0 ? (
 <span className="ml-auto inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-amber-500/20 text-amber-600 text-[11px] font-bold">
 {novedades}
 </span>
 ) : null;

 const renderLink = (item, sub = false) => (
 <NavLink key={item.to} to={item.to} className={sub ? claseSubLink : claseLink} onClick={onClose}>
 {({ isActive }) => (
 <>
 {isActive && !sub && (
 <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-primary rounded-r-full" />
 )}
 <item.icon className={`w-[17px] h-[17px] shrink-0 ${isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'}`} />
 <span className="truncate">{item.label}</span>
 {badge(item.to)}
 </>
 )}
 </NavLink>
 );

 const renderGrupo = (g) => {
 const abierto = abiertos.includes(g.id);
 const activo = g.to === pathname || g.children.some((c) => c.to === pathname);
 const Icon = g.icon;

 const toggle = () =>
 setAbiertos((prev) => (prev.includes(g.id) ? prev.filter((x) => x !== g.id) : [...prev, g.id]));

 return (
 <div key={g.id}>
 <div className="flex items-center gap-0.5">
 {g.to ? (
 <NavLink to={g.to} className={`${claseLink({ isActive: activo })} flex-1`} onClick={onClose}>
 <span
 className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-primary rounded-r-full"
 style={{ opacity: activo ? 1 : 0 }}
 />
 <Icon className={`w-[17px] h-[17px] shrink-0 ${activo ? 'text-primary' : 'text-muted-foreground'}`} />
 <span className="truncate">{g.label}</span>
 </NavLink>
 ) : (
 <button type="button" onClick={toggle} className={`${claseLink({ isActive: activo })} flex-1`}>
 <Icon className={`w-[17px] h-[17px] shrink-0 ${activo ? 'text-primary' : 'text-muted-foreground'}`} />
 <span className="truncate">{g.label}</span>
 </button>
 )}
 {g.children.length > 0 && (
 <button
 type="button"
 onClick={toggle}
 aria-label={`${abierto ? 'Cerrar' : 'Abrir'} ${g.label}`}
 className="p-1.5 rounded-lg text-muted-foreground hover:bg-card/60 hover:text-foreground transition-colors"
 >
 <ChevronDown className={`w-4 h-4 transition-transform ${abierto ? '' : '-rotate-90'}`} />
 </button>
 )}
 </div>
 {abierto && g.children.length > 0 && (
 <div className="mt-0.5 space-y-0.5">{g.children.map((c) => renderLink(c, true))}</div>
 )}
 </div>
 );
 };

 return (
 <aside className="w-64 h-full bg-sidebar border-r border-border flex flex-col shadow-[2px_0_8px_rgba(15,23,42,0.04)]">
 {/* Header */}
 <div className="px-5 py-4 border-b border-border flex items-center justify-between">
 <div className="flex items-center gap-3">
 <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shadow-[0_2px_8px_rgba(37,99,235,0.3)]">
 <span className="text-base">⚡</span>
 </div>
 <div>
 <h2 className="font-bold text-foreground tracking-tight text-[15px]">Plataforma</h2>
 <p className="text-[11px] text-muted-foreground font-medium">Gestión Académica</p>
 </div>
 </div>
 {onClose && (
 <button
 onClick={onClose}
 className="p-1 rounded-lg hover:bg-accent transition-colors md:hidden text-muted-foreground"
 aria-label="Cerrar menu"
 >
 <X className="w-5 h-5" />
 </button>
 )}
 </div>

 {/* Nav */}
 <nav className="flex-1 px-2.5 py-3 space-y-0.5 overflow-y-auto">
 {visibles.length > 0 && (
 <>
 <p className="text-[10px] text-muted-foreground uppercase tracking-[0.15em] font-bold px-3 pt-2 pb-1.5">
 Gestión
 </p>
 {visibles.map((item) => (item.children ? renderGrupo(item) : renderLink(item)))}
 </>
 )}

 {itemsPersonal.length > 0 && (
 <>
 <p className="text-[10px] text-muted-foreground uppercase tracking-[0.15em] font-bold px-3 pt-4 pb-1.5">
 Personal
 </p>
 {itemsPersonal.map((i) => renderLink(i))}
 </>
 )}

 {itemsAlumno.length > 0 && (
 <>
 <p className="text-[10px] text-muted-foreground uppercase tracking-[0.15em] font-bold px-3 pt-4 pb-1.5">
 Mi espacio
 </p>
 {itemsAlumno.map((i) => renderLink(i))}
 </>
 )}
 </nav>

 {/* User */}
 <div className="p-2.5 border-t border-border">
 <div className="flex items-center gap-2.5 p-2 rounded-lg bg-card border border-border mb-2 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
 <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-[11px] font-bold text-foreground shrink-0">
 {usuario?.nombre?.[0]}{usuario?.apellido?.[0]}
 </div>
 <div className="min-w-0 flex-1">
 <p className="text-[13px] font-medium text-foreground truncate">
 {usuario?.nombre} {usuario?.apellido}
 </p>
 <p className="text-[11px] text-muted-foreground truncate">{ROL_LABEL[rol] || rol}</p>
 </div>
 </div>
 <button
 onClick={logout}
 className="flex items-center gap-2 w-full px-3 py-1.5 text-[13px] text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
 >
 <LogOut className="w-4 h-4" />
 Cerrar sesion
 </button>
 </div>
 </aside>
 );
}
