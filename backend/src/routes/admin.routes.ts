import { Router } from 'express';
import AdminController from '../controllers/AdminController';
import { authenticate, requireAdmin } from '../middleware/authMiddleware';

const router = Router();

router.use(authenticate, requireAdmin);

router.get('/stats', (req, res, next) => AdminController.stats(req, res, next));
router.get('/users', (req, res, next) => AdminController.users(req, res, next));
router.get('/items', (req, res, next) => AdminController.items(req, res, next));
router.get('/claims', (req, res, next) => AdminController.claims(req, res, next));
router.delete('/items/:id', (req, res, next) => AdminController.deleteItem(req, res, next));
router.put('/users/:id/suspend', (req, res, next) => AdminController.suspend(req, res, next));
router.put('/users/:id/reinstate', (req, res, next) => AdminController.reinstate(req, res, next));
router.put('/claims/:id/resolve', (req, res, next) => AdminController.resolve(req, res, next));

export default router;
