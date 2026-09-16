# Backend — Plataforma de Gestión de Carreras Académicas

Este repositorio contiene el backend de una plataforma pensada para que una institución educativa pueda administrar sus carreras de forma ordenada, versionando los planes de estudio sin perder el historial académico de nadie.

La idea central es simple pero poderosa: cuando una institución cambia el plan de estudios de una carrera, los alumnos que ya están cursando **no** pueden quedar atrapados en un limbo administrativo. Acá eso se resuelve con **resoluciones**: cada versión de la currícula es una entidad propia, con su propio set de años y materias. Cuando llega una nueva versión, la anterior se cierra y queda como registro histórico. Los alumnos que ya estaban inscriptos siguen bajo su plan original; los nuevos ingresan con el plan nuevo.

---

## Estado actual del proyecto

El proyecto está en construcción activa. Este primer push incluye las **Fases 0, 1 y parte de la 2** del plan de implementación.

| Fase | Descripción | Estado |
|---|---|---|
| 0 | Setup inicial (Docker, Express, DB) | Completada |
| 1 | Modelo de datos (Prisma) | Completada |
| 2 | Títulos y Resoluciones | En curso |
| 3 | Materias y Correlatividades | Pendiente |
| 4 | Alumnos e Inscripciones | Pendiente |
| 5 | Cursada e Historia Académica | Pendiente |
| 6 | Certificados | Pendiente |
| 7 | Autenticación y Roles | Pendiente |
| 8 | Testing y Documentación | Pendiente |
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

Elegimos **PostgreSQL 18** en lugar de la versión 16 sugerida originalmente en el plan, por ser la versión estable más reciente al momento de arrancar. Esto implicó un ajuste en la configuración del volumen del contenedor (ver sección "Notas técnicas").

---

## Estructura del repositorio

