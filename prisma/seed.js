

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

// -------------------------------------------------------------
// UTILIDADES
// -------------------------------------------------------------

const uuid = () => crypto.randomUUID();

const log = (msg) => console.log(`   ${msg}`);
const titulo = (msg) => console.log(`\n━━━ ${msg} ━━━`);

// -------------------------------------------------------------
// DATOS BASE
// -------------------------------------------------------------

const TITULOS = [
  {
    nombre: 'Tecnicatura Superior en Desarrollo de Software',
    nivel: 'Terciario',
    duracionAnios: 3,
    codigoBase: 'TSD',
    materias: {
      1: [
        'Programación I', 'Matemática I', 'Álgebra', 'Introducción a la Informática',
        'Inglés Técnico I', 'Lógica y Algoritmos', 'Sistemas Operativos I',
        'Bases de Datos I', 'Comunicación y Redacción', 'Taller de Programación',
      ],
      2: [
        'Programación II', 'Matemática II', 'Bases de Datos II', 'Redes I',
        'Inglés Técnico II', 'Estructuras de Datos', 'Sistemas Operativos II',
        'Análisis de Sistemas', 'Programación Web I', 'Taller de Base de Datos',
      ],
      3: [
        'Programación III', 'Arquitectura de Software', 'Programación Web II',
        'Seguridad Informática', 'Metodología de la Investigación', 'Gestión de Proyectos',
        'Inteligencia Artificial', 'Cloud Computing', 'Práctica Profesional', 'Trabajo Final',
      ],
    },
  },
  {
    nombre: 'Tecnicatura Superior en Enfermería',
    nivel: 'Terciario',
    duracionAnios: 3,
    codigoBase: 'TSE',
    materias: {
      1: [
        'Anatomía y Fisiología I', 'Biología', 'Química Biológica', 'Fundamentos de Enfermería',
        'Salud Pública I', 'Psicología General', 'Nutrición', 'Microbiología',
        'Ética Profesional', 'Taller de Prácticas I',
      ],
      2: [
        'Anatomía y Fisiología II', 'Farmacología', 'Enfermería Clínica I',
        'Salud Pública II', 'Psicología Evolutiva', 'Cuidados Paliativos',
        'Enfermería Materno-Infantil', 'Bioestadística', 'Ética y Deontología', 'Taller de Prácticas II',
      ],
      3: [
        'Enfermería Clínica II', 'Administración en Enfermería', 'Enfermería Quirúrgica',
        'Salud Mental', 'Emergentología', 'Enfermería Comunitaria',
        'Metodología de la Investigación', 'Gestión de Servicios de Salud',
        'Práctica Profesional', 'Trabajo Final',
      ],
    },
  },
  {
    nombre: 'Tecnicatura Superior en Administración de Empresas',
    nivel: 'Terciario',
    duracionAnios: 3,
    codigoBase: 'TSA',
    materias: {
      1: [
        'Contabilidad I', 'Matemática Financiera', 'Introducción a la Administración',
        'Economía I', 'Derecho Privado', 'Informática Aplicada',
        'Comunicación Empresarial', 'Estadística I', 'Principios de Marketing', 'Taller de Gestión I',
      ],
      2: [
        'Contabilidad II', 'Costos y Presupuestos', 'Administración de Personal',
        'Economía II', 'Derecho Laboral', 'Sistemas de Información',
        'Estadística II', 'Marketing Estratégico', 'Finanzas I', 'Taller de Gestión II',
      ],
      3: [
        'Contabilidad Gerencial', 'Auditoría', 'Dirección Estratégica',
        'Comercio Internacional', 'Finanzas II', 'Gestión de Operaciones',
        'Metodología de la Investigación', 'Emprendedorismo',
        'Práctica Profesional', 'Trabajo Final',
      ],
    },
  },
  {
    nombre: 'Tecnicatura Superior en Análisis de Sistemas',
    nivel: 'Terciario',
    duracionAnios: 3,
    codigoBase: 'TSAS',
    materias: {
      1: [
        'Introducción a los Sistemas', 'Matemática Discreta', 'Programación I',
        'Álgebra Lineal', 'Arquitectura de Computadoras', 'Inglés Técnico I',
        'Lógica Computacional', 'Sistemas Operativos', 'Comunicación Técnica', 'Taller de Sistemas I',
      ],
      2: [
        'Análisis y Diseño de Sistemas', 'Estructuras de Datos', 'Programación II',
        'Bases de Datos I', 'Redes de Computadoras', 'Inglés Técnico II',
        'Ingeniería de Software I', 'Sistemas de Información', 'Estadística Aplicada', 'Taller de Sistemas II',
      ],
      3: [
        'Ingeniería de Software II', 'Bases de Datos II', 'Arquitectura de Software',
        'Seguridad de la Información', 'Gestión de Proyectos Informáticos',
        'Auditoría de Sistemas', 'Metodología de la Investigación',
        'Inteligencia de Negocios', 'Práctica Profesional', 'Trabajo Final',
      ],
    },
  },
  {
    nombre: 'Tecnicatura Superior en Turismo y Hotelería',
    nivel: 'Terciario',
    duracionAnios: 3,
    codigoBase: 'TSTH',
    materias: {
      1: [
        'Introducción al Turismo', 'Geografía Turística I', 'Historia del Turismo',
        'Patrimonio Cultural', 'Inglés Turístico I', 'Francés Turístico I',
        'Comunicación y Atención al Cliente', 'Administración Hotelera I',
        'Contabilidad Básica', 'Taller de Prácticas I',
      ],
      2: [
        'Geografía Turística II', 'Turismo Rural y de Aventura', 'Patrimonio Natural',
        'Inglés Turístico II', 'Francés Turístico II', 'Administración Hotelera II',
        'Operación de Agencias de Viajes', 'Marketing Turístico',
        'Legislación Turística', 'Taller de Prácticas II',
      ],
      3: [
        'Planificación Turística', 'Turismo Sustentable', 'Gestión de Eventos',
        'Turismo Internacional', 'Inglés Turístico III', 'Gestión de Calidad Hotelera',
        'Metodología de la Investigación', 'Emprendedorismo Turístico',
        'Práctica Profesional', 'Trabajo Final',
      ],
    },
  },
];

