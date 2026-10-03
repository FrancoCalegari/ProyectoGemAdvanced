import PDFDocument from 'pdfkit';

function formatoFecha(fecha) {
  return new Date(fecha).toLocaleDateString('es-AR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

function formatoFechaCorta(fecha) {
  return new Date(fecha).toLocaleDateString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function encabezado(doc) {
  doc.fillColor('#000000').opacity(1);
  doc.fontSize(20).font('Helvetica-Bold');
  doc.text('INSTITUCIÓN EDUCATIVA', { align: 'center' });
  doc.moveDown(0.3);
  doc.fontSize(12).font('Helvetica');
  doc.text('Plataforma de Gestión de Carreras Académicas', { align: 'center' });
  doc.moveDown(0.5);
  doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
  doc.moveDown(1.5);
}

function datosAlumno(doc, alumno) {
  doc.fontSize(12).font('Helvetica');
  doc.text('Se certifica que:', { align: 'left' });
  doc.moveDown(0.5);
  doc.fontSize(14).font('Helvetica-Bold');
  doc.text(`${alumno.apellido}, ${alumno.nombre}`, { align: 'left' });
  doc.fontSize(12).font('Helvetica');
  doc.text(`DNI: ${alumno.dni}`);
  if (alumno.email) doc.text(`Email: ${alumno.email}`);
  doc.moveDown(1.5);
}

function pie(doc, fechaEmision) {
  doc.moveDown(2);
  doc.fontSize(11).font('Helvetica');
  doc.text(`Fecha de emisión: ${formatoFecha(fechaEmision)}`, { align: 'right' });
  doc.moveDown(4);
  doc.moveTo(150, doc.y).lineTo(400, doc.y).stroke();
  doc.moveDown(0.3);
  doc.text('Firma y sello de la institución', { align: 'center' });
}

function marcaAguaAnulado(doc) {
  doc.save();
  doc.rotate(-45, { origin: [300, 400] });
  doc.fontSize(80).fillColor('#ff0000').opacity(0.2);
  doc.text('ANULADO', 100, 350, { width: 400, align: 'center' });
  doc.restore();
}

// LABORAL — sin materia, carrera general, fecha de hoy
function templateLaboral(doc, datos) {
  const { alumno, titulo, resolucion, fechaEmision } = datos;

  encabezado(doc);
  doc.fontSize(16).font('Helvetica-Bold');
  doc.text('CERTIFICADO LABORAL', { align: 'center' });
  doc.moveDown(1.5);

  datosAlumno(doc, alumno);

  doc.fontSize(12).font('Helvetica');
  doc.text('Se deja constancia que el/la alumno/a se hizo presente en esta institución a cursar la carrera:');
  doc.moveDown(0.5);
  doc.fontSize(13).font('Helvetica-Bold');
  doc.text(titulo.nombre);
  doc.fontSize(11).font('Helvetica');
  doc.text(`Nivel: ${titulo.nivel}`);
  doc.text(`Resolución: ${resolucion.codigo}`);
  doc.moveDown(1);
  doc.fontSize(12).font('Helvetica-Bold');
  doc.text(`Fecha de asistencia: ${formatoFecha(fechaEmision)}`);
  doc.moveDown(1.5);

  doc.fontSize(10).font('Helvetica-Oblique').fillColor('#555555');
  doc.text(
    'Este certificado se emite a pedido del interesado/a para ser presentado ante su empleador.',
    { align: 'center', width: 480 }
  );
  doc.fillColor('#000000');

  pie(doc, fechaEmision);
}

// PARA COLECTIVO
function templateColectivo(doc, datos) {
  const { alumno, titulo, resolucion, anioActual, materiasAprobadas, totalMaterias, fechaEmision } = datos;

  encabezado(doc);
  doc.fontSize(16).font('Helvetica-Bold');
  doc.text('CERTIFICADO PARA COLECTIVO', { align: 'center' });
  doc.moveDown(1.5);

  datosAlumno(doc, alumno);

  doc.fontSize(12).font('Helvetica');
  doc.text('Se deja constancia que el/la alumno/a es ALUMNO/A REGULAR de esta institución, cursando la carrera:');
  doc.moveDown(0.5);
  doc.fontSize(13).font('Helvetica-Bold');
  doc.text(titulo.nombre);
  doc.fontSize(11).font('Helvetica');
  doc.text(`Nivel: ${titulo.nivel}`);
  doc.text(`Resolución vigente: ${resolucion.codigo}`);
  if (anioActual) doc.text(`Año que cursa: ${anioActual}`);
  doc.moveDown(1);

  doc.fontSize(11).font('Helvetica-Bold');
  doc.text('Situación académica:');
  doc.fontSize(10).font('Helvetica');
  doc.text(`• Materias aprobadas: ${materiasAprobadas}`);
  doc.text(`• Materias totales del plan: ${totalMaterias}`);
  doc.text(`• Avance: ${totalMaterias > 0 ? Math.round((materiasAprobadas / totalMaterias) * 100) : 0}%`);
  doc.moveDown(1.5);

  doc.fontSize(10).font('Helvetica-Oblique').fillColor('#555555');
  doc.text(
    'Este certificado se emite a pedido del interesado/a para ser presentado ante el colectivo correspondiente.',
    { align: 'center', width: 480 }
  );
  doc.fillColor('#000000');

  pie(doc, fechaEmision);
}

// CONCURRENCIA — rango general, tabla con materia
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
  doc.text(titulo.nombre);
  doc.fontSize(11).font('Helvetica');
  doc.text(`Nivel: ${titulo.nivel}`);
  doc.text(`Resolución: ${resolucion.codigo}`);
  doc.moveDown(1);

  doc.fontSize(12).font('Helvetica-Bold');
  doc.text('Rango analizado:');
  doc.fontSize(11).font('Helvetica');
  doc.text(`${formatoFecha(rango.desde)} → ${formatoFecha(rango.hasta)}`);
  doc.moveDown(1);

  doc.fontSize(12).font('Helvetica-Bold');
  doc.text('Resumen general:');
  doc.moveDown(0.5);

  const startY = doc.y;
  const col1 = 60;
  const col2 = 220;

  doc.fontSize(11).font('Helvetica');
  doc.text('Días totales:', col1, startY);
  doc.font('Helvetica-Bold').text(`${asistencias.total}`, col2, startY);
  doc.font('Helvetica');

  doc.text('Presentes:', col1, startY + 18);
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

  if (asistencias.detalle && asistencias.detalle.length > 0) {
    doc.fontSize(12).font('Helvetica-Bold');
    doc.text('Detalle por fecha:');
    doc.moveDown(0.5);
    doc.fontSize(9).font('Helvetica');

    const c1 = 60, c2 = 130, c3 = 340, c4 = 470;
    let y = doc.y;

    doc.font('Helvetica-Bold');
    doc.text('Fecha', c1, y, { width: 70 });
    doc.text('Materia', c2, y, { width: 210 });
    doc.text('Estado', c3, y, { width: 130 });
    doc.text('Obs.', c4, y, { width: 100 });
    y += 14;

    doc.font('Helvetica');
    const detalle = asistencias.detalle;
    for (let i = 0; i < detalle.length; i++) {
      if (y > 720) {
        doc.addPage();
        y = 60;
      }
      const d = detalle[i];
      doc.fillColor('#000000').text(formatoFechaCorta(d.fecha), c1, y, { width: 70 });
      doc.text(d.materiaNombre || '—', c2, y, { width: 210 });
      doc.fillColor(
        d.estado === 'PRESENTE' ? '#008000' :
        d.estado === 'JUSTIFICADO' ? '#b8860b' : '#cc0000'
      ).text(d.estado, c3, y, { width: 130 });
      doc.fillColor('#000000').text(d.observaciones || '—', c4, y, { width: 100 });
      y += 14;
    }
    doc.y = y + 10;
  }

  doc.moveDown(1);
  doc.fontSize(10).font('Helvetica-Oblique').fillColor('#555555');
  doc.text(
    'Este certificado se emite a pedido del interesado/a para acreditar su concurrencia a clases.',
    { align: 'center', width: 480 }
  );
  doc.fillColor('#000000');

  pie(doc, fechaEmision);
}

export function generarCertificadoPDF(datos) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: 'A4', margin: 50 });
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
    } catch (error) {
      reject(error);
    }
  });
}

