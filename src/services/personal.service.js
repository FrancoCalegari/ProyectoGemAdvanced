import prisma from '../config/db.js';

// Roles que componen el "personal del establecimiento" (sin docentes ni alumnos):
// administradores y secretarias (con cuenta de gestión) + personal no docente.
const ROLES_GESTION = ['ADMIN', 'SECRETARIA'];

function coincide(texto, busqueda) {
  return String(texto || '').toLowerCase().includes(busqueda);
}

export class PersonalService {
  /**
   * Lista unificada de personal: administradores, secretarias, bedeles y celadores
   * (y cualquier otro no docente), con su cuenta de acceso y su ficha.
   */
  static async listar(filtros = {}) {
    const busqueda = (filtros.busqueda || '').trim().toLowerCase();

    const [usuariosGestion, empleados] = await Promise.all([
      prisma.usuario.findMany({
        where: { rol: { in: ROLES_GESTION } },
        select: {
          id: true,
          email: true,
          nombre: true,
          apellido: true,
          rol: true,
          activo: true,
          createdAt: true,
        },
        orderBy: [{ apellido: 'asc' }, { nombre: 'asc' }],
      }),
      prisma.empleado.findMany({
        select: {
          id: true,
          dni: true,
          nombre: true,
          apellido: true,
          email: true,
          telefono: true,
          cargo: true,
          sector: true,
          fechaIngreso: true,
          estado: true,
          usuario: { select: { id: true, email: true, rol: true, activo: true } },
        },
        orderBy: [{ apellido: 'asc' }, { nombre: 'asc' }],
      }),
    ]);

    const gestion = usuariosGestion.map((u) => ({
      tipo: 'GESTION',
      id: u.id,
      usuarioId: u.id,
      empleadoId: null,
      nombre: u.nombre,
      apellido: u.apellido,
      rol: u.rol,
      dni: null,
      email: u.email,
      emailAcceso: u.email,
      telefono: null,
      sector: null,
      fechaIngreso: null,
      activo: u.activo,
      tieneCuenta: true,
    }));

    const noDocentes = empleados.map((e) => ({
      tipo: 'NO_DOCENTE',
      id: e.id,
      usuarioId: e.usuario?.id || null,
      empleadoId: e.id,
      nombre: e.nombre,
      apellido: e.apellido,
      rol: e.cargo,
      dni: e.dni,
      email: e.email,
      emailAcceso: e.usuario?.email || null,
      telefono: e.telefono,
      sector: e.sector,
      fechaIngreso: e.fechaIngreso,
      activo: e.estado === 'ACTIVO' && (e.usuario ? e.usuario.activo : true),
      tieneCuenta: !!e.usuario,
    }));

    let personal = [...gestion, ...noDocentes].sort(
      (a, b) =>
        String(a.apellido || '').localeCompare(String(b.apellido || ''), 'es') ||
        String(a.nombre || '').localeCompare(String(b.nombre || ''), 'es')
    );

    if (busqueda) {
      personal = personal.filter(
        (p) =>
          coincide(p.nombre, busqueda) ||
          coincide(p.apellido, busqueda) ||
          coincide(p.email, busqueda) ||
          coincide(p.emailAcceso, busqueda) ||
          coincide(p.dni, busqueda) ||
          coincide(p.sector, busqueda) ||
          coincide(p.rol, busqueda)
      );
    }

    const porRol = { ADMIN: 0, SECRETARIA: 0, BEDEL: 0, CELADOR: 0, OTRO: 0 };
    for (const p of personal) porRol[p.rol] = (porRol[p.rol] || 0) + 1;

    return {
      personal,
      resumen: {
        total: personal.length,
        activos: personal.filter((p) => p.activo).length,
        sinCuenta: personal.filter((p) => !p.tieneCuenta).length,
        porRol,
      },
    };
  }

  static async obtenerPorUsuario(usuarioId) {
    const usuario = await prisma.usuario.findUnique({
      where: { id: usuarioId },
      select: {
        id: true,
        email: true,
        nombre: true,
        apellido: true,
        rol: true,
        activo: true,
        empleado: { select: { id: true, cargo: true, sector: true, estado: true } },
      },
    });

    if (!usuario) return null;

    return {
      tipo: usuario.empleado ? 'NO_DOCENTE' : 'GESTION',
      id: usuario.empleado?.id || usuario.id,
      usuarioId: usuario.id,
      empleadoId: usuario.empleado?.id || null,
      nombre: usuario.nombre,
      apellido: usuario.apellido,
      rol: usuario.rol,
      email: usuario.email,
      emailAcceso: usuario.email,
      sector: usuario.empleado?.sector || null,
      activo: usuario.activo,
      tieneCuenta: true,
    };
  }
}