// -------------------------------------------------------------
// GENERADORES
// -------------------------------------------------------------

const generarCodigoResolucion = (codigoBase, anio) =>
  `RES-${codigoBase}-${anio}-V1`;

const generarCodigoMateria = (codigoBase, numeroAnio, indice) =>
  `${codigoBase}${numeroAnio}${String(indice + 1).padStart(2, '0')}`;

// -------------------------------------------------------------
// LIMPIEZA (en orden inverso a las FK)
// -------------------------------------------------------------

async function limpiar() {
  titulo('LIMPIANDO BASE');
  await prisma.certificado.deleteMany();
  await prisma.cursadaMateria.deleteMany();
  await prisma.inscripcion.deleteMany();
  await prisma.correlatividad.deleteMany();
  await prisma.materia.deleteMany();
  await prisma.anioCurricular.deleteMany();
  await prisma.resolucion.deleteMany();
  await prisma.titulo.deleteMany();
  await prisma.alumno.deleteMany();
  log('✅ Base limpia');
}

// -------------------------------------------------------------
// CREAR TÍTULOS + RESOLUCIONES + AÑOS + MATERIAS + CORRELATIVAS
// -------------------------------------------------------------

async function crearEstructuraAcademica() {
  titulo('CREANDO ESTRUCTURA ACADÉMICA');

  const resultados = [];

  for (const t of TITULOS) {
    // 1. Título
    const tituloCreado = await prisma.titulo.create({
      data: {
        nombre: t.nombre,
        nivel: t.nivel,
        duracionAnios: t.duracionAnios,
        estado: 'ACTIVO',
      },
    });

    // 2. Resolución vigente
    const resolucion = await prisma.resolucion.create({
      data: {
        tituloId: tituloCreado.id,
        numero: '001',
        anioCreacion: 2026,
        codigo: generarCodigoResolucion(t.codigoBase, 2026),
        fechaInicioVigencia: new Date('2026-03-01'),
        estado: 'VIGENTE',
        observaciones: 'Resolución inicial generada por el seeder',
      },
    });

    // 3. Años curriculares + materias
    const materiasPorAnio = {};

    for (let numeroAnio = 1; numeroAnio <= t.duracionAnios; numeroAnio++) {
      const anio = await prisma.anioCurricular.create({
        data: {
          resolucionId: resolucion.id,
          numeroAnio,
          nombre: numeroAnio === 1 ? 'Primer año' : numeroAnio === 2 ? 'Segundo año' : 'Tercer año',
        },
      });

      const materiasNombres = t.materias[numeroAnio];
      const materiasCreadas = [];

      for (let i = 0; i < materiasNombres.length; i++) {
        const materia = await prisma.materia.create({
          data: {
            anioCurricularId: anio.id,
            nombre: materiasNombres[i],
            codigo: generarCodigoMateria(t.codigoBase, numeroAnio, i),
            cargaHoraria: 96,
            tipoCursada: 'ANUAL',
          },
        });
        materiasCreadas.push(materia);
      }

      materiasPorAnio[numeroAnio] = materiasCreadas;
    }


    for (let numeroAnio = 2; numeroAnio <= t.duracionAnios; numeroAnio++) {
      const materiasActuales = materiasPorAnio[numeroAnio];
      const materiasAnteriores = materiasPorAnio[numeroAnio - 1];

      for (const materiaActual of materiasActuales) {
        for (const materiaAnterior of materiasAnteriores) {
          await prisma.correlatividad.create({
            data: {
              materiaId: materiaActual.id,
              materiaRequeridaId: materiaAnterior.id,
              tipo: 'PARA_CURSAR',
            },
          });
          await prisma.correlatividad.create({
            data: {
              materiaId: materiaActual.id,
              materiaRequeridaId: materiaAnterior.id,
              tipo: 'PARA_RENDIR_FINAL',
            },
          });
        }
      }
    }

    resultados.push({
      titulo: tituloCreado,
      resolucion,
      materiasPorAnio,
    });

    log(`✅ ${t.nombre}`);
  }

  return resultados;
}

