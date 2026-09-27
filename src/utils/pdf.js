import PDFDocument from 'pdfkit';

export function generarCertificadoPDF(datos) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: 'A4', margin: 50 });
      const buffers = [];

      doc.on('data', (chunk) => buffers.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', reject);

      const { alumno, titulo, resolucion, tipo, anio, materias, fechaEmision, estado } = datos;

      // Marca de agua si está anulado
      if (estado === 'ANULADO') {
        doc.save();
        doc.rotate(-45, { origin: [300, 400] });
        doc.fontSize(80).fillColor('#ff0000').opacity(0.2);
        doc.text('ANULADO', 100, 350, { width: 400, align: 'center' });
        doc.restore();
      }

      // Encabezado
      doc.fillColor('#000000').opacity(1);
      doc.fontSize(20).font('Helvetica-Bold');
      doc.text('INSTITUCIÓN EDUCATIVA', { align: 'center' });
      doc.moveDown(0.3);
      doc.fontSize(12).font('Helvetica');
      doc.text('Plataforma de Gestión de Carreras Académicas', { align: 'center' });
      doc.moveDown(0.5);
      doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
      doc.moveDown(1.5);

      // Título del certificado
      const tituloCert = tipo === 'TITULO_COMPLETO'
        ? 'CERTIFICADO DE TÍTULO COMPLETO'
        : `CERTIFICADO PARCIAL - ${anio ? anio.nombre.toUpperCase() : ''}`;

      doc.fontSize(16).font('Helvetica-Bold');
      doc.text(tituloCert, { align: 'center' });
      doc.moveDown(2);

      // Cuerpo
      doc.fontSize(12).font('Helvetica');
      doc.text('Se certifica que:', { align: 'left' });
      doc.moveDown(0.5);

      doc.fontSize(14).font('Helvetica-Bold');
      doc.text(`${alumno.apellido}, ${alumno.nombre}`, { align: 'left' });
      doc.fontSize(12).font('Helvetica');
      doc.text(`DNI: ${alumno.dni}`);
      doc.moveDown(1.5);

      doc.text('Ha completado satisfactoriamente:');
      doc.moveDown(0.5);
      doc.fontSize(13).font('Helvetica-Bold');
      doc.text(titulo.nombre);
      doc.fontSize(11).font('Helvetica');
      doc.text(`Nivel: ${titulo.nivel}`);
      doc.text(`Resolución: ${resolucion.codigo}`);
      doc.moveDown(1.5);

      // Materias aprobadas
      doc.fontSize(12).font('Helvetica-Bold');
      doc.text(tipo === 'TITULO_COMPLETO' ? 'Materias aprobadas:' : `Materias del ${anio.nombre}:`);
      doc.moveDown(0.5);

      doc.fontSize(10).font('Helvetica');
      let y = doc.y;
      const col1X = 60;
      const col2X = 200;
      const col3X = 340;

      if (materias.length === 0) {
        doc.text('(Sin materias para mostrar)');
      } else {
        const itemsPorColumna = Math.ceil(materias.length / 3);
        for (let i = 0; i < itemsPorColumna; i++) {
          if (materias[i]) doc.text(`• ${materias[i].codigo}`, col1X, y, { width: 130 });
          if (materias[i + itemsPorColumna]) doc.text(`• ${materias[i + itemsPorColumna].codigo}`, col2X, y, { width: 130 });
          if (materias[i + itemsPorColumna * 2]) doc.text(`• ${materias[i + itemsPorColumna * 2].codigo}`, col3X, y, { width: 200 });
          y += 14;
        }
        doc.y = y + 20;
      }

      // Fecha
      doc.moveDown(2);
      const fechaStr = new Date(fechaEmision).toLocaleDateString('es-AR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      });
      doc.fontSize(11).font('Helvetica');
      doc.text(`Fecha de emisión: ${fechaStr}`, { align: 'right' });
      doc.moveDown(4);

      // Firma
      doc.moveTo(150, doc.y).lineTo(400, doc.y).stroke();
      doc.moveDown(0.3);
      doc.text('Firma y sello de la institución', { align: 'center' });

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}