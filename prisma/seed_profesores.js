// ============================================================
// Seed adicional: 8 profesores + asignaciones + usuarios
// ============================================================
import bcrypt from 'bcrypt';
import prisma from '../src/config/db.js';
const PROFESORES_DATA = [
  // Tecnicatura en Administración de Empresas
  { dni: '30000001', nombre: 'Roberto', apellido: 'Fernández', email: 'roberto.fernandez@plataforma.edu.ar', genero: 'M', carreraMatch: 'Administración' },
  { dni: '30000002', nombre: 'Laura',   apellido: 'Martínez',  email: 'laura.martinez@plataforma.edu.ar',   genero: 'F', carreraMatch: 'Administración' },
  // Tecnicatura en Análisis de Sistemas
  { dni: '30000003', nombre: 'Carlos',  apellido: 'López',     email: 'carlos.lopez@plataforma.edu.ar',     genero: 'M', carreraMatch: 'Análisis' },
  { dni: '30000004', nombre: 'Sofía',   apellido: 'Gómez',     email: 'sofia.gomez@plataforma.edu.ar',      genero: 'F', carreraMatch: 'Análisis' },
  // Tecnicatura en Desarrollo de Software
  { dni: '30000005', nombre: 'Diego',   apellido: 'Rodríguez', email: 'diego.rodriguez@plataforma.edu.ar',  genero: 'M', carreraMatch: 'Software' },
  // Tecnicatura en Enfermería
  { dni: '30000006', nombre: 'Patricia', apellido: 'Sánchez',  email: 'patricia.sanchez@plataforma.edu.ar', genero: 'F', carreraMatch: 'Enfermería' },
  // Tecnicatura en Turismo y Hotelería
  { dni: '30000007', nombre: 'Martín',  apellido: 'Pérez',     email: 'martin.perez@plataforma.edu.ar',     genero: 'M', carreraMatch: 'Turismo' },
  { dni: '30000008', nombre: 'Andrea',  apellido: 'Silva',     email: 'andrea.silva@plataforma.edu.ar',     genero: 'F', carreraMatch: 'Turismo' },
];
const DIAS = [1, 2, 3, 4, 5]; // Lunes a Viernes
const HORARIOS = [
  { horaInicio: '08:00', horaFin: '10:00' },
  { horaInicio: '10:00', horaFin: '12:00' },
  { horaInicio: '14:00', horaFin: '16:00' },
  { horaInicio: '16:00', horaFin: '18:00' },
  { horaInicio: '18:00', horaFin: '20:00' },
];
const AULAS = ['Aula 1', 'Aula 2', 'Aula 3', 'Aula 4', 'Aula 5', 'Aula Magna', 'Laboratorio 1', 'Laboratorio 2'];
export async function seedProfesores() {
  console.log('  → Creando profesores...');
  // Traer titulos con sus resoluciones y materias
  const titulos = await prisma.titulo.findMany({
    include: {
      resoluciones: {
        where: { estado: 'VIGENTE' },
        include: {
          aniosCurriculares: {
            include: { materias: true },
          },
        },
      },
    },
  });
  const passwordHash = await bcrypt.hash('profesor123', 10);
  let creados = 0;
  let asignaciones = 0;
  let usuarios = 0;
  for (const p of PROFESORES_DATA) {
    // Buscar el titulo que matchea la carrera
    const titulo = titulos.find((t) => t.nombre.includes(p.carreraMatch));
    if (!titulo) {
      console.log(`    [WARN] No se encontro titulo para "${p.carreraMatch}", saltando ${p.apellido}`);
      continue;
    }
    // Crear profesor
    const profesor = await prisma.profesor.upsert({
      where: { dni: p.dni },
      update: {},
      create: {
        dni: p.dni,
        nombre: p.nombre,
        apellido: p.apellido,
        email: p.email,
        telefono: `+54 221 ${Math.floor(4000000 + Math.random() * 999999)}`,
        fechaNacimiento: new Date(1975 + Math.floor(Math.random() * 15), Math.floor(Math.random() * 12), 1 + Math.floor(Math.random() * 28)),
        genero: p.genero,
        domicilioCalle: 'Calle Falsa',
        domicilioNumero: String(100 + Math.floor(Math.random() * 900)),
        domicilioCiudad: 'La Plata',
        domicilioProvincia: 'Buenos Aires',
        domicilioCP: '1900',
        tieneCUD: false,
        estado: 'ACTIVO',
        titulos: {
          create: [
            {
              tipo: 'UNIVERSITARIO',
              nombre: `Licenciado/a en ${p.carreraMatch}`,
              institucion: 'UNLP',
              anioEgreso: 2005 + Math.floor(Math.random() * 10),
            },
          ],
        },
      },
    });
    creados++;
    // Tomar 2-3 materias del primer anio de la primera resolucion
    const resolucion = titulo.resoluciones[0];
    if (!resolucion) continue;
    const materias = resolucion.aniosCurriculares
      .sort((a, b) => a.numeroAnio - b.numeroAnio)
      .flatMap((a) => a.materias);
    // Elegir 2-3 materias aleatorias
    const cantidad = 2 + Math.floor(Math.random() * 2);
    const elegidas = materias.sort(() => Math.random() - 0.5).slice(0, cantidad);
    for (let i = 0; i < elegidas.length; i++) {
      const materia = elegidas[i];
      const dia = DIAS[i % DIAS.length];
      const horario = HORARIOS[i % HORARIOS.length];
      const aula = AULAS[i % AULAS.length];
      try {
        await prisma.materiaProfesor.create({
          data: {
            profesorId: profesor.id,
            materiaId: materia.id,
            diaSemana: dia,
            horaInicio: horario.horaInicio,
            horaFin: horario.horaFin,
            aula,
          },
        });
        asignaciones++;
      } catch (e) {
        // Ya existia, saltamos
      }
    }
    // Crear usuario vinculado
    try {
      await prisma.usuario.create({
        data: {
          email: p.email,
          passwordHash,
          nombre: p.nombre,
          apellido: p.apellido,
          rol: 'PROFESOR',
          profesorId: profesor.id,
        },
      });
      usuarios++;
    } catch (e) {
      // Ya existia
    }
  }
  console.log(`  [OK] ${creados} profesores, ${asignaciones} asignaciones de materias, ${usuarios} usuarios`);
}