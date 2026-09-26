# Backend — Plataforma de Gestión de Carreras Académicas

Este repositorio contiene el backend de una plataforma pensada para que una institución educativa pueda administrar sus carreras de forma ordenada, versionando los planes de estudio sin perder el historial académico de nadie.

La idea central es simple pero poderosa: cuando una institución cambia el plan de estudios de una carrera, los alumnos que ya están cursando **no** pueden quedar atrapados en un limbo administrativo. Acá eso se resuelve con **resoluciones**: cada versión de la currícula es una entidad propia, con su propio set de años y materias. Cuando llega una nueva versión, la anterior se cierra y queda como registro histórico. Los alumnos que ya estaban inscriptos siguen bajo su plan original; los nuevos ingresan con el plan nuevo.

---

## Estado actual del proyecto

El proyecto está en construcción activa. Actualmente las **Fases 0 a 5** del plan están completas:

| Fase | Descripción | Estado |
|---|---|---|
| 0 | Setup inicial (Docker, Express, DB) | Completada |
| 1 | Modelo de datos (Prisma) | Completada |
| 2 | Títulos, Resoluciones, Años y Materias | Completada |
| 3 | Correlatividades | Completada |
| 4 | Alumnos, Admisión, Inscripciones, Equivalencias | Completada |
| 5 | Cursadas e Historia Académica | Completada |
| 6 | Certificados (parciales y de título completo) | En desarrollo |
| 7 | Autenticación y Roles | Pendiente |
| 8 | Testing y Documentación (Swagger) | Pendiente |
| 9 | Despliegue | Pendiente |

---

## Stack técnico

| Componente | Elección |
|---|---|
| Runtime | Node.js 20 |
| Framework web | Express 4 |
| Base de datos | PostgreSQL 18 (Docker) |
| ORM | Prisma 5 |
| Contenerización | Docker + docker-compose |
| Validación | Zod (integración en curso) |
| Generación de PDF | pdfkit (pendiente) |

Elegimos **PostgreSQL 18** en lugar de la versión 16 sugerida originalmente en el plan, por ser la versión estable más reciente al momento de arrancar. Esto implicó un ajuste en la configuración del volumen del contenedor (ver sección "Notas técnicas").

---

## Estructura del repositorio

```
ProyectoGemAdvanced/
├── prisma/
│   ├── schema.prisma              # Modelo de datos completo (12 modelos, 9 enums)
│   ├── seed.js                    # Carga de datos de prueba (5 títulos, 20 alumnos)
│   └── migrations/                # Migraciones versionadas
├── src/
│   ├── config/
│   │   └── db.js                  # Cliente Prisma
│   ├── controllers/               # Handlers HTTP (9 controllers)
│   ├── middlewares/
│   │   └── index.js               # errorHandler, validate, notFound
│   ├── routes/                    # Definición de rutas (6 routers)
│   ├── services/                  # Lógica de negocio (9 services)
│   ├── utils/
│   │   ├── errors.js              # AppError + códigos de error
│   │   └── helpers.js             # Utilidades
│   ├── validators/                # (vacío, se llena con Zod)
│   └── app.js                     # Bootstrap de Express
├── docker-compose.yml             # PostgreSQL 18 en puerto 5434
├── .env.example
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

El `.env.example` ya viene con valores por defecto funcionales para desarrollo local.

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
| POST | `/api/curricular/anios/:anioId/materias` | Crear materia |
| GET | `/api/curricular/anios/:id/materias` | Listar materias de un año |
| PUT | `/api/curricular/materias/:id` | Editar materia |
| DELETE | `/api/curricular/materias/:id` | Eliminar materia (bloquea si tiene cursadas) |

### Correlatividades

| Método | Endpoint | Descripción |
|---|---|---|
| GET | `/api/materias/:id/correlativas` | Listar correlativas de una materia |
| POST | `/api/materias/:id/correlativas` | Agregar correlativa (valida ciclos, misma resolución, no auto-correlación) |
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
| POST | `/api/alumnos/:id/examenes` | Registrar examen |
| PUT | `/api/alumnos/:id/examenes/:examenId` | Actualizar resultado |

### Inscripciones

| Método | Endpoint | Descripción |
|---|---|---|
| GET | `/api/alumnos/:id/inscripciones` | Historial de inscripciones |
| POST | `/api/alumnos/:id/inscripciones` | Inscribir a un título (valida admisión + toma resolución vigente) |
| PUT | `/api/inscripciones/:id` | Cambiar estado (ACTIVA/EGRESADO/BAJA) |
| GET | `/api/inscripciones/:id/cursadas` | Listar cursadas de una inscripción |

### Equivalencias y Cambio de Carrera

| Método | Endpoint | Descripción |
|---|---|---|
| GET | `/api/equivalencias` | Listar equivalencias |
| POST | `/api/equivalencias` | Crear equivalencia |
| DELETE | `/api/equivalencias/:id` | Eliminar equivalencia |
| GET | `/api/materias/:id/equivalencias` | Equivalencias de una materia |
| POST | `/api/alumnos/:id/cambio-carrera` | Cambiar de carrera (aplica equivalencias automáticamente) |

### Cursadas e Historia Académica

| Método | Endpoint | Descripción |
|---|---|---|
| POST | `/api/alumnos/:id/cursadas` | Registrar/actualizar estado de una materia |
| GET | `/api/alumnos/:id/historia-academica` | Recorrido académico completo con % de avance |

---

## Reglas de negocio implementadas

### Versionado de resoluciones

- **Un título siempre nace con una resolución vigente.** Transacción atómica.
- **Al crear una nueva resolución, la anterior se cierra automáticamente.**
- **Las resoluciones cerradas son inmutables.** No se editan ni se borran.
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

### Correlatividades

- **No auto-correlación:** una materia no puede ser correlativa de sí misma.
- **Misma resolución:** ambas materias deben pertenecer a la misma resolución.
- **Sin ciclos:** si A→B existe, no se puede crear B→A.
- **Sin duplicados:** la misma combinación no se puede repetir.
- **Validación al registrar cursadas:**
  - `PARA_CURSAR` → la correlativa debe estar `REGULAR` o `APROBADA`.
  - `PARA_RENDIR_FINAL` → la correlativa debe estar `APROBADA`.

### Admisión de alumnos

| Caso | Requisitos | Puede inscribirse |
|---|---|---|
| Menor de 25 con secundario completo | Partida + Analítico completo | Sí |
| Mayor de 25 con secundario completo | Partida + Analítico completo | Sí |
| Mayor de 25 sin secundario completo + examen aprobado | Partida + Analítico incompleto + Cert. 7º + Examen APROBADO | Sí |
| Mayor de 25 sin secundario completo sin examen | Falta examen aprobado | No |

### Inscripciones

- **Validación de admisión previa.** El alumno debe cumplir los requisitos.
- **Resolución vigente automática.** El cliente NO manda la resolución.
- **Sin duplicados.** No se puede inscribir dos veces al mismo título con la misma resolución.
- **Cambio de carrera:** se puede tener múltiples inscripciones al mismo título si son con resoluciones distintas.

### Máquina de estados de cursada

```
EN_CURSO ------> REGULAR ------> APROBADA (final)
    |                |
    +--> LIBRE       +--> DESAPROBADA
    |
    +--> DESAPROBADA

