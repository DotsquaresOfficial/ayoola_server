const express = require('express');
const { convertPointsToStepCoins, getStepCoinsConversionHistory } = require('../controllers/stepCoinsController');
const router = express.Router();

router.post('/convert/:user-id', convertPointsToStepCoins);
router.get('/convert-history/:user-id', getStepCoinsConversionHistory); 

module.exports = router;
