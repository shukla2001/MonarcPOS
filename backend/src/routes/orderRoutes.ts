import { Router } from 'express';
import { createOrder, getOrders, getOrderById } from '../controllers/orderController';
import { verifyToken } from '../middleware/auth';
import { validateBody } from '../middleware/validator';
import { createOrderSchema } from '../validations/order.validation';

const router = Router();

router.post('/', verifyToken, validateBody(createOrderSchema), createOrder);
router.get('/', verifyToken, getOrders);
router.get('/:id', verifyToken, getOrderById);

export default router;
