// ============================================================
// Seed adicional: alumnos en distintos estados
// 10 activos + 5 egresados + 4 bajas + 3 inactivos = 22 nuevos
// Total esperado: 22 originales + 22 nuevos = 44 alumnos
// ============================================================
import prisma from '../src/config/db.js';

const ALUMNOS = [
  // ============== ACTIVOS (10) ==============
  { dni: '40000001', nombre: 'Sofia',      apellido: 'Ramirez',    email: 'sofia.ramirez@test.edu.ar',    fechaNacimiento: '2000-03-15', genero: 'F', estadoAlumno: 'ACTIVO' },
  { dni: '40000002', nombre: 'Mateo',      apellido: 'Torres',     email: 'mateo.torres@test.edu.ar',     fechaNacimiento: '1999-07-22', genero: 'M', estadoAlumno: 'ACTIVO' },
  { dni: '40000003', nombre: 'Valentina',  apellido: 'Acosta',     email: 'valentina.acosta@test.edu.ar', fechaNacimiento: '2001-11-08', genero: 'F', estadoAlumno: 'ACTIVO' },
  { dni: '40000004', nombre: 'Benjamin',   apellido: 'Herrera',    email: 'benjamin.herrera@test.edu.ar', fechaNacimiento: '1998-05-30', genero: 'M', estadoAlumno: 'ACTIVO' },
  { dni: '40000005', nombre: 'Camila',     apellido: 'Vega',       email: 'camila.vega@test.edu.ar',      fechaNacimiento: '2000-09-12', genero: 'F', estadoAlumno: 'ACTIVO' },
  { dni: '40000006', nombre: 'Thiago',     apellido: 'Medina',     email: 'thiago.medina@test.edu.ar',    fechaNacimiento: '1997-12-05', genero: 'M', estadoAlumno: 'ACTIVO' },
  { dni: '40000007', nombre: 'Isabella',   apellido: 'Castro',     email: 'isabella.castro@test.edu.ar',  fechaNacimiento: '2002-02-18', genero: 'F', estadoAlumno: 'ACTIVO' },
  { dni: '40000008', nombre: 'Lautaro',    apellido: 'Rojas',      email: 'lautaro.rojas@test.edu.ar',    fechaNacimiento: '1996-08-25', genero: 'M', estadoAlumno: 'ACTIVO' },
  { dni: '40000009', nombre: 'Martina',    apellido: 'Flores',     email: 'martina.flores@test.edu.ar',   fechaNacimiento: '2001-04-10', genero: 'F', estadoAlumno: 'ACTIVO' },
  { dni: '40000010', nombre: 'Santiago',   apellido: 'Benítez',    email: 'santiago.benitez@test.edu.ar', fechaNacimiento: '1999-10-03', genero: 'M', estadoAlumno: 'ACTIVO' },

  // ============== EGRESADOS (5) ==============
  { dni: '40000011', nombre: 'Julieta',    apellido: 'Suárez',     email: 'julieta.suarez@test.edu.ar',   fechaNacimiento: '1995-01-20', genero: 'F', estadoAlumno: 'EGRESADO' },
  { dni: '40000012', nombre: 'Facundo',    apellido: 'Cabrera',    email: 'facundo.cabrera@test.edu.ar',  fechaNacimiento: '1994-06-14', genero: 'M', estadoAlumno: 'EGRESADO' },
  { dni: '40000013', nombre: 'Micaela',    apellido: 'Ledesma',    email: 'micaela.ledesma@test.edu.ar',  fechaNacimiento: '1996-11-30', genero: 'F', estadoAlumno: 'EGRESADO' },
  { dni: '40000014', nombre: 'Nicolás',    apellido: 'Peralta',    email: 'nicolas.peralta@test.edu.ar',  fechaNacimiento: '1993-09-07', genero: 'M', estadoAlumno: 'EGRESADO' },
  { dni: '40000015', nombre: 'Agustina',   apellido: 'Molina',     email: 'agustina.molina@test.edu.ar',  fechaNacimiento: '1997-03-22', genero: 'F', estadoAlumno: 'EGRESADO' },

  // ============== BAJAS (4) ==============
  { dni: '40000016', nombre: 'Franco',     apellido: 'Ortiz',      email: 'franco.ortiz@test.edu.ar',     fechaNacimiento: '1998-12-11', genero: 'M', estadoAlumno: 'BAJA' },
  { dni: '40000017', nombre: 'Luciana',    apellido: 'Giménez',    email: 'luciana.gimenez@test.edu.ar',  fechaNacimiento: '2000-05-28', genero: 'F', estadoAlumno: 'BAJA' },
  { dni: '40000018', nombre: 'Gonzalo',    apellido: 'Quiroga',    email: 'gonzalo.quiroga@test.edu.ar',  fechaNacimiento: '1995-07-19', genero: 'M', estadoAlumno: 'BAJA' },
  { dni: '40000019', nombre: 'Daniela',    apellido: 'Navarro',    email: 'daniela.navarro@test.edu.ar',  fechaNacimiento: '2001-01-05', genero: 'F', estadoAlumno: 'BAJA' },

  // ============== INACTIVOS (3) ==============
  { dni: '40000020', nombre: 'Tomás',      apellido: 'Villalba',   email: 'tomas.villalba@test.edu.ar',   fechaNacimiento: '1996-04-17', genero: 'M', estadoAlumno: 'INACTIVO' },
  { dni: '40000021', nombre: 'Antonella',  apellido: 'Ferreyra',   email: 'antonella.ferreyra@test.edu.ar', fechaNacimiento: '1999-09-09', genero: 'F', estadoAlumno: 'INACTIVO' },
  { dni: '40000022', nombre: 'Ramiro',     apellido: 'Sosa',       email: 'ramiro.sosa@test.edu.ar',      fechaNacimiento: '1997-06-02', genero: 'M', estadoAlumno: 'INACTIVO' },
];

