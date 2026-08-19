import Joi from 'joi';

export const createOrderSchema = Joi.object({
  items: Joi.array()
    .items(
      Joi.object({
        itemId: Joi.number().integer().positive().required().messages({
          'number.base': 'Item ID must be a number',
          'any.required': 'Item ID is required',
        }),
        quantity: Joi.number().integer().min(1).required().messages({
          'number.min': 'Quantity must be at least 1',
          'any.required': 'Quantity is required',
        }),
      })
    )
    .min(1)
    .required()
    .messages({
      'array.min': 'Order must contain at least one item',
      'any.required': 'Items array is required',
    }),
  paymentMode: Joi.string()
    .valid('CASH', 'UPI', 'CARD')
    .required()
    .messages({
      'any.only': 'Payment mode must be CASH, UPI, or CARD',
      'any.required': 'Payment mode is required',
    }),
});

export const reportQuerySchema = Joi.object({
  period: Joi.string().valid('daily', 'monthly', 'yearly').default('monthly'),
  year: Joi.number().integer().min(2000).max(2100).optional(),
  month: Joi.number().integer().min(1).max(12).optional(),
  date: Joi.string().isoDate().optional(),
});
