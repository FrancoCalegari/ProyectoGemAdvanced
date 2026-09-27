import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller.js';
import { requireAuth, requireRole } from '../middlewares/auth.js';

const router = Router();

router.post('/login', AuthController.login);
router.post('/register', requireAuth, requireRole(['ADMIN']), AuthController.registrar);
router.get('/me', requireAuth, AuthController.me);

export default router;