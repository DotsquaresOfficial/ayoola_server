const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const protect = require('../middleware/authMiddleware');
const validate = require('../utils/validateRequest');
const { loginValidator, resetPasswordValidator } = require('../validations/authValidation');

router.post('/login', validate(loginValidator), authController.login);
router.post('/reset-password', validate(resetPasswordValidator), authController.resetPassword);
// router.get('/dashboard-details', protect, authController.getDashboard);

module.exports = router;
