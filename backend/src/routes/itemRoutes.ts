import { Router } from 'express';
import {
  getCategories,
  createCategory,
  getItems,
  getItemById,
  createItem,
  updateItem,
  restockItem,
  deleteItem,
} from '../controllers/itemController';
import { verifyToken, requireAdmin } from '../middleware/auth';
import { validateBody } from '../middleware/validator';
import {
  createCategorySchema,
  createItemSchema,
  updateItemSchema,
  restockItemSchema,
} from '../validations/item.validation';

const router = Router();

// Category routes
router.get('/categories', verifyToken, getCategories);
router.post('/categories', verifyToken, requireAdmin, validateBody(createCategorySchema), createCategory);

// Item routes
router.get('/', verifyToken, getItems);
router.get('/:id', verifyToken, getItemById);
router.post('/', verifyToken, requireAdmin, validateBody(createItemSchema), createItem);
router.put('/:id', verifyToken, requireAdmin, validateBody(updateItemSchema), updateItem);
router.patch('/:id/restock', verifyToken, requireAdmin, validateBody(restockItemSchema), restockItem);
router.delete('/:id', verifyToken, requireAdmin, deleteItem);

export default router;
