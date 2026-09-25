import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const log = (msg) => console.log(`   ${msg}`);
const titulo = (msg) => console.log(`\n━━━ ${msg} ━━━`);

const TITULOS = [
  { nombre: 'Tecnicatura Superior en Desarrollo de Software', nivel: 'Terciario', duracionAnios: 3, codigoBase: 'TSD', materias: { 1: ['Programación I', 'Matemática I', 'Álgebra', 'Introducción a la Informática', 'Inglés Técnico I', 'Lógica y Algoritmos', 'Sistemas Operativos I', 'Bases de Datos I', 'Comunicación y Redacción', 'Taller de Programación'], 2: ['Programación II', 'Matemática II', 'Bases de Datos II', 'Redes I', 'Inglés Técnico II', 'Estructuras de Datos', 'Sistemas Operativos II', 'Análisis de Sistemas', 'Programación Web I', 'Taller de Base de Datos'], 3: ['Programación III', 'Arquitectura de Software', 'Programación Web II', 'Seguridad Informática', 'Metodología de la Investigación', 'Gestión de Proyectos', 'Inteligencia Artificial', 'Cloud Computing', 'Práctica Profesional', 'Trabajo Final'] } },
  { nombre: 'Tecnicatura Superior en Enfermería', nivel: 'Terciario', duracionAnios: 3, codigoBase: 'TSE', materias: { 1: ['Anatomía y Fisiología I', 'Biología', 'Química Biológica', 'Fundamentos de Enfermería', 'Salud Pública I', 'Psicología General', 'Nutrición', 'Microbiología', 'Ética Profesional', 'Taller de Prácticas I'], 2: ['Anatomía y Fisiología II', 'Farmacología', 'Enfermería Clínica I', 'Salud Pública II', 'Psicología Evolutiva', 'Cuidados Paliativos', 'Enfermería Materno-Infantil', 'Bioestadística', 'Ética y Deontología', 'Taller de Prácticas II'], 3: ['Enfermería Clínica II', 'Administración en Enfermería', 'Enfermería Quirúrgica', 'Salud Mental', 'Emergentología', 'Enfermería Comunitaria', 'Metodología de la Investigación', 'Gestión de Servicios de Salud', 'Práctica Profesional', 'Trabajo Final'] } },
  { nombre: 'Tecnicatura Superior en Administración de Empresas', nivel: 'Terciario', duracionAnios: 3, codigoBase: 'TSA', materias: { 1: ['Contabilidad I', 'Matemática Financiera', 'Introducción a la Administración', 'Economía I', 'Derecho Privado', 'Informática Aplicada', 'Comunicación Empresarial', 'Estadística I', 'Principios de Marketing', 'Taller de Gestión I'], 2: ['Contabilidad II', 'Costos y Presupuestos', 'Administración de Personal', 'Economía II', 'Derecho Laboral', 'Sistemas de Información', 'Estadística II', 'Marketing Estratégico', 'Finanzas I', 'Taller de Gestión II'], 3: ['Contabilidad Gerencial', 'Auditoría', 'Dirección Estratégica', 'Comercio Internacional', 'Finanzas II', 'Gestión de Operaciones', 'Metodología de la Investigación', 'Emprendedorismo', 'Práctica Profesional', 'Trabajo Final'] } },
  { nombre: 'Tecnicatura Superior en Análisis de Sistemas', nivel: 'Terciario', duracionAnios: 3, codigoBase: 'TSAS', materias: { 1: ['Introducción a los Sistemas', 'Matemática Discreta', 'Programación I', 'Álgebra Lineal', 'Arquitectura de Computadoras', 'Inglés Técnico I', 'Lógica Computacional', 'Sistemas Operativos', 'Comunicación Técnica', 'Taller de Sistemas I'], 2: ['Análisis y Diseño de Sistemas', 'Estructuras de Datos', 'Programación II', 'Bases de Datos I', 'Redes de Computadoras', 'Inglés Técnico II', 'Ingeniería de Software I', 'Sistemas de Información', 'Estadística Aplicada', 'Taller de Sistemas II'], 3: ['Ingeniería de Software II', 'Bases de Datos II', 'Arquitectura de Software', 'Seguridad de la Información', 'Gestión de Proyectos Informáticos', 'Auditoría de Sistemas', 'Metodología de la Investigación', 'Inteligencia de Negocios', 'Práctica Profesional', 'Trabajo Final'] } },
  { nombre: 'Tecnicatura Superior en Turismo y Hotelería', nivel: 'Terciario', duracionAnios: 3, codigoBase: 'TSTH', materias: { 1: ['Introducción al Turismo', 'Geografía Turística I', 'Historia del Turismo', 'Patrimonio Cultural', 'Inglés Turístico I', 'Francés Turístico I', 'Comunicación y Atención al Cliente', 'Administración Hotelera I', 'Contabilidad Básica', 'Taller de Prácticas I'], 2: ['Geografía Turística II', 'Turismo Rural y de Aventura', 'Patrimonio Natural', 'Inglés Turístico II', 'Francés Turístico II', 'Administración Hotelera II', 'Operación de Agencias de Viajes', 'Marketing Turístico', 'Legislación Turística', 'Taller de Prácticas II'], 3: ['Planificación Turística', 'Turismo Sustentable', 'Gestión de Eventos', 'Turismo Internacional', 'Inglés Turístico III', 'Gestión de Calidad Hotelera', 'Metodología de la Investigación', 'Emprendedorismo Turístico', 'Práctica Profesional', 'Trabajo Final'] } },
];

