import { Router } from 'express';
import {
  getWorkers,
  createWorker,
  updateWorker,
  toggleWorkerStatus,
} from '../controllers/workerController';
import { verifyToken, requireAdmin } from '../middleware/auth';
import { validateBody } from '../middleware/validator';
import { createWorkerSchema, updateWorkerSchema } from '../validations/worker.validation';

const router = Router();

// All worker management routes require ADMIN role
router.use(verifyToken, requireAdmin);

router.get('/', getWorkers);
router.post('/', validateBody(createWorkerSchema), createWorker);
router.put('/:id', validateBody(updateWorkerSchema), updateWorker);
router.patch('/:id/toggle', toggleWorkerStatus);

export default router;
