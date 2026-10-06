import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const COLOR = {
 primary: [30, 64, 175], // #1e40af - Azul institucional (DEFAULT)
 // Alternativas para cambiar:
 // BORGOÑA: [127, 29, 29],
 // VERDE: [6, 95, 70],
 // GRIS: [55, 65, 81],
 // CIAN: [8, 145, 178],
};



const TIPO_CURSADA_LABEL = {
 ANUAL: 'Anual',
 CUATRIMESTRAL_1: '1er Cuatrimestre',
 CUATRIMESTRAL_2: '2do Cuatrimestre',
};

function fechaLarga() {
 return new Date().toLocaleDateString('es-AR', {
 day: 'numeric', month: 'long', year: 'numeric',
 });
}

export function generarPdfPlanEstudios(titulo, anioFiltro = null) {
 const doc = new jsPDF('p', 'mm', 'A4');
 const anchoPag = doc.internal.pageSize.getWidth();
 const altoPag = doc.internal.pageSize.getHeight();
 const margin = 15;
 const anchoUtil = anchoPag - margin * 2;

 // ============================================================
 // HEADER
 // ============================================================
 doc.setFillColor(...COLOR.primary);
 doc.rect(0, 0, anchoPag, 32, 'F');
 doc.setTextColor(255, 255, 255);
 doc.setFontSize(16);
 doc.setFont('helvetica', 'bold');
 doc.text('PLATAFORMA ACADEMICA', anchoPag / 2, 14, { align: 'center' });
 doc.setFontSize(10);
 doc.setFont('helvetica', 'normal');
 const subtituloHeader = anioFiltro
 ? `Plan de Estudios - ${anioFiltro.nombre || anioFiltro.numeroAnio + '° Año'}`
 : 'Plan de Estudios Completo';
 doc.text(subtituloHeader, anchoPag / 2, 23, { align: 'center' });
 doc.setTextColor(0, 0, 0);

 // ============================================================
 // INFO DE LA CARRERA
 // ============================================================
 let y = 42;
 doc.setFontSize(15);
 doc.setFont('helvetica', 'bold');
 doc.setTextColor(30, 30, 30);
 const nombreLineas = doc.splitTextToSize(titulo.nombre, anchoUtil);
 doc.text(nombreLineas, margin, y);
 y += nombreLineas.length * 6 + 2;

 // Badges de info
 doc.setFontSize(10);
 doc.setFont('helvetica', 'normal');
 doc.setTextColor(80, 80, 80);
 const infoLinea = [
 `Nivel: ${titulo.nivel}`,
 `Duración: ${titulo.duracionAnios} años`,
 `Estado: ${titulo.estado === 'ACTIVO' ? 'Vigente' : 'Dado de Baja'}`,
 ].join(' - ');
 doc.text(infoLinea, margin, y);
 y += 6;

 // Resolucion vigente
 const resolucionVigente = titulo.resoluciones?.find((r) => r.estado === 'VIGENTE') || titulo.resoluciones?.[0];
 if (resolucionVigente) {
 doc.setFontSize(9);
 doc.setTextColor(120, 120, 120);
 doc.text(`Resolución: ${resolucionVigente.codigo}`, margin, y);
 y += 8;
 }

 // Linea divisoria
 doc.setDrawColor(200, 200, 200);
 doc.line(margin, y, anchoPag - margin, y);
 y += 8;

 // ============================================================
 // DESCRIPCION DE LA CARRERA
 // ============================================================
 if (titulo.descripcion) {
 doc.setFontSize(12);
 doc.setFont('helvetica', 'bold');
 doc.setTextColor(30, 30, 30);
 doc.text('Sobre la carrera', margin, y);
 y += 6;

 doc.setFontSize(10);
 doc.setFont('helvetica', 'normal');
 doc.setTextColor(60, 60, 60);
 const descLineas = doc.splitTextToSize(titulo.descripcion, anchoUtil);
 doc.text(descLineas, margin, y);
 y += descLineas.length * 5 + 8;
 }

 // ============================================================
 // PLAN DE ESTUDIOS
 // ============================================================
 if (!resolucionVigente) {
 doc.setFontSize(11);
 doc.setTextColor(150, 150, 150);
 doc.text('Esta carrera no tiene resolución cargada.', margin, y);
 doc.save(`Plan_${titulo.nombre.replace(/\s+/g, '_')}.pdf`);
 return;
 }

 const anios = (resolucionVigente.aniosCurriculares || [])
 .filter((a) => !anioFiltro || a.id === anioFiltro.id)
 .sort((a, b) => a.numeroAnio - b.numeroAnio);

 doc.setFontSize(13);
 doc.setFont('helvetica', 'bold');
 doc.setTextColor(30, 30, 30);
 if (y > altoPag - 40) { doc.addPage(); y = 20; }
 doc.text('Plan de estudios', margin, y);
 y += 8;

 for (const anio of anios) {
 // Verificar espacio para el titulo del anio
 if (y > altoPag - 40) { doc.addPage(); y = 20; }

 // Titulo del anio
 doc.setFillColor(...COLOR.primary.map((v) => Math.round(v + (255 - v) * 0.92)));
 doc.rect(margin, y - 5, anchoUtil, 9, 'F');
 doc.setFontSize(11);
 doc.setFont('helvetica', 'bold');
 doc.setTextColor(...COLOR.primary);
 doc.text(anio.nombre || `${anio.numeroAnio}o Anio`, margin + 2, y + 1);
 const cantMaterias = anio.materias?.length || 0;
 const horasAnio = anio.materias?.reduce((s, m) => s + (m.cargaHoraria || 0), 0) || 0;
 doc.setFontSize(9);
 doc.setFont('helvetica', 'normal');
 doc.setTextColor(120, 120, 120);
 doc.text(`${cantMaterias} materias - ${horasAnio} hs`, anchoPag - margin - 2, y + 1, { align: 'right' });
 y += 8;

 // Tabla de materias
 if (cantMaterias > 0) {
 const filas = anio.materias
 .sort((a, b) => a.codigo.localeCompare(b.codigo))
 .map((m) => [
 m.codigo,
 m.nombre,
 `${m.cargaHoraria} hs`,
 TIPO_CURSADA_LABEL[m.tipoCursada] || m.tipoCursada,
 ]);

 autoTable(doc, {
 startY: y,
 head: [['Código', 'Materia', 'Carga', 'Tipo']],
 body: filas,
 margin: { left: margin, right: margin },
 styles: { fontSize: 9, cellPadding: 2 },
 headStyles: { fillColor: [...COLOR.primary], textColor: 255, fontStyle: 'bold' },
 alternateRowStyles: { fillColor: [...COLOR.primary.map((v) => Math.round(v + (255 - v) * 0.95))] },
 theme: 'striped',
 columnStyles: {
 0: { cellWidth: 20, fontStyle: 'bold' },
 1: { cellWidth: 'auto' },
 2: { cellWidth: 18, halign: 'right' },
 3: { cellWidth: 32 },
 },
 });

 y = doc.lastAutoTable.finalY + 6;

 // Descripciones por materia
 doc.setFontSize(10);
 doc.setFont('helvetica', 'bold');
 doc.setTextColor(...COLOR.primary);
 if (y > altoPag - 30) { doc.addPage(); y = 20; }
 doc.text('Detalle de materias', margin, y);
 y += 6;

 for (const m of anio.materias.sort((a, b) => a.codigo.localeCompare(b.codigo))) {
 if (y > altoPag - 30) { doc.addPage(); y = 20; }

 // Nombre + codigo
 doc.setFontSize(10);
 doc.setFont('helvetica', 'bold');
 doc.setTextColor(30, 30, 30);
 doc.text(`${m.codigo} - ${m.nombre}`, margin, y);
 y += 5;

 // Descripcion
 if (m.descripcion) {
 doc.setFontSize(9);
 doc.setFont('helvetica', 'normal');
 doc.setTextColor(60, 60, 60);
 const descLineas = doc.splitTextToSize(`Qué se aprende: ${m.descripcion}`, anchoUtil);
 if (y + descLineas.length * 4 > altoPag - 25) { doc.addPage(); y = 20; }
 doc.text(descLineas, margin, y);
 y += descLineas.length * 4 + 1;
 }

 // Objetivos
 if (m.objetivos) {
 doc.setFontSize(9);
 doc.setTextColor(60, 60, 60);
 const objLineas = doc.splitTextToSize(`Objetivos: ${m.objetivos}`, anchoUtil);
 if (y + objLineas.length * 4 > altoPag - 25) { doc.addPage(); y = 20; }
 doc.text(objLineas, margin, y);
 y += objLineas.length * 4 + 1;
 }

 // Contenidos minimos
 if (m.contenidosMinimos) {
 doc.setFontSize(9);
 doc.setTextColor(60, 60, 60);
 const contLineas = doc.splitTextToSize(`Contenidos mínimos: ${m.contenidosMinimos}`, anchoUtil);
 if (y + contLineas.length * 4 > altoPag - 25) { doc.addPage(); y = 20; }
 doc.text(contLineas, margin, y);
 y += contLineas.length * 4 + 1;
 }

 y += 4; // separacion entre materias
 }

 y += 4;
 } else {
 doc.setFontSize(10);
 doc.setTextColor(150, 150, 150);
 doc.setFont('helvetica', 'italic');
 doc.text('Sin materias cargadas', margin + 2, y);
 y += 8;
 }
 }

 // ============================================================
 // PIE: FECHA LEGAL + FIRMAS
 // ============================================================
 if (y > altoPag - 60) { doc.addPage(); y = 20; }
 y = altoPag - 55;

 // Firmas (lineas + etiquetas)
 const anchoFirma = 60;
 const xFirma1 = margin;
 const xFirma2 = anchoPag - margin - anchoFirma;

 doc.setDrawColor(80, 80, 80);
 doc.line(xFirma1, y, xFirma1 + anchoFirma, y);
 doc.line(xFirma2, y, xFirma2 + anchoFirma, y);

 doc.setFontSize(9);
 doc.setTextColor(60, 60, 60);
 doc.text('Firma y sello del Directivo', xFirma1 + anchoFirma / 2, y + 5, { align: 'center' });
 doc.text('Sello de la Institución', xFirma2 + anchoFirma / 2, y + 5, { align: 'center' });

 // Fecha legal: alineada a la DERECHA, DEBAJO de las firmas
 const dia = new Date().getDate();
 const mes = new Date().toLocaleDateString('es-AR', { month: 'long' });
 const anio = new Date().getFullYear();
 const fechaTexto = `Mendoza, a los ${dia} días del mes de ${mes} de ${anio}`;
 doc.setFontSize(10);
 doc.setFont('helvetica', 'normal');
 doc.setTextColor(30, 30, 30);
 doc.text(fechaTexto, anchoPag - margin, y + 18, { align: 'right' });

 // ============================================================
 // PIE DE PAGINA
 // ============================================================
 const totalPag = doc.getNumberOfPages();
 for (let p = 1; p <= totalPag; p++) {
 doc.setPage(p);
 doc.setFontSize(8);
 doc.setTextColor(120, 120, 120);
 doc.text(
 `Plataforma Académica - Página ${p} de ${totalPag}`,
 anchoPag / 2,
 altoPag - 8,
 { align: 'center' }
 );
 }

 const nombreArchivo = anioFiltro
 ? `Plan_${titulo.nombre.replace(/\s+/g, '_')}_${anioFiltro.nombre || anioFiltro.numeroAnio + 'o_Anio'}.pdf`
 : `Plan_${titulo.nombre.replace(/\s+/g, '_')}_Completo.pdf`;

 doc.save(nombreArchivo);
}