const NOMBRES = [
  ['Juan', 'Pérez'], ['María', 'Gómez'], ['Carlos', 'Rodríguez'], ['Lucía', 'Fernández'],
  ['Diego', 'López'], ['Sofía', 'Martínez'], ['Martín', 'García'], ['Valentina', 'Sánchez'],
  ['Nicolás', 'Romero'], ['Camila', 'Torres'], ['Federico', 'Díaz'], ['Julieta', 'Ruiz'],
  ['Matías', 'Sosa'], ['Florencia', 'Ramírez'], ['Agustín', 'Castro'], ['Micaela', 'Ortiz'],
  ['Tomás', 'Silva'], ['Antonella', 'Morales'], ['Franco', 'Vargas'], ['Belén', 'Herrera'],
];

const CALLES = ['Av. Corrientes', 'Av. Rivadavia', 'Av. Santa Fe', 'Av. Belgrano', 'Av. San Martín', 'Av. Mitre', 'Av. Sarmiento', 'Av. 9 de Julio', 'Calle Florida', 'Calle Lavalle', 'Calle Suipacha', 'Calle Esmeralda'];
const CIUDADES = ['CABA', 'La Plata', 'Rosario', 'Córdoba', 'Mendoza', 'Mar del Plata', 'San Miguel', 'Quilmes'];
const PROVINCIAS = ['Buenos Aires', 'CABA', 'Santa Fe', 'Córdoba', 'Mendoza', 'Tucumán', 'Salta', 'Entre Ríos'];

const generarCodigoResolucion = (codigoBase, anio) => `RES-${codigoBase}-${anio}-V1`;
const generarCodigoMateria = (codigoBase, numeroAnio, indice) => `${codigoBase}${numeroAnio}${String(indice + 1).padStart(2, '0')}`;

