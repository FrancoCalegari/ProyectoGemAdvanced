# Plataforma de Gestión de Carreras Académicas (Backend + Frontend)

Este repositorio contiene el backend de una plataforma pensada para que una institución educativa pueda administrar sus carreras de forma ordenada, versionando los planes de estudio sin perder el historial académico de nadie.

La idea central es simple pero poderosa: cuando una institución cambia el plan de estudios de una carrera, los alumnos que ya están cursando **no** pueden quedar atrapados en un limbo administrativo. Acá eso se resuelve con **resoluciones**: cada versión de la currícula es una entidad propia, con su propio set de años y materias. Cuando llega una nueva versión, la anterior se cierra y queda como registro histórico. Los alumnos que ya estaban inscriptos siguen bajo su plan original; los nuevos ingresan con el plan nuevo.

---

## Cómo ejecutarlo (paso a paso)

### 1. Base de datos (PostgreSQL 18 en el puerto 5434)

Si todavía no tenés el contenedor:

```bash
docker network create academico_net
docker run -d --name postgres-academico --network academico_net \
  -e POSTGRES_USER=academico_user \
  -e POSTGRES_PASSWORD=31881701 \
  -e POSTGRES_DB=plataforma_academica \
  -p 5434:5432 \
  -v academico_pgdata:/var/lib/postgresql/data \
  postgres:18-alpine
```

Si ya existe, alcanza con `docker start postgres-academico`.

### 2. Variables de entorno

```bash
cp .env.example .env                        # backend (ajustá DB_PASSWORD)
cp frontend/.env.example frontend/.env      # frontend
```

### 3. Backend

```bash
npm install
npx prisma generate
npx prisma migrate deploy
npx prisma db seed                      # datos de ejemplo completos
node prisma/seed_roles_nodocentes.js    # fichas + horarios de bedel y celador
npm run dev                             # http://localhost:3000  ·  Swagger: /api-docs
```

### 4. Frontend

```bash
cd frontend
npm install
npm run dev                             # http://localhost:5173
```

### Usuarios de prueba

| Rol | Email | Contraseña |
|---|---|---|
| ADMIN | admin@plataforma.edu.ar | admin123 |
| SECRETARIA | secretaria@plataforma.edu.ar | secretaria123 |
| PROFESOR | roberto.fernandez@plataforma.edu.ar | profesor123 |
| ALUMNO | alumno0@plataforma.edu.ar | alumno123 |
| BEDEL | bedel@plataforma.edu.ar | bedel123 |
| CELADOR | celador@plataforma.edu.ar | celador123 |

> Los usuarios **BEDEL** y **CELADOR** se crean con `node prisma/seed_roles_nodocentes.js`,
> que además les asigna sus horarios de trabajo de ejemplo.
>
> El **CELADOR** es un rol de autoservicio: sólo accede a su panel personal (sus datos, sus
> horarios con sus modificaciones y la presentación de certificados y justificativos).

---

## Estado actual del proyecto

El proyecto incluye el **backend y el frontend completos**. Están implementadas las **Fases 0 a 7**
del plan original, los **módulos nuevos (M1-M11)**, la **gestión del personal no docente** y el
**rol Celador**. Hay **136 endpoints** en la API (**23 documentados con Swagger**, en `/api-docs`) y
**51 tests unitarios** que pasan con `npm test`.

El detalle de los últimos cambios, el alcance de cada rol y las pantallas nuevas está en
[**CAMBIOS-Y-USO.md**](./CAMBIOS-Y-USO.md).

### Fases del plan original

| Fase | Descripción | Estado |
|---|---|---|
| 0 | Setup inicial (Docker, Express, DB) | ✅ Completada |
| 1 | Modelo de datos (Prisma) | ✅ Completada |
| 2 | Títulos, Resoluciones, Años y Materias | ✅ Completada |
| 3 | Correlatividades | ✅ Completada |
| 4 | Alumnos, Admisión, Inscripciones, Equivalencias | ✅ Completada |
| 5 | Cursadas e Historia Académica | ✅ Completada |
| 6 | Certificados (parciales y de título completo) | ✅ Completada |
| 7 | Autenticación y Roles | ✅ Completada |
| 8 | Testing y Documentación (Swagger) | 🔄 En desarrollo |
| 9 | Despliegue | ⏳ Pendiente |

### Módulos nuevos (M1-M11)

| Etapa | Descripción | Estado |
|---|---|---|
| M1 | Schema: Profesor, Licencia, Solicitud, TituloProfesor | ✅ Completada |
| M2 | Backend Profesores (CRUD + títulos + materias asignadas) | ✅ Completada |
| M2.5 | Auth + matriz de permisos por rol (`requireSelfOrRole`) | ✅ Completada |
| M3 | Backend Licencias (CRUD + aprobar/rechazar) | ✅ Completada |
| M3.5 | Clases Suspendidas + Reasignación | ✅ Completada |
| M4 | Backend Solicitudes (alumno/profesor crean, admin resuelve) | ✅ Completada |
| M5 | Examen nivelatorio con flujo condicional | ✅ Completada |
| M6 | Mesa "Ingreso Art. N° X" con tipoMesa | ✅ Completada |
| M7 | Frontend Profesores (CRUD + detalle) | ✅ Completada |
| M7.5 | Historial de Alumnos + baja lógica | ✅ Completada |
| M8 | Panel personal por rol | ✅ Completada |
| M9 | Estadísticas con Recharts + exportación PDF/CSV | ✅ Completada |
| M10 | Dashboard completo con KPIs | ✅ Completada |
| M11 | Backup + documentación + tests | ✅ Completada |

### Módulos backend adicionales

| Módulo | Descripción |
|---|---|
| Usuarios | CRUD completo + baja lógica |
| Dashboard | KPIs + actividad reciente |
| Estadísticas | Análisis institucional con filtros |
| Baja lógica Profesores | `PATCH /:id/baja` + `/reactivar` |

---

## Stack técnico

| Componente | Elección |
|---|---|
| Runtime | Node.js 20 |
| Framework web | Express 4 |
| Base de datos | PostgreSQL 18 (Docker) |
| ORM | Prisma 5 |
| Contenerización | Docker + docker-compose |
| Validación | Zod |
| Generación de PDF | pdfkit |
| Autenticación | JWT (jsonwebtoken + bcrypt) |
| Testing | Jest |

Elegimos **PostgreSQL 18** en lugar de la versión 16 sugerida originalmente en el plan, por ser la versión estable más reciente al momento de arrancar. Esto implicó un ajuste en la configuración del volumen del contenedor (ver sección "Notas técnicas").

---

## Estructura del repositorio

```
ProyectoGemAdvanced/
├── prisma/
│   ├── schema.prisma              # Modelo de datos completo (19 modelos, 15 enums)
│   ├── seed.js                    # Carga de datos de prueba
│   └── migrations/                # Migraciones versionadas
├── src/
│   ├── config/
│   │   └── db.js                  # Cliente Prisma
│   ├── controllers/               # Handlers HTTP (18 controllers)
│   ├── middlewares/
│   │   ├── index.js               # errorHandler, validate, notFound
│   │   └── auth.js                # requireAuth, requireRole, requireSelfOrRole
│   ├── routes/                    # Definición de rutas (16 routers)
│   ├── services/                  # Lógica de negocio (17 services)
│   ├── utils/
│   │   ├── errors.js              # AppError + códigos de error
│   │   ├── helpers.js             # Utilidades
│   │   └── pdf.js                 # Generador de PDF de certificados
│   └── app.js                     # Bootstrap de Express
├── tests/
│   └── unit/                      # Tests unitarios (Jest)
├── frontend/                      # Frontend React (en desarrollo)
├── docker-compose.yml             # Stack completo (PostgreSQL + API)
├── docker/
│   └── Dockerfile                 # Imagen del API
├── .env.example
├── .dockerignore
├── .gitignore
├── jest.config.js
├── api_tests.http                 # Colección de requests
├── package.json
├── README.md
└── CONSIGNA.md                    # Plan original de implementación
```

---

## Cómo levantarlo en tu máquina

### Requisitos previos

- Node.js 20 o superior
- Docker Desktop corriendo
- Un editor de código (recomendado: VS Code)

### Paso 1 — Clonar y entrar al proyecto

```bash
git clone https://github.com/FrancoCalegari/ProyectoGemAdvanced.git
cd ProyectoGemAdvanced
git checkout feature/backend-plataforma-academica
```

### Paso 2 — Levantar la base de datos

```bash
docker compose up -d
```

Esto levanta PostgreSQL 18 en el puerto `5434`. La base se llama `plataforma_academica`.

### Paso 3 — Instalar dependencias

```bash
npm install
```

### Paso 4 — Configurar variables de entorno

```bash
cp .env.example .env
```

Editar `.env` con las credenciales reales (ver `.env.example`).

### Paso 5 — Aplicar migraciones y cargar datos

```bash
npx prisma migrate deploy
npx prisma db seed
```

El seeder carga automáticamente:

- 5 títulos terciarios (Software, Enfermería, Administración, Análisis, Turismo)
- 5 resoluciones vigentes
- 15 años curriculares (3 por título)
- 150 materias (10 por año)
- ~2000 correlatividades en cascada
- 20 alumnos con documentación y domicilio completo
- Inscripciones (con validación de admisión)
- Cursadas con estados variados
- Certificados de ejemplo
- 2 equivalencias entre carreras
- 22 usuarios (admin + secretaria + 20 alumnos)

### Paso 6 — Levantar el servidor

```bash
npm run dev
```

El servidor queda escuchando en `http://localhost:3000`.

Verificar que todo funciona:

```bash
curl http://localhost:3000/health
# → {"status":"ok","database":"connected"}
```

---

## API disponible

### Healthcheck

| Método | Endpoint | Descripción |
|---|---|---|
| GET | `/health` | Estado del servidor y conexión a DB |

### Autenticación

| Método | Endpoint | Descripción |
|---|---|---|
| POST | `/api/auth/login` | Login, devuelve JWT (con `rol`, `alumnoId`, `profesorId`) |
| POST | `/api/auth/register` | Alta de usuario (solo ADMIN) — soporta ADMIN, SECRETARIA, ALUMNO, PROFESOR |
| GET | `/api/auth/me` | Datos del usuario autenticado |

### Títulos

| Método | Endpoint | Descripción |
|---|---|---|
| GET | `/api/titulos` | Listar títulos con sus resoluciones |
| POST | `/api/titulos` | Crear título con su primera resolución vigente |
| GET | `/api/titulos/:id` | Detalle completo (años y materias) |
| PUT | `/api/titulos/:id` | Editar datos generales |
| DELETE | `/api/titulos/:id` | Baja lógica (bloquea si tiene inscripciones) |
| POST | `/api/titulos/:id/resoluciones` | Crear nueva resolución (cierra la vigente) |
| GET | `/api/titulos/:tituloId/resoluciones` | Historial de resoluciones |

### Resoluciones

| Método | Endpoint | Descripción |
|---|---|---|
| GET | `/api/resoluciones/:id` | Detalle con años y materias |
| POST | `/api/resoluciones/:id/cerrar` | Cierre manual |

### Currícula

| Método | Endpoint | Descripción |
|---|---|---|
| POST | `/api/curricular/resoluciones/:resolucionId/anios` | Crear año curricular |
| GET | `/api/curricular/resoluciones/:resolucionId/plan` | Plan completo de una resolución |
| GET | `/api/curricular/materias` | **Todas las materias** (para selects) |
| GET | `/api/curricular/aulas` | **Aulas disponibles** |
| POST | `/api/curricular/anios/:anioId/materias` | Crear materia |
| GET | `/api/curricular/anios/:id/materias` | Listar materias de un año |
| PUT | `/api/curricular/materias/:id` | Editar materia |
| DELETE | `/api/curricular/materias/:id` | Eliminar materia (bloquea si tiene cursadas) |

### Correlatividades

| Método | Endpoint | Descripción |
|---|---|---|
| GET | `/api/materias/:id/correlativas` | Listar correlativas de una materia |
| POST | `/api/materias/:id/correlativas` | Agregar correlativa |
| DELETE | `/api/correlatividades/:id` | Eliminar correlativa |

### Alumnos

| Método | Endpoint | Descripción |
|---|---|---|
| GET | `/api/alumnos` | Listar alumnos (con filtros y búsqueda) |
| POST | `/api/alumnos` | Crear alumno |
| GET | `/api/alumnos/:id` | Detalle con inscripciones y exámenes |
| PUT | `/api/alumnos/:id` | Editar datos |
| DELETE | `/api/alumnos/:id` | Eliminar (bloquea si tiene registros) |

### Admisión y Exámenes Nivelatorios

| Método | Endpoint | Descripción |
|---|---|---|
| GET | `/api/alumnos/:id/admision` | Estado de admisión (documentación + examen) |
| GET | `/api/alumnos/:id/examenes` | Listar exámenes nivelatorios |
| POST | `/api/alumnos/:id/examenes` | Registrar examen (flujo condicional) |
| PUT | `/api/alumnos/:id/examenes/:examenId` | Actualizar resultado |

### Inscripciones

| Método | Endpoint | Descripción |
|---|---|---|
| GET | `/api/alumnos/:id/inscripciones` | Historial de inscripciones |
| POST | `/api/alumnos/:id/inscripciones` | Inscribir a un título |
| PUT | `/api/inscripciones/:id` | Cambiar estado (ACTIVA/EGRESADO/BAJA) |
| GET | `/api/inscripciones/:id/cursadas` | Listar cursadas de una inscripción |

### Equivalencias y Cambio de Carrera

| Método | Endpoint | Descripción |
|---|---|---|
| GET | `/api/equivalencias` | Listar equivalencias |
| POST | `/api/equivalencias` | Crear equivalencia |
| DELETE | `/api/equivalencias/:id` | Eliminar equivalencia |
| GET | `/api/materias/:id/equivalencias` | Equivalencias de una materia |
| POST | `/api/alumnos/:id/cambio-carrera` | Cambiar de carrera |

### Cursadas e Historia Académica

| Método | Endpoint | Descripción |
|---|---|---|
| POST | `/api/alumnos/:id/cursadas` | Registrar/actualizar estado de una materia |
| GET | `/api/alumnos/:id/historia-academica` | Recorrido académico completo con % de avance |

### Certificados

| Método | Endpoint | Descripción |
|---|---|---|
| POST | `/api/alumnos/:id/certificados` | Solicitar certificado (PARCIAL_ANIO o TITULO_COMPLETO) |
| GET | `/api/alumnos/:id/certificados` | Listar certificados del alumno |
| GET | `/api/certificados/:id` | Detalle de un certificado |
| GET | `/api/certificados/:id/pdf` | Descargar PDF del certificado |
| PUT | `/api/certificados/:id/anular` | Anular certificado |

### Profesores

| Método | Endpoint | Descripción |
|---|---|---|
| GET | `/api/profesores` | Listar (ADMIN, SECRETARIA) |
| POST | `/api/profesores` | Crear (ADMIN) — requiere títulos |
| GET | `/api/profesores/:id` | Detalle (ADMIN, SECRETARIA o el propio profesor) |
| PUT | `/api/profesores/:id` | Actualizar (ADMIN o el propio profesor) |
| DELETE | `/api/profesores/:id` | Eliminar (ADMIN) |
| POST | `/api/profesores/:id/titulos` | Agregar título |
| DELETE | `/api/profesores/:id/titulos/:tituloId` | Eliminar título |
| POST | `/api/profesores/:id/materias` | Asignar materia + día + hora + aula |
| DELETE | `/api/profesores/:id/materias/:mpId` | Desasignar materia |
| GET | `/api/profesores/me/materias` | Mis materias (PROFESOR logueado) |

### Licencias

| Método | Endpoint | Descripción |
|---|---|---|
| GET | `/api/licencias` | Listar (ADMIN, SECRETARIA) |
| GET | `/api/licencias/me` | Mis licencias (PROFESOR) |
| POST | `/api/licencias` | Crear (PROFESOR, ADMIN) |
| GET | `/api/licencias/:id` | Detalle |
| PUT | `/api/licencias/:id` | Editar (solo PENDIENTE) |
| DELETE | `/api/licencias/:id` | Eliminar (solo PENDIENTE) |
| PATCH | `/api/licencias/:id/aprobar` | Aprobar — genera clases suspendidas automáticamente |
| PATCH | `/api/licencias/:id/rechazar` | Rechazar |
| GET | `/api/licencias/profesor/:profesorId` | Licencias de un profesor |

**Tipos de licencia:** `ENFERMEDAD`, `RAZON_PARTICULAR`, `ESTUDIOS_FEMENINOS` (solo género F), `DONACION_SANGRE`, `ACCIDENTE_LABORAL`, `OTRO`.

**Granularidad:** `todoElDia=true` | `horaDesde`+`horaHasta` | `turno` (MANANA/TARDE/NOCHE).

### Clases Suspendidas

| Método | Endpoint | Descripción |
|---|---|---|
| GET | `/api/clases-suspendidas` | Listar (con filtros) |
| GET | `/api/clases-suspendidas/resumen` | Resumen por rango de fechas |
| POST | `/api/clases-suspendidas` | Crear manual (feriado, paro, clima) |
| GET | `/api/clases-suspendidas/:id` | Detalle |
| DELETE | `/api/clases-suspendidas/:id` | Eliminar |
| POST | `/api/clases-suspendidas/:id/reasignar` | Reasignar a otro profesor |
| DELETE | `/api/clases-suspendidas/:id/reasignar/:reasignacionId` | Eliminar reasignación |

### Solicitudes

| Método | Endpoint | Descripción |
|---|---|---|
| GET | `/api/solicitudes` | Listar (ADMIN, SECRETARIA) |
| GET | `/api/solicitudes/me` | Mis solicitudes (ALUMNO, PROFESOR) |
| POST | `/api/solicitudes` | Crear |
| GET | `/api/solicitudes/:id` | Detalle |
| PUT | `/api/solicitudes/:id` | Editar (solo PENDIENTE) |
| DELETE | `/api/solicitudes/:id` | Eliminar (solo PENDIENTE) |
| PATCH | `/api/solicitudes/:id/aprobar` | Aprobar (ADMIN, SECRETARIA) |
| PATCH | `/api/solicitudes/:id/rechazar` | Rechazar |
| GET | `/api/solicitudes/alumno/:alumnoId` | Solicitudes de un alumno |
| GET | `/api/solicitudes/profesor/:profesorId` | Solicitudes de un profesor |

**Tipos:** `CAMBIO_HORARIO`, `AUSENCIA_PROGRAMADA`, `CAMBIO_MATERIA`, `OTRO`.

### Mesas de Examen

| Método | Endpoint | Descripción |
|---|---|---|
| GET | `/api/mesas` | Listar (filtro `?tipoMesa=EXAMEN_FINAL\|INGRESO_NIVELATORIO`) |
| POST | `/api/mesas` | Crear mesa |
| GET | `/api/mesas/:id` | Detalle con inscripciones |
| PUT | `/api/mesas/:id/estado` | Cambiar estado |
| GET | `/api/mesas/:id/inscripciones` | Inscripciones |
| POST | `/api/mesas/:id/inscribir` | Inscribirse (valida que la materia sea de tu carrera) |
| DELETE | `/api/mesas/:id/inscribir` | Cancelar inscripción |
| PUT | `/api/mesas/:id/inscripciones/:alumnoId/asistencia` | Registrar asistencia + nota |
| GET | `/api/alumnos/:id/mesas-disponibles` | Mesas disponibles para un alumno |

**Tipos de mesa:** `EXAMEN_FINAL` (materia obligatoria) | `INGRESO_NIVELATORIO` (sin materia, vinculada a un examen nivelatorio).

### Asistencia

| Método | Endpoint | Descripción |
|---|---|---|
| POST | `/api/cursadas/:cursadaId/asistencias` | Registrar/actualizar asistencia |
| POST | `/api/cursadas/:cursadaId/asistencias/masivo` | Carga masiva |
| GET | `/api/cursadas/:cursadaId/asistencias` | Listar asistencias |
| GET | `/api/cursadas/:cursadaId/asistencias/resumen` | Resumen (presentes, ausentes, %) |

