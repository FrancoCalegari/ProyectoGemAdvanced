import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// ============================================================
// Descripciones especificas (por nombre exacto)
// ============================================================
const ESPECIFICAS = {
  // ---- ADMINISTRACION DE EMPRESAS ----
  'Contabilidad I': 'Introducción a la tecnica contable. Registracion de operaciones, libro diario, mayor, balance de sumas y saldos, y elaboracion de estados contables basicos segun normativa vigente.',
  'Contabilidad II': 'Profundizacion en la contabilidad societaria y de gestion. Ajustes por inflacion, consolidacion de estados contables, analisis e interpretacion de la informacion financiera.',
  'Contabilidad Gerencial': 'Herramientas contables para la toma de decisiones directivas. Costeo ABC, analisis marginal, presupuestos, tablero de comando e indicadores de gestion.',
  'Matemática Financiera': 'Regimenes de interes simple y compuesto, descuentos, rentas, sistemas de amortizacion de prestamos y evaluacion financiera de proyectos de inversion.',
  'Introducción a la Administración': 'Evolucion del pensamiento administrativo, funciones de planeamiento, organizacion, direccion y control. La empresa como sistema y su entorno.',
  'Economía I': 'Principios de microeconomia. Oferta y demanda, elasticidad, teoria del consumidor, estructuras de mercado y formacion de precios.',
  'Economía II': 'Macroeconomia aplicada. PBI, inflacion, desempleo, politica fiscal y monetaria, comercio internacional y crecimiento economico.',
  'Derecho Privado': 'Nociones de derecho civil y comercial. Persona, obligaciones, contratos, sociedades y titulos de credito aplicados a la actividad empresarial.',
  'Derecho Laboral': 'Regimen laboral argentino. Contrato de trabajo, jornada, remuneraciones, licencias, extincion, sindicatos y negociacion colectiva.',
  'Informática Aplicada': 'Uso profesional de planillas de calculo, procesadores de texto y herramientas de presentacion. Introducción a sistemas de gestion (ERP/CRM).',
  'Comunicación Empresarial': 'Técnicas de comunicacion oral y escrita en el ambito corporativo. Redaccion de informes, correspondencia comercial, presentaciones y oratoria.',
  'Estadística I': 'Estadística descriptiva. Variables, tablas de frecuencia, medidas de tendencia central y dispersion, representaciones graficas y numeros indices.',
  'Estadística II': 'Estadística inferencial. Probabilidad, distribuciones, estimacion, pruebas de hipotesis y correlacion aplicadas a la gestion.',
  'Principios de Marketing': 'Conceptos fundamentales del marketing. Segmentacion, targeting, posicionamiento, mix comercial (4P) y comportamiento del consumidor.',
  'Marketing Estrategico': 'Planificacion comercial estrategica. Análisis FODA, investigacion de mercados, estrategias competitivas, marca y marketing digital.',
  'Costos y Presupuestos': 'Sistemas de costeo. Costos fijos y variables, punto de equilibrio, costos por ordenes y procesos, y elaboracion de presupuestos empresariales.',
  'Administración de Personal': 'Gestión del capital humano. Reclutamiento, seleccion, capacitacion, evaluacion de desempeno, liquidacion de sueldos y relaciones laborales.',
  'Sistemas de Información': 'Sistemas de informacion gerencial. Tipos de sistemas, ciclo de vida, bases de datos, business intelligence y su rol en la organizacion.',
  'Finanzas I': 'Introducción a las finanzas corporativas. Valor tiempo del dinero, valuacion de activos, riesgo y rendimiento, y decisiones de inversion.',
  'Finanzas II': 'Finanzas avanzadas. Estructura de capital, costo de capital, politica de dividendos, fusiones y adquisiciones, y finanzas internacionales.',
  'Auditoria': 'Fundamentos de auditoria. Normas, planificacion, evidencia, riesgos, control interno y elaboracion de informes de auditoria.',
  'Dirección Estrategica': 'Formulacion e implementacion de estrategias. Mision, vision, analisis competitivo, ventajas sostenibles y gestion del cambio.',
  'Comercio Internacional': 'Operaciones de importacion y exportacion. Incoterms, regimenes aduaneros, medios de pago internacionales y logistica.',
  'Gestión de Operaciones': 'Administración de la produccion y operaciones. Diseno de procesos, planificacion, calidad, Lean Manufacturing y Six Sigma.',
  'Emprendedorismo': 'Creación y desarrollo de emprendimientos. Modelo de negocio Canvas, validacion de ideas, plan de negocios y fuentes de financiamiento.',
  'Metodología de la Investigación': 'Métodos y tecnicas de investigacion cientifica. Planteo del problema, marco teorico, hipotesis, diseno metodologico y elaboracion de informes.',
  'Práctica Profesional': 'Práctica supervisada en organizaciones reales. Aplicación integrada de los conocimientos adquiridos a situaciones laborales concretas.',
  'Trabajo Final': 'Elaboracion y defensa de un trabajo integrador final que articula los saberes de la carrera con una problematica profesional real.',
  'Taller de Gestión I': 'Espacio practico de aplicacion. Resolución de casos empresariales, simulaciones de gestion y desarrollo de habilidades blandas.',
  'Taller de Gestión II': 'Profundizacion del taller. Análisis de casos complejos, juegos de empresa y trabajo en equipo multidisciplinario.',

  // ---- ANALISIS DE SISTEMAS ----
  'Introducción a los Sistemas': 'Concepto de sistema, enfoque sistemico, clasificacion, subsistemas y su aplicacion a las organizaciones y a las TICs.',
  'Matemática Discreta': 'Lógica proposicional, conjuntos, relaciones, funciones, induccion, recursion, grafos y arboles. Base matematica para computacion.',
  'Programación I': 'Fundamentos de programacion. Variables, tipos de datos, estructuras de control, funciones, arrays y algoritmos basicos.',
  'Programación II': 'Programación orientada a objetos. Clases, objetos, herencia, polimorfismo, encapsulamiento, excepciones y colecciones.',
  'Programación III': 'Programación avanzada. Patrones de diseno, programacion funcional, concurrencia, testing y buenas practicas de desarrollo.',
  'Álgebra Lineal': 'Matrices, determinantes, sistemas de ecuaciones, espacios vectoriales, transformaciones lineales y aplicaciones.',
  'Arquitectura de Computadoras': 'Organizacion y funcionamiento del hardware. CPU, memoria, perifericos, lenguaje de maquina y arquitecturas modernas.',
  'Ingles Técnico I': 'Comprension de textos tecnicos en ingles. Vocabulario informatico, lectura de documentacion y manuales tecnicos.',
  'Ingles Técnico II': 'Ingles tecnico intermedio. Redaccion de documentacion, especificaciones tecnicas y comunicacion profesional escrita.',
  'Lógica Computacional': 'Lógica de primer orden, sistemas formales, deduccion automatica, resolucion y aplicaciones a la inteligencia artificial.',
  'Sistemas Operativos': 'Procesos, hilos, planificacion de CPU, memoria, sistemas de archivos, entrada/salida y concurrencia.',
  'Comunicación Técnica': 'Redaccion de documentacion tecnica. Manuales, especificaciones, informes, y presentaciones tecnicas efectivas.',
  'Análisis y Diseno de Sistemas': 'Metodologías de analisis. Relevamiento, modelado UML, casos de uso, diagramas de clase y especificacion de requerimientos.',
  'Estructuras de Datos': 'Listas, pilas, colas, arboles, grafos, tablas hash, algoritmos de ordenamiento y busqueda, y analisis de complejidad.',
  'Bases de Datos I': 'Modelo relacional. Diseno, normalizacion, algebra relacional, SQL basico y gestion de transacciones.',
  'Bases de Datos II': 'Bases de datos avanzadas. SQL avanzado, optimizacion, indices, procedimientos almacenados, NoSQL y data warehousing.',
  'Redes de Computadoras': 'Modelos OSI y TCP/IP. Direccionamiento IP, protocolos, routing, switching, redes inalambricas y seguridad basica.',
  'Redes I': 'Introducción a las redes. Topologias, medios de transmision, protocolos de enlace, Ethernet y configuracion basica de red.',
  'Ingenieria de Software I': 'Proceso de desarrollo. Ciclo de vida, metodologias agiles (Scrum, Kanban), requisitos, diseno y testing.',
  'Ingenieria de Software II': 'Ingenieria avanzada. Arquitecturas, patrones, refactoring, integracion continua, DevOps y calidad de software.',
  'Sistemas de Información': 'Sistemas de informacion gerencial. Tipos de sistemas, ciclo de vida, bases de datos, business intelligence y su rol en la organizacion.',
  'Estadística Aplicada': 'Estadística aplicada a la informatica. Análisis de datos, probabilidad, muestreo, inferencia y visualizacion de datos.',
  'Arquitectura de Software': 'Diseno de arquitecturas. Capas, microservicios, patrones arquitectonicos, escalabilidad y atributos de calidad.',
  'Seguridad de la Información': 'Principios de seguridad. Criptografia, autenticacion, control de acceso, seguridad en redes, OWASP y gestion de incidentes.',
  'Seguridad Informática': 'Fundamentos de ciberseguridad. Amenazas, vulnerabilidades, analisis de riesgos, hardening y respuesta a incidentes.',
  'Gestión de Proyectos Informaticos': 'Dirección de proyectos. PMBOK, estimacion, planificacion, seguimiento, gestion de riesgos y equipos.',
  'Auditoria de Sistemas': 'Auditoria de TI. Normas, metodologia, evaluacion de controles, informes y cumplimiento (COBIT, ISO 27001).',
  'Inteligencia de Negocios': 'Business Intelligence. ETL, data warehouse, OLAP, dashboards, KPIs y analitica de datos para decisiones.',
  'Inteligencia Artificial': 'Fundamentos de IA. Busqueda, aprendizaje automatico, redes neuronales, procesamiento de lenguaje natural y etica.',
  'Cloud Computing': 'Computación en la nube. IaaS, PaaS, SaaS, contenedores, orquestacion, y despliegue en AWS/Azure/GCP.',
  'Taller de Sistemas I': 'Espacio practico de analisis y desarrollo de sistemas simples. Trabajo en equipo y metodologias agiles.',
  'Taller de Sistemas II': 'Taller avanzado. Desarrollo de un sistema completo aplicando todas las etapas del ciclo de vida.',
  'Taller de Base de Datos': 'Práctica intensiva de diseno, implementacion y consulta de bases de datos relacionales y no relacionales.',

  // ---- DESARROLLO DE SOFTWARE ----
  'Matemática I': 'Funciones, limites, derivadas e integrales. Aplicaciones al analisis de fenomenos y a la resolucion de problemas de ingenieria.',
  'Matemática II': 'Calculo multivariable, ecuaciones diferenciales, series y transformadas. Aplicaciones a la computacion y a la fisica.',
  'Álgebra': 'Estructuras algebraicas. Grupos, anillos, cuerpos, matrices y sistemas de ecuaciones lineales con aplicaciones.',
  'Introducción a la Informática': 'Conceptos basicos de hardware, software, sistemas operativos, redes y seguridad. Alfabetizacion digital.',
  'Lógica y Algoritmos': 'Pensamiento algoritmico. Pseudocodigo, diagramas de flujo, estructuras de control y resolucion de problemas.',
  'Sistemas Operativos I': 'Fundamentos de SO. Procesos, memoria, archivos, permisos, comandos basicos Linux y Windows.',
  'Sistemas Operativos II': 'SO avanzados. Concurrencia, scheduling, gestion de memoria virtual, sistemas distribuidos y virtualizacion.',
  'Programación Web I': 'Desarrollo web frontend. HTML, CSS, JavaScript, responsive design, DOM y consumo de APIs.',
  'Programación Web II': 'Desarrollo web fullstack. Frameworks frontend (React/Vue), backend (Node/Python), bases de datos y despliegue.',
  'Comunicación y Redaccion': 'Habilidades comunicativas. Redaccion de informes tecnicos, documentacion de software y presentaciones.',
  'Análisis de Sistemas': 'Relevamiento y analisis de requerimientos. Modelado de procesos, UML, casos de uso y documentacion funcional.',
  'Taller de Programación': 'Práctica intensiva de programacion. Resolución de problemas, katas, pair programming y proyectos grupales.',

  // ---- ENFERMERIA ----
  'Anatomia y Fisiologia I': 'Estructura y funcion del cuerpo humano. Sistemas oseo, muscular, nervioso y endocrino. Terminologia anatomica.',
  'Anatomia y Fisiologia II': 'Continuacion del estudio del cuerpo humano. Sistemas cardiovascular, respiratorio, digestivo, urinario y reproductor.',
  'Biologia': 'Biologia celular y molecular. Estructura celular, metabolismo, genetica, y procesos biologicos fundamentales.',
  'Química Biologica': 'Química aplicada a las ciencias de la salud. Biomoleculas, enzimas, metabolismo y equilibrio acido-base.',
  'Fundamentos de Enfermeria': 'Bases del cuidado enfermero. Proceso de atencion de enfermeria (PAE), necesidades basicas, higiene, movilizacion y signos vitales.',
  'Salud Pública I': 'Conceptos de salud publica. Determinantes sociales, promocion, prevencion, epidemiologia y sistema sanitario argentino.',
  'Salud Pública II': 'Salud publica avanzada. Programas sanitarios, atencion primaria, vigilancia epidemiologica y educacion para la salud.',
  'Psicologia General': 'Introducción a la psicologia. Procesos cognitivos, emocionales, personalidad y su relacion con la salud.',
  'Psicologia Evolutiva': 'Desarrollo humano a lo largo del ciclo vital. Infancia, adolescencia, adultez y vejez. Crisis vitales.',
  'Nutricion': 'Nutrientes, requerimientos, alimentacion saludable, dietoterapia y educacion alimentaria.',
  'Microbiologia': 'Microorganismos. Bacterias, virus, hongos y parasitos. Infecciones, antisepsia, asepsia y esterilizacion.',
  'Etica Profesional': 'Principios bioeticos. Autonomia, beneficencia, no maleficencia y justicia. Código de etica de enfermeria.',
  'Etica y Deontologia': 'Deontologia profesional. Responsabilidades legales del enfermero, secreto profesional y consentimiento informado.',
  'Farmacologia': 'Farmacos. Farmacocinetica, farmacodinamia, grupos terapeuticos, administracion de medicamentos y efectos adversos.',
  'Enfermeria Clinica I': 'Cuidado de pacientes adultos. Valoracion, diagnostico, planificacion, ejecucion y evaluacion de cuidados en clinica medica.',
  'Enfermeria Clinica II': 'Cuidados complejos. Pacientes cronicos, terminales, cuidados intensivos y alta complejidad.',
  'Cuidados Paliativos': 'Atención integral al final de la vida. Control del dolor, cuidados fisicos, psicologicos, sociales y espirituales.',
  'Enfermeria Materno-Infantil': 'Cuidado de la mujer embarazada, parto, puerperio y recien nacido. Control prenatal y puericultura.',
  'Bioestadistica': 'Estadística aplicada a la salud. Tasas, indicadores, estudios epidemiologicos y analisis de datos sanitarios.',
  'Enfermeria Quirurgica': 'Cuidado perioperatorio. Preparacion prequirurgica, transoperatorio y recuperacion postquirurgica.',
  'Salud Mental': 'Cuidado de la salud mental. Trastornos mentales, abordaje integral, contencion y trabajo interdisciplinario.',
  'Emergentologia': 'Urgencias y emergencias. Triage, RCP, politraumatismos, intoxicaciones y atencion inicial del paciente critico.',
  'Enfermeria Comunitaria': 'Enfermeria en la comunidad. Visitas domiciliarias, programas de salud, trabajo con familias y redes comunitarias.',
  'Gestión de Servicios de Salud': 'Administración de servicios. Organizacion hospitalaria, gestion de recursos, calidad y seguridad del paciente.',
  'Taller de Prácticas I': 'Práctica supervisada en instituciones de salud. Cuidados basicos, comunicacion con el paciente y trabajo en equipo.',
  'Taller de Prácticas II': 'Práctica avanzada. Cuidados de mediana complejidad, administracion de medicamentos y registro clinico.',

  // ---- TURISMO Y HOTELERIA ----
  'Introducción al Turismo': 'Conceptos basicos del turismo. Tipos, actores, motivaciones, impacto economico, social y cultural.',
  'Geografia Turistica I': 'Geografia aplicada al turismo. Regiones, climas, relieves, recursos turisticos de Argentina y America.',
  'Geografia Turistica II': 'Geografia turistica mundial. Destinos, atractivos, rutas y tendencias del turismo internacional.',
  'Historia del Turismo': 'Evolucion historica del turismo. Del Grand Tour al turismo masivo, y nuevas modalidades contemporaneas.',
  'Patrimonio Cultural': 'Patrimonio tangible e intangible. Conservacion, interpretacion, museos y puesta en valor turistico.',
  'Patrimonio Natural': 'Patrimonio natural. Areas protegidas, biodiversidad, geoparques y turismo sustentable.',
  'Ingles Turistico I': 'Ingles aplicado al turismo. Vocabulario, atencion al cliente, reservas y comunicacion basica con turistas.',
  'Ingles Turistico II': 'Ingles intermedio. Redaccion de itinerarios, descripcion de destinos y comunicacion profesional.',
  'Ingles Turistico III': 'Ingles avanzado. Negociacion, gestion de quejas, presentaciones y correspondencia profesional.',
  'Frances Turistico I': 'Frances basico aplicado al turismo. Vocabulario, frases utiles y atencion al cliente.',
  'Frances Turistico II': 'Frances intermedio. Comunicación con turistas, descripcion de servicios y cultura francesa.',
  'Comunicación y Atención al Cliente': 'Técnicas de comunicacion y servicio. Empatia, escucha activa, manejo de quejas y fidelizacion.',
  'Administración Hotelera I': 'Gestión hotelera basica. Departamentos, recepcion, housekeeping, alimentos y bebidas.',
  'Administración Hotelera II': 'Gestión hotelera avanzada. Revenue management, marketing hotelero, calidad y sostenibilidad.',
  'Contabilidad Básica': 'Contabilidad aplicada al turismo. Registracion, balances, costos y analisis financiero de empresas turisticas.',
  'Turismo Rural y de Aventura': 'Modalidades alternativas. Turismo rural, ecoturismo, aventura, y su gestion sustentable.',
  'Operacion de Agencias de Viajes': 'Gestión de agencias. Reservas, emision de tickets, paquetes, GDS y legislacion aplicable.',
  'Marketing Turistico': 'Marketing aplicado al turismo. Segmentacion, promocion, marca destino y marketing digital.',
  'Legislacion Turistica': 'Marco legal del turismo. Leyes, regulaciones, contratos turisticos y responsabilidad.',
  'Planificacion Turistica': 'Planificacion de destinos. Diagnostico, estrategias, desarrollo sustentable y gestion publica.',
  'Turismo Sustentable': 'Sustentabilidad turistica. Impactos, capacidad de carga, certificaciones y buenas practicas.',
  'Gestión de Eventos': 'Organizacion de eventos. Tipos, planificacion, presupuesto, logistica y protocolo.',
  'Turismo Internacional': 'Turismo global. Mercados emisores, tendencias, organismos internacionales y geopolitica del turismo.',
  'Gestión de Calidad Hotelera': 'Sistemas de calidad. Normas ISO, auditoria, indicadores y excelencia en el servicio.',
  'Emprendedorismo Turistico': 'Creación de emprendimientos turisticos. Modelo de negocio, financiamiento y marketing.',
  'Taller de Prácticas I': 'Práctica supervisada en empresas turisticas. Atención al cliente, guiado y operacion basica.',
  'Taller de Prácticas II': 'Práctica avanzada. Gestión de servicios, coordinacion de grupos y resolucion de problemas.',
};

