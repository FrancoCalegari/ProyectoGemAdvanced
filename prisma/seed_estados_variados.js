import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// ============================================================
// ALUMNOS: distribuir estados
// ============================================================
// Plan: de 20 alumnos
//  - 12 ACTIVO (cursando)
//  - 3 EGRESADO (terminaron la carrera)
//  - 2 BAJA (abandonaron)
//  - 3 INACTIVO (pausa temporal)
const ESTADOS_ALUMNOS = [
  'ACTIVO','ACTIVO','ACTIVO','ACTIVO','ACTIVO','ACTIVO',
  'ACTIVO','ACTIVO','ACTIVO','ACTIVO','ACTIVO','ACTIVO',
  'EGRESADO','EGRESADO','EGRESADO',
  'BAJA','BAJA',
  'INACTIVO','INACTIVO','INACTIVO',
];

// ============================================================
// PROFESORES: distribuir estados
// ============================================================
// Plan: de 9 profesores
//  - 6 ACTIVO (en funciones)
//  - 2 SUPLENCIA (cubriendo)
//  - 1 INACTIVO (dado de baja)
const ESTADOS_PROFESORES = [
  'ACTIVO','ACTIVO','ACTIVO','ACTIVO','ACTIVO','ACTIVO',
  'SUPLENCIA','SUPLENCIA',
  'INACTIVO',
];

async function main() {
  console.log('Actualizando estados de alumnos y profesores...\n');

  // ---------- ALUMNOS ----------
  const alumnos = await prisma.alumno.findMany({ orderBy: { apellido: 'asc' } });
  console.log(`Alumnos encontrados: ${alumnos.length}`);

  let alumnosActualizados = 0;
  for (let i = 0; i < alumnos.length; i++) {
    const nuevoEstado = ESTADOS_ALUMNOS[i % ESTADOS_ALUMNOS.length];
    await prisma.alumno.update({
      where: { id: alumnos[i].id },
      data: { estadoAlumno: nuevoEstado },
    });
    console.log(`  ${alumnos[i].apellido}, ${alumnos[i].nombre} -> ${nuevoEstado}`);
    alumnosActualizados++;
  }

  // ---------- PROFESORES ----------
  console.log('\n');
  const profesores = await prisma.profesor.findMany({ orderBy: { apellido: 'asc' } });
  console.log(`Profesores encontrados: ${profesores.length}`);

  let profesoresActualizados = 0;
  for (let i = 0; i < profesores.length; i++) {
    const nuevoEstado = ESTADOS_PROFESORES[i % ESTADOS_PROFESORES.length];
    await prisma.profesor.update({
      where: { id: profesores[i].id },
      data: { estado: nuevoEstado },
    });
    console.log(`  ${profesores[i].apellido}, ${profesores[i].nombre} -> ${nuevoEstado}`);
    profesoresActualizados++;
  }

  // ---------- RESUMEN ----------
  console.log('\n===== RESUMEN =====');
  const resumenAlumnos = await prisma.alumno.groupBy({
    by: ['estadoAlumno'],
    _count: true,
  });
  console.log('Alumnos por estado:');
  for (const r of resumenAlumnos) {
    console.log(`  ${r.estadoAlumno}: ${r._count}`);
  }

  const resumenProfesores = await prisma.profesor.groupBy({
    by: ['estado'],
    _count: true,
  });
  console.log('Profesores por estado:');
  for (const r of resumenProfesores) {
    console.log(`  ${r.estado}: ${r._count}`);
  }

  console.log(`\nTotal: ${alumnosActualizados} alumnos y ${profesoresActualizados} profesores actualizados.`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });