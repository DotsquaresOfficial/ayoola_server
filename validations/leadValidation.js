// validations/leadValidation.js
const Joi = require('joi');

exports.contactUsValidator = Joi.object({
    fullName: Joi.string().required().messages({
      'any.required': 'Full Name is required',
      'string.empty': 'Full Name cannot be empty',
    }),
    email: Joi.string().email().required().messages({
      'any.required': 'Email is required',
      'string.email': 'Email must be valid',
      'string.empty': 'Email cannot be empty',
    }),
    companyName: Joi.string().required().messages({
      'any.required': 'Company Name is required',
      'string.empty': 'Company Name cannot be empty',
    }),
    serviceInterestedIn: Joi.string().required().messages({
      'any.required': 'Service Interested In is required',
      'string.empty': 'Service Interested In cannot be empty',
    }),
    message: Joi.string().required().messages({
      'any.required': 'Message is required',
      'string.empty': 'Message cannot be empty',
    }),
  });
