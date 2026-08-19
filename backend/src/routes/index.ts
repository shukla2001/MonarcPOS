import { Router } from 'express';
import authRoutes from './authRoutes';
import itemRoutes from './itemRoutes';
import orderRoutes from './orderRoutes';
import workerRoutes from './workerRoutes';
import reportRoutes from './reportRoutes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/items', itemRoutes);
router.use('/orders', orderRoutes);
router.use('/workers', workerRoutes);
router.use('/reports', reportRoutes);

// Health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    brand: 'Monarc Ice Creams',
    service: 'POS Kiosk & Enterprise Management API',
  });
});

export default router;
