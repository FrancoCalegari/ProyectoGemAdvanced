import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
const a = await prisma.alumno.findFirst({ where: { apellido: 'Rodríguez' } });
console.log('ID:', a?.id);
console.log('Estado:', a?.estadoAlumno);
await prisma.$disconnect();
