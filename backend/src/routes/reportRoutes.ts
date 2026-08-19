import { Router } from 'express';
import { getSalesReport } from '../controllers/reportController';
import { verifyToken, requireAdmin } from '../middleware/auth';
import { validateQuery } from '../middleware/validator';
import { reportQuerySchema } from '../validations/order.validation';

const router = Router();

// All analytics and sales reports require ADMIN role
router.use(verifyToken, requireAdmin);

router.get('/sales', validateQuery(reportQuerySchema), getSalesReport);

export default router;