// ============================================================
// Descripciones genericas por patron (si no matchea especifico)
// ============================================================
function generarGenerica(nombre, titulo, anio) {
  // Patrones por palabra clave
  const lower = nombre.toLowerCase();

  if (lower.includes('taller')) {
    return `Espacio de formacion practica donde se aplican los conocimientos teoricos de ${anio}o año a situaciones reales del campo profesional. Se prioriza el trabajo en equipo, la resolucion de problemas y el desarrollo de competencias especificas.`;
  }
  if (lower.includes('practica profesional')) {
    return `Practica supervisada en organizaciones reales. Permite integrar los saberes adquiridos durante la carrera en contextos laborales concretos, desarrollando autonomia, responsabilidad y juicio profesional.`;
  }
  if (lower.includes('trabajo final')) {
    return `Elaboracion y defensa de un trabajo integrador final. El estudiante articula los conocimientos de la carrera para abordar una problematica profesional real, bajo supervision docente.`;
  }
  if (lower.includes('metodologia de la investigacion')) {
    return `Introduccion a la investigacion cientifica. Planteo del problema, marco teorico, hipotesis, diseno metodologico, recoleccion y analisis de datos, y elaboracion de informes academicos.`;
  }
  if (lower.includes('ingles')) {
    return `Desarrollo de competencias comunicativas en ingles orientadas al campo profesional. Comprension lectora, vocabulario tecnico y produccion escrita aplicada a la especialidad.`;
  }
  if (lower.includes('frances')) {
    return `Desarrollo de competencias comunicativas en frances orientadas al campo profesional. Vocabulario especifico, comprension y produccion oral y escrita.`;
  }
  if (lower.includes('informatica') || lower.includes('computacion')) {
    return `Uso profesional de herramientas informaticas. Procesadores de texto, planillas de calculo, presentaciones y software especifico de la disciplina.`;
  }
  if (lower.includes('estadistica')) {
    return `Herramientas estadisticas aplicadas a la disciplina. Recoleccion, organizacion, analisis e interpretacion de datos para la toma de decisiones profesionales.`;
  }
  if (lower.includes('matematica')) {
    return `Desarrollo del pensamiento logico-matematico. Conceptos fundamentales, resolucion de problemas y aplicaciones al campo profesional especifico.`;
  }

  // Fallback ultra generico
  return `Materia del plan de estudios de ${titulo} (${anio}o año). Aporta fundamentos teoricos y herramientas practicas para la formacion profesional del estudiante, en articulacion con las demas asignaturas de la carrera.`;
}

