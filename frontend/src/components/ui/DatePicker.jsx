import { useState, useEffect } from 'react';

const MESES = [
 'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

export function DatePicker({ value, onChange, className = '', required = false, label = null }) {
 // Parsear valor inicial (formato YYYY-MM-DD)
 const parsear = (v) => {
 if (!v) return { dia: '', mes: '', anio: '' };
 const partes = String(v).split('-');
 if (partes.length === 3) {
 return { anio: partes[0], mes: partes[1], dia: partes[2] };
 }
 return { dia: '', mes: '', anio: '' };
 };

 const [partes, setPartes] = useState(parsear(value));

 useEffect(() => {
 setPartes(parsear(value));
 }, [value]);

 const emitir = (nuevasPartes) => {
 setPartes(nuevasPartes);
 if (nuevasPartes.dia && nuevasPartes.mes && nuevasPartes.anio) {
 const dia = String(nuevasPartes.dia).padStart(2, '0');
 const mes = String(nuevasPartes.mes).padStart(2, '0');
 onChange(`${nuevasPartes.anio}-${mes}-${dia}`);
 } else if (!nuevasPartes.dia && !nuevasPartes.mes && !nuevasPartes.anio) {
 onChange('');
 }
 };

 // Años desde 1950 hasta el actual + 5
 const anioActual = new Date().getFullYear();
 const anios = [];
 for (let a = anioActual + 5; a >= 1950; a--) anios.push(a);

 // Dias del mes (1-31)
 const dias = [];
 for (let d = 1; d <= 31; d++) dias.push(d);

 const selectClass = 'h-10 px-3 rounded-lg bg-background border border-border text-foreground text-sm focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/30 transition-all';

 return (
 <div className={className}>
 {label && (
 <label className="block text-sm font-medium text-foreground/90 mb-1.5">
 {label} {required && <span className="text-red-400">*</span>}
 </label>
 )}
 <div className="grid grid-cols-3 gap-2">
 <select
 value={partes.dia}
 onChange={(e) => emitir({ ...partes, dia: e.target.value })}
 className={selectClass}
 required={required}
 >
 <option value="">Dia</option>
 {dias.map((d) => (
 <option key={d} value={d}>{d}</option>
 ))}
 </select>

 <select
 value={partes.mes}
 onChange={(e) => emitir({ ...partes, mes: e.target.value })}
 className={selectClass}
 required={required}
 >
 <option value="">Mes</option>
 {MESES.map((m, i) => (
 <option key={i} value={String(i + 1).padStart(2, '0')}>{m}</option>
 ))}
 </select>

 <select
 value={partes.anio}
 onChange={(e) => emitir({ ...partes, anio: e.target.value })}
 className={selectClass}
 required={required}
 >
 <option value="">Año</option>
 {anios.map((a) => (
 <option key={a} value={a}>{a}</option>
 ))}
 </select>
 </div>
 </div>
 );
}