const CIUDADES = ['La Plata', 'Berisso', 'Ensenada', 'City Bell', 'Gonnet', 'Villa Elisa'];
const PROVINCIAS = ['Buenos Aires'];
const CALLES = ['Calle 50', 'Calle 7', 'Diagonal 73', 'Calle 12', 'Calle 60', 'Avenida 1'];

export async function seedAlumnosVariados() {
  console.log('  → Creando alumnos variados...');

  let creados = 0;
  let saltados = 0;

  for (const a of ALUMNOS) {
    // Verificar si ya existe
    const existente = await prisma.alumno.findUnique({ where: { dni: a.dni } });
    if (existente) {
      // Actualizar estadoAlumno por si quedo ACTIVO por default
      if (existente.estadoAlumno !== a.estadoAlumno) {
        await prisma.alumno.update({
          where: { dni: a.dni },
          data: { estadoAlumno: a.estadoAlumno },
        });
        console.log(`    [UPD] ${a.apellido}, ${a.nombre} → ${a.estadoAlumno}`);
      }
      saltados++;
      continue;
    }

    await prisma.alumno.create({
      data: {
        dni: a.dni,
        nombre: a.nombre,
        apellido: a.apellido,
        email: a.email,
        fechaNacimiento: new Date(a.fechaNacimiento),
        domicilioCalle: CALLES[Math.floor(Math.random() * CALLES.length)],
        domicilioNumero: String(100 + Math.floor(Math.random() * 900)),
        domicilioCiudad: CIUDADES[Math.floor(Math.random() * CIUDADES.length)],
        domicilioProvincia: 'Buenos Aires',
        domicilioCP: '1900',
        tienePartidaNacimiento: true,
        tieneAnaliticoSecundario: true,
        tieneCUD: false,
        estadoAlumno: a.estadoAlumno,
      },
    });
    creados++;
  }

  console.log(`  [OK] ${creados} creados, ${saltados} ya existian`);

  // Resumen por estado
  const totales = await prisma.alumno.groupBy({
    by: ['estadoAlumno'],
    _count: true,
  });
  console.log('  [INFO] Total por estado:');
  for (const t of totales) {
    console.log(`    ${t.estadoAlumno}: ${t._count}`);
  }
}