import Joi from 'joi';

export const createWorkerSchema = Joi.object({
  username: Joi.string().trim().min(3).max(50).required().messages({
    'string.empty': 'Username is required',
    'string.min': 'Username must be at least 3 characters',
  }),
  password: Joi.string().min(6).required().messages({
    'string.empty': 'Password is required',
    'string.min': 'Password must be at least 6 characters',
  }),
  name: Joi.string().trim().min(2).max(100).required().messages({
    'string.empty': 'Staff name is required',
  }),
  role: Joi.string().valid('ADMIN', 'WORKER').default('WORKER').messages({
    'any.only': 'Role must be ADMIN or WORKER',
  }),
});

export const updateWorkerSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).optional(),
  role: Joi.string().valid('ADMIN', 'WORKER').optional(),
  isActive: Joi.boolean().optional(),
  password: Joi.string().min(6).optional(),
}).min(1).messages({
  'object.min': 'At least one field must be provided for update',
});
