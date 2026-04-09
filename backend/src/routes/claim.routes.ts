import { Router } from 'express';
import ClaimController from '../controllers/ClaimController';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();

router.use(authenticate);

router.post('/', (req, res, next) => ClaimController.submit(req, res, next));
router.put('/:id/accept', (req, res, next) => ClaimController.accept(req, res, next));
router.put('/:id/reject', (req, res, next) => ClaimController.reject(req, res, next));
router.get('/item/:itemId', (req, res, next) => ClaimController.byItem(req, res, next));
router.get('/my-claims', (req, res, next) => ClaimController.mySubmitted(req, res, next));
router.get('/my-inbox', (req, res, next) => ClaimController.myInbox(req, res, next));
router.get('/notifications', (req, res, next) => ClaimController.notifications(req, res, next));

export default router;
