import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const correlativas = await prisma.correlatividad.count();
const equivalencias = await prisma.equivalencia.count();
const materias = await prisma.materia.count();

console.log('Correlatividades en DB:', correlativas);
console.log('Equivalencias en DB:', equivalencias);
console.log('Materias en DB:', materias);

if (correlativas > 0) {
  const ejemplos = await prisma.correlatividad.findMany({
    take: 3,
    include: {
      materia: { select: { nombre: true } },
      materiaRequerida: { select: { nombre: true } },
    },
  });
  console.log('\nEjemplos de correlatividades:');
  for (const c of ejemplos) {
    console.log(`  ${c.materia.nombre} <- ${c.materiaRequerida.nombre} [${c.tipo}]`);
  }
}

await prisma.$disconnect();