### Certificados Presentados

| Método | Endpoint | Descripción |
|---|---|---|
| GET | `/api/certificados-presentados` | Listar |
| POST | `/api/certificados-presentados` | Presentar certificado |
| PUT | `/api/certificados-presentados/:id/aprobar` | Aprobar (ADMIN) |
| PUT | `/api/certificados-presentados/:id/rechazar` | Rechazar (ADMIN) |

### Usuarios

| Método | Endpoint | Descripción |
|---|---|---|
| GET | `/api/usuarios` | Listar (ADMIN) |
| POST | `/api/usuarios` | Crear (ADMIN) |
| PUT | `/api/usuarios/:id` | Editar (ADMIN) |
| DELETE | `/api/usuarios/:id` | Eliminar (ADMIN) |

---

## Roles y permisos

| Rol | Puede |
|---|---|
| **ADMIN** | Todo: CRUD completo, aprobar/rechazar licencias y solicitudes, crear usuarios, asignar materias a profesores |
| **SECRETARIA** | Ver y gestionar alumnos, títulos, cursadas, mesas, certificados. **NO edita** profesores (solo ve). Aprueba/rechaza licencias y solicitudes |
| **PROFESOR** | Ve y edita **su propio** perfil, sus materias, sus licencias, sus solicitudes. Puede crear solicitudes y licencias |
| **ALUMNO** | Ve su historia académica, sus certificados, sus mesas. Puede crear solicitudes |

---

## Reglas de negocio implementadas

### Versionado de resoluciones

- **Un título siempre nace con una resolución vigente.** Transacción atómica.
- **Al crear una nueva resolución, la anterior se cierra automáticamente.**
- **Las resoluciones cerradas son inmutables.**
- **Los alumnos quedan atados a la resolución vigente al momento de inscribirse.**

### Validaciones de unicidad

- `titulo.nombre` — único global
- `resolucion.codigo` — único por título
- `anio_curricular` — único por `(resolucion, numeroAnio)`
- `materia.codigo` — único por año curricular
- `alumno.dni` y `alumno.email` — únicos globales
- `correlatividad` — única por `(materia, materiaRequerida, tipo)`
- `inscripcion` — única por `(alumno, titulo, resolucion)`
- `cursada` — única por `(inscripcion, materia)`
- `usuario.email` — único global
- `usuario.alumnoId` — único (un alumno tiene un solo usuario)

### Correlatividades

- **No auto-correlación.** Una materia no puede ser correlativa de sí misma.
- **Misma resolución.** Ambas materias deben pertenecer a la misma resolución.
- **Sin ciclos.** Si A→B existe, no se puede crear B→A.
- **Sin duplicados.**
- **Validación al registrar cursadas:**
  - `PARA_CURSAR` → la correlativa debe estar `REGULAR` o `APROBADA`.
  - `PARA_RENDIR_FINAL` → la correlativa debe estar `APROBADA`.

### Admisión de alumnos

| Caso | Requisitos | Puede inscribirse |
|---|---|---|
| Menor de 25 con secundario completo | Partida + Analítico completo | Sí |
| Mayor de 25 con secundario completo | Partida + Analítico completo | Sí |
| Mayor de 25 sin secundario + examen aprobado | Partida + Analítico incompleto + Cert. 7º + Examen APROBADO | Sí |
| Mayor de 25 sin secundario sin examen | Falta examen aprobado | No |

### Inscripciones

- **Validación de admisión previa.**
- **Resolución vigente automática.** El cliente NO manda la resolución.
- **Sin duplicados.** No se puede inscribir dos veces al mismo título con la misma resolución.

### Máquina de estados de cursada

```
EN_CURSO ------> REGULAR ------> APROBADA (final)
    |                |
    +--> LIBRE       +--> DESAPROBADA
    |
    +--> DESAPROBADA

LIBRE / DESAPROBADA ------> EN_CURSO (recursada)
```

### Certificados

