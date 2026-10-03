import PDFDocument from 'pdfkit';

// ============================================================
// Mapa de caracteres: convierte tildes y simbolos raros a ASCII
// ============================================================
function limpiarTexto(texto) {
  if (!texto) return '';
  return String(texto)
    .replace(/á/g, 'a').replace(/é/g, 'e').replace(/í/g, 'i')
    .replace(/ó/g, 'o').replace(/ú/g, 'u').replace(/ñ/g, 'n')
    .replace(/Á/g, 'A').replace(/É/g, 'E').replace(/Í/g, 'I')
    .replace(/Ó/g, 'O').replace(/Ú/g, 'U').replace(/Ñ/g, 'N')
    .replace(/¿/g, '?').replace(/¡/g, '!')
    .replace(/[^\x20-\x7E]/g, '');  // Borra cualquier otro caracter raro
}

const ESTADOS_MATERIA = {
  APROBADA:    { label: 'Aprobada',    color: '#10b981' },
  REGULAR:     { label: 'Regular',     color: '#3b82f6' },
  EN_CURSO:    { label: 'En curso',    color: '#f59e0b' },
  DESAPROBADA: { label: 'Desaprobada', color: '#ef4444' },
  LIBRE:       { label: 'Libre',       color: '#8b5cf6' },
  NO_CURSADA:  { label: 'No cursada',  color: '#94a3b8' },
};

function formatoFecha(fecha) {
  return new Date(fecha).toLocaleDateString('es-AR', {
    day: '2-digit', month: 'long', year: 'numeric',
  });
}

function formatoFechaLegal(fecha) {
  const meses = [
    'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
    'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
  ];
  const d = new Date(fecha);
  const dia = d.getDate();
  const mes = meses[d.getMonth()];
  const anio = d.getFullYear();
  return `Mendoza, a los ${dia} dias del mes de ${mes} del ano ${anio}`;
}
function encabezado(doc) {
  doc.fillColor('#000000').opacity(1);
  doc.fontSize(20).font('Helvetica-Bold');
  doc.text('INSTITUCION EDUCATIVA', { align: 'center' });
  doc.moveDown(0.3);
  doc.fontSize(12).font('Helvetica');
  doc.text('Plataforma de Gestión de Carreras Academicas', { align: 'center' });
  doc.moveDown(0.5);
  doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
  doc.moveDown(1.5);
}

function datosAlumno(doc, alumno) {
  doc.fontSize(12).font('Helvetica');
  doc.text('Se certifica que:', { align: 'left' });
  doc.moveDown(0.5);
  doc.fontSize(14).font('Helvetica-Bold');
  doc.text(limpiarTexto(`${alumno.apellido}, ${alumno.nombre}`), { align: 'left' });
  doc.fontSize(12).font('Helvetica');
  doc.text(`DNI: ${alumno.dni}`);
  if (alumno.email) doc.text(`Email: ${alumno.email}`);
  doc.moveDown(1.5);
}

function pie(doc, fechaEmision) {
  if (doc.y > 520) {
    doc.addPage();
    doc.y = 60;
  }

  // Constantes para centrado REAL
  const pageWidth = doc.page.width;      // 595.28 (A4)
  const margin = 50;
  const anchoUtil = pageWidth - margin * 2;  // 495.28

  doc.moveDown(2);

  // Separador
  doc.moveTo(margin, doc.y).lineTo(pageWidth - margin, doc.y).strokeColor('#cccccc').stroke();
  doc.strokeColor('#000000');
  doc.moveDown(1.5);

  // Fecha legal CENTRADA
  const fechaStr = formatoFechaLegal(fechaEmision);
  doc.fontSize(11).font('Helvetica').fillColor('#000000');
  doc.text(fechaStr, margin, doc.y, {
    width: anchoUtil,
    align: 'center',
  });

  // Espacio antes de la firma 1
  doc.moveDown(4);

  // ============ FIRMA DEL DIRECTIVO ============
  // Linea
  const y1 = doc.y;
  const lineaAncho = 240;
  const lineaX = (pageWidth - lineaAncho) / 2;  // Centrada

  doc.moveTo(lineaX, y1).lineTo(lineaX + lineaAncho, y1).strokeColor('#333333').stroke();
  doc.strokeColor('#000000');

  // Texto debajo de la linea (SIN superposicion)
  doc.fontSize(10).font('Helvetica-Bold').fillColor('#000000');
  doc.text('Firma y sello del Directivo', margin, y1 + 8, {
    width: anchoUtil,
    align: 'center',
  });

  // Espacio antes de la firma 2
  doc.moveDown(4);

  // ============ SELLO DE LA INSTITUCION ============
  const y2 = doc.y;

  doc.moveTo(lineaX, y2).lineTo(lineaX + lineaAncho, y2).strokeColor('#333333').stroke();
  doc.strokeColor('#000000');

  doc.fontSize(10).font('Helvetica-Bold').fillColor('#000000');
  doc.text('Sello de la Institucion', margin, y2 + 8, {
    width: anchoUtil,
    align: 'center',
  });
}

