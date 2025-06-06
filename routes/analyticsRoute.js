const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const protect = require('../middleware/authMiddleware')

router.get('/',protect,analyticsController.getDashboardStats);

module.exports = router;