// ============================================================
// Objetivos genericos (mismo patron para todas)
// ============================================================
function generarObjetivos(nombre, titulo, anio) {
  return `Que el estudiante:
- Comprenda los conceptos fundamentales de ${nombre}.
- Desarrolle capacidades para aplicar esos conceptos en situaciones profesionales concretas.
- Adquiera herramientas metodologicas propias de la disciplina.
- Fortalezca el pensamiento critico y la autonomia en el aprendizaje.
- Pueda articular esta materia con los demas espacios curriculares de ${anio}o año de ${titulo}.`;
}

// ============================================================
// Contenidos minimos genericos
// ============================================================
function generarContenidos(nombre) {
  return `Unidad 1: Introduccion y conceptos basicos de ${nombre}.
Unidad 2: Marco teorico y referentes principales.
Unidad 3: Metodologias y herramientas de aplicacion.
Unidad 4: Casos practicos y ejercitacion.
Unidad 5: Integracion y evaluacion de aprendizajes.`;
}

// ============================================================
// MAIN
// ============================================================
async function main() {
  console.log('Actualizando descripciones de materias...\n');

  const materias = await prisma.materia.findMany({
    include: {
      anioCurricular: {
        include: { resolucion: { include: { titulo: true } } },
      },
    },
  });

  let especificas = 0;
  let genericas = 0;
  let sinCambios = 0;

  for (const m of materias) {
    // Si ya tiene descripcion y contenidos cargados, no sobreescribir
    if (m.descripcion && m.contenidosMinimos && m.objetivos) {
      sinCambios++;
      continue;
    }

    const titulo = m.anioCurricular?.resolucion?.titulo?.nombre || 'la carrera';
    const anio = m.anioCurricular?.numeroAnio || 1;

    let descripcion;
    if (ESPECIFICAS[m.nombre]) {
      descripcion = ESPECIFICAS[m.nombre];
      especificas++;
    } else {
      descripcion = generarGenerica(m.nombre, titulo, anio);
      genericas++;
    }

    const objetivos = m.objetivos || generarObjetivos(m.nombre, titulo, anio);
    const contenidosMinimos = m.contenidosMinimos || generarContenidos(m.nombre);

    await prisma.materia.update({
      where: { id: m.id },
      data: {
        descripcion,
        objetivos,
        contenidosMinimos,
      },
    });
  }

  console.log(`  OK  ${especificas} materias con descripcion especifica`);
  console.log(`  OK  ${genericas} materias con descripcion generica`);
  console.log(`  --  ${sinCambios} materias ya tenian info cargada (sin cambios)`);
  console.log(`\nTotal procesadas: ${materias.length}`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });