const Joi = require('joi');

exports.loginValidator = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
});

exports.resetPasswordValidator = Joi.object({
    email: Joi.string().email().required(),
    newPassword: Joi.string().min(6).required(),
});