async function limpiar() {
  titulo('LIMPIANDO BASE');
  await prisma.examenNivelatorio.deleteMany();
  await prisma.equivalencia.deleteMany();
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

async function crearEstructuraAcademica() {
  titulo('CREANDO ESTRUCTURA ACADÉMICA');
  const resultados = [];

  for (const t of TITULOS) {
    const tituloCreado = await prisma.titulo.create({ data: { nombre: t.nombre, nivel: t.nivel, duracionAnios: t.duracionAnios, estado: 'ACTIVO' } });
    const resolucion = await prisma.resolucion.create({ data: { tituloId: tituloCreado.id, numero: '001', anioCreacion: 2026, codigo: generarCodigoResolucion(t.codigoBase, 2026), fechaInicioVigencia: new Date('2026-03-01'), estado: 'VIGENTE', observaciones: 'Resolución inicial generada por el seeder' } });

    const materiasPorAnio = {};
    for (let numeroAnio = 1; numeroAnio <= t.duracionAnios; numeroAnio++) {
      const anio = await prisma.anioCurricular.create({ data: { resolucionId: resolucion.id, numeroAnio, nombre: numeroAnio === 1 ? 'Primer año' : numeroAnio === 2 ? 'Segundo año' : 'Tercer año' } });
      const materiasNombres = t.materias[numeroAnio];
      const materiasCreadas = [];
      for (let i = 0; i < materiasNombres.length; i++) {
        const materia = await prisma.materia.create({ data: { anioCurricularId: anio.id, nombre: materiasNombres[i], codigo: generarCodigoMateria(t.codigoBase, numeroAnio, i), cargaHoraria: 96, tipoCursada: 'ANUAL' } });
        materiasCreadas.push(materia);
      }
      materiasPorAnio[numeroAnio] = materiasCreadas;
    }

    for (let numeroAnio = 2; numeroAnio <= t.duracionAnios; numeroAnio++) {
      const materiasActuales = materiasPorAnio[numeroAnio];
      const materiasAnteriores = materiasPorAnio[numeroAnio - 1];
      for (const materiaActual of materiasActuales) {
        for (const materiaAnterior of materiasAnteriores) {
          await prisma.correlatividad.create({ data: { materiaId: materiaActual.id, materiaRequeridaId: materiaAnterior.id, tipo: 'PARA_CURSAR' } });
          await prisma.correlatividad.create({ data: { materiaId: materiaActual.id, materiaRequeridaId: materiaAnterior.id, tipo: 'PARA_RENDIR_FINAL' } });
        }
      }
    }

    resultados.push({ titulo: tituloCreado, resolucion, materiasPorAnio });
    log(`✅ ${t.nombre}`);
  }
  return resultados;
}

async function crearAlumnos(estructuras) {
  titulo('CREANDO ALUMNOS E INSCRIPCIONES');
  const alumnosCreados = [];

  for (let i = 0; i < 20; i++) {
    const [nombre, apellido] = NOMBRES[i];
    const estructura = estructuras[i % estructuras.length];
    const perfil = i % 5;

    let anioNacimiento;
    if (perfil === 0 || perfil === 4) anioNacimiento = 1998 + (i % 3);
    else anioNacimiento = 1992 + (i % 3);

    const tieneSecundarioCompleto = perfil === 0 || perfil === 1 || perfil === 4;

    const alumno = await prisma.alumno.create({
      data: {
        dni: `30${String(10000000 + i).padStart(8, '0')}`,
        nombre, apellido,
        email: `${nombre.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')}.${apellido.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')}${i}@example.com`,
        fechaNacimiento: new Date(`${anioNacimiento}-0${(i % 9) + 1}-15`),
        domicilioCalle: CALLES[i % CALLES.length],
        domicilioNumero: String(100 + i * 7),
        domicilioCiudad: CIUDADES[i % CIUDADES.length],
        domicilioProvincia: PROVINCIAS[i % PROVINCIAS.length],
        domicilioCP: String(1000 + (i * 13) % 9000),
        tienePartidaNacimiento: true,
        tieneAnaliticoSecundario: tieneSecundarioCompleto,
        tieneAnaliticoIncompleto: !tieneSecundarioCompleto && (perfil === 2 || perfil === 3),
        tieneCertificado7mo: !tieneSecundarioCompleto && (perfil === 2 || perfil === 3),
        tieneCUD: perfil === 4,
      },
    });

    if (perfil === 2) {
      await prisma.examenNivelatorio.create({ data: { alumnoId: alumno.id, fecha: new Date('2026-02-15'), resultado: 'APROBADO', nota: 7.5, observaciones: 'Aprobó el examen nivelatorio en la primera instancia.' } });
    } else if (perfil === 3) {
      await prisma.examenNivelatorio.create({ data: { alumnoId: alumno.id, fecha: new Date('2026-02-15'), resultado: 'PENDIENTE', nota: null, observaciones: 'Examen pendiente de rendir.' } });
    }

    alumnosCreados.push({ alumno, estructura, indice: i, perfil });
    log(`✅ ${nombre} ${apellido} → ${estructura.titulo.nombre} (perfil ${perfil})`);
  }
  return alumnosCreados;
}

async function crearInscripciones(alumnosCreados) {
  titulo('CREANDO INSCRIPCIONES');
  const creadas = [];

  for (const { alumno, estructura, perfil } of alumnosCreados) {
    if (perfil === 3) {
      log(`⚠️  ${alumno.nombre} ${alumno.apellido} → SIN INSCRIPCIÓN (no cumple admisión)`);
      continue;
    }

    const inscripcion = await prisma.inscripcion.create({
      data: { alumnoId: alumno.id, tituloId: estructura.titulo.id, resolucionId: estructura.resolucion.id, fechaInscripcion: new Date('2026-03-01'), estado: 'ACTIVA' },
    });

    creadas.push({ alumno, inscripcion, estructura, perfil });
    log(`✅ ${alumno.nombre} ${alumno.apellido} inscripto en ${estructura.titulo.nombre}`);
  }
  return creadas;
}

async function crearCursadas(inscripcionesCreadas) {
  titulo('CREANDO CURSADAS');

  for (const { inscripcion, estructura, perfil, alumno } of inscripcionesCreadas) {
    const { materiasPorAnio } = estructura;

    const crearCursada = async (materiaId, estado, notaCursada = null, notaFinal = null) => {
      await prisma.cursadaMateria.create({ data: { inscripcionId: inscripcion.id, materiaId, estado, notaCursada, notaFinal, fechaEstado: new Date('2026-07-01') } });
    };

    if (perfil === 0) {
      for (const m of materiasPorAnio[1]) await crearCursada(m.id, 'REGULAR', 7.5, null);
      for (const m of materiasPorAnio[2]) await crearCursada(m.id, 'EN_CURSO');
    } else if (perfil === 1) {
      for (const m of materiasPorAnio[1]) await crearCursada(m.id, 'APROBADA', 8, 8);
      for (const m of materiasPorAnio[2]) await crearCursada(m.id, 'REGULAR', 7, null);
      for (const m of materiasPorAnio[3]) await crearCursada(m.id, 'EN_CURSO');
    } else if (perfil === 2) {
      for (const m of materiasPorAnio[1]) await crearCursada(m.id, 'APROBADA', 7, 7);
      for (const m of materiasPorAnio[2]) await crearCursada(m.id, 'EN_CURSO');
    } else if (perfil === 4) {
      const materias = materiasPorAnio[1];
      for (let j = 0; j < materias.length; j++) {
        if (j < 4) await crearCursada(materias[j].id, 'REGULAR', 7, null);
        else if (j < 6) await crearCursada(materias[j].id, 'APROBADA', 8, 8);
        else if (j < 7) await crearCursada(materias[j].id, 'LIBRE');
        else if (j < 8) await crearCursada(materias[j].id, 'DESAPROBADA', 3, null);
        else await crearCursada(materias[j].id, 'EN_CURSO');
      }
    }
    log(`✅ Cursadas para ${alumno.nombre} ${alumno.apellido} (perfil ${perfil})`);
  }
}

async function crearCertificados(inscripcionesCreadas) {
  titulo('CREANDO CERTIFICADOS');
  const candidatosParcial = inscripcionesCreadas.filter((i) => i.perfil === 1);
  for (const { alumno, estructura } of candidatosParcial) {
    const anio1 = await prisma.anioCurricular.findFirst({ where: { resolucionId: estructura.resolucion.id, numeroAnio: 1 } });
    await prisma.certificado.create({ data: { alumnoId: alumno.id, tituloId: estructura.titulo.id, resolucionId: estructura.resolucion.id, tipo: 'PARCIAL_ANIO', anioCurricularId: anio1.id, fechaEmision: new Date('2026-12-15'), estado: 'EMITIDO' } });
    log(`✅ Certificado PARCIAL_ANIO para ${alumno.nombre} ${alumno.apellido}`);
  }
}

async function crearEquivalencias(estructuras) {
  titulo('CREANDO EQUIVALENCIAS DE EJEMPLO');
  const software = estructuras.find((e) => e.titulo.nombre.includes('Desarrollo de Software'));
  const analisis = estructuras.find((e) => e.titulo.nombre.includes('Análisis de Sistemas'));

  if (software && analisis) {
    const progI_Soft = software.materiasPorAnio[1][0];
    const progI_Ana = analisis.materiasPorAnio[1][2];
    await prisma.equivalencia.create({ data: { materiaOrigenId: progI_Soft.id, materiaDestinoId: progI_Ana.id, observaciones: 'Programación I - contenidos equivalentes' } });
    log(`✅ Programación I (Software) ↔ Programación I (Análisis)`);

    const matI_Soft = software.materiasPorAnio[1][1];
    const matDisc_Ana = analisis.materiasPorAnio[1][1];
    await prisma.equivalencia.create({ data: { materiaOrigenId: matI_Soft.id, materiaDestinoId: matDisc_Ana.id, observaciones: 'Matemática I ↔ Matemática Discreta' } });
    log(`✅ Matemática I (Software) ↔ Matemática Discreta (Análisis)`);
  }
}

async function crearUsuarioAdmin() {
  titulo('CREANDO USUARIO ADMIN');
  const email = 'admin@plataforma.edu.ar';
  const passwordPlano = 'admin123';
  const passwordHash = await bcrypt.hash(passwordPlano, 10);
  log(`⚠️  Modelo Usuario aún no implementado. Datos listos:`);
  log(`   email: ${email}`);
  log(`   password: ${passwordPlano}`);
  log(`   rol: admin`);
}

async function main() {
  console.log('\n╔══════════════════════════════════════════════════════╗');
  console.log('║  SEEDER — Plataforma Académica                       ║');
  console.log('╚══════════════════════════════════════════════════════╝');

  const inicio = Date.now();
  await limpiar();
  const estructuras = await crearEstructuraAcademica();
  const alumnosCreados = await crearAlumnos(estructuras);
  const inscripcionesCreadas = await crearInscripciones(alumnosCreados);
  await crearCursadas(inscripcionesCreadas);
  await crearCertificados(inscripcionesCreadas);
  await crearEquivalencias(estructuras);
  await crearUsuarioAdmin();
  const duracion = ((Date.now() - inicio) / 1000).toFixed(2);
  console.log('\n╔══════════════════════════════════════════════════════╗');
  console.log('║  ✅ SEEDER COMPLETADO                                ║');
  console.log('╚══════════════════════════════════════════════════════╝');
  console.log(`\n⏱  Duración: ${duracion}s\n`);
}

main().catch((e) => { console.error('❌ Error en el seeder:', e); process.exit(1); }).finally(async () => { await prisma.$disconnect(); });