function marcaAguaAnulado(doc) {
  doc.save();
  doc.rotate(-45, { origin: [300, 400] });
  doc.fontSize(80).fillColor('#ff0000').opacity(0.2);
  doc.text('ANULADO', 100, 350, { width: 400, align: 'center' });
  doc.restore();
}

// ============================================================
// TABLA DE MATERIAS con nombre, estado y nota
// ============================================================
function tablaMaterias(doc, materias) {
  const colNombre = 60;
  const colEstado = 380;
  const colNota = 480;
  let y = doc.y;

  doc.fontSize(10).font('Helvetica-Bold').fillColor('#000000');
  doc.text('Materia', colNombre, y, { width: 310 });
  doc.text('Estado', colEstado, y, { width: 90 });
  doc.text('Nota', colNota, y, { width: 60 });
  y += 16;

  doc.moveTo(50, y).lineTo(545, y).strokeColor('#cccccc').stroke();
  y += 6;
  doc.strokeColor('#000000');

  doc.font('Helvetica').fontSize(10);
  for (const m of materias) {
    if (y > 720) {
      doc.addPage();
      y = 60;
    }

    const estadoInfo = ESTADOS_MATERIA[m.estado] || ESTADOS_MATERIA.NO_CURSADA;
    const nota = m.notaFinal ?? m.notaCursada ?? null;
    const nombreMateria = limpiarTexto(m.nombre || m.codigo || '-');

    doc.fillColor('#000000');
    doc.text(nombreMateria, colNombre, y, { width: 310 });

    doc.fillColor(estadoInfo.color);
    doc.text(estadoInfo.label, colEstado, y, { width: 90 });

    doc.fillColor('#000000');
    doc.text(nota !== null ? String(nota) : '-', colNota, y, { width: 60 });

    y += 15;
  }

  doc.y = y + 10;
}

function resumenMaterias(doc, materias) {
  const total = materias.length;
  const aprobadas = materias.filter((m) => m.estado === 'APROBADA').length;
  const regulares = materias.filter((m) => m.estado === 'REGULAR').length;
  const enCurso = materias.filter((m) => m.estado === 'EN_CURSO').length;
  const desaprobadas = materias.filter((m) => m.estado === 'DESAPROBADA').length;
  const noCursadas = materias.filter((m) => m.estado === 'NO_CURSADA').length;

  if (doc.y > 500) {
    doc.addPage();
    doc.y = 60;
  }

  doc.moveDown(1);

  // Separador superior
  doc.moveTo(50, doc.y).lineTo(545, doc.y).strokeColor('#cccccc').stroke();
  doc.strokeColor('#000000');
  doc.moveDown(0.8);

  // Titulo alineado a la IZQUIERDA
  doc.fontSize(12).font('Helvetica-Bold').fillColor('#000000');
  doc.text('RESUMEN ACADEMICO', 50, doc.y);
  doc.moveDown(1);

  // Datos en 2 columnas
  const colIzq = 60;
  const colDer = 320;
  const startY = doc.y;

  doc.fontSize(11).font('Helvetica').fillColor('#000000');

  // Fila 1
  doc.text('Total de materias:', colIzq, startY);
  doc.font('Helvetica-Bold').text(String(total), colIzq + 130, startY);

  // Fila 2
  doc.font('Helvetica').text('Aprobadas:', colIzq, startY + 22);
  doc.font('Helvetica-Bold').fillColor('#10b981').text(String(aprobadas), colIzq + 100, startY + 22);
  doc.font('Helvetica').fillColor('#000000').text('Regulares:', colDer, startY + 22);
  doc.font('Helvetica-Bold').fillColor('#3b82f6').text(String(regulares), colDer + 100, startY + 22);

  // Fila 3
  doc.font('Helvetica').fillColor('#000000').text('En curso:', colIzq, startY + 44);
  doc.font('Helvetica-Bold').fillColor('#f59e0b').text(String(enCurso), colIzq + 100, startY + 44);
  doc.font('Helvetica').fillColor('#000000').text('Desaprobadas:', colDer, startY + 44);
  doc.font('Helvetica-Bold').fillColor('#ef4444').text(String(desaprobadas), colDer + 120, startY + 44);

  // Fila 4
  doc.font('Helvetica').fillColor('#000000').text('No cursadas:', colIzq, startY + 66);
  doc.font('Helvetica-Bold').fillColor('#64748b').text(String(noCursadas), colIzq + 110, startY + 66);

  const porcentaje = total > 0 ? Math.round((aprobadas / total) * 100) : 0;
  doc.font('Helvetica').fillColor('#000000').text('Avance academico:', colDer, startY + 66);
  doc.font('Helvetica-Bold').fillColor('#10b981').text(`${porcentaje}%`, colDer + 130, startY + 66);

  doc.font('Helvetica').fillColor('#000000');
  doc.y = startY + 100;

  // Separador inferior
  doc.moveTo(50, doc.y).lineTo(545, doc.y).strokeColor('#cccccc').stroke();
  doc.strokeColor('#000000');
  doc.moveDown(1);
}

function templateGenerico(doc, datos) {
  const { alumno, titulo, resolucion, tipo, anio, materias, fechaEmision } = datos;

  const TITULOS_POR_TIPO = {
    PARCIAL_ANIO: 'CERTIFICADO PARCIAL DE ANIO',
    TITULO_COMPLETO: 'CERTIFICADO DE TITULO COMPLETO',
    PARA_RENDIR: 'CERTIFICADO PARA RENDIR EXAMEN FINAL',
  };

  encabezado(doc);
  doc.fontSize(16).font('Helvetica-Bold').fillColor('#000000');
  doc.text(TITULOS_POR_TIPO[tipo] || 'CERTIFICADO', { align: 'center' });
  doc.moveDown(2);
  doc.moveDown(1.5);

  datosAlumno(doc, alumno);

  doc.fontSize(12).font('Helvetica');
  doc.text('Ha completado / se encuentra cursando:');
  doc.moveDown(0.5);
  doc.fontSize(13).font('Helvetica-Bold');
  doc.text(limpiarTexto(titulo.nombre));
  doc.fontSize(11).font('Helvetica');
  doc.text(`Nivel: ${limpiarTexto(titulo.nivel)}`);
  doc.text(`Resolución: ${limpiarTexto(resolucion.codigo)}`);
  if (anio) doc.text(`Año: ${limpiarTexto(anio.nombre)}`);
  doc.moveDown(1.5);

  if (materias && materias.length > 0) {
    doc.fontSize(12).font('Helvetica-Bold');
    doc.text(tipo === 'PARCIAL_ANIO' ? `Materias del ${limpiarTexto(anio?.nombre) || 'anio'}:` : 'Materias:');
    doc.moveDown(0.5);
    tablaMaterias(doc, materias);
    doc.moveDown(1);
    resumenMaterias(doc, materias);
  }

  pie(doc, fechaEmision);
}

function templateLaboral(doc, datos) {
  const { alumno, titulo, resolucion, fechaEmision } = datos;
  encabezado(doc);
  doc.fontSize(16).font('Helvetica-Bold');
  doc.text('CERTIFICADO LABORAL', { align: 'center' });
  doc.moveDown(1.5);
  datosAlumno(doc, alumno);

  doc.fontSize(12).font('Helvetica');
  doc.text('Se deja constancia que el/la alumno/a se hizo presente en esta institucion a cursar la carrera:');
  doc.moveDown(0.5);
  doc.fontSize(13).font('Helvetica-Bold');
  doc.text(limpiarTexto(titulo.nombre));
  doc.fontSize(11).font('Helvetica');
  doc.text(`Nivel: ${limpiarTexto(titulo.nivel)}`);
  doc.text(`Resolución: ${limpiarTexto(resolucion.codigo)}`);
  doc.moveDown(1);
  doc.fontSize(12).font('Helvetica-Bold');
  doc.text(`Fecha de asistencia: ${formatoFecha(fechaEmision)}`);
  doc.moveDown(1.5);

  doc.fontSize(10).font('Helvetica-Oblique').fillColor('#555555');
  doc.text('Este certificado se emite a pedido del interesado/a para ser presentado ante su empleador.', { align: 'center', width: 480 });
  doc.fillColor('#000000');
  pie(doc, fechaEmision);
}

