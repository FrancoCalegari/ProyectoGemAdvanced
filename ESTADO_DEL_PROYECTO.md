# Estado del Proyecto - Plataforma de Gestión de Carreras Academicas

**Última actualización:** 2026-10-06
**Rama:** feature/backend-plataforma-academica

---

## Resumen ejecutivo

Backend + Frontend completos. Todas las funcionalidades del plan original (**Fases 0 a 9**) y los **módulos nuevos (M1-M11)**, con los **seis roles** del sistema.

- **Backend:** 25 controllers, 25 services y 23 routers, con 136 endpoints documentados.
- **Frontend:** 27 pantallas (React + Vite + Tailwind) con panel por rol, estadísticas y exportación PDF/CSV.

---

## Fases del plan original

| Fase | Descripción | Estado |
|------|-------------|--------|
| 0 | Setup inicial | Completada |
| 1 | Modelo de datos (Prisma) | Completada |
| 2 | Títulos, Resoluciones, Años y Materias | Completada |
| 3 | Correlatividades | Completada |
| 4 | Alumnos, Admision, Inscripciones | Completada |
| 5 | Cursadas e Historia Academica | Completada |
| 6 | Certificados | Completada |
| 7 | Autenticacion y Roles | Completada |
| 8 | Testing y Documentacion | Completada |
| 9 | Despliegue (Dockerfile + docker-compose) | Completada |

## Módulos nuevos (M1-M11)

| Etapa | Descripción | Estado |
|-------|-------------|--------|
| M1 | Schema Profesor/Licencia/Solicitud | Completada |
| M2 | Backend Profesores | Completada |
| M2.5 | Auth + permisos por rol | Completada |
| M3 | Backend Licencias | Completada |
| M3.5 | Clases Suspendidas + Reasignacion | Completada |
| M4 | Backend Solicitudes | Completada |
| M5 | Examen nivelatorio | Completada |
| M6 | Mesa Ingreso Art. N X | Completada |
| M7 | Frontend Profesores | Completada |
| M7.5 | Historial Alumnos + baja logica | Completada |
| M8 | Panel Personal | Completada |
| M9 | Estadísticas con Recharts | Completada |
| M9.5 | Reporte cientifico + PDF/CSV | Completada |
| M10 | Dashboard completo | Completada |
| M11 | Backup + doc + commit | Completada |

---

## Credenciales del seeder

- ADMIN: admin@plataforma.edu.ar / admin123
- SECRETARIA: secretaria@plataforma.edu.ar / secretaria123
- PROFESOR (x8): roberto.fernandez@plataforma.edu.ar / profesor123
- ALUMNO (x20): alumno0@plataforma.edu.ar ... alumno19@plataforma.edu.ar / alumno123
- BEDEL: bedel@plataforma.edu.ar / bedel123
- CELADOR: celador@plataforma.edu.ar / celador123

## Roles

`ADMIN`, `SECRETARIA`, `ALUMNO`, `PROFESOR`, `BEDEL`, `CELADOR`.

- **BEDEL** (personal no docente operativo): consulta alumnos, carreras, materias, mesas y
  documentación presentada, y puede registrar asistencia y cargar justificaciones. No accede a
  usuarios, docentes, licencias, pedidos, estadísticas ni al dashboard administrativo.
  Además tiene su propio panel de horarios (`/mis-horarios`).

- **CELADOR** (autoservicio, sin ninguna función administrativa): sólo accede a su panel
  personal — sus datos, sus horarios de trabajo con sus modificaciones (y el aviso de novedades
  sin ver) y la presentación de certificados de salud / justificativos de faltas. El bloqueo es
  default-deny en el backend (`bloqueoCelador`) y se refuerza en el frontend
  (`LayoutProtegido`).

La gestión del personal no docente (fichas, cargos, sectores, horarios y sus modificaciones,
aprobación de justificativos) está en la sección **Personal no docente** (`/empleados`),
visible para ADMIN y SECRETARIA.

## Frontend Activo

El frontend React está activo, con diseño renovado: se levanta con `cd frontend && npm run dev`
en el puerto 5173. No hay pantalla de "Sistema en construcción" ni archivos `.funcional`.

Para una base que ya tiene datos, después de `npx prisma migrate deploy` se pueden crear las
fichas y los usuarios no docentes de prueba (y vincular las cuentas que ya existían) con:

```powershell
node prisma/seed_roles_nodocentes.js
```