// -------------------------------------------------------------
// CREAR ALUMNOS + INSCRIPCIONES + CURSADAS
// -------------------------------------------------------------

const NOMBRES = [
  ['Juan', 'Pérez'], ['María', 'Gómez'], ['Carlos', 'Rodríguez'], ['Lucía', 'Fernández'],
  ['Diego', 'López'], ['Sofía', 'Martínez'], ['Martín', 'García'], ['Valentina', 'Sánchez'],
  ['Nicolás', 'Romero'], ['Camila', 'Torres'], ['Federico', 'Díaz'], ['Julieta', 'Ruiz'],
  ['Matías', 'Sosa'], ['Florencia', 'Ramírez'], ['Agustín', 'Castro'], ['Micaela', 'Ortiz'],
  ['Tomás', 'Silva'], ['Antonella', 'Morales'], ['Franco', 'Vargas'], ['Belén', 'Herrera'],
];

async function crearAlumnos(estructuras) {
  titulo('CREANDO ALUMNOS E INSCRIPCIONES');

  const alumnosCreados = [];

  for (let i = 0; i < 20; i++) {
    const [nombre, apellido] = NOMBRES[i];
    const estructura = estructuras[i % estructuras.length]; // Distribución: 4 por título
    const anioNacimiento = 1995 + (i % 10);

    const alumno = await prisma.alumno.create({
      data: {
        dni: `30${String(10000000 + i).padStart(8, '0')}`,
        nombre,
        apellido,
        email: `${nombre.toLowerCase()}.${apellido.toLowerCase()}${i}@example.com`,
        fechaNacimiento: new Date(`${anioNacimiento}-0${(i % 9) + 1}-15`),
      },
    });

    const inscripcion = await prisma.inscripcion.create({
      data: {
        alumnoId: alumno.id,
        tituloId: estructura.titulo.id,
        resolucionId: estructura.resolucion.id,
        fechaInscripcion: new Date('2026-03-01'),
        estado: 'ACTIVA',
      },
    });

    alumnosCreados.push({ alumno, inscripcion, estructura, indice: i });
    log(`✅ ${nombre} ${apellido} → ${estructura.titulo.nombre}`);
  }

  return alumnosCreados;
}

// -------------------------------------------------------------
// CREAR CURSADAS (estados variados)
// -------------------------------------------------------------

async function crearCursadas(alumnosCreados) {
  titulo('CREANDO CURSADAS');

  for (const { inscripcion, estructura, indice } of alumnosCreados) {
    const { materiasPorAnio } = estructura;


    const perfil = indice % 5;

    const crearCursada = async (materiaId, estado, notaCursada = null, notaFinal = null) => {
      await prisma.cursadaMateria.create({
        data: {
          inscripcionId: inscripcion.id,
          materiaId,
          estado,
          notaCursada,
          notaFinal,
          fechaEstado: new Date('2026-07-01'),
        },
      });
    };

    if (perfil === 0) {
      // 1º completo REGULAR
      for (const m of materiasPorAnio[1]) await crearCursada(m.id, 'REGULAR', 7.5, null);
      // 2º EN_CURSO
      for (const m of materiasPorAnio[2]) await crearCursada(m.id, 'EN_CURSO');
    } else if (perfil === 1) {
      // 1º APROBADO
      for (const m of materiasPorAnio[1]) await crearCursada(m.id, 'APROBADA', 8, 8);
      // 2º REGULAR
      for (const m of materiasPorAnio[2]) await crearCursada(m.id, 'REGULAR', 7, null);
      // 3º EN_CURSO
      for (const m of materiasPorAnio[3]) await crearCursada(m.id, 'EN_CURSO');
    } else if (perfil === 2) {
      // TODO APROBADO (egresado)
      for (const m of materiasPorAnio[1]) await crearCursada(m.id, 'APROBADA', 8, 8);
      for (const m of materiasPorAnio[2]) await crearCursada(m.id, 'APROBADA', 8, 8);
      for (const m of materiasPorAnio[3]) await crearCursada(m.id, 'APROBADA', 9, 9);
    } else if (perfil === 3) {
      // 1º parcial variado
      const materias = materiasPorAnio[1];
      for (let j = 0; j < materias.length; j++) {
        if (j < 4) await crearCursada(materias[j].id, 'REGULAR', 7, null);
        else if (j < 6) await crearCursada(materias[j].id, 'APROBADA', 8, 8);
        else if (j < 7) await crearCursada(materias[j].id, 'LIBRE');
        else if (j < 8) await crearCursada(materias[j].id, 'DESAPROBADA', 3, null);
        else await crearCursada(materias[j].id, 'EN_CURSO');
      }
    }
    // perfil === 4: sin cursadas (solo inscripto)

    log(`✅ Cursadas para ${inscripcion.id.slice(0, 8)}... (perfil ${perfil})`);
  }
}

