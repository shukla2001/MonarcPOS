import Joi from 'joi';

export const createCategorySchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).required().messages({
    'string.empty': 'Category name is required',
    'string.min': 'Category name must be at least 2 characters',
  }),
});

export const createItemSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).required().messages({
    'string.empty': 'Item name is required',
    'string.min': 'Item name must be at least 2 characters',
  }),
  categoryId: Joi.number().integer().positive().required().messages({
    'number.base': 'Category ID must be a number',
    'any.required': 'Category ID is required',
  }),
  price: Joi.number().precision(2).positive().required().messages({
    'number.base': 'Price must be a valid number',
    'number.positive': 'Price must be greater than 0',
    'any.required': 'Price is required',
  }),
  unit: Joi.string().trim().min(1).max(30).required().messages({
    'string.empty': 'Unit is required (e.g., scoop, piece, glass)',
  }),
  stock: Joi.number().integer().min(0).default(0).messages({
    'number.min': 'Stock cannot be negative',
  }),
});

export const updateItemSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).optional(),
  categoryId: Joi.number().integer().positive().optional(),
  price: Joi.number().precision(2).positive().optional(),
  unit: Joi.string().trim().min(1).max(30).optional(),
  stock: Joi.number().integer().min(0).optional(),
}).min(1).messages({
  'object.min': 'At least one field must be provided for update',
});

export const restockItemSchema = Joi.object({
  quantity: Joi.number().integer().positive().required().messages({
    'number.positive': 'Restock quantity must be greater than zero',
    'any.required': 'Quantity is required',
  }),
});