- **Certificado PARCIAL_ANIO:** 100% de materias del año en `APROBADA`.
- **Certificado TITULO_COMPLETO:** 100% de materias de la resolución en `APROBADA`.
- **Si faltan materias:** error 409 con el listado de las pendientes.
- **PDF:** generado con pdfkit. Marca de agua "ANULADO" si está anulado.

### Licencias de profesores

- **Tipos:** enfermedad, razón particular, estudios femeninos (solo género F), donación de sangre, accidente laboral, otro.
- **Granularidad:** día completo, rango horario (`horaDesde`/`horaHasta`) o turno (`MANANA`/`TARDE`/`NOCHE`).
- **Al aprobar** → se generan automáticamente las **clases suspendidas** correspondientes (según materias asignadas al profesor y días/horas de la licencia).
- **Reasignación** → las clases suspendidas se pueden reasignar a otro profesor.

### Flujo del examen nivelatorio

- Se registra con `hora`, `lugar` y `articulo` ("Ingreso Art. N° X").
- **Si APROBADO** → se crea automáticamente una **mesa de tipo `INGRESO_NIVELATORIO`** con el alumno inscripto como `PRESENTE`.
- **Si DESAPROBADO** con `nuevaFecha` → se **reprograma automáticamente** otro examen `PENDIENTE`.
- Todo en transacción atómica.

### Inscripción a mesas

- Solo a mesas de materias **de la carrera del alumno** (valida `Inscripción` activa en la resolución de la materia).
- Mínimo **72 horas antes** para inscribirse.
- Mínimo **48 horas antes** para cancelar.
- Respeto del **cupo máximo**.

### Autenticación y roles

- **JWT** con payload `{ sub, email, rol, alumnoId, profesorId }`.
- **Contraseñas hasheadas con bcrypt** (10 rounds).
- **Roles:** ADMIN, SECRETARIA, ALUMNO, PROFESOR.
- **Middlewares:** `requireAuth` (valida token), `requireRole([...])` (valida rol), `requireSelfOrRole([...], paramName)` (valida dueño del recurso).

**Usuarios del seeder:**

| Email | Password | Rol |
|---|---|---|
| `admin@plataforma.edu.ar` | `admin123` | ADMIN |
| `secretaria@plataforma.edu.ar` | `secretaria123` | SECRETARIA |
| `alumno0@plataforma.edu.ar` a `alumno19@plataforma.edu.ar` | `alumno123` | ALUMNO |

---

## Modelo de datos

El schema completo está en `prisma/schema.prisma`. Tiene **19 modelos** y **15 enums**.

### Modelos académicos

- `Título` — carreras ofrecidas
- `Resolución` — versiones de la currícula
- `AnioCurricular` — años de cada resolución
- `Materia` — unidades curriculares
- `Correlatividad` — requisitos entre materias
- `Equivalencia` — pares de materias equivalentes entre carreras

### Modelos de alumnos

- `Alumno` — estudiantes (con domicilio y documentación)
- `ExamenNivelatorio` — exámenes de admisión (con `hora`, `lugar`, `articulo`)
- `Inscripción` — vínculo alumno ↔ título ↔ resolución
- `CursadaMateria` — historial académico por materia
- `Asistencia` — asistencias por clase y fecha
- `Certificado` — constancias emitidas
- `CertificadoPresentado` — certificados presentados por alumnos

### Modelos de profesores (M1)

- `Profesor` — docentes (con estado ACTIVO/SUPLENCIA/INACTIVO)
- `TituloProfesor` — títulos habilitantes
- `MateriaProfesor` — asignaciones (materia + día + hora + aula)
- `Licencia` — licencias (con granularidad horaria)
- `Solicitud` — solicitudes de alumnos y profesores

### Modelos de clases (M3.5)

- `ClaseSuspendida` — clases suspendidas (por licencia, feriado, paro, etc.)
- `Reasignacion` — reasignación de clases suspendidas a otro profesor

### Modelos de mesas

- `MesaExamen` — mesas (`EXAMEN_FINAL` o `INGRESO_NIVELATORIO`)
- `InscripcionMesa` — inscripciones a mesas

### Auth

- `Usuario` — usuarios del sistema (con `alumnoId` y `profesorId` opcionales)

