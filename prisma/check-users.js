import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
const users = await prisma.usuario.findMany({
  select: { email: true, rol: true, nombre: true, apellido: true, activo: true }
});
for (const u of users) {
  console.log(`${u.rol.padEnd(12)} | ${u.email.padEnd(45)} | ${u.nombre} ${u.apellido} | activo=${u.activo}`);
}
await prisma.$disconnect();
