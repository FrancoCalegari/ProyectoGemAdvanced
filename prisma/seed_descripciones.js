import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const DESCRIPCIONES = {
  'Tecnicatura Superior en Administración de Empresas':
    'Formación de 3 años orientada a la gestión integral de organizaciones públicas y privadas. Los egresados podrán desempeñarse en áreas de administración, recursos humanos, comercialización, finanzas y logística, tanto en empresas como en organismos estatales y ONGs. El plan de estudios combina fundamentos teóricos con prácticas profesionalizantes en contextos reales.',

  'Tecnicatura Superior en Análisis de Sistemas':
    'Carrera de 3 años que forma profesionales capaces de analizar, diseñar, desarrollar e implementar sistemas informáticos. Los egresados podrán trabajar en desarrollo de software, bases de datos, infraestructura, soporte técnico y gestión de proyectos tecnológicos, integrando equipos multidisciplinarios en empresas de cualquier rubro.',

  'Tecnicatura Superior en Desarrollo de Software':
    'Formación de 3 años enfocada en el desarrollo profesional de aplicaciones web, móviles y de escritorio. Los egresados dominarán lenguajes modernos, frameworks, bases de datos y metodologías ágiles, pudiendo insertarse en empresas de tecnología, startups o trabajar de forma freelance en proyectos nacionales e internacionales.',

  'Tecnicatura Superior en Enfermería':
    'Formación de 3 años que prepara profesionales para el cuidado integral de la salud de las personas, familias y comunidades. Los egresados podrán desempeñarse en hospitales, centros de salud, geriátricos, domicilios y áreas de prevención y promoción de la salud, trabajando en equipos interdisciplinarios.',

  'Tecnicatura Superior en Turismo y Hotelería':
    'Formación de 3 años orientada al diseño, gestión y comercialización de servicios turísticos y hoteleros. Los egresados podrán desempeñarse en agencias de viajes, hoteles, organismos de turismo, emprendimientos propios y áreas de planificación turística, con foco en sustentabilidad y desarrollo local.',
};

async function main() {
  console.log('Actualizando descripciones de carreras...\n');
  const titulos = await prisma.titulo.findMany();
  let actualizados = 0;
  let sinDescripcion = 0;

  for (const t of titulos) {
    const desc = DESCRIPCIONES[t.nombre];
    if (desc) {
      await prisma.titulo.update({ where: { id: t.id }, data: { descripcion: desc } });
      console.log(`  OK  ${t.nombre}`);
      actualizados++;
    } else {
      console.log(`  ?   ${t.nombre} (sin descripcion predefinida)`);
      sinDescripcion++;
    }
  }
  console.log(`\n${actualizados} titulos actualizados. ${sinDescripcion} sin descripcion.`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });