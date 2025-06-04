// validators/blogValidator.js
const Joi = require('joi');

const blogValidator = Joi.object({
  featuredImageUrl: Joi.string().uri().required(),
  title: Joi.string().min(5).max(200).required(),
  description: Joi.string().min(10).max(500).required(),
  categories: Joi.array().items(Joi.string()).required(),
  technologies: Joi.array().items(Joi.string()).required(),
  publicationDate: Joi.date().required(),
  readTime: Joi.number().integer().min(1).max(100).required(),
  writerAvatarUrl: Joi.string().uri().required(),
  writerName: Joi.string().min(3).max(100).required(),
  writerLinkedinUrl: Joi.string().uri().required(),
  bodyContent: Joi.string().required(),
  views: Joi.number().integer().min(0).optional(),
  likes: Joi.number().integer().min(0).optional(),
  shares: Joi.number().integer().min(0).optional()
});

module.exports = blogValidator;
