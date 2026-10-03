import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const materias = await prisma.materia.findMany({
  include: {
    anioCurricular: {
      include: { resolucion: { include: { titulo: true } } },
    },
  },
  orderBy: [{ codigo: 'asc' }],
});

console.log('Total: ' + materias.length + ' materias\n');
console.log('CODIGO | NOMBRE | TITULO | ANIO');
console.log('-'.repeat(100));

for (const m of materias) {
  const titulo = m.anioCurricular?.resolucion?.titulo?.nombre || '?';
  const anio = m.anioCurricular?.numeroAnio || '?';
  console.log(`${m.codigo} | ${m.nombre} | ${titulo} | ${anio}`);
}

await prisma.$disconnect();