```
ProyectoGemAdvanced/
├── prisma/
│   ├── schema.prisma              # Modelo de datos completo (10 entidades)
│   ├── seed.js                    # Script de carga de datos de prueba
│   └── migrations/                # Migraciones versionadas
├── src/
│   ├── config/
│   │   └── db.js                  # Cliente Prisma configurado
│   ├── controllers/
│   │   ├── titulo.controller.js
│   │   └── curricular.controller.js
│   ├── routes/
│   │   ├── titulo.routes.js
│   │   └── curricular.routes.js
│   ├── services/
│   │   ├── titulo.service.js      # Lógica de negocio de títulos y resoluciones
│   │   └── curricular.service.js  # Lógica de años y materias
│   └── app.js                     # Bootstrap de Express
├── docker-compose.yml             # PostgreSQL 18 en puerto 5434
├── .env.example
├── api_tests.http                 # Colección de requests para probar la API
├── package.json
└── README.md
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

Copiar el archivo de ejemplo y completar los valores:

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
- Correlativas en cascada
- 20 alumnos distribuidos en los 5 títulos
- Cursadas con estados variados
- 9 certificados de ejemplo

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

| Método | Endpoint | Qué hace |
|---|---|---|
| GET | `/health` | Verifica que el servidor y la DB estén arriba |

### Títulos

| Método | Endpoint | Qué hace |
|---|---|---|
| POST | `/api/titulos` | Crea un título y su primera resolución vigente en una sola operación |
| GET | `/api/titulos` | Lista todos los títulos con sus resoluciones |
| GET | `/api/titulos/:id` | Devuelve el detalle completo (años y materias incluidas) |
| POST | `/api/titulos/:id/resoluciones` | Crea una nueva resolución y cierra la vigente anterior |

### Currícula

| Método | Endpoint | Qué hace |
|---|---|---|
| POST | `/api/curricular/resoluciones/:resolucionId/anios` | Crea un año curricular dentro de una resolución |
| POST | `/api/curricular/anios/:anioId/materias` | Crea una materia dentro de un año |
| GET | `/api/curricular/resoluciones/:resolucionId/plan` | Devuelve el plan completo de una resolución |

En `api_tests.http` hay ejemplos listos para ejecutar desde VS Code (con la extensión REST Client).

---

## Reglas de negocio ya implementadas

Estas son las reglas del dominio que ya están funcionando en el código.

### Versionado de resoluciones

- **Un título siempre nace con una resolución vigente.** La creación del título y su primera resolución ocurren en una única transacción: si falla una, falla la otra. Nunca queda un título huérfano sin currícula.
- **Al crear una nueva resolución, la anterior se cierra automáticamente.** Se le asigna `fecha_fin_vigencia` igual a la fecha de inicio de la nueva, y su estado pasa a `CERRADA`.
- **Las resoluciones cerradas son inmutables.** No se editan ni se borran: quedan como registro histórico.
- **Los alumnos quedan atados a la resolución vigente al momento de inscribirse.** Su plan de aprobación se congela, aunque después se abran nuevas resoluciones para el mismo título. (Los endpoints de inscripción están en desarrollo, pero el modelo de datos ya lo soporta.)

### Validaciones ya activas

- No se puede crear un título con un nombre que ya existe.
- No se puede crear una resolución con un código que ya existe.
- No se puede crear un año con un número repetido dentro de la misma resolución.
- No se puede crear una materia con un código repetido dentro del mismo año.

---

## Modelo de datos

El schema completo está en `prisma/schema.prisma`. Tiene 10 entidades y 8 enums. Las decisiones de diseño más importantes:

- **`ANIO_CURRICULAR` y `MATERIA` cuelgan de `RESOLUCION`**, no de `TITULO`. Esto permite que cada versión de la currícula tenga su propio set de años y materias sin afectar a versiones anteriores.
- **`CORRELATIVIDAD` es una tabla que referencia dos veces a `MATERIA`** (`materia_id` y `materia_requerida_id`), representando el requisito de una materia sobre otra.
- **Todos los IDs son UUID**, lo que permite generar registros en distintas partes del sistema sin colisiones.
- **Los `onDelete` están pensados para preservar datos históricos:** por ejemplo, no se puede borrar un título si tiene inscripciones asociadas (RESTRICT), pero sí se puede borrar una resolución y se llevan en cascada sus años y materias.

---

## Notas técnicas

### Sobre PostgreSQL 18 en Docker

A partir de PostgreSQL 18, la imagen oficial de Docker cambió la forma en que gestiona el directorio de datos. **El volumen ya no se monta en `/var/lib/postgresql/data`** sino en `/var/lib/postgresql`. Si se usa la ruta vieja, el contenedor entra en un loop de reinicio.

El `docker-compose.yml` ya tiene esto resuelto.

### Sobre el seeder

El script `prisma/seed.js` es **idempotente**: cada vez que se ejecuta, limpia primero toda la base y después carga los datos. Esto permite iterar sobre los datos de prueba sin generar duplicados ni inconsistencias. Es seguro ejecutarlo múltiples veces.

### Sobre las transacciones

Las operaciones críticas (crear título + resolución, cerrar resolución vigente + crear nueva) usan `prisma.$transaction` para garantizar atomicidad. Si falla cualquier paso, se revierte todo.

---

## Próximos pasos

El plan de desarrollo continúa con:

1. **Fase 2 (resto):** endpoints de edición y baja lógica de títulos, años y materias. Cierre manual de resoluciones.
2. **Fase 3:** correlatividades (con validación de ciclos).
3. **Fase 4:** alumnos e inscripciones.
4. **Fase 5:** cursadas e historia académica (con validación de correlativas).
5. **Fase 6:** certificados (parciales y de título completo, con generación de PDF).
6. **Fase 7:** autenticación con JWT y control de roles.
7. **Fase 8:** tests unitarios e integración + documentación Swagger.
8. **Fase 9:** despliegue con Dockerfile para el API.

---

## Sobre este repositorio

Este es el repositorio de trabajo del proyecto. El plan original de implementación (consigna) se conserva en [`CONSIGNA.md`](./CONSIGNA.md) como referencia.