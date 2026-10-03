const API = 'http://localhost:3000/api';

// ============================================================
// ENDPOINTS REALES POR ROL
// ============================================================
const ROLES = [
  {
    rol: 'ADMIN',
    email: 'admin@plataforma.edu.ar',
    password: 'admin123',
    endpoints: [
      ['/auth/me', 'Mi Cuenta'],
      ['/dashboard/resumen', 'Dashboard resumen'],
      ['/dashboard/actividad', 'Dashboard actividad'],
      ['/dashboard/alumnos-por-mes', 'Dashboard alumnos por mes'],
      ['/estadisticas/resumen', 'Metricas resumen'],
      ['/estadisticas/alumnos', 'Metricas alumnos'],
      ['/estadisticas/cursadas', 'Metricas cursadas'],
      ['/estadisticas/asistencias', 'Metricas asistencias'],
      ['/estadisticas/clases-suspendidas', 'Metricas clases suspendidas'],
      ['/estadisticas/mesas', 'Metricas mesas'],
      ['/estadisticas/certificados', 'Metricas certificados'],
      ['/titulos', 'Carreras'],
      ['/alumnos', 'Alumnos'],
      ['/alumnos/agrupados', 'Alumnos agrupados'],
      ['/alumnos/historial', 'Legajos'],
      ['/curricular/materias', 'Materias'],
      ['/curricular/aulas', 'Aulas'],
      ['/profesores', 'Docentes'],
      ['/usuarios', 'Cuentas'],
      ['/usuarios/profesores-sin-usuario', 'Profesores sin usuario'],
      ['/certificados-presentados/certificados-presentados', 'Certificados presentados'],
      ['/certificados-presentados/certificados-presentados?estado=PENDIENTE', 'Certificados pendientes'],
      ['/correlatividad/materias/00000000-0000-0000-0000-000000000000/correlativas', 'Correlatividades (404 esperado)'],
      ['/equivalencia/equivalencias', 'Equivalencias'],
      ['/licencias', 'Licencias'],
      ['/solicitudes', 'Solicitudes'],
      ['/clases-suspendidas', 'Clases suspendidas'],
      ['/clases-suspendidas/resumen', 'Resumen clases suspendidas'],
    ],
  },
  {
    rol: 'SECRETARIA',
    email: 'secretaria@plataforma.edu.ar',
    password: 'secretaria123',
    endpoints: [
      ['/auth/me', 'Mi Cuenta'],
      ['/dashboard/resumen', 'Dashboard'],
      ['/dashboard/actividad', 'Actividad'],
      ['/titulos', 'Carreras'],
      ['/alumnos', 'Alumnos'],
      ['/alumnos/agrupados', 'Alumnos agrupados'],
      ['/alumnos/historial', 'Legajos'],
      ['/curricular/materias', 'Materias'],
      ['/profesores', 'Docentes (solo lectura)'],
      ['/certificados-presentados/certificados-presentados', 'Certificados presentados'],
      ['/licencias', 'Licencias (aprobar/rechazar)'],
      ['/clases-suspendidas', 'Clases suspendidas'],
    ],
  },
  {
    rol: 'PROFESOR',
    email: 'roberto.fernandez@plataforma.edu.ar',
    password: 'profesor123',
    endpoints: [
      ['/auth/me', 'Mi Cuenta'],
      ['/licencias/me', 'Mis Licencias'],
      ['/solicitudes/me', 'Mis Pedidos'],
      ['/profesores/me/materias', 'Mis Materias (si existe)'],
      ['/profesores/me/clases', 'Mis Clases (si existe)'],
    ],
  },
  {
    rol: 'ALUMNO',
    email: 'alumno0@plataforma.edu.ar',
    password: 'alumno123',
    endpoints: [
      ['/auth/me', 'Mi Cuenta'],
      ['/solicitudes/me', 'Mis Pedidos'],
      ['/certificados-presentados/alumnos/me', 'Mis certificados (si existe)'],
    ],
  },
];

async function login(email, password) {
  const res = await fetch(`${API}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) throw new Error(`Login ${res.status}`);
  const data = await res.json();
  return { token: data.token, usuario: data.usuario };
}

async function probar(token, path) {
  const res = await fetch(`${API}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.status;
}

(async () => {
  let totalOK = 0;
  let total404 = 0;
  let total500 = 0;

  for (const { rol, email, password, endpoints } of ROLES) {
    console.log(`\n🔐 ${rol} (${email})`);

    let token;
    try {
      const r = await login(email, password);
      token = r.token;
      console.log(`   ✅ Login OK (${r.usuario?.rol})`);
    } catch (e) {
      console.log(`   ❌ Login FALLO: ${e.message}`);
      continue;
    }

    for (const [path, label] of endpoints) {
      const status = await probar(token, path);
      if (status >= 200 && status < 300) {
        console.log(`   ✅ ${label}`);
        totalOK++;
      } else if (status === 404) {
        console.log(`   ⚠️  ${label} → 404 (endpoint no existe)`);
        total404++;
      } else if (status === 500) {
        console.log(`   ❌ ${label} → 500 (error servidor)`);
        total500++;
      } else if (status === 403) {
        console.log(`   🔒 ${label} → 403 (sin permiso, esperado)`);
      } else {
        console.log(`   ❌ ${label} → ${status}`);
      }
    }
  }

  console.log(`\n📊 RESUMEN: ${totalOK} OK | ${total404} no existen | ${total500} con error 500`);
})();
