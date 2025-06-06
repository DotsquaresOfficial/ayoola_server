const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const protect = require('../middleware/authMiddleware')

router.post('/',protect,analyticsController.getDashboardStats);

module.exports = router;
