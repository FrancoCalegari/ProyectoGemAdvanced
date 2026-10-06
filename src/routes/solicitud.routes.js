import { Router } from 'express';
import { SolicitudController } from '../controllers/solicitud.controller.js';
import { requireAuth, requireRole, requireSelfOrRole } from '../middlewares/auth.js';

const router = Router();
router.use(requireAuth);

// /me PRIMERO para que no lo capture /:id
router.get('/me', requireRole(['ALUMNO', 'PROFESOR']), SolicitudController.misSolicitudes);

// Listado general (ADMIN, SECRETARIA)
router.get('/', requireRole(['ADMIN', 'SECRETARIA']), SolicitudController.listar);

// Crear (ALUMNO, PROFESOR, ADMIN)
router.post('/', requireRole(['ADMIN', 'ALUMNO', 'PROFESOR']), SolicitudController.crear);

// Por alumno / profesor (con self-or-role)
router.get('/alumno/:alumnoId',
  requireSelfOrRole(['ADMIN', 'SECRETARIA'], 'alumnoId'),
  SolicitudController.listarPorAlumno
);
router.get('/profesor/:profesorId',
  requireSelfOrRole(['ADMIN', 'SECRETARIA'], 'profesorId'),
  SolicitudController.listarPorProfesor
);

// Detalle (ADMIN, SECRETARIA, ALUMNO, PROFESOR — el service debe validar dueño si querés)
router.get('/:id',
  requireRole(['ADMIN', 'SECRETARIA', 'ALUMNO', 'PROFESOR']),
  SolicitudController.obtenerPorId
);

// Editar / eliminar (dueño o ADMIN — la validación de dueño es simple: PENDIENTE + rol)
router.put('/:id',
  requireRole(['ADMIN', 'ALUMNO', 'PROFESOR']),
  SolicitudController.actualizar
);
router.delete('/:id',
  requireRole(['ADMIN', 'ALUMNO', 'PROFESOR']),
  SolicitudController.eliminar
);

// Aprobación / rechazo
router.patch('/:id/aprobar', requireRole(['ADMIN', 'SECRETARIA']), SolicitudController.aprobar);
router.patch('/:id/rechazar', requireRole(['ADMIN', 'SECRETARIA']), SolicitudController.rechazar);

export default router;