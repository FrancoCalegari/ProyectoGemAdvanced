# Cambios y modo de uso — versión corregida

Esta carpeta es el proyecto con las correcciones aplicadas sobre el ZIP original
(`ProyectoGemAdvanced.zip`). El original **no fue modificado** y los datos de tu base tampoco.

Todo lo que sigue fue verificado ejecutando el sistema: **51/51 tests unitarios**,
**70 comprobaciones de API del rol Celador** y **65 comprobaciones generales**, siempre
sobre una base descartable que se eliminó al terminar.

---

## 1. Cómo levantarlo

```bash
# 1) Base de datos (PostgreSQL 18 en :5434)
docker compose up -d

# 2) Aplicar las migraciones (roles BEDEL/CELADOR + módulo de personal no docente)
npx prisma migrate deploy

# 3) Fichas de bedel y celador + horarios + vinculación de las cuentas ya existentes
node prisma/seed_roles_nodocentes.js

# 4) API en http://localhost:3000
npm run dev

# 5) Frontend en http://localhost:5173
cd frontend
npm run dev
```

> **Ojo con el paso 3:** si ya habías creado `bedel@` y `celador@` con la versión anterior del
> script, esas cuentas **no tenían ficha de empleado**. Volver a correrlo las vincula (y crea sus
> horarios). Sin ese paso, el celador entra pero no ve su panel.

> **Frontend y backend van juntos.** Este frontend contra una API vieja devuelve 404 en
> `/api/cursadas/:id`, en asistencia y en todo el módulo de personal no docente.

Las dependencias y el cliente de Prisma vienen generados (`node_modules/`).

---

## 2. Usuarios de prueba

| Rol | Email | Contraseña | Alcance |
|---|---|---|---|
| ADMIN | admin@plataforma.edu.ar | admin123 | Todo |
| SECRETARIA | secretaria@plataforma.edu.ar | secretaria123 | Gestión académica |
| PROFESOR | los de tu base | profesor123 | Sus materias, licencias, pedidos |
| ALUMNO | alumno0@plataforma.edu.ar | alumno123 | Su historial, constancias, mesas |
| BEDEL | bedel@plataforma.edu.ar | bedel123 | Consulta + asistencia, y su panel personal |
| **CELADOR** | celador@plataforma.edu.ar | celador123 | **Solo su panel personal** |

---

## 3. Rol CELADOR (autoservicio, sin ninguna función administrativa)

### Puede

- **Ver sus datos**: ficha de empleado (DNI, contacto, cargo, sector, fecha de ingreso, estado).
- **Ver sus horarios de trabajo**: turnos vigentes (día, horario, sector, vigencia) e historial.
- **Ver las modificaciones de sus horarios**: cuando gestión cambia un turno queda registrado
  quién, cuándo, el detalle del cambio (antes → después) y el motivo. Las novedades **sin ver**
  se avisan con un contador en el menú y una banda de aviso en su panel; él las marca como vistas.
- **Presentar certificados de salud y justificativos de faltas**: los carga, los ve en su
  historial con el estado (PENDIENTE / APROBADA / RECHAZADA) y la respuesta de la gestión, y
  puede editar o eliminar los que siguen pendientes.
- Editar sus **datos de contacto** y su **contraseña** desde *Mi Cuenta*.

### No puede (403)

Alumnos y legajos · Carreras, resoluciones, materias, correlatividades y planes ·
Mesas de examen · Documentación presentada · Asistencia · Certificados ·
Usuarios · Docentes · Licencias/pedidos de otros · Estadísticas y dashboard ·
Equivalencias · Personal no docente · **modificar o dar de baja sus propios horarios**.

### Cómo está implementado el bloqueo

Dos capas:

1. **`bloqueoCelador` (backend, `src/middlewares/auth.js`)**: lista blanca global por rol. Todo lo
   que no sea su panel devuelve 403, incluso escribiendo la URL a mano y también en rutas futuras
   (default-deny). Sólo pasa: `auth/me`, `empleados/me*` y `licencias` propias.
2. **`LayoutProtegido` (frontend, `App.jsx`)**: si el rol es CELADOR y la ruta no es
   `/mi-perfil`, `/mis-horarios` o `/mis-justificativos`, lo redirige a su panel.

### Pantallas nuevas del celador

| Ruta | Pantalla | Contenido |
|---|---|---|
| `/mis-horarios` | `MisHorarios.jsx` | Aviso de novedades + resumen + turnos vigentes + modificaciones + historial de turnos + sus justificativos |
| `/mis-justificativos` | `MisJustificativos.jsx` | Presentar/editar/eliminar certificados y justificativos + historial con estado y respuesta |
| `/mi-perfil` | (ya existía) | Datos personales, contacto (teléfono y domicilio de la ficha) y contraseña |

---

## 3.b Menú del administrador reorganizado (más compacto)

El menú de gestión pasó de **12 ítems sueltos a 6**, agrupados y desplegables. Cada grupo se
abre solo cuando estás parado en una de sus pantallas:

| Opción | Contiene |
|---|---|
| **Dashboard** | KPIs y actividad reciente |
| **Métricas y Reportes** | Estadísticas institucionales (solo ADMIN) |
| **Académico** ▾ | Carreras y planes · Materias en curso · Registro de asistencia · Exámenes finales |
| **Alumnos** ▾ | Alumnos y legajos (al hacer clic) · Historial y bajas · Documentación presentada · Constancias emitidas |
| **Profesores** | Cuerpo docente (con títulos, materias y licencias dentro de cada ficha) |
| **Personal** ▾ | **Todo el personal** (al hacer clic) · Cuentas de acceso · No docentes y horarios |

### Nueva pantalla: "Todo el personal" (`/personal`)

Una sola vista con **todo el personal del establecimiento**: administradores, secretarias,
bedeles y celadores (y cualquier otro no docente), con:

- Tarjetas de resumen por rol (total, administradores, secretarias, bedeles, celadores).
- Aviso cuando hay **no docentes sin cuenta de acceso**.
- Tabla con apellido y nombre, rol, cuenta de acceso, sector, estado y acciones.
- Búsqueda por nombre, apellido, DNI, email, sector o rol, y filtro por rol.
- Acceso directo a la ficha del no docente (con sus horarios) y a Cuentas de acceso.

Los profesores y los alumnos siguen teniendo su propia sección (con todos sus detalles adentro
al hacer clic), tal como estaban.

### Endpoint nuevo

`GET /api/personal` (ADMIN y SECRETARIA) devuelve `{ personal, resumen }`; el celador y el bedel
reciben **403**. `GET /api/personal/usuario/:usuarioId` devuelve una persona por su cuenta.

---

## 4. Gestión del personal no docente (ADMIN / SECRETARIA)

Nuevo ítem de menú **Personal no docente** (`/empleados`):

- **ABM de fichas**: alta, edición, baja lógica y reactivación. Guarda DNI, contacto, género,
  cargo (BEDEL / CELADOR / OTRO), sector o puesto, fecha de ingreso y observaciones.
- **Cuenta de acceso**: desde el detalle se crea el usuario vinculado a la ficha (rol BEDEL o
  CELADOR). El alta también se puede hacer desde *Cuentas de Acceso*, donde ahora aparece el
  selector de empleado cuando el rol es BEDEL o CELADOR.
- **Horarios de trabajo** (ABM completo): asignar turnos (día, hora desde/hasta, sector, vigencia
  y motivo), modificarlos y darlos de baja. **Cada operación registra automáticamente una
  modificación** en el historial del empleado (`ALTA`, `CAMBIO` o `BAJA`), con el detalle
  antes → después, el motivo y quién lo hizo. El empleado la ve como novedad sin ver.
- **Certificados y justificativos**: listado con aprobar/rechazar (al aprobar una licencia de
  docente se siguen generando las clases suspendidas; los no docentes no suspenden clases) y
  carga manual de un certificado presentado en papel.
- **Desde el detalle** se ven también las modificaciones de horario con su estado de lectura.

---

## 5. Cambios de base de datos (migración `20261005190000_add_empleados_horarios_celador`)

| Objeto | Detalle |
|---|---|
| `empleados` | ficha del personal no docente: `dni`, `nombre`, `apellido`, `email`, `telefono`, `fecha_nacimiento`, `genero`, domicilio, `cargo`, `sector`, `fecha_ingreso`, `observaciones`, `estado` |
| `horarios_trabajo` | turnos: `empleado_id`, `dia_semana`, `hora_inicio`, `hora_fin`, `sector`, `vigente_desde`, `vigente_hasta`, `activo` |
| `modificaciones_horario` | historial: `horario_id`, `empleado_id`, `tipo`, `detalle`, `valor_anterior`, `valor_nuevo`, `motivo`, `cambiado_por_id`, `visto`, `visto_at` |
| `usuarios.empleado_id` | vínculo único usuario ↔ ficha (igual que `alumno_id` y `profesor_id`) |
| `licencias.profesor_id` | pasa a ser **opcional** y se agrega `empleado_id`: un solo circuito de licencias/justificativos para docentes y no docentes |
| `tipo_licencia` | nuevos valores `CERTIFICADO_SALUD` y `JUSTIFICATIVO_FALTA` |

