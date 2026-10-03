import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const resoluciones = await prisma.resolucion.findMany({
  include: { titulo: { select: { nombre: true } } },
  orderBy: { codigo: 'asc' },
});

for (const r of resoluciones) {
  console.log(`  ${r.codigo} | ${r.numero} | ${r.titulo.nombre} | ${r.estado}`);
}

await prisma.$disconnect();
