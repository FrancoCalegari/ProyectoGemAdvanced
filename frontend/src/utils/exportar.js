import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import html2canvas from 'html2canvas';
// ============================================================
// HELPERS
// ============================================================
function fechaHoy() {
 return new Date().toLocaleString('es-AR', {
 day: '2-digit', month: '2-digit', year: 'numeric',
 hour: '2-digit', minute: '2-digit',
 });
}
function nombreArchivo(base) {
 const f = new Date();
 const yyyy = f.getFullYear();
 const mm = String(f.getMonth() + 1).padStart(2, '0');
 const dd = String(f.getDate()).padStart(2, '0');
 return `${base}_${yyyy}-${mm}-${dd}`;
}
// ============================================================
// CSV
// ============================================================
export function exportarCSV(nombre, filas) {
 if (!filas || filas.length === 0) {
 alert('No hay datos para exportar');
 return;
 }
 // Detectar columnas
 const columnas = Object.keys(filas[0]);
 // Escapar valor
 const escapar = (valor) => {
 if (valor === null || valor === undefined) return '';
 const str = String(valor);
 if (str.includes(',') || str.includes('"') || str.includes('\n')) {
 return `"${str.replace(/"/g, '""')}"`;
 }
 return str;
 };
 const lineas = [];
 lineas.push(columnas.map(escapar).join(','));
 for (const fila of filas) {
 lineas.push(columnas.map((c) => escapar(fila[c])).join(','));
 }
 const csv = '\uFEFF' + lineas.join('\n'); // BOM UTF-8 para Excel
 const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
 const url = URL.createObjectURL(blob);
 const a = document.createElement('a');
 a.href = url;
 a.download = `${nombreArchivo(nombre)}.csv`;
 document.body.appendChild(a);
 a.click();
 document.body.removeChild(a);
 URL.revokeObjectURL(url);
}
// ============================================================
// PDF
// ============================================================
export async function exportarPDF(opciones) {
 const {
 titulo = 'Reporte Estadistico',
 subtitulo = '',
 periodo = '',
 secciones = [], // [{ titulo, descripcion, tipo: 'kpis'|'tabla'|'texto', datos, columnas }]
 chartIds = [], // IDs de los contenedores de gráficos (para capturar como imagen)
 nombre = 'reporte',
 } = opciones;
 const doc = new jsPDF('p', 'mm', 'A4');
 const anchoPag = doc.internal.pageSize.getWidth();
 const altoPag = doc.internal.pageSize.getHeight();
 const margin = 15;
 // ============================================================
 // PORTADA
 // ============================================================
 doc.setFillColor(59, 130, 246);
 doc.rect(0, 0, anchoPag, 40, 'F');
 doc.setTextColor(255, 255, 255);
 doc.setFontSize(20);
 doc.setFont('helvetica', 'bold');
 doc.text('PLATAFORMA ACADEMICA', anchoPag / 2, 18, { align: 'center' });
 doc.setFontSize(11);
 doc.setFont('helvetica', 'normal');
 doc.text('Reporte Estadistico Institucional', anchoPag / 2, 28, { align: 'center' });
 doc.setTextColor(0, 0, 0);
 let y = 55;
 doc.setFontSize(16);
 doc.setFont('helvetica', 'bold');
 doc.text(titulo, margin, y);
 y += 10;
 if (subtitulo) {
 doc.setFontSize(11);
 doc.setFont('helvetica', 'italic');
 doc.setTextColor(100, 100, 100);
 doc.text(subtitulo, margin, y);
 y += 6;
 doc.setTextColor(0, 0, 0);
 }
 if (periodo) {
 doc.setFontSize(10);
 doc.setFont('helvetica', 'normal');
 doc.text(`Periodo: ${periodo}`, margin, y);
 y += 6;
 }
 doc.setFontSize(9);
 doc.setTextColor(120, 120, 120);
 doc.text(`Generado: ${fechaHoy()}`, margin, y);
 y += 10;
 // Linea divisoria
 doc.setDrawColor(200, 200, 200);
 doc.line(margin, y, anchoPag - margin, y);
 y += 10;
 // ============================================================
 // SECCIONES
 // ============================================================
 for (let i = 0; i < secciones.length; i++) {
 const sec = secciones[i];
 // Nueva pagina si no hay espacio
 if (y > altoPag - 40) {
 doc.addPage();
 y = 20;
 }
 // Titulo de seccion
 doc.setFontSize(13);
 doc.setFont('helvetica', 'bold');
 doc.setTextColor(30, 30, 30);
 doc.text(sec.titulo || `Seccion ${i + 1}`, margin, y);
 y += 6;
 if (sec.descripcion) {
 doc.setFontSize(9);
 doc.setFont('helvetica', 'italic');
 doc.setTextColor(100, 100, 100);
 const lineasDesc = doc.splitTextToSize(sec.descripcion, anchoPag - margin * 2);
 doc.text(lineasDesc, margin, y);
 y += lineasDesc.length * 4 + 2;
 }
 doc.setTextColor(0, 0, 0);
 // KPIs
 if (sec.tipo === 'kpis' && sec.datos) {
 const items = Object.entries(sec.datos);
 const columnas = 3;
 const anchoItem = (anchoPag - margin * 2) / columnas;
 let fila = 0;
 for (let j = 0; j < items.length; j++) {
 const [key, valor] = items[j];
 const col = j % columnas;
 if (col === 0 && j > 0) { fila++; }
 const x = margin + col * anchoItem;
 const yItem = y + fila * 18;
 doc.setDrawColor(220, 220, 220);
 doc.setFillColor(248, 250, 252);
 doc.roundedRect(x, yItem, anchoItem - 3, 15, 2, 2, 'FD');
 doc.setFontSize(8);
 doc.setFont('helvetica', 'normal');
 doc.setTextColor(100, 100, 100);
 doc.text(key.toUpperCase(), x + 3, yItem + 5);
 doc.setFontSize(14);
 doc.setFont('helvetica', 'bold');
 doc.setTextColor(30, 30, 30);
 doc.text(String(valor), x + 3, yItem + 12);
 }
 y += (fila + 1) * 18 + 8;
 }
 // Tabla
 if (sec.tipo === 'tabla' && sec.datos && sec.datos.length > 0) {
 const columnas = Object.keys(sec.datos[0]);
 autoTable(doc, {
 startY: y,
 head: [columnas.map((c) => c.toUpperCase())],
 body: sec.datos.map((fila) => columnas.map((c) => {
 const v = fila[c];
 return v === null || v === undefined ? '-' : String(v);
 })),
 margin: { left: margin, right: margin },
 styles: { fontSize: 8, cellPadding: 2 },
 headStyles: { fillColor: [59, 130, 246], textColor: 255, fontStyle: 'bold' },
 alternateRowStyles: { fillColor: [248, 250, 252] },
 theme: 'striped',
 });
 y = doc.lastAutoTable.finalY + 8;
 }
 // Texto
 if (sec.tipo === 'texto' && sec.contenido) {
 doc.setFontSize(10);
 doc.setFont('helvetica', 'normal');
 const lineas = doc.splitTextToSize(sec.contenido, anchoPag - margin * 2);
 doc.text(lineas, margin, y);
 y += lineas.length * 5 + 5;
 }
 }
 // ============================================================
 // GRAFICOS (capturas)
 // ============================================================
 if (chartIds.length > 0) {
 for (const id of chartIds) {
 const el = document.getElementById(id);
 if (!el) continue;
 doc.addPage();
 y = 20;
 // Titulo del grafico
 doc.setFontSize(13);
 doc.setFont('helvetica', 'bold');
 doc.setTextColor(30, 30, 30);
 doc.text('Grafico', margin, y);
 y += 8;
 try {
 const canvas = await html2canvas(el, { scale: 2, backgroundColor: '#ffffff' });
 const imgData = canvas.toDataURL('image/png');
 const imgAncho = anchoPag - margin * 2;
 const imgAlto = (canvas.height * imgAncho) / canvas.width;
 if (y + imgAlto > altoPag - 20) {
 const escala = (altoPag - y - 20) / imgAlto;
 doc.addImage(imgData, 'PNG', margin, y, imgAncho * escala, imgAlto * escala);
 } else {
 doc.addImage(imgData, 'PNG', margin, y, imgAncho, imgAlto);
 }
 } catch (err) {
 console.error('Error capturando grafico', id, err);
 doc.setFontSize(10);
 doc.text('(No se pudo capturar el grafico)', margin, y);
 }
 }
 }
 // ============================================================
 // PIE DE PAGINA
 // ============================================================
 const totalPag = doc.getNumberOfPages();
 for (let p = 1; p <= totalPag; p++) {
 doc.setPage(p);
 doc.setFontSize(8);
 doc.setTextColor(120, 120, 120);
 doc.text(
 `Plataforma Academica - Pagina ${p} de ${totalPag}`,
 anchoPag / 2,
 altoPag - 8,
 { align: 'center' }
 );
 }
 doc.save(`${nombreArchivo(nombre)}.pdf`);
}
// ============================================================
// Helper: formatear periodo
// ============================================================
export function formatearPeriodo(desde, hasta) {
 if (!desde && !hasta) return 'Todos los registros (sin filtro)';
 const f = (d) => new Date(d).toLocaleDateString('es-AR');
 if (desde && hasta) return `${f(desde)} al ${f(hasta)}`;
 if (desde) return `Desde ${f(desde)}`;
 return `Hasta ${f(hasta)}`;
}