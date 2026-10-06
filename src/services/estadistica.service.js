import prisma from '../config/db.js';
function normalizarFecha(f) {
  if (!f) return null;
  const d = new Date(f);
  if (isNaN(d.getTime())) return null;
  d.setUTCHours(0, 0, 0, 0);
  return d;
}
function rangoWhere(desde, hasta) {
  if (!desde && !hasta) return null;
  const w = {};
  if (desde) w.gte = normalizarFecha(desde);
  if (hasta) w.lte = normalizarFecha(hasta);
  return w;
}
export class EstadisticaService {
  // ============================================================
  // ALUMNOS
  // ============================================================
  static async alumnos(desde, hasta) {
    // NOTA: el modelo Alumno NO tiene createdAt. Filtramos por fechaNacimiento
    // si hay rango, o devolvemos todos.
    const where = {};
    const rango = rangoWhere(desde, hasta);
    if (rango) where.fechaNacimiento = rango;
    const alumnos = await prisma.alumno.findMany({
      where,
      select: {
        id: true,
        estadoAlumno: true,
        inscripciones: {
          where: { estado: 'ACTIVA' },
          select: { titulo: { select: { nombre: true } } },
        },
      },
    });
    const porEstado = {};
    for (const a of alumnos) {
      porEstado[a.estadoAlumno] = (porEstado[a.estadoAlumno] || 0) + 1;
    }
    const porTitulo = {};
    for (const a of alumnos) {
      for (const i of a.inscripciones) {
        const nombre = i.titulo?.nombre || 'Sin titulo';
        porTitulo[nombre] = (porTitulo[nombre] || 0) + 1;
      }
    }
    const total = alumnos.length;
    return {
      total,
      porEstado: Object.entries(porEstado).map(([estado, cantidad]) => ({ estado, cantidad })),
      porTitulo: Object.entries(porTitulo)
        .map(([titulo, cantidad]) => ({ titulo, cantidad }))
        .sort((a, b) => b.cantidad - a.cantidad),
      porcentajes: {
        activos: total > 0 ? Math.round(((porEstado.ACTIVO || 0) / total) * 100) : 0,
        egresados: total > 0 ? Math.round(((porEstado.EGRESADO || 0) / total) * 100) : 0,
        bajas: total > 0 ? Math.round(((porEstado.BAJA || 0) / total) * 100) : 0,
        inactivos: total > 0 ? Math.round(((porEstado.INACTIVO || 0) / total) * 100) : 0,
      },
    };
  }
  // ============================================================
  // CURSADAS
  // ============================================================
  static async cursadas(desde, hasta) {
    const where = {};
    const rango = rangoWhere(desde, hasta);
    if (rango) where.fechaEstado = rango;
    const cursadas = await prisma.cursadaMateria.findMany({
      where,
      select: {
        estado: true,
        notaCursada: true,
        notaFinal: true,
        materia: { select: { id: true, nombre: true, codigo: true } },
      },
    });
    const porEstado = {};
    for (const c of cursadas) {
      porEstado[c.estado] = (porEstado[c.estado] || 0) + 1;
    }
    const total = cursadas.length;
    const aprobadas = porEstado.APROBADA || 0;
    const desaprobadas = porEstado.DESAPROBADA || 0;
    // Por materia
    const porMateria = {};
    for (const c of cursadas) {
      const key = c.materia?.nombre || 'Sin materia';
      if (!porMateria[key]) porMateria[key] = { total: 0, aprobadas: 0, desaprobadas: 0 };
      porMateria[key].total++;
      if (c.estado === 'APROBADA') porMateria[key].aprobadas++;
      if (c.estado === 'DESAPROBADA') porMateria[key].desaprobadas++;
    }
    // Promedio de notas
    const notas = cursadas.map((c) => c.notaFinal || c.notaCursada).filter((n) => n !== null);
    const promedio = notas.length > 0 ? notas.reduce((a, b) => a + Number(b), 0) / notas.length : 0;
    return {
      total,
      porEstado: Object.entries(porEstado).map(([estado, cantidad]) => ({ estado, cantidad })),
      porcentajeAprobacion: total > 0 ? Math.round((aprobadas / total) * 100) : 0,
      porcentajeDesaprobacion: total > 0 ? Math.round((desaprobadas / total) * 100) : 0,
      promedioNotas: Math.round(promedio * 100) / 100,
      porMateria: Object.entries(porMateria)
        .map(([materia, datos]) => ({ materia, ...datos, porcentaje: datos.total > 0 ? Math.round((datos.aprobadas / datos.total) * 100) : 0 }))
        .sort((a, b) => b.total - a.total)
        .slice(0, 20),
    };
  }
  // ============================================================
  // ASISTENCIAS
  // ============================================================
  static async asistencias(desde, hasta) {
    const where = {};
    const rango = rangoWhere(desde, hasta);
    if (rango) where.fecha = rango;
    const asistencias = await prisma.asistencia.findMany({
      where,
      select: { estado: true, fecha: true },
    });
    const porEstado = {};
    for (const a of asistencias) {
      porEstado[a.estado] = (porEstado[a.estado] || 0) + 1;
    }
    const total = asistencias.length;
    const presentes = porEstado.PRESENTE || 0;
    const ausentes = porEstado.AUSENTE || 0;
    const justificados = porEstado.JUSTIFICADO || 0;
    const efectivas = presentes + justificados;
    return {
      total,
      porEstado: Object.entries(porEstado).map(([estado, cantidad]) => ({ estado, cantidad })),
      porcentajeAsistencia: total > 0 ? Math.round((efectivas / total) * 100) : 0,
      porcentajeInasistencia: total > 0 ? Math.round((ausentes / total) * 100) : 0,
      presentes,
      ausentes,
      justificados,
    };
  }
  // ============================================================
  // CLASES SUSPENDIDAS
  // ============================================================
  static async clasesSuspendidas(desde, hasta) {
    const where = {};
    const rango = rangoWhere(desde, hasta);
    if (rango) where.fecha = rango;
    const clases = await prisma.claseSuspendida.findMany({
      where,
      select: { motivo: true, fecha: true, profesorId: true },
    });
    const porMotivo = {};
    for (const c of clases) {
      porMotivo[c.motivo] = (porMotivo[c.motivo] || 0) + 1;
    }
    return {
      total: clases.length,
      porMotivo: Object.entries(porMotivo).map(([motivo, cantidad]) => ({ motivo, cantidad })),
    };
  }
  // ============================================================
  // MESAS DE EXAMEN
  // ============================================================
  static async mesas(desde, hasta) {
    const where = {};
    const rango = rangoWhere(desde, hasta);
    if (rango) where.fecha = rango;
    const mesas = await prisma.mesaExamen.findMany({
      where,
      select: { tipoMesa: true, estado: true, fecha: true },
    });
    const porTipo = {};
    const porEstado = {};
    for (const m of mesas) {
      porTipo[m.tipoMesa] = (porTipo[m.tipoMesa] || 0) + 1;
      porEstado[m.estado] = (porEstado[m.estado] || 0) + 1;
    }
    // Inscripciones a mesas en el rango
    const inscWhere = {};
    if (rango) inscWhere.fechaInscripcion = rango;
    const inscripciones = await prisma.inscripcionMesa.findMany({
      where: inscWhere,
      select: { estado: true, nota: true },
    });
    const estadosIns = {};
    for (const i of inscripciones) {
      estadosIns[i.estado] = (estadosIns[i.estado] || 0) + 1;
    }
    const totalIns = inscripciones.length;
    const presentes = estadosIns.PRESENTE || 0;
    const ausentes = estadosIns.AUSENTE || 0;
    return {
      total: mesas.length,
      porTipo: Object.entries(porTipo).map(([tipo, cantidad]) => ({ tipo, cantidad })),
      porEstado: Object.entries(porEstado).map(([estado, cantidad]) => ({ estado, cantidad })),
      inscripciones: {
        total: totalIns,
        porEstado: Object.entries(estadosIns).map(([estado, cantidad]) => ({ estado, cantidad })),
        porcentajePresentismo: totalIns > 0 ? Math.round((presentes / totalIns) * 100) : 0,
        presentes,
        ausentes,
      },
    };
  }
  // ============================================================
  // CERTIFICADOS
  // ============================================================
  static async certificados(desde, hasta) {
    const where = {};
    const rango = rangoWhere(desde, hasta);
    if (rango) where.fechaEmision = rango;
    const certs = await prisma.certificado.findMany({
      where,
      select: { tipo: true, estado: true },
    });
    const porTipo = {};
    const porEstado = {};
    for (const c of certs) {
      porTipo[c.tipo] = (porTipo[c.tipo] || 0) + 1;
      porEstado[c.estado] = (porEstado[c.estado] || 0) + 1;
    }
    // Presentados
    const presWhere = {};
    if (rango) presWhere.createdAt = rango;
    const presentados = await prisma.certificadoPresentado.findMany({
      where: presWhere,
      select: { tipo: true, estado: true },
    });
    const presPorEstado = {};
    for (const p of presentados) {
      presPorEstado[p.estado] = (presPorEstado[p.estado] || 0) + 1;
    }
    return {
      total: certs.length,
      porTipo: Object.entries(porTipo).map(([tipo, cantidad]) => ({ tipo, cantidad })),
      porEstado: Object.entries(porEstado).map(([estado, cantidad]) => ({ estado, cantidad })),
      presentados: {
        total: presentados.length,
        porEstado: Object.entries(presPorEstado).map(([estado, cantidad]) => ({ estado, cantidad })),
      },
    };
  }
  // ============================================================
  // RESUMEN GENERAL (para tarjetas KPI del dashboard)
  // ============================================================
  static async resumen(desde, hasta) {
    const [alu, cur, asi, cla, mes, cer] = await Promise.all([
      this.alumnos(desde, hasta),
      this.cursadas(desde, hasta),
      this.asistencias(desde, hasta),
      this.clasesSuspendidas(desde, hasta),
      this.mesas(desde, hasta),
      this.certificados(desde, hasta),
    ]);
    return {
      alumnos: { total: alu.total, activos: alu.porcentajes.activos },
      cursadas: { total: cur.total, aprobacion: cur.porcentajeAprobacion, promedio: cur.promedioNotas },
      asistencias: { total: asi.total, porcentajeAsistencia: asi.porcentajeAsistencia },
      clasesSuspendidas: { total: cla.total },
      mesas: { total: mes.total },
      certificados: { total: cer.total },
    };
  }
}