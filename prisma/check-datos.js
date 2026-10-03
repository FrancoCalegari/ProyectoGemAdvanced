import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const [alumnos, cursadas, mesas, certificados] = await Promise.all([
  prisma.alumno.count(),
  prisma.cursadaMateria.count({ where: { estado: 'EN_CURSO' } }),
  prisma.mesaExamen.count(),
  prisma.certificado.count(),
]);

console.log('Alumnos totales:', alumnos);
console.log('Cursadas en curso:', cursadas);
console.log('Mesas:', mesas);
console.log('Certificados:', certificados);

await prisma.$disconnect();
