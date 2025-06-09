const express = require('express');
const { addPoints, getPointsHistory } = require('../controllers/pointsController');
const router = express.Router();

router.get('/add', addPoints);
router.patch('/history/:userId', getPointsHistory); 

module.exports = router;
