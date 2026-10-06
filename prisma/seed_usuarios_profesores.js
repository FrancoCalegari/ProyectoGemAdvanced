import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
const prisma = new PrismaClient();

const PASSWORD = 'profesor123';

async function main() {
  console.log('Creando usuarios para profesores...\n');

  const passwordHash = await bcrypt.hash(PASSWORD, 10);
  const profesores = await prisma.profesor.findMany({
    include: { usuario: true },
  });

  let creados = 0;
  let existentes = 0;

  for (const p of profesores) {
    if (p.usuario) {
      console.log(`  SKIP ${p.email} (ya tiene usuario)`);
      existentes++;
      continue;
    }

    // Generar email desde nombre y apellido
    const email = `${p.nombre.toLowerCase().replace(/\s+/g, '')}.${p.apellido.toLowerCase().replace(/\s+/g, '')}@plataforma.edu.ar`;

    try {
      await prisma.usuario.create({
        data: {
          email,
          passwordHash,
          nombre: p.nombre,
          apellido: p.apellido,
          rol: 'PROFESOR',
          profesorId: p.id,
          activo: true,
        },
      });
      console.log(`  OK   ${email} (${p.apellido}, ${p.nombre})`);
      creados++;
    } catch (e) {
      console.log(`  FAIL ${email} - ${e.message}`);
    }
  }

  console.log(`\nTotal: ${creados} creados, ${existentes} ya existian`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });