import { Router } from 'express';
import AuthController from '../controllers/AuthController';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();

router.post('/register', (req, res, next) => AuthController.register(req, res, next));
router.post('/login', (req, res, next) => AuthController.login(req, res, next));
router.get('/me', authenticate, (req, res) => AuthController.me(req, res));

export default router;
