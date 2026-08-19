import { Router } from 'express';
import { login, getMe } from '../controllers/authController';
import { verifyToken } from '../middleware/auth';
import { validateBody } from '../middleware/validator';
import { loginSchema } from '../validations/auth.validation';

const router = Router();

router.post('/login', validateBody(loginSchema), login);
router.get('/me', verifyToken, getMe);

export default router;
