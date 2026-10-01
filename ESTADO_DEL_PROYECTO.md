# Estado del Proyecto — Plataforma de Gestión de Carreras Académicas

**Última actualización:** 30 de septiembre de 2026
**Rama activa:** `feature/backend-plataforma-academica`
**Repositorio:** https://github.com/FrancoCalegari/ProyectoGemAdvanced

---

##  Resumen ejecutivo

Backend + frontend **funcionalmente completo** para que una institución educativa pueda administrar sus carreras, alumnos, cursadas y certificados, con **versionado estricto de la currícula** mediante resoluciones.

**El problema que resuelve:** cuando una institución cambia el plan de estudios, los alumnos que ya estaban cursando **no se rompen**. Cada versión de la currícula es una entidad propia, y los alumnos quedan "congelados" en su resolución de origen.

### Estado general

| Área | Estado |
|------|--------|
| Backend | ✅ Completo |
| Tests backend | ✅ 22/22 pasando |
| Frontend | ✅ Completo |
| Build frontend | ✅ Limpio |
| Docker | ✅ Producción |
| CI/CD | ✅ GitHub Actions |
| Documentación | ✅ Completa |

**Stack:** Node 20 + Express 4 + PostgreSQL 18 (Docker) + Prisma 5 + React 19 + Vite + Tailwind + JWT + bcrypt + pdfkit.

---

##  Lo que se logró (todo funcionando)

###  Backend — 16 servicios

| Módulo | Descripción | Estado |
|--------|-------------|--------|
| **Auth** | JWT + bcrypt + 3 roles (ADMIN, SECRETARIA, ALUMNO) | ✅ |
| **Títulos** | CRUD + baja lógica | ✅ |
| **Resoluciones** | Versionado con cierre automático de la anterior | ✅ |
| **Currícula** | Años curriculares + materias | ✅ |
| **Correlatividades** | Con detección de ciclos por BFS | ✅ |
| **Alumnos** | CRUD + edad calculada | ✅ |
| **Admisión** | 4 casos según edad y documentación | ✅ |
| **Inscripciones** | Validación de admisión + resolución vigente | ✅ |
| **Equivalencias** | Pares de materias entre carreras | ✅ |
| **Cambio de carrera** | Transacción atómica + equivalencias aplicadas | ✅ |
| **Cursadas** | Máquina de estados con validación de correlativas | ✅ |
| **Asistencia** | PRESENTE / AUSENTE / JUSTIFICADO | ✅ |
| **Certificados** | **6 tipos** con PDF diferenciado | ✅ |
| **Certificados presentados** | Justificar ausencia (médico, laboral, etc.) | ✅ |
| **Mesas de examen** | Reglas 72hs/48hs | ✅ |
| **Usuarios** | Vinculados opcionalmente a un alumno | ✅ |

###  Frontend — 15 páginas

#### Para ADMIN / SECRETARIA (11)
| Página | Característica |
|--------|----------------|
| Login | Responsive + tildes correctas |
| Dashboard | Panel de bienvenida |
| Títulos | CRUD + modales |
| **Alumnos** | **Navegación jerárquica** (Carrera → Resolución → Año → Alumnos) |
| **Cursadas** | Jerárquico + panel de stats + alertas |
| **Asistencia** | Jerárquico + alertas de faltas |
| **Mesas de Examen** | Desplegables cascada (Título → Resolución → Materia → Aula) |
| **Certificados** | Jerárquico + emisión + anulación + PDF |
| **Certificados Presentados** | Jerárquico + aprobar/rechazar |
| Usuarios | CRUD + rol en español |

#### Para ALUMNO (4)
|      Página         |          Característica             |
|---------------------|-------------------------------------|
| Mi Historia         | Recorrido académico con % de avance |
| Mis Certificados    | Solicitar + descargar PDF           |
| Mis Mesas           | Inscribirse + resumen por materia   |
| Justificar Ausencia | Cargar certificados                 |

###  Certificados — 6 tipos diferenciados