// -------------------------------------------------------------
// CREAR CERTIFICADOS DE EJEMPLO
// -------------------------------------------------------------

async function crearCertificados(alumnosCreados) {
  titulo('CREANDO CERTIFICADOS');


  const candidatosParcial1 = alumnosCreados.filter((a) => a.indice % 5 === 1);
  for (const { alumno, inscripcion, estructura } of candidatosParcial1) {
    const anio1 = await prisma.anioCurricular.findFirst({
      where: { resolucionId: estructura.resolucion.id, numeroAnio: 1 },
    });
    await prisma.certificado.create({
      data: {
        alumnoId: alumno.id,
        tituloId: estructura.titulo.id,
        resolucionId: estructura.resolucion.id,
        tipo: 'PARCIAL_ANIO',
        anioCurricularId: anio1.id,
        fechaEmision: new Date('2026-12-15'),
        estado: 'EMITIDO',
      },
    });
    log(`✅ Certificado PARCIAL_ANIO para ${alumno.nombre} ${alumno.apellido}`);
  }


  const egresados = alumnosCreados.filter((a) => a.indice % 5 === 2);
  for (const { alumno, estructura } of egresados) {
    await prisma.certificado.create({
      data: {
        alumnoId: alumno.id,
        tituloId: estructura.titulo.id,
        resolucionId: estructura.resolucion.id,
        tipo: 'TITULO_COMPLETO',
        fechaEmision: new Date('2026-12-20'),
        estado: 'EMITIDO',
      },
    });
    log(`✅ Certificado TITULO_COMPLETO para ${alumno.nombre} ${alumno.apellido}`);
  }


  if (egresados.length > 0) {
    const { alumno, estructura } = egresados[0];
    await prisma.certificado.create({
      data: {
        alumnoId: alumno.id,
        tituloId: estructura.titulo.id,
        resolucionId: estructura.resolucion.id,
        tipo: 'PARCIAL_ANIO',
        anioCurricularId: (await prisma.anioCurricular.findFirst({
          where: { resolucionId: estructura.resolucion.id, numeroAnio: 1 },
        })).id,
        fechaEmision: new Date('2026-11-01'),
        estado: 'ANULADO',
      },
    });
    log(`✅ Certificado ANULADO para ${alumno.nombre} ${alumno.apellido}`);
  }
}

// -------------------------------------------------------------
// CREAR USUARIO ADMIN
// -------------------------------------------------------------

async function crearUsuarioAdmin() {
  titulo('CREANDO USUARIO ADMIN');

  const email = 'admin@plataforma.edu.ar';
  const passwordPlano = 'admin123';
  const passwordHash = await bcrypt.hash(passwordPlano, 10);


  log(`⚠️  Modelo Usuario aún no implementado. Datos listos para cuando se agregue:`);
  log(`   email: ${email}`);
  log(`   password: ${passwordPlano}`);
  log(`   rol: admin`);
}

// -------------------------------------------------------------
// MAIN
// -------------------------------------------------------------

async function main() {
  console.log('\n╔══════════════════════════════════════════════════════╗');
  console.log('║  SEEDER — Plataforma Académica                       ║');
  console.log('╚══════════════════════════════════════════════════════╝');

  const inicio = Date.now();

  await limpiar();
  const estructuras = await crearEstructuraAcademica();
  const alumnosCreados = await crearAlumnos(estructuras);
  await crearCursadas(alumnosCreados);
  await crearCertificados(alumnosCreados);
  await crearUsuarioAdmin();

  const duracion = ((Date.now() - inicio) / 1000).toFixed(2);

  console.log('\n╔══════════════════════════════════════════════════════╗');
  console.log('║  ✅ SEEDER COMPLETADO                                ║');
  console.log('╚══════════════════════════════════════════════════════╝');
  console.log(`\n⏱  Duración: ${duracion}s\n`);
}

main()
  .catch((e) => {
    console.error('❌ Error en el seeder:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });