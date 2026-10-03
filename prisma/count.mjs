import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
const counts = await Promise.all([
  prisma.alumno.count(),
  prisma.profesor.count(),
  prisma.titulo.count(),
  prisma.materia.count(),
  prisma.cursadaMateria.count(),
  prisma.mesaExamen.count(),
  prisma.certificado.count(),
  prisma.certificadoPresentado.count(),
  prisma.usuario.count(),
]);
console.log('Alumnos:', counts[0]);
console.log('Profesores:', counts[1]);
console.log('Titulos:', counts[2]);
console.log('Materias:', counts[3]);
console.log('Cursadas:', counts[4]);
console.log('Mesas:', counts[5]);
console.log('Certificados:', counts[6]);
console.log('Certificados presentados:', counts[7]);
console.log('Usuarios:', counts[8]);
await prisma.$disconnect();
