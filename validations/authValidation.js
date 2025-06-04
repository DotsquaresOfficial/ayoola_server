const Joi = require('joi');

const registerSchema = Joi.object({
  id: Joi.string().required().label('ID'),
  name: Joi.string().min(2).max(50).required().label('Name'),
  email: Joi.string().email().required().label('Email'),
  phone: Joi.string()
    .pattern(/^[0-9]{10}$/)
    .message('Phone must be a 10-digit number')
    .optional()
    .label('Phone'),
  password: Joi.string().min(6).max(30).optional().label('Password'),
  role: Joi.string().valid('user', 'admin').optional().label('Role'),
});

module.exports = {
  registerSchema,
};
