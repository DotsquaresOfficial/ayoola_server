const express = require('express');
const { addPoints, getPointsHistory } = require('../controllers/pointsController');
const router = express.Router();

router.post('/add', addPoints);
router.get('/history/:userId', getPointsHistory); 

module.exports = router;