|      Tipo           |                  Regla                   |                  PDF                  |
|---------------------|------------------------------------------|-----                                  |
| **PARCIAL_ANIO**    | 100% materias del año APROBADAS          | Lista de materias + año               |
| **TITULO_COMPLETO** | 100% materias de la resolución APROBADAS | Lista completa                        |
| **CONCURRENCIA**    | Rango de fechas + 75% asistencia         | Tabla fecha/materia/estado + resumen  |
| **PARA_COLECTIVO**  | Alumno regular (sin rango)               | Carrera + resolución + avance         |
| **LABORAL**         | Fecha de hoy + carrera                   | Frase "se presentó a cursar {carrera}"|
| **PARA_RENDIR**     | Bloquea si dejó pasar mesa               | Lista de materias regulares           |

###  Frontend — Detalles técnicos

- **Responsive:** mobile, tablet, desktop (Tailwind con `sm:`, `md:`, `lg:`)
- **Tildes:** 100% UTF-8 en todo el código
- **Modal responsive:** fullscreen en mobile, centered en desktop
- **Sidebar mobile:** overlay con hamburguesa
- **Toast notifications:** con `sonner`
- **Navegación jerárquica:** con breadcrumb consistente en 4 páginas
- **Buscador global:** por nombre, DNI o email
- **Descarga PDF:** vía `responseType: 'blob'`

###  DevOps

- **Dockerfile multi-stage:** deps → build → runtime
- **Usuario no-root:** `appuser`
- **HEALTHCHECK** integrado
- **docker-compose.yml:** solo `api` (la DB es external)
- **GitHub Actions:** corre tests + build en cada push
- **Imagen productiva:** ~150 MB

###  Reglas de negocio clave

|         Regla           |                     Descripción                              |
|-------------------------|--------------------------------------------------------------|
| **Versionado**          | Cerrar resolución vigente → crear nueva (automático)         |
| **Correlativas**        | PARA_CURSAR (regular) / PARA_RENDIR_FINAL (aprobada)         |
| **Máquina de estados**  | EN_CURSO → REGULAR → APROBADA (con transiciones controladas) |
| **Admisión**            | Partida + analítico (o examen si >25 sin secundario)         |
| **Equivalencias**       | Solo materias APROBADAS + con equivalencia definida          |
| **Mesas**               | Inscripción 72hs antes / cancelación 48hs antes              |
| **DEJO_PASAR_MESA**     | Si faltó sin cancelar → no se emite PARA_RENDIR              |
| **Alertas faltas**      | 5 días consecutivos sin justificar → alerta roja             |
| **Asistencia efectiva** | PRESENTE + JUSTIFICADO (para %)                              |
| **Certificados**        | CONCURRENCIA 75% / COLECTIVO 70% / LABORAL 60%               |

---

##  Lo que falta

###  Pendiente (opcional, no crítico)

| Ítem                     | Prioridad |            Descripción                   |
|--------------------------|-----------|------------------------------------------|
| **Doc final**            | Baja      | Este documento (listo cuando lo guardes) |
| **Tests frontend**       | Media     | Vitest + React Testing Library           |
| **Tests de integración** | Media     | Supertest end-to-end                     |
| **Rate limiting**        | Media     | En `/api/auth/login`                     |
| **Refresh tokens**       | Baja      | Para JWT más seguros                     |
| **Reportes**             | Baja      | Estadísticas por cohorte                 |
| **Firma digital PDF**    | Baja      | Certificados firmados                    |
| **Notificaciones**       | Baja      | Email cuando se emite certificado        |

###  Bugs conocidos

**Ninguno.** Todo funciona.

---

##  5 Mejoras a futuro (con detalle)

### 1. **Tests de integración con Supertest**
**Por qué:** hoy los 22 tests son unitarios (services con DB real). Falta probar los endpoints HTTP completos.

**Qué haría:**
- Suite `tests/integration/` con Supertest
- Levantar `app.js` en cada suite
- Probar flujos completos: login → crear título → inscribir alumno → emitir certificado
- Verificar headers HTTP, CORS, encoding UTF-8
- Coverage objetivo: 70%+