La migración es **aditiva**: no borra ni reescribe datos existentes.

---

## 6. Errores corregidos (versión anterior de esta entrega)

### Backend

| # | Problema | Causa | Archivo |
|---|---|---|---|
| 1 | `GET /api/alumnos/:id` devolvía **500 siempre** | `título:` (con tilde) en un `include` de Prisma; el campo real es `titulo` | `src/services/alumno.service.js` |
| 2 | `GET /api/clases-suspendidas/:id`, eliminar y reasignar devolvían **500** | 4 claves inexistentes en el catálogo de errores → `new AppError(...undefined)` | `src/utils/errors.js` |
| 3 | El módulo de **Equivalencias** era inalcanzable (404) | router existente pero no montado | `src/app.js` |
| 4 | **8 endpoints quedaban públicos sin token** (incluido `/api/alumnos` con DNI, email y domicilio) | routers sin `requireAuth` | `src/routes/*` |
| 5 | `PUT /api/cursadas/:id` **no existía** (el docente no podía cargar notas) | endpoint faltante | `src/routes/cursada.routes.js` + controller + service |
| 6 | Un id malformado devolvía 500 | sin validación de UUID | `src/services/cursada.service.js` |
| 7 | Un alumno podía borrar justificaciones de otro | sin control de dueño | `src/services/certificadoPresentado.service.js` |

### Frontend

| # | Problema | Detalle |
|---|---|---|
| 8 | **Nombres de campos con tilde** que la API no devuelve | 640 identificadores en 17 archivos (`resoluciónes`, `código`, `título`, `género`, `institución`, `descripción`…): pantallas en blanco en Alumnos, Asistencia, Cursadas, Certificados, CertificadosPresentados y MiHistoria |
| 9 | URLs con tilde → **404** | `/curricular/resoluciónes/:id/plan` rompía el plan de estudios |
| 10 | Asistencia **no funcionaba nunca** | el frontend llamaba `/asistencia` (singular) y el backend expone `/asistencias` |
| 11 | Las **descripciones no se guardaban** | se enviaba `descripción` / `institución` en lugar de `descripcion` / `institucion` |
| 12 | Cada rol caía en el dashboard administrativo | ahora cada rol aterriza en su página |
| 13 | El selector de estado de una cursada ofrecía transiciones inválidas | ahora sólo muestra las permitidas |

**Descripciones de carreras y materias**: siguen intactas y ahora funcionan de punta a punta
(`GET/PUT /api/titulos/:id` → `descripcion`; `GET/PUT /api/curricular/materias/:id` →
`descripcion`, `contenidosMinimos`, `objetivos`).

---

## 7. Qué NO se tocó

- Los datos de tu base ni el ZIP original.
- La lógica de negocio y los modelos preexistentes (sólo se **agregó** una migración y valores de enum).
- Los permisos de BEDEL, PROFESOR, ALUMNO, SECRETARIA y ADMIN (verificado uno por uno).

---

## 8. Notas técnicas y de personalización

- **Documentación de la API:** el Swagger interactivo está en `/api-docs` (módulos base) y el
  detalle funcional de todos los módulos está en este documento y en `DOCUMENTACION.md`.
- **Seeders:** `prisma/seed_profesores.js` y `prisma/seed_alumnos_variados.js` exportan su
  función y se ejecutan importándolos (así los usa `prisma/seed.js`). El personal no docente
  se carga con `node prisma/seed_roles_nodocentes.js`.
- **Personalización por rol:** el panel de horarios viene habilitado para el CELADOR. Para
  dárselo también al BEDEL alcanza con agregar `'BEDEL'` en las entradas `roles` de
  `menuPersonal` (`Sidebar.jsx`) y en la lista blanca de `bloqueoCelador`
  (`src/middlewares/auth.js`).
- **Circuito de justificativos:** se presentan con los datos y el motivo, y la gestión los
  aprueba o rechaza desde el panel; el estado queda registrado en el historial del empleado.
