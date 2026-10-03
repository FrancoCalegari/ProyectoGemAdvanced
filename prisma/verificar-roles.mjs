const API = 'http://localhost:3000/api';

const ROLES = [
  { rol: 'ADMIN',      email: 'admin@plataforma.edu.ar',              password: 'admin123' },
  { rol: 'SECRETARIA', email: 'secretaria@plataforma.edu.ar',         password: 'secretaria123' },
  { rol: 'PROFESOR',   email: 'roberto.fernandez@plataforma.edu.ar',  password: 'profesor123' },
  { rol: 'ALUMNO',     email: 'alumno0@plataforma.edu.ar',            password: 'alumno123' },
];

// Rutas REALES del backend
const ENDPOINTS_POR_ROL = {
  ADMIN: [
    ['/dashboard/resumen', 'Dashboard'],
    ['/dashboard/actividad', 'Dashboard actividad'],
    ['/estadisticas/resumen', 'Metricas resumen'],
    ['/estadisticas/alumnos', 'Metricas alumnos'],
    ['/estadisticas/cursadas', 'Metricas cursadas'],
    ['/estadisticas/asistencias', 'Metricas asistencias'],
    ['/estadisticas/clases-suspendidas', 'Metricas clases'],
    ['/estadisticas/mesas', 'Metricas mesas'],
    ['/estadisticas/certificados', 'Metricas certificados'],
    ['/titulos', 'Carreras'],
    ['/alumnos', 'Alumnos'],
    ['/alumnos/historial', 'Legajos'],
    ['/alumnos/agrupados', 'Alumnos agrupados'],
    ['/mesas-examen/mesas', 'Mesas de Examen'],
    ['/certificados-presentados/certificados-presentados', 'Documentacion Presentada'],
    ['/profesores', 'Cuerpo Docente'],
    ['/usuarios', 'Cuentas de Acceso'],
    ['/aulas', 'Aulas'],
    ['/curricular/materias', 'Materias'],
  ],
  SECRETARIA: [
    ['/dashboard/resumen', 'Dashboard'],
    ['/dashboard/actividad', 'Dashboard actividad'],
    ['/titulos', 'Carreras'],
    ['/alumnos', 'Alumnos'],
    ['/alumnos/historial', 'Legajos'],
    ['/alumnos/agrupados', 'Alumnos agrupados'],
    ['/mesas-examen/mesas', 'Mesas'],
    ['/certificados-presentados/certificados-presentados', 'Documentacion'],
    ['/profesores', 'Cuerpo Docente'],
    ['/curricular/materias', 'Materias'],
  ],
  PROFESOR: [
    ['/auth/me', 'Mi Cuenta'],
    ['/licencias/me', 'Mis Licencias'],
    ['/solicitudes/me', 'Mis Pedidos'],
  ],
  ALUMNO: [
    ['/auth/me', 'Mi Cuenta'],
    ['/solicitudes/me', 'Mis Pedidos'],
  ],
};

async function login(email, password) {
  const res = await fetch(`${API}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) throw new Error(`Login fallo: ${res.status}`);
  const data = await res.json();
  return data.token;
}

async function probar(token, path) {
  const res = await fetch(`${API}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.status;
}

(async () => {
  console.log('\n========== VERIFICADOR DE ROLES (rutas reales) ==========\n');

  for (const { rol, email, password } of ROLES) {
    console.log(`\n🔐 ${rol} (${email})`);

    let token;
    try {
      token = await login(email, password);
      console.log(`  ✅ Login OK`);
    } catch (e) {
      console.log(`  ❌ Login FALLO: ${e.message}`);
      continue;
    }

    const endpoints = ENDPOINTS_POR_ROL[rol] || [];
    let ok = 0, fail = 0;
    for (const [ep, label] of endpoints) {
      const status = await probar(token, ep);
      if (status >= 200 && status < 300) {
        console.log(`  ✅ ${label} (${ep})`);
        ok++;
      } else {
        console.log(`  ❌ ${label} (${ep}) → ${status}`);
        fail++;
      }
    }
    console.log(`  → ${ok} OK, ${fail} FAIL`);
  }

  console.log('\n========== FIN ==========\n');
})();
