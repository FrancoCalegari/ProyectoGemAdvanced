import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// Mapeo: nombre del titulo -> { numero, codigo }
const MAPA = {
  'Tecnicatura Superior en Administración de Empresas': {
    numero: '045',
    codigo: 'RES-2026-045-DGE',
    observaciones: 'Dirección General de Escuelas - Mendoza',
  },
  'Tecnicatura Superior en Análisis de Sistemas': {
    numero: '1234',
    codigo: 'RES-2026-1234-ME',
    observaciones: 'Ministerio de Educación de la Nación',
  },
  'Tecnicatura Superior en Desarrollo de Software': {
    numero: '0456',
    codigo: 'RES-SPEP-2025-0456',
    observaciones: 'Superintendencia de Educación Privada',
  },
  'Tecnicatura Superior en Enfermería': {
    numero: '0789',
    codigo: 'RES-2025-0789-ME',
    observaciones: 'Ministerio de Educación de la Nación',
  },
  'Tecnicatura Superior en Turismo y Hotelería': {
    numero: '012',
    codigo: 'RES-DFD-2026-012',
    observaciones: 'Dirección de Formación Docente',
  },
};

async function main() {
  console.log('Actualizando resoluciones con nombres reales...\n');

  const titulos = await prisma.titulo.findMany({
    include: { resoluciones: true },
  });

  let actualizadas = 0;
  let sinCambios = 0;

  for (const t of titulos) {
    const nuevo = MAPA[t.nombre];
    if (!nuevo) {
      console.log(`  ?   ${t.nombre} (sin mapeo, se deja igual)`);
      sinCambios++;
      continue;
    }

    for (const r of t.resoluciones) {
      // Solo actualizamos la resolucion VIGENTE
      if (r.estado !== 'VIGENTE') continue;

      // Verificar si el codigo nuevo ya existe en otra resolucion
      const existente = await prisma.resolucion.findFirst({
        where: { codigo: nuevo.codigo, NOT: { id: r.id } },
      });
      if (existente) {
        console.log(`  !   ${nuevo.codigo} ya existe, salteando ${t.nombre}`);
        continue;
      }

      await prisma.resolucion.update({
        where: { id: r.id },
        data: {
          numero: nuevo.numero,
          codigo: nuevo.codigo,
          observaciones: nuevo.observaciones,
        },
      });

      console.log(`  OK  ${t.nombre}`);
      console.log(`      ${r.codigo} -> ${nuevo.codigo}`);
      actualizadas++;
    }
  }

  console.log(`\nTotal: ${actualizadas} resoluciones actualizadas. ${sinCambios} titulos sin cambios.`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });