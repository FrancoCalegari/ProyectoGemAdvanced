import { NavLink } from 'react-router-dom';
import { X, LogOut } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import {
 LayoutDashboard, GraduationCap, Users, BookOpen, CalendarCheck, CalendarDays,
 FileText, Settings, Award, FileCheck, FileWarning, UserCog, Archive,
 UserCircle, MessageSquare, Heart, BarChart3
} from 'lucide-react';

const menuAdmin = [
 { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', roles: ['ADMIN', 'SECRETARIA'] },
 { to: '/estadisticas', icon: BarChart3, label: 'Métricas y Reportes', roles: ['ADMIN'] },
 { to: '/titulos', icon: GraduationCap, label: 'Carreras', roles: ['ADMIN', 'SECRETARIA'] },
 { to: '/alumnos', icon: Users, label: 'Alumnos', roles: ['ADMIN', 'SECRETARIA'] },
 { to: '/historial-alumnos', icon: Archive, label: 'Legajos de Alumnos', roles: ['ADMIN', 'SECRETARIA'] },
 { to: '/cursadas', icon: BookOpen, label: 'Materias en Curso', roles: ['ADMIN', 'SECRETARIA'] },
 { to: '/asistencia', icon: CalendarCheck, label: 'Registro de Asistencia', roles: ['ADMIN', 'SECRETARIA'] },
 { to: '/mesas-examen', icon: CalendarDays, label: 'Examenes Finales', roles: ['ADMIN', 'SECRETARIA'] },
 { to: '/certificados-presentados', icon: FileCheck, label: 'Documentación Presentada', roles: ['ADMIN', 'SECRETARIA'] },
 { to: '/certificados', icon: Award, label: 'constancias Emitidas', roles: ['ADMIN', 'SECRETARIA'] },
 { to: '/profesores', icon: UserCog, label: 'Cuerpo Docente', roles: ['ADMIN', 'SECRETARIA'] },
 { to: '/usuarios', icon: Settings, label: 'Cuentas de Acceso', roles: ['ADMIN'] },
];

const menuPersonal = [
 { to: '/mi-perfil', icon: UserCircle, label: 'Mi Cuenta', roles: ['ADMIN', 'SECRETARIA', 'ALUMNO', 'PROFESOR'] },
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
};

export function Sidebar({ onClose }) {
 const { usuario, logout } = useAuth();
 const rol = usuario?.rol;

 const itemsAdmin = menuAdmin.filter((i) => i.roles.includes(rol));
 const itemsPersonal = menuPersonal.filter((i) => i.roles.includes(rol));
 const itemsAlumno = menuAlumno.filter((i) => i.roles.includes(rol));

 const linkClass = ({ isActive }) =>
    `group relative flex items-center gap-3 pl-4 pr-3 py-2.5 rounded-lg text-sm transition-all duration-150 ${
      isActive
        ? 'bg-card text-foreground font-semibold shadow-[0_1px_2px_rgba(15,23,42,0.06),0_1px_4px_rgba(15,23,42,0.04)]'
        : 'text-muted-foreground hover:bg-card/60 hover:text-foreground font-medium'
    }`;

 const renderItem = (item) => (
    <NavLink key={item.to} to={item.to} className={linkClass} onClick={onClose}>
      {({ isActive }) => (
        <>
          {isActive && (
            <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 bg-primary rounded-r-full" />
          )}
          <item.icon className={`w-[18px] h-[18px] shrink-0 ${isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'}`} />
          <span className="truncate">{item.label}</span>
        </>
      )}
    </NavLink>
  );

 return (
 <aside className="w-64 h-full bg-sidebar border-r border-border flex flex-col shadow-[2px_0_8px_rgba(15,23,42,0.04)]">
 {/* Header */}
 <div className="p-6 border-b border-border flex items-center justify-between">
 <div className="flex items-center gap-3">
 <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-[0_2px_8px_rgba(37,99,235,0.3)]">
 <span className="text-lg">⚡</span>
 </div>
 <div>
 <h2 className="font-bold text-foreground tracking-tight">Plataforma</h2>
 <p className="text-xs text-muted-foreground font-medium">Gestión Académica</p>
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
 <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
 {itemsAdmin.length > 0 && (
 <>
 <p className="text-[10px] text-muted-foreground uppercase tracking-[0.15em] font-bold px-3 pt-5 pb-2 first:pt-2 tracking-wider">Gestión</p>
 {itemsAdmin.map(renderItem)}
 </>
 )}

 {itemsPersonal.length > 0 && (
 <>
 <p className="text-xs text-muted-foreground uppercase tracking-widest font-semibold px-3 pt-5 pb-2">Personal</p>
 {itemsPersonal.map(renderItem)}
 </>
 )}

 {itemsAlumno.length > 0 && (
 <>
 <p className="text-xs text-muted-foreground uppercase tracking-widest font-semibold px-3 pt-5 pb-2">Mi espacio</p>
 {itemsAlumno.map(renderItem)}
 </>
 )}
 </nav>

 {/* User */}
 <div className="p-3 border-t border-border">
 <div className="flex items-center gap-3 p-2.5 rounded-lg bg-card border border-border mb-3 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
 <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center text-xs font-bold text-foreground shrink-0">
 {usuario?.nombre?.[0]}{usuario?.apellido?.[0]}
 </div>
 <div className="min-w-0 flex-1">
 <p className="text-sm font-medium text-foreground truncate">
 {usuario?.nombre} {usuario?.apellido}
 </p>
 <p className="text-xs text-muted-foreground truncate">{ROL_LABEL[rol] || rol}</p>
 </div>
 </div>
 <button
 onClick={logout}
 className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
 >
 <LogOut className="w-4 h-4" />
 Cerrar sesion
 </button>
 </div>
 
</aside>
 );
}