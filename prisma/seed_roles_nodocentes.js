// ============================================================
// Personal no docente: ficha de Empleado + usuario + horarios.
//
// Idempotente: se puede correr varias veces sobre una base que ya
// tiene datos (no borra ni pisa nada de lo existente).
//
//   node prisma/seed_roles_nodocentes.js
//
// Requiere la migracion 20261005190000_add_empleados_horarios_celador.
// ============================================================
import bcrypt from 'bcryptjs';
import prisma from '../src/config/db.js';
import { HorarioTrabajoService } from '../src/services/horarioTrabajo.service.js';

const SECTORES = {
  BEDEL: 'Portería principal',
  CELADOR: 'Patio y accesos',
};

const PERSONAL = [
  { dni: '31000001', nombre: 'Bruno', apellido: 'Bedel', email: 'bedel@plataforma.edu.ar', password: 'bedel123', cargo: 'BEDEL', genero: 'M' },
  { dni: '31000002', nombre: 'Carla', apellido: 'Celador', email: 'celador@plataforma.edu.ar', password: 'celador123', cargo: 'CELADOR', genero: 'F' },
];

export async function seedPersonalNoDocente() {
  console.log('\n== Personal no docente (bedeles y celadores) ==\n');

  for (const p of PERSONAL) {
    const sector = SECTORES[p.cargo] || null;

    // 1) Ficha del empleado
    const empleado = await prisma.empleado.upsert({
      where: { dni: p.dni },
      update: { nombre: p.nombre, apellido: p.apellido, email: p.email, cargo: p.cargo, sector, estado: 'ACTIVO' },
      create: {
        dni: p.dni,
        nombre: p.nombre,
        apellido: p.apellido,
        email: p.email,
        genero: p.genero,
        cargo: p.cargo,
        sector,
        fechaIngreso: new Date('2024-03-01'),
      },
    });
    console.log(`  [FICHA]   ${String(empleado.cargo).padEnd(8)} ${empleado.apellido}, ${empleado.nombre} (${empleado.dni})`);

    // 2) Usuario de acceso vinculado a la ficha
    const passwordHash = await bcrypt.hash(p.password, 10);
    await prisma.usuario.upsert({
      where: { email: p.email },
      update: { rol: p.cargo, empleadoId: empleado.id, activo: true },
      create: {
        email: p.email,
        passwordHash,
        nombre: p.nombre,
        apellido: p.apellido,
        rol: p.cargo,
        empleadoId: empleado.id,
      },
    });
    console.log(`  [USUARIO] ${p.email} / ${p.password}  (rol ${p.cargo})`);

    // 3) Horarios de trabajo (lunes a viernes) — solo si todavía no tiene
    const vigentes = await prisma.horarioTrabajo.count({ where: { empleadoId: empleado.id, activo: true } });
    if (vigentes === 0) {
      for (const dia of [1, 2, 3, 4, 5]) {
        await HorarioTrabajoService.crear(
          empleado.id,
          { diaSemana: dia, horaInicio: '08:00', horaFin: '14:00', sector, vigenteDesde: '2026-03-01' },
          null
        );
      }
      console.log('  [HORARIO] lunes a viernes de 08:00 a 14:00');

      // 4) Una modificación de ejemplo, para que el empleado vea la novedad
      const miercoles = await prisma.horarioTrabajo.findFirst({
        where: { empleadoId: empleado.id, diaSemana: 3, activo: true },
      });
      if (miercoles) {
        await HorarioTrabajoService.actualizar(
          miercoles.id,
          { horaInicio: '10:00', horaFin: '16:00', motivo: 'Reorganización de los turnos de la mañana' },
          null
        );
        console.log('  [NOVEDAD] el miércoles pasó de 08:00-14:00 a 10:00-16:00 (queda sin ver)');
      }
    } else {
      console.log('  [HORARIO] ya tenía turnos cargados (no se toca)');
    }
  }

  console.log('\nListo. El celador ya puede ingresar y ver sus horarios, novedades y justificativos.');
}

// Si se ejecuta directamente (no cuando lo importa seed.js)
const ejecutadoDirecto = process.argv[1] && /seed_roles_nodocentes\.js$/.test(process.argv[1].replace(/\\/g, '/'));
if (ejecutadoDirecto) {
  seedPersonalNoDocente()
    .catch((e) => {
      console.error('\nError:', e.message);
      if (/rol_usuario|horarios_trabajo|empleados|modificaciones_horario/.test(String(e.message))) {
        console.error('Parece que falta aplicar la migración: npx prisma migrate deploy');
      }
      process.exit(1);
    })
    .finally(() => prisma.$disconnect());
}