**Impacto:** atraparía regresiones en routes/controllers (hoy no cubiertos).

---

### 2. **Refresh tokens + rate limiting**
**Por qué:** hoy el JWT dura 8hs y no hay límite de intentos de login.

**Qué haría:**
- Modelo `RefreshToken` en Prisma (con `expiresAt` + `revoked`)
- Endpoint `POST /api/auth/refresh` (rota el access token)
- Access token dura **15 min**, refresh dura 7 días
- `express-rate-limit` en `/api/auth/login`: 5 intentos por IP cada 15 min
- Middleware que detecta tokens comprometidos (rota + revoca todos)

**Impacto:** seguridad mucho más profesional.

---

### 3. **Reportes y estadísticas**
**Por qué:** hoy no hay visibilidad agregada (solo listas y paneles individuales).

**Qué haría:**
- Endpoint `/api/reportes/cohorte/:resolucionId` → alumnos por año, avance promedio, tasa de aprobación
- Endpoint `/api/reportes/materia/:materiaId` → aprobados, regulares, libres, promedio de notas
- Endpoint `/api/reportes/asistencia/:resolucionId` → % asistencia promedio por materia
- Frontend: página **Reportes** con gráficos (recharts o chart.js)
- Exportable a Excel/CSV

**Impacto:** la secretaría y dirección pueden tomar decisiones con datos.

---

### 4. **Firma digital de certificados**
**Por qué:** hoy el PDF tiene espacio para "firma y sello" pero es solo un espacio en blanco.

**Qué haría:**
- Generar par de claves RSA por institución (`public.key` + `private.key`)
- Firmar el hash SHA-256 del PDF con la clave privada
- Embeber el QR en el PDF (apunta a `/api/certificados/:id/verificar`)
- Endpoint `GET /api/certificados/:id/verificar` → devuelve si la firma es válida
- Frontend: al abrir el certificado → verificar automáticamente

**Impacto:** certificados **legalmente válidos** sin depender de papel.

---

### 5. **Notificaciones por email**
**Por qué:** hoy los alumnos no se enteran cuando:
- Se habilita una mesa
- Se emite un certificado
- Se aprueba su justificación de ausencia
- Su inscripción fue aprobada

**Qué haría:**
- Instalar `nodemailer`
- Configurar SMTP (Gmail, SendGrid, AWS SES)
- Templates HTML con `handlebars` o `mjml`
- Cola de envío con `bullmq` + Redis (para no bloquear el request)
- Tipos de email:
  - Bienvenida al inscribirse
  - Nueva mesa disponible
  - Certificado emitido (con PDF adjunto)
  - Certificado presentado aprobado/rechazado
  - Alerta de faltas consecutivas (a la secretaría)

**Impacto:** reduce la carga administrativa y mejora la comunicación.

---

##  Estructura del proyecto

```
ProyectoGemAdvanced/
├── prisma/
│   ├── schema.prisma              # 16 modelos / 15 enums
│   ├── seed.js                    # Seeder completo
│   ├── schema.prisma.backup       # Backups previos
│   ├── schema.prisma.backup-b1
│   ├── schema.prisma.backup-b2
│   └── migrations/                # 8 migraciones
├── src/                           # Backend
│   ├── config/
│   │   ├── db.js
│   │   └── swagger.js
│   ├── controllers/               # 16 controllers
│   ├── middlewares/
│   │   ├── index.js               # errorHandler, validate, notFound
│   │   └── auth.js                # requireAuth, requireRole
│   ├── routes/                    # 12 routers
│   ├── services/                  # 16 services
│   ├── utils/
│   │   ├── errors.js
│   │   ├── helpers.js
│   │   └── pdf.js                 # 6 templates por tipo
│   └── app.js                     # Bootstrap Express
├── tests/unit/                    # 4 suites / 22 tests
├── frontend/                      # React + Vite + Tailwind
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/            # Layout, Sidebar
│   │   │   └── ui/                # Button, Input, Card, Modal, Table, Badge
│   │   ├── contexts/
│   │   │   └── AuthContext.jsx
│   │   ├── pages/                 # 15 páginas
│   │   ├── services/              # 11 services
│   │   └── App.jsx
│   └── package.json
├── docker/
│   └── Dockerfile                 # multi-stage productivo
├── .github/
│   └── workflows/
│       └── ci.yml                 # CI: tests + build
├── backups/
│   └── backup_2026-09-29_2336/    # Backup completo
├── docker-compose.yml             # solo api (DB external)
├── ESTADO_DEL_PROYECTO.md         # este archivo
├── DOCUMENTACION.md               # doc técnica completa
├── README.md
└── CONSIGNA.md
```