LIBRE / DESAPROBADA ------> EN_CURSO (recursada)
```

### Equivalencias y cambio de carrera

- **Solo se transfieren materias APROBADA.** Las regulares no.
- **Solo si hay una equivalencia definida** entre la materia origen y destino.
- **Al cambiar de carrera:**
  - Se crea una nueva inscripción con `esCambioCarrera: true`.
  - Se aplican las equivalencias automáticamente (cursadas con `esEquivalencia: true`).
  - Se da de baja la inscripción origen (opcional).

---

## Modelo de datos

El schema completo está en `prisma/schema.prisma`. Tiene **12 modelos** y **9 enums**.

### Modelos

- `Titulo` — carreras ofrecidas
- `Resolucion` — versiones de la currícula
- `AnioCurricular` — años de cada resolución
- `Materia` — unidades curriculares
- `Correlatividad` — requisitos entre materias
- `Equivalencia` — pares de materias equivalentes entre carreras
- `Alumno` — estudiantes (con domicilio y documentación)
- `ExamenNivelatorio` — exámenes de admisión
- `Inscripcion` — vínculo alumno ↔ título ↔ resolución
- `CursadaMateria` — historial académico por materia
- `Certificado` — constancias emitidas

### Enums

`estado_titulo`, `estado_resolucion`, `tipo_cursada`, `tipo_correlatividad`, `estado_inscripcion`, `estado_cursada`, `tipo_certificado`, `estado_certificado`, `estado_examen`.

---

## Notas técnicas

### Sobre PostgreSQL 18 en Docker

A partir de PostgreSQL 18, la imagen oficial de Docker cambió la forma en que gestiona el directorio de datos. **El volumen ya no se monta en `/var/lib/postgresql/data`** sino en `/var/lib/postgresql`. Si se usa la ruta vieja, el contenedor entra en un loop de reinicio.

### Sobre el seeder

El script `prisma/seed.js` es **idempotente**: cada vez que se ejecuta, limpia primero toda la base y después carga los datos. Incluye 5 perfiles de alumno para probar todos los flujos de admisión.

### Sobre las transacciones

Las operaciones críticas usan `prisma.$transaction` para garantizar atomicidad:

- Crear título + resolución.
- Cerrar resolución vigente + crear nueva.
- Cambio de carrera (nueva inscripción + equivalencias + baja origen).

### Sobre el manejo de errores

Todos los errores se manejan centralizadamente con el `errorHandler`:

- `AppError` con código y status HTTP.
- Errores de Prisma (`P2002`, `P2003`, `P2025`).
- Errores de Postgres (`23001` — FK RESTRICT).
- Errores de validación de Zod.

---

## Próximos pasos

1. **Fase 6:** Certificados (parciales + título completo + PDF con pdfkit).
2. **Fase 7:** Autenticación con JWT y control de roles.
3. **Fase 8:** Tests unitarios e integración + documentación Swagger.
4. **Fase 9:** Dockerfile del API + despliegue.

---

## Sobre este repositorio

Este es el repositorio de trabajo del proyecto. El plan original de implementación (consigna) se conserva en [`CONSIGNA.md`](./CONSIGNA.md) como referencia.

La rama activa es `feature/backend-plataforma-academica`. `main` permanece con el commit inicial hasta que se haga el merge final.