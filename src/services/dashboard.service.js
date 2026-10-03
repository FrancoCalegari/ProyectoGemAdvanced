import prisma from '../config/db.js';

export class DashboardService {
  // ============================================================
  // RESUMEN GENERAL (para tarjetas KPI)
  // ============================================================
  static async resumen() {
    const hoy = new Date();
    hoy.setUTCHours(0, 0, 0, 0);

    const hace30Dias = new Date(hoy);
    hace30Dias.setDate(hace30Dias.getDate() - 30);

    const en7Dias = new Date(hoy);
    en7Dias.setDate(en7Dias.getDate() + 7);

    const [
      totalAlumnos,
      alumnosActivos,
      alumnosNuevosMes,
      cursadasEnCurso,
      mesasProximas,
      mesasEstaSemana,
      certificadosMes,
      licenciasPendientes,
      solicitudesPendientes,
    ] = await Promise.all([
      prisma.alumno.count(),
      prisma.alumno.count({ where: { estadoAlumno: 'ACTIVO' } }),
      prisma.alumno.count({ where: { id: { not: undefined } } }).catch(() => 0), // fallback
      prisma.cursadaMateria.count({ where: { estado: 'EN_CURSO' } }),
      prisma.mesaExamen.count({
        where: {
          estado: 'PROGRAMADA',
          fecha: { gte: hoy, lte: en7Dias },
        },
      }),
      prisma.mesaExamen.count({
        where: {
          estado: 'PROGRAMADA',
          fecha: { gte: hoy, lte: en7Dias },
        },
      }),
      prisma.certificado.count({
        where: { fechaEmision: { gte: hace30Dias } },
      }),
      prisma.licencia.count({ where: { estado: 'PENDIENTE' } }),
      prisma.solicitud.count({ where: { estado: 'PENDIENTE' } }),
    ]);

    return {
      alumnos: {
        total: totalAlumnos,
        activos: alumnosActivos,
        nuevosMes: alumnosNuevosMes,
      },
      cursadas: {
        enCurso: cursadasEnCurso,
      },
      mesas: {
        proximas: mesasProximas,
        estaSemana: mesasEstaSemana,
      },
      certificados: {
        mes: certificadosMes,
      },
      alertas: {
        licenciasPendientes,
        solicitudesPendientes,
      },
    };
  }

  // ============================================================
  // ACTIVIDAD RECIENTE
  // ============================================================
  static async actividad() {
    const [ultimosAlumnos, ultimasMesas, ultimosCertificados] = await Promise.all([
      prisma.alumno.findMany({
        orderBy: { fechaNacimiento: 'desc' },
        take: 5,
        select: {
          id: true,
          nombre: true,
          apellido: true,
          dni: true,
          email: true,
          estadoAlumno: true,
          fechaNacimiento: true,
        },
      }),
      prisma.mesaExamen.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
          id: true,
          tipoMesa: true,
          fecha: true,
          hora: true,
          aula: true,
          estado: true,
          materia: { select: { nombre: true, codigo: true } },
        },
      }),
      prisma.certificado.findMany({
        orderBy: { fechaEmision: 'desc' },
        take: 5,
        select: {
          id: true,
          tipo: true,
          estado: true,
          fechaEmision: true,
          alumno: { select: { nombre: true, apellido: true } },
        },
      }),
    ]);

    return {
      ultimosAlumnos,
      ultimasMesas,
      ultimosCertificados,
    };
  }

  // ============================================================
  // ALUMNOS POR MES (para gráfico de línea)
  // ============================================================
  static async alumnosPorMes() {
    // Devuelve los alumnos agrupados por mes de nacimiento (ya que no hay createdAt)
    const alumnos = await prisma.alumno.findMany({
      select: { fechaNacimiento: true },
    });

    const porMes = {};
    for (const a of alumnos) {
      const d = new Date(a.fechaNacimiento);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      porMes[key] = (porMes[key] || 0) + 1;
    }

    return Object.entries(porMes)
      .map(([mes, cantidad]) => ({ mes, cantidad }))
      .sort((a, b) => a.mes.localeCompare(b.mes))
      .slice(-12);
  }
}