function templateGenerico(doc, datos) {
  const { alumno, titulo, resolucion, tipo, anio, materias, fechaEmision } = datos;

  const TITULOS_POR_TIPO = {
    PARCIAL_ANIO: 'CERTIFICADO PARCIAL DE AÑO',
    TITULO_COMPLETO: 'CERTIFICADO DE TÍTULO COMPLETO',
    PARA_RENDIR: 'CERTIFICADO PARA RENDIR EXAMEN FINAL',
  };

  encabezado(doc);
  doc.fontSize(16).font('Helvetica-Bold');
  doc.text(TITULOS_POR_TIPO[tipo] || 'CERTIFICADO', { align: 'center' });
  doc.moveDown(1.5);

  datosAlumno(doc, alumno);

  doc.fontSize(12).font('Helvetica');
  doc.text('Ha completado / se encuentra cursando:');
  doc.moveDown(0.5);
  doc.fontSize(13).font('Helvetica-Bold');
  doc.text(titulo.nombre);
  doc.fontSize(11).font('Helvetica');
  doc.text(`Nivel: ${titulo.nivel}`);
  doc.text(`Resolución: ${resolucion.codigo}`);
  if (anio) doc.text(`Año: ${anio.nombre}`);
  doc.moveDown(1.5);

  if (materias && materias.length > 0) {
    doc.fontSize(12).font('Helvetica-Bold');
    doc.text(tipo === 'PARCIAL_ANIO' ? `Materias del ${anio?.nombre || 'año'}:` : 'Materias:');
    doc.moveDown(0.5);
    doc.fontSize(10).font('Helvetica');

    let y = doc.y;
    const c1 = 60, c2 = 200, c3 = 340;
    const porCol = Math.ceil(materias.length / 3);

    for (let i = 0; i < porCol; i++) {
      if (materias[i]) doc.text(`• ${materias[i].codigo}`, c1, y, { width: 130 });
      if (materias[i + porCol]) doc.text(`• ${materias[i + porCol].codigo}`, c2, y, { width: 130 });
      if (materias[i + porCol * 2]) doc.text(`• ${materias[i + porCol * 2].codigo}`, c3, y, { width: 200 });
      y += 14;
    }
    doc.y = y + 20;
  }

  pie(doc, fechaEmision);
}