---

##  Credenciales del seeder

|    Rol      |          Email                 | Password        |
|-------------|--------------------------------|-----------------|
| ADMIN       | `admin@plataforma.edu.ar`      | `admin123`      |
| SECRETARIA  | `secretaria@plataforma.edu.ar` | `secretaria123` |
| ALUMNO      | `alumno0@plataforma.edu.ar`    | `alumno123`     |

**Datos cargados por el seeder:**
- 5 títulos terciarios
- 5 resoluciones vigentes
- 15 años curriculares (3 por título)
- 150 materias
- ~2000 correlatividades
- 20 alumnos con documentación y domicilio
- 22 usuarios
- Inscripciones, cursadas, certificados, equivalencias

---

##  Cómo levantar el proyecto

### Requisitos
- Docker Desktop corriendo
- Node.js 20+

### Arrancar todo (2 terminales)

**Terminal A — Backend (Docker):**
```powershell
$base = "C:\Users\mariano mattacini\Desktop\ProyectoGemAdvanced"
Set-Location $base
docker compose up -d api

# Verificar
Invoke-RestMethod "http://localhost:3000/health"
# Esperado: {"status":"ok","database":"connected"}
```

**Terminal B — Frontend (Vite):**
```powershell
$base = "C:\Users\mariano mattacini\Desktop\ProyectoGemAdvanced\frontend"
Set-Location $base
npm run dev
# → http://localhost:5173
```

### Probar la API
- **Swagger UI:** http://localhost:3000/api-docs
- **Healthcheck:** http://localhost:3000/health

### Comandos útiles
```powershell
# Correr tests
Set-Location "C:\Users\mariano mattacini\Desktop\ProyectoGemAdvanced"
npm test

# Aplicar cambios al schema
npx prisma migrate dev --name nombre_migracion
npx prisma generate
docker compose build api
docker compose up -d api

# Ver logs del backend
docker logs plataforma-academica-api -f --tail 50

# Rebuild del api
docker compose build api && docker compose up -d api
```

---

##  Estadísticas del proyecto

| Métrica                 | Valor                       |
|-------------------------|-----------------------------|
| Modelos Prisma          |            16               |
| Enums Prisma            |            15               |
| Migraciones             |             8               |
| Endpoints REST          |           ~60               |
| Controllers             |            16               |
| Services (backend)      |            16               |
| Routers                 |            12               |
| Páginas React           |            15               |
| Services (frontend)     |            11               |
| Tests unitarios         |    22 (todos pasando)       |
| Tamaño frontend build   | ~500 KB (gzip: ~138 KB)     |
| Imagen Docker           |         ~150 MB             |
| Cobertura de tests      | Parcial (services críticos) |

---


##  Estado final

**El proyecto está funcionalmente completo.** Cubre todos los requisitos de la consigna original:

- ✅ Administración de títulos, resoluciones, años y materias
- ✅ Versionado estricto de la currícula (sin perder historial)
- ✅ Correlatividades con detección de ciclos
- ✅ Admisión de alumnos con documentación
- ✅ Inscripciones y equivalencias
- ✅ Cursadas con máquina de estados
- ✅ Asistencia
- ✅ Certificados (6 tipos con PDF)
- ✅ Mesas de examen
- ✅ Justificación de ausencias
- ✅ Auth + roles
- ✅ Testing
- ✅ Swagger
- ✅ Docker + CI



---

**Fin del documento.**