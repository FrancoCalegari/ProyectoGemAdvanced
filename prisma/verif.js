import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const [titulos, materias, alumnos, profesores, users] = await Promise.all([
  prisma.titulo.count(),
  prisma.materia.count(),
  prisma.alumno.count(),
  prisma.profesor.count(),
  prisma.usuario.count(),
]);

const conDesc = await prisma.titulo.count({ where: { descripcion: { not: null } } });
const matConDesc = await prisma.materia.count({ where: { descripcion: { not: null } } });

console.log('Titulos:', titulos, '(con descripcion:', conDesc + ')');
console.log('Materias:', materias, '(con descripcion:', matConDesc + ')');
console.log('Alumnos:', alumnos);
console.log('Profesores:', profesores);
console.log('Usuarios:', users);

await prisma.$disconnect();
