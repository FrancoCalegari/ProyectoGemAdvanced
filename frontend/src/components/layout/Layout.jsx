import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Menu } from 'lucide-react';
import { Sidebar } from './Sidebar';

export function Layout() {
 const [sidebarAbierto, setSidebarAbierto] = useState(false);

 const ahora = new Date();
 const fechaStr = ahora.toLocaleDateString('es-AR', {
 weekday: 'short',
 day: '2-digit',
 month: 'short',
 year: 'numeric',
 });
 const horaStr = ahora.toLocaleTimeString('es-AR', {
 hour: '2-digit',
 minute: '2-digit',
 });

 return (
 <div className="min-h-screen flex flex-col">
 {/* Status bar */}
 <div className="border-b border-border bg-background px-4 sm:px-6 py-2 flex items-center justify-between text-xs shrink-0">
 <div className="flex items-center gap-3">
 <div className="flex items-center gap-2">
 <span className="w-2 h-2 rounded-full bg-emerald-400 dot-pulse"></span>
 <span className="text-muted-foreground hidden sm:inline">API conectada</span>
 </div>
 <span className="text-border hidden sm:inline">|</span>
 <span className="text-muted-foreground hidden md:inline">Plataforma Académica v1.0</span>
 </div>
 <div className="flex items-center gap-3">
 <span className="text-muted-foreground capitalize">{fechaStr}</span>
 <span className="text-muted-foreground">·</span>
 <span className="text-muted-foreground">{horaStr}</span>
 </div>
 </div>

 {/* Main */}
 <div className="flex flex-1 overflow-hidden">
 {/* Sidebar desktop */}
 <div className="hidden md:flex md:w-64 md:shrink-0">
 <Sidebar />
 </div>

 {/* Sidebar mobile overlay */}
 {sidebarAbierto && (
 <div className="fixed inset-0 z-40 md:hidden">
 <div
 className="absolute inset-0 bg-background/70 "
 onClick={() => setSidebarAbierto(false)}
 />
 <div className="absolute left-0 top-0 bottom-0 w-64">
 <Sidebar onClose={() => setSidebarAbierto(false)} />
 </div>
 </div>
 )}

 {/* Content */}
 <div className="flex-1 flex flex-col overflow-hidden">
 {/* Mobile topbar */}
 <div className="md:hidden border-b border-border bg-background px-4 py-3 flex items-center gap-3 shrink-0">
 <button
 onClick={() => setSidebarAbierto(true)}
 className="p-2 rounded-lg hover:bg-accent text-foreground"
 aria-label="Abrir menu"
 >
 <Menu className="w-5 h-5" />
 </button>
 <span className="font-semibold text-foreground">Plataforma</span>
 </div>

 {/* Page */}
 <main className="flex-1 overflow-y-auto">
 <div className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto">
 <Outlet />
 </div>
 </main>
 </div>
 </div>
 </div>
 );
}