### Enums

`estado_titulo`, `estado_resolucion`, `tipo_cursada`, `tipo_correlatividad`, `estado_inscripcion`, `estado_cursada`, `tipo_certificado`, `estado_certificado`, `estado_examen`, `rol_usuario`, `estado_asistencia`, `estado_profesor`, `tipo_licencia`, `estado_licencia`, `tipo_solicitud`, `estado_solicitud`, `tipo_titulo_profesor`, `estado_certificado_presentado`, `tipo_certificado_presentado`, `estado_mesa`, `estado_inscripcion_mesa`, `tipo_mesa`, `motivo_suspension`, `turno_licencia`.

---

## Notas técnicas

### Sobre PostgreSQL 18 en Docker

A partir de PostgreSQL 18, la imagen oficial de Docker cambió la forma en que gestiona el directorio de datos. **El volumen ya no se monta en `/var/lib/postgresql/data`** sino en `/var/lib/postgresql`. Si se usa la ruta vieja, el contenedor entra en un loop de reinicio.

### Sobre el seeder

El script `prisma/seed.js` es **idempotente**: cada vez que se ejecuta, limpia primero toda la base y después carga los datos. Incluye 5 perfiles de alumno para probar todos los flujos de admisión, y crea 22 usuarios (admin + secretaria + 20 alumnos).

### Sobre las transacciones

Las operaciones críticas usan `prisma.$transaction` para garantizar atomicidad:

- Crear título + resolución.
- Cerrar resolución vigente + crear nueva.
- Cambio de carrera (nueva inscripción + equivalencias + baja origen).
- Crear examen nivelatorio + mesa de ingreso.
- Aprobar licencia + crear clases suspendidas.

### Sobre el manejo de errores

Todos los errores se manejan centralizadamente con el `errorHandler`:

- `AppError` con código y status HTTP.
- Errores de Prisma (`P2002`, `P2003`, `P2025`).
- Errores de Postgres (`23001` — FK RESTRICT).
- Errores de validación de Zod.

### Sobre los certificados

Los certificados se generan con **pdfkit**. El PDF incluye encabezado, datos del alumno, título, resolución, materias aprobadas, fecha y espacio para firma. Si el certificado está **anulado**, se agrega una marca de agua roja "ANULADO" en diagonal.

### Sobre la autenticación

- **JWT** con `jsonwebtoken`. Payload: `{ sub, email, rol, alumnoId, profesorId }`.
- **Contraseñas hasheadas** con `bcrypt` (10 rounds).
- **Roles:** ADMIN, SECRETARIA, ALUMNO, PROFESOR.
- **Middlewares:** `requireAuth` (valida token), `requireRole([...])` (valida rol), `requireSelfOrRole([...], paramName)` (valida dueño).

---

## Testing

El proyecto tiene tests unitarios con **Jest**. La configuración está en `jest.config.js`.

```bash
npm test
```

**Estado actual:** 51 tests pasando (10 suites).

---

## Próximos pasos

1. **Frontend completo** (M7-M10):
   - Página de Profesores (listado + detalle) — en desarrollo
   - Panel personal por rol (autogestión)
   - Estadísticas con rango de fechas
   - Dashboard completo
2. **Fase 8:** completar tests + documentación Swagger.
3. **Fase 9:** despliegue.

---

## Deploy con Docker

El proyecto incluye un `docker-compose.yml` que levanta **todo el stack** (base de datos + API) con un solo comando.

### Requisitos

- Docker Desktop corriendo.

### Levantar el stack completo

```bash
docker compose up -d
```

---

## Sobre este repositorio

Este es el repositorio de trabajo del proyecto. El plan original de implementación (consigna) se conserva en [`CONSIGNA.md`](./CONSIGNA.md) como referencia.

La rama activa es `feature/backend-plataforma-academica`. `main` permanece con el commit inicial hasta que se haga el merge final.

---

## Documentación técnica

Para entender a fondo el proyecto (arquitectura, decisiones técnicas, reglas de negocio, testing y despliegue), consultar [`DOCUMENTACION.md`](./DOCUMENTACION.md).