function templateColectivo(doc, datos) {
  const { alumno, titulo, resolucion, anioActual, materiasAprobadas, totalMaterias, fechaEmision } = datos;
  encabezado(doc);
  doc.fontSize(16).font('Helvetica-Bold');
  doc.text('CERTIFICADO PARA COLECTIVO', { align: 'center' });
  doc.moveDown(1.5);
  datosAlumno(doc, alumno);

  doc.fontSize(12).font('Helvetica');
  doc.text('Se deja constancia que el/la alumno/a es ALUMNO/A REGULAR de esta institucion, cursando la carrera:');
  doc.moveDown(0.5);
  doc.fontSize(13).font('Helvetica-Bold');
  doc.text(limpiarTexto(titulo.nombre));
  doc.fontSize(11).font('Helvetica');
  doc.text(`Nivel: ${limpiarTexto(titulo.nivel)}`);
  doc.text(`Resolución vigente: ${limpiarTexto(resolucion.codigo)}`);
  if (anioActual) doc.text(`Año que cursa: ${limpiarTexto(anioActual)}`);
  doc.moveDown(1);

  doc.fontSize(11).font('Helvetica-Bold');
  doc.text('Situacion academica:');
  doc.fontSize(10).font('Helvetica');
  doc.text(`- Materias aprobadas: ${materiasAprobadas}`);
  doc.text(`- Materias totales del plan: ${totalMaterias}`);
  doc.text(`- Avance: ${totalMaterias > 0 ? Math.round((materiasAprobadas / totalMaterias) * 100) : 0}%`);
  doc.moveDown(1.5);

  doc.fontSize(10).font('Helvetica-Oblique').fillColor('#555555');
  doc.text('Este certificado se emite a pedido del interesado/a para ser presentado ante el colectivo correspondiente.', { align: 'center', width: 480 });
  doc.fillColor('#000000');
  pie(doc, fechaEmision);
}

function templateConcurrencia(doc, datos) {
  const { alumno, titulo, resolucion, rango, asistencias, fechaEmision } = datos;
  encabezado(doc);
  doc.fontSize(16).font('Helvetica-Bold');
  doc.text('CERTIFICADO DE CONCURRENCIA', { align: 'center' });
  doc.moveDown(1.5);
  datosAlumno(doc, alumno);

  doc.fontSize(12).font('Helvetica');
  doc.text('Se certifica la concurrencia del/de la alumno/a a la carrera:');
  doc.moveDown(0.5);
  doc.fontSize(13).font('Helvetica-Bold');
  doc.text(limpiarTexto(titulo.nombre));
  doc.fontSize(11).font('Helvetica');
  doc.text(`Nivel: ${limpiarTexto(titulo.nivel)}`);
  doc.text(`Resolución: ${limpiarTexto(resolucion.codigo)}`);
  doc.moveDown(1);

  doc.fontSize(12).font('Helvetica-Bold');
  doc.text('Rango analizado:');
  doc.fontSize(11).font('Helvetica');
  doc.text(`${formatoFecha(rango.desde)} - ${formatoFecha(rango.hasta)}`);
  doc.moveDown(1);

  doc.fontSize(12).font('Helvetica-Bold');
  doc.text('Resumen general:');
  doc.moveDown(0.5);
  const startY = doc.y;
  const col1 = 60, col2 = 220;

  doc.fontSize(11).font('Helvetica');
  doc.text('Dias totales:', col1, startY);
  doc.font('Helvetica-Bold').text(`${asistencias.total}`, col2, startY);
  doc.font('Helvetica').text('Presentes:', col1, startY + 18);
  doc.font('Helvetica-Bold').fillColor('#008000').text(`${asistencias.presentes}`, col2, startY + 18);
  doc.fillColor('#000000').font('Helvetica');
  doc.text('Justificados:', col1, startY + 36);
  doc.font('Helvetica-Bold').fillColor('#b8860b').text(`${asistencias.justificados}`, col2, startY + 36);
  doc.fillColor('#000000').font('Helvetica');
  doc.text('Ausentes:', col1, startY + 54);
  doc.font('Helvetica-Bold').fillColor('#cc0000').text(`${asistencias.ausentes}`, col2, startY + 54);
  doc.fillColor('#000000').font('Helvetica');
  doc.text('Porcentaje de asistencia:', col1, startY + 72);
  doc.font('Helvetica-Bold').text(`${asistencias.porcentaje}%`, col2, startY + 72);
  doc.y = startY + 100;

  pie(doc, fechaEmision);
}

export function generarCertificadoPDF(datos) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: 'A4', margin: 50, autoFirstPage: true });
      const buffers = [];
      doc.on('data', (chunk) => buffers.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', reject);

      if (datos.estado === 'ANULADO') marcaAguaAnulado(doc);

      switch (datos.tipo) {
        case 'LABORAL': templateLaboral(doc, datos); break;
        case 'PARA_COLECTIVO': templateColectivo(doc, datos); break;
        case 'CONCURRENCIA': templateConcurrencia(doc, datos); break;
        default: templateGenerico(doc, datos);
      }
      doc.end();
    } catch (error) { reject(error